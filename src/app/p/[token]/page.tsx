import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { CalendarioPlan } from "@/components/calendario-plan"
import { ExternalLink, Target, Lightbulb, Calendar, ListChecks, Link2 } from "lucide-react"
import type { Client, Planejamento, Post } from "@/lib/types"

const TYPE_LABELS: Record<string, string> = {
  feed: "Feed", reels: "Reels", story: "Story", tiktok: "TikTok", carrossel: "Carrossel",
}

const PLATAFORMA_STYLE: Record<string, string> = {
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  tiktok:    "bg-black text-white",
  ambos:     "bg-gradient-to-r from-purple-500 to-black text-white",
}

const PLATAFORMA_LABEL: Record<string, string> = {
  instagram: "Instagram",
  tiktok:    "TikTok",
  ambos:     "Instagram + TikTok",
}

// Status simplificado para o cliente
function statusPublico(status: string): { label: string; color: string } {
  if (status === "publicado") return { label: "Publicado", color: "bg-green-100 text-green-700" }
  if (status === "agendado")  return { label: "Agendado",  color: "bg-blue-100 text-blue-700" }
  if (status === "aprovado")  return { label: "Em aprovação", color: "bg-violet-100 text-violet-700" }
  return { label: "Em preparação", color: "bg-gray-100 text-gray-600" }
}

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
]

export default async function PublicPlanejamentoPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = createAdminClient()

  const { data: planData } = await supabase
    .from("planejamentos")
    .select("*")
    .eq("share_token", token)
    .single()

  if (!planData) notFound()
  const plan = planData as Planejamento

  const [year, month] = plan.mes.split("-").map(Number)
  const mesIndex = month - 1

  const [{ data: clientData }, { data: postsData }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", plan.client_id).single(),
    supabase
      .from("posts")
      .select("*")
      .eq("client_id", plan.client_id)
      .gte("data_publicacao", `${plan.mes}-01`)
      .lte("data_publicacao", `${plan.mes}-31`)
      .order("data_publicacao", { ascending: true }),
  ])

  if (!clientData) notFound()
  const client = clientData as Client
  const posts = (postsData ?? []) as Post[]
  const ativasDatas = plan.datas_comemorativas.filter((d) => d.ativo)

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white dark:from-violet-950/20 dark:via-background dark:to-background">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <div className="text-center space-y-3 pb-2">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-card border rounded-full px-4 py-1.5 shadow-sm mb-2">
            <span className="text-base font-black bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">X</span>
            <span className="text-sm font-bold text-muted-foreground">EXP Digital</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Planejamento de Conteúdo</h1>
          <p className="text-xl font-bold text-muted-foreground">{client.nome}</p>
          <div className="inline-block bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full text-sm capitalize">
            {MESES[mesIndex]} {year}
          </div>
        </div>

        {/* Objetivo do Mês */}
        {plan.objetivo_mes && (
          <section className="bg-white dark:bg-card rounded-2xl border shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-2 text-base font-bold">
              <Target className="h-5 w-5 text-primary" />
              Objetivo Principal do Mês
            </div>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{plan.objetivo_mes}</p>
          </section>
        )}

        {/* Datas Comemorativas */}
        {ativasDatas.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-base font-bold">
              <Calendar className="h-5 w-5 text-primary" />
              Datas Comemorativas
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {ativasDatas.map((d) => (
                <div key={d.data} className="bg-white dark:bg-card rounded-2xl border shadow-sm p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                      {new Date(d.data + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "")}
                    </span>
                    <span className="font-semibold text-sm">{d.nome}</span>
                  </div>
                  {d.ideia && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{d.ideia}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Referências */}
        {plan.referencias.length > 0 && (
          <section className="bg-white dark:bg-card rounded-2xl border shadow-sm overflow-hidden">
            <details>
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer select-none list-none hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2 font-bold text-base">
                  <Link2 className="h-5 w-5 text-primary" />
                  Referências
                  <span className="text-sm font-normal bg-muted px-2 py-0.5 rounded-full ml-1">
                    {plan.referencias.length}
                  </span>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </summary>
              <div className="border-t divide-y">
                {plan.referencias.map((r) => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-3.5 hover:bg-muted/30 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-medium text-primary hover:underline truncate">{r.label}</span>
                  </a>
                ))}
              </div>
            </details>
          </section>
        )}

        {/* Sugestões de Ações */}
        {plan.sugestoes_acoes && (
          <section className="bg-white dark:bg-card rounded-2xl border shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-2 text-base font-bold">
              <Lightbulb className="h-5 w-5 text-primary" />
              Sugestões de Ações
            </div>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{plan.sugestoes_acoes}</p>
          </section>
        )}

        {/* Conteúdos Planejados */}
        {posts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-base font-bold">
              <ListChecks className="h-5 w-5 text-primary" />
              Conteúdos Planejados
              <span className="text-sm font-normal bg-muted px-2 py-0.5 rounded-full ml-1">{posts.length}</span>
            </div>
            <div className="bg-white dark:bg-card rounded-2xl border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-xs text-muted-foreground uppercase tracking-wide">
                      <th className="px-5 py-3 text-left font-semibold">Conteúdo</th>
                      <th className="px-4 py-3 text-left font-semibold">Tipo</th>
                      <th className="px-4 py-3 text-left font-semibold">Data</th>
                      <th className="px-4 py-3 text-left font-semibold">Plataforma</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => {
                      const st = statusPublico(post.status)
                      const plat = post.plataforma ?? "instagram"
                      return (
                        <tr key={post.id} className="border-b last:border-0">
                          <td className="px-5 py-3.5">
                            <p className="font-semibold">{post.titulo}</p>
                            {post.tema && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{post.tema}</p>}
                            {post.referencia_url && (
                              <a
                                href={post.referencia_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Referência
                              </a>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                            {TYPE_LABELS[post.tipo] ?? post.tipo}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                            {post.data_publicacao
                              ? new Date(post.data_publicacao + "T00:00:00").toLocaleDateString("pt-BR")
                              : "—"}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${PLATAFORMA_STYLE[plat]}`}>
                              {PLATAFORMA_LABEL[plat]}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${st.color}`}>
                              {st.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Calendário */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-base font-bold">
            <Calendar className="h-5 w-5 text-primary" />
            Calendário de Publicações
          </div>
          <CalendarioPlan posts={posts} ano={year} mes={mesIndex} />
        </section>

        {/* Footer */}
        <footer className="text-center py-6 border-t">
          <p className="text-sm text-muted-foreground">
            Planejado pela equipe{" "}
            <span className="font-bold bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
              EXP Digital
            </span>
          </p>
        </footer>
      </div>
    </div>
  )
}
