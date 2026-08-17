import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, LayoutDashboard, AlertTriangle, Calendar, DoorOpen } from "lucide-react"
import type { Assessorado, SessaoAssessoria } from "@/lib/types"

const SAUDE_EMOJI: Record<string, string> = { verde: "🟢", amarelo: "🟡", vermelho: "🔴" }

export default async function AssessoriaDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/produtos-tiktok/alunos")

  const [{ data: assessoradosRaw }, { data: sessoesRaw }] = await Promise.all([
    supabase.from("assessorados").select("*").order("nome"),
    supabase.from("sessoes_assessoria").select("*").order("data_sessao", { ascending: false }),
  ])

  const assessorados = (assessoradosRaw ?? []) as Assessorado[]
  const sessoes = (sessoesRaw ?? []) as SessaoAssessoria[]
  const ativos = assessorados.filter((a) => a.status === "ativo" || a.status === "renovado")

  const hoje = new Date()
  const em15dias = new Date(hoje); em15dias.setDate(em15dias.getDate() + 15)
  const ha15dias = new Date(hoje); ha15dias.setDate(ha15dias.getDate() - 15)
  const daqui7dias = new Date(hoje); daqui7dias.setDate(daqui7dias.getDate() + 7)

  const sessoesPorAssessorado = new Map<string, SessaoAssessoria[]>()
  for (const s of sessoes) {
    if (!sessoesPorAssessorado.has(s.assessorado_id)) sessoesPorAssessorado.set(s.assessorado_id, [])
    sessoesPorAssessorado.get(s.assessorado_id)!.push(s)
  }

  // Sessões da semana (próximos 7 dias)
  const sessoesDaSemana = sessoes
    .filter((s) => {
      const dt = new Date(s.data_sessao)
      return dt >= hoje && dt <= daqui7dias && (s.status === "agendada" || s.status === "remarcada")
    })
    .sort((a, b) => new Date(a.data_sessao).getTime() - new Date(b.data_sessao).getTime())
    .map((s) => ({ sessao: s, assessorado: assessorados.find((a) => a.id === s.assessorado_id) }))

  // Alertas
  type Alerta = { tipo: string; assessorado: Assessorado; detalhe: string }
  const alertas: Alerta[] = []

  for (const a of ativos) {
    const minhas = (sessoesPorAssessorado.get(a.id) ?? []).sort((x, y) => new Date(y.data_sessao).getTime() - new Date(x.data_sessao).getTime())
    const ultimaRealizada = minhas.find((s) => s.status === "realizada")
    const referencia = ultimaRealizada ? new Date(ultimaRealizada.data_sessao) : new Date(a.data_contratacao + "T00:00:00")

    if (referencia < ha15dias) {
      const dias = Math.floor((hoje.getTime() - referencia.getTime()) / 86400000)
      alertas.push({ tipo: "sem_sessao", assessorado: a, detalhe: `Sem sessão registrada há ${dias} dias` })
    }

    if (a.data_fim_prevista) {
      const fim = new Date(a.data_fim_prevista + "T00:00:00")
      if (fim >= hoje && fim <= em15dias) {
        const dias = Math.ceil((fim.getTime() - hoje.getTime()) / 86400000)
        alertas.push({ tipo: "contrato_fim", assessorado: a, detalhe: `Contrato termina em ${dias} dia(s) — janela de renovação` })
      }
    }

    const realizadasOrdenadas = minhas.filter((s) => s.status === "realizada")
    if (realizadasOrdenadas.length >= 2 &&
      realizadasOrdenadas[0].tarefas_anteriores_cumpridas === "nao" &&
      realizadasOrdenadas[1].tarefas_anteriores_cumpridas === "nao") {
      alertas.push({ tipo: "tarefas", assessorado: a, detalhe: "Tarefas não cumpridas em 2 sessões seguidas" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/produtos-tiktok/assessoria/gestao" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-purple-500" />
          Dashboard da Assessoria
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DoorOpen className="h-4 w-4" />Vagas</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{ativos.length}<span className="text-lg text-muted-foreground">/7</span></p>
            <p className="text-xs text-muted-foreground mt-1">{Math.max(0, 7 - ativos.length)} vaga(s) disponível(is)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4" />Sessões esta semana</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{sessoesDaSemana.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Próximos 7 dias</p>
          </CardContent>
        </Card>
        <Card className={alertas.length > 0 ? "border-red-500/30" : ""}>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Alertas</CardTitle></CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${alertas.length > 0 ? "text-red-500" : ""}`}>{alertas.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Contas que precisam de atenção</p>
          </CardContent>
        </Card>
      </div>

      {alertas.length > 0 && (
        <Card className="border-red-500/30">
          <CardHeader><CardTitle className="text-base flex items-center gap-2 text-red-500"><AlertTriangle className="h-4 w-4" />Precisa de atenção</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {alertas.map((al, i) => (
              <Link key={i} href={`/produtos-tiktok/assessoria/gestao/${al.assessorado.id}`} className="block">
                <div className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{al.assessorado.nome}</p>
                    <p className="text-xs text-muted-foreground">{al.detalhe}</p>
                  </div>
                  <span className="text-lg shrink-0">{SAUDE_EMOJI[al.assessorado.saude_conta] ?? "🟢"}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Sessões da Semana</CardTitle></CardHeader>
        <CardContent className="space-y-2 p-4">
          {sessoesDaSemana.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma sessão agendada para os próximos 7 dias.</p>
          ) : (
            sessoesDaSemana.map(({ sessao, assessorado }) => {
              const dt = new Date(sessao.data_sessao)
              return (
                <Link key={sessao.id} href={`/produtos-tiktok/assessoria/gestao/${sessao.assessorado_id}`} className="block">
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-sm">
                    <span className="font-semibold text-purple-400 w-24 shrink-0">
                      {dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="flex-1 truncate">{assessorado?.nome ?? "—"}</span>
                  </div>
                </Link>
              )
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Semáforo Geral</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4">
          {assessorados.map((a) => (
            <Link key={a.id} href={`/produtos-tiktok/assessoria/gestao/${a.id}`}>
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg border hover:bg-muted/50 transition-colors text-sm">
                <span className="truncate">{a.nome}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs">{a.status}</Badge>
                  <span>{SAUDE_EMOJI[a.saude_conta] ?? "🟢"}</span>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
