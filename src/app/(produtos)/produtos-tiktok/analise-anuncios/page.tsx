import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const AD_ACCOUNT_ID = "623539261669603"
const TICKET = 67

interface Action { action_type: string; value: string }

interface AdInsight {
  ad_id: string
  ad_name: string
  campaign_id: string
  campaign_name: string
  status?: string
  spend: string
  impressions: string
  clicks: string
  cpc: string
  ctr: string
  reach: string
  purchase_roas?: { action_type: string; value: string }[]
  actions?: Action[]
  video_p25_watched_actions?: Action[]
  video_p95_watched_actions?: Action[]
  video_thruplay_watched_actions?: Action[]
}

interface CampaignInsight {
  campaign_id: string
  campaign_name: string
  spend: string
  impressions: string
  actions?: Action[]
  video_p25_watched_actions?: Action[]
}

async function fetchMetaAds(token: string): Promise<{ campaigns: CampaignInsight[]; ads: AdInsight[]; error?: string } | null> {
  const since = "2026-05-12"
  const until = "2026-06-16"
  const timeRange = encodeURIComponent(JSON.stringify({ since, until }))

  const base = `https://graph.facebook.com/v21.0/act_${AD_ACCOUNT_ID}/insights`

  const campFields = "campaign_id,campaign_name,spend,impressions,actions,video_p25_watched_actions"
  const adFields = "ad_id,ad_name,campaign_id,campaign_name,spend,impressions,clicks,cpc,ctr,reach,actions,purchase_roas,video_p25_watched_actions,video_p95_watched_actions,video_thruplay_watched_actions"

  const [campRes, adRes] = await Promise.all([
    fetch(`${base}?level=campaign&fields=${campFields}&time_range=${timeRange}&sort=spend_descending&access_token=${token}`, { cache: "no-store" }),
    fetch(`${base}?level=ad&fields=${adFields}&time_range=${timeRange}&sort=spend_descending&limit=50&access_token=${token}`, { cache: "no-store" }),
  ])

  const [campJson, adJson] = await Promise.all([campRes.json(), adRes.json()])

  if (campJson.error || adJson.error) {
    return { campaigns: [], ads: [], error: campJson.error?.message ?? adJson.error?.message ?? "Erro desconhecido" }
  }

  return { campaigns: campJson.data ?? [], ads: adJson.data ?? [] }
}

function getAction(actions: Action[] | undefined, type: string): number {
  const a = actions?.find(a => a.action_type === type)
  return a ? parseFloat(a.value) || 0 : 0
}

function parseNum(v: string | undefined): number {
  if (!v) return 0
  return parseFloat(v.replace(",", ".")) || 0
}

function statusBadge(val: number, meta: number): "ok" | "warn" | "bad" {
  if (val >= meta) return "ok"
  if (val >= meta * 0.85) return "warn"
  return "bad"
}

function diagLabel(ganchoSt: string, ctaSt: string, roas: number): { label: string; cls: string } {
  if (ganchoSt === "ok" && ctaSt === "ok") return { label: "ESCALAR", cls: "ok" }
  if (roas <= 0 || roas < 0.9) return { label: "Matar", cls: "bad" }
  if (ganchoSt === "ok") return { label: "Reforçar CTA", cls: "warn" }
  if (ctaSt === "ok") return { label: "Melhor Gancho", cls: "near" }
  if (roas >= 1.5) return { label: "Pausar/Testar", cls: "warn" }
  return { label: "Pausar", cls: "bad" }
}

const GANCHO_META = 10
const CTA_META = 20

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
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-6">
          <p className="font-semibold text-yellow-400 mb-2">Token Meta Ads não configurado</p>
          <p className="text-sm text-muted-foreground">
            Adicione a variável <code className="bg-muted px-1 py-0.5 rounded text-xs">FACEBOOK_ACCESS_TOKEN</code> nas
            configurações do Vercel e faça um novo deploy.
          </p>
        </div>
      </div>
    )
  }

  const data = await fetchMetaAds(token)

  if (!data || data.error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Análise de Anúncios</h1>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6">
          <p className="font-semibold text-red-400 mb-2">Erro ao buscar dados do Meta Ads</p>
          <p className="text-sm text-muted-foreground">{data?.error ?? "Verifique se o token é válido e tem permissão ads_read."}</p>
        </div>
      </div>
    )
  }

  // Campanha com maior gasto
  const camp = data.campaigns[0]
  const spend = parseNum(camp?.spend)
  const vendas = getAction(camp?.actions, "offsite_conversion.fb_pixel_purchase")
  const lpv = getAction(camp?.actions, "landing_page_view")
  const fc = getAction(camp?.actions, "initiate_checkout")

  const cpr = vendas > 0 ? spend / vendas : 0
  const cplv = lpv > 0 ? spend / lpv : 0
  const cpfc = fc > 0 ? spend / fc : 0
  const revenueEst = vendas * TICKET
  const roas = spend > 0 ? revenueEst / spend : 0

  const metaCplv = TICKET * 0.04
  const metaCpfc = TICKET * 0.23
  const metaCpr = TICKET * 0.45

  const ads = data.ads
    .filter(a => parseNum(a.spend) > 1)
    .map(a => {
      const spent = parseNum(a.spend)
      const imp = parseNum(a.impressions)
      const p25 = parseNum(a.video_p25_watched_actions?.[0]?.value)
      const p95 = parseNum(a.video_p95_watched_actions?.[0]?.value)
      const purchases = getAction(a.actions, "offsite_conversion.fb_pixel_purchase")
      const cprAd = purchases > 0 ? spent / purchases : 0
      const roasRaw = a.purchase_roas?.find(r => r.action_type === "offsite_conversion.fb_pixel_purchase")
      const roasAd = roasRaw ? parseFloat(roasRaw.value) : 0
      const gancho = imp > 0 ? (p25 / imp) * 100 : 0
      const ctaPct = p25 > 0 ? (p95 / p25) * 100 : 0
      const ganchoSt = statusBadge(gancho, GANCHO_META)
      const ctaSt = statusBadge(ctaPct, CTA_META)
      const diag = diagLabel(ganchoSt, ctaSt, roasAd)
      return { ...a, spent, imp, p25, p95, purchases, cprAd, roasAd, gancho, ctaPct, ganchoSt, ctaSt, diag }
    })
    .sort((a, b) => b.spent - a.spent)

  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  const fmtPct = (n: number) => `${n.toFixed(1)}%`
  const fmtRoas = (n: number) => `${n.toFixed(2)}x`

  function Badge({ cls, children }: { cls: string; children: React.ReactNode }) {
    const styles: Record<string, React.CSSProperties> = {
      ok: { background: "rgba(0,200,83,.15)", color: "#00C853" },
      bad: { background: "rgba(254,44,85,.15)", color: "#FE2C55" },
      warn: { background: "rgba(255,215,0,.15)", color: "#FFD700" },
      near: { background: "rgba(37,244,238,.1)", color: "#25F4EE" },
    }
    return (
      <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-sm whitespace-nowrap" style={styles[cls] ?? styles.bad}>
        {children}
      </span>
    )
  }

  function Bar({ pct, color }: { pct: number; color: string }) {
    return (
      <div style={{ width: 56, height: 5, background: "#2A2A2A", borderRadius: 3, display: "inline-block", verticalAlign: "middle", marginRight: 4 }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", borderRadius: 3, background: color }} />
      </div>
    )
  }

  const bestAd = ads.length > 0 ? ads.reduce((a, b) => (b.roasAd > a.roasAd ? b : a), ads[0]) : null

  return (
    <div style={{ color: "#F5F5F5", fontFamily: "Inter, sans-serif" }}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Análise de Anúncios</h1>
          <p className="text-sm text-muted-foreground">
            CA EXP D BKP · Meta Ads · 12/05 → 16/06/2026
            {camp?.campaign_name && <span className="ml-2 opacity-60">· {camp.campaign_name.replace(/\[.*?\]\s*/g, "").slice(0, 50)}</span>}
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full"
          style={{ background: "rgba(0,200,83,.15)", color: "#00C853" }}>
          Dados ao vivo
        </span>
      </div>

      {/* FUNIL */}
      <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: "#888" }}>
        Diagnóstico do Funil — Metas vs Realidade
      </p>
      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        {[
          { label: "Custo por View Página Destino", meta: metaCplv, real: cplv, metaLbl: "4% ticket", sem: lpv === 0 },
          { label: "Custo por Finalização de Compra", meta: metaCpfc, real: cpfc, metaLbl: "23% ticket", sem: fc === 0 },
          { label: "Custo por Resultado (Venda)", meta: metaCpr, real: cpr, metaLbl: "45% ticket", sem: vendas === 0 },
        ].map(({ label, meta, real, metaLbl, sem }) => (
          <div key={label} className="relative overflow-hidden rounded-lg border p-4" style={{ background: "#111111", borderColor: "#2A2A2A" }}>
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "#FE2C55" }} />
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#888" }}>{label}</p>
            <p className="text-[11px] mb-2" style={{ color: "#888" }}>
              Meta ({metaLbl}): <span style={{ color: "#25F4EE", fontWeight: 600 }}>{fmt(meta)}</span>
            </p>
            <p className="text-2xl font-bold font-mono mb-1" style={{ color: sem ? "#888" : "#FE2C55" }}>
              {sem ? "—" : fmt(real)}
            </p>
            {!sem && (
              <p className="text-[11px]" style={{ color: "#FE2C55" }}>
                +{fmt(real - meta)} acima (+{Math.round(((real - meta) / meta) * 100)}%)
              </p>
            )}
            <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5"
              style={{ background: "rgba(254,44,85,.15)", color: "#FE2C55" }}>
              {sem ? "Sem dados" : "Acima da meta"}
            </span>
          </div>
        ))}
      </div>

      {/* ROAS */}
      <div className="rounded-lg border p-4 flex gap-6 items-center flex-wrap mb-6" style={{ background: "#111111", borderColor: "#2A2A2A" }}>
        <div>
          <p className="text-4xl font-bold font-mono" style={{ color: roas >= 2.22 ? "#00C853" : "#FE2C55" }}>{fmtRoas(roas)}</p>
          <p className="text-[11px] mt-1" style={{ color: "#888" }}>ROAS atual (estimado)</p>
        </div>
        <div className="w-px h-12" style={{ background: "#2A2A2A" }} />
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#888" }}>Breakeven</p>
          <p className="text-lg font-bold" style={{ color: "#FE2C55" }}>2,22x</p>
        </div>
        <div className="w-px h-12" style={{ background: "#2A2A2A" }} />
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#888" }}>Vendas</p>
          <p className="text-lg font-bold" style={{ color: "#FE2C55" }}>{vendas}</p>
        </div>
        <div className="w-px h-12" style={{ background: "#2A2A2A" }} />
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#888" }}>Investido</p>
          <p className="text-lg font-bold" style={{ color: "#FE2C55" }}>{fmt(spend)}</p>
        </div>
        <div className="w-px h-12" style={{ background: "#2A2A2A" }} />
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#888" }}>CPR</p>
          <p className="text-lg font-bold" style={{ color: "#FE2C55" }}>{cpr > 0 ? fmt(cpr) : "—"}</p>
        </div>
        <div className="ml-auto rounded border p-3 max-w-xs" style={{ borderColor: "rgba(254,44,85,.3)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#FE2C55" }}>Situação</p>
          <p className="text-[12px] leading-relaxed" style={{ color: "#888" }}>
            CPR de {fmt(cpr)} para produto de R${TICKET}. Margem bruta: {fmt(TICKET - cpr)}/venda. Funil só fecha com upsell.
          </p>
        </div>
      </div>

      {/* TABELA */}
      <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: "#888" }}>
        Análise de Criativos — Retenção 25% vs Engajamento 95% (meta: ≥{GANCHO_META}% / ≥{CTA_META}%)
      </p>
      <div className="overflow-x-auto rounded-lg border mb-6" style={{ borderColor: "#2A2A2A" }}>
        <table className="w-full" style={{ borderCollapse: "collapse", background: "#111111", fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #2A2A2A" }}>
              {["Anúncio", "Gasto", "Impressões", "P25", "P95", "Ret 25%", "", "Eng 95%", "", "CPR", "ROAS", "Diagnóstico"].map((h, i) => (
                <th key={i} className="px-3 py-2 text-left whitespace-nowrap"
                  style={{ color: "#888", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ads.map((ad) => {
              const isTop = bestAd && ad.ad_id === bestAd.ad_id
              const gc = ad.ganchoSt === "ok" ? "#00C853" : ad.ganchoSt === "warn" ? "#FFD700" : "#FE2C55"
              const cc = ad.ctaSt === "ok" ? "#00C853" : ad.ctaSt === "warn" ? "#FFD700" : "#FE2C55"
              return (
                <tr key={ad.ad_id} style={{ borderBottom: "1px solid #2A2A2A", background: isTop ? "rgba(37,244,238,0.03)" : undefined }}>
                  <td className="px-3 py-2 font-medium" style={{ maxWidth: 190, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: isTop ? "#25F4EE" : "#F5F5F5" }}>
                    {isTop ? "⭐ " : ""}{ad.ad_name.replace(/^AD\d+\s*[-–]\s*/i, "").slice(0, 34)}
                  </td>
                  <td className="px-3 py-2">{fmt(ad.spent)}</td>
                  <td className="px-3 py-2">{ad.imp.toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-2">{ad.p25.toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-2">{ad.p95.toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <Bar pct={(ad.gancho / GANCHO_META) * 100} color={gc} />
                    <span style={{ color: gc }}>{fmtPct(ad.gancho)}</span>
                  </td>
                  <td className="px-3 py-2"><Badge cls={ad.ganchoSt}>{ad.ganchoSt === "ok" ? "OK" : ad.ganchoSt === "warn" ? "Quase" : "Ruim"}</Badge></td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <Bar pct={(ad.ctaPct / CTA_META) * 100} color={cc} />
                    <span style={{ color: cc }}>{fmtPct(ad.ctaPct)}</span>
                  </td>
                  <td className="px-3 py-2"><Badge cls={ad.ctaSt}>{ad.ctaSt === "ok" ? "OK" : ad.ctaSt === "warn" ? "Quase" : "Ruim"}</Badge></td>
                  <td className="px-3 py-2" style={{ color: ad.cprAd > metaCpr ? "#FE2C55" : "#00C853" }}>
                    {ad.cprAd > 0 ? fmt(ad.cprAd) : "—"}
                  </td>
                  <td className="px-3 py-2" style={{ color: ad.roasAd >= 2.22 ? "#00C853" : ad.roasAd >= 1.5 ? "#FFD700" : "#FE2C55" }}>
                    {ad.roasAd > 0 ? fmtRoas(ad.roasAd) : "—"}
                  </td>
                  <td className="px-3 py-2"><Badge cls={ad.diag.cls}>{ad.diag.label}</Badge></td>
                </tr>
              )
            })}
            {ads.length === 0 && (
              <tr><td colSpan={12} className="px-3 py-6 text-center" style={{ color: "#888" }}>Nenhum anúncio encontrado no período</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CONCLUSÃO */}
      <div className="rounded border p-4" style={{ borderColor: "rgba(254,44,85,.4)", background: "rgba(254,44,85,.04)" }}>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#FE2C55" }}>Conclusão Direta</p>
        <p className="text-[12px] leading-relaxed" style={{ color: "#888" }}>
          <strong style={{ color: "#F5F5F5" }}>Dados ao vivo · CA EXP D BKP · Meta Ads API.</strong>{" "}
          {ads.length} criativos · {fmt(spend)} investidos · {vendas} vendas · ROAS {fmtRoas(roas)}.{" "}
          {bestAd && <>Melhor criativo: <strong style={{ color: "#25F4EE" }}>{bestAd.ad_name.slice(0, 40)}</strong> com ROAS {fmtRoas(bestAd.roasAd)}. </>}
          Sem corrigir criativos e página, escalar só amplia o prejuízo.
        </p>
      </div>
    </div>
  )
}
