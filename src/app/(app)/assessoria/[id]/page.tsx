import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, DollarSign, Phone, Mail, Plus, ExternalLink, Clock, Store, Tag, TrendingUp } from "lucide-react"
import type { Assessorado, SessaoAssessoria, AssessoriaLoja } from "@/lib/types"
import { NovaSessaoDialog } from "@/components/nova-sessao-dialog"
import { RegistrarSessaoDialog } from "@/components/registrar-sessao-dialog"
import { GoogleCalendarConnect } from "@/components/google-calendar-connect"
import { JornadaLojasPanel } from "@/components/assessoria/jornada-lojas-panel"

const statusConfig: Record<string, { label: string; className: string }> = {
  agendada:  { label: "Agendada",  className: "bg-blue-500/10 text-blue-400 border-blue-400/30" },
  realizada: { label: "Realizada", className: "bg-green-500/10 text-green-400 border-green-400/30" },
  remarcada: { label: "Remarcada", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" },
  cancelada: { label: "Cancelada", className: "bg-red-500/10 text-red-400 border-red-400/30" },
  no_show:   { label: "Não compareceu", className: "bg-red-500/10 text-red-400 border-red-400/30" },
}

const SAUDE_CONFIG: Record<string, { label: string; className: string }> = {
  verde:    { label: "🟢 Evoluindo",  className: "bg-green-500/10 text-green-500 border-green-500/30" },
  amarelo:  { label: "🟡 Estagnado",  className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" },
  vermelho: { label: "🔴 Crítico",    className: "bg-red-500/10 text-red-500 border-red-500/30" },
}

const STATUS_LABEL: Record<string, string> = { ativo: "Ativo", pausado: "Pausado", encerrado: "Encerrado", renovado: "Renovado" }

const pilarStatusConfig: Record<string, { label: string; className: string }> = {
  nao_iniciado: { label: "Não Iniciado", className: "bg-muted text-muted-foreground border-border" },
  em_andamento: { label: "Em Andamento", className: "bg-blue-500/10 text-blue-400 border-blue-400/30" },
  concluido: { label: "Concluído", className: "bg-green-500/10 text-green-400 border-green-400/30" },
}

export default async function AssessoradoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/dashboard")

  const [{ data: assessorado }, { data: sessoes }, { data: token }, { data: lojas }] = await Promise.all([
    supabase.from("assessorados").select("*").eq("id", id).single(),
    supabase.from("sessoes_assessoria").select("*").eq("assessorado_id", id).order("data_sessao", { ascending: false }),
    supabase.from("google_calendar_tokens").select("calendar_id").eq("user_id", user.id).maybeSingle(),
    supabase.from("assessoria_lojas").select("*").eq("assessorado_id", id).order("created_at"),
  ])

  if (!assessorado) notFound()

  const a = assessorado as Assessorado
  const lista = (sessoes ?? []) as SessaoAssessoria[]
  const temGoogleCal = !!token
  const lojasIniciais = (lojas ?? []) as AssessoriaLoja[]

  const diasParaFim = a.data_fim_prevista
    ? Math.ceil((new Date(a.data_fim_prevista + "T00:00:00").getTime() - Date.now()) / 86400000)
    : null
  const saude = SAUDE_CONFIG[a.saude_conta] ?? SAUDE_CONFIG.verde

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/assessoria" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2 flex-wrap">
            {a.nome}
            <Badge variant="outline">{STATUS_LABEL[a.status] ?? a.status}</Badge>
            <Badge variant="outline" className={saude.className}>{saude.label}</Badge>
            {a.numero_vaga && <Badge variant="outline">Vaga {a.numero_vaga}/7</Badge>}
          </h1>
          <p className="text-muted-foreground text-sm">
            Assessorado desde {new Date(a.data_contratacao + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            {a.data_fim_prevista && diasParaFim !== null && (
              <> · {diasParaFim >= 0 ? `${diasParaFim} dia(s) até o fim do contrato` : `contrato encerrado há ${Math.abs(diasParaFim)} dia(s)`}</>
            )}
          </p>
        </div>
        <Link href={`/assessoria/${id}/editar`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          Editar
        </Link>
      </div>

      <Tabs defaultValue="visao-geral">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="jornada">Jornada Completa</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Jornada (Pilares)</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">Estrutura</span>
                <Badge variant="outline" className={pilarStatusConfig[a.status_estrutura]?.className || ""}>
                  {pilarStatusConfig[a.status_estrutura]?.label || "Não Iniciado"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Exposição</span>
                <Badge variant="outline" className={pilarStatusConfig[a.status_exposicao]?.className || ""}>
                  {pilarStatusConfig[a.status_exposicao]?.label || "Não Iniciado"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Expansão</span>
                <Badge variant="outline" className={pilarStatusConfig[a.status_expansao]?.className || ""}>
                  {pilarStatusConfig[a.status_expansao]?.label || "Não Iniciado"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Situação Atual</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {a.loja && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Store className="h-4 w-4" /> {a.loja}
                </div>
              )}
              {a.segmento && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4" /> {a.segmento}
                </div>
              )}
              {a.gmv_atual != null && (
                <div className="flex items-center gap-2 font-semibold text-blue-400">
                  <TrendingUp className="h-4 w-4" />
                  GMV: {a.gmv_atual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
              )}
              {!a.loja && !a.segmento && a.gmv_atual == null && (
                <p className="text-muted-foreground italic">Sem dados de loja/GMV ainda.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Dados</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {a.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" /> {a.email}
                </div>
              )}
              {a.telefone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" /> {a.telefone}
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Contratou em {new Date(a.data_contratacao + "T00:00:00").toLocaleDateString("pt-BR")}
              </div>
              {a.valor_assessoria && (
                <div className="flex items-center gap-2 font-semibold text-green-400">
                  <DollarSign className="h-4 w-4" />
                  {a.valor_assessoria.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
              )}
              {a.observacoes && (
                <div className="pt-2 border-t text-muted-foreground">
                  {a.observacoes}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2">Google Agenda</CardTitle></CardHeader>
            <CardContent>
              <GoogleCalendarConnect conectado={temGoogleCal} />
            </CardContent>
          </Card>
        </div>

        {/* Sessões */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Sessões de Assessoria <span className="text-muted-foreground font-normal text-sm">({lista.length})</span></h2>
            <NovaSessaoDialog assessoradoId={id} assessoradoNome={a.nome} temGoogleCal={temGoogleCal} />
          </div>

          {lista.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 gap-2">
                <Calendar className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">Nenhuma sessão agendada ainda.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {lista.map((s) => {
                const dt = new Date(s.data_sessao)
                const cfg = statusConfig[s.status] ?? statusConfig.agendada
                const podeRegistrar = s.status === "agendada" || s.status === "remarcada"
                return (
                  <Card key={s.id} className="hover:border-border/80 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{s.titulo} {s.numero_sessao ? `(Encontro ${s.numero_sessao})` : ""}</p>
                            <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
                            <Badge variant="secondary">{s.tipo === "grupo" ? "Grupo" : "Individual"}</Badge>
                            {s.pilar_foco && <Badge variant="secondary">{s.pilar_foco}</Badge>}
                            {s.tarefas_anteriores_cumpridas && (
                              <Badge variant="outline" className={
                                s.tarefas_anteriores_cumpridas === "sim" ? "text-green-500 border-green-500/30" :
                                s.tarefas_anteriores_cumpridas === "parcial" ? "text-yellow-500 border-yellow-500/30" :
                                "text-red-500 border-red-500/30"
                              }>
                                Tarefas anteriores: {s.tarefas_anteriores_cumpridas === "sim" ? "cumpridas" : s.tarefas_anteriores_cumpridas === "parcial" ? "parcial" : "não cumpridas"}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })} às {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {s.duracao_minutos} min
                            </span>
                          </div>
                          {s.descricao && <p className="text-sm text-muted-foreground">{s.descricao}</p>}
                          {s.plano_de_acao && (
                            <div className="mt-2 p-3 bg-muted/50 rounded-md text-sm">
                              <p className="font-semibold mb-1">Plano de Ação:</p>
                              <p className="text-muted-foreground whitespace-pre-wrap">{s.plano_de_acao}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {podeRegistrar && <RegistrarSessaoDialog sessao={s} assessoradoId={id} />}
                          {s.google_event_link && (
                            <a href={s.google_event_link} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" /> Google Agenda
                            </a>
                          )}
                          {s.link_reuniao && (
                            <a href={s.link_reuniao} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-purple-400 hover:underline flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" /> Reunião
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
        </TabsContent>

        <TabsContent value="jornada" className="mt-4">
          <JornadaLojasPanel assessoradoId={id} assessoradoNome={a.nome} lojaLegado={a.loja} lojasIniciais={lojasIniciais} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
