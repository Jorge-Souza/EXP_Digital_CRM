import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 })

  const { data, error } = await supabase
    .from("tiktok_produtos")
    .select("*, client:clients(id, nome, avatar_emoji, cor)")
    .order("created_at", { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 })

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) return Response.json({ error: "Sem permissão" }, { status: 403 })

  const body = await req.json()
  const { nome, client_id, descricao, sku, ncm, preco, margem, unidade, estoque, marca,
          comprimento, largura, altura, peso, nicho, subnicho, status } = body

  if (!nome) return Response.json({ error: "Nome é obrigatório" }, { status: 400 })

  const { data, error } = await supabase
    .from("tiktok_produtos")
    .insert({
      nome, client_id: client_id || null, descricao: descricao || null,
      sku: sku || null, ncm: ncm || null,
      preco: preco ? Number(preco) : null,
      margem: margem ? Number(margem) : null,
      unidade: unidade || null, estoque: Number(estoque) || 0,
      marca: marca || null,
      comprimento: comprimento ? Number(comprimento) : null,
      largura: largura ? Number(largura) : null,
      altura: altura ? Number(altura) : null,
      peso: peso ? Number(peso) : null,
      nicho: nicho || null, subnicho: subnicho || null,
      status: status || "rascunho",
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
