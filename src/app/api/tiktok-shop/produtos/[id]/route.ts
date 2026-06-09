import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 })

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) return Response.json({ error: "Sem permissão" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { nome, client_id, descricao, sku, ncm, preco, margem, unidade, estoque, marca,
          comprimento, largura, altura, peso, nicho, subnicho, status } = body

  const { data, error } = await supabase
    .from("tiktok_produtos")
    .update({
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
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 })

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) return Response.json({ error: "Sem permissão" }, { status: 403 })

  const { id } = await params
  const { error } = await supabase.from("tiktok_produtos").delete().eq("id", id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}
