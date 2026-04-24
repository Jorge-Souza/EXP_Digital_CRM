"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { ChevronDown, ChevronRight, Plus, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { Post, PostStatus, PostType } from "@/lib/types"
import { statusConfig, groupOrder } from "@/lib/post-status"

export { statusConfig, groupOrder }

const typeLabels: Record<string, string> = {
  feed: "Feed", reels: "Reels", story: "Story", tiktok: "TikTok", carrossel: "Carrossel",
}

const typeColors: Record<string, string> = {
  feed:      "border-l-4 border-l-blue-400 bg-blue-50/50 dark:bg-blue-950/20",
  reels:     "border-l-4 border-l-pink-400 bg-pink-50/50 dark:bg-pink-950/20",
  story:     "border-l-4 border-l-amber-400 bg-amber-50/50 dark:bg-amber-950/20",
  carrossel: "border-l-4 border-l-violet-400 bg-violet-50/50 dark:bg-violet-950/20",
  tiktok:    "border-l-4 border-l-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20",
}

const typeBadgeColors: Record<string, string> = {
  feed:      "bg-blue-100 text-blue-700 border-blue-200",
  reels:     "bg-pink-100 text-pink-700 border-pink-200",
  story:     "bg-amber-100 text-amber-700 border-amber-200",
  carrossel: "bg-violet-100 text-violet-700 border-violet-200",
  tiktok:    "bg-cyan-100 text-cyan-700 border-cyan-200",
}

const typeOptions = ["feed", "reels", "story", "carrossel", "tiktok"]

interface PostEditState {
  titulo: string
  tipo: string
  status: string
  data_publicacao: string
  drive_file_url: string
  notas: string
  tema: string
}

interface ProjetoClienteProps {
  clientId: string
  posts: Post[]
}

export function ProjetoCliente({ clientId, posts }: ProjetoClienteProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ publicado: true })
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editForm, setEditForm] = useState<PostEditState>({
    titulo: "", tipo: "feed", status: "planejado",
    data_publicacao: "", drive_file_url: "", notas: "", tema: "",
  })
  const [saving, setSaving] = useState(false)

  function toggle(status: string) {
    setCollapsed((prev) => ({ ...prev, [status]: !prev[status] }))
  }

  function openEdit(post: Post) {
    setEditingPost(post)
    setEditForm({
      titulo: post.titulo,
      tipo: post.tipo,
      status: post.status,
      data_publicacao: post.data_publicacao ?? "",
      drive_file_url: post.drive_file_url ?? "",
      notas: post.notas ?? "",
      tema: post.tema ?? "",
    })
  }

  function setField(field: keyof PostEditState, value: string) {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!editingPost) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("posts")
      .update({
        titulo: editForm.titulo,
        tipo: editForm.tipo as PostType,
        status: editForm.status as PostStatus,
        data_publicacao: editForm.data_publicacao || null,
        drive_file_url: editForm.drive_file_url || null,
        notas: editForm.notas || null,
        tema: editForm.tema || null,
      })
      .eq("id", editingPost.id)

    if (error) {
      toast.error("Erro ao salvar: " + error.message)
    } else {
      toast.success("Publicação atualizada!")
      setEditingPost(null)
      router.refresh()
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!editingPost) return
    if (!confirm("Remover esta publicação?")) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from("posts").delete().eq("id", editingPost.id)
    if (error) {
      toast.error("Erro ao remover: " + error.message)
    } else {
      toast.success("Publicação removida!")
      setEditingPost(null)
      router.refresh()
    }
    setSaving(false)
  }

  const grouped = groupOrder.reduce<Record<string, Post[]>>((acc, s) => {
    acc[s] = posts.filter((p) => p.status === s)
    return acc
  }, {} as Record<string, Post[]>)

  return (
    <>
      <div className="space-y-2">
        {groupOrder.map((status) => {
          const s = statusConfig[status]
          const items = grouped[status]
          const isCollapsed = collapsed[status] ?? false

          return (
            <div key={status} className="rounded-xl border overflow-hidden shadow-sm">
              {/* Header do grupo */}
              <button
                type="button"
                onClick={() => toggle(status)}
                className="flex w-full items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-muted/50 hover:bg-gray-200 dark:hover:bg-muted/70 transition-colors text-left"
              >
                {isCollapsed
                  ? <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                }
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${s.color}`} />
                <span className="font-semibold text-sm flex-1">{s.label}</span>
                <span className="text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5 border">
                  {items.length}
                </span>
                <Link
                  href={`/publicacoes/novo?client_id=${clientId}&status=${status}`}
                  onClick={(e) => e.stopPropagation()}
                  className="ml-2 flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar
                </Link>
              </button>

              {/* Lista */}
              {!isCollapsed && (
                <div>
                  <div className="grid grid-cols-[1fr_90px_100px_110px_32px] gap-2 px-4 py-1.5 border-b bg-gray-50 dark:bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <span>Título</span>
                    <span>Tipo</span>
                    <span>Data</span>
                    <span>Responsável</span>
                    <span />
                  </div>
                  {items.length === 0 ? (
                    <p className="px-4 py-3 text-xs text-muted-foreground italic bg-gray-50 dark:bg-muted/10">
                      Nenhuma publicação neste status
                    </p>
                  ) : (
                    items.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => openEdit(post)}
                        className={`grid grid-cols-[1fr_90px_100px_110px_32px] gap-2 items-center px-4 py-2.5 border-b last:border-0 hover:brightness-95 transition-all cursor-pointer ${typeColors[post.tipo] ?? "border-l-4 border-l-gray-300 bg-gray-50/50"}`}
                      >
                        <p className="text-sm font-semibold truncate">{post.titulo}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium w-fit ${typeBadgeColors[post.tipo] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          {typeLabels[post.tipo] ?? post.tipo}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {post.data_publicacao
                            ? new Date(post.data_publicacao + "T00:00:00").toLocaleDateString("pt-BR")
                            : <span className="opacity-40">—</span>
                          }
                        </span>
                        <span className="text-xs text-muted-foreground opacity-40">—</span>
                        {post.drive_file_url ? (
                          <a
                            href={post.drive_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-primary"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : <span />}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sheet de edição */}
      <Sheet open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
          {/* Header fixo */}
          <SheetHeader className="px-5 py-4 border-b shrink-0">
            <SheetTitle className="text-base font-semibold">Editar Publicação</SheetTitle>
            {editForm.status && (
              <div className="flex items-center gap-2 mt-1">
                <span className={`h-2 w-2 rounded-full ${statusConfig[editForm.status as keyof typeof statusConfig]?.color ?? "bg-gray-400"}`} />
                <span className="text-xs text-muted-foreground">
                  {statusConfig[editForm.status as keyof typeof statusConfig]?.label ?? editForm.status}
                </span>
              </div>
            )}
          </SheetHeader>

          {/* Conteúdo com scroll */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Título</Label>
              <Input value={editForm.titulo} onChange={(e) => setField("titulo", e.target.value)} className="text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</Label>
                <Select value={editForm.tipo} onValueChange={(v) => setField("tipo", v ?? "feed")}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feed">Feed</SelectItem>
                    <SelectItem value="reels">Reels</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="carrossel">Carrossel</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setField("status", v ?? "planejado")}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planejado">Falta Fazer</SelectItem>
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
              <Input type="date" value={editForm.data_publicacao} onChange={(e) => setField("data_publicacao", e.target.value)} className="text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tema / Ideia</Label>
              <Textarea
                value={editForm.tema}
                onChange={(e) => setField("tema", e.target.value)}
                rows={2}
                className="text-sm resize-none"
                placeholder="Ideia central do conteúdo..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Link do Drive</Label>
              <Input
                type="url"
                value={editForm.drive_file_url}
                onChange={(e) => setField("drive_file_url", e.target.value)}
                className="text-sm"
                placeholder="https://drive.google.com/..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notas / Legenda</Label>
              <Textarea
                value={editForm.notas}
                onChange={(e) => setField("notas", e.target.value)}
                rows={5}
                className="text-sm resize-none"
                placeholder="Legenda, hashtags, observações de aprovação..."
              />
            </div>
          </div>

          {/* Footer fixo */}
          <SheetFooter className="px-5 py-4 border-t shrink-0 flex-row gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Salvar alterações"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={saving} className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10">
              Remover
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
