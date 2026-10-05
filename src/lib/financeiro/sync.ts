import { createAdminClient } from "@/lib/supabase/admin"

type Plataforma = "kiwify" | "hotmart"
type StatusVenda = "aprovada" | "reembolsada" | "chargeback"

export type VendaRow = {
  plataforma: Plataforma
  external_id: string
  produto: string | null
  data_venda: string
  data_aprovacao: string | null
  bruto: number
  taxa: number
  liquido: number
  status: StatusVenda
  data_status: string | null
  liberacao: string | null
  payment_method: string | null
  utm_campaign: string | null
  atualizado_em: string
}

const DAY = 86_400_000
const round2 = (n: number) => Math.round(n * 100) / 100
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function windows(desde: Date, janelaDias: number) {
  const out: { start: Date; end: Date }[] = []
  const fim = new Date()
  for (let s = desde.getTime(); s < fim.getTime(); s += janelaDias * DAY) {
    out.push({ start: new Date(s), end: new Date(Math.min(s + janelaDias * DAY - 1, fim.getTime())) })
  }
  return out
}

async function upsertVendas(rows: VendaRow[]) {
  const admin = createAdminClient()
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await admin
      .from("financeiro_vendas")
      .upsert(rows.slice(i, i + 500), { onConflict: "plataforma,external_id" })
    if (error) throw new Error(`financeiro_vendas: ${error.message}`)
  }
}

async function existentes(plataforma: Plataforma, ids: string[]) {
  const admin = createAdminClient()
  const map = new Map<string, { status: string; data_status: string | null }>()
  for (let i = 0; i < ids.length; i += 200) {
    const { data } = await admin
      .from("financeiro_vendas")
      .select("external_id, status, data_status")
      .eq("plataforma", plataforma)
      .in("external_id", ids.slice(i, i + 200))
    data?.forEach((r) => map.set(r.external_id, { status: r.status, data_status: r.data_status }))
  }
  return map
}

/* ---------------- Kiwify ---------------- */

const KIWIFY = "https://public-api.kiwify.com/v1"

async function kiwifyAuth() {
  const res = await fetch(`${KIWIFY}/oauth/token`, {
    method: "POST",
    body: new URLSearchParams({
      client_id: process.env.KIWIFY_CLIENT_ID!.trim(),
      client_secret: process.env.KIWIFY_CLIENT_SECRET!.trim(),
    }),
  })
  if (!res.ok) throw new Error(`Kiwify oauth ${res.status}`)
  const { access_token } = await res.json()
  return {
    Authorization: `Bearer ${access_token}`,
    "x-kiwify-account-id": process.env.KIWIFY_ACCOUNT_ID!.trim(),
  }
}

const KIWIFY_STATUS: Record<string, StatusVenda> = {
  paid: "aprovada",
  refunded: "reembolsada",
  chargedback: "chargeback",
  chargeback: "chargeback",
}


async function kiwifySale(id: string, h: Record<string, string>) {
  for (let tentativa = 0; tentativa < 6; tentativa++) {
    const res = await fetch(`${KIWIFY}/sales/${id}`, { headers: h })
    if (res.ok) return res.json()
    if (res.status === 429) { await sleep(10_000 * (tentativa + 1)); continue }
    throw new Error(`Kiwify sale ${id} ${res.status}`)
  }
  throw new Error(`Kiwify sale ${id}: limite de requisições`)
}

type KiwifySale = { id: string; created_at: string; status: string }

export async function syncKiwify(desde: Date) {
  const h = await kiwifyAuth()
  const lista: KiwifySale[] = []

  for (const w of windows(desde, 30)) {
    for (let page = 1; ; page++) {
      const q = new URLSearchParams({
        start_date: w.start.toISOString().slice(0, 10),
        end_date: w.end.toISOString().slice(0, 10),
        page_size: "100",
        page_number: String(page),
      })
      const res = await fetch(`${KIWIFY}/sales?${q}`, { headers: h })
      if (!res.ok) throw new Error(`Kiwify sales ${res.status}`)
      const j = await res.json()
      lista.push(...(j.data ?? []))
      if (page * 100 >= (j.pagination?.count ?? 0)) break
    }
  }

  const validas = lista.filter((s) => KIWIFY_STATUS[s.status])
  const antigos = await existentes("kiwify", validas.map((s) => s.id))
  // só busca o detalhe (que traz bruto, taxa e data do reembolso) do que é novo ou mudou de status
  const precisa = validas.filter((s) => antigos.get(s.id)?.status !== KIWIFY_STATUS[s.status])

  const rows: VendaRow[] = []
  let pendentes: VendaRow[] = []
  for (const s of precisa) {
    const d = { ...(await kiwifySale(s.id, h)), id: s.id }
    const pay = d.payment ?? {}
    const net = (pay.net_amount ?? d.net_amount ?? 0) / 100
    const taxa = (pay.fee ?? 0) / 100
    const bruto = (pay.product_base_price ?? net * 100 + taxa * 100) / 100
    const status = KIWIFY_STATUS[s.status]
    const row: VendaRow = {
      plataforma: "kiwify",
      external_id: d.id,
      produto: d.product?.name ?? null,
      data_venda: d.created_at ?? s.created_at,
      data_aprovacao: d.approved_date ?? null,
      bruto: round2(bruto),
      taxa: round2(taxa),
      liquido: round2(net),
      status,
      data_status: status === "aprovada" ? null : (d.refunded_at ?? antigos.get(d.id)?.data_status ?? new Date().toISOString()),
      liberacao: null,
      payment_method: d.payment_method ?? null,
      utm_campaign: d.tracking?.utm_campaign ?? null,
      atualizado_em: new Date().toISOString(),
    }
    rows.push(row)
    pendentes.push(row)
    // grava aos poucos: se o limite de requisições estourar, o que já foi lido fica salvo
    if (pendentes.length >= 25) { await upsertVendas(pendentes); pendentes = [] }
    await sleep(650)
  }
  await upsertVendas(pendentes)

  const saques = await syncKiwifySaques(h)
  return { listadas: lista.length, gravadas: rows.length, saques }
}

async function syncKiwifySaques(h: Record<string, string>) {
  const admin = createAdminClient()
  const rows: { plataforma: Plataforma; external_id: string; valor: number; status: string; data: string }[] = []
  for (let page = 1; ; page++) {
    const res = await fetch(`${KIWIFY}/payouts?page_size=100&page_number=${page}`, { headers: h })
    if (!res.ok) throw new Error(`Kiwify payouts ${res.status}`)
    const j = await res.json()
    for (const p of j.data ?? []) {
      rows.push({ plataforma: "kiwify", external_id: p.id, valor: round2(p.amount / 100), status: p.status, data: p.created_at })
    }
    if (page * 100 >= (j.pagination?.count ?? 0)) break
  }
  if (rows.length) {
    const { error } = await admin.from("financeiro_saques").upsert(rows, { onConflict: "plataforma,external_id" })
    if (error) throw new Error(`financeiro_saques: ${error.message}`)
  }
  return rows.length
}

/* ---------------- Hotmart ---------------- */

const HOTMART = "https://developers.hotmart.com/payments/api/v1"

const HOTMART_STATUS: Record<string, StatusVenda> = {
  APPROVED: "aprovada",
  COMPLETE: "aprovada",
  REFUNDED: "reembolsada",
  PARTIALLY_REFUNDED: "reembolsada",
  CHARGEBACK: "chargeback",
}

export async function syncHotmart(desde: Date) {
  const auth = await fetch("https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials", {
    method: "POST",
    headers: { Authorization: process.env.HOTMART_BASIC!.trim() },
  })
  if (!auth.ok) throw new Error(`Hotmart oauth ${auth.status}`)
  const h = { Authorization: `Bearer ${(await auth.json()).access_token}` }

  type Item = {
    product?: { name?: string }
    purchase: {
      transaction: string
      order_date: number
      approved_date?: number
      status: string
      warranty_expire_date?: number
      price: { value: number; currency_code: string }
      hotmart_fee?: { total?: number }
      payment?: { type?: string }
    }
  }
  const itens = new Map<string, Item>()
  let ignoradasMoeda = 0

  for (const w of windows(desde, 60)) {
    for (const status of Object.keys(HOTMART_STATUS)) {
      let token = ""
      do {
        const q = new URLSearchParams({
          start_date: String(w.start.getTime()),
          end_date: String(w.end.getTime()),
          transaction_status: status,
          max_results: "500",
        })
        if (token) q.set("page_token", token)
        const res = await fetch(`${HOTMART}/sales/history?${q}`, { headers: h })
        if (!res.ok) throw new Error(`Hotmart history ${status} ${res.status}`)
        const j = await res.json()
        for (const it of (j.items ?? []) as Item[]) itens.set(it.purchase.transaction, it)
        token = j.page_info?.next_page_token ?? ""
      } while (token)
    }
  }

  const antigos = await existentes("hotmart", [...itens.keys()])
  const agora = new Date().toISOString()
  const rows: VendaRow[] = []
  for (const [id, it] of itens) {
    const p = it.purchase
    if (p.price.currency_code !== "BRL") { ignoradasMoeda++; continue }
    const status = HOTMART_STATUS[p.status]
    const taxa = p.hotmart_fee?.total ?? 0
    rows.push({
      plataforma: "hotmart",
      external_id: id,
      produto: it.product?.name?.trim() ?? null,
      data_venda: new Date(p.order_date).toISOString(),
      data_aprovacao: p.approved_date ? new Date(p.approved_date).toISOString() : null,
      bruto: round2(p.price.value),
      taxa: round2(taxa),
      liquido: round2(p.price.value - taxa),
      status,
      data_status: status === "aprovada" ? null : (antigos.get(id)?.data_status ?? agora),
      // a Hotmart libera o saldo ao fim da garantia
      liberacao: p.warranty_expire_date ? new Date(p.warranty_expire_date).toISOString().slice(0, 10) : null,
      payment_method: p.payment?.type ?? null,
      utm_campaign: null,
      atualizado_em: agora,
    })
  }
  await upsertVendas(rows)
  return { listadas: itens.size, gravadas: rows.length, ignoradasMoeda }
}
