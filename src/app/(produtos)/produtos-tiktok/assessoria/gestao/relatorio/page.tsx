import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FileBarChart } from "lucide-react"
import type { Assessorado, SessaoAssessoria } from "@/lib/types"
import { RelatorioTable, type LinhaRelatorio } from "./relatorio-table"

function estagioAtual(a: Assessorado): string {
  if (a.status_expansao !== "nao_iniciado") return "Expansão"
  if (a.status_exposicao !== "nao_iniciado") return "Exposição"
  if (a.status_estrutura !== "nao_iniciado") return "Estrutura"
  return "Não iniciado"
}

export default async function RelatorioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/produtos-tiktok/alunos")

  const [{ data: assessoradosRaw }, { data: sessoesRaw }] = await Promise.all([
    supabase.from("assessorados").select("*").order("nome"),
    supabase.from("sessoes_assessoria").select("*").order("data_sessao", { ascending: true }),
  ])

  const assessorados = (assessoradosRaw ?? []) as Assessorado[]
  const sessoes = (sessoesRaw ?? []) as SessaoAssessoria[]
  const hoje = new Date()

  const linhas: LinhaRelatorio[] = assessorados.map((a) => {
    const minhas = sessoes.filter((s) => s.assessorado_id === a.id)
    const realizadas = minhas.filter((s) => s.status === "realizada")
    const futuras = minhas.filter((s) => (s.status === "agendada" || s.status === "remarcada") && new Date(s.data_sessao) >= hoje)
    const ultima = realizadas.length ? realizadas[realizadas.length - 1] : null
    const proxima = futuras.length ? futuras[0] : null
    const diasFim = a.data_fim_prevista
      ? Math.ceil((new Date(a.data_fim_prevista + "T00:00:00").getTime() - hoje.getTime()) / 86400000)
      : null

    return {
      id: a.id,
      nome: a.nome,
      loja: a.loja,
      status: a.status,
      estagio: estagioAtual(a),
      saude: a.saude_conta,
      gmv: a.gmv_atual,
      ultimaSessao: ultima?.data_sessao ?? null,
      proximaSessao: proxima?.data_sessao ?? null,
      diasFim,
      totalSessoes: realizadas.length,
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/produtos-tiktok/assessoria" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileBarChart className="h-6 w-6 text-purple-500" />
          Relatório Geral
        </h1>
      </div>

      <RelatorioTable linhas={linhas} />
    </div>
  )
}
