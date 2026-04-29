import { NextResponse } from "next/server"
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

const PROFILE_FIELDS = "id, nome, email, role, status, telefone, endereco, data_admissao, created_at"

export async function GET() {
  const caller = await assertAdmin()
  if (!caller) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("profiles")
    .select(PROFILE_FIELDS)
    .order("nome")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ usuarios: data })
}

export async function POST(req: Request) {
  const caller = await assertAdmin()
  if (!caller) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { nome, email, senha, role, telefone, endereco, data_admissao } = await req.json() as {
    nome: string
    email: string
    senha: string
    role: string
    telefone?: string
    endereco?: string
    data_admissao?: string
  }

  if (!nome || !email || !senha) {
    return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
  }

  const admin = createAdminClient()

  const profilePayload = {
    nome,
    role: role ?? "profissional",
    telefone: telefone || null,
    endereco: endereco || null,
    data_admissao: data_admissao || null,
    status: "ativo",
  }

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome },
  })

  if (authError) {
    if (!authError.message.includes("already been registered") && !authError.message.includes("already registered")) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Email já existe — busca o usuário e atualiza o perfil
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
    const existing = users.find(u => u.email === email)
    if (!existing) return NextResponse.json({ error: "Usuário já existe mas não foi encontrado" }, { status: 400 })

    await admin.auth.admin.updateUserById(existing.id, { password: senha })

    const { error: profileError } = await admin.from("profiles").update(profilePayload).eq("id", existing.id)
    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

    return NextResponse.json({ ok: true, id: existing.id })
  }

  const { error: profileError } = await admin.from("profiles").update(profilePayload).eq("id", authData.user.id)
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  return NextResponse.json({ ok: true, id: authData.user.id })
}

export async function PATCH(req: Request) {
  const caller = await assertAdmin()
  if (!caller) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { id, status } = await req.json() as { id: string; status: string }
  if (!id || !status) return NextResponse.json({ error: "ID e status são obrigatórios" }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from("profiles").update({ status }).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function PUT(req: Request) {
  const caller = await assertAdmin()
  if (!caller) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { id, nome, senha, role, telefone, endereco, data_admissao, status } = await req.json() as {
    id: string
    nome: string
    senha?: string
    role: string
    telefone?: string
    endereco?: string
    data_admissao?: string
    status?: string
  }

  if (!id || !nome) return NextResponse.json({ error: "ID e nome são obrigatórios" }, { status: 400 })

  const admin = createAdminClient()

  if (senha) {
    const { error } = await admin.auth.admin.updateUserById(id, { password: senha })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const { error } = await admin.from("profiles").update({
    nome,
    role: role ?? "profissional",
    telefone: telefone || null,
    endereco: endereco || null,
    data_admissao: data_admissao || null,
    status: status ?? "ativo",
  }).eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const caller = await assertAdmin()
  if (!caller) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { id } = await req.json() as { id: string }
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 })

  if (id === caller.id) {
    return NextResponse.json({ error: "Você não pode remover sua própria conta" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
