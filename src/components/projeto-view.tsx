"use client"

import { useState } from "react"
import Link from "next/link"
import { LayoutList, CalendarDays, CalendarRange, FlaskConical, FileText } from "lucide-react"
import { ProjetoCliente } from "@/components/projeto-cliente"
import { CalendarioMes } from "@/components/calendario-mes"
import { LaboratorioTab } from "@/components/laboratorio-tab"
import { ContratoTab } from "@/components/contrato-tab"
import type { Post, Profile, ReferenciaLaboratorio } from "@/lib/types"

interface ContratoInfo {
  nome: string | null
  inicio: string | null
  duracaoMeses: number | null
  downloadUrl: string | null
}

interface ProjetoViewProps {
  clientId: string
  clientNome: string
  posts: Post[]
  initialRefs: ReferenciaLaboratorio[]
  profiles: Pick<Profile, "id" | "nome">[]
  isAdmin?: boolean
  contrato?: ContratoInfo
}

export function ProjetoView({ clientId, clientNome, posts, initialRefs, profiles, isAdmin, contrato }: ProjetoViewProps) {
  const [view, setView] = useState<"lista" | "calendario" | "laboratorio" | "contrato">("lista")

  const btnClass = (v: typeof view) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
      view === v ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
    }`

  return (
    <div className="space-y-4">
      {/* Toggle de visualização */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit flex-wrap">
        <button onClick={() => setView("lista")} className={btnClass("lista")}>
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
        <button onClick={() => setView("calendario")} className={btnClass("calendario")}>
          <CalendarDays className="h-4 w-4" />
          Calendário Oficial
        </button>
        <button onClick={() => setView("laboratorio")} className={btnClass("laboratorio")}>
          <FlaskConical className="h-4 w-4" />
          Laboratório
        </button>
        {isAdmin && (
          <button onClick={() => setView("contrato")} className={btnClass("contrato")}>
            <FileText className="h-4 w-4" />
            Contrato
          </button>
        )}
      </div>

      {view === "lista" && <ProjetoCliente clientId={clientId} posts={posts} profiles={profiles} />}
      {view === "calendario" && (
        <CalendarioMes posts={posts.filter(p => p.aprovado && p.status !== "planejado")} clientId={clientId} />
      )}
      {view === "laboratorio" && (
        <LaboratorioTab clientId={clientId} clientNome={clientNome} initialRefs={initialRefs} />
      )}
      {view === "contrato" && isAdmin && contrato && (
        <ContratoTab
          clientId={clientId}
          clientNome={clientNome}
          contratoNome={contrato.nome}
          contratoInicio={contrato.inicio}
          contratoDuracaoMeses={contrato.duracaoMeses}
          contratoDownloadUrl={contrato.downloadUrl}
        />
      )}
    </div>
  )
}
