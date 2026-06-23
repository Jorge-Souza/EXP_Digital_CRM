"use client"

import { useMemo, useState } from "react"
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, BarChart3 } from "lucide-react"

const COLORS = ["#4285F4", "#EA4335", "#FBBC04", "#34A853", "#A142F4", "#FF6D01"]

type Resposta = {
  interesse_4500: string | null
  interesse_297: string | null
  tipo_venda: string | null
  faturamento: string | null
  nichos_que_vende: string | null
}

function contarValores(respostas: Resposta[], campo: keyof Resposta) {
  const contagem = new Map<string, number>()
  for (const r of respostas) {
    const valor = r[campo]
    if (!valor) continue
    contagem.set(valor, (contagem.get(valor) ?? 0) + 1)
  }
  return Array.from(contagem.entries()).map(([name, value]) => ({ name, value }))
}

function contarMultivalor(respostas: Resposta[], campo: keyof Resposta) {
  const contagem = new Map<string, number>()
  for (const r of respostas) {
    const valor = r[campo]
    if (!valor) continue
    const itens = valor.split(/[,;|]/).map(v => v.trim()).filter(Boolean)
    for (const item of itens) {
      contagem.set(item, (contagem.get(item) ?? 0) + 1)
    }
  }
  return Array.from(contagem.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

function PieCard({ titulo, total, dados }: { titulo: string; total: number; dados: { name: string; value: number }[] }) {
  if (dados.length === 0) return null
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold leading-snug">{titulo}</CardTitle>
        <p className="text-xs text-muted-foreground">{total} respostas</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={dados} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ percent }) => `${(percent! * 100).toFixed(1)}%`}>
              {dados.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function BarCard({ titulo, total, dados }: { titulo: string; total: number; dados: { name: string; value: number }[] }) {
  if (dados.length === 0) return null
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold leading-snug">{titulo}</CardTitle>
        <p className="text-xs text-muted-foreground">{total} respostas</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(200, dados.length * 50)}>
          <BarChart data={dados} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#111827" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function PesquisaCharts({ respostas }: { respostas: Resposta[] }) {
  const [aberto, setAberto] = useState(true)

  const interesse4500 = useMemo(() => contarValores(respostas, "interesse_4500"), [respostas])
  const interesse297 = useMemo(() => contarValores(respostas, "interesse_297"), [respostas])
  const tipoVenda = useMemo(() => contarValores(respostas, "tipo_venda"), [respostas])
  const faturamento = useMemo(() => contarValores(respostas, "faturamento"), [respostas])
  const nichos = useMemo(() => contarMultivalor(respostas, "nichos_que_vende"), [respostas])

  if (respostas.length === 0) return null

  return (
    <Card>
      <button type="button" onClick={() => setAberto(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left">
        <span className="flex items-center gap-2 text-base font-semibold">
          <BarChart3 className="h-4 w-4" /> Gráficos da Pesquisa ({respostas.length} respostas)
        </span>
        {aberto ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {aberto && (
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0">
          <PieCard titulo="Investiria R$4.500 num acompanhamento individual de 6 meses?" total={respostas.length} dados={interesse4500} />
          <BarCard titulo="Você vende em alguns desses nichos?" total={respostas.length} dados={nichos} />
          <PieCard titulo="Pretende vender como afiliado ou com produto próprio?" total={respostas.length} dados={tipoVenda} />
          <PieCard titulo="Qual é o faturamento atual mensal com vendas online?" total={respostas.length} dados={faturamento} />
          <PieCard titulo="Investiria R$297 no Programa de Aceleração de 90 dias?" total={respostas.length} dados={interesse297} />
        </CardContent>
      )}
    </Card>
  )
}
