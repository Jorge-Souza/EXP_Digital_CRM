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

  return (
    <CarrinhosBoard
      initialCarrinhos={(carrinhos ?? []) as CarrinhoAbandonado[]}
      initialInteracoes={(interacoes ?? []) as Interacao[]}
    />
  )
}
