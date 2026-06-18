import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { KanbanBoard } from "./kanban"

export const dynamic = "force-dynamic"

export type Demanda = {
  id: string
  titulo: string
  descricao: string | null
  status: "a_fazer" | "em_andamento" | "concluido"
  prioridade: "baixa" | "media" | "alta"
  data_prazo: string | null
  created_at: string
}

export default async function DemandasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/hub")

  const admin = createAdminClient()
  const { data: demandas } = await admin
    .from("demandas")
    .select("*")
    .order("created_at", { ascending: false })

  return <KanbanBoard initialDemandas={(demandas ?? []) as Demanda[]} />
}
