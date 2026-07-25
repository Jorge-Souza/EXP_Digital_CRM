"use client"

import {
  ComposedChart, Line, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"

type RoiDia = { dia: string; custoTotal: number; vendido: number; lucro: number }

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
function fmtDiaCurto(dia: string) {
  const [, m, d] = dia.split("-")
  return `${d}/${m}`
}

export function RoiDiarioChart({ data }: { data: RoiDia[] }) {
  return (
    <div className="roi-chart-root">
      <style>{`
        .roi-chart-root { --roi-custo: #eb6834; --roi-vendido: #2a78d6; --roi-good: #0ca30c; --roi-critical: #d03b3b; }
        .dark .roi-chart-root { --roi-custo: #d95926; --roi-vendido: #3987e5; }
      `}</style>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="dia"
            tickFormatter={fmtDiaCurto}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={78}
          />
          <Tooltip
            formatter={(value) => fmt(Number(value))}
            labelFormatter={(dia) => String(dia).split("-").reverse().join("/")}
            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "var(--foreground)", fontWeight: 600, marginBottom: 4 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="lucro" name="Lucro do dia" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} maxBarSize={24}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.lucro >= 0 ? "var(--roi-good)" : "var(--roi-critical)"} />
            ))}
          </Bar>
          <Line type="monotone" dataKey="custoTotal" name="Custo Total" stroke="var(--roi-custo)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="vendido" name="Vendido" stroke="var(--roi-vendido)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground mt-2">
        Barras = lucro do dia (verde quando o ROI é positivo, vermelho quando é negativo). Linhas = custo total (tráfego + imposto) vs. vendido (Kiwify líquido).
      </p>
    </div>
  )
}
