import { createClient } from "@/lib/supabase/server"
import { PostForm } from "@/components/post-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Client } from "@/lib/types"

export default async function NovaPublicacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string; status?: string; data?: string }>
}) {
  const { client_id, status, data } = await searchParams
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from("clients")
    .select("id, nome")
    .eq("status", "ativo")
    .order("nome")

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/publicacoes" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nova Publicação</h1>
          <p className="text-muted-foreground">Cadastre um novo conteúdo</p>
        </div>
      </div>
      <PostForm clients={(clients as Pick<Client, "id" | "nome">[]) ?? []} defaultClientId={client_id} defaultStatus={status} defaultDate={data} />
    </div>
  )
}
