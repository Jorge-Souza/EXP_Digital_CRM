import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return null
  return user
}

export async function GET() {
  const caller = await assertAdmin()
  if (!caller) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("profiles")
    .select("id, nome, email, role, telefone, endereco, data_admissao, created_at")
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

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome },
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      nome,
      role: role ?? "profissional",
      telefone: telefone || null,
      endereco: endereco || null,
      data_admissao: data_admissao || null,
    })
    .eq("id", authData.user.id)

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  return NextResponse.json({ ok: true, id: authData.user.id })
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
