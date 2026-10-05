import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Config, Lancamento, SaldoKiwify, Saque, Venda } from "@/lib/financeiro/tipos"
import { FinanceiroDash } from "./dash"

export const dynamic = "force-dynamic"

async function todas<T>(tabela: string, colunas: string, ordem: string): Promise<T[]> {
  const admin = createAdminClient()
  const out: T[] = []
  for (let i = 0; ; i += 1000) {
    const { data, error } = await admin.from(tabela).select(colunas).order(ordem).range(i, i + 999)
    if (error) throw new Error(`${tabela}: ${error.message}`)
    out.push(...((data ?? []) as T[]))
    if (!data || data.length < 1000) break
  }
  return out
}

// Saldo real da Kiwify (disponível e a liberar), para conferir com o saldo calculado.
async function saldoKiwify(): Promise<SaldoKiwify> {
  try {
    const t = await fetch("https://public-api.kiwify.com/v1/oauth/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.KIWIFY_CLIENT_ID!.trim(),
        client_secret: process.env.KIWIFY_CLIENT_SECRET!.trim(),
      }),
      cache: "no-store",
    })
    if (!t.ok) return null
    const { access_token } = await t.json()
    const r = await fetch("https://public-api.kiwify.com/v1/balance", {
      headers: { Authorization: `Bearer ${access_token}`, "x-kiwify-account-id": process.env.KIWIFY_ACCOUNT_ID!.trim() },
      cache: "no-store",
    })
    if (!r.ok) return null
    const j = await r.json()
    return { available: j.available / 100, pending: j.pending / 100 }
  } catch {
    return null
  }
}

export default async function FinanceiroPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/produtos-tiktok/alunos")

  const [vendas, saques, lancamentos, cfgRows, kiwify] = await Promise.all([
    todas<Venda>("financeiro_vendas", "plataforma, external_id, produto, data_venda, bruto, taxa, liquido, status, data_status, liberacao", "data_venda"),
    todas<Saque>("financeiro_saques", "plataforma, external_id, valor, status, data", "data"),
    todas<Lancamento>("financeiro_lancamentos", "id, tipo, data, categoria, descricao, valor, plataforma, pago, vencimento", "data"),
    createAdminClient().from("financeiro_config").select("chave, valor"),
    saldoKiwify(),
  ])

  const config: Config = { banco_inicial: 0, prazo_hotmart: 15, prazo_kiwify: 2 }
  for (const r of cfgRows.data ?? []) (config as Record<string, number>)[r.chave] = Number(r.valor)

  return <FinanceiroDash vendas={vendas} saques={saques} lancamentos={lancamentos} config={config} saldoKiwify={kiwify} />
}
