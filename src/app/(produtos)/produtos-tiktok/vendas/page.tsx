import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, TrendingUp, DollarSign, AlertTriangle, RotateCcw, CheckCircle2, XCircle } from "lucide-react"
import { DateFilter } from "./date-filter"

export const dynamic = "force-dynamic"

function toISO(d: Date) { return d.toISOString().split("T")[0] }

type Compra = {
  id: string
  kiwify_order_id: string | null
  valor: number | null
  status: string
  data_compra: string
  alunos: { nome: string; email: string } | null
  produtos_tiktok: { nome: string; tipo: string } | null
}

type Carrinho = {
  id: string
  data_abandono: string
  alunos: { nome: string; email: string } | null
  produtos_tiktok: { nome: string } | null
}

export default async function VendasPage({
  searchParams,
}: {
  searchParams: Promise<{ since?: string; until?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/hub")

  const params = await searchParams
  const today = new Date()
  const since = params.since ?? toISO(today)
  const until = params.until ?? toISO(today)

  const sinceISO = `${since}T00:00:00`
  const untilISO = `${until}T23:59:59`

  const admin = createAdminClient()

  const [
    { data: compras },
    { data: carrinhos },
    { data: todayCarrinhos, count: totalCarrinhosHoje },
    { data: todayCompras },
  ] = await Promise.all([
    admin
      .from("compras_alunos")
      .select("id, kiwify_order_id, valor, status, data_compra, alunos(nome, email), produtos_tiktok(nome, tipo)")
      .gte("data_compra", sinceISO)
      .lte("data_compra", untilISO)
      .order("data_compra", { ascending: false }),

    admin
      .from("carrinhos_abandonados")
      .select("id, data_abandono, alunos(nome, email), produtos_tiktok(nome)")
      .gte("data_abandono", sinceISO)
      .lte("data_abandono", untilISO)
      .order("data_abandono", { ascending: false }),

    // Carrinhos de HOJE sempre (para o número diário)
    admin
      .from("carrinhos_abandonados")
      .select("id", { count: "exact" })
      .gte("data_abandono", `${toISO(today)}T00:00:00`)
      .lte("data_abandono", `${toISO(today)}T23:59:59`),

    // Vendas de HOJE sempre
    admin
      .from("compras_alunos")
      .select("id, valor, status")
      .gte("data_compra", `${toISO(today)}T00:00:00`)
      .lte("data_compra", `${toISO(today)}T23:59:59`),
  ])

  const comprasList = (compras ?? []) as unknown as Compra[]
  const carrinhosList = (carrinhos ?? []) as unknown as Carrinho[]

  // Métricas do período
  const ativas = comprasList.filter(c => c.status === "ativo")
  const reembolsadas = comprasList.filter(c => c.status === "reembolsado")
  const chargebacks = comprasList.filter(c => c.status === "chargeback")

  const receitaBruta = comprasList.reduce((s, c) => s + (c.valor ?? 0), 0)
  const receitaLiquida = ativas.reduce((s, c) => s + (c.valor ?? 0), 0)
  const valorReembolsos = reembolsadas.reduce((s, c) => s + (c.valor ?? 0), 0)

  const taxaAprovacao = comprasList.length > 0
    ? Math.round((ativas.length / comprasList.length) * 100)
    : 0
  const taxaReembolso = comprasList.length > 0
    ? ((reembolsadas.length / comprasList.length) * 100).toFixed(1)
    : "0.0"

  // Vendas hoje (independente do filtro)
  const todayList = (todayCompras ?? []) as { id: string; valor: number | null; status: string }[]
  const vendasHoje = todayList.filter(c => c.status === "ativo").length
  const receitaHoje = todayList.filter(c => c.status === "ativo").reduce((s, c) => s + (c.valor ?? 0), 0)
  const carrinhosHoje = totalCarrinhosHoje ?? 0

  // Agrupamento por produto
  const porProduto: Record<string, { nome: string; qtd: number; receita: number }> = {}
  for (const c of ativas) {
    const nome = c.produtos_tiktok?.nome ?? "Sem produto"
    if (!porProduto[nome]) porProduto[nome] = { nome, qtd: 0, receita: 0 }
    porProduto[nome].qtd++
    porProduto[nome].receita += c.valor ?? 0
  }

  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  const fmtDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
  }

  const isToday = since === until && since === toISO(today)
  const periodLabel = since === until
    ? since.split("-").reverse().join("/")
    : `${since.split("-").reverse().join("/")} → ${until.split("-").reverse().join("/")}`

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Vendas & Carrinhos</h1>
            <p className="text-sm text-muted-foreground">Kiwify via webhook · {periodLabel}</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-500/15 text-green-600 border border-green-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Ao vivo
          </span>
        </div>
        <DateFilter since={since} until={until} />
      </div>

      {/* HOJE — sempre visível */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hoje — {toISO(today).split("-").reverse().join("/")}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-green-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas hoje</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{vendasHoje}</div>
              <p className="text-xs text-muted-foreground mt-1">{fmt(receitaHoje)} de receita</p>
            </CardContent>
          </Card>
          <Card className="border-orange-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carrinhos abandonados hoje</CardTitle>
              <ShoppingCart className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">{carrinhosHoje}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {vendasHoje + carrinhosHoje > 0
                  ? `${Math.round((carrinhosHoje / (vendasHoje + carrinhosHoje)) * 100)}% das tentativas`
                  : "sem dados ainda"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de conversão hoje</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {vendasHoje + carrinhosHoje > 0
                  ? `${Math.round((vendasHoje / (vendasHoje + carrinhosHoje)) * 100)}%`
                  : "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">vendas / (vendas + carrinhos)</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MÉTRICAS DO PERÍODO */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Período selecionado{!isToday && ` · ${periodLabel}`}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento Líquido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmt(receitaLiquida)}</div>
              <p className="text-xs text-muted-foreground mt-1">{ativas.length} vendas aprovadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carrinhos Abandonados</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{carrinhosList.length}</div>
              <p className="text-xs text-muted-foreground mt-1">no período selecionado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reembolsos</CardTitle>
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{fmt(valorReembolsos)}</div>
              <p className="text-xs text-muted-foreground mt-1">{reembolsadas.length} reembolsos · {chargebacks.length} chargebacks</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${taxaAprovacao >= 80 ? "text-green-600" : taxaAprovacao >= 60 ? "text-yellow-600" : "text-red-500"}`}>
                {comprasList.length > 0 ? `${taxaAprovacao}%` : "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Reembolso: {taxaReembolso}%</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Vendas por produto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vendas por Produto</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(porProduto).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma venda no período.</p>
            ) : (
              <div className="space-y-3">
                {Object.values(porProduto).sort((a, b) => b.receita - a.receita).map(p => (
                  <div key={p.nome} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{p.nome}</p>
                      <p className="text-xs text-muted-foreground">{p.qtd} venda{p.qtd !== 1 ? "s" : ""}</p>
                    </div>
                    <span className="font-semibold">{fmt(p.receita)}</span>
                  </div>
                ))}
                <div className="border-t pt-3 flex items-center justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span>{fmt(receitaLiquida)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimos carrinhos abandonados */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Carrinhos Abandonados</CardTitle>
              {carrinhosHoje > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 border border-orange-500/30">
                  {carrinhosHoje} hoje
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {carrinhosList.length === 0 ? (
              <p className="text-sm text-muted-foreground px-6 pb-6">Nenhum carrinho abandonado no período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-y">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">Lead</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Produto</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {carrinhosList.slice(0, 20).map(c => (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium">{c.alunos?.nome ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">{c.alunos?.email ?? "—"}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {c.produtos_tiktok?.nome ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                          {fmtDate(c.data_abandono)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {carrinhosList.length > 20 && (
                  <p className="text-xs text-muted-foreground text-center py-3">
                    Mostrando 20 de {carrinhosList.length}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* HISTÓRICO DE VENDAS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de Vendas — {periodLabel}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {comprasList.length === 0 ? (
            <p className="text-sm text-muted-foreground px-6 pb-6">Nenhuma venda no período.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-y">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Aluno</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Produto</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Data</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {comprasList.slice(0, 100).map(c => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{c.alunos?.nome ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{c.alunos?.email ?? "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {c.produtos_tiktok?.nome ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {c.status === "ativo" && (
                          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                            <CheckCircle2 className="h-3 w-3" /> Aprovada
                          </span>
                        )}
                        {c.status === "reembolsado" && (
                          <span className="flex items-center gap-1 text-xs font-medium text-yellow-600">
                            <RotateCcw className="h-3 w-3" /> Reembolso
                          </span>
                        )}
                        {c.status === "chargeback" && (
                          <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                            <XCircle className="h-3 w-3" /> Chargeback
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell whitespace-nowrap">
                        {fmtDate(c.data_compra)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {c.valor != null ? fmt(c.valor) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {comprasList.length > 100 && (
                <p className="text-xs text-muted-foreground text-center py-3">
                  Mostrando 100 de {comprasList.length} vendas
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
