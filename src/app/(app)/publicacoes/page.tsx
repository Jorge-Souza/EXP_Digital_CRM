import { createClient } from "@/lib/supabase/server"
import { buttonVariants } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { PublicacoesKanban } from "@/components/publicacoes-kanban"
import type { Post, Client, Profile } from "@/lib/types"

export default async function PublicacoesPage() {
  const supabase = await createClient()

  const [{ data: posts }, { data: clients }, { data: profiles }] = await Promise.all([
    supabase.from("posts").select("*, clients(id, nome)").order("data_publicacao", { ascending: true }),
    supabase.from("clients").select("id, nome").eq("status", "ativo").order("nome"),
    supabase.from("profiles").select("id, nome").order("nome"),
  ])

  type PostWithClient = Post & { clients: Pick<Client, "id" | "nome"> | null }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Publicações</h1>
          <p className="text-muted-foreground">{posts?.length ?? 0} publicações no total</p>
        </div>
        <Link href="/publicacoes/novo" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Publicação
        </Link>
      </div>

      <PublicacoesKanban
        posts={(posts ?? []) as PostWithClient[]}
        clients={(clients ?? []) as Pick<Client, "id" | "nome">[]}
        profiles={(profiles ?? []) as Pick<Profile, "id" | "nome">[]}
      />
    </div>
  )
}
