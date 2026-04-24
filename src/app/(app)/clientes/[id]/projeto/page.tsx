import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Pencil } from "lucide-react"
import Link from "next/link"
import { ProjetoCliente } from "@/components/projeto-cliente"
import { statusConfig, groupOrder } from "@/lib/post-status"
import type { Client, Post } from "@/lib/types"

const clientStatusConfig = {
  ativo:   { label: "Ativo",     variant: "default" as const },
  inativo: { label: "Cancelado", variant: "destructive" as const },
  pausado: { label: "Pausado",   variant: "secondary" as const },
}

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleString("pt-BR", { month: "long", year: "numeric" })
}

function StatsCard({
  title,
  posts,
  metaMensal,
  metaSemanal,
  showWeekly,
}: {
  title: string
  posts: Post[]
  metaMensal: number
  metaSemanal: number
  showWeekly: boolean
}) {
  const postados = posts.filter((p) => p.status === "publicado").length
  const total = posts.length
  const percent = metaMensal > 0 ? Math.round((postados / metaMensal) * 100) : 0

  return (
    <Card className="flex-1">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold capitalize">{title}</CardTitle>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span>Meta: <strong>{metaMensal} posts/mês</strong></span>
          {showWeekly && metaSemanal > 0 && (
            <span>· <strong>{metaSemanal} posts/sem</strong></span>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {/* Barra postados */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Postados</span>
            <span className="font-semibold">{postados} / {metaMensal} <span className="text-muted-foreground">({percent}%)</span></span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${percent >= 100 ? "bg-green-500" : percent >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>

        {/* Breakdown por status */}
        <div className="space-y-1.5">
          {groupOrder.map((s) => {
            const count = posts.filter((p) => p.status === s).length
            return (
              <div key={s} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${statusConfig[s].color}`} />
                  <span className="text-muted-foreground">{statusConfig[s].label}</span>
                </div>
                <span className="font-medium tabular-nums">{count}</span>
              </div>
            )
          })}
          <div className="flex items-center justify-between text-xs border-t pt-1.5 mt-1">
            <span className="text-muted-foreground font-medium">Total planejado</span>
            <span className="font-semibold tabular-nums">{total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
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

      {/* Stats: mês atual + próximo mês */}
      <div className="flex gap-4 flex-col sm:flex-row">
        <StatsCard
          title={monthLabel(cy, cm)}
          posts={currentMonthPosts}
          metaMensal={c.posts_mensais}
          metaSemanal={c.meta_posts_semana}
          showWeekly
        />
        <StatsCard
          title={monthLabel(ny, nm)}
          posts={nextMonthPosts}
          metaMensal={c.posts_mensais}
          metaSemanal={c.meta_posts_semana}
          showWeekly={false}
        />
      </div>

      {/* Grupos por status */}
      <ProjetoCliente clientId={id} posts={allPosts} />
    </div>
  )
}
