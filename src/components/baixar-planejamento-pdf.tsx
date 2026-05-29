"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import type { Client, Planejamento, Post } from "@/lib/types"

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
]

const DIAS_SEMANA_CURTO = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

const TYPE_LABELS: Record<string, string> = {
  feed: "Feed", reels: "Reels", story: "Story", tiktok: "TikTok", carrossel: "Carrossel",
}

const TYPE_LABELS_PDF: Record<string, string> = {
  feed: "ESTÁTICO", reels: "REELS", story: "STORIES", tiktok: "TIKTOK", carrossel: "CARROSSEL",
}

const TYPE_COLORS_PDF: Record<string, { bg: string; text: string }> = {
  feed:      { bg: "#fef9c3", text: "#854d0e" },
  reels:     { bg: "#fce7f3", text: "#9d174d" },
  story:     { bg: "#ede9fe", text: "#6b21a8" },
  tiktok:    { bg: "#fee2e2", text: "#991b1b" },
  carrossel: { bg: "#dbeafe", text: "#1e40af" },
}

const DATA_PALETTE_PDF = [
  { bg: "#fbbf24", text: "#78350f" },
  { bg: "#f43f5e", text: "#fff" },
  { bg: "#16a34a", text: "#fff" },
  { bg: "#7c3aed", text: "#fff" },
  { bg: "#dc2626", text: "#fff" },
  { bg: "#0891b2", text: "#fff" },
  { bg: "#ea580c", text: "#fff" },
  { bg: "#db2777", text: "#fff" },
]

const STATUS_LABELS: Record<string, string> = {
  planejado: "Planejado", falta_insumo: "Falta Insumo", producao: "Em Produção",
  aprovado_design: "Aprovação Design", aprovado: "P/ Aprovação", agendado: "Agendado", publicado: "Postado",
}

const STATUS_BG: Record<string, string> = {
  planejado:       "#d1d5db",
  falta_insumo:    "#fca5a5",
  producao:        "#fde047",
  aprovado_design: "#fb923c",
  aprovado:        "#60a5fa",
  agendado:        "#92400e",
  publicado:       "#4ade80",
}

const STATUS_COLOR: Record<string, string> = {
  planejado:       "#374151",
  falta_insumo:    "#450a0a",
  producao:        "#713f12",
  aprovado_design: "#431407",
  aprovado:        "#1e3a5f",
  agendado:        "#fef3c7",
  publicado:       "#052e16",
}

function calcularPascoa(year: number): Date {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100
  const d = Math.floor(b / 4), e = b % 4
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month, day)
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date); d.setDate(d.getDate() + days); return d
}

function toKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function getFeriadosBrasil(year: number): Map<string, string> {
  const f = new Map<string, string>()
  const add = (date: Date, nome: string) => f.set(toKey(date), nome)
  const d = (m: number, day: number) => new Date(year, m - 1, day)
  add(d(1, 1),   "Confraternização Universal")
  add(d(4, 21),  "Tiradentes")
  add(d(5, 1),   "Dia do Trabalho")
  add(d(9, 7),   "Independência")
  add(d(10, 12), "N. Sra. Aparecida")
  add(d(11, 2),  "Finados")
  add(d(11, 15), "Proclamação da República")
  add(d(11, 20), "Consciência Negra")
  add(d(12, 25), "Natal")
  const pascoa = calcularPascoa(year)
  add(addDays(pascoa, -48), "Carnaval")
  add(addDays(pascoa, -47), "Carnaval")
  add(addDays(pascoa, -2),  "Sexta-feira Santa")
  add(pascoa,               "Páscoa")
  add(addDays(pascoa, 60),  "Corpus Christi")
  return f
}

interface Props {
  planejamento: Planejamento
  client: Client
  posts: Post[]
  mes: string // YYYY-MM
}

export function BaixarPlanejamentoPDF({ planejamento, client, posts, mes }: Props) {
  const [loading, setLoading] = useState(false)

  function gerarHTML(): string {
    const [ano, month] = mes.split("-").map(Number)
    const mesIndex = month - 1
    const mesNome = MESES[mesIndex]
    const feriados = getFeriadosBrasil(ano)

    // Build calendar grid
    const primeiroDia = new Date(ano, mesIndex, 1)
    const totalDias = new Date(ano, mesIndex + 1, 0).getDate()
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

    // Mapa de eventos (datas comemorativas ativas → cor)
    const datasAtivas = planejamento.datas_comemorativas.filter(d => d.ativo)
    const eventoMapPDF = new Map<string, { nome: string; bg: string; text: string }>()
    datasAtivas.forEach((d, idx) => {
      const p = DATA_PALETTE_PDF[idx % DATA_PALETTE_PDF.length]
      eventoMapPDF.set(d.data, { nome: d.nome, bg: p.bg, text: p.text })
    })

    // Datas principais acima do calendário
    const datasHeaderHTML = datasAtivas.length === 0 ? "" : `
      <div class="datas-principais">
        ${datasAtivas.map((d, idx) => {
          const p = DATA_PALETTE_PDF[idx % DATA_PALETTE_PDF.length]
          const fmt = new Date(d.data + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "")
          return `<span class="data-pill" style="background:${p.bg};color:${p.text}">${d.nome} · ${fmt}</span>`
        }).join("")}
      </div>`

    // Calendar cells HTML
    const calendarCells = celulas.map((dia, idx) => {
      if (dia === null) {
        return `<div class="cal-cell cal-empty"></div>`
      }
      const key = `${ano}-${String(mesIndex + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
      const feriado = feriados.get(key)
      const evento = eventoMapPDF.get(key)
      const dayPosts = postsByDate.get(key) ?? []
      const colIdx = (inicioCelula + dia - 1) % 7
      const isWeekend = colIdx === 5 || colIdx === 6

      const headerBg = evento ? evento.bg : feriado ? "#bae6fd" : isWeekend ? "#f1f5f9" : "#ffffff"
      const headerText = evento ? evento.text : feriado ? "#075985" : "#6b7280"
      const eventLabel = evento
        ? `<span class="cal-evento-label" style="color:${evento.text}">${evento.nome}</span>`
        : feriado
        ? `<span class="cal-evento-label" style="color:#075985">${feriado}</span>`
        : ""

      const postsHTML = dayPosts.slice(0, 3).map(p => {
        const tc = TYPE_COLORS_PDF[p.tipo] ?? { bg: "#f3f4f6", text: "#374151" }
        const desc = (p.tema || p.titulo).substring(0, 120)
        return `
          <div class="cal-post-card" style="background:${tc.bg}">
            <div class="cal-type-label" style="color:${tc.text}">${TYPE_LABELS_PDF[p.tipo] ?? p.tipo}</div>
            <div class="cal-desc" style="color:${tc.text}">${desc}</div>
          </div>`
      }).join("")

      const maisHTML = dayPosts.length > 3
        ? `<div class="cal-mais">+${dayPosts.length - 3} mais</div>`
        : ""

      return `
        <div class="cal-cell${isWeekend && !evento ? " cal-weekend" : ""}">
          <div class="cal-day-hdr" style="background:${headerBg}">
            <span class="cal-day-num" style="color:${headerText}">${dia}</span>
            ${eventLabel}
          </div>
          <div class="cal-posts-area">
            ${postsHTML}
            ${maisHTML}
          </div>
        </div>`
    }).join("")

    // Posts table rows
    const postsComData = [...posts].filter(p => p.data_publicacao).sort((a, b) =>
      (a.data_publicacao ?? "").localeCompare(b.data_publicacao ?? "")
    )
    const postsSemData = posts.filter(p => !p.data_publicacao)
    const postsSorted = [...postsComData, ...postsSemData]

    const tableRows = postsSorted.map(p => {
      const data = p.data_publicacao
        ? new Date(p.data_publicacao + "T00:00:00").toLocaleDateString("pt-BR")
        : "—"
      const bg = STATUS_BG[p.status] ?? "#e5e7eb"
      const color = STATUS_COLOR[p.status] ?? "#374151"
      return `
        <tr>
          <td><strong>${p.titulo}</strong>${p.tema ? `<br><small style="color:#6b7280">${p.tema}</small>` : ""}</td>
          <td>${TYPE_LABELS[p.tipo] ?? p.tipo}</td>
          <td>${data}</td>
          <td>${p.plataforma ?? "—"}</td>
          <td><span class="status-badge" style="background:${bg};color:${color}">${STATUS_LABELS[p.status] ?? p.status}</span></td>
        </tr>`
    }).join("")

    // Datas comemorativas ativas (datasAtivas já declarado acima)
    const datasHTML = datasAtivas.length === 0
      ? `<p class="empty-text">Nenhuma data comemorativa ativa para este mês.</p>`
      : datasAtivas.map(d => {
          const dataFmt = new Date(d.data + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })
          return `
            <div class="data-item">
              <div class="data-item-header">
                <span class="data-emoji">📅</span>
                <strong>${d.nome}</strong>
                <span class="data-date">${dataFmt}</span>
              </div>
              ${d.ideia ? `<p class="data-ideia">${d.ideia}</p>` : ""}
            </div>`
        }).join("")

    // Legend items
    const legendItems = Object.entries(STATUS_LABELS).map(([status, label]) => {
      const bg = STATUS_BG[status] ?? "#e5e7eb"
      const color = STATUS_COLOR[status] ?? "#374151"
      return `<span class="legend-item"><span class="legend-dot" style="background:${bg}"></span>${label}</span>`
    }).join("")

    const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Planejamento ${mesNome} ${ano} — ${client.nome}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 12px;
      color: #111827;
      background: #fff;
      line-height: 1.5;
    }

    /* ─── CAPA ─── */
    .cover {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%);
      color: #fff;
      text-align: center;
      padding: 60px 40px;
      page-break-after: always;
    }
    .cover-badge {
      display: inline-block;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 999px;
      padding: 6px 18px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 32px;
    }
    .cover-client {
      font-size: 42px;
      font-weight: 900;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
      text-shadow: 0 2px 16px rgba(0,0,0,0.3);
    }
    .cover-mes {
      font-size: 22px;
      font-weight: 400;
      opacity: 0.85;
      text-transform: capitalize;
      margin-bottom: 48px;
    }
    .cover-divider {
      width: 80px;
      height: 3px;
      background: rgba(255,255,255,0.4);
      border-radius: 2px;
      margin: 0 auto 48px;
    }
    .cover-meta {
      font-size: 11px;
      opacity: 0.6;
    }
    .cover-stats {
      display: flex;
      gap: 40px;
      justify-content: center;
      margin-top: 40px;
    }
    .cover-stat {
      text-align: center;
    }
    .cover-stat-num {
      font-size: 36px;
      font-weight: 900;
      display: block;
    }
    .cover-stat-label {
      font-size: 11px;
      opacity: 0.7;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    /* ─── SECTIONS ─── */
    .page {
      padding: 48px 48px 32px;
      page-break-inside: avoid;
    }
    .section {
      margin-bottom: 40px;
    }
    .section-title {
      font-size: 15px;
      font-weight: 800;
      color: #1e1b4b;
      border-bottom: 2px solid #e0e7ff;
      padding-bottom: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title span { font-size: 17px; }

    /* ─── OBJETIVO ─── */
    .objetivo-box {
      background: linear-gradient(135deg, #f0f4ff 0%, #ede9fe 100%);
      border-left: 4px solid #4f46e5;
      border-radius: 8px;
      padding: 18px 20px;
      font-size: 13px;
      color: #1e1b4b;
      white-space: pre-wrap;
      line-height: 1.7;
    }
    .objetivo-empty {
      color: #9ca3af;
      font-style: italic;
    }

    /* ─── DATAS COMEMORATIVAS ─── */
    .datas-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .data-item {
      border: 1px solid #e0e7ff;
      border-radius: 8px;
      padding: 12px 14px;
      background: #fafafa;
    }
    .data-item-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .data-emoji { font-size: 15px; }
    .data-date {
      margin-left: auto;
      font-size: 10px;
      color: #6b7280;
      background: #f3f4f6;
      padding: 2px 8px;
      border-radius: 999px;
    }
    .data-ideia {
      font-size: 11px;
      color: #4b5563;
      line-height: 1.5;
      padding-top: 4px;
      border-top: 1px solid #e5e7eb;
      margin-top: 6px;
    }
    .empty-text {
      color: #9ca3af;
      font-style: italic;
      font-size: 12px;
    }

    /* ─── DATAS PRINCIPAIS ─── */
    .datas-principais {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;
    }
    .data-pill {
      display: inline-block;
      font-size: 9px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 999px;
    }

    /* ─── CALENDÁRIO ─── */
    .calendar-wrap { page-break-inside: avoid; }
    .cal-header-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: #1f2937;
      border-radius: 6px 6px 0 0;
      overflow: hidden;
    }
    .cal-header-cell {
      padding: 7px 4px;
      text-align: center;
      font-size: 9px;
      font-weight: 700;
      color: rgba(255,255,255,0.85);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-right: 1px solid rgba(255,255,255,0.1);
    }
    .cal-header-cell:last-child { border-right: none; }
    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      border-left: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
      border-radius: 0 0 6px 6px;
      overflow: hidden;
    }
    .cal-cell {
      min-height: 95px;
      border-right: 1px solid #e5e7eb;
      border-top: 1px solid #e5e7eb;
      background: #fff;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .cal-empty { background: #f9fafb; }
    .cal-weekend { background: #f9fafb; }
    .cal-day-hdr {
      display: flex;
      align-items: center;
      gap: 3px;
      padding: 3px 5px;
    }
    .cal-day-num {
      font-size: 10px;
      font-weight: 900;
      min-width: 16px;
      text-align: center;
    }
    .cal-evento-label {
      font-size: 7.5px;
      font-weight: 700;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .cal-posts-area {
      padding: 3px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }
    .cal-post-card {
      border-radius: 3px;
      padding: 2px 4px;
    }
    .cal-type-label {
      font-size: 7px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      line-height: 1;
    }
    .cal-desc {
      font-size: 8px;
      line-height: 1.3;
      margin-top: 1px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .cal-mais {
      font-size: 7.5px;
      color: #9ca3af;
      padding: 0 4px;
    }

    /* ─── TABELA DE POSTS ─── */
    .posts-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .posts-table thead tr {
      background: #1e1b4b;
      color: #fff;
    }
    .posts-table th {
      padding: 9px 10px;
      text-align: left;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .posts-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
    }
    .posts-table tbody tr:nth-child(even) td { background: #f9fafb; }
    .posts-table tbody tr:last-child td { border-bottom: none; }
    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 9.5px;
      font-weight: 700;
      white-space: nowrap;
    }
    .table-wrap {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    /* ─── SUGESTÕES ─── */
    .sugestoes-box {
      background: #f0fdf4;
      border-left: 4px solid #22c55e;
      border-radius: 8px;
      padding: 18px 20px;
      font-size: 12px;
      color: #14532d;
      white-space: pre-wrap;
      line-height: 1.7;
    }

    /* ─── OPORTUNIDADES ─── */
    .oportunidades-box {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-left: 4px solid #16a34a;
      border-radius: 8px;
      padding: 18px 20px;
      font-size: 12px;
      color: #14532d;
      white-space: pre-wrap;
      line-height: 1.7;
    }

    /* ─── RISCOS ─── */
    .riscos-box {
      background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
      border-left: 4px solid #ea580c;
      border-radius: 8px;
      padding: 18px 20px;
      font-size: 12px;
      color: #7c2d12;
      white-space: pre-wrap;
      line-height: 1.7;
    }

    /* ─── GRID ESTRATÉGICO ─── */
    .estrategia-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    /* ─── FOOTER ─── */
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #9ca3af;
    }

    /* ─── HEADER COMPACTO ─── */
    .compact-header {
      background: linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%);
      color: #fff;
      padding: 20px 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0;
    }
    .compact-agency {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      opacity: 0.6;
      margin-bottom: 6px;
    }
    .compact-client {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.02em;
    }
    .compact-period {
      font-size: 12px;
      opacity: 0.7;
      margin-top: 3px;
      text-transform: capitalize;
    }
    .compact-stats {
      display: flex;
      gap: 28px;
      text-align: center;
    }
    .compact-stat-num {
      display: block;
      font-size: 26px;
      font-weight: 900;
    }
    .compact-stat-label {
      font-size: 9px;
      opacity: 0.6;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    /* ─── PRINT ─── */
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .calendar-wrap { page-break-before: always; }
      .posts-section { page-break-before: always; }
      @page { margin: 0; size: A4; }
    }
  </style>
</head>
<body>

  <!-- HEADER COMPACTO -->
  <div class="compact-header">
    <div>
      <div class="compact-agency">EXP Digital CRM</div>
      <div class="compact-client">${client.avatar_emoji ?? "🏢"} ${client.nome}</div>
      <div class="compact-period">Planejamento de Conteúdo · ${mesNome} ${ano}</div>
    </div>
    <div class="compact-stats">
      <div>
        <span class="compact-stat-num">${posts.length}</span>
        <span class="compact-stat-label">Conteúdos</span>
      </div>
      <div>
        <span class="compact-stat-num">${postsComData.length}</span>
        <span class="compact-stat-label">Com Data</span>
      </div>
      <div>
        <span class="compact-stat-num">${datasAtivas.length}</span>
        <span class="compact-stat-label">Datas</span>
      </div>
    </div>
  </div>

  <!-- CONTEÚDO -->
  <div class="page">

    <!-- Objetivo -->
    <div class="section">
      <div class="section-title"><span>🎯</span> Objetivo Principal do Mês</div>
      ${planejamento.objetivo_mes
        ? `<div class="objetivo-box">${planejamento.objetivo_mes}</div>`
        : `<div class="objetivo-box"><span class="objetivo-empty">Nenhum objetivo definido para este mês.</span></div>`
      }
    </div>

    <!-- Oportunidades e Riscos -->
    ${(planejamento.oportunidades || planejamento.riscos) ? `
    <div class="section">
      <div class="estrategia-grid">
        ${planejamento.oportunidades ? `
        <div>
          <div class="section-title"><span>🚀</span> Oportunidades do Mês</div>
          <div class="oportunidades-box">${planejamento.oportunidades}</div>
        </div>` : ""}
        ${planejamento.riscos ? `
        <div>
          <div class="section-title"><span>⚠️</span> Riscos e Pontos de Atenção</div>
          <div class="riscos-box">${planejamento.riscos}</div>
        </div>` : ""}
      </div>
    </div>` : ""}

    <!-- Datas Comemorativas -->
    <div class="section">
      <div class="section-title"><span>📅</span> Datas Comemorativas Ativas <small style="font-size:11px;font-weight:400;color:#6b7280">(${datasAtivas.length} de ${planejamento.datas_comemorativas.length})</small></div>
      <div class="datas-grid">${datasHTML}</div>
    </div>

    <!-- Calendário -->
    <div class="section calendar-wrap">
      <div class="section-title"><span>📆</span> Calendário de Publicações — ${mesNome} ${ano}</div>
      ${datasHeaderHTML}
      <div class="cal-header-row">
        ${DIAS_SEMANA_CURTO.map(d => `<div class="cal-header-cell">${d}</div>`).join("")}
      </div>
      <div class="cal-grid">
        ${calendarCells}
      </div>
    </div>

    <!-- Lista de Conteúdos -->
    <div class="section posts-section">
      <div class="section-title"><span>📋</span> Conteúdos do Mês <small style="font-size:11px;font-weight:400;color:#6b7280">(${posts.length} publicações)</small></div>
      ${posts.length === 0
        ? `<p class="empty-text">Nenhum conteúdo cadastrado para este mês.</p>`
        : `<div class="table-wrap">
            <table class="posts-table">
              <thead>
                <tr>
                  <th>Título / Tema</th>
                  <th>Tipo</th>
                  <th>Data</th>
                  <th>Plataforma</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>`
      }
    </div>

    <!-- Sugestões de Ações -->
    ${planejamento.sugestoes_acoes ? `
    <div class="section">
      <div class="section-title"><span>💡</span> Sugestões de Ações</div>
      <div class="sugestoes-box">${planejamento.sugestoes_acoes}</div>
    </div>` : ""}

    <div class="footer">
      <span>EXP Digital CRM · ${client.nome}</span>
      <span>Planejamento ${mesNome} ${ano} · Gerado em ${hoje}</span>
    </div>

  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`
  }

  function handleDownload() {
    setLoading(true)
    try {
      const html = gerarHTML()
      const blob = new Blob([html], { type: "text/html;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const win = window.open(url, "_blank")
      if (!win) {
        alert("Permita popups para este site para baixar o relatório.")
      }
      // Revoke after a delay to allow the new tab to load
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } finally {
      setTimeout(() => setLoading(false), 1000)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={loading}
      className="gap-2"
      id="btn-baixar-planejamento-pdf"
    >
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : <Download className="h-4 w-4" />
      }
      {loading ? "Gerando..." : "Baixar Planejamento"}
    </Button>
  )
}
