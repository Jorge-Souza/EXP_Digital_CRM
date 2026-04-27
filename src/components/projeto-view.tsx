"use client"

import { useState } from "react"
import Link from "next/link"
import { LayoutList, CalendarDays, CalendarRange } from "lucide-react"
import { ProjetoCliente } from "@/components/projeto-cliente"
import { CalendarioMes } from "@/components/calendario-mes"
import type { Post } from "@/lib/types"

interface ProjetoViewProps {
  clientId: string
  posts: Post[]
}

export function ProjetoView({ clientId, posts }: ProjetoViewProps) {
  const [view, setView] = useState<"lista" | "calendario">("lista")

  return (
    <div className="space-y-4">
      {/* Toggle de visualização */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
        <button
          onClick={() => setView("lista")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
            view === "lista"
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutList className="h-4 w-4" />
          Lista
        </button>
        <Link
          href={`/clientes/${clientId}/planejamento`}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all text-muted-foreground hover:text-foreground"
        >
          <CalendarRange className="h-4 w-4" />
          Planejamento
        </Link>
        <button
          onClick={() => setView("calendario")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
            view === "calendario"
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          Calendário Oficial
        </button>
      </div>

      {view === "lista"
        ? <ProjetoCliente clientId={clientId} posts={posts} />
        : <CalendarioMes posts={posts.filter(p => p.aprovado && p.status !== "planejado")} clientId={clientId} />
      }
    </div>
  )
}
