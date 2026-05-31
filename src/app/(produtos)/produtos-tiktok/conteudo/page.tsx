import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ConteudoMarketing } from "@/components/conteudo-marketing"

export default async function ConteudoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/hub")

  const admin = createAdminClient()

  const [{ data: posts }, { data: iniciativas }] = await Promise.all([
    admin.from("conteudo_posts").select("*").order("dia").order("horario"),
    admin.from("marketing_iniciativas").select("*").order("created_at", { ascending: false }),
  ])

  return (
    <ConteudoMarketing
      posts={(posts ?? []) as Parameters<typeof ConteudoMarketing>[0]["posts"]}
      iniciativas={(iniciativas ?? []) as Parameters<typeof ConteudoMarketing>[0]["iniciativas"]}
    />
  )
}
