import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Target, DollarSign, ShoppingCart, BarChart2, Pause, Play } from "lucide-react"
import { DateFilter } from "./date-filter"

export const dynamic = "force-dynamic"

const AD_ACCOUNT_ID = "623539261669603"
const TICKET = 67

interface Action { action_type: string; value: string }
interface StatusObj { id: string; name: string; effective_status: string }
interface AdInsight {
  ad_id: string; ad_name: string; campaign_id: string; campaign_name: string
  spend: string; impressions: string
  purchase_roas?: { action_type: string; value: string }[]
  actions?: Action[]
  video_p25_watched_actions?: Action[]
  video_p95_watched_actions?: Action[]
}
interface CampaignInsight {
  campaign_id: string; campaign_name: string; spend: string; impressions: string; actions?: Action[]
}

async function fetchAll(token: string, since: string, until: string) {
  const tr = encodeURIComponent(JSON.stringify({ since, until }))
  const base = `https://graph.facebook.com/v21.0/act_${AD_ACCOUNT_ID}`

  const [campInsRes, adInsRes, campStatusRes, adStatusRes] = await Promise.all([
    fetch(`${base}/insights?level=campaign&fields=campaign_id,campaign_name,spend,impressions,actions&time_range=${tr}&sort=spend_descending&access_token=${token}`, { cache: "no-store" }),
    fetch(`${base}/insights?level=ad&fields=ad_id,ad_name,campaign_id,campaign_name,spend,impressions,actions,purchase_roas,video_p25_watched_actions,video_p95_watched_actions&time_range=${tr}&sort=spend_descending&limit=50&access_token=${token}`, { cache: "no-store" }),
    fetch(`${base}/campaigns?fields=id,name,effective_status&limit=100&access_token=${token}`, { cache: "no-store" }),
    fetch(`${base}/ads?fields=id,name,effective_status&limit=200&access_token=${token}`, { cache: "no-store" }),
  ])

  const [ci, ai, cs, as_] = await Promise.all([campInsRes.json(), adInsRes.json(), campStatusRes.json(), adStatusRes.json()])

  if (ci.error || ai.error) return { error: ci.error?.message ?? ai.error?.message ?? "Erro" }

  const campStatus: Record<string, string> = {}
  for (const c of (cs.data ?? []) as StatusObj[]) campStatus[c.id] = c.effective_status

  const adStatus: Record<string, string> = {}
  for (const a of (as_.data ?? []) as StatusObj[]) adStatus[a.id] = a.effective_status

  return {
    campaigns: (ci.data ?? []) as CampaignInsight[],
    ads: (ai.data ?? []) as AdInsight[],
    campStatus,
    adStatus,
  }
}

function getAction(actions: Action[] | undefined, type: string) {
  return parseFloat(actions?.find(a => a.action_type === type)?.value ?? "0") || 0
}
function pn(v: string | undefined) { return parseFloat(v?.replace(",", ".") ?? "0") || 0 }

const GANCHO_META = 10
const CTA_META = 20
const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
const fmtPct = (n: number) => `${n.toFixed(1)}%`

function toISO(d: Date) { return d.toISOString().split("T")[0] }

export default async function AnaliseAnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{ since?: string; until?: string }>
}) {
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

  const params = await searchParams
  const today = new Date()
  const since = params.since ?? toISO(new Date(today.getFullYear(), today.getMonth(), 1))
  const until = params.until ?? toISO(today)

  const result = await fetchAll(token, since, until)

  if ("error" in result) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Análise de Anúncios</h1>
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="pt-6">
            <p className="font-semibold text-red-500 mb-1">Erro ao buscar dados</p>
            <p className="text-sm text-muted-foreground">{result.error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { campaigns, ads: rawAds, campStatus, adStatus } = result

  const camp = campaigns[0]
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

  const ads = rawAds
    .filter(a => pn(a.spend) > 0.5)
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
      const status = adStatus[a.ad_id] ?? "UNKNOWN"
      const isActive = status === "ACTIVE"

      let diagLabel = "Pausar"
      let diagCls = "bg-red-500/15 text-red-600 border-red-500/30"
      if (gancho >= GANCHO_META && ctaPct >= CTA_META) { diagLabel = "Escalar"; diagCls = "bg-green-500/15 text-green-600 border-green-500/30" }
      else if (roasAd > 0 && roasAd < 0.9) { diagLabel = "Matar"; diagCls = "bg-red-500/15 text-red-600 border-red-500/30" }
      else if (gancho >= GANCHO_META) { diagLabel = "Reforçar CTA"; diagCls = "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" }
      else if (ctaPct >= CTA_META) { diagLabel = "Melhor Gancho"; diagCls = "bg-blue-500/15 text-blue-600 border-blue-500/30" }
      else if (roasAd >= 1.5) { diagLabel = "Testar"; diagCls = "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" }

      return { ...a, spent, imp, p25, p95, purchases, cprAd, roasAd, gancho, ctaPct, diagLabel, diagCls, status, isActive }
    })
    .sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
      return b.spent - a.spent
    })

  const bestAd = ads.filter(a => a.roasAd > 0).reduce((a, b) => b.roasAd > a.roasAd ? b : a, ads[0])

  function BarPct({ pct, meta }: { pct: number; meta: number }) {
    const ratio = Math.min((pct / meta) * 100, 100)
    const color = pct >= meta ? "bg-green-500" : pct >= meta * 0.85 ? "bg-yellow-500" : "bg-red-400"
    return (
      <div className="flex items-center gap-2">
        <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${ratio}%` }} />
        </div>
        <span className={`text-xs font-medium tabular-nums ${pct >= meta ? "text-green-600" : pct >= meta * 0.85 ? "text-yellow-600" : "text-red-500"}`}>
          {fmtPct(pct)}
        </span>
      </div>
    )
  }

  const sinaFormatted = since.split("-").reverse().join("/")
  const untilFormatted = until.split("-").reverse().join("/")

  return (
    <div className="space-y-6">

      {/* HEADER + FILTRO */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Análise de Anúncios</h1>
            <p className="text-sm text-muted-foreground">
              CA EXP D BKP · {sinaFormatted} → {untilFormatted}
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-500/15 text-green-600 border border-green-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Ao vivo
          </span>
        </div>
        <DateFilter since={since} until={until} />
      </div>

      {/* CAMPANHAS */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Campanhas no período</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-3">Nenhuma campanha com gasto no período.</p>
          )}
          {campaigns.map(c => {
            const st = campStatus[c.campaign_id]
            const isActive = st === "ACTIVE"
            const cVendas = getAction(c.actions, "offsite_conversion.fb_pixel_purchase")
            const cSpend = pn(c.spend)
            const cRoas = cVendas > 0 && cSpend > 0 ? (cVendas * TICKET) / cSpend : 0
            return (
              <Card key={c.campaign_id} className={isActive ? "border-green-500/40" : "border-border opacity-70"}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="text-xs font-medium leading-tight line-clamp-2 flex-1">
                      {c.campaign_name.replace(/\[.*?\]\s*/g, "").trim() || c.campaign_name}
                    </p>
                    <span className={`shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      isActive
                        ? "bg-green-500/15 text-green-600 border-green-500/30"
                        : "bg-muted text-muted-foreground border-border"
                    }`}>
                      {isActive ? <Play className="h-2.5 w-2.5" /> : <Pause className="h-2.5 w-2.5" />}
                      {isActive ? "Ativa" : st === "PAUSED" ? "Pausada" : st ?? "—"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Gasto</p>
                      <p className="text-sm font-bold">{fmt(cSpend)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Vendas</p>
                      <p className="text-sm font-bold">{cVendas}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">ROAS</p>
                      <p className={`text-sm font-bold ${cRoas >= 2.22 ? "text-green-600" : cRoas > 0 ? "text-red-500" : "text-muted-foreground"}`}>
                        {cRoas > 0 ? `${cRoas.toFixed(2)}x` : "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROAS</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${roas >= 2.22 ? "text-green-600" : "text-red-500"}`}>{roas.toFixed(2)}x</div>
            <p className="text-xs text-muted-foreground mt-1">Breakeven: 2,22x</p>
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
            <p className="text-xs text-muted-foreground mt-1">{fc > 0 ? `${Math.round((vendas / fc) * 100)}% dos checkouts` : "sem dados de checkout"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(spend)}</div>
            <p className="text-xs text-muted-foreground mt-1">Receita est.: {fmt(vendas * TICKET)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo por Venda</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cpr > metaCpr ? "text-red-500" : cpr > 0 ? "text-green-600" : ""}`}>
              {cpr > 0 ? fmt(cpr) : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Meta: {fmt(metaCpr)}</p>
          </CardContent>
        </Card>
      </div>

      {/* FUNIL */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Funil — Meta vs Realidade</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Custo por View Página", meta: metaCplv, real: cplv, sub: "4% do ticket", sem: lpv === 0 },
            { label: "Custo por Finalização", meta: metaCpfc, real: cpfc, sub: "23% do ticket", sem: fc === 0 },
            { label: "Custo por Venda", meta: metaCpr, real: cpr, sub: "45% do ticket", sem: vendas === 0 },
          ].map(({ label, meta, real, sub, sem }) => {
            const acima = !sem && real > meta
            const pct = !sem && meta > 0 ? Math.round(((real - meta) / meta) * 100) : 0
            return (
              <Card key={label} className={acima ? "border-red-500/30" : sem ? "" : "border-green-500/30"}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  {acima ? <TrendingUp className="h-4 w-4 text-red-500" /> : <TrendingDown className="h-4 w-4 text-green-600" />}
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${acima ? "text-red-500" : sem ? "" : "text-green-600"}`}>
                    {sem ? "—" : fmt(real)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Meta ({sub}): {fmt(meta)}</p>
                  {!sem && (
                    <p className={`text-xs font-medium mt-2 ${acima ? "text-red-500" : "text-green-600"}`}>
                      {acima ? `+${pct}% acima` : `${Math.abs(pct)}% abaixo`} da meta
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* TABELA ANÚNCIOS */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base">Anúncios</CardTitle>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Ativo</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground/40 inline-block" /> Pausado</span>
              <span className="text-muted-foreground">· Ret 25% meta ≥{GANCHO_META}% · Eng 95% meta ≥{CTA_META}%</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-y">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide w-6"></th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Anúncio</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Gasto</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Impressões</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Ret 25%</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Eng 95%</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Vendas</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">CPR</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">ROAS</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Diagnóstico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ads.map((ad) => {
                  const isBest = bestAd && ad.ad_id === bestAd.ad_id
                  return (
                    <tr key={ad.ad_id} className={`transition-colors ${
                      ad.isActive ? "hover:bg-muted/30" : "hover:bg-muted/20 opacity-60"
                    } ${isBest ? "bg-green-500/5" : ""}`}>
                      <td className="pl-4 py-3">
                        <span title={ad.status}>
                          {ad.isActive
                            ? <span className="w-2 h-2 rounded-full bg-green-500 block" />
                            : <span className="w-2 h-2 rounded-full bg-muted-foreground/40 block" />}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium max-w-[180px] truncate text-sm">
                              {isBest && <span className="text-green-600 mr-1">★</span>}
                              {ad.ad_name.replace(/^AD\d+\s*[-–]\s*/i, "").slice(0, 38)}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {ad.isActive
                                ? <span className="text-green-600 font-medium flex items-center gap-0.5"><Play className="h-2.5 w-2.5" /> Ativo</span>
                                : <span className="flex items-center gap-0.5"><Pause className="h-2.5 w-2.5" /> Pausado</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium tabular-nums">{fmt(ad.spent)}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell tabular-nums">{ad.imp.toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3"><BarPct pct={ad.gancho} meta={GANCHO_META} /></td>
                      <td className="px-4 py-3"><BarPct pct={ad.ctaPct} meta={CTA_META} /></td>
                      <td className="px-4 py-3 hidden lg:table-cell tabular-nums">{ad.purchases > 0 ? ad.purchases : "—"}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`font-medium tabular-nums ${ad.cprAd > metaCpr ? "text-red-500" : ad.cprAd > 0 ? "text-green-600" : "text-muted-foreground"}`}>
                          {ad.cprAd > 0 ? fmt(ad.cprAd) : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`font-medium tabular-nums ${ad.roasAd >= 2.22 ? "text-green-600" : ad.roasAd >= 1.5 ? "text-yellow-600" : ad.roasAd > 0 ? "text-red-500" : "text-muted-foreground"}`}>
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
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">Nenhum anúncio com gasto no período selecionado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CONCLUSÃO */}
      {ads.length > 0 && (
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-orange-600 mb-2">Resumo do Período</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">{ads.filter(a => a.isActive).length} ativos</strong> · {ads.filter(a => !a.isActive).length} pausados ·{" "}
              {fmt(spend)} investidos · {vendas} vendas · ROAS {roas.toFixed(2)}x.{" "}
              {bestAd && bestAd.roasAd > 0 && <>Melhor ROAS: <strong className="text-foreground">{bestAd.ad_name.slice(0, 40)}</strong> ({bestAd.roasAd.toFixed(2)}x). </>}
              {roas < 2.22 && roas > 0 && "Sem corrigir criativos e página, escalar amplifica o prejuízo."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
