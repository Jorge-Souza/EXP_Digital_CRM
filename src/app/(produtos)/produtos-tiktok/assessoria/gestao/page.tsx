import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, GraduationCap, Calendar, DollarSign, Store, ArrowLeft } from "lucide-react"
import type { Assessorado } from "@/lib/types"

export const dynamic = "force-dynamic"

const SAUDE_LABEL: Record<string, string> = { verde: "Saudável", amarelo: "Atenção", vermelho: "Risco" }
const SAUDE_CLASS: Record<string, string> = {
  verde: "text-green-400 border-green-400/30 bg-green-400/10",
  amarelo: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  vermelho: "text-red-400 border-red-400/30 bg-red-400/10",
}
const STATUS_LABEL: Record<string, string> = { ativo: "Ativo", pausado: "Pausado", encerrado: "Encerrado", renovado: "Renovado" }
const STATUS_CLASS: Record<string, string> = {
  ativo: "text-green-400 border-green-400/30 bg-green-400/10",
  pausado: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  encerrado: "text-white/40 border-white/15",
  renovado: "text-blue-400 border-blue-400/30 bg-blue-400/10",
}

function iniciais(nome: string) {
  return nome.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

export default async function AssessoriaGestaoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/produtos-tiktok/alunos")

  const { data: assessorados } = await supabase
    .from("assessorados")
    .select("*")
    .order("created_at", { ascending: false })

  const lista = (assessorados ?? []) as Assessorado[]
  const vagasOcupadas = lista.filter((a) => a.status !== "encerrado").length
  const vagasPct = Math.min(100, Math.round((vagasOcupadas / 7) * 100))

  return (
    <div className="dark bg-background text-foreground -m-6 min-h-[calc(100vh-3.5rem)] p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-3">
          <Link href="/produtos-tiktok/assessoria" className="text-xs text-white/40 hover:text-white/70 inline-flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Jornada por loja
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
              <GraduationCap className="h-6 w-6 text-purple-400" />
              Gestão de Assessorados
            </h1>
            <p className="text-sm text-white/40 mt-1">{lista.length} assessorado(s) cadastrado(s)</p>
          </div>
          <div className="flex items-center gap-3 max-w-xs">
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-purple-500" style={{ width: `${vagasPct}%` }} />
            </div>
            <span className="text-xs font-semibold text-white/70 shrink-0">{vagasOcupadas}/7 vagas</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/produtos-tiktok/assessoria/gestao/dashboard" className={buttonVariants({ variant: "outline" })}>Dashboard</Link>
          <Link href="/produtos-tiktok/assessoria/gestao/agenda" className={buttonVariants({ variant: "outline" })}>Agenda</Link>
          <Link href="/produtos-tiktok/assessoria/gestao/relatorio" className={buttonVariants({ variant: "outline" })}>Relatório</Link>
          <Link href="/produtos-tiktok/assessoria/gestao/novo" className={buttonVariants()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Assessorado
          </Link>
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] flex flex-col items-center justify-center py-16 text-center gap-3">
          <GraduationCap className="h-12 w-12 text-white/15" />
          <p className="text-white/40">Nenhum assessorado ainda.</p>
          <Link href="/produtos-tiktok/assessoria/gestao/novo" className={buttonVariants({ variant: "outline" })}>
            Cadastrar primeiro assessorado
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lista.map((a) => (
            <Link key={a.id} href={`/produtos-tiktok/assessoria/gestao/${a.id}`}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 space-y-4 h-full transition-all hover:border-purple-400/40 hover:bg-white/[0.05]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #A855F7, #7C3AED)" }}>
                      {iniciais(a.nome)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight truncate text-white">{a.nome}</p>
                      {a.loja ? (
                        <p className="text-xs text-white/40 truncate flex items-center gap-1"><Store className="h-3 w-3" />{a.loja}</p>
                      ) : a.email && <p className="text-xs text-white/40 truncate">{a.email}</p>}
                    </div>
                  </div>
                  {a.numero_vaga && (
                    <span className="text-xs font-semibold text-white/40 shrink-0">Vaga {a.numero_vaga}/7</span>
                  )}
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-white/40">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Contratou em {new Date(a.data_contratacao + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                  </div>
                  {a.valor_assessoria && (
                    <div className="flex items-center gap-2 text-white/40">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>{a.valor_assessoria.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={STATUS_CLASS[a.status] ?? ""}>
                    {STATUS_LABEL[a.status] ?? a.status}
                  </Badge>
                  <Badge variant="outline" className={SAUDE_CLASS[a.saude_conta] ?? ""}>
                    {SAUDE_LABEL[a.saude_conta] ?? a.saude_conta}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
