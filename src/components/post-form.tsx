"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import type { Post, PostStatus, PostType, Client, Profile } from "@/lib/types"

interface PostFormProps {
  clients: Pick<Client, "id" | "nome">[]
  profiles: Pick<Profile, "id" | "nome">[]
  post?: Post
  defaultClientId?: string
  defaultStatus?: string
  defaultDate?: string
  defaultAprovado?: boolean
}

export function PostForm({ clients, profiles, post, defaultClientId, defaultStatus, defaultDate, defaultAprovado }: PostFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    client_id: post?.client_id ?? defaultClientId ?? "",
    titulo: post?.titulo ?? "",
    tema: post?.tema ?? "",
    tipo: post?.tipo ?? "feed",
    status: post?.status ?? defaultStatus ?? "planejado",
    data_publicacao: post?.data_publicacao ?? defaultDate ?? "",
    drive_file_url: post?.drive_file_url ?? "",
    notas: post?.notas ?? "",
    aprovado: post?.aprovado ?? defaultAprovado ?? false,
    responsavel_id: post?.responsavel_id ?? "",
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.client_id) {
      toast.error("Selecione um cliente")
      return
    }
    setLoading(true)
    const supabase = createClient()

    const payload = {
      client_id: form.client_id,
      titulo: form.titulo,
      tema: form.tema || null,
      tipo: form.tipo as PostType,
      status: form.status as PostStatus,
      data_publicacao: form.data_publicacao || null,
      drive_file_url: form.drive_file_url || null,
      notas: form.notas || null,
      aprovado: form.aprovado,
      responsavel_id: form.responsavel_id || null,
    }

    const { error } = post?.id
      ? await supabase.from("posts").update(payload).eq("id", post.id)
      : await supabase.from("posts").insert(payload)

    if (error) {
      toast.error("Erro ao salvar: " + error.message)
      setLoading(false)
      return
    }

    toast.success(post?.id ? "Publicação atualizada!" : "Publicação cadastrada!")
    router.back()
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da Publicação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_id">Cliente *</Label>
            <Select value={form.client_id} onValueChange={(v) => set("client_id", v ?? "")} required>
              <SelectTrigger id="client_id">
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={form.titulo}
              onChange={(e) => set("titulo", e.target.value)}
              placeholder="Ex: Post de lançamento do produto X"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Onde este conteúdo aparece?</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, aprovado: false }))}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all text-left space-y-0.5 ${
                  !form.aprovado
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-muted text-muted-foreground hover:border-muted-foreground/50"
                }`}
              >
                <div>📋 Planejamento</div>
                <div className="text-xs font-normal opacity-70">Calendário de planejamento</div>
              </button>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, aprovado: true }))}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all text-left space-y-0.5 ${
                  form.aprovado
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-muted text-muted-foreground hover:border-muted-foreground/50"
                }`}
              >
                <div>📅 Calendário Oficial</div>
                <div className="text-xs font-normal opacity-70">Calendário de produção</div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tema">Tema / Ideia do Conteúdo</Label>
            <Textarea
              id="tema"
              value={form.tema}
              onChange={(e) => set("tema", e.target.value)}
              placeholder="Descreva a ideia central do conteúdo, referências, gancho principal..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => set("tipo", v ?? "feed")}>
                <SelectTrigger id="tipo"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="feed">Feed</SelectItem>
                  <SelectItem value="reels">Reels</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="carrossel">Carrossel</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v ?? "planejado")}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="data_publicacao">Data de Publicação</Label>
              <Input
                id="data_publicacao"
                type="date"
                value={form.data_publicacao}
                onChange={(e) => set("data_publicacao", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel_id">Responsável pela Produção</Label>
            <Select value={form.responsavel_id} onValueChange={(v) => set("responsavel_id", v ?? "")}>
              <SelectTrigger id="responsavel_id">
                <SelectValue placeholder="Nenhum responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="drive_file_url" className="flex items-center gap-1">
              Link do Arquivo no Drive
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </Label>
            <Input
              id="drive_file_url"
              type="url"
              value={form.drive_file_url}
              onChange={(e) => set("drive_file_url", e.target.value)}
              placeholder="https://drive.google.com/file/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas / Legenda</Label>
            <Textarea
              id="notas"
              value={form.notas}
              onChange={(e) => set("notas", e.target.value)}
              placeholder="Legenda pronta, hashtags, observações de aprovação..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 pb-8">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
          ) : (
            post?.id ? "Salvar Alterações" : "Cadastrar Publicação"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
