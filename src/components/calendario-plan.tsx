"use client"

import { Plus } from "lucide-react"
import { getFeriadosBrasil } from "@/lib/holidays"
import type { DataComemorativa, Post } from "@/lib/types"

const TYPE_LABELS: Record<string, string> = {
  feed:      "ESTÁTICO",
  reels:     "REELS",
  story:     "STORY",
  tiktok:    "TIKTOK",
  carrossel: "CARROSSEL",
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  feed:      { bg: "#fef9c3", text: "#854d0e" },
  reels:     { bg: "#fce7f3", text: "#9d174d" },
  story:     { bg: "#dcfce7", text: "#166534" },
  tiktok:    { bg: "#fee2e2", text: "#991b1b" },
  carrossel: { bg: "#ede9fe", text: "#5b21b6" },
}

const DATA_PALETTE = [
  { bg: "#fbbf24", text: "#78350f" },
  { bg: "#f43f5e", text: "#fff" },
  { bg: "#16a34a", text: "#fff" },
  { bg: "#7c3aed", text: "#fff" },
  { bg: "#dc2626", text: "#fff" },
  { bg: "#0891b2", text: "#fff" },
  { bg: "#ea580c", text: "#fff" },
  { bg: "#db2777", text: "#fff" },
]

const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

interface CalendarioPlanProps {
  posts: Post[]
  ano: number
  mes: number // 0-based
  datas?: DataComemorativa[]
  showLegend?: boolean
  onPostClick?: (post: Post) => void
  onNewPost?: (date: string) => void
}

export function CalendarioPlan({
  posts,
  ano,
  mes,
  datas = [],
  showLegend = true,
  onPostClick,
  onNewPost,
}: CalendarioPlanProps) {
  const feriados = getFeriadosBrasil(ano)
  const today = new Date()
  const primeiroDia = new Date(ano, mes, 1)
  const totalDias = new Date(ano, mes + 1, 0).getDate()
  let inicioCelula = primeiroDia.getDay() - 1
  if (inicioCelula < 0) inicioCelula = 6

  // Map datas comemorativas ativas → cor por índice
  const datasAtivas = datas.filter((d) => d.ativo)
  const eventoMap = new Map<string, { nome: string; palette: { bg: string; text: string } }>()
  datasAtivas.forEach((d, idx) => {
    eventoMap.set(d.data, { nome: d.nome, palette: DATA_PALETTE[idx % DATA_PALETTE.length] })
  })

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
    <div className="overflow-hidden rounded-b-xl">
      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7" style={{ background: "#1f2937" }}>
        {DIAS_SEMANA.map((d, i) => (
          <div
            key={d}
            className={`py-2.5 text-center text-xs font-bold text-white uppercase tracking-widest
              ${i < 6 ? "border-r border-gray-600" : ""}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grade do calendário */}
      <div className="grid grid-cols-7 border-l border-b border-gray-200">
        {celulas.map((dia, idx) => {
          if (dia === null) {
            return (
              <div
                key={`e-${idx}`}
                className="border-r border-t border-gray-200 min-h-[110px]"
                style={{ background: "#f9fafb" }}
              />
            )
          }

          const key = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
          const feriado = feriados.get(key)
          const evento = eventoMap.get(key)
          const dayPosts = postsByDate.get(key) ?? []
          const isToday =
            dia === today.getDate() &&
            mes === today.getMonth() &&
            ano === today.getFullYear()
          const colIdx = (inicioCelula + dia - 1) % 7
          const isWeekend = colIdx === 5 || colIdx === 6

          const headerBg = evento
            ? evento.palette.bg
            : feriado
            ? "#bae6fd"
            : isWeekend
            ? "#f1f5f9"
            : "#ffffff"

          const headerTextColor = evento
            ? evento.palette.text
            : feriado
            ? "#075985"
            : "#6b7280"

          const cellBg = isWeekend && !evento ? "#f9fafb" : "#ffffff"

          return (
            <div
              key={key}
              className="group border-r border-t border-gray-200 flex flex-col"
              style={{ background: cellBg }}
            >
              {/* Faixa de cabeçalho do dia */}
              <div
                className="flex items-center gap-1 px-1.5 py-1"
                style={{ background: headerBg }}
              >
                <span
                  className={`text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full shrink-0 ${
                    isToday ? "bg-primary text-primary-foreground" : ""
                  }`}
                  style={isToday ? undefined : { color: headerTextColor }}
                >
                  {dia}
                </span>

                {(evento || feriado) && (
                  <span
                    className="text-[9px] font-bold truncate flex-1 leading-tight"
                    style={{ color: headerTextColor }}
                  >
                    {evento ? evento.nome : feriado}
                  </span>
                )}

                {onNewPost && (
                  <button
                    type="button"
                    onClick={() => onNewPost(key)}
                    title="Novo conteúdo nesta data"
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded shrink-0"
                    style={{ color: headerTextColor }}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Posts do dia */}
              <div className="flex flex-col gap-0.5 p-1 flex-1 min-h-[90px]">
                {dayPosts.map((post) => {
                  const tc = TYPE_COLORS[post.tipo] ?? { bg: "#f3f4f6", text: "#374151" }
                  const content = (
                    <>
                      <p
                        className="text-[9px] font-black uppercase tracking-wide leading-none"
                        style={{ color: tc.text }}
                      >
                        {TYPE_LABELS[post.tipo] ?? post.tipo}
                      </p>
                      <p
                        className="text-[10px] leading-snug mt-0.5"
                        style={{ color: tc.text }}
                      >
                        {post.tema || post.titulo}
                      </p>
                    </>
                  )

                  return onPostClick ? (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => onPostClick(post)}
                      className="text-left w-full rounded p-1 hover:opacity-75 transition-opacity"
                      style={{ background: tc.bg }}
                      title={post.titulo}
                    >
                      {content}
                    </button>
                  ) : (
                    <div
                      key={post.id}
                      className="rounded p-1"
                      style={{ background: tc.bg }}
                    >
                      {content}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      {showLegend && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 px-5 py-3 border-t border-gray-200 bg-gray-50">
          {/* Tipos de conteúdo */}
          {Object.entries(TYPE_LABELS).map(([tipo, label]) => (
            <div key={tipo} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm shrink-0"
                style={{ background: TYPE_COLORS[tipo]?.bg ?? "#f3f4f6" }}
              />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
          {/* Datas comemorativas ativas */}
          {datasAtivas.map((d, idx) => (
            <div key={d.data} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm shrink-0"
                style={{ background: DATA_PALETTE[idx % DATA_PALETTE.length].bg }}
              />
              <span className="text-xs text-muted-foreground">{d.nome}</span>
            </div>
          ))}
          {/* Feriados */}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm shrink-0 bg-sky-200 border border-sky-300" />
            <span className="text-xs text-muted-foreground">Feriado</span>
          </div>
        </div>
      )}
    </div>
  )
}
