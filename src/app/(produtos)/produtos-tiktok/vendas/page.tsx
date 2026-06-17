import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ShoppingCart, TrendingUp, DollarSign, RotateCcw,
  CheckCircle2, XCircle, CreditCard, Banknote, QrCode, HelpCircle, Info
} from "lucide-react"
import { DateFilter } from "./date-filter"

export const dynamic = "force-dynamic"

function toISO(d: Date) { return d.toISOString().split("T")[0] }

type Compra = {
  id: string
  kiwify_order_id: string | null
  valor: number | null
  valor_bruto: number | null
  valor_liquido: number | null
  taxa_gateway: number | null
  valor_afiliado: number | null
  imposto: number | null
  payment_method: string | null
  utm_source: string | null
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

function PaymentIcon({ method }: { method: string | null }) {
  if (!method) return <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
  const m = method.toLowerCase()
  if (m.includes("pix")) return <QrCode className="h-3.5 w-3.5 text-cyan-500" />
  if (m.includes("credit") || m.includes("card") || m.includes("cartao") || m.includes("cartão"))
    return <CreditCard className="h-3.5 w-3.5 text-blue-500" />
  if (m.includes("boleto")) return <Banknote className="h-3.5 w-3.5 text-yellow-600" />
  return <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
}

function paymentLabel(method: string | null): string {
  if (!method) return "Outros"
  const m = method.toLowerCase()
  if (m.includes("pix")) return "Pix"
  if (m.includes("credit") || m.includes("card") || m.includes("cartao") || m.includes("cartão")) return "Cartão"
  if (m.includes("boleto")) return "Boleto"
  return method
}

function Tooltip({ text }: { text: string }) {
  return (
    <span title={text} className="cursor-help">
      <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
    </span>
  )
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
    { count: totalCarrinhosHoje },
    { data: todayCompras },
  ] = await Promise.all([
    admin
      .from("compras_alunos")
      .select("id, kiwify_order_id, valor, valor_bruto, valor_liquido, taxa_gateway, valor_afiliado, imposto, payment_method, utm_source, status, data_compra, alunos(nome, email), produtos_tiktok(nome, tipo)")
      .gte("data_compra", sinceISO)
      .lte("data_compra", untilISO)
      .order("data_compra", { ascending: false }),

    admin
      .from("carrinhos_abandonados")
      .select("id, data_abandono, alunos(nome, email), produtos_tiktok(nome)")
      .gte("data_abandono", sinceISO)
      .lte("data_abandono", untilISO)
      .order("data_abandono", { ascending: false }),

    admin
      .from("carrinhos_abandonados")
      .select("id", { count: "exact", head: true })
      .gte("data_abandono", `${toISO(today)}T00:00:00`)
      .lte("data_abandono", `${toISO(today)}T23:59:59`),

    admin
      .from("compras_alunos")
      .select("id, valor, valor_liquido, status, payment_method")
      .gte("data_compra", `${toISO(today)}T00:00:00`)
      .lte("data_compra", `${toISO(today)}T23:59:59`),
  ])

  const comprasList = (compras ?? []) as unknown as Compra[]
  const carrinhosList = (carrinhos ?? []) as unknown as Carrinho[]

  // --- Métricas do período ---
  const ativas = comprasList.filter(c => c.status === "ativo")
  const reembolsadas = comprasList.filter(c => c.status === "reembolsado")
  const chargebacks = comprasList.filter(c => c.status === "chargeback")

  // Faturamento bruto = soma de valor_bruto ou valor de todas as compras (incluindo reembolsos)
  const fatBruto = ativas.reduce((s, c) => s + (c.valor_bruto ?? c.valor ?? 0), 0)
  // Faturamento líquido = bruto - gateway - afiliado - imposto
  const fatLiquido = ativas.reduce((s, c) => {
    if (c.valor_liquido != null) return s + c.valor_liquido
    // Fallback: bruto sem deduções
    return s + (c.valor_bruto ?? c.valor ?? 0)
  }, 0)
  const totalGateway = ativas.reduce((s, c) => s + (c.taxa_gateway ?? 0), 0)
  const totalAfiliado = ativas.reduce((s, c) => s + (c.valor_afiliado ?? 0), 0)
  const totalImposto = ativas.reduce((s, c) => s + (c.imposto ?? 0), 0)
  const valorReembolsos = reembolsadas.reduce((s, c) => s + (c.valor_bruto ?? c.valor ?? 0), 0)
  const valorChargebacks = chargebacks.reduce((s, c) => s + (c.valor_bruto ?? c.valor ?? 0), 0)

  const taxaAprovacao = comprasList.length > 0
    ? Math.round((ativas.length / comprasList.length) * 100) : 0
  const taxaReembolso = ativas.length > 0
    ? ((reembolsadas.length / ativas.length) * 100).toFixed(1) : "0.0"
  const taxaChargeback = ativas.length > 0
    ? ((chargebacks.length / ativas.length) * 100).toFixed(1) : "0.0"

  // --- Hoje ---
  const todayList = (todayCompras ?? []) as { id: string; valor: number | null; valor_liquido: number | null; status: string; payment_method: string | null }[]
  const vendasHoje = todayList.filter(c => c.status === "ativo").length
  const receitaHoje = todayList.filter(c => c.status === "ativo")
    .reduce((s, c) => s + (c.valor_liquido ?? c.valor ?? 0), 0)
  const carrinhosHoje = totalCarrinhosHoje ?? 0

  // --- Vendas por tipo de pagamento ---
  const porPagamento: Record<string, { label: string; qtd: number; receita: number }> = {}
  for (const c of ativas) {
    const key = paymentLabel(c.payment_method)
    if (!porPagamento[key]) porPagamento[key] = { label: key, qtd: 0, receita: 0 }
    porPagamento[key].qtd++
    porPagamento[key].receita += c.valor_liquido ?? c.valor ?? 0
  }
  // Aprovação por pagamento
  const totalPorPgto: Record<string, number> = {}
  for (const c of comprasList) {
    const key = paymentLabel(c.payment_method)
    totalPorPgto[key] = (totalPorPgto[key] ?? 0) + 1
  }

  // --- Vendas por fonte (utm_source) ---
  const porFonte: Record<string, { qtd: number; receita: number }> = {}
  for (const c of ativas) {
    const key = c.utm_source ?? "(direto)"
    if (!porFonte[key]) porFonte[key] = { qtd: 0, receita: 0 }
    porFonte[key].qtd++
    porFonte[key].receita += c.valor_liquido ?? c.valor ?? 0
  }

  // --- Vendas por produto ---
  const porProduto: Record<string, { nome: string; qtd: number; receita: number }> = {}
  for (const c of ativas) {
    const nome = c.produtos_tiktok?.nome ?? "Sem produto"
    if (!porProduto[nome]) porProduto[nome] = { nome, qtd: 0, receita: 0 }
    porProduto[nome].qtd++
    porProduto[nome].receita += c.valor_liquido ?? c.valor ?? 0
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

  const hasFinancialData = ativas.some(c => c.valor_liquido != null)

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

      {!hasFinancialData && ativas.length > 0 && (
        <div className="rounded-lg border border-yellow-400/40 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
          Dados de taxas e faturamento líquido aparecem apenas em vendas recebidas após a atualização do webhook. Vendas antigas mostram o valor bruto.
        </div>
      )}

      {/* HOJE */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Hoje — {toISO(today).split("-").reverse().join("/")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-green-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas hoje</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{vendasHoje}</div>
              <p className="text-xs text-muted-foreground mt-1">{fmt(receitaHoje)} líquido</p>
            </CardContent>
          </Card>
          <Card className="border-orange-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carrinhos hoje</CardTitle>
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
              <CardTitle className="text-sm font-medium">Conversão hoje</CardTitle>
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

      {/* FINANCEIRO DO PERÍODO */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Financeiro{!isToday && ` · ${periodLabel}`}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium">Fat. Bruto</CardTitle>
                <Tooltip text="Soma de todas as vendas aprovadas antes das deduções" />
              </div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmt(fatBruto)}</div>
              <p className="text-xs text-muted-foreground mt-1">{ativas.length} vendas aprovadas</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium">Fat. Líquido</CardTitle>
                <Tooltip text="Faturamento Bruto - Taxa gateway - Taxas - Imposto - Custo produto" />
              </div>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{fmt(fatLiquido)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {hasFinancialData ? `- ${fmt(fatBruto - fatLiquido)} em taxas` : "valor bruto (sem taxas ainda)"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium">Reembolsos</CardTitle>
                <Tooltip text={`Taxa de reembolso calculada sobre vendas aprovadas: ${taxaReembolso}%`} />
              </div>
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{fmt(valorReembolsos)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {reembolsadas.length} reembolsos ({taxaReembolso}%)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium">Chargeback</CardTitle>
                <Tooltip text={`Taxa de chargeback calculada sobre o faturamento: ${taxaChargeback}%`} />
              </div>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{fmt(valorChargebacks)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {chargebacks.length} chargebacks ({taxaChargeback}%)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Linha 2: taxas detalhadas + aprovação */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium">Taxa Gateway</CardTitle>
                <Tooltip text="Taxa cobrada pela Kiwify sobre as vendas" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{fmt(totalGateway)}</div>
              {hasFinancialData && fatBruto > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {((totalGateway / fatBruto) * 100).toFixed(1)}% do bruto
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium">Impostos</CardTitle>
                <Tooltip text="Imposto total sobre o faturamento" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{fmt(totalImposto)}</div>
              {hasFinancialData && fatBruto > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {((totalImposto / fatBruto) * 100).toFixed(1)}% do bruto
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium">Afiliados</CardTitle>
                <Tooltip text="Comissões pagas a afiliados e coprodutores" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{fmt(totalAfiliado)}</div>
              {hasFinancialData && fatBruto > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {((totalAfiliado / fatBruto) * 100).toFixed(1)}% do bruto
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
                <Tooltip text="Porcentagem de compras aprovadas sobre o total de tentativas" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-xl font-bold ${taxaAprovacao >= 80 ? "text-green-600" : taxaAprovacao >= 60 ? "text-yellow-600" : "text-red-500"}`}>
                {comprasList.length > 0 ? `${taxaAprovacao}%` : "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{ativas.length} de {comprasList.length} pedidos</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* VENDAS POR PAGAMENTO, FONTE E PRODUTO */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Tipo de pagamento */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-base">Vendas por Pagamento</CardTitle>
              <Tooltip text="Quantidade de vendas aprovadas por tipo de pagamento" />
            </div>
          </CardHeader>
          <CardContent>
            {Object.keys(porPagamento).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados no período.</p>
            ) : (
              <div className="space-y-3">
                {Object.values(porPagamento).sort((a, b) => b.qtd - a.qtd).map(p => {
                  const total = totalPorPgto[p.label] ?? p.qtd
                  const taxa = total > 0 ? Math.round((p.qtd / total) * 100) : 0
                  return (
                    <div key={p.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{p.label}</span>
                        <span className="text-muted-foreground text-xs">{p.qtd} vendas · {taxa}% aprv.</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${taxa}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{fmt(p.receita)}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vendas por fonte */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-base">Vendas por Fonte</CardTitle>
              <Tooltip text="Quantidade de vendas por utm_source" />
            </div>
          </CardHeader>
          <CardContent>
            {Object.keys(porFonte).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem utm_source nos dados.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(porFonte).sort((a, b) => b[1].qtd - a[1].qtd).map(([fonte, v]) => (
                  <div key={fonte} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{fonte}</p>
                      <p className="text-xs text-muted-foreground">{v.qtd} venda{v.qtd !== 1 ? "s" : ""}</p>
                    </div>
                    <span className="font-semibold text-sm">{fmt(v.receita)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
                  <span>{fmt(fatLiquido)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CARRINHOS ABANDONADOS */}
      <Card>
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
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Pgto.</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Fonte</th>
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
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">
                        {c.produtos_tiktok?.nome ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <PaymentIcon method={c.payment_method} />
                          <span className="text-xs text-muted-foreground hidden sm:inline">{paymentLabel(c.payment_method)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                        {c.utm_source ?? "—"}
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
                      <td className="px-4 py-3 text-right">
                        <div className="font-semibold text-sm">
                          {c.valor_liquido != null ? fmt(c.valor_liquido) : c.valor != null ? fmt(c.valor) : "—"}
                        </div>
                        {c.valor_liquido != null && c.valor_bruto != null && c.valor_bruto !== c.valor_liquido && (
                          <div className="text-xs text-muted-foreground">{fmt(c.valor_bruto)} bruto</div>
                        )}
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
