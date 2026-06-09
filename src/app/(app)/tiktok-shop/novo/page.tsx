import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TikTokProdutoForm } from "@/components/tiktok-produto-form"
import type { Client } from "@/lib/types"

export default async function NovoTikTokProdutoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/dashboard")

  const { data: clients } = await supabase
    .from("clients")
    .select("id, nome, avatar_emoji")
    .eq("status", "ativo")
    .order("nome")

  return <TikTokProdutoForm clients={(clients ?? []) as Pick<Client, "id" | "nome" | "avatar_emoji">[]} />
}
