import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, GraduationCap, User, Calendar, DollarSign, Store } from "lucide-react"
import type { Assessorado } from "@/lib/types"

const SAUDE_EMOJI: Record<string, string> = { verde: "🟢", amarelo: "🟡", vermelho: "🔴" }
const STATUS_LABEL: Record<string, string> = { ativo: "Ativo", pausado: "Pausado", encerrado: "Encerrado", renovado: "Renovado" }
const STATUS_CLASS: Record<string, string> = {
  ativo: "text-green-500 border-green-500/30 bg-green-500/5",
  pausado: "text-yellow-500 border-yellow-500/30 bg-yellow-500/5",
  encerrado: "text-muted-foreground border-border",
  renovado: "text-blue-400 border-blue-400/30 bg-blue-400/5",
}

export default async function AssessoriaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/dashboard")

  const { data: assessorados } = await supabase
    .from("assessorados")
    .select("*")
    .order("created_at", { ascending: false })

  const lista = (assessorados ?? []) as Assessorado[]
  const vagasOcupadas = lista.filter((a) => a.status !== "encerrado").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-purple-500" />
            Assessoria TikTok Shop
          </h1>
          <p className="text-muted-foreground">
            {lista.length} assessorado(s) cadastrado(s) · <span className="font-semibold text-foreground">{vagasOcupadas}/7 vagas ocupadas</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/assessoria/dashboard" className={buttonVariants({ variant: "outline" })}>Dashboard</Link>
          <Link href="/assessoria/agenda" className={buttonVariants({ variant: "outline" })}>Agenda</Link>
          <Link href="/assessoria/relatorio" className={buttonVariants({ variant: "outline" })}>Relatório</Link>
          <Link href="/assessoria/novo" className={buttonVariants()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Assessorado
          </Link>
        </div>
      </div>

      {lista.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <GraduationCap className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhum assessorado ainda.</p>
            <Link href="/assessoria/novo" className={buttonVariants({ variant: "outline" })}>
              Cadastrar primeiro assessorado
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lista.map((a) => (
            <Link key={a.id} href={`/assessoria/${a.id}`}>
              <Card className="hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold leading-tight truncate">{a.nome} <span className="ml-1">{SAUDE_EMOJI[a.saude_conta] ?? "🟢"}</span></p>
                        {a.loja ? (
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1"><Store className="h-3 w-3" />{a.loja}</p>
                        ) : a.email && <p className="text-xs text-muted-foreground truncate">{a.email}</p>}
                      </div>
                    </div>
                    {a.numero_vaga && (
                      <span className="text-xs font-semibold text-muted-foreground shrink-0">Vaga {a.numero_vaga}/7</span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Contratou em {new Date(a.data_contratacao + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                    </div>
                    {a.valor_assessoria && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>{a.valor_assessoria.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={STATUS_CLASS[a.status] ?? ""}>
                      {STATUS_LABEL[a.status] ?? a.status}
                    </Badge>
                    <Badge variant="outline" className="text-purple-400 border-purple-400/30 bg-purple-400/5">
                      Ver sessões
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
