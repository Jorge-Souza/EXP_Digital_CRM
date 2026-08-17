"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"

export type LinhaRelatorio = {
  id: string
  nome: string
  loja: string | null
  status: string
  estagio: string
  saude: string
  gmv: number | null
  ultimaSessao: string | null
  proximaSessao: string | null
  diasFim: number | null
  totalSessoes: number
}

const SAUDE_EMOJI: Record<string, string> = { verde: "🟢", amarelo: "🟡", vermelho: "🔴" }
const STATUS_LABEL: Record<string, string> = { ativo: "Ativo", pausado: "Pausado", encerrado: "Encerrado", renovado: "Renovado" }

function fmtData(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function csvEscape(value: string) {
  if (/[",\n;]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function exportarCsv(linhas: LinhaRelatorio[]) {
  const header = ["Nome", "Loja", "Status", "Estágio", "Saúde", "GMV", "Última Sessão", "Próxima Sessão", "Dias até Fim", "Total Sessões Realizadas"]
  const rows = linhas.map((l) => [
    l.nome, l.loja ?? "", STATUS_LABEL[l.status] ?? l.status, l.estagio, l.saude,
    l.gmv != null ? String(l.gmv) : "", fmtData(l.ultimaSessao), fmtData(l.proximaSessao),
    l.diasFim != null ? String(l.diasFim) : "", String(l.totalSessoes),
  ])
  const csv = [header, ...rows].map((linha) => linha.map((v) => csvEscape(String(v))).join(";")).join("\n")
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `relatorio-assessoria-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function RelatorioTable({ linhas }: { linhas: LinhaRelatorio[] }) {
  const [statusFiltro, setStatusFiltro] = useState("todos")
  const [estagioFiltro, setEstagioFiltro] = useState("todos")

  const filtradas = useMemo(() => {
    return linhas.filter((l) => {
      if (statusFiltro !== "todos" && l.status !== statusFiltro) return false
      if (estagioFiltro !== "todos" && l.estagio !== estagioFiltro) return false
      return true
    })
  }, [linhas, statusFiltro, estagioFiltro])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Select value={statusFiltro} onValueChange={(v) => v && setStatusFiltro(v)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="pausado">Pausado</SelectItem>
              <SelectItem value="encerrado">Encerrado</SelectItem>
              <SelectItem value="renovado">Renovado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={estagioFiltro} onValueChange={(v) => v && setEstagioFiltro(v)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os estágios</SelectItem>
              <SelectItem value="Não iniciado">Não iniciado</SelectItem>
              <SelectItem value="Estrutura">Estrutura</SelectItem>
              <SelectItem value="Exposição">Exposição</SelectItem>
              <SelectItem value="Expansão">Expansão</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportarCsv(filtradas)}>
          <Download className="mr-1.5 h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Nome</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Estágio</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Saúde</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wide">GMV</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Última sessão</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Próxima sessão</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Dias até fim</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((l) => (
                  <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-medium">
                      <Link href={`/produtos-tiktok/assessoria/gestao/${l.id}`} className="hover:underline">{l.nome}</Link>
                      {l.loja && <p className="text-xs text-muted-foreground">{l.loja}</p>}
                    </td>
                    <td className="px-4 py-2.5"><Badge variant="outline">{STATUS_LABEL[l.status] ?? l.status}</Badge></td>
                    <td className="px-4 py-2.5 text-muted-foreground">{l.estagio}</td>
                    <td className="px-4 py-2.5">{SAUDE_EMOJI[l.saude] ?? "🟢"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{l.gmv != null ? l.gmv.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{fmtData(l.ultimaSessao)}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{fmtData(l.proximaSessao)}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {l.diasFim != null ? (l.diasFim >= 0 ? `${l.diasFim} dias` : `venceu há ${Math.abs(l.diasFim)} dias`) : "—"}
                    </td>
                  </tr>
                ))}
                {filtradas.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Nenhum assessorado com esse filtro</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
