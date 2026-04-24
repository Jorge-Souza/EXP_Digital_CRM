"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Post } from "@/lib/types"

const STATUS_COLORS: Record<string, string> = {
  planejado:    "bg-gray-300 text-gray-800",
  falta_insumo: "bg-red-300 text-red-900",
  producao:     "bg-yellow-300 text-yellow-900",
  aprovado:     "bg-blue-300 text-blue-900",
  publicado:    "bg-green-300 text-green-900",
}

const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
]

// Algoritmo de Meeus/Jones/Butcher para Páscoa
function calcularPascoa(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month, day)
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function getFeriadosBrasil(year: number): Map<string, string> {
  const f = new Map<string, string>()
  const add = (date: Date, nome: string) => f.set(toKey(date), nome)
  const d = (m: number, day: number) => new Date(year, m - 1, day)

  // Fixos
  add(d(1, 1),   "Confraternização Universal")
  add(d(4, 21),  "Tiradentes")
  add(d(5, 1),   "Dia do Trabalho")
  add(d(9, 7),   "Independência do Brasil")
  add(d(10, 12), "Nossa Sra. Aparecida")
  add(d(11, 2),  "Finados")
  add(d(11, 15), "Proclamação da República")
  add(d(11, 20), "Consciência Negra")
  add(d(12, 25), "Natal")

  // Móveis baseados na Páscoa
  const pascoa = calcularPascoa(year)
  add(addDays(pascoa, -48), "Carnaval")
  add(addDays(pascoa, -47), "Carnaval")
  add(addDays(pascoa, -2),  "Sexta-feira Santa")
  add(pascoa,               "Páscoa")
  add(addDays(pascoa, 60),  "Corpus Christi")

  return f
}

interface CalendarioMesProps {
  posts: Post[]
}

export function CalendarioMes({ posts }: CalendarioMesProps) {
  const today = new Date()
  const [ano, setAno] = useState(today.getFullYear())
  const [mes, setMes] = useState(today.getMonth()) // 0-11

  const feriados = getFeriadosBrasil(ano)

  // Dias do mês
  const primeiroDia = new Date(ano, mes, 1)
  const ultimoDia = new Date(ano, mes + 1, 0)
  const totalDias = ultimoDia.getDate()

  // Dia da semana do primeiro dia (0=Dom, ajustamos para 0=Seg)
  let inicioCelula = primeiroDia.getDay() - 1
  if (inicioCelula < 0) inicioCelula = 6 // Domingo vira posição 6

  // Posts indexados por data
  const postsByDate = new Map<string, Post[]>()
  posts.forEach((p) => {
    if (!p.data_publicacao) return
    const key = p.data_publicacao.slice(0, 10)
    if (!postsByDate.has(key)) postsByDate.set(key, [])
    postsByDate.get(key)!.push(p)
  })

  function navMes(delta: number) {
    let nm = mes + delta
    let na = ano
    if (nm < 0) { nm = 11; na-- }
    if (nm > 11) { nm = 0; na++ }
    setMes(nm)
    setAno(na)
  }

  // Montar células (null = célula vazia)
  const celulas: (number | null)[] = [
    ...Array(inicioCelula).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ]
  // Completar para múltiplo de 7
  while (celulas.length % 7 !== 0) celulas.push(null)

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header navegação */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
        <button
          onClick={() => navMes(-1)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-black capitalize">
          {MESES[mes]} {ano}
        </h2>
        <button
          onClick={() => navMes(1)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Cabeçalho dias da semana */}
      <div className="grid grid-cols-7 border-b">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-bold text-muted-foreground uppercase tracking-wide border-r last:border-r-0">
            {d}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7">
        {celulas.map((dia, idx) => {
          if (dia === null) {
            return <div key={`empty-${idx}`} className="border-r border-b last:border-r-0 bg-muted/20 min-h-[110px]" />
          }

          const key = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
          const feriado = feriados.get(key)
          const dayPosts = postsByDate.get(key) ?? []
          const isToday = dia === today.getDate() && mes === today.getMonth() && ano === today.getFullYear()
          const colIdx = (inicioCelula + dia - 1) % 7
          const isSat = colIdx === 5
          const isSun = colIdx === 6

          return (
            <div
              key={key}
              className={`border-r border-b last:border-r-0 min-h-[110px] p-1.5 flex flex-col gap-1 transition-colors
                ${feriado ? "bg-gray-100 dark:bg-gray-800/60" : isSat || isSun ? "bg-muted/30" : "bg-background"}
              `}
            >
              {/* Número do dia */}
              <div className="flex items-start justify-between gap-1">
                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shrink-0
                  ${isToday ? "bg-primary text-primary-foreground" : isSat || isSun ? "text-muted-foreground" : "text-foreground"}
                `}>
                  {dia}
                </span>
                {feriado && (
                  <span className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight text-right line-clamp-2 flex-1">
                    {feriado}
                  </span>
                )}
              </div>

              {/* Posts do dia */}
              <div className="flex flex-col gap-0.5">
                {dayPosts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded truncate leading-tight ${STATUS_COLORS[post.status] ?? "bg-gray-200 text-gray-700"}`}
                    title={post.titulo}
                  >
                    {post.titulo}
                  </div>
                ))}
                {dayPosts.length > 3 && (
                  <span className="text-[10px] text-muted-foreground px-1">
                    +{dayPosts.length - 3} mais
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 px-5 py-3 border-t bg-muted/20">
        {Object.entries({
          planejado:    "Falta Fazer",
          falta_insumo: "Falta Insumo",
          producao:     "Em Produção",
          aprovado:     "P/ Aprovação",
          publicado:    "Postado",
        }).map(([status, label]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-sm ${STATUS_COLORS[status]}`} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-gray-200 dark:bg-gray-700 border border-gray-300" />
          <span className="text-xs text-muted-foreground">Feriado</span>
        </div>
      </div>
    </div>
  )
}
