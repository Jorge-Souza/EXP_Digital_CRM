"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FolderOpen, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

interface Result {
  nome: string
  success: boolean
  folderUrl?: string
  error?: string
}

export function BulkDriveButton() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Result[] | null>(null)

  async function handleCreate() {
    if (!confirm("Criar pastas no Google Drive para todos os clientes (exceto Trezentos WTC)?")) return
    setLoading(true)
    setResults(null)
    try {
      const res = await fetch("/api/drive/bulk-create-folders", { method: "POST" })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        setResults(data.results)
        const ok = data.results.filter((r: Result) => r.success).length
        const fail = data.results.filter((r: Result) => !r.success).length
        toast.success(`${ok} pasta${ok !== 1 ? "s" : ""} criada${ok !== 1 ? "s" : ""}${fail > 0 ? ` · ${fail} com erro` : ""}`)
      }
    } catch {
      toast.error("Erro ao criar pastas")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCreate}
        disabled={loading}
        className="gap-2"
      >
        {loading
          ? <><Loader2 className="h-4 w-4 animate-spin" />Criando pastas...</>
          : <><FolderOpen className="h-4 w-4" />Criar pastas no Drive</>
        }
      </Button>

      {results && (
        <div className="rounded-lg border bg-card p-4 space-y-2 text-sm max-h-72 overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Resultado</p>
          {results.map((r) => (
            <div key={r.nome} className="flex items-center gap-2">
              {r.success
                ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                : <XCircle className="h-4 w-4 text-red-500 shrink-0" />
              }
              <span className={r.success ? "text-foreground" : "text-muted-foreground"}>
                {r.nome}
              </span>
              {!r.success && r.error && (
                <span className="text-xs text-red-500 truncate">{r.error}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
