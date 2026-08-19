import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, DollarSign, Phone, Mail, ExternalLink, Clock, Store, Tag, TrendingUp } from "lucide-react"
import type { Assessorado, SessaoAssessoria } from "@/lib/types"
import { NovaSessaoDialog } from "@/components/nova-sessao-dialog"
import { RegistrarSessaoDialog } from "@/components/registrar-sessao-dialog"
import { GoogleCalendarConnect } from "@/components/google-calendar-connect"
import { ChecklistAssessorado } from "@/components/assessoria/checklist-assessorado"

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

export default async function AssessoradoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/produtos-tiktok/alunos")

  const [{ data: assessorado }, { data: sessoes }, { data: token }] = await Promise.all([
    supabase.from("assessorados").select("*").eq("id", id).single(),
    supabase.from("sessoes_assessoria").select("*").eq("assessorado_id", id).order("data_sessao", { ascending: false }),
    supabase.from("google_calendar_tokens").select("calendar_id").eq("user_id", user.id).maybeSingle(),
  ])

  if (!assessorado) notFound()

  const a = assessorado as Assessorado
  const lista = (sessoes ?? []) as SessaoAssessoria[]
  const temGoogleCal = !!token

  const diasParaFim = a.data_fim_prevista
    ? Math.ceil((new Date(a.data_fim_prevista + "T00:00:00").getTime() - new Date().getTime()) / 86400000)
    : null
  const saude = SAUDE_CONFIG[a.saude_conta] ?? SAUDE_CONFIG.verde

  return (
    <div className="dark bg-background text-foreground -m-6 min-h-[calc(100vh-3.5rem)] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/produtos-tiktok/assessoria/gestao" className="text-muted-foreground hover:text-foreground transition-colors">
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
        <Link href={`/produtos-tiktok/assessoria/gestao/${id}/editar`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Info */}
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 space-y-2">
            <h3 className="text-[10px] uppercase tracking-wide text-white/40 font-semibold">Informações</h3>
            <div className="space-y-1.5 text-xs">
              {a.loja && (
                <div className="flex items-center gap-1.5 text-white/60">
                  <Store className="h-3 w-3 shrink-0" /> {a.loja}
                </div>
              )}
              {a.segmento && (
                <div className="flex items-center gap-1.5 text-white/60">
                  <Tag className="h-3 w-3 shrink-0" /> {a.segmento}
                </div>
              )}
              {a.gmv_atual != null && (
                <div className="flex items-center gap-1.5 font-semibold text-blue-400">
                  <TrendingUp className="h-3 w-3 shrink-0" />
                  GMV: {a.gmv_atual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
              )}
              {a.email && (
                <div className="flex items-center gap-1.5 text-white/60">
                  <Mail className="h-3 w-3 shrink-0" /> {a.email}
                </div>
              )}
              {a.telefone && (
                <div className="flex items-center gap-1.5 text-white/60">
                  <Phone className="h-3 w-3 shrink-0" /> {a.telefone}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-white/60">
                <Calendar className="h-3 w-3 shrink-0" />
                Contratou em {new Date(a.data_contratacao + "T00:00:00").toLocaleDateString("pt-BR")}
              </div>
              {a.valor_assessoria && (
                <div className="flex items-center gap-1.5 font-semibold text-green-400">
                  <DollarSign className="h-3 w-3 shrink-0" />
                  {a.valor_assessoria.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
              )}
            </div>
            {a.observacoes && (
              <div className="pt-1.5 border-t border-white/10 text-white/40 text-xs">
                {a.observacoes}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
            <h3 className="text-[10px] uppercase tracking-wide text-white/40 font-semibold mb-2">Google Agenda</h3>
            <GoogleCalendarConnect conectado={temGoogleCal} />
          </div>
        </div>

        {/* Sessões */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/80">Sessões de Assessoria <span className="text-white/40 font-normal">({lista.length})</span></h2>
            <NovaSessaoDialog assessoradoId={id} assessoradoNome={a.nome} temGoogleCal={temGoogleCal} />
          </div>

          {lista.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] flex flex-col items-center justify-center py-8 gap-2">
              <Calendar className="h-6 w-6 text-white/15" />
              <p className="text-white/40 text-xs">Nenhuma sessão agendada ainda.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lista.map((s) => {
                const dt = new Date(s.data_sessao)
                const cfg = statusConfig[s.status] ?? statusConfig.agendada
                const podeRegistrar = s.status === "agendada" || s.status === "remarcada"
                return (
                  <div key={s.id} className="rounded-xl border border-white/10 bg-white/[0.03] hover:border-white/20 transition-colors p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-medium text-white">{s.titulo} {s.numero_sessao ? `(Encontro ${s.numero_sessao})` : ""}</p>
                          <Badge variant="outline" className={`text-[10px] py-0 ${cfg.className}`}>{cfg.label}</Badge>
                          <Badge variant="secondary" className="text-[10px] py-0">{s.tipo === "grupo" ? "Grupo" : "Individual"}</Badge>
                          {s.pilar_foco && <Badge variant="secondary" className="text-[10px] py-0">{s.pilar_foco}</Badge>}
                          {s.tarefas_anteriores_cumpridas && (
                            <Badge variant="outline" className={`text-[10px] py-0 ${
                              s.tarefas_anteriores_cumpridas === "sim" ? "text-green-500 border-green-500/30" :
                              s.tarefas_anteriores_cumpridas === "parcial" ? "text-yellow-500 border-yellow-500/30" :
                              "text-red-500 border-red-500/30"
                            }`}>
                              Tarefas: {s.tarefas_anteriores_cumpridas === "sim" ? "cumpridas" : s.tarefas_anteriores_cumpridas === "parcial" ? "parcial" : "não cumpridas"}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/40">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })} às {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {s.duracao_minutos} min
                          </span>
                        </div>
                        {s.descricao && <p className="text-xs text-white/50">{s.descricao}</p>}
                        {s.plano_de_acao && (
                          <div className="mt-1.5 p-2 bg-white/[0.03] border border-white/10 rounded-md text-xs">
                            <p className="font-semibold mb-0.5 text-white/70">Plano de Ação:</p>
                            <p className="text-white/50 whitespace-pre-wrap">{s.plano_de_acao}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {podeRegistrar && <RegistrarSessaoDialog sessao={s} assessoradoId={id} />}
                        {s.google_event_link && (
                          <a href={s.google_event_link} target="_blank" rel="noopener noreferrer"
                            className="text-[11px] text-blue-400 hover:underline flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" /> Google Agenda
                          </a>
                        )}
                        {s.link_reuniao && (
                          <a href={s.link_reuniao} target="_blank" rel="noopener noreferrer"
                            className="text-[11px] text-purple-400 hover:underline flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" /> Reunião
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <ChecklistAssessorado
        assessoradoId={id}
        assessoradoNome={a.nome}
        initial={{ situations: a.situations, trilha: a.trilha, custom_tasks: a.custom_tasks, link: a.jornada_link }}
      />
    </div>
  )
}
