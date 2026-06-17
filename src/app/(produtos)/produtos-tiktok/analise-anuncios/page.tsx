import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Target, DollarSign, ShoppingCart, BarChart2 } from "lucide-react"

export const dynamic = "force-dynamic"

const AD_ACCOUNT_ID = "623539261669603"
const TICKET = 67

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
}

async function fetchMetaAds(token: string): Promise<{ campaigns: CampaignInsight[]; ads: AdInsight[]; error?: string } | null> {
  const timeRange = encodeURIComponent(JSON.stringify({ since: "2026-05-12", until: "2026-06-16" }))
  const base = `https://graph.facebook.com/v21.0/act_${AD_ACCOUNT_ID}/insights`

  const [campRes, adRes] = await Promise.all([
    fetch(`${base}?level=campaign&fields=campaign_id,campaign_name,spend,impressions,actions&time_range=${timeRange}&sort=spend_descending&access_token=${token}`, { cache: "no-store" }),
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

export default async function AnaliseAnunciosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/hub")

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

  const data = await fetchMetaAds(token)

  if (!data || data.error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Análise de Anúncios</h1>
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="pt-6">
            <p className="font-semibold text-red-500 mb-1">Erro ao buscar dados do Meta Ads</p>
            <p className="text-sm text-muted-foreground">{data?.error ?? "Token inválido ou sem permissão ads_read."}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const camp = data.campaigns[0]
  const spend = pn(camp?.spend)
  const vendas = getAction(camp?.actions, "offsite_conversion.fb_pixel_purchase")
  const lpv = getAction(camp?.actions, "landing_page_view")
  const fc = getAction(camp?.actions, "initiate_checkout")

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Análise de Anúncios</h1>
          <p className="text-sm text-muted-foreground">
            CA EXP D BKP · Meta Ads · 12/05 → 16/06/2026
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-500/15 text-green-600 border border-green-500/30">
          Dados ao vivo
        </span>
      </div>

      {/* MÉTRICAS RESUMO */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROAS</CardTitle>
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
            <CardTitle className="text-sm font-medium">Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendas}</div>
            <p className="text-xs text-muted-foreground mt-1">compras no período</p>
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

      {/* FUNIL */}
      <div>
        <h2 className="text-base font-semibold mb-3">Diagnóstico do Funil</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <FunilCard label="Custo por View Página" meta={metaCplv} real={cplv} metaLbl="4% ticket" icon={TrendingUp} sem={lpv === 0} />
          <FunilCard label="Custo por Finalização" meta={metaCpfc} real={cpfc} metaLbl="23% ticket" icon={TrendingUp} sem={fc === 0} />
          <FunilCard label="Custo por Venda" meta={metaCpr} real={cpr} metaLbl="45% ticket" icon={TrendingUp} sem={vendas === 0} />
        </div>
      </div>

      {/* TABELA CRIATIVOS */}
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

      {/* CONCLUSÃO */}
      <Card className="border-orange-500/30 bg-orange-500/5">
        <CardContent className="pt-6">
          <p className="text-sm font-semibold text-orange-600 mb-2">Conclusão do Período</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">{ads.length} criativos analisados</strong> · {fmt(spend)} investidos · {vendas} vendas · ROAS {roas.toFixed(2)}x.{" "}
            {bestAd && <>Melhor criativo: <strong className="text-foreground">{bestAd.ad_name.slice(0, 45)}</strong> com ROAS {bestAd.roasAd.toFixed(2)}x. </>}
            {roas < 2.22 && "Sem corrigir criativos e página de vendas, escalar só amplifica o prejuízo."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
