import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { CATEGORIAS } from "@/lib/financeiro/tipos"

// Escritas do painel financeiro (só admin). Leitura é feita direto na página.
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

  const b = await req.json().catch(() => null)
  if (!b || typeof b.acao !== "string") return NextResponse.json({ error: "Requisição inválida" }, { status: 400 })
  const admin = createAdminClient()

  if (b.acao === "criar") {
    const tipo = b.tipo
    const valor = Number(b.valor)
    if (!["despesa", "retirada", "saque"].includes(tipo) || !(valor >= 0) || !/^\d{4}-\d{2}-\d{2}$/.test(b.data ?? "")) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }
    const row = {
      tipo,
      data: b.data,
      valor,
      descricao: typeof b.descricao === "string" ? b.descricao.trim().slice(0, 200) || null : null,
      categoria: tipo === "despesa" && b.categoria in CATEGORIAS ? b.categoria : null,
      plataforma: tipo === "saque" && ["kiwify", "hotmart"].includes(b.plataforma) ? b.plataforma : null,
      pago: tipo === "despesa" ? b.pago !== false : true,
      vencimento: tipo === "despesa" && /^\d{4}-\d{2}-\d{2}$/.test(b.vencimento ?? "") ? b.vencimento : null,
    }
    if (tipo === "despesa" && !row.categoria) return NextResponse.json({ error: "Categoria obrigatória" }, { status: 400 })
    const { error } = await admin.from("financeiro_lancamentos").insert(row)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (b.acao === "pagar" && typeof b.id === "string") {
    const { error } = await admin.from("financeiro_lancamentos").update({ pago: true }).eq("id", b.id)
    return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true })
  }

  if (b.acao === "excluir" && typeof b.id === "string") {
    const { error } = await admin.from("financeiro_lancamentos").delete().eq("id", b.id)
    return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true })
  }

  if (b.acao === "config") {
    const rows = (["banco_inicial", "prazo_hotmart", "prazo_kiwify"] as const)
      .filter((k) => Number.isFinite(Number(b[k])))
      .map((k) => ({ chave: k, valor: Number(b[k]) }))
    const { error } = await admin.from("financeiro_config").upsert(rows, { onConflict: "chave" })
    return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Ação desconhecida" }, { status: 400 })
}
