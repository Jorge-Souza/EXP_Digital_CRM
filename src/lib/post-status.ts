export const statusConfig = {
  planejado:      { label: "Falta Fazer",         color: "bg-gray-400",    badge: "outline" as const },
  falta_insumo:   { label: "Falta Insumo",        color: "bg-red-500",     badge: "destructive" as const },
  producao:       { label: "Em Produção",          color: "bg-yellow-500",  badge: "secondary" as const },
  aprovado_design:{ label: "Aprovação Design",     color: "bg-orange-500",  badge: "secondary" as const },
  aprovado:       { label: "P/ Aprovação Cliente", color: "bg-blue-500",    badge: "default" as const },
  agendado:       { label: "Agendado",             color: "bg-amber-800",   badge: "secondary" as const },
  publicado:      { label: "Postado",              color: "bg-green-500",   badge: "default" as const },
} as const

export const groupOrder = [
  "planejado", "falta_insumo", "producao", "aprovado_design", "aprovado", "agendado", "publicado"
] as const
