export const statusConfig = {
  planejado:       { label: "Planejado",            color: "bg-gray-400",    badge: "outline" as const },
  a_fazer:         { label: "A Fazer",              color: "bg-slate-500",   badge: "outline" as const },
  falta_insumo:    { label: "Falta Insumo",        color: "bg-red-500",     badge: "destructive" as const },
  producao:        { label: "Em Produção",          color: "bg-yellow-500",  badge: "secondary" as const },
  aprovado_design: { label: "Aprovação Design",    color: "bg-orange-500",  badge: "secondary" as const },
  aprovado:        { label: "P/ Aprovação Cliente", color: "bg-blue-500",    badge: "default" as const },
  agendado:        { label: "Agendado",             color: "bg-amber-800",   badge: "secondary" as const },
  publicado:       { label: "Postado",              color: "bg-green-500",   badge: "default" as const },
} as const

export const groupOrder = [
  "planejado", "a_fazer", "falta_insumo", "producao", "aprovado_design", "aprovado", "agendado", "publicado",
] as const

export const typeLabels: Record<string, string> = {
  feed: "Feed",
  reels: "Reels",
  story: "Story",
  tiktok: "TikTok",
  carrossel: "Carrossel",
}

export const typeColors: Record<string, { bar: string; badge: string; border: string }> = {
  feed:      { bar: "bg-blue-400",   badge: "bg-blue-100 text-blue-700",     border: "border-l-blue-400 bg-blue-50/50 dark:bg-blue-950/20" },
  reels:     { bar: "bg-pink-400",   badge: "bg-pink-100 text-pink-700",     border: "border-l-pink-400 bg-pink-50/50 dark:bg-pink-950/20" },
  story:     { bar: "bg-amber-400",  badge: "bg-amber-100 text-amber-700",   border: "border-l-amber-400 bg-amber-50/50 dark:bg-amber-950/20" },
  carrossel: { bar: "bg-violet-400", badge: "bg-violet-100 text-violet-700", border: "border-l-violet-400 bg-violet-50/50 dark:bg-violet-950/20" },
  tiktok:    { bar: "bg-cyan-400",   badge: "bg-cyan-100 text-cyan-700",     border: "border-l-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20" },
}

export const columnConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  planejado:       { label: "Planejado",         color: "border-t-gray-400",   bg: "bg-gray-100 dark:bg-gray-800",       dot: "bg-gray-400" },
  a_fazer:         { label: "A Fazer",           color: "border-t-slate-500",  bg: "bg-slate-50 dark:bg-slate-900/40",   dot: "bg-slate-500" },
  falta_insumo:    { label: "Falta Insumo",     color: "border-t-red-500",    bg: "bg-red-50 dark:bg-red-950/30",       dot: "bg-red-500" },
  producao:        { label: "Em Produção",       color: "border-t-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30", dot: "bg-yellow-500" },
  aprovado_design: { label: "Aprovação Design", color: "border-t-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", dot: "bg-orange-500" },
  aprovado:        { label: "P/ Aprovação",      color: "border-t-blue-500",   bg: "bg-blue-50 dark:bg-blue-950/30",     dot: "bg-blue-500" },
  agendado:        { label: "Agendado",          color: "border-t-amber-800",  bg: "bg-amber-50 dark:bg-amber-950/30",   dot: "bg-amber-800" },
  publicado:       { label: "Postado ✅",        color: "border-t-green-500",  bg: "bg-green-50 dark:bg-green-950/30",   dot: "bg-green-500" },
}
