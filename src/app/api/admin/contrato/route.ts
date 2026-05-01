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

// POST — upload do arquivo de contrato
export async function POST(req: NextRequest) {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const clientId = formData.get("client_id") as string | null

  if (!file || !clientId) {
    return NextResponse.json({ error: "Arquivo e client_id são obrigatórios" }, { status: 400 })
  }

  const ext = file.name.split(".").pop() ?? "pdf"
  const path = `${clientId}/${Date.now()}.${ext}`

  const adminClient = createAdminClient()

  // Remove arquivo anterior se existir
  const { data: existing } = await adminClient
    .from("clients")
    .select("contrato_path")
    .eq("id", clientId)
    .single()

  if (existing?.contrato_path) {
    await adminClient.storage.from("contratos").remove([existing.contrato_path])
  }

  // Faz upload do novo arquivo
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await adminClient.storage
    .from("contratos")
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // Atualiza o registro do cliente
  const { error: dbError } = await adminClient
    .from("clients")
    .update({ contrato_path: path, contrato_nome: file.name })
    .eq("id", clientId)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, path, nome: file.name })
}

// PATCH — atualiza dados do contrato (datas, duração) sem trocar arquivo
export async function PATCH(req: NextRequest) {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { client_id, contrato_inicio, contrato_duracao_meses } = await req.json()
  if (!client_id) return NextResponse.json({ error: "client_id obrigatório" }, { status: 400 })

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from("clients")
    .update({
      contrato_inicio: contrato_inicio || null,
      contrato_duracao_meses: contrato_duracao_meses ? Number(contrato_duracao_meses) : null,
    })
    .eq("id", client_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE — remove o arquivo do contrato
export async function DELETE(req: NextRequest) {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { client_id } = await req.json()
  if (!client_id) return NextResponse.json({ error: "client_id obrigatório" }, { status: 400 })

  const adminClient = createAdminClient()

  const { data: existing } = await adminClient
    .from("clients")
    .select("contrato_path")
    .eq("id", client_id)
    .single()

  if (existing?.contrato_path) {
    await adminClient.storage.from("contratos").remove([existing.contrato_path])
  }

  const { error } = await adminClient
    .from("clients")
    .update({ contrato_path: null, contrato_nome: null })
    .eq("id", client_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
