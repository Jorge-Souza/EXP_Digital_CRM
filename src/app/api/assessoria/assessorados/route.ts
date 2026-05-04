import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 })

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) return Response.json({ error: "Sem permissão" }, { status: 403 })

  const body = await req.json()
  const { nome, email, telefone, data_contratacao, valor_assessoria, observacoes } = body

  if (!nome) return Response.json({ error: "Nome é obrigatório" }, { status: 400 })

  const { data, error } = await supabase
    .from("assessorados")
    .insert({ nome, email: email || null, telefone: telefone || null, data_contratacao, valor_assessoria, observacoes: observacoes || null })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
