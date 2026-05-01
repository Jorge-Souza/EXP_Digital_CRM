"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Upload, FileText, Trash2, Download, Loader2, CalendarDays, Clock, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ContratoTabProps {
  clientId: string
  clientNome: string
  contratoNome: string | null
  contratoInicio: string | null
  contratoDuracaoMeses: number | null
  contratoDownloadUrl: string | null
}

function calcStatus(inicio: string | null, duracaoMeses: number | null) {
  if (!inicio || !duracaoMeses) return null
  const start = new Date(inicio + "T00:00:00")
  const end   = new Date(start)
  end.setMonth(end.getMonth() + duracaoMeses)
  const today = new Date()
  const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0)   return { label: "Encerrado",       icon: XCircle,      color: "text-red-600",    bg: "bg-red-50 dark:bg-red-950/30",    end, diffDays }
  if (diffDays <= 30) return { label: "Encerrando em breve", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", end, diffDays }
  return               { label: "Ativo",              icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50 dark:bg-green-950/30", end, diffDays }
}

export function ContratoTab({
  clientId,
  clientNome,
  contratoNome: initialNome,
  contratoInicio: initialInicio,
  contratoDuracaoMeses: initialDuracao,
  contratoDownloadUrl,
}: ContratoTabProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [nome, setNome]     = useState(initialNome)
  const [inicio, setInicio] = useState(initialInicio ?? "")
  const [duracao, setDuracao] = useState(String(initialDuracao ?? ""))
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [removing, setRemoving]   = useState(false)

  const status = calcStatus(inicio || initialInicio, duracao ? Number(duracao) : initialDuracao)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 20 MB.")
      return
    }
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
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success("Dados do contrato salvos!")
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

  const fimContrato = status?.end
  const mesesRestantes = status ? Math.max(0, Math.ceil(status.diffDays / 30)) : null

  return (
    <div className="space-y-4">

      {/* Status do contrato */}
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
        </div>
      )}

      {/* Arquivo do contrato */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Arquivo do Contrato
            </h3>
          </div>

          {nome ? (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <p className="text-sm font-medium flex-1 truncate">{nome}</p>
              <div className="flex items-center gap-2 shrink-0">
                {contratoDownloadUrl && (
                  <a
                    href={contratoDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                      <Download className="h-3.5 w-3.5" />
                      Baixar
                    </Button>
                  </a>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={handleRemove}
                  disabled={removing}
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
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading
                ? <><Loader2 className="h-4 w-4 animate-spin" />Enviando...</>
                : <><Upload className="h-4 w-4" />{nome ? "Substituir arquivo" : "Enviar contrato"}</>
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vigência do contrato */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Vigência do Contrato
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Data de Início
              </Label>
              <Input
                type="date"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Duração (meses)
              </Label>
              <Input
                type="number"
                min={1}
                max={60}
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
                placeholder="Ex: 6"
                className="text-sm"
              />
            </div>
          </div>

          {/* Resumo calculado */}
          {inicio && duracao && (
            <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Início</span>
                <span className="font-medium">{new Date(inicio + "T00:00:00").toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Término previsto</span>
                <span className="font-medium">
                  {(() => {
                    const d = new Date(inicio + "T00:00:00")
                    d.setMonth(d.getMonth() + Number(duracao))
                    return d.toLocaleDateString("pt-BR")
                  })()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Duração</span>
                <span className="font-medium">{duracao} {Number(duracao) === 1 ? "mês" : "meses"}</span>
              </div>
            </div>
          )}

          <Button
            size="sm"
            onClick={handleSaveDates}
            disabled={saving || (!inicio && !duracao)}
            className="gap-2"
          >
            {saving
              ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</>
              : "Salvar vigência"
            }
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
