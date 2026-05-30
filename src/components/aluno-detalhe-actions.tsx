"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Plus, Tag, StickyNote } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Props {
  alunoId: string
  tags: string[]
  mode?: "tags" | "nota"
}

export function AlunoDetalheActions({ alunoId, tags, mode }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [openTag, setOpenTag] = useState(false)
  const [openNota, setOpenNota] = useState(false)
  const [novaTag, setNovaTag] = useState("")
  const [nota, setNota] = useState("")
  const [saving, setSaving] = useState(false)

  async function addTag() {
    const tag = novaTag.trim()
    if (!tag || tags.includes(tag)) return
    setSaving(true)
    const { error } = await supabase.from("alunos").update({ tags: [...tags, tag] }).eq("id", alunoId)
    setSaving(false)
    if (error) { toast.error("Erro ao adicionar tag"); return }
    toast.success("Tag adicionada")
    setNovaTag("")
    setOpenTag(false)
    router.refresh()
  }

  async function removeTag(tag: string) {
    const { error } = await supabase.from("alunos").update({ tags: tags.filter((t) => t !== tag) }).eq("id", alunoId)
    if (error) { toast.error("Erro ao remover tag"); return }
    toast.success("Tag removida")
    router.refresh()
  }

  async function saveNota() {
    const texto = nota.trim()
    if (!texto) return
    setSaving(true)
    const { error } = await supabase.from("notas_alunos").insert({ aluno_id: alunoId, texto })
    setSaving(false)
    if (error) { toast.error("Erro ao salvar nota"); return }
    toast.success("Nota salva")
    setNota("")
    setOpenNota(false)
    router.refresh()
  }

  if (mode === "nota") {
    return (
      <>
        <Button size="sm" variant="outline" onClick={() => setOpenNota(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Nova nota
        </Button>
        <Dialog open={openNota} onOpenChange={setOpenNota}>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar nota</DialogTitle></DialogHeader>
            <Textarea
              placeholder="Observação sobre o aluno..."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={4}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenNota(false)}>Cancelar</Button>
              <Button onClick={saveNota} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button size="sm" variant="outline" onClick={() => setOpenTag(true)}>
        <Tag className="h-3.5 w-3.5 mr-1" />
        Tag
      </Button>
      <Button size="sm" variant="outline" onClick={() => setOpenNota(true)}>
        <StickyNote className="h-3.5 w-3.5 mr-1" />
        Nota
      </Button>

      <Dialog open={openTag} onOpenChange={setOpenTag}>
        <DialogContent>
          <DialogHeader><DialogTitle>Gerenciar tags</DialogTitle></DialogHeader>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 rounded-full bg-muted flex items-center gap-1">
                {tag}
                <button onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-destructive ml-1">×</button>
              </span>
            ))}
            {tags.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma tag ainda.</p>}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Nova tag..."
              value={novaTag}
              onChange={(e) => setNovaTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
            />
            <Button onClick={addTag} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openNota} onOpenChange={setOpenNota}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar nota</DialogTitle></DialogHeader>
          <Textarea
            placeholder="Observação sobre o aluno..."
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNota(false)}>Cancelar</Button>
            <Button onClick={saveNota} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
