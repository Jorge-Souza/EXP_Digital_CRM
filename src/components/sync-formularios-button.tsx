"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"

export function SyncFormulariosButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function sync() {
    setLoading(true)
    try {
      const res = await fetch("/api/forms/sync", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erro desconhecido")
      toast.success(`Sync concluído: ${data.upserted} alunos atualizados`)
      router.refresh()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={sync} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
      Sincronizar formulários
    </Button>
  )
}
