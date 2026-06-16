import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const AD_ACCOUNT_ID = "623539261669603"
const TICKET = 67

interface AdInsight {
  id: string
  name: string
  status: string
  amount_spent: string
  impressions: string
  clicks: string
  cpc: string
  ctr: string
  reach: string
  purchase_roas: string
  cost_per_result: { value: { indicator: string; values: { value: number }[] }[] }
  results: { value: { indicator: string; values: { value: number }[] }[] }
  video_p25_watched_actions: string
  video_p95_watched_actions: string
  video_thruplay_watched_actions: string
}

interface CampaignData {
  id: string
  name: string
  status: string
  amount_spent: string
  impressions: string
  results: {
    value: { indicator: string; values: { value: number }[] }[]
    all_conversion_types?: string[]
  }
  cost_per_result: { value: { indicator: string; values: { value: number }[] }[] }
}

async function fetchMetaAds(token: string): Promise<{ campaigns: CampaignData[]; ads: AdInsight[] } | null> {
  const since = "2026-05-12"
  const until = "2026-06-16"
  const timeRange = `{"since":"${since}","until":"${until}"}`

  const campaignFields = "id,name,status,objective,amount_spent,impressions,results,cost_per_result"
  const adFields = "id,name,status,amount_spent,impressions,clicks,cpc,ctr,reach,cost_per_result,results,video_p25_watched_actions,video_p95_watched_actions,video_thruplay_watched_actions,purchase_roas"

  const base = `https://graph.facebook.com/v21.0/act_${AD_ACCOUNT_ID}`

  const [campRes, adRes] = await Promise.all([
    fetch(`${base}/insights?level=campaign&fields=${campaignFields}&time_range=${encodeURIComponent(timeRange)}&sort=amount_spent_descending&access_token=${token}`, { next: { revalidate: 300 } }),
    fetch(`${base}/insights?level=ad&fields=${adFields}&time_range=${encodeURIComponent(timeRange)}&sort=amount_spent_descending&limit=50&access_token=${token}`, { next: { revalidate: 300 } }),
  ])

  if (!campRes.ok || !adRes.ok) return null

  const [campJson, adJson] = await Promise.all([campRes.json(), adRes.json()])
  return { campaigns: campJson.data ?? [], ads: adJson.data ?? [] }
}

function parseNum(v: string | undefined): number {
  if (!v || v === "Not available") return 0
  return parseFloat(v.replace(/[^\d.,]/g, "").replace(",", ".")) || 0
}

function parseMoney(v: string | undefined): number {
  if (!v) return 0
  return parseFloat(v.replace(/[^\d,]/g, "").replace(",", ".")) || 0
}

function getResult(field: { value: { indicator: string; values: { value: number }[] }[] } | undefined): number {
  return field?.value?.[0]?.values?.[0]?.value ?? 0
}

function statusBadge(val: number, meta: number): "ok" | "warn" | "bad" {
  if (val >= meta) return "ok"
  if (val >= meta * 0.85) return "warn"
  return "bad"
}

function diagLabel(gancho: string, cta: string, roas: number): { label: string; cls: string } {
  if (gancho === "ok" && cta === "ok") return { label: "ESCALAR", cls: "ok" }
  if (roas <= 0) return { label: "Matar", cls: "bad" }
  if (roas < 1) return { label: "Matar", cls: "bad" }
  if (gancho === "ok") return { label: "Reforçar CTA", cls: "warn" }
  if (cta === "ok") return { label: "Melhor Gancho", cls: "near" }
  if (roas >= 1.5) return { label: "Pausar/Testar", cls: "warn" }
  return { label: "Pausar", cls: "bad" }
}

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
            configurações do Vercel (Settings → Environment Variables) e faça um novo deploy.
          </p>
        </div>
      </div>
    )
  }

  const data = await fetchMetaAds(token)

  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Análise de Anúncios</h1>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6">
          <p className="font-semibold text-red-400 mb-2">Erro ao buscar dados do Meta Ads</p>
          <p className="text-sm text-muted-foreground">Verifique se o token é válido e tem permissão de leitura de anúncios.</p>
        </div>
      </div>
    )
  }

  const activeCampaign = data.campaigns.find(c => c.status === "ACTIVE") ?? data.campaigns[0]
  const spend = parseMoney(activeCampaign?.amount_spent)
  const vendas = getResult(activeCampaign?.results)
  const cpr = vendas > 0 ? spend / vendas : 0
  const revenueEst = vendas * TICKET
  const roas = spend > 0 ? revenueEst / spend : 0

  const allConv = activeCampaign?.results?.all_conversion_types ?? []
  const lpvMatch = allConv.find(s => s.includes("Landing page views") || s.includes("landing page"))
  const fcMatch = allConv.find(s => s.includes("Initiate Checkout") || s.includes("checkouts initiated"))
  const lpv = lpvMatch ? parseInt(lpvMatch.match(/[\d.]+/)?.[0] ?? "0") : 0
  const fc = fcMatch ? parseInt(fcMatch.match(/[\d.]+/)?.[0] ?? "0") : 0

  const cplv = lpv > 0 ? spend / lpv : 0
  const cpfc = fc > 0 ? spend / fc : 0

  const metaCplv = TICKET * 0.04
  const metaCpfc = TICKET * 0.23
  const metaCpr = TICKET * 0.45

  const GANCHO_META = 10
  const CTA_META = 20

  const ads = data.ads.filter(a => parseNum(a.amount_spent) > 1).map(a => {
    const imp = parseNum(a.impressions)
    const p25 = parseNum(a.video_p25_watched_actions)
    const p95 = parseNum(a.video_p95_watched_actions)
    const spent = parseMoney(a.amount_spent)
    const cprAd = getResult(a.cost_per_result)
    const roasAd = parseFloat(a.purchase_roas?.replace(",", ".") || "0")
    const gancho = imp > 0 ? (p25 / imp) * 100 : 0
    const ctaPct = p25 > 0 ? (p95 / p25) * 100 : 0
    const ganchoStatus = statusBadge(gancho, GANCHO_META)
    const ctaStatus = statusBadge(ctaPct, CTA_META)
    const diag = diagLabel(ganchoStatus, ctaStatus, roasAd)
    return { ...a, spent, imp, p25, p95, cprAd, roasAd, gancho, ctaPct, ganchoStatus, ctaStatus, diag }
  })

  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  const fmtPct = (n: number) => `${n.toFixed(1)}%`
  const fmtRoas = (n: number) => `${n.toFixed(2)}x`

  function FunilCard({ label, meta, real, metaLabel, desvio, desvioText }: {
    label: string; meta: number; real: number; metaLabel: string; desvio: number; desvioText: string
  }) {
    return (
      <div className="relative overflow-hidden rounded-lg border p-4" style={{ background: "#111111", borderColor: "#2A2A2A" }}>
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "#FE2C55" }} />
        <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#888" }}>{label}</p>
        <p className="text-[11px] mb-2" style={{ color: "#888" }}>
          Meta ({metaLabel}): <span style={{ color: "#25F4EE", fontWeight: 600 }}>{fmt(meta)}</span>
        </p>
        <p className="text-2xl font-bold font-mono mb-1" style={{ color: "#FE2C55" }}>{fmt(real)}</p>
        <p className="text-[11px]" style={{ color: "#FE2C55" }}>{desvioText}</p>
        <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5"
          style={{ background: "rgba(254,44,85,.15)", color: "#FE2C55" }}>
          Acima da meta
        </span>
      </div>
    )
  }

  function Badge({ cls, children }: { cls: string; children: React.ReactNode }) {
    const styles: Record<string, React.CSSProperties> = {
      ok: { background: "rgba(0,200,83,.15)", color: "#00C853" },
      bad: { background: "rgba(254,44,85,.15)", color: "#FE2C55" },
      warn: { background: "rgba(255,215,0,.15)", color: "#FFD700" },
      near: { background: "rgba(37,244,238,.1)", color: "#25F4EE" },
    }
    return (
      <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-sm" style={styles[cls] ?? styles.bad}>
        {children}
      </span>
    )
  }

  function Bar({ pct, color }: { pct: number; color: string }) {
    return (
      <div className="inline-flex items-center gap-1 align-middle">
        <div style={{ width: 60, height: 5, background: "#2A2A2A", borderRadius: 3, display: "inline-block" }}>
          <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", borderRadius: 3, background: color }} />
        </div>
      </div>
    )
  }

  const bestAd = ads.reduce((a, b) => (b.roasAd > a.roasAd ? b : a), ads[0])

  return (
    <div style={{ color: "#F5F5F5", fontFamily: "Inter, sans-serif" }}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Análise de Anúncios</h1>
          <p className="text-sm text-muted-foreground">CA EXP D BKP · Meta Ads · 12/05 → 16/06/2026</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full"
            style={{ background: "rgba(0,200,83,.15)", color: "#00C853" }}>
            Dados ao vivo
          </span>
          {activeCampaign && (
            <span className="text-[11px] px-3 py-1 rounded-full border" style={{ borderColor: "#2A2A2A", color: "#888" }}>
              {activeCampaign.name.replace(/\[.*?\]\s*/g, "").slice(0, 40)}
            </span>
          )}
        </div>
      </div>

      {/* FUNIL */}
      <section className="mb-6">
        <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: "#888" }}>
          Diagnóstico do Funil — Metas vs Realidade
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <FunilCard
            label="Custo por View Página Destino"
            meta={metaCplv}
            real={cplv || 0}
            metaLabel="4% ticket"
            desvio={cplv - metaCplv}
            desvioText={cplv > 0 ? `+${fmt(cplv - metaCplv)} acima (+${Math.round(((cplv - metaCplv) / metaCplv) * 100)}%)` : "Sem dados de LPV"}
          />
          <FunilCard
            label="Custo por Finalização de Compra"
            meta={metaCpfc}
            real={cpfc || 0}
            metaLabel="23% ticket"
            desvio={cpfc - metaCpfc}
            desvioText={cpfc > 0 ? `+${fmt(cpfc - metaCpfc)} acima (+${Math.round(((cpfc - metaCpfc) / metaCpfc) * 100)}%)` : "Sem dados de FC"}
          />
          <FunilCard
            label="Custo por Resultado (Venda)"
            meta={metaCpr}
            real={cpr}
            metaLabel="45% ticket"
            desvio={cpr - metaCpr}
            desvioText={`+${fmt(cpr - metaCpr)} acima (+${Math.round(((cpr - metaCpr) / metaCpr) * 100)}%)`}
          />
        </div>
      </section>

      {/* ROAS */}
      <section className="mb-6 rounded-lg border p-4 flex gap-6 items-center flex-wrap" style={{ background: "#111111", borderColor: "#2A2A2A" }}>
        <div>
          <p className="text-4xl font-bold font-mono" style={{ color: roas >= 2.22 ? "#00C853" : "#FE2C55" }}>{fmtRoas(roas)}</p>
          <p className="text-[11px] mt-1" style={{ color: "#888" }}>ROAS atual (estimado)</p>
        </div>
        <div className="w-px h-12" style={{ background: "#2A2A2A" }} />
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#888" }}>ROAS Mínimo (breakeven)</p>
          <p className="text-lg font-bold font-mono" style={{ color: "#FE2C55" }}>2,22x</p>
        </div>
        <div className="w-px h-12" style={{ background: "#2A2A2A" }} />
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#888" }}>Vendas no período</p>
          <p className="text-lg font-bold font-mono" style={{ color: "#FE2C55" }}>{vendas} vendas</p>
        </div>
        <div className="w-px h-12" style={{ background: "#2A2A2A" }} />
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#888" }}>Total investido</p>
          <p className="text-lg font-bold font-mono" style={{ color: "#FE2C55" }}>{fmt(spend)}</p>
        </div>
        <div className="ml-auto rounded border p-3 max-w-xs" style={{ borderColor: "rgba(254,44,85,.3)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#FE2C55" }}>Situação</p>
          <p className="text-[12px] leading-relaxed" style={{ color: "#888" }}>
            CPR de {fmt(cpr)} para produto de R${TICKET}. Margem bruta por venda: {fmt(TICKET - cpr)}. Funil só fecha com upsell ativo.
          </p>
        </div>
      </section>

      {/* TABELA CRIATIVOS */}
      <section className="mb-6">
        <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: "#888" }}>
          Análise de Criativos — Retenção 25% vs Engajamento 95%
        </p>
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "#2A2A2A" }}>
          <table className="w-full text-[11px]" style={{ borderCollapse: "collapse", background: "#111111" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #2A2A2A" }}>
                {["Anúncio", "Gasto", "Impressões", "P25%", "P95%", "Ret 25% (≥10%)", "", "Eng 95% (≥20%)", "", "CPR", "ROAS", "Diagnóstico"].map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left whitespace-nowrap" style={{ color: "#888", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => {
                const isTop = ad.id === bestAd?.id
                const ganchoColor = ad.ganchoStatus === "ok" ? "#00C853" : ad.ganchoStatus === "warn" ? "#FFD700" : "#FE2C55"
                const ctaColor = ad.ctaStatus === "ok" ? "#00C853" : ad.ctaStatus === "warn" ? "#FFD700" : "#FE2C55"
                return (
                  <tr key={ad.id} style={{ borderBottom: "1px solid #2A2A2A", background: isTop ? "rgba(37,244,238,0.03)" : undefined }}>
                    <td className="px-3 py-2 font-medium" style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: isTop ? "#25F4EE" : "#F5F5F5" }}>
                      {isTop ? "⭐ " : ""}{ad.name.replace(/^AD\d+\s*[-–]\s*/i, "").slice(0, 35)}
                    </td>
                    <td className="px-3 py-2">{fmt(ad.spent)}</td>
                    <td className="px-3 py-2">{ad.imp.toLocaleString("pt-BR")}</td>
                    <td className="px-3 py-2">{ad.p25.toLocaleString("pt-BR")}</td>
                    <td className="px-3 py-2">{ad.p95.toLocaleString("pt-BR")}</td>
                    <td className="px-3 py-2">
                      <Bar pct={(ad.gancho / GANCHO_META) * 100} color={ganchoColor} />
                      <span style={{ color: ganchoColor, marginLeft: 4 }}>{fmtPct(ad.gancho)}</span>
                    </td>
                    <td className="px-3 py-2"><Badge cls={ad.ganchoStatus}>{ad.ganchoStatus === "ok" ? "OK" : ad.ganchoStatus === "warn" ? "Quase" : "Ruim"}</Badge></td>
                    <td className="px-3 py-2">
                      <Bar pct={(ad.ctaPct / CTA_META) * 100} color={ctaColor} />
                      <span style={{ color: ctaColor, marginLeft: 4 }}>{fmtPct(ad.ctaPct)}</span>
                    </td>
                    <td className="px-3 py-2"><Badge cls={ad.ctaStatus}>{ad.ctaStatus === "ok" ? "OK" : ad.ctaStatus === "warn" ? "Quase" : "Ruim"}</Badge></td>
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
            </tbody>
          </table>
        </div>
      </section>

      {/* ALERTA FINAL */}
      <div className="rounded border p-4" style={{ borderColor: "rgba(254,44,85,.4)", background: "rgba(254,44,85,.04)" }}>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#FE2C55" }}>
          Conclusão Direta
        </p>
        <p className="text-[12px] leading-relaxed" style={{ color: "#888" }}>
          <strong style={{ color: "#F5F5F5" }}>Dados ao vivo da conta CA EXP D BKP · Meta Ads API.</strong>{" "}
          {ads.length} criativos analisados · {fmt(spend)} investidos · {vendas} vendas · ROAS {fmtRoas(roas)}.{" "}
          {bestAd && (
            <>O melhor criativo é <strong style={{ color: "#25F4EE" }}>{bestAd.name.slice(0, 40)}</strong> com ROAS {fmtRoas(bestAd.roasAd)} e CPR {fmt(bestAd.cprAd)}. </>
          )}
          Sem corrigir criativos e página de vendas, escalar apenas amplifica o prejuízo.
        </p>
      </div>
    </div>
  )
}
