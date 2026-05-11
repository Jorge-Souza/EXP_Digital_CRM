import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { PostForm } from "@/components/post-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Client, Post, Profile } from "@/lib/types"

export default async function EditarPublicacaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const [{ data: post }, { data: clients }, { data: profiles }] = await Promise.all([
    supabase.from("posts").select("*").eq("id", id).single(),
    supabase.from("clients").select("id, nome").eq("status", "ativo").order("nome"),
    adminClient.from("profiles").select("id, nome").eq("status", "ativo").order("nome"),
  ])

  if (!post) notFound()

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/publicacoes" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Publicação</h1>
          <p className="text-muted-foreground truncate max-w-md">{(post as Post).titulo}</p>
        </div>
      </div>
      <PostForm
        clients={(clients as Pick<Client, "id" | "nome">[]) ?? []}
        profiles={(profiles as Pick<Profile, "id" | "nome">[]) ?? []}
        post={post as Post}
      />
    </div>
  )
}
