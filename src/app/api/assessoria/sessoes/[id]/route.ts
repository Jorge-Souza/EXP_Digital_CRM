import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 })

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) return Response.json({ error: "Sem permissão" }, { status: 403 })

  const body = await req.json()
  const {
    status, descricao, tarefas_passadas, tarefas_anteriores_cumpridas,
    plano_de_acao, pilar_foco, assessorado_id, gmv_atual,
  } = body

  const { data, error } = await supabase
    .from("sessoes_assessoria")
    .update({
      ...(status !== undefined ? { status } : {}),
      ...(descricao !== undefined ? { descricao: descricao || null } : {}),
      ...(tarefas_passadas !== undefined ? { tarefas_passadas: tarefas_passadas || null } : {}),
      ...(tarefas_anteriores_cumpridas !== undefined ? { tarefas_anteriores_cumpridas: tarefas_anteriores_cumpridas || null } : {}),
      ...(plano_de_acao !== undefined ? { plano_de_acao: plano_de_acao || null } : {}),
      ...(pilar_foco !== undefined ? { pilar_foco: pilar_foco || null } : {}),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Se veio GMV, atualiza também no cadastro do assessorado
  if (gmv_atual != null && assessorado_id) {
    await supabase.from("assessorados").update({ gmv_atual, updated_at: new Date().toISOString() }).eq("id", assessorado_id)
  }

  return Response.json(data)
}
