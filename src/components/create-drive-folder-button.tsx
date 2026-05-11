"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FolderOpen, FolderPlus, Loader2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface Props {
  clientId: string
  clientName: string
  folderUrl: string | null
}

export function CreateDriveFolderButton({ clientId, clientName, folderUrl: initialUrl }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState(initialUrl)

  async function handleCreate() {
    setLoading(true)
    try {
      const res = await fetch("/api/drive/create-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName, clientId }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error(data.error ?? "Erro ao criar pasta")
      } else {
        setUrl(data.folderUrl)
        toast.success("Pasta criada no Google Drive!")
        router.refresh()
      }
    } catch {
      toast.error("Erro ao criar pasta no Drive")
    }
    setLoading(false)
  }

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <FolderOpen className="h-4 w-4 text-yellow-500" />
        Pasta no Drive
        <ExternalLink className="h-3 w-3 text-muted-foreground" />
      </a>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleCreate}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <><Loader2 className="h-4 w-4 animate-spin" />Criando pasta...</>
      ) : (
        <><FolderPlus className="h-4 w-4" />Criar pasta no Drive</>
      )}
    </Button>
  )
}
