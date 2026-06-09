import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, ChevronRight } from "lucide-react"

type Habilitacao = {
  id: string
  email: string
  nome_empresa: string | null
  status: string | null
  etapa_atual: number | null
  created_at: string
  termos_aceitos_at: string | null
}

const STATUS_COR: Record<string, string> = {
  enviado:    "bg-green-500/15 text-green-700 border-green-500/30",
  em_analise: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  aprovado:   "bg-green-500/15 text-green-700 border-green-500/30",
  reprovado:  "bg-red-500/15 text-red-600 border-red-500/30",
  pendente:   "bg-gray-500/10 text-gray-500 border-gray-400/20",
}

const STATUS_LABEL: Record<string, string> = {
  enviado: "Enviado", em_analise: "Em análise", aprovado: "Aprovado",
  reprovado: "Reprovado", pendente: "Pendente",
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export default async function HabilitacoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/hub")

  const admin = createAdminClient()
  const { data: habs } = await admin
    .from("habilitacoes")
    .select("id, email, nome_empresa, status, etapa_atual, created_at, termos_aceitos_at")
    .order("created_at", { ascending: false })

  const lista = (habs ?? []) as Habilitacao[]
  const totais = {
    total: lista.length,
    enviados: lista.filter(h => h.status === "enviado" || h.status === "aprovado").length,
    pendentes: lista.filter(h => !h.status || h.status === "pendente").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #EC4899, #8B5CF6)" }}>
          <ClipboardList className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Habilitações</h1>
          <p className="text-sm text-muted-foreground">Cadastros de clientes para TikTok Shop</p>
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total</p>
            <p className="text-3xl font-bold text-purple-600">{totais.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Enviados</p>
            <p className="text-3xl font-bold text-green-600">{totais.enviados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Pendentes</p>
            <p className="text-3xl font-bold text-yellow-600">{totais.pendentes}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          {/* Cabeçalho */}
          <div className="grid grid-cols-[1fr_140px_110px_100px_32px] gap-4 px-5 py-3 border-b">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cliente / Empresa</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progresso</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
            <span />
          </div>

          {lista.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ClipboardList size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Nenhuma habilitação registrada ainda.</p>
            </div>
          )}

          {lista.map((h, i) => {
            const statusKey = h.status ?? "pendente"
            const corBadge = STATUS_COR[statusKey] ?? STATUS_COR.pendente
            const labelBadge = STATUS_LABEL[statusKey] ?? "Pendente"
            const etapa = h.etapa_atual ?? 0
            return (
              <Link key={h.id} href={`/produtos-tiktok/habilitacoes/${h.id}`}
                className={`grid grid-cols-[1fr_140px_110px_100px_32px] gap-4 px-5 py-4 items-center hover:bg-accent transition-colors ${i < lista.length - 1 ? "border-b" : ""}`}>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {h.nome_empresa ?? <span className="text-muted-foreground italic text-xs">Empresa não preenchida</span>}
                  </p>
                  <p className="text-muted-foreground text-xs truncate">{h.email}</p>
                </div>
                <p className="text-muted-foreground text-sm">{fmt(h.created_at)}</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="h-1.5 flex-1 rounded-full"
                      style={{ background: etapa >= n ? "linear-gradient(90deg,#EC4899,#8B5CF6)" : "rgba(0,0,0,0.1)" }} />
                  ))}
                  <span className="text-muted-foreground text-xs ml-1">{etapa}/3</span>
                </div>
                <Badge variant="outline" className={`text-xs ${corBadge}`}>{labelBadge}</Badge>
                <ChevronRight size={15} className="text-muted-foreground" />
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
