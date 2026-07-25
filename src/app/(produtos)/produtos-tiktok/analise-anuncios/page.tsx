import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Target, DollarSign, ShoppingCart, BarChart2 } from "lucide-react"
import { DateFilter } from "./date-filter"

export const dynamic = "force-dynamic"

const AD_ACCOUNT_ID = "623539261669603"
const TICKET = 67

function toISO(d: Date) { return d.toISOString().split("T")[0] }

interface Action { action_type: string; value: string }

interface AdInsight {
  ad_id: string
  ad_name: string
  spend: string
  impressions: string
  purchase_roas?: { action_type: string; value: string }[]
  actions?: Action[]
  video_p25_watched_actions?: Action[]
  video_p95_watched_actions?: Action[]
}

interface CampaignInsight {
  campaign_id: string
  campaign_name: string
  spend: string
  impressions: string
  actions?: Action[]
  purchase_roas?: { action_type: string; value: string }[]
}

async function fetchMetaAds(token: string, since: string, until: string): Promise<{ campaigns: CampaignInsight[]; ads: AdInsight[]; error?: string } | null> {
  const timeRange = encodeURIComponent(JSON.stringify({ since, until }))
  const base = `https://graph.facebook.com/v21.0/act_${AD_ACCOUNT_ID}/insights`

  const [campRes, adRes] = await Promise.all([
    fetch(`${base}?level=campaign&fields=campaign_id,campaign_name,spend,impressions,actions,purchase_roas&time_range=${timeRange}&sort=spend_descending&access_token=${token}`, { cache: "no-store" }),
    fetch(`${base}?level=ad&fields=ad_id,ad_name,spend,impressions,actions,purchase_roas,video_p25_watched_actions,video_p95_watched_actions&time_range=${timeRange}&sort=spend_descending&limit=50&access_token=${token}`, { cache: "no-store" }),
  ])

  const [campJson, adJson] = await Promise.all([campRes.json(), adRes.json()])
  if (campJson.error || adJson.error) {
    return { campaigns: [], ads: [], error: campJson.error?.message ?? adJson.error?.message }
  }
  return { campaigns: campJson.data ?? [], ads: adJson.data ?? [] }
}

function getAction(actions: Action[] | undefined, type: string): number {
  return parseFloat(actions?.find(a => a.action_type === type)?.value ?? "0") || 0
}

function pn(v: string | undefined) { return parseFloat(v?.replace(",", ".") ?? "0") || 0 }

const GANCHO_META = 10
const CTA_META = 20
const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
const fmtPct = (n: number) => `${n.toFixed(1)}%`

type CompraKiwify = {
  valor: number | null
  valor_bruto: number | null
  valor_liquido: number | null
  status: string
  utm_campaign: string | null
  utm_source: string | null
}

export default async function AnaliseAnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{ since?: string; until?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/produtos-tiktok/alunos")

  const params = await searchParams
  const today = new Date()
  const since = params.since ?? toISO(today)
  const until = params.until ?? toISO(today)
  const periodLabel = since === until
    ? since.split("-").reverse().join("/")
    : `${since.split("-").reverse().join("/")} → ${until.split("-").reverse().join("/")}`

  const token = process.env.FACEBOOK_ACCESS_TOKEN

  if (!token) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Análise de Anúncios</h1>
        <Card className="border-yellow-500/30 bg-yellow-500/10">
          <CardContent className="pt-6">
            <p className="font-semibold text-yellow-600 mb-1">Token Meta Ads não configurado</p>
            <p className="text-sm text-muted-foreground">
              Adicione <code className="bg-muted px-1 py-0.5 rounded text-xs">FACEBOOK_ACCESS_TOKEN</code> nas
              Environment Variables do Vercel e faça um novo deploy.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const data = await fetchMetaAds(token, since, until)

  if (!data || data.error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Análise de Anúncios</h1>
        <DateFilter since={since} until={until} />
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="pt-6">
            <p className="font-semibold text-red-500 mb-1">Erro ao buscar dados do Meta Ads</p>
            <p className="text-sm text-muted-foreground">{data?.error ?? "Token inválido ou sem permissão ads_read."}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Meta Ads: soma todas as campanhas com gasto no período (antes só usava a de maior gasto)
  const campanhas = data.campaigns.filter(c => pn(c.spend) > 0)
  const spend = campanhas.reduce((s, c) => s + pn(c.spend), 0)
  const vendas = campanhas.reduce((s, c) => s + getAction(c.actions, "offsite_conversion.fb_pixel_purchase"), 0)
  const lpv = campanhas.reduce((s, c) => s + getAction(c.actions, "landing_page_view"), 0)
  const fc = campanhas.reduce((s, c) => s + getAction(c.actions, "initiate_checkout"), 0)

  const cpr = vendas > 0 ? spend / vendas : 0
  const cplv = lpv > 0 ? spend / lpv : 0
  const cpfc = fc > 0 ? spend / fc : 0
  const roas = spend > 0 ? (vendas * TICKET) / spend : 0

  const metaCplv = TICKET * 0.04
  const metaCpfc = TICKET * 0.23
  const metaCpr = TICKET * 0.45

  const ads = data.ads
    .filter(a => pn(a.spend) > 1)
    .map(a => {
      const spent = pn(a.spend)
      const imp = pn(a.impressions)
      const p25 = pn(a.video_p25_watched_actions?.[0]?.value)
      const p95 = pn(a.video_p95_watched_actions?.[0]?.value)
      const purchases = getAction(a.actions, "offsite_conversion.fb_pixel_purchase")
      const cprAd = purchases > 0 ? spent / purchases : 0
      const roasRaw = a.purchase_roas?.find(r => r.action_type === "offsite_conversion.fb_pixel_purchase")
      const roasAd = roasRaw ? parseFloat(roasRaw.value) : 0
      const gancho = imp > 0 ? (p25 / imp) * 100 : 0
      const ctaPct = p25 > 0 ? (p95 / p25) * 100 : 0

      let diagLabel = "Pausar"
      let diagCls = "bg-red-500/15 text-red-600 border-red-500/30"
      if (gancho >= GANCHO_META && ctaPct >= CTA_META) { diagLabel = "Escalar"; diagCls = "bg-green-500/15 text-green-600 border-green-500/30" }
      else if (roasAd < 0.9 && roasAd > 0) { diagLabel = "Matar"; diagCls = "bg-red-500/15 text-red-600 border-red-500/30" }
      else if (gancho >= GANCHO_META) { diagLabel = "Reforçar CTA"; diagCls = "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" }
      else if (ctaPct >= CTA_META) { diagLabel = "Melhor Gancho"; diagCls = "bg-blue-500/15 text-blue-600 border-blue-500/30" }
      else if (roasAd >= 1.5) { diagLabel = "Testar"; diagCls = "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" }

      return { ...a, spent, imp, p25, p95, purchases, cprAd, roasAd, gancho, ctaPct, diagLabel, diagCls }
    })
    .sort((a, b) => b.spent - a.spent)

  const bestAd = ads.length > 0 ? ads.reduce((a, b) => b.roasAd > a.roasAd ? b : a, ads[0]) : null

  // Kiwify (real): vendas confirmadas e pagas, direto do banco
  const admin = createAdminClient()
  const sinceISO = `${since}T00:00:00`
  const untilISO = `${until}T23:59:59`
  const { data: comprasKiwifyRaw } = await admin
    .from("compras_alunos")
    .select("valor, valor_bruto, valor_liquido, status, utm_campaign, utm_source")
    .gte("data_compra", sinceISO)
    .lte("data_compra", untilISO)

  const comprasAtivas = ((comprasKiwifyRaw ?? []) as CompraKiwify[]).filter(c => c.status === "ativo")
  const kiwifyVendas = comprasAtivas.length
  const kiwifyBruto = comprasAtivas.reduce((s, c) => s + (c.valor_bruto ?? c.valor ?? 0), 0)
  const kiwifyLiquido = comprasAtivas.reduce((s, c) => s + (c.valor_liquido ?? c.valor_bruto ?? c.valor ?? 0), 0)
  const kiwifyTicketMedio = kiwifyVendas > 0 ? kiwifyLiquido / kiwifyVendas : 0
  const kiwifyRoas = spend > 0 ? kiwifyLiquido / spend : 0

  const porCampanhaKiwify: Record<string, { vendas: number; bruto: number; liquido: number }> = {}
  for (const c of comprasAtivas) {
    const key = c.utm_campaign || "(sem utm_campaign)"
    if (!porCampanhaKiwify[key]) porCampanhaKiwify[key] = { vendas: 0, bruto: 0, liquido: 0 }
    porCampanhaKiwify[key].vendas++
    porCampanhaKiwify[key].bruto += c.valor_bruto ?? c.valor ?? 0
    porCampanhaKiwify[key].liquido += c.valor_liquido ?? c.valor_bruto ?? c.valor ?? 0
  }

  const porFonteKiwify: Record<string, { vendas: number; liquido: number }> = {}
  for (const c of comprasAtivas) {
    const key = c.utm_source || "(direto)"
    if (!porFonteKiwify[key]) porFonteKiwify[key] = { vendas: 0, liquido: 0 }
    porFonteKiwify[key].vendas++
    porFonteKiwify[key].liquido += c.valor_liquido ?? c.valor_bruto ?? c.valor ?? 0
  }

  // Consolidado: cruza campanha do Meta com utm_campaign da Kiwify
  const nomesMeta = new Set(campanhas.map(c => c.campaign_name))
  const nomesKiwify = new Set(Object.keys(porCampanhaKiwify))
  const todosNomes = Array.from(new Set([...nomesMeta, ...nomesKiwify]))

  const consolidado = todosNomes.map(nome => {
    const meta = campanhas.find(c => c.campaign_name === nome)
    const metaSpend = meta ? pn(meta.spend) : 0
    const metaVendas = meta ? getAction(meta.actions, "offsite_conversion.fb_pixel_purchase") : 0
    const metaRoasRaw = meta?.purchase_roas?.find(r => r.action_type === "offsite_conversion.fb_pixel_purchase")
    const metaRoas = metaRoasRaw ? parseFloat(metaRoasRaw.value) : null
    const kiwify = porCampanhaKiwify[nome]
    const kiwifyVendasN = kiwify?.vendas ?? 0
    const kiwifyLiquidoN = kiwify?.liquido ?? 0
    const roasReal = metaSpend > 0 ? kiwifyLiquidoN / metaSpend : null
    const semMeta = !meta
    const semKiwify = !kiwify

    let badge = { label: "OK", cls: "bg-green-500/15 text-green-600 border-green-500/30" }
    if (semMeta) badge = { label: "Sem campanha Meta ativa", cls: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" }
    else if (metaVendas > 0 && kiwifyVendasN === 0) badge = { label: "Meta reporta venda, Kiwify não confirma", cls: "bg-red-500/15 text-red-600 border-red-500/30" }
    else if (metaVendas === 0 && kiwifyVendasN > 0) badge = { label: "Kiwify vendeu, Meta não capturou", cls: "bg-blue-500/15 text-blue-600 border-blue-500/30" }

    return { nome, metaSpend, metaVendas, metaRoas, kiwifyVendasN, kiwifyLiquidoN, roasReal, semMeta, semKiwify, badge }
  }).sort((a, b) => b.metaSpend - a.metaSpend)

  function FunilCard({ label, meta, real, metaLbl, icon: Icon, sem }: {
    label: string; meta: number; real: number; metaLbl: string; icon: React.ElementType; sem: boolean
  }) {
    const acima = !sem && real > meta
    const pct = !sem && meta > 0 ? Math.round(((real - meta) / meta) * 100) : 0
    return (
      <Card className={acima ? "border-red-500/30" : "border-green-500/30"}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${acima ? "text-red-500" : "text-green-600"}`}>
            {sem ? "—" : fmt(real)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Meta ({metaLbl}): {fmt(meta)}
          </p>
          {!sem && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${acima ? "text-red-500" : "text-green-600"}`}>
              {acima ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {acima ? `+${pct}% acima da meta` : `${Math.abs(pct)}% abaixo da meta`}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  function BarPct({ pct, meta }: { pct: number; meta: number }) {
    const ratio = Math.min((pct / meta) * 100, 100)
    const color = pct >= meta ? "bg-green-500" : pct >= meta * 0.85 ? "bg-yellow-500" : "bg-red-500"
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${ratio}%` }} />
        </div>
        <span className={`text-xs font-medium ${pct >= meta ? "text-green-600" : pct >= meta * 0.85 ? "text-yellow-600" : "text-red-500"}`}>
          {fmtPct(pct)}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Análise de Anúncios</h1>
            <p className="text-sm text-muted-foreground">
              CA EXP D BKP · Meta Ads + Kiwify · {periodLabel}
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-500/15 text-green-600 border border-green-500/30">
            Dados ao vivo
          </span>
        </div>
        <DateFilter since={since} until={until} />
      </div>

      <Tabs defaultValue="meta">
        <TabsList>
          <TabsTrigger value="meta">Meta Ads</TabsTrigger>
          <TabsTrigger value="kiwify">Kiwify (real)</TabsTrigger>
          <TabsTrigger value="consolidado">Consolidado</TabsTrigger>
        </TabsList>

        {/* ABA META ADS */}
        <TabsContent value="meta" className="space-y-6 pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROAS (pixel)</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${roas >= 2.22 ? "text-green-600" : "text-red-500"}`}>
                  {roas.toFixed(2)}x
                </div>
                <p className="text-xs text-muted-foreground mt-1">Mínimo breakeven: 2,22x</p>
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${roas >= 2.22 ? "text-green-600" : "text-red-500"}`}>
                  {roas >= 2.22 ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                  {roas >= 2.22 ? "Lucrativo" : "Abaixo do breakeven"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vendas (pixel)</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vendas}</div>
                <p className="text-xs text-muted-foreground mt-1">compras no período, todas as campanhas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investido</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fmt(spend)}</div>
                <p className="text-xs text-muted-foreground mt-1">Meta Ads no período</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Custo por Venda</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${cpr > metaCpr ? "text-red-500" : "text-green-600"}`}>
                  {cpr > 0 ? fmt(cpr) : "—"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Meta: {fmt(metaCpr)}</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-3">Diagnóstico do Funil</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <FunilCard label="Custo por View Página" meta={metaCplv} real={cplv} metaLbl="4% ticket" icon={TrendingUp} sem={lpv === 0} />
              <FunilCard label="Custo por Finalização" meta={metaCpfc} real={cpfc} metaLbl="23% ticket" icon={TrendingUp} sem={fc === 0} />
              <FunilCard label="Custo por Venda" meta={metaCpr} real={cpr} metaLbl="45% ticket" icon={TrendingUp} sem={vendas === 0} />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Criativos — Retenção 25%
                <span className="ml-1 text-sm font-normal text-muted-foreground">(meta ≥{GANCHO_META}%)</span>
                {" "}vs Engajamento 95%
                <span className="ml-1 text-sm font-normal text-muted-foreground">(meta ≥{CTA_META}%)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-y">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Anúncio</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Gasto</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Impressões</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Ret 25%</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Eng 95%</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">CPR</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">ROAS</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Diagnóstico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ads.map((ad) => {
                      const isTop = bestAd && ad.ad_id === bestAd.ad_id
                      return (
                        <tr key={ad.ad_id} className={`hover:bg-muted/30 transition-colors ${isTop ? "bg-green-500/5" : ""}`}>
                          <td className="px-4 py-3">
                            <div className="font-medium max-w-[200px] truncate">
                              {isTop && <span className="text-green-600 mr-1">★</span>}
                              {ad.ad_name.replace(/^AD\d+\s*[-–]\s*/i, "").slice(0, 40)}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium">{fmt(ad.spent)}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{ad.imp.toLocaleString("pt-BR")}</td>
                          <td className="px-4 py-3"><BarPct pct={ad.gancho} meta={GANCHO_META} /></td>
                          <td className="px-4 py-3"><BarPct pct={ad.ctaPct} meta={CTA_META} /></td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className={ad.cprAd > metaCpr ? "text-red-500 font-medium" : "text-green-600 font-medium"}>
                              {ad.cprAd > 0 ? fmt(ad.cprAd) : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className={`font-medium ${ad.roasAd >= 2.22 ? "text-green-600" : ad.roasAd >= 1.5 ? "text-yellow-600" : "text-red-500"}`}>
                              {ad.roasAd > 0 ? `${ad.roasAd.toFixed(2)}x` : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ad.diagCls}`}>
                              {ad.diagLabel}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    {ads.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Nenhum anúncio encontrado no período</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardContent className="pt-6">
              <p className="text-sm font-semibold text-orange-600 mb-2">Conclusão do Período</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">{ads.length} criativos analisados</strong> · {fmt(spend)} investidos · {vendas} vendas (pixel) · ROAS {roas.toFixed(2)}x.{" "}
                {bestAd && <>Melhor criativo: <strong className="text-foreground">{bestAd.ad_name.slice(0, 45)}</strong> com ROAS {bestAd.roasAd.toFixed(2)}x. </>}
                {roas < 2.22 && "Sem corrigir criativos e página de vendas, escalar só amplifica o prejuízo."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA KIWIFY (REAL) */}
        <TabsContent value="kiwify" className="space-y-6 pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vendas reais</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kiwifyVendas}</div>
                <p className="text-xs text-muted-foreground mt-1">pagas e confirmadas na Kiwify</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Bruta</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fmt(kiwifyBruto)}</div>
              </CardContent>
            </Card>
            <Card className="border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Líquida</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{fmt(kiwifyLiquido)}</div>
                <p className="text-xs text-muted-foreground mt-1">ticket médio {fmt(kiwifyTicketMedio)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROAS real</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${kiwifyRoas >= 2.22 ? "text-green-600" : "text-red-500"}`}>
                  {spend > 0 ? `${kiwifyRoas.toFixed(2)}x` : "—"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">receita líquida Kiwify / gasto Meta</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vendas por Campanha (utm_campaign)</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(porCampanhaKiwify).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma venda no período.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(porCampanhaKiwify).sort((a, b) => b[1].liquido - a[1].liquido).map(([nome, v]) => (
                      <div key={nome} className="flex items-center justify-between text-sm gap-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{nome}</p>
                          <p className="text-xs text-muted-foreground">{v.vendas} venda{v.vendas !== 1 ? "s" : ""}</p>
                        </div>
                        <span className="font-semibold text-sm whitespace-nowrap">{fmt(v.liquido)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vendas por Fonte (utm_source)</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(porFonteKiwify).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma venda no período.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(porFonteKiwify).sort((a, b) => b[1].liquido - a[1].liquido).map(([fonte, v]) => (
                      <div key={fonte} className="flex items-center justify-between text-sm gap-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{fonte}</p>
                          <p className="text-xs text-muted-foreground">{v.vendas} venda{v.vendas !== 1 ? "s" : ""}</p>
                        </div>
                        <span className="font-semibold text-sm whitespace-nowrap">{fmt(v.liquido)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA CONSOLIDADO */}
        <TabsContent value="consolidado" className="space-y-6 pt-4">
          <p className="text-sm text-muted-foreground">
            Cruza cada campanha do Meta Ads com as vendas Kiwify que carregam o mesmo <code className="bg-muted px-1 py-0.5 rounded text-xs">utm_campaign</code>.
            Vendas antigas de antes da correção do webhook (25/07) não têm utm_campaign gravado e aparecem em &quot;(sem utm_campaign)&quot;.
          </p>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-y">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Campanha</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Gasto (Meta)</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Vendas (pixel)</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">ROAS Meta</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Vendas (Kiwify)</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Receita real</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">ROAS real</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {consolidado.map(row => (
                      <tr key={row.nome} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium max-w-[240px] truncate">{row.nome}</div>
                        </td>
                        <td className="px-4 py-3">{row.metaSpend > 0 ? fmt(row.metaSpend) : "—"}</td>
                        <td className="px-4 py-3">{row.metaSpend > 0 ? row.metaVendas : "—"}</td>
                        <td className="px-4 py-3 hidden md:table-cell">{row.metaRoas != null ? `${row.metaRoas.toFixed(2)}x` : "—"}</td>
                        <td className="px-4 py-3 font-medium">{row.kiwifyVendasN}</td>
                        <td className="px-4 py-3 font-medium text-green-600">{row.kiwifyLiquidoN > 0 ? fmt(row.kiwifyLiquidoN) : "—"}</td>
                        <td className="px-4 py-3">
                          {row.roasReal != null ? (
                            <span className={`font-medium ${row.roasReal >= 2.22 ? "text-green-600" : "text-red-500"}`}>{row.roasReal.toFixed(2)}x</span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${row.badge.cls}`}>
                            {row.badge.label}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {consolidado.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Nenhuma campanha ou venda no período</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
