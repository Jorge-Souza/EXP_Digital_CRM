"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Pencil, Calendar, User, Tag } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { Post, Client, Profile, PostStatus } from "@/lib/types"

type PostWithClient = Post & { clients: Pick<Client, "id" | "nome"> | null }

interface PostDetailSheetProps {
  post: PostWithClient | null
  profiles: Pick<Profile, "id" | "nome">[]
  open: boolean
  onClose: () => void
  onUpdate: (postId: string, changes: Partial<Post>) => void
}

const statusConfig: Record<string, { label: string; color: string }> = {
  planejado:       { label: "Planejado",             color: "bg-gray-100 text-gray-700" },
  a_fazer:         { label: "A Fazer",               color: "bg-slate-100 text-slate-700" },
  falta_insumo:    { label: "Falta Insumo",          color: "bg-red-100 text-red-700" },
  producao:        { label: "Em Produção",            color: "bg-yellow-100 text-yellow-700" },
  aprovado_design: { label: "Aprovação Design",      color: "bg-orange-100 text-orange-700" },
  aprovado:        { label: "P/ Aprovação Cliente",  color: "bg-blue-100 text-blue-700" },
  agendado:        { label: "Agendado",              color: "bg-amber-100 text-amber-800" },
  publicado:       { label: "Postado ✅",            color: "bg-green-100 text-green-700" },
}

const tipoLabels: Record<string, string> = {
  feed: "Feed", reels: "Reels", story: "Story", tiktok: "TikTok", carrossel: "Carrossel",
}

const tipoColors: Record<string, string> = {
  feed: "bg-blue-100 text-blue-700",
  reels: "bg-pink-100 text-pink-700",
  story: "bg-amber-100 text-amber-700",
  carrossel: "bg-violet-100 text-violet-700",
  tiktok: "bg-cyan-100 text-cyan-700",
}

export function PostDetailSheet({ post, profiles, open, onClose, onUpdate }: PostDetailSheetProps) {
  const [salvandoStatus, setSalvandoStatus] = useState(false)
  const [salvandoResp, setSalvandoResp] = useState(false)

  if (!post) return null

  const sc = statusConfig[post.status] ?? { label: post.status, color: "bg-gray-100 text-gray-700" }
  const tc = tipoColors[post.tipo] ?? "bg-gray-100 text-gray-600"

  async function handleStatusChange(novoStatus: string | null) {
    if (!novoStatus) return
    setSalvandoStatus(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("posts").update({ status: novoStatus }).eq("id", post!.id)
      if (error) throw error
      onUpdate(post!.id, { status: novoStatus as PostStatus })
      toast.success("Status atualizado!")
    } catch {
      toast.error("Erro ao atualizar status")
    } finally {
      setSalvandoStatus(false)
    }
  }

  async function handleResponsavelChange(responsavelId: string | null) {
    if (responsavelId === null) return
    setSalvandoResp(true)
    try {
      const supabase = createClient()
      const valor = responsavelId === "none" ? null : responsavelId
      const { error } = await supabase.from("posts").update({ responsavel_id: valor }).eq("id", post!.id)
      if (error) throw error
      onUpdate(post!.id, { responsavel_id: valor })
      toast.success("Responsável atualizado!")
    } catch {
      toast.error("Erro ao atualizar responsável")
    } finally {
      setSalvandoResp(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent side="right" className="w-full sm:w-[480px] p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base font-bold leading-snug">{post.titulo}</SheetTitle>
              {post.clients && (
                <p className="text-xs text-muted-foreground mt-0.5">{post.clients.nome}</p>
              )}
            </div>
            <Link
              href={`/publicacoes/${post.id}/editar`}
              className="shrink-0 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border rounded-md px-2.5 py-1.5 hover:bg-muted transition-colors"
              onClick={onClose}
            >
              <Pencil className="h-3 w-3" />
              Editar
            </Link>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${tc}`}>
              {tipoLabels[post.tipo] ?? post.tipo}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${sc.color}`}>
              {sc.label}
            </span>
            {post.data_publicacao && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(post.data_publicacao + "T00:00:00").toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <Select value={post.status} onValueChange={handleStatusChange} disabled={salvandoStatus}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planejado">Planejado</SelectItem>
                <SelectItem value="a_fazer">A Fazer</SelectItem>
                <SelectItem value="falta_insumo">Falta Insumo</SelectItem>
                <SelectItem value="producao">Em Produção</SelectItem>
                <SelectItem value="aprovado_design">Aprovação Design</SelectItem>
                <SelectItem value="aprovado">P/ Aprovação Cliente</SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="publicado">Postado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Responsável */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-3 w-3" /> Responsável
            </label>
            <Select
              value={post.responsavel_id ?? "none"}
              onValueChange={handleResponsavelChange}
              disabled={salvandoResp}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Sem responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem responsável</SelectItem>
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tema */}
          {post.tema && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-3 w-3" /> Tema / Ideia
              </label>
              <p className="text-sm text-foreground leading-relaxed bg-muted/50 rounded-lg p-3">{post.tema}</p>
            </div>
          )}

          {/* Notas */}
          {post.notas && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notas / Legenda</label>
              <p className="text-sm text-foreground leading-relaxed bg-muted/50 rounded-lg p-3 whitespace-pre-wrap">{post.notas}</p>
            </div>
          )}

          {/* Drive */}
          {post.drive_file_url && (
            <a
              href={post.drive_file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir arquivo no Drive
            </a>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
