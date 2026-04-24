import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil } from "lucide-react"
import Link from "next/link"
import { ProjetoCliente } from "@/components/projeto-cliente"
import { StatsSection } from "@/components/stats-section"
import type { Client, Post } from "@/lib/types"

const clientStatusConfig = {
  ativo:   { label: "Ativo",     variant: "default" as const },
  inativo: { label: "Cancelado", variant: "destructive" as const },
  pausado: { label: "Pausado",   variant: "secondary" as const },
}

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleString("pt-BR", { month: "long", year: "numeric" })
}

export default async function ProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: posts }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase.from("posts").select("*").eq("client_id", id).order("data_publicacao", { ascending: true }),
  ])

  if (!client) notFound()

  const c = client as Client
  const allPosts = (posts ?? []) as Post[]
  const s = clientStatusConfig[c.status]

  const now = new Date()
  const cy = now.getFullYear()
  const cm = now.getMonth()
  const ny = cm === 11 ? cy + 1 : cy
  const nm = cm === 11 ? 0 : cm + 1

  const currentMonthPosts = allPosts.filter((p) => {
    if (!p.data_publicacao) return false
    const d = new Date(p.data_publicacao + "T00:00:00")
    return d.getFullYear() === cy && d.getMonth() === cm
  })

  const nextMonthPosts = allPosts.filter((p) => {
    if (!p.data_publicacao) return false
    const d = new Date(p.data_publicacao + "T00:00:00")
    return d.getFullYear() === ny && d.getMonth() === nm
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/clientes" className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{c.nome}</h1>
              <Badge variant={s.variant}>{s.label}</Badge>
            </div>
            <p className="text-muted-foreground text-sm">{c.nicho || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/clientes/${id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Ver Perfil
          </Link>
          <Link href={`/clientes/${id}/editar`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Editar
          </Link>
        </div>
      </div>

      {/* Stats colapsável */}
      <StatsSection
        currentTitle={monthLabel(cy, cm)}
        currentPosts={currentMonthPosts}
        nextTitle={monthLabel(ny, nm)}
        nextPosts={nextMonthPosts}
        metaMensal={c.posts_mensais}
        metaSemanal={c.meta_posts_semana}
      />

      {/* Grupos por status */}
      <ProjetoCliente clientId={id} posts={allPosts} />
    </div>
  )
}
