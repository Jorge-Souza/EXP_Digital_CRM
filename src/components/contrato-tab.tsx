"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Upload, FileText, Trash2, Download, Loader2,
  CalendarDays, Clock, CheckCircle2, AlertTriangle, XCircle,
  DollarSign, Plus, PackagePlus,
} from "lucide-react"
import { useRouter } from "next/navigation"
import type { ServicoAdicional } from "@/lib/types"

interface ContratoTabProps {
  clientId: string
  clientNome: string
  contratoNome: string | null
  contratoInicio: string | null
  contratoDuracaoMeses: number | null
  contratoValor: number | null
  contratoDownloadUrl: string | null
  servicosAdicionais: ServicoAdicional[]
}

function calcStatus(inicio: string | null, duracaoMeses: number | null) {
  if (!inicio || !duracaoMeses) return null
  const start = new Date(inicio + "T00:00:00")
  const end   = new Date(start)
  end.setMonth(end.getMonth() + duracaoMeses)
  const today = new Date()
  const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0)   return { label: "Encerrado",            icon: XCircle,       color: "text-red-600",    bg: "bg-red-50 dark:bg-red-950/30",    end, diffDays }
  if (diffDays <= 30) return { label: "Encerrando em breve",  icon: AlertTriangle,  color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-950/30", end, diffDays }
  return               { label: "Ativo",                      icon: CheckCircle2,  color: "text-green-600",  bg: "bg-green-50 dark:bg-green-950/30", end, diffDays }
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function ContratoTab({
  clientId,
  clientNome,
  contratoNome: initialNome,
  contratoInicio: initialInicio,
  contratoDuracaoMeses: initialDuracao,
  contratoValor: initialValor,
  contratoDownloadUrl,
  servicosAdicionais: initialServicos,
}: ContratoTabProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [nome, setNome]       = useState(initialNome)
  const [inicio, setInicio]   = useState(initialInicio ?? "")
  const [duracao, setDuracao] = useState(String(initialDuracao ?? ""))
  const [valor, setValor]     = useState(String(initialValor ?? ""))

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [removing, setRemoving]   = useState(false)

  const [servicos, setServicos] = useState<ServicoAdicional[]>(initialServicos)
  const [novoDescricao, setNovoDescricao] = useState("")
  const [novoValor, setNovoValor]         = useState("")
  const [novaData, setNovaData]           = useState("")
  const [adicionando, setAdicionando]     = useState(false)
  const [removendoId, setRemovendoId]     = useState<string | null>(null)

  const status = calcStatus(inicio || initialInicio, duracao ? Number(duracao) : initialDuracao)

  const totalServicos = servicos.reduce((sum, s) => sum + s.valor, 0)
  const valorBase     = valor ? Number(valor) : (initialValor ?? 0)
  const totalGeral    = valorBase + totalServicos

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) { toast.error("Arquivo muito grande. Máximo 20 MB."); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("client_id", clientId)
      const res = await fetch("/api/admin/contrato", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNome(data.nome)
      toast.success("Contrato enviado!")
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar contrato")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function handleSaveDates() {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/contrato", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          contrato_inicio: inicio || null,
          contrato_duracao_meses: duracao ? Number(duracao) : null,
          contrato_valor: valor ? Number(valor) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success("Contrato atualizado!")
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {
    if (!confirm("Remover o contrato? Esta ação não pode ser desfeita.")) return
    setRemoving(true)
    try {
      const res = await fetch("/api/admin/contrato", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNome(null)
      toast.success("Contrato removido.")
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover")
    } finally {
      setRemoving(false)
    }
  }

  async function handleAddServico() {
    if (!novoDescricao.trim()) { toast.error("Informe a descrição do serviço"); return }
    setAdicionando(true)
    try {
      const res = await fetch("/api/admin/contrato/servicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          descricao: novoDescricao.trim(),
          valor: novoValor ? Number(novoValor) : 0,
          data: novaData || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setServicos((prev) => [...prev, data.servico])
      setNovoDescricao("")
      setNovoValor("")
      setNovaData("")
      toast.success("Serviço adicionado!")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao adicionar serviço")
    } finally {
      setAdicionando(false)
    }
  }

  async function handleRemoveServico(id: string) {
    setRemovendoId(id)
    try {
      const res = await fetch("/api/admin/contrato/servicos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setServicos((prev) => prev.filter((s) => s.id !== id))
      toast.success("Serviço removido.")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover serviço")
    } finally {
      setRemovendoId(null)
    }
  }

  const fimContrato = status?.end
  const mesesRestantes = status ? Math.max(0, Math.ceil(status.diffDays / 30)) : null

  return (
    <div className="space-y-4">

      {/* Status */}
      {status && (
        <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${status.bg}`}>
          <status.icon className={`h-5 w-5 shrink-0 ${status.color}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold ${status.color}`}>{status.label}</p>
            <p className="text-xs text-muted-foreground">
              {status.diffDays < 0
                ? `Encerrou em ${fimContrato?.toLocaleDateString("pt-BR")}`
                : `Válido até ${fimContrato?.toLocaleDateString("pt-BR")} · ${mesesRestantes} ${mesesRestantes === 1 ? "mês restante" : "meses restantes"}`
              }
            </p>
          </div>
          {totalGeral > 0 && (
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Total mensal</p>
              <p className="text-base font-black text-foreground">{formatBRL(totalGeral)}</p>
            </div>
          )}
        </div>
      )}

      {/* Arquivo */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Arquivo do Contrato
          </h3>

          {nome ? (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <p className="text-sm font-medium flex-1 truncate">{nome}</p>
              <div className="flex items-center gap-2 shrink-0">
                {contratoDownloadUrl && (
                  <a href={contratoDownloadUrl} target="_blank" rel="noopener noreferrer" download>
                    <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                      <Download className="h-3.5 w-3.5" /> Baixar
                    </Button>
                  </a>
                )}
                <Button
                  size="sm" variant="outline"
                  className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={handleRemove} disabled={removing}
                >
                  {removing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Remover
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-8 gap-3 text-center">
              <Upload className="h-8 w-8 text-muted-foreground/40" />
              <div>
                <p className="text-sm font-medium">Nenhum contrato enviado</p>
                <p className="text-xs text-muted-foreground">PDF, DOCX ou imagem · máximo 20 MB</p>
              </div>
            </div>
          )}

          <div>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="hidden" onChange={handleUpload} />
            <Button size="sm" variant="outline" className="gap-2" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading
                ? <><Loader2 className="h-4 w-4 animate-spin" />Enviando...</>
                : <><Upload className="h-4 w-4" />{nome ? "Substituir arquivo" : "Enviar contrato"}</>
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vigência + Valor */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Vigência e Valor
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data de Início</Label>
              <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Duração (meses)
              </Label>
              <Input type="number" min={1} max={60} value={duracao} onChange={(e) => setDuracao(e.target.value)} placeholder="Ex: 6" className="text-sm" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <DollarSign className="h-3 w-3" /> Valor mensal do contrato (R$)
            </Label>
            <Input
              type="number" min={0} step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ex: 2500.00"
              className="text-sm"
            />
          </div>

          {/* Resumo calculado */}
          {(inicio && duracao) || valor ? (
            <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm space-y-1">
              {inicio && duracao && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Início</span>
                    <span className="font-medium">{new Date(inicio + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Término previsto</span>
                    <span className="font-medium">
                      {(() => { const d = new Date(inicio + "T00:00:00"); d.setMonth(d.getMonth() + Number(duracao)); return d.toLocaleDateString("pt-BR") })()}
                    </span>
                  </div>
                </>
              )}
              {valor && (
                <div className="flex justify-between text-xs pt-0.5">
                  <span className="text-muted-foreground">Valor mensal base</span>
                  <span className="font-bold text-foreground">{formatBRL(Number(valor))}</span>
                </div>
              )}
            </div>
          ) : null}

          <Button size="sm" onClick={handleSaveDates} disabled={saving || (!inicio && !duracao && !valor)} className="gap-2">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</> : "Salvar"}
          </Button>
        </CardContent>
      </Card>

      {/* Serviços Adicionais */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <PackagePlus className="h-4 w-4 text-primary" />
            Serviços Adicionais
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">

          {/* Lista */}
          {servicos.length > 0 ? (
            <div className="rounded-lg border overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-4 py-2 bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span>Descrição</span><span>Data</span><span>Valor</span><span />
              </div>
              {servicos.map((s) => (
                <div key={s.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-4 py-2.5 border-t text-sm">
                  <span className="truncate">{s.descricao}</span>
                  <span className="text-xs text-muted-foreground">
                    {s.data ? new Date(s.data + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
                  </span>
                  <span className="font-semibold text-right whitespace-nowrap">{formatBRL(s.valor)}</span>
                  <button
                    onClick={() => handleRemoveServico(s.id)}
                    disabled={removendoId === s.id}
                    className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                  >
                    {removendoId === s.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />
                    }
                  </button>
                </div>
              ))}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-4 py-2.5 border-t bg-muted/20">
                <span className="text-xs font-bold text-muted-foreground col-span-2">Total serviços adicionais</span>
                <span className="font-bold text-right">{formatBRL(totalServicos)}</span>
                <span />
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Nenhum serviço adicional cadastrado.</p>
          )}

          {/* Formulário de novo serviço */}
          <div className="rounded-lg border border-dashed p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Adicionar serviço</p>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input
                value={novoDescricao}
                onChange={(e) => setNovoDescricao(e.target.value)}
                placeholder="Ex: Gestão de tráfego adicional"
                className="text-sm"
              />
              <Input
                type="number" min={0} step="0.01"
                value={novoValor}
                onChange={(e) => setNovoValor(e.target.value)}
                placeholder="R$ 0,00"
                className="text-sm w-32"
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
                className="text-sm w-40"
              />
              <Button size="sm" onClick={handleAddServico} disabled={adicionando || !novoDescricao.trim()} className="gap-1.5">
                {adicionando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Adicionar
              </Button>
            </div>
          </div>

          {/* Total geral */}
          {(valorBase > 0 || totalServicos > 0) && (
            <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
              <span className="text-sm font-bold">Total Geral (mensal)</span>
              <span className="text-lg font-black text-primary">{formatBRL(totalGeral)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
