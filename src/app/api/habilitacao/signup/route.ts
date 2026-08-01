import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: "E-mail e senha são obrigatórios" }, { status: 400 })
  }

  const admin = createAdminClient()

  // Cria o usuário já com e-mail confirmado — evita depender do envio de
  // e-mail de confirmação (limite de envio do Supabase) para liberar o login.
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    const jaExiste = error.message.toLowerCase().includes("already registered") ||
      error.message.toLowerCase().includes("already been registered")
    return NextResponse.json(
      { error: jaExiste ? "already_registered" : "create_failed" },
      { status: jaExiste ? 409 : 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
