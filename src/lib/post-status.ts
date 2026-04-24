export const statusConfig = {
  planejado:    { label: "Falta Fazer",         color: "bg-gray-400",   badge: "outline" as const },
  falta_insumo: { label: "Falta Insumo",        color: "bg-red-500",    badge: "destructive" as const },
  producao:     { label: "Em Produção",          color: "bg-yellow-500", badge: "secondary" as const },
  aprovado:     { label: "P/ Aprovação Cliente", color: "bg-blue-500",   badge: "default" as const },
  publicado:    { label: "Postado",              color: "bg-green-500",  badge: "default" as const },
} as const

export const groupOrder = ["planejado", "falta_insumo", "producao", "aprovado", "publicado"] as const
