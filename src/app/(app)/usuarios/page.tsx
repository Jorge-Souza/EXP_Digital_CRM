import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UsuariosView } from "@/components/usuarios-view"
import type { Profile } from "@/lib/types"

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/dashboard")

  const { data: usuarios } = await supabase
    .from("profiles")
    .select("id, nome, email, role, telefone, endereco, data_admissao, created_at")
    .order("nome")

  return <UsuariosView usuarios={(usuarios as Profile[]) ?? []} />
}
