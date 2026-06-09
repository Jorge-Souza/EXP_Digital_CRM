import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { TikTokProdutoForm } from "@/components/tiktok-produto-form"
import type { Client, TikTokProduto } from "@/lib/types"

export default async function EditarTikTokProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/dashboard")

  const [{ data: produto }, { data: clients }] = await Promise.all([
    supabase.from("tiktok_produtos").select("*").eq("id", id).single(),
    supabase.from("clients").select("id, nome, avatar_emoji").eq("status", "ativo").order("nome"),
  ])

  if (!produto) notFound()

  return (
    <TikTokProdutoForm
      clients={(clients ?? []) as Pick<Client, "id" | "nome" | "avatar_emoji">[]}
      initial={produto as TikTokProduto}
    />
  )
}
