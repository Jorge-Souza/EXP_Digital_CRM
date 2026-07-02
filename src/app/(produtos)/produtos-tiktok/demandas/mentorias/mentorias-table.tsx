"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronRight, GraduationCap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Mentoria, MentoriaStatus } from "@/lib/types"

const STATUS_COR: Record<MentoriaStatus, string> = {
  nao_agendada: "bg-gray-500/10 text-gray-500 border-gray-400/20",
  agendada:     "bg-blue-500/15 text-blue-600 border-blue-500/30",
  executada:    "bg-green-500/15 text-green-700 border-green-500/30",
  cancelada:    "bg-red-500/15 text-red-600 border-red-500/30",
}

const STATUS_LABEL: Record<MentoriaStatus, string> = {
  nao_agendada: "Não agendada",
  agendada: "Agendada",
  executada: "Executada",
  cancelada: "Cancelada",
}

function fmtData(iso: string | null, hora: string | null) {
  if (!iso) return "—"
  const data = new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
  return hora ? `${data} ${hora.slice(0, 5)}` : data
}

function fmtValor(n: number | null) {
  if (n == null) return "—"
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function MentoriasTable({ mentorias }: { mentorias: Mentoria[] }) {
  const [statusFiltro, setStatusFiltro] = useState<string>("todos")
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos")

  const tipos = useMemo(
    () => Array.from(new Set(mentorias.map(m => m.tipo))).sort(),
    [mentorias]
  )

  const lista = useMemo(() => mentorias.filter(m =>
    (statusFiltro === "todos" || m.status === statusFiltro) &&
    (tipoFiltro === "todos" || m.tipo === tipoFiltro)
  ), [mentorias, statusFiltro, tipoFiltro])

  return (
    <Card>
      <CardContent className="p-0">
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b">
          <Select value={statusFiltro} onValueChange={v => v && setStatusFiltro(v)}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {(Object.keys(STATUS_LABEL) as MentoriaStatus[]).map(s => (
                <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tipoFiltro} onValueChange={v => v && setTipoFiltro(v)}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              {tipos.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-auto">{lista.length} de {mentorias.length}</span>
        </div>

        {/* Cabeçalho */}
        <div className="grid grid-cols-[1fr_140px_130px_110px_100px_32px] gap-4 px-5 py-3 border-b">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cliente / Tipo</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sessão</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valor</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pagamento</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
          <span />
        </div>

        {lista.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <GraduationCap size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Nenhuma mentoria encontrada.</p>
          </div>
        )}

        {lista.map((m, i) => (
          <Link key={m.id} href={`/produtos-tiktok/demandas/mentorias/${m.id}`}
            className={`grid grid-cols-[1fr_140px_130px_110px_100px_32px] gap-4 px-5 py-4 items-center hover:bg-accent transition-colors ${i < lista.length - 1 ? "border-b" : ""}`}>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{m.cliente_nome}</p>
              <p className="text-muted-foreground text-xs truncate">{m.tipo}</p>
            </div>
            <p className="text-muted-foreground text-sm">{fmtData(m.data_sessao, m.hora_sessao)}</p>
            <p className="text-sm font-semibold">{fmtValor(m.valor)}</p>
            <Badge variant="outline" className={`text-xs w-fit ${m.pago ? "bg-green-500/15 text-green-700 border-green-500/30" : "bg-yellow-500/15 text-yellow-700 border-yellow-500/30"}`}>
              {m.pago ? "Pago" : "Pendente"}
            </Badge>
            <Badge variant="outline" className={`text-xs w-fit ${STATUS_COR[m.status]}`}>{STATUS_LABEL[m.status]}</Badge>
            <ChevronRight size={15} className="text-muted-foreground" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
