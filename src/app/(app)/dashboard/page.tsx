import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { statusConfig } from "@/lib/post-status"

export default async function DashboardPage() {
  const supabase = await createClient()

  const now = new Date()
  const cy = now.getFullYear()
  const cm = now.getMonth()
  const firstDay = new Date(cy, cm, 1).toISOString().slice(0, 10)
  const lastDay  = new Date(cy, cm + 1, 0).toISOString().slice(0, 10)
  const daysInMonth  = new Date(cy, cm + 1, 0).getDate()
  const dayOfMonth   = now.getDate()
  const monthProgress = dayOfMonth / daysInMonth // 0–1

  const monthLabel = now.toLocaleString("pt-BR", { month: "long", year: "numeric" })

  const [{ data: allClients }, { data: allPosts }, { data: monthPosts }, { data: pendingPosts }] = await Promise.all([
    supabase.from("clients").select("id, nome, avatar_emoji, cor, posts_mensais, nicho, status").order("nome"),
    supabase.from("posts").select("id, tipo, status, client_id"),
    supabase.from("posts").select("id, client_id, status, tipo")
      .gte("data_publicacao", firstDay)
      .lte("data_publicacao", lastDay),
    supabase
      .from("posts")
      .select("id, titulo, tipo, status, data_publicacao, clients(nome)")
      .in("status", ["planejado", "falta_insumo", "producao"])
      .order("data_publicacao", { ascending: true })
      .limit(5),
  ])

  const activeClients  = allClients?.filter((c) => c.status === "ativo") ?? []
  const totalClients   = allClients?.length ?? 0
  const nonStories     = allPosts?.filter((p) => p.tipo !== "story") ?? []
  const totalPosts     = nonStories.length
  const publishedPosts = nonStories.filter((p) => p.status === "publicado").length
  const stories           = allPosts?.filter((p) => p.tipo === "story") ?? []
  const storiesTotal      = stories.length
  const storiesPublicados = stories.filter((p) => p.status === "publicado").length
  const storiesPendentes  = storiesTotal - storiesPublicados

  // Visão por cliente — mês atual
  type ClientHealth = "concluido" | "em_dia" | "atencao" | "atrasado" | "sem_meta"
  const clientRows = activeClients.map((c) => {
    const clientMonthPosts = monthPosts?.filter((p) => p.client_id === c.id) ?? []
    const published  = clientMonthPosts.filter((p) => p.status === "publicado").length
    const inProgress = clientMonthPosts.filter((p) =>
      ["producao", "aprovado_design", "aprovado", "agendado", "falta_insumo"].includes(p.status)
    ).length
    const meta = c.posts_mensais ?? 0

    let health: ClientHealth = "sem_meta"
    if (meta > 0) {
      if (published >= meta) {
        health = "concluido"
      } else {
        const expected = Math.ceil(meta * monthProgress)
        if (published >= expected) health = "em_dia"
        else if (published >= Math.ceil(expected * 0.5)) health = "atencao"
        else health = "atrasado"
      }
    }

    return { ...c, published, inProgress, meta, health }
  })

  const healthConfig: Record<ClientHealth, { label: string; color: string; bar: string; bg: string }> = {
    concluido: { label: "Concluído",  color: "text-green-700",  bar: "bg-green-500",  bg: "bg-green-50 dark:bg-green-950/30" },
    em_dia:    { label: "Em Dia",     color: "text-green-600",  bar: "bg-green-400",  bg: "bg-green-50/60 dark:bg-green-950/20" },
    atencao:   { label: "Atenção",    color: "text-amber-600",  bar: "bg-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/30" },
    atrasado:  { label: "Atrasado",   color: "text-red-600",    bar: "bg-red-500",    bg: "bg-red-50 dark:bg-red-950/30" },
    sem_meta:  { label: "Sem Meta",   color: "text-gray-400",   bar: "bg-gray-200",   bg: "bg-gray-50 dark:bg-gray-800/30" },
  }

  const stats = [
    {
      emoji: "👥",
      title: "Clientes Ativos",
      value: activeClients.length,
      sub: `${totalClients} total`,
      gradient: "from-violet-500 to-purple-600",
      bg: "bg-violet-50 dark:bg-violet-950/40",
    },
    {
      emoji: "✅",
      title: "Posts Publicados",
      value: publishedPosts,
      sub: `de ${totalPosts} criados (sem stories)`,
      gradient: "from-emerald-500 to-green-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      emoji: "🎬",
      title: "Em Produção",
      value: totalPosts - publishedPosts,
      sub: "feed · reels · carrossel · tiktok",
      gradient: "from-orange-500 to-amber-500",
      bg: "bg-orange-50 dark:bg-orange-950/40",
    },
    {
      emoji: "📱",
      title: "Stories",
      value: storiesTotal,
      sub: `${storiesPublicados} publicados · ${storiesPendentes} pendentes`,
      gradient: "from-amber-400 to-yellow-500",
      bg: "bg-amber-50 dark:bg-amber-950/40",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">📊 Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da EXP Digital</p>
      </div>

      {/* KPIs globais */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden border-0 shadow-md">
            <CardContent className="p-0">
              <div className={`h-1.5 w-full bg-gradient-to-r ${stat.gradient}`} />
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-4xl font-black mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                </div>
                <div className={`${stat.bg} rounded-2xl p-4 text-3xl`}>
                  {stat.emoji}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Meta por cliente */}
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg font-bold">🎯 Meta por Cliente</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{monthLabel} · dia {dayOfMonth} de {daysInMonth}</p>
          </div>
          <Link href="/clientes" className="text-sm text-primary hover:underline font-medium">
            Ver clientes →
          </Link>
        </CardHeader>
        <CardContent>
          {clientRows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum cliente ativo.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {clientRows.map((c) => {
                const h = healthConfig[c.health]
                const pct = c.meta > 0 ? Math.min(100, Math.round((c.published / c.meta) * 100)) : 0
                return (
                  <Link
                    key={c.id}
                    href={`/clientes/${c.id}/projeto`}
                    className={`rounded-xl border p-4 flex flex-col gap-3 hover:shadow-md transition-shadow ${h.bg}`}
                  >
                    {/* Cabeçalho */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="text-xl h-9 w-9 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: c.cor ?? "#6366f1" + "22" }}
                        >
                          {c.avatar_emoji ?? "🏢"}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{c.nome}</p>
                          {c.nicho && <p className="text-xs text-muted-foreground truncate">{c.nicho}</p>}
                        </div>
                      </div>
                      <span className={`text-xs font-bold shrink-0 ${h.color}`}>{h.label}</span>
                    </div>

                    {/* Barra de progresso */}
                    {c.meta > 0 ? (
                      <>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              <span className="font-bold text-foreground">{c.published}</span> publicados
                            </span>
                            <span className="text-muted-foreground">meta: <span className="font-semibold">{c.meta}</span></span>
                          </div>
                          <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${h.bar}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{pct}% da meta</span>
                            {c.inProgress > 0 && (
                              <span className="text-amber-600 font-medium">{c.inProgress} em andamento</span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">Meta mensal não definida</p>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pendências recentes */}
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-bold">⏳ Pendências Recentes</CardTitle>
          <Link href="/publicacoes" className="text-sm text-primary hover:underline font-medium">
            Ver todos →
          </Link>
        </CardHeader>
        <CardContent>
          {!pendingPosts || pendingPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
              <span className="text-5xl">🎉</span>
              <p className="font-bold text-lg">Tudo em dia!</p>
              <p className="text-sm text-muted-foreground">Nenhuma pendência no momento.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingPosts.map((post) => {
                const s = statusConfig[post.status as keyof typeof statusConfig] ?? { label: post.status, badge: "outline" as const }
                const client = (post.clients as unknown) as { nome: string } | null
                return (
                  <div key={post.id} className="flex items-center justify-between rounded-xl border bg-muted/30 p-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg shrink-0">
                        {post.status === "falta_insumo" ? "🔴" : post.status === "producao" ? "🟡" : "⚪"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{post.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          {client?.nome ?? "—"}
                          {post.data_publicacao && ` · ${new Date(post.data_publicacao + "T00:00:00").toLocaleDateString("pt-BR")}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={s.badge} className="shrink-0">{s.label}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
