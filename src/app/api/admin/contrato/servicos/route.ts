import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) return null
  return user
}

// POST — adiciona um serviço adicional
export async function POST(req: NextRequest) {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { client_id, descricao, valor, data } = await req.json()
  if (!client_id || !descricao) {
    return NextResponse.json({ error: "client_id e descricao são obrigatórios" }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { data: novo, error } = await adminClient
    .from("contrato_servicos_adicionais")
    .insert({ client_id, descricao: descricao.trim(), valor: Number(valor) || 0, data: data || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, servico: novo })
}

// DELETE — remove um serviço adicional
export async function DELETE(req: NextRequest) {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from("contrato_servicos_adicionais")
    .delete()
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
