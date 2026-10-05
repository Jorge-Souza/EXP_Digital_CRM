"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CATEGORIAS, CATS_FIXAS, CATS_VARIAVEIS, PRODUTOS_DIRETOS,
  type Config, type Lancamento, type SaldoKiwify, type Saque, type Venda,
} from "@/lib/financeiro/tipos"

const BRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
const pct = (a: number, b: number) => (b ? ((a / b) * 100).toFixed(1).replace(".", ",") + "%" : "–")
const MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
const mesLabel = (m: string) => (m === "all" ? "Todo o período" : `${MES[+m.slice(5, 7) - 1]}/${m.slice(2, 4)}`)
const PLATS = ["hotmart", "kiwify"] as const
const PLAT_NOME = { hotmart: "Hotmart", kiwify: "Kiwify" }

// mês da data no fuso de Brasília (YYYY-MM)
const mesBR = (iso: string) =>
  new Date(iso).toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" }).slice(0, 7)
const diaBR = (iso: string) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" })
const hoje = () => new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" })
const somaDias = (d: string, n: number) => {
  const x = new Date(d + "T12:00:00")
  x.setDate(x.getDate() + n)
  return x.toISOString().slice(0, 10)
}
const soma = <T,>(a: T[], f: (x: T) => number) => a.reduce((s, x) => s + f(x), 0)

type Props = { vendas: Venda[]; saques: Saque[]; lancamentos: Lancamento[]; config: Config; saldoKiwify: SaldoKiwify }

export function FinanceiroDash({ vendas: todasVendas, saques, lancamentos, config, saldoKiwify }: Props) {
  const router = useRouter()
  const [periodo, setPeriodo] = useState("all")
  const [produto, setProduto] = useState("all")

  const produtos = useMemo(() => {
    const m = new Map<string, number>()
    todasVendas.filter((v) => v.status === "aprovada").forEach((v) => {
      const k = (v.produto ?? "(sem nome)").trim()
      m.set(k, (m.get(k) ?? 0) + v.bruto)
    })
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k)
  }, [todasVendas])

  // o filtro de produto vale para vendas e DRE; saldos das plataformas usam todas as vendas
  const vendas = useMemo(
    () => (produto === "all" ? todasVendas : todasVendas.filter((v) => (v.produto ?? "(sem nome)").trim() === produto)),
    [todasVendas, produto],
  )

  const meses = useMemo(() => {
    const s = new Set<string>()
    vendas.forEach((v) => s.add(mesBR(v.data_venda)))
    lancamentos.forEach((l) => s.add(l.data.slice(0, 7)))
    return [...s].sort()
  }, [vendas, lancamentos])

  const noPeriodo = (iso: string, p: string) => p === "all" || iso.slice(0, 7) === p
  const noPeriodoBR = (iso: string, p: string) => p === "all" || mesBR(iso) === p

  function dre(p: string) {
    const V = vendas.filter((v) => noPeriodoBR(v.data_venda, p))
    // reembolso conta no mês em que aconteceu (data_status), não no mês da venda
    const RE = vendas.filter((v) => v.status !== "aprovada" && noPeriodoBR(v.data_status ?? v.data_venda, p))
    const D = lancamentos.filter((l) => l.tipo === "despesa" && noPeriodo(l.data, p))
    const bruta = soma(V, (v) => v.bruto)
    // receitas diretas (Pix) só entram quando o filtro de produto está em "todos"
    const diretas = produto === "all" ? soma(lancamentos.filter((l) => l.tipo === "receita" && noPeriodo(l.data, p)), (l) => l.valor) : 0
    const devolucoes = produto === "all" ? soma(lancamentos.filter((l) => l.tipo === "devolucao" && noPeriodo(l.data, p)), (l) => l.valor) : 0
    const reemb = soma(RE, (v) => v.bruto)
    const taxas = soma(V, (v) => v.taxa)
    // parte da venda repassada a afiliado/coprodutor/dono do produto: bruto − taxa − o que você recebe
    const parceiros = soma(V.filter((v) => v.status === "aprovada"), (v) => Math.max(0, v.bruto - v.taxa - v.liquido))
    const receita = bruta + diretas
    const liq = receita - reemb - devolucoes - taxas - parceiros
    const cat: Record<string, number> = {}
    Object.keys(CATEGORIAS).forEach((c) => (cat[c] = soma(D.filter((l) => l.categoria === c), (l) => l.valor)))
    const variavel = soma(CATS_VARIAVEIS, (c) => cat[c])
    const fixo = soma(CATS_FIXAS, (c) => cat[c])
    const op = liq - variavel - fixo
    const ret = soma(lancamentos.filter((l) => l.tipo === "retirada" && noPeriodo(l.data, p)), (l) => l.valor)
    const sq = saques.filter((s) => s.status === "success" && noPeriodoBR(s.data, p))
    const saqueTotal =
      soma(sq, (s) => s.valor) + soma(lancamentos.filter((l) => l.tipo === "saque" && noPeriodo(l.data, p)), (l) => l.valor)
    return {
      n: V.length, bruta, diretas, devolucoes, receita, reemb, taxas, parceiros, liq, cat, variavel, fixo, contrib: liq - variavel, op,
      ret, retido: op - ret, saqueTotal,
      pago: soma(D.filter((l) => l.pago), (l) => l.valor),
      aberto: soma(D.filter((l) => !l.pago), (l) => l.valor),
    }
  }

  const d = dre(periodo)

  const saldos = useMemo(() => {
    const t = hoje()
    const o = {} as Record<"hotmart" | "kiwify", { disp: number; fut: number }>
    for (const p of PLATS) {
      const prazo = config[`prazo_${p}`]
      let disp = 0, fut = 0
      todasVendas.filter((v) => v.plataforma === p && v.status === "aprovada").forEach((v) => {
        const lib = v.liberacao ?? somaDias(diaBR(v.data_venda), prazo)
        if (lib <= t) disp += v.liquido
        else fut += v.liquido
      })
      disp -= soma(saques.filter((s) => s.plataforma === p && s.status === "success"), (s) => s.valor)
      disp -= soma(lancamentos.filter((l) => l.tipo === "saque" && l.plataforma === p), (l) => l.valor)
      o[p] = { disp, fut }
    }
    const banco =
      config.banco_inicial +
      soma(saques.filter((s) => s.status === "success"), (s) => s.valor) +
      soma(lancamentos.filter((l) => l.tipo === "saque"), (l) => l.valor) +
      soma(lancamentos.filter((l) => l.tipo === "receita"), (l) => l.valor) -
      soma(lancamentos.filter((l) => l.tipo === "devolucao"), (l) => l.valor) -
      soma(lancamentos.filter((l) => l.tipo === "despesa" && l.pago), (l) => l.valor) -
      soma(lancamentos.filter((l) => l.tipo === "retirada"), (l) => l.valor)
    return { ...o, banco }
  }, [todasVendas, saques, lancamentos, config])

  const serie = meses.slice(-12).map((m) => {
    const x = dre(m)
    return { mes: mesLabel(m), "Receita líquida": +x.liq.toFixed(2), "Resultado operacional": +x.op.toFixed(2) }
  })

  const vazio = vendas.length === 0 && lancamentos.length === 0

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Financeiro TikTok Shop</h1>
          <p className="text-sm text-muted-foreground">DRE e caixa · Hotmart + Kiwify · sincroniza todo dia às 06h</p>
        </div>
        <div className="flex flex-wrap gap-2">
        <select
          value={produto}
          onChange={(e) => setProduto(e.target.value)}
          className="h-9 max-w-64 rounded-md border bg-background px-3 text-sm"
          aria-label="Produto"
        >
          <option value="all">Todos os produtos</option>
          {produtos.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="h-9 rounded-md border bg-background px-3 text-sm"
          aria-label="Período"
        >
          <option value="all">Todo o período</option>
          {[...meses].reverse().map((m) => (
            <option key={m} value={m}>{mesLabel(m)}</option>
          ))}
        </select>
        </div>
      </div>

      {vazio && (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">
          Nenhuma venda sincronizada ainda. Rode o histórico em /api/cron/financeiro?desde=AAAA-MM-DD.
        </CardContent></Card>
      )}

      <Tabs defaultValue="geral">
        <TabsList>
          <TabsTrigger value="geral">Visão geral</TabsTrigger>
          <TabsTrigger value="dre">DRE</TabsTrigger>
          <TabsTrigger value="caixa">Caixa e banco</TabsTrigger>
          <TabsTrigger value="lanc">Lançamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <Kpi l="Receita bruta" v={BRL(d.receita)} s={`${d.n} vendas + ${BRL(d.diretas)} em Pix diretos`} />
            <Kpi l="Receita líquida" v={BRL(d.liq)} s={`${pct(d.liq, d.receita)} da bruta`} />
            <Kpi l="Resultado operacional" v={BRL(d.op)} s={`margem ${pct(d.op, d.liq)}`} neg={d.op < 0} />
            <Kpi l="Retiradas do sócio" v={BRL(d.ret)} s="no período" />
            <Kpi l="Sobra na empresa" v={BRL(d.retido)} s="após retiradas" neg={d.retido < 0} />
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <Card className="md:col-span-3">
              <CardHeader><CardTitle className="text-sm">Mês a mês</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serie}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="mes" fontSize={11} />
                    <YAxis fontSize={11} tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)} mil` : String(v))} />
                    <Tooltip formatter={(v) => BRL(Number(v))} />
                    <Bar dataKey="Receita líquida" fill="#0f5c73" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Resultado operacional" fill="#9aa8b1" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-sm">Por plataforma</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {PLATS.map((p) => {
                  const V = vendas.filter((v) => v.plataforma === p && noPeriodoBR(v.data_venda, periodo))
                  const b = soma(V, (v) => v.bruto)
                  return (
                    <div key={p}>
                      <div className="flex justify-between text-sm"><b>{PLAT_NOME[p]}</b><span className="tabular-nums">{BRL(b)}</span></div>
                      <div className="mt-1 h-2 rounded bg-muted"><div className="h-2 rounded" style={{ width: `${d.bruta ? (b / d.bruta) * 100 : 0}%`, background: p === "hotmart" ? "#d9622b" : "#2a8c64" }} /></div>
                      <div className="mt-1 text-xs text-muted-foreground">{V.length} vendas · taxas {BRL(soma(V, (v) => v.taxa))} · ticket {BRL(V.length ? b / V.length : 0)}</div>
                    </div>
                  )
                })}
                <div className="border-t pt-3 text-xs font-medium text-muted-foreground">Por produto</div>
                {Object.entries(
                  vendas.filter((v) => noPeriodoBR(v.data_venda, periodo)).reduce<Record<string, number>>((a, v) => {
                    const k = v.produto ?? "(sem nome)"
                    a[k] = (a[k] ?? 0) + v.bruto
                    return a
                  }, {}),
                ).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2 text-xs"><span className="truncate">{k}</span><span className="tabular-nums">{BRL(v)}</span></div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm">Despesas por categoria</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {Object.keys(CATEGORIAS).filter((c) => d.cat[c] > 0).sort((a, b) => d.cat[b] - d.cat[a]).map((c) => (
                  <div key={c} className="flex items-center gap-3 text-sm">
                    <span className="w-40 shrink-0">{CATEGORIAS[c]}</span>
                    <div className="h-2 flex-1 rounded bg-muted"><div className="h-2 rounded bg-primary" style={{ width: `${(d.cat[c] / Math.max(...Object.values(d.cat))) * 100}%` }} /></div>
                    <span className="w-28 text-right tabular-nums">{BRL(d.cat[c])}</span>
                  </div>
                ))}
                {Object.values(d.cat).every((v) => v === 0) && <p className="text-sm text-muted-foreground">Sem despesas no período.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Contas em aberto</CardTitle></CardHeader>
              <CardContent><ContasAbertas lancamentos={lancamentos} onChange={() => router.refresh()} /></CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dre">
          <Card>
            <CardHeader><CardTitle className="text-sm">DRE · {mesLabel(periodo)}</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-muted-foreground"><th className="py-2">Linha</th><th className="text-right">Valor</th><th className="text-right">% da bruta</th></tr></thead>
                <tbody>
                  <Linha t="Vendas nas plataformas (Hotmart + Kiwify)" v={d.bruta} b={d.receita} plus />
                  <Linha t="Receitas diretas por Pix (SOS, Mentoria, Assessoria)" v={d.diretas} b={d.receita} plus />
                  <Linha t="Receita bruta" v={d.receita} b={d.receita} total />
                  <Linha t="(−) Reembolsos e chargebacks das plataformas" v={d.reemb} b={d.receita} sub />
                  <Linha t="(−) Devoluções de Pix a clientes" v={d.devolucoes} b={d.receita} sub />
                  <Linha t="(−) Taxas Hotmart / Kiwify" v={d.taxas} b={d.receita} sub />
                  <Linha t="(−) Repasse a afiliados, coprodutores e donos do produto" v={d.parceiros} b={d.receita} sub />
                  <Linha t="Receita líquida" v={d.liq} b={d.receita} total />
                  {CATS_VARIAVEIS.map((c) => <Linha key={c} t={`(−) ${CATEGORIAS[c]}`} v={d.cat[c]} b={d.receita} sub />)}
                  <Linha t="Margem de contribuição" v={d.contrib} b={d.receita} total />
                  {CATS_FIXAS.map((c) => <Linha key={c} t={`(−) ${CATEGORIAS[c]}`} v={d.cat[c]} b={d.receita} sub />)}
                  <Linha t="Resultado operacional" v={d.op} b={d.receita} total />
                  <Linha t="(−) Retiradas do sócio" v={d.ret} b={d.receita} sub />
                  <Linha t="Sobra na empresa" v={d.retido} b={d.receita} total />
                </tbody>
              </table>
              <p className="mt-3 text-xs text-muted-foreground">
                Competência pela data da venda; reembolso e chargeback saem no mês em que ocorreram. O repasse a parceiros é calculado venda a venda (bruto − taxa − o que a plataforma deposita para você), então a receita líquida bate com o valor líquido da Kiwify. A taxa da plataforma de uma venda reembolsada continua contada como custo.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="caixa" className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi l="Saldo no banco" v={BRL(saldos.banco)} s="calculado" neg={saldos.banco < 0} />
            <Kpi l="Disponível nas plataformas" v={BRL(saldos.hotmart.disp + saldos.kiwify.disp)} s="calculado, pronto para sacar" />
            <Kpi l="A liberar" v={BRL(saldos.hotmart.fut + saldos.kiwify.fut)} s="dentro do prazo" />
            <Kpi l="Contas em aberto" v={BRL(d.aberto)} s="despesas não pagas" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm">Caminho do dinheiro · {mesLabel(periodo)}</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[["Vendido (bruto, plataformas + Pix diretos)", d.receita], ["Líquido (após taxas e reembolsos)", d.liq], ["Sacado para o banco", d.saqueTotal], ["Pix diretos recebidos (líquido de devoluções)", d.diretas - d.devolucoes], ["Contas pagas pelo banco", d.pago], ["Retirada do sócio", d.ret]].map(([l, v]) => (
                  <div key={l as string} className="flex justify-between gap-3 border-b py-1.5"><span>{l}</span><span className="tabular-nums">{BRL(v as number)}</span></div>
                ))}
                <p className="pt-1 text-xs text-muted-foreground">
                  Saques + Pix diretos − devoluções − contas pagas − retirada = <b className={d.saqueTotal + d.diretas - d.devolucoes - d.pago - d.ret < 0 ? "text-red-600" : "text-emerald-600"}>{BRL(d.saqueTotal + d.diretas - d.devolucoes - d.pago - d.ret)}</b>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Saldos nas plataformas</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {PLATS.map((p) => (
                  <div key={p} className="grid grid-cols-3 gap-2 border-b pb-2">
                    <b>{PLAT_NOME[p]}</b>
                    <span className="tabular-nums">{BRL(saldos[p].disp)}<br /><span className="text-xs text-muted-foreground">disponível (calculado)</span></span>
                    <span className="tabular-nums">{BRL(saldos[p].fut)}<br /><span className="text-xs text-muted-foreground">a liberar (calculado)</span></span>
                  </div>
                ))}
                {saldoKiwify && (
                  <div className="rounded-md bg-muted p-2 text-xs">
                    Saldo real na Kiwify agora: <b>{BRL(saldoKiwify.available)}</b> disponível · <b>{BRL(saldoKiwify.pending)}</b> pendente.
                    {" "}Se divergir do calculado, o histórico está incompleto ou o prazo de liberação precisa de ajuste.
                  </div>
                )}
                <ConfigForm config={config} onSaved={() => router.refresh()} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lanc" className="space-y-4">
          <NovoLancamento onSaved={() => router.refresh()} />
          <Card>
            <CardHeader><CardTitle className="text-sm">Lançamentos manuais</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <ListaLancamentos lancamentos={lancamentos} onChange={() => router.refresh()} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Kpi({ l, v, s, neg }: { l: string; v: string; s?: string; neg?: boolean }) {
  return (
    <Card><CardContent className="p-3">
      <div className="text-xs text-muted-foreground">{l}</div>
      <div className={`mt-1 text-lg font-medium tabular-nums ${neg ? "text-red-600" : ""}`}>{v}</div>
      {s && <div className="text-xs text-muted-foreground">{s}</div>}
    </CardContent></Card>
  )
}

function Linha({ t, v, b, total, sub, plus }: { t: string; v: number; b: number; total?: boolean; sub?: boolean; plus?: boolean }) {
  return (
    <tr className={`border-b ${total ? "bg-muted/60 font-semibold" : ""}`}>
      <td className={`py-2 ${sub || plus ? "pl-6 text-muted-foreground" : ""}`}>{t}</td>
      <td className={`text-right tabular-nums ${v < 0 && total ? "text-red-600" : ""}`}>{sub && v > 0 ? "−" : ""}{BRL(Math.abs(v) * (sub ? 1 : Math.sign(v) || 1))}</td>
      <td className="text-right tabular-nums text-muted-foreground">{pct(v, b)}</td>
    </tr>
  )
}

async function chamar(corpo: Record<string, unknown>) {
  const r = await fetch("/api/financeiro", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) })
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Erro ao salvar")
}

function ContasAbertas({ lancamentos, onChange }: { lancamentos: Lancamento[]; onChange: () => void }) {
  const ab = lancamentos.filter((l) => l.tipo === "despesa" && !l.pago).sort((a, b) => (a.vencimento ?? "9999").localeCompare(b.vencimento ?? "9999"))
  if (!ab.length) return <p className="text-sm text-muted-foreground">Nenhuma conta em aberto.</p>
  return (
    <div className="space-y-1 text-sm">
      {ab.slice(0, 8).map((l) => (
        <div key={l.id} className="flex items-center justify-between gap-2 border-b py-1.5">
          <span className="w-12 tabular-nums text-muted-foreground">{l.vencimento ? l.vencimento.slice(8) + "/" + l.vencimento.slice(5, 7) : "–"}</span>
          <span className="flex-1 truncate">{l.descricao || CATEGORIAS[l.categoria ?? "outros"]}</span>
          <span className="tabular-nums">{BRL(l.valor)}</span>
          <Button size="sm" variant="outline" onClick={async () => { await chamar({ acao: "pagar", id: l.id }); onChange() }}>Pagar</Button>
        </div>
      ))}
      <p className="pt-1 text-xs text-muted-foreground">Total em aberto: <b>{BRL(soma(ab, (l) => l.valor))}</b></p>
    </div>
  )
}

function ListaLancamentos({ lancamentos, onChange }: { lancamentos: Lancamento[]; onChange: () => void }) {
  const [armado, setArmado] = useState<string | null>(null)
  const L = [...lancamentos].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 200)
  if (!L.length) return <p className="text-sm text-muted-foreground">Nenhum lançamento. Use o formulário acima para registrar despesas, retiradas e saques da Hotmart.</p>
  return (
    <table className="w-full text-sm">
      <thead><tr className="text-left text-xs text-muted-foreground"><th className="py-2">Data</th><th>Tipo</th><th>Categoria</th><th>Descrição</th><th className="text-right">Valor</th><th>Situação</th><th /></tr></thead>
      <tbody>
        {L.map((l) => (
          <tr key={l.id} className="border-b">
            <td className="py-2 tabular-nums">{l.data.split("-").reverse().join("/")}</td>
            <td>{l.tipo}</td>
            <td>{l.categoria ? CATEGORIAS[l.categoria] : l.produto ? PRODUTOS_DIRETOS[l.produto] ?? l.produto : l.plataforma ? PLAT_NOME[l.plataforma] : ""}</td>
            <td className="max-w-64 truncate">{l.descricao}</td>
            <td className="text-right tabular-nums">{BRL(l.valor)}</td>
            <td>{l.tipo === "despesa" ? (l.pago ? "pago" : <Button size="sm" variant="outline" onClick={async () => { await chamar({ acao: "pagar", id: l.id }); onChange() }}>Marcar pago</Button>) : ""}</td>
            <td>
              <Button size="sm" variant="ghost" onClick={async () => {
                if (armado !== l.id) { setArmado(l.id); setTimeout(() => setArmado((a) => (a === l.id ? null : a)), 3000); return }
                await chamar({ acao: "excluir", id: l.id }); setArmado(null); onChange()
              }}>{armado === l.id ? "Confirmar?" : "×"}</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function NovoLancamento({ onSaved }: { onSaved: () => void }) {
  const [tipo, setTipo] = useState("despesa")
  const [f, setF] = useState({ data: hoje(), categoria: "trafego", descricao: "", valor: "", plataforma: "hotmart", produto: "sos", pago: "1", vencimento: "" })
  const [msg, setMsg] = useState("")
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }))
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Novo lançamento</CardTitle></CardHeader>
      <CardContent>
        <form
          className="grid grid-cols-2 items-end gap-3 md:grid-cols-4"
          onSubmit={async (e) => {
            e.preventDefault()
            try {
              await chamar({ acao: "criar", tipo, ...f, valor: Number(f.valor), pago: f.pago === "1" })
              setF((x) => ({ ...x, descricao: "", valor: "" })); setMsg("Lançado."); onSaved()
            } catch (err) { setMsg(err instanceof Error ? err.message : "Erro") }
          }}
        >
          <Campo l="Tipo">
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="h-9 w-full rounded-md border bg-background px-2 text-sm">
              <option value="despesa">Despesa</option>
              <option value="receita">Receita direta (Pix)</option>
              <option value="devolucao">Devolução a cliente</option>
              <option value="retirada">Retirada do sócio</option>
              <option value="saque">Saque Hotmart → banco</option>
            </select>
          </Campo>
          <Campo l="Data"><Input type="date" value={f.data} onChange={(e) => set("data", e.target.value)} required /></Campo>
          {tipo === "despesa" && (
            <Campo l="Categoria">
              <select value={f.categoria} onChange={(e) => set("categoria", e.target.value)} className="h-9 w-full rounded-md border bg-background px-2 text-sm">
                {Object.entries(CATEGORIAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Campo>
          )}
          {(tipo === "receita" || tipo === "devolucao") && (
            <Campo l="Produto">
              <select value={f.produto} onChange={(e) => set("produto", e.target.value)} className="h-9 w-full rounded-md border bg-background px-2 text-sm">
                {Object.entries(PRODUTOS_DIRETOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Campo>
          )}
          {tipo === "saque" && (
            <Campo l="Plataforma">
              <select value={f.plataforma} onChange={(e) => set("plataforma", e.target.value)} className="h-9 w-full rounded-md border bg-background px-2 text-sm">
                <option value="hotmart">Hotmart</option><option value="kiwify">Kiwify</option>
              </select>
            </Campo>
          )}
          <Campo l="Descrição"><Input value={f.descricao} onChange={(e) => set("descricao", e.target.value)} /></Campo>
          <Campo l="Valor (R$)"><Input type="number" step="0.01" min="0" value={f.valor} onChange={(e) => set("valor", e.target.value)} required /></Campo>
          {tipo === "despesa" && (
            <>
              <Campo l="Situação">
                <select value={f.pago} onChange={(e) => set("pago", e.target.value)} className="h-9 w-full rounded-md border bg-background px-2 text-sm">
                  <option value="1">Pago</option><option value="0">Em aberto</option>
                </select>
              </Campo>
              <Campo l="Vencimento"><Input type="date" value={f.vencimento} onChange={(e) => set("vencimento", e.target.value)} /></Campo>
            </>
          )}
          <Button type="submit">Lançar</Button>
          {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
        </form>
      </CardContent>
    </Card>
  )
}

function Campo({ l, children }: { l: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1 text-xs text-muted-foreground">{l}{children}</label>
}

function ConfigForm({ config, onSaved }: { config: Config; onSaved: () => void }) {
  const [c, setC] = useState({ banco_inicial: String(config.banco_inicial), prazo_hotmart: String(config.prazo_hotmart), prazo_kiwify: String(config.prazo_kiwify) })
  return (
    <form
      className="grid grid-cols-3 items-end gap-2 border-t pt-3"
      onSubmit={async (e) => { e.preventDefault(); await chamar({ acao: "config", ...c }); onSaved() }}
    >
      <Campo l="Saldo inicial do banco"><Input type="number" step="0.01" value={c.banco_inicial} onChange={(e) => setC({ ...c, banco_inicial: e.target.value })} /></Campo>
      <Campo l="Liberação Hotmart (dias)"><Input type="number" value={c.prazo_hotmart} onChange={(e) => setC({ ...c, prazo_hotmart: e.target.value })} /></Campo>
      <Campo l="Liberação Kiwify (dias)"><Input type="number" value={c.prazo_kiwify} onChange={(e) => setC({ ...c, prazo_kiwify: e.target.value })} /></Campo>
      <Button type="submit" size="sm" className="col-span-3">Salvar ajustes</Button>
    </form>
  )
}
