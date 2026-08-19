import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock } from "lucide-react"

const statusConfig: Record<string, { label: string; className: string }> = {
  agendada:  { label: "Agendada",  className: "bg-blue-500/10 text-blue-400 border-blue-400/30" },
  realizada: { label: "Realizada", className: "bg-green-500/10 text-green-400 border-green-400/30" },
  remarcada: { label: "Remarcada", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" },
  cancelada: { label: "Cancelada", className: "bg-red-500/10 text-red-400 border-red-400/30" },
  no_show:   { label: "Não compareceu", className: "bg-red-500/10 text-red-400 border-red-400/30" },
}

type SessaoComAssessorado = {
  id: string
  data_sessao: string
  duracao_minutos: number
  titulo: string
  tipo: string
  status: string
  assessorado_id: string
  assessorados: { nome: string } | null
}

export default async function AgendaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/produtos-tiktok/alunos")

  const hoje = new Date()
  const inicio30 = new Date(hoje); inicio30.setDate(inicio30.getDate() - 7)
  const fim30 = new Date(hoje); fim30.setDate(fim30.getDate() + 30)

  const { data } = await supabase
    .from("sessoes_assessoria")
    .select("id, data_sessao, duracao_minutos, titulo, tipo, status, assessorado_id, assessorados(nome)")
    .gte("data_sessao", inicio30.toISOString())
    .lte("data_sessao", fim30.toISOString())
    .order("data_sessao", { ascending: true })

  const lista = ((data ?? []) as unknown as SessaoComAssessorado[])

  const porDia = new Map<string, SessaoComAssessorado[]>()
  for (const s of lista) {
    const key = s.data_sessao.slice(0, 10)
    if (!porDia.has(key)) porDia.set(key, [])
    porDia.get(key)!.push(s)
  }
  const dias = Array.from(porDia.keys()).sort()
  const hojeISO = hoje.toISOString().slice(0, 10)

  return (
    <div className="dark bg-background text-foreground -m-6 min-h-[calc(100vh-3.5rem)] p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/produtos-tiktok/assessoria/gestao" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-purple-500" />
            Agenda de Sessões
          </h1>
          <p className="text-muted-foreground text-sm">Últimos 7 dias e próximos 30 dias</p>
        </div>
      </div>

      {dias.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">Nenhuma sessão nesse período.</CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {dias.map((dia) => {
            const isHoje = dia === hojeISO
            return (
              <div key={dia}>
                <h2 className={`text-sm font-semibold mb-2 ${isHoje ? "text-purple-500" : "text-muted-foreground"}`}>
                  {new Date(dia + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
                  {isHoje && " · Hoje"}
                </h2>
                <div className="space-y-2">
                  {porDia.get(dia)!.map((s) => {
                    const dt = new Date(s.data_sessao)
                    const cfg = statusConfig[s.status] ?? statusConfig.agendada
                    return (
                      <Link key={s.id} href={`/produtos-tiktok/assessoria/gestao/${s.assessorado_id}`}>
                        <Card className="hover:border-border/80 transition-colors">
                          <CardContent className="p-3.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="text-sm font-semibold text-purple-400 shrink-0 w-14">
                                {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">{s.assessorados?.nome ?? "—"}</p>
                                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                  <Clock className="h-3 w-3" />{s.duracao_minutos} min · {s.tipo === "grupo" ? "Grupo" : "Individual"}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className={`shrink-0 ${cfg.className}`}>{cfg.label}</Badge>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
