import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalClients },
    { count: activeClients },
    { count: totalPosts },
    { count: publishedPosts },
    { data: pendingPosts },
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "publicado"),
    supabase
      .from("posts")
      .select("id, titulo, tipo, status, data_publicacao, clients(nome)")
      .in("status", ["planejado", "falta_insumo", "producao"])
      .order("data_publicacao", { ascending: true })
      .limit(5),
  ])

  const stats = [
    {
      emoji: "👥",
      title: "Clientes Ativos",
      value: activeClients ?? 0,
      sub: `${totalClients ?? 0} total`,
      gradient: "from-violet-500 to-purple-600",
      bg: "bg-violet-50 dark:bg-violet-950/40",
    },
    {
      emoji: "✅",
      title: "Posts Publicados",
      value: publishedPosts ?? 0,
      sub: `de ${totalPosts ?? 0} criados`,
      gradient: "from-emerald-500 to-green-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      emoji: "🎬",
      title: "Em Produção",
      value: (totalPosts ?? 0) - (publishedPosts ?? 0),
      sub: "aguardando publicação",
      gradient: "from-orange-500 to-amber-500",
      bg: "bg-orange-50 dark:bg-orange-950/40",
    },
  ]

  const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    planejado:       { label: "Falta Fazer",         variant: "outline" },
    falta_insumo:    { label: "Falta Insumo",        variant: "destructive" },
    producao:        { label: "Em Produção",          variant: "secondary" },
    aprovado_design: { label: "Aprovação Design",    variant: "secondary" },
    aprovado:        { label: "P/ Aprovação Cliente", variant: "default" },
    agendado:        { label: "Agendado",             variant: "secondary" },
    publicado:       { label: "Postado",              variant: "default" },
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">📊 Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da EXP Digital</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
                const s = statusLabels[post.status] ?? { label: post.status, variant: "outline" as const }
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
                    <Badge variant={s.variant} className="shrink-0">{s.label}</Badge>
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
