import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { CarrinhosBoard } from "./board"

export const dynamic = "force-dynamic"

export type Interacao = {
  id: string
  carrinho_id: string
  data: string
  canal: "whatsapp" | "ligacao" | "dm_instagram" | "email" | null
  resumo: string | null
  proximo_passo: string | null
  created_at: string
}

export type CarrinhoAbandonado = {
  id: string
  aluno_id: string
  produto_id: string | null
  kiwify_checkout_id: string | null
  data_abandono: string
  status: "novo" | "em_contato" | "recuperado" | "perdido"
  proximo_followup: string | null
  responsavel: string | null
  observacoes: string | null
  updated_at: string | null
  alunos: { nome: string; email: string; telefone: string | null } | null
  produtos_tiktok: { nome: string } | null
  vendido: number | null
}

export default async function CarrinhosAbandonadosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  const { data: isVendas } = await supabase.rpc("current_user_is_vendas")
  if (!isAdmin && !isVendas) redirect("/hub")

  const admin = createAdminClient()
  const { data: carrinhos } = await admin
    .from("carrinhos_abandonados")
    .select("*, alunos(nome,email,telefone), produtos_tiktok(nome)")
    .order("data_abandono", { ascending: false })

  const { data: interacoes } = await admin
    .from("interacoes_carrinho")
    .select("*")
    .order("data", { ascending: false })

  const alunoIds = Array.from(new Set((carrinhos ?? []).map(c => c.aluno_id)))
  const { data: comprasRaw } = alunoIds.length
    ? await admin
        .from("compras_alunos")
        .select("aluno_id, valor, valor_liquido, valor_bruto, status")
        .in("aluno_id", alunoIds)
        .eq("status", "ativo")
    : { data: [] as { aluno_id: string; valor: number | null; valor_liquido: number | null; valor_bruto: number | null }[] }

  const vendidoPorAluno = new Map<string, number>()
  for (const c of comprasRaw ?? []) {
    const valor = c.valor_liquido ?? c.valor_bruto ?? c.valor ?? 0
    vendidoPorAluno.set(c.aluno_id, (vendidoPorAluno.get(c.aluno_id) ?? 0) + valor)
  }

  const carrinhosComVenda = (carrinhos ?? []).map(c => ({
    ...c,
    vendido: vendidoPorAluno.get(c.aluno_id) ?? null,
  }))

  return (
    <CarrinhosBoard
      initialCarrinhos={carrinhosComVenda as CarrinhoAbandonado[]}
      initialInteracoes={(interacoes ?? []) as Interacao[]}
    />
  )
}
