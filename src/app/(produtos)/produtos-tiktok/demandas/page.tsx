import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { KanbanBoard } from "./kanban"

export const dynamic = "force-dynamic"

export type Demanda = {
  id: string
  titulo: string
  descricao: string | null
  tipo: "tarefa" | "agenda" | "demanda"
  status: "a_fazer" | "em_andamento" | "fazer_reuniao" | "reuniao_feita" | "pagamento_feito"
  prioridade: "baixa" | "media" | "alta"
  data_prazo: string | null
  hora_prazo: string | null
  valor: number | null
  created_at: string
}

export default async function DemandasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/produtos-tiktok/alunos")

  const admin = createAdminClient()
  const { data: demandas } = await admin
    .from("demandas")
    .select("*")
    .order("created_at", { ascending: false })

  return <KanbanBoard initialDemandas={(demandas ?? []) as Demanda[]} />
}
