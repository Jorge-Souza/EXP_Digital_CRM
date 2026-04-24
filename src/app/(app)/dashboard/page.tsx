import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, ImageIcon, CheckCircle2, AlertCircle } from "lucide-react"
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
      .in("status", ["planejado", "producao"])
      .order("data_publicacao", { ascending: true })
      .limit(5),
  ])

  const stats = [
    {
      title: "Clientes Ativos",
      value: activeClients ?? 0,
      total: totalClients ?? 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Posts Publicados",
      value: publishedPosts ?? 0,
      total: totalPosts ?? 0,
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Em Produção",
      value: (totalPosts ?? 0) - (publishedPosts ?? 0),
      total: totalPosts ?? 0,
      icon: ImageIcon,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950",
    },
  ]

  const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    planejado: { label: "Planejado", variant: "outline" },
    producao: { label: "Em Produção", variant: "secondary" },
    aprovado: { label: "Aprovado", variant: "default" },
    publicado: { label: "Publicado", variant: "default" },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da EXP Digital</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">de {stat.total} total</p>
                </div>
                <div className={`${stat.bg} rounded-full p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Pendências Recentes</CardTitle>
          <Link href="/publicacoes" className="text-sm text-primary hover:underline">
            Ver todos
          </Link>
        </CardHeader>
        <CardContent>
          {!pendingPosts || pendingPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-500 mb-3" />
              <p className="font-medium">Tudo em dia!</p>
              <p className="text-sm text-muted-foreground">Nenhuma pendência no momento.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPosts.map((post) => {
                const s = statusLabels[post.status] ?? { label: post.status, variant: "outline" as const }
                const client = (post.clients as unknown) as { nome: string } | null
                return (
                  <div key={post.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{post.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          {client?.nome ?? "—"}
                          {post.data_publicacao && ` · ${new Date(post.data_publicacao).toLocaleDateString("pt-BR")}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={s.variant}>{s.label}</Badge>
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
