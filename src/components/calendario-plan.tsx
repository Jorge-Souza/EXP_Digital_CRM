"use client"

import { getFeriadosBrasil, toKey } from "@/lib/holidays"
import type { Post } from "@/lib/types"

const STATUS_COLORS: Record<string, string> = {
  planejado:       "bg-gray-300 text-gray-800",
  falta_insumo:    "bg-red-400 text-red-950",
  producao:        "bg-yellow-300 text-yellow-900",
  aprovado_design: "bg-orange-400 text-orange-950",
  aprovado:        "bg-blue-400 text-blue-950",
  agendado:        "bg-amber-800 text-amber-50",
  publicado:       "bg-green-400 text-green-950",
}

const STATUS_LABELS: Record<string, string> = {
  planejado:       "Planejado",
  falta_insumo:    "Falta Insumo",
  producao:        "Em Produção",
  aprovado_design: "Aprovação Design",
  aprovado:        "P/ Aprovação Cliente",
  agendado:        "Agendado",
  publicado:       "Postado",
}

const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
]

interface CalendarioPlanProps {
  posts: Post[]
  ano: number
  mes: number // 0-based
  showLegend?: boolean
  onPostClick?: (post: Post) => void
}

export function CalendarioPlan({ posts, ano, mes, showLegend = true, onPostClick }: CalendarioPlanProps) {
  const feriados = getFeriadosBrasil(ano)
  const today = new Date()
  const primeiroDia = new Date(ano, mes, 1)
  const totalDias = new Date(ano, mes + 1, 0).getDate()
  let inicioCelula = primeiroDia.getDay() - 1
  if (inicioCelula < 0) inicioCelula = 6

  const postsByDate = new Map<string, Post[]>()
  posts.forEach((p) => {
    if (!p.data_publicacao) return
    const key = p.data_publicacao.slice(0, 10)
    if (!postsByDate.has(key)) postsByDate.set(key, [])
    postsByDate.get(key)!.push(p)
  })

  const celulas: (number | null)[] = [
    ...Array(inicioCelula).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ]
  while (celulas.length % 7 !== 0) celulas.push(null)

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Cabeçalho */}
      <div className="px-5 py-3 border-b bg-muted/30">
        <h2 className="text-base font-black capitalize text-center">{MESES[mes]} {ano}</h2>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 border-b">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-bold text-muted-foreground uppercase tracking-wide border-r last:border-r-0">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {celulas.map((dia, idx) => {
          if (dia === null) {
            return <div key={`e-${idx}`} className="border-r border-b last:border-r-0 bg-muted/20 min-h-[100px]" />
          }
          const key = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
          const feriado = feriados.get(key)
          const dayPosts = postsByDate.get(key) ?? []
          const isToday = dia === today.getDate() && mes === today.getMonth() && ano === today.getFullYear()
          const colIdx = (inicioCelula + dia - 1) % 7
          const isWeekend = colIdx === 5 || colIdx === 6

          return (
            <div
              key={key}
              className={`border-r border-b last:border-r-0 min-h-[100px] p-1.5 flex flex-col gap-1
                ${feriado
                  ? "bg-purple-100 dark:bg-purple-900/40"
                  : isWeekend
                  ? "bg-muted/30"
                  : "bg-background"
                }`}
            >
              <div className="flex items-start gap-1">
                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shrink-0
                  ${isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  {dia}
                </span>
                {feriado && (
                  <span className="text-[9px] font-bold text-purple-700 dark:text-purple-300 leading-tight line-clamp-2 flex-1">
                    {feriado}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                {dayPosts.slice(0, 4).map((post) => (
                  onPostClick ? (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => onPostClick(post)}
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded truncate leading-tight text-left w-full hover:opacity-80 transition-opacity cursor-pointer ${STATUS_COLORS[post.status] ?? "bg-gray-200 text-gray-700"}`}
                      title={post.titulo}
                    >
                      {post.titulo}
                    </button>
                  ) : (
                    <span
                      key={post.id}
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded truncate leading-tight ${STATUS_COLORS[post.status] ?? "bg-gray-200 text-gray-700"}`}
                      title={post.titulo}
                    >
                      {post.titulo}
                    </span>
                  )
                ))}
                {dayPosts.length > 4 && (
                  <span className="text-[10px] text-muted-foreground px-1">+{dayPosts.length - 4} mais</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showLegend && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 px-5 py-3 border-t bg-muted/20">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={`h-3 w-3 rounded-sm ${STATUS_COLORS[status]}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-purple-200 border border-purple-300" />
            <span className="text-xs text-muted-foreground">Feriado</span>
          </div>
        </div>
      )}
    </div>
  )
}
