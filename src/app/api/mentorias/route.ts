import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 })

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) return Response.json({ error: "Sem permissão" }, { status: 403 })

  const body = await req.json()
  const {
    tipo, cliente_nome, cliente_telefone, cliente_whatsapp,
    data_sessao, hora_sessao, status, valor, pago, local_pagamento, observacoes,
  } = body

  if (!cliente_nome) return Response.json({ error: "Nome do cliente é obrigatório" }, { status: 400 })

  const { data, error } = await supabase
    .from("mentorias")
    .insert({
      tipo: tipo || "SOS TikTok Shop",
      cliente_nome,
      cliente_telefone: cliente_telefone || null,
      cliente_whatsapp: cliente_whatsapp || null,
      data_sessao: data_sessao || null,
      hora_sessao: hora_sessao || null,
      status: status || "nao_agendada",
      valor: valor ?? null,
      pago: pago ?? false,
      local_pagamento: local_pagamento || null,
      observacoes: observacoes || null,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
