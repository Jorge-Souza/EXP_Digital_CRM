import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { PipelineKanban } from "./kanban"

export const dynamic = "force-dynamic"

export type LeadPipeline = {
  id: string
  nome: string
  email: string
  telefone: string | null
  whatsapp: string | null
  instagram: string | null
  etapa_pipeline: string
  origem: string
  tipo_lead: string | null
  score_comercial: number
  proxima_melhor_oferta: string | null
  responsavel_id: string | null
  created_at: string
  profiles: { nome: string } | null
}

export default async function PipelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  const { data: isVendas } = await supabase.rpc("current_user_is_vendas")
  if (!isAdmin && !isVendas) redirect("/hub")

  const admin = createAdminClient()
  const { data: leads } = await admin
    .from("alunos")
    .select("id, nome, email, telefone, whatsapp, instagram, etapa_pipeline, origem, tipo_lead, score_comercial, proxima_melhor_oferta, responsavel_id, created_at, profiles(nome)")
    .or("tipo_lead.neq.carrinho_abandonado,tipo_lead.is.null")
    .order("created_at", { ascending: false })

  return <PipelineKanban initialLeads={(leads ?? []) as unknown as LeadPipeline[]} />
}
