"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { CalendarioPlan } from "@/components/calendario-plan"
import type { Post, PostStatus, PostType } from "@/lib/types"

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
]

const STATUS_COLORS: Record<string, string> = {
  planejado:       "bg-gray-200 text-gray-700",
  falta_insumo:    "bg-red-100 text-red-700",
  producao:        "bg-yellow-100 text-yellow-700",
  aprovado_design: "bg-orange-100 text-orange-700",
  aprovado:        "bg-blue-100 text-blue-700",
  agendado:        "bg-amber-100 text-amber-700",
  publicado:       "bg-green-100 text-green-700",
}

const STATUS_LABELS: Record<string, string> = {
  planejado:       "Planejado",
  falta_insumo:    "Falta Insumo",
  producao:        "Em Produção",
  aprovado_design: "Aprovação Design",
  aprovado:        "P/ Aprovação Cliente",
  agendado:        "Agendado",
  publicado:       "Postado",
}

interface EditForm {
  titulo: string; tipo: string; status: string
  data_publicacao: string; drive_file_url: string; notas: string; tema: string; aprovado: boolean
}

interface CalendarioMesProps {
  posts: Post[]
  clientId: string
}

export function CalendarioMes({ posts: initialPosts, clientId }: CalendarioMesProps) {
  const router = useRouter()
  const today = new Date()
  const [ano, setAno] = useState(today.getFullYear())
  const [mes, setMes] = useState(today.getMonth())
  const [posts, setPosts] = useState(initialPosts)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({
    titulo: "", tipo: "feed", status: "planejado",
    data_publicacao: "", drive_file_url: "", notas: "", tema: "", aprovado: false,
  })
  const [saving, setSaving] = useState(false)

  // Filtra só os posts do mês atual visível
  const monthPosts = posts.filter((p) => {
    if (!p.data_publicacao) return false
    const d = new Date(p.data_publicacao + "T00:00:00")
    return d.getFullYear() === ano && d.getMonth() === mes
  })

  function navMes(delta: number) {
    let nm = mes + delta, na = ano
    if (nm < 0) { nm = 11; na-- }
    if (nm > 11) { nm = 0; na++ }
    setMes(nm); setAno(na)
  }

  function openEdit(post: Post) {
    setEditingPost(post)
    setEditForm({
      titulo: post.titulo, tipo: post.tipo, status: post.status,
      data_publicacao: post.data_publicacao ?? "",
      drive_file_url: post.drive_file_url ?? "",
      notas: post.notas ?? "", tema: post.tema ?? "",
      aprovado: post.aprovado ?? false,
    })
    setSheetOpen(true)
  }

  function setField(field: keyof EditForm, value: string | boolean) {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!editingPost) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from("posts").update({
      titulo: editForm.titulo, tipo: editForm.tipo as PostType,
      status: editForm.status as PostStatus,
      data_publicacao: editForm.data_publicacao || null,
      drive_file_url: editForm.drive_file_url || null,
      notas: editForm.notas || null, tema: editForm.tema || null,
      aprovado: editForm.aprovado,
    }).eq("id", editingPost.id)
    if (error) {
      toast.error("Erro ao salvar")
    } else {
      toast.success("Publicação atualizada!")
      setPosts((prev) => prev.map((p) =>
        p.id === editingPost.id
          ? { ...p, ...editForm, status: editForm.status as PostStatus, tipo: editForm.tipo as PostType }
          : p
      ))
      setSheetOpen(false)
      router.refresh()
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!editingPost || !confirm("Remover esta publicação?")) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from("posts").delete().eq("id", editingPost.id)
    if (error) {
      toast.error("Erro ao remover")
    } else {
      toast.success("Removida!")
      setPosts((prev) => prev.filter((p) => p.id !== editingPost.id))
      setSheetOpen(false)
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <>
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Navegação de mês */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
          <button onClick={() => navMes(-1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-base font-black capitalize">{MESES[mes]} {ano}</h2>
          <button onClick={() => navMes(1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Grade usando o mesmo CalendarioPlan do planejamento */}
        <CalendarioPlan
          posts={monthPosts}
          ano={ano}
          mes={mes}
          showLegend={true}
          onPostClick={openEdit}
        />
      </div>

      {/* Sheet de edição */}
      <Sheet open={sheetOpen} onOpenChange={(open) => { if (!open) { setSheetOpen(false); setEditingPost(null) } }}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
          <SheetHeader className="px-5 py-4 border-b shrink-0">
            <SheetTitle className="text-base font-semibold">Editar Publicação</SheetTitle>
            {editForm.status && (
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[editForm.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABELS[editForm.status] ?? editForm.status}
                </span>
              </div>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Título</Label>
              <Input value={editForm.titulo} onChange={(e) => setField("titulo", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</Label>
                <Select value={editForm.tipo} onValueChange={(v) => v && setField("tipo", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feed">Estático</SelectItem>
                    <SelectItem value="reels">Reels</SelectItem>
                    <SelectItem value="story">Stories</SelectItem>
                    <SelectItem value="carrossel">Carrossel</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</Label>
                <Select value={editForm.status} onValueChange={(v) => v && setField("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planejado">Planejado</SelectItem>
                    <SelectItem value="falta_insumo">Falta Insumo</SelectItem>
                    <SelectItem value="producao">Em Produção</SelectItem>
                    <SelectItem value="aprovado_design">Aprovação Design</SelectItem>
                    <SelectItem value="aprovado">P/ Aprovação Cliente</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="publicado">Postado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data de Publicação</Label>
              <Input type="date" value={editForm.data_publicacao} onChange={(e) => setField("data_publicacao", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tema / Ideia</Label>
              <Textarea value={editForm.tema} onChange={(e) => setField("tema", e.target.value)} rows={2} className="resize-none" placeholder="Ideia central do conteúdo..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Link do Drive</Label>
              <Input type="url" value={editForm.drive_file_url} onChange={(e) => setField("drive_file_url", e.target.value)} placeholder="https://drive.google.com/..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notas / Legenda</Label>
              <Textarea value={editForm.notas} onChange={(e) => setField("notas", e.target.value)} rows={4} className="resize-none" placeholder="Legenda, hashtags, observações..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Calendário</Label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setField("aprovado", false)}
                  className={`py-2.5 px-3 rounded-lg border-2 text-xs font-semibold transition-all text-left ${!editForm.aprovado ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground"}`}>
                  📋 Planejamento
                </button>
                <button type="button" onClick={() => setField("aprovado", true)}
                  className={`py-2.5 px-3 rounded-lg border-2 text-xs font-semibold transition-all text-left ${editForm.aprovado ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground"}`}>
                  📅 Calendário Oficial
                </button>
              </div>
            </div>
          </div>

          <SheetFooter className="px-5 py-4 border-t shrink-0 flex-row gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Salvar alterações"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={saving} className="text-destructive hover:text-destructive border-destructive/30">
              Remover
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
