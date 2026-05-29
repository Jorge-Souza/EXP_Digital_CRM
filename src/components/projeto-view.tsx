"use client"

import { useState } from "react"
import Link from "next/link"
import { LayoutKanban, CalendarDays, CalendarRange, FlaskConical, FileText } from "lucide-react"
import { CalendarioMes } from "@/components/calendario-mes"
import { LaboratorioTab } from "@/components/laboratorio-tab"
import { ContratoTab } from "@/components/contrato-tab"
import { PublicacoesKanban } from "@/components/publicacoes-kanban"
import type { Post, Profile, ReferenciaLaboratorio, ServicoAdicional, Client } from "@/lib/types"

type PostWithClient = Post & { clients: Pick<Client, "id" | "nome"> | null }

interface ContratoInfo {
  nome: string | null
  inicio: string | null
  duracaoMeses: number | null
  valor: number | null
  downloadUrl: string | null
  servicosAdicionais: ServicoAdicional[]
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
  const [view, setView] = useState<"kanban" | "calendario" | "laboratorio" | "contrato">("calendario")

  const btnClass = (v: typeof view) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
      view === v ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
    }`

  // Posts aprovados para o Calendário Oficial
  const postsOficiais = posts.filter(p => p.aprovado && p.status !== "planejado")

  // Posts com cliente embutido para o Kanban
  const postsWithClient: PostWithClient[] = posts.map(p => ({
    ...p,
    clients: { id: clientId, nome: clientNome },
  }))

  return (
    <div className="space-y-4">
      {/* Toggle de visualização */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit flex-wrap">
        <button onClick={() => setView("calendario")} className={btnClass("calendario")}>
          <CalendarDays className="h-4 w-4" />
          Calendário Oficial
        </button>
        <button onClick={() => setView("kanban")} className={btnClass("kanban")}>
          <LayoutKanban className="h-4 w-4" />
          Kanban
        </button>
        <Link
          href={`/clientes/${clientId}/planejamento`}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all text-muted-foreground hover:text-foreground"
        >
          <CalendarRange className="h-4 w-4" />
          Planejamento
        </Link>
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

      {view === "calendario" && (
        <CalendarioMes posts={postsOficiais} clientId={clientId} />
      )}

      {view === "kanban" && (
        <PublicacoesKanban
          posts={postsWithClient}
          clients={[{ id: clientId, nome: clientNome }]}
          profiles={profiles}
        />
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
          contratoValor={contrato.valor}
          contratoDownloadUrl={contrato.downloadUrl}
          servicosAdicionais={contrato.servicosAdicionais}
        />
      )}
    </div>
  )
}
