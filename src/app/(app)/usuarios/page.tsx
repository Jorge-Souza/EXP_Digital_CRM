import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { UsuariosView } from "@/components/usuarios-view"
import type { Profile } from "@/lib/types"

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/dashboard")

  const admin = createAdminClient()
  const { data: usuarios } = await admin
    .from("profiles")
    .select("id, nome, email, role, telefone, endereco, data_admissao, created_at")
    .order("nome")

  return <UsuariosView usuarios={(usuarios as Profile[]) ?? []} />
}
