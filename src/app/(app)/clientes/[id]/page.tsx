import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft, ExternalLink, Pencil, Plus,
  Target, Users, MessageSquare, Briefcase, Star, StickyNote,
  CheckCircle2, Clock, AlertTriangle, TrendingUp
} from "lucide-react"
import Link from "next/link"
import type { Client, Post } from "@/lib/types"

const statusConfig = {
  ativo: { label: "Ativo", variant: "default" as const },
  inativo: { label: "Cancelado", variant: "destructive" as const },
  pausado: { label: "Pausado", variant: "secondary" as const },
}

const postStatusConfig: Record<string, { label: string; variant: "outline" | "secondary" | "default" | "destructive" }> = {
  planejado:    { label: "Falta Fazer",          variant: "outline" },
  falta_insumo: { label: "Falta Insumo",         variant: "destructive" },
  producao:     { label: "Em Produção",           variant: "secondary" },
  aprovado:     { label: "P/ Aprovação Cliente",  variant: "default" },
  publicado:    { label: "Postado",               variant: "default" },
}

const postTypeLabels: Record<string, string> = {
  feed: "Feed", reels: "Reels", story: "Story", tiktok: "TikTok", carrossel: "Carrossel",
}

function BriefingField({ icon: Icon, label, value }: {
  icon: React.ElementType
  label: string
  value: string | null
}) {
  if (!value) return null
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed pl-6">{value}</p>
    </div>
  )
}

export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [{ data: client }, { data: posts }, { data: postsThisMonth }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase.from("posts").select("*").eq("client_id", id).order("data_publicacao", { ascending: true }),
    supabase.from("posts").select("id, status").eq("client_id", id).gte("created_at", startOfMonth),
  ])

  if (!client) notFound()

  const c = client as Client
  const s = statusConfig[c.status]

  const allPosts = (posts ?? []) as Post[]
  const publishedCount = allPosts.filter((p) => p.status === "publicado").length
  const inProgressCount = allPosts.filter((p) => p.status === "producao" || p.status === "aprovado").length
  const plannedCount = allPosts.filter((p) => p.status === "planejado").length

  const thisMonthTotal = postsThisMonth?.length ?? 0
  const thisMonthPublished = postsThisMonth?.filter((p) => p.status === "publicado").length ?? 0
  const deliveryPercent = c.posts_mensais > 0 ? Math.round((thisMonthPublished / c.posts_mensais) * 100) : 0
  const pending = Math.max(0, c.posts_mensais - thisMonthPublished)

  const hasBriefing = c.objetivo || c.publico_alvo || c.tom_de_voz || c.servicos_contratados || c.diferenciais || c.observacoes

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/clientes" className="text-muted-foreground hover:text-foreground transition-colors mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{c.nome}</h1>
              <Badge variant={s.variant}>{s.label}</Badge>
            </div>
            <p className="text-muted-foreground text-sm">{c.nicho || "—"}</p>
          </div>
        </div>
        <Link href={`/clientes/${id}/editar`} className={buttonVariants({ variant: "outline" })}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </Link>
      </div>

      {/* Controle de Entregas */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Controle de Entregas — {now.toLocaleString("pt-BR", { month: "long", year: "numeric" })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{thisMonthPublished}</p>
              <p className="text-xs text-muted-foreground mt-1">Publicados</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{c.posts_mensais}</p>
              <p className="text-xs text-muted-foreground mt-1">Contratados</p>
            </div>
            <div className="text-center">
              <p className={`text-3xl font-bold ${pending > 0 ? "text-orange-500" : "text-green-500"}`}>{pending}</p>
              <p className="text-xs text-muted-foreground mt-1">Pendentes</p>
            </div>
            <div className="text-center">
              <p className={`text-3xl font-bold ${deliveryPercent >= 100 ? "text-green-500" : deliveryPercent >= 60 ? "text-yellow-500" : "text-red-500"}`}>
                {deliveryPercent}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Entregue</p>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{thisMonthPublished} de {c.posts_mensais} posts entregues</span>
              <span>{deliveryPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${deliveryPercent >= 100 ? "bg-green-500" : deliveryPercent >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${Math.min(deliveryPercent, 100)}%` }}
              />
            </div>
          </div>

          {pending > 0 && (
            <div className="flex items-center gap-2 mt-3 text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/30 rounded-lg px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>Faltam <strong>{pending} posts</strong> para cumprir o escopo desse mês</span>
            </div>
          )}
          {pending === 0 && c.posts_mensais > 0 && (
            <div className="flex items-center gap-2 mt-3 text-xs text-green-600 bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Escopo do mês <strong>100% entregue!</strong></span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs: Briefing / Publicações / Contato */}
      <Tabs defaultValue="briefing">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="briefing">Manual do Cliente</TabsTrigger>
          <TabsTrigger value="publicacoes">
            Publicações ({allPosts.length})
          </TabsTrigger>
          <TabsTrigger value="contato">Contato</TabsTrigger>
        </TabsList>

        {/* BRIEFING */}
        <TabsContent value="briefing" className="mt-4">
          {!hasBriefing ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Briefcase className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <h3 className="font-semibold">Briefing não preenchido</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Adicione as informações do cliente para que a equipe saiba como atendê-lo
                </p>
                <Link href={`/clientes/${id}/editar`} className={buttonVariants({ variant: "outline" })}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Preencher Briefing
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                  Manual do Cliente — {c.nome}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <BriefingField icon={Target} label="Objetivo do Cliente" value={c.objetivo} />
                {c.objetivo && <Separator />}
                <BriefingField icon={Users} label="Público-alvo" value={c.publico_alvo} />
                {c.publico_alvo && <Separator />}
                <BriefingField icon={MessageSquare} label="Tom de Voz" value={c.tom_de_voz} />
                {c.tom_de_voz && <Separator />}
                <BriefingField icon={Briefcase} label="Serviços Contratados" value={c.servicos_contratados} />
                {c.servicos_contratados && <Separator />}
                <BriefingField icon={Star} label="Diferenciais da Marca" value={c.diferenciais} />
                {c.diferenciais && <Separator />}
                <BriefingField icon={StickyNote} label="Observações Importantes" value={c.observacoes} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* PUBLICAÇÕES */}
        <TabsContent value="publicacoes" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Link href={`/publicacoes/novo?client_id=${id}`} className={buttonVariants({ size: "sm" })}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Publicação
            </Link>
          </div>

          {/* Resumo rápido */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Planejados", count: plannedCount, icon: Clock, color: "text-muted-foreground" },
              { label: "Em andamento", count: inProgressCount, icon: AlertTriangle, color: "text-orange-500" },
              { label: "Publicados", count: publishedCount, icon: CheckCircle2, color: "text-green-500" },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="p-3 flex items-center gap-3">
                  <item.icon className={`h-5 w-5 shrink-0 ${item.color}`} />
                  <div>
                    <p className="text-xl font-bold">{item.count}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {allPosts.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                Nenhuma publicação cadastrada ainda.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {allPosts.map((post) => {
                    const ps = postStatusConfig[post.status]
                    return (
                      <div key={post.id} className="flex items-center justify-between p-4 gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{post.titulo}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
                            <span>{postTypeLabels[post.tipo] ?? post.tipo}</span>
                            {post.tema && <><span>·</span><span className="truncate max-w-[200px]">{post.tema}</span></>}
                            {post.data_publicacao && <><span>·</span><span>{new Date(post.data_publicacao + "T00:00:00").toLocaleDateString("pt-BR")}</span></>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {post.drive_file_url && (
                            <a href={post.drive_file_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                            </a>
                          )}
                          <Badge variant={ps.variant}>{ps.label}</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* CONTATO */}
        <TabsContent value="contato" className="mt-4">
          <Card>
            <CardContent className="divide-y p-0">
              {[
                { label: "Responsável", value: c.contato_nome },
                { label: "Email", value: c.contato_email },
                { label: "WhatsApp", value: c.contato_telefone },
                { label: "Instagram", value: c.instagram ? `@${c.instagram}` : null, href: c.instagram ? `https://instagram.com/${c.instagram}` : undefined },
                { label: "TikTok", value: c.tiktok ? `@${c.tiktok}` : null, href: c.tiktok ? `https://tiktok.com/@${c.tiktok}` : undefined },
                { label: "Google Drive", value: c.drive_folder_url ? "Abrir pasta" : null, href: c.drive_folder_url ?? undefined },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-5 py-3.5 text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  {row.href && row.value ? (
                    <a href={row.href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium flex items-center gap-1">
                      {row.value}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="font-medium">{row.value || "—"}</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
