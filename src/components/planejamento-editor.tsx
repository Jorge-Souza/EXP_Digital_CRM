"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import {
  ChevronLeft, ChevronRight, Link2, Plus, Trash2,
  ExternalLink, ChevronDown, ChevronUp, Loader2, Check,
} from "lucide-react"
import { toast } from "sonner"
import { CalendarioPlan } from "@/components/calendario-plan"
import type { Client, Planejamento, DataComemorativa, Referencia, Post, PostStatus, PostType } from "@/lib/types"

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
]

const TYPE_LABELS: Record<string, string> = {
  feed: "Feed", reels: "Reels", story: "Story", tiktok: "TikTok", carrossel: "Carrossel",
}

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
  planejado: "Planejado", falta_insumo: "Falta Insumo", producao: "Em Produção",
  aprovado_design: "Aprovação Design", aprovado: "P/ Aprovação", agendado: "Agendado", publicado: "Postado",
}

interface PostEditForm {
  titulo: string; tipo: string; status: string
  data_publicacao: string; drive_file_url: string; notas: string; tema: string; aprovado: boolean
}

interface Props {
  planejamento: Planejamento
  client: Client
  posts: Post[]
  mes: string // YYYY-MM
}

export function PlanejamentoEditor({ planejamento, client, posts, mes }: Props) {
  const router = useRouter()
  const [ano, month] = mes.split("-").map(Number)
  const mesIndex = month - 1 // 0-based

  // Planning fields
  const [objetivo, setObjetivo] = useState(planejamento.objetivo_mes ?? "")
  const [sugestoes, setSugestoes] = useState(planejamento.sugestoes_acoes ?? "")
  const [referencias, setReferencias] = useState<Referencia[]>(planejamento.referencias)
  const [datas, setDatas] = useState<DataComemorativa[]>(planejamento.datas_comemorativas)

  // Post extra fields
  const [postFields, setPostFields] = useState<Record<string, { plataforma: string; referencia_url: string; aprovado: boolean }>>(
    Object.fromEntries(posts.map((p) => [p.id, {
      plataforma: p.plataforma ?? "instagram",
      referencia_url: p.referencia_url ?? "",
      aprovado: p.aprovado ?? false,
    }]))
  )

  // UI state
  const [refExpanded, setRefExpanded] = useState(referencias.length === 0)
  const [newRefUrl, setNewRefUrl] = useState("")
  const [newRefLabel, setNewRefLabel] = useState("")
  const [savingField, setSavingField] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [expandedDatas, setExpandedDatas] = useState<Set<number>>(new Set())

  // Post edit sheet
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editForm, setEditForm] = useState<PostEditForm>({
    titulo: "", tipo: "feed", status: "planejado",
    data_publicacao: "", drive_file_url: "", notas: "", tema: "", aprovado: false,
  })
  const [savingPost, setSavingPost] = useState(false)

  // Debounce ref for datas ideias
  const datasTimeout = useRef<NodeJS.Timeout | null>(null)

  const supabase = createClient()
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/p/${planejamento.share_token}`
    : ""

  async function saveField(field: string, value: unknown) {
    setSavingField(field)
    const { error } = await supabase
      .from("planejamentos")
      .update({ [field]: value })
      .eq("id", planejamento.id)
    if (error) toast.error("Erro ao salvar")
    else toast.success("Salvo!")
    setSavingField(null)
  }

  function handleIdeiaChange(idx: number, value: string) {
    const updated = datas.map((d, i) => (i === idx ? { ...d, ideia: value } : d))
    setDatas(updated)
    if (datasTimeout.current) clearTimeout(datasTimeout.current)
    datasTimeout.current = setTimeout(() => saveField("datas_comemorativas", updated), 1500)
  }

  async function toggleAtivo(idx: number) {
    const updated = datas.map((d, i) => (i === idx ? { ...d, ativo: !d.ativo } : d))
    setDatas(updated)
    await saveField("datas_comemorativas", updated)
  }

  function toggleDataExpanded(idx: number) {
    setExpandedDatas((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  async function addReferencia() {
    if (!newRefUrl.trim()) return
    const nova: Referencia = {
      id: crypto.randomUUID(),
      url: newRefUrl.trim(),
      label: newRefLabel.trim() || newRefUrl.trim(),
    }
    const updated = [...referencias, nova]
    setReferencias(updated)
    setNewRefUrl("")
    setNewRefLabel("")
    await saveField("referencias", updated)
  }

  async function removeReferencia(id: string) {
    const updated = referencias.filter((r) => r.id !== id)
    setReferencias(updated)
    await saveField("referencias", updated)
  }

  async function updatePostPlataforma(postId: string, value: string) {
    setPostFields((prev) => ({ ...prev, [postId]: { ...prev[postId], plataforma: value } }))
    await supabase.from("posts").update({ plataforma: value }).eq("id", postId)
  }

  async function updatePostReferencia(postId: string, value: string) {
    await supabase.from("posts").update({ referencia_url: value || null }).eq("id", postId)
  }

  async function toggleAprovado(postId: string) {
    const post = posts.find((p) => p.id === postId)
    const current = postFields[postId]?.aprovado ?? false
    const next = !current
    const updates: Record<string, unknown> = { aprovado: next }
    if (next && post?.status === "planejado") {
      updates.status = "falta_insumo"
    }
    setPostFields((prev) => ({ ...prev, [postId]: { ...prev[postId], aprovado: next } }))
    await supabase.from("posts").update(updates).eq("id", postId)
    toast.success(next ? "Marcado para calendário oficial" : "Removido do calendário oficial")
    router.refresh()
  }

  function navMes(delta: number) {
    const d = new Date(ano, mesIndex + delta, 1)
    const nm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    router.push(`/clientes/${client.id}/planejamento?mes=${nm}`)
  }

  async function copyShareUrl() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Link copiado!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Erro ao copiar link")
    }
  }

  // Post edit functions
  function openPostEdit(post: Post) {
    setEditingPost(post)
    setEditForm({
      titulo: post.titulo,
      tipo: post.tipo,
      status: post.status,
      data_publicacao: post.data_publicacao ?? "",
      drive_file_url: post.drive_file_url ?? "",
      notas: post.notas ?? "",
      tema: post.tema ?? "",
      aprovado: post.aprovado ?? false,
    })
  }

  function setEditField(field: keyof PostEditForm, value: string | boolean) {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSavePost() {
    if (!editingPost) return
    setSavingPost(true)
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
        aprovado: editForm.aprovado,
      })
      .eq("id", editingPost.id)
    if (error) {
      toast.error("Erro ao salvar: " + error.message)
    } else {
      toast.success("Publicação atualizada!")
      setEditingPost(null)
      router.refresh()
    }
    setSavingPost(false)
  }

  async function handleDeletePost() {
    if (!editingPost) return
    if (!confirm("Remover esta publicação?")) return
    setSavingPost(true)
    const { error } = await supabase.from("posts").delete().eq("id", editingPost.id)
    if (error) {
      toast.error("Erro ao remover: " + error.message)
    } else {
      toast.success("Publicação removida!")
      setEditingPost(null)
      router.refresh()
    }
    setSavingPost(false)
  }

  const savingIndicator = (field: string) =>
    savingField === field ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navMes(-1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-black capitalize">{MESES[mesIndex]} {ano}</h2>
          <button type="button" onClick={() => navMes(1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <Button variant="outline" size="sm" onClick={copyShareUrl} className="gap-2">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
          {copied ? "Copiado!" : "Compartilhar link"}
        </Button>
      </div>

      {/* Objetivo do Mês */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">🎯 Objetivo Principal do Mês</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
            placeholder="Ex: Aumentar engajamento nos Reels, lançar novo produto, atingir 500 novos seguidores..."
            rows={3}
            className="resize-none text-sm"
          />
          <Button size="sm" onClick={() => saveField("objetivo_mes", objetivo)} disabled={savingField === "objetivo_mes"}>
            {savingIndicator("objetivo_mes") ?? null}
            {savingField === "objetivo_mes" ? "Salvando..." : "Salvar objetivo"}
          </Button>
        </CardContent>
      </Card>

      {/* Datas Comemorativas — compacto com expand por item */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            📅 Datas Comemorativas
            <span className="text-xs font-normal bg-muted px-2 py-0.5 rounded-full">
              {datas.filter(d => d.ativo).length} ativas
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {datas.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground italic">Nenhuma data comemorativa neste mês.</p>
          ) : (
            <div className="divide-y">
              {datas.map((d, idx) => (
                <div key={d.data} className={`transition-opacity ${d.ativo ? "" : "opacity-40"}`}>
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => toggleAtivo(idx)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        d.ativo ? "bg-primary border-primary" : "border-muted-foreground/40"
                      }`}
                    >
                      {d.ativo && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm">{d.nome}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(d.data + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDataExpanded(idx)}
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1"
                      title="Ver sugestão de conteúdo"
                    >
                      {expandedDatas.has(idx)
                        ? <ChevronUp className="h-4 w-4" />
                        : <ChevronDown className="h-4 w-4" />
                      }
                    </button>
                  </div>
                  {expandedDatas.has(idx) && (
                    <div className="px-4 pb-3 border-t bg-muted/20 space-y-2 pt-2">
                      <Label className="text-xs text-muted-foreground">Sugestão de ideia</Label>
                      <Textarea
                        value={d.ideia}
                        onChange={(e) => handleIdeiaChange(idx, e.target.value)}
                        rows={3}
                        className="resize-none text-sm"
                        placeholder="Descreva a ideia de conteúdo para esta data..."
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referências */}
      <Card>
        <CardHeader className="pb-0">
          <button
            type="button"
            onClick={() => setRefExpanded((v) => !v)}
            className="flex items-center justify-between w-full text-left py-1"
          >
            <CardTitle className="text-sm flex items-center gap-2">
              🔗 Referências
              {referencias.length > 0 && (
                <span className="text-xs font-normal bg-muted px-2 py-0.5 rounded-full">
                  {referencias.length}
                </span>
              )}
            </CardTitle>
            {refExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>

        {refExpanded && (
          <CardContent className="pt-4 space-y-4">
            {referencias.length > 0 && (
              <div className="space-y-2">
                {referencias.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 rounded-lg border p-2.5">
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm text-primary hover:underline truncate"
                    >
                      {r.label}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeReferencia(r.id)}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 border-t pt-4">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Adicionar referência</Label>
              <div className="flex gap-2">
                <Input
                  value={newRefLabel}
                  onChange={(e) => setNewRefLabel(e.target.value)}
                  placeholder="Nome / descrição"
                  className="text-sm"
                />
                <Input
                  value={newRefUrl}
                  onChange={(e) => setNewRefUrl(e.target.value)}
                  placeholder="https://..."
                  className="text-sm flex-1"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addReferencia() } }}
                />
                <Button type="button" size="sm" onClick={addReferencia} disabled={!newRefUrl.trim() || savingField === "referencias"}>
                  {savingField === "referencias" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Sugestões de Ações */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">💡 Sugestões de Ações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={sugestoes}
            onChange={(e) => setSugestoes(e.target.value)}
            placeholder="Ex: Publicar 3x na semana, priorizar Reels até as 18h, criar enquete nos Stories toda terça..."
            rows={4}
            className="resize-none text-sm"
          />
          <Button size="sm" onClick={() => saveField("sugestoes_acoes", sugestoes)} disabled={savingField === "sugestoes_acoes"}>
            {savingField === "sugestoes_acoes" ? "Salvando..." : "Salvar sugestões"}
          </Button>
        </CardContent>
      </Card>

      {/* Conteúdos do Mês */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              📋 Conteúdos do Mês
              <span className="text-xs font-normal bg-muted px-2 py-0.5 rounded-full">{posts.length}</span>
            </CardTitle>
            <a
              href={`/publicacoes/novo?client_id=${client.id}`}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo conteúdo
            </a>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {posts.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground italic text-center">
              Nenhum conteúdo com data programada para {MESES[mesIndex]}.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs text-muted-foreground uppercase tracking-wide">
                    <th className="px-4 py-2 text-left font-semibold">Título</th>
                    <th className="px-3 py-2 text-left font-semibold">Tipo</th>
                    <th className="px-3 py-2 text-left font-semibold">Data</th>
                    <th className="px-3 py-2 text-left font-semibold">Plataforma</th>
                    <th className="px-3 py-2 text-left font-semibold">Referência</th>
                    <th className="px-3 py-2 text-left font-semibold">Status</th>
                    <th className="px-3 py-2 text-center font-semibold">Cal. Oficial</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => {
                    const pf = postFields[post.id] ?? { plataforma: "instagram", referencia_url: "", aprovado: false }
                    return (
                      <tr
                        key={post.id}
                        className="border-b last:border-0 hover:bg-muted/20 cursor-pointer"
                        onClick={() => openPostEdit(post)}
                      >
                        <td className="px-4 py-2.5">
                          <p className="font-semibold truncate max-w-[180px]">{post.titulo}</p>
                          {post.tema && <p className="text-xs text-muted-foreground truncate max-w-[180px]">{post.tema}</p>}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                          {TYPE_LABELS[post.tipo] ?? post.tipo}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                          {post.data_publicacao
                            ? new Date(post.data_publicacao + "T00:00:00").toLocaleDateString("pt-BR")
                            : "—"}
                        </td>
                        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={pf.plataforma}
                            onValueChange={(v) => v && updatePostPlataforma(post.id, v)}
                          >
                            <SelectTrigger className="h-7 text-xs w-[110px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="ambos">Ambos</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <Input
                            className="h-7 text-xs w-[160px]"
                            placeholder="https://..."
                            value={pf.referencia_url}
                            onChange={(e) =>
                              setPostFields((prev) => ({
                                ...prev,
                                [post.id]: { ...prev[post.id], referencia_url: e.target.value },
                              }))
                            }
                            onBlur={(e) => updatePostReferencia(post.id, e.target.value)}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_COLORS[post.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {STATUS_LABELS[post.status] ?? post.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => toggleAprovado(post.id)}
                            title={pf.aprovado ? "Remover do calendário oficial" : "Mover para calendário oficial"}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mx-auto transition-colors ${
                              pf.aprovado
                                ? "bg-green-500 border-green-500 text-white hover:bg-green-600"
                                : "border-gray-300 text-gray-300 hover:border-gray-400 hover:text-gray-400"
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendário — todos os posts com data */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">📆 Calendário de Publicações</CardTitle>
            <span className="text-xs text-muted-foreground">
              {posts.filter((p) => p.data_publicacao).length} com data · clique para editar
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          <CalendarioPlan
            posts={posts}
            ano={ano}
            mes={mesIndex}
            onPostClick={openPostEdit}
          />
        </CardContent>
      </Card>

      {/* Sheet de edição de post */}
      <Sheet open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
          <SheetHeader className="px-5 py-4 border-b shrink-0">
            <SheetTitle className="text-base font-semibold">Editar Publicação</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Título</Label>
              <Input value={editForm.titulo} onChange={(e) => setEditField("titulo", e.target.value)} className="text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</Label>
                <Select value={editForm.tipo} onValueChange={(v) => v && setEditField("tipo", v)}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
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
                <Select value={editForm.status} onValueChange={(v) => v && setEditField("status", v)}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
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
              <Input type="date" value={editForm.data_publicacao} onChange={(e) => setEditField("data_publicacao", e.target.value)} className="text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tema / Ideia</Label>
              <Textarea
                value={editForm.tema}
                onChange={(e) => setEditField("tema", e.target.value)}
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
                onChange={(e) => setEditField("drive_file_url", e.target.value)}
                className="text-sm"
                placeholder="https://drive.google.com/..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notas / Legenda</Label>
              <Textarea
                value={editForm.notas}
                onChange={(e) => setEditField("notas", e.target.value)}
                rows={4}
                className="text-sm resize-none"
                placeholder="Legenda, hashtags, observações..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Calendário</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditField("aprovado", false)}
                  className={`py-2.5 px-3 rounded-lg border-2 text-xs font-semibold transition-all text-left ${
                    !editForm.aprovado ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground"
                  }`}
                >
                  📋 Planejamento
                </button>
                <button
                  type="button"
                  onClick={() => setEditForm((prev) => ({
                    ...prev,
                    aprovado: true,
                    status: prev.status === "planejado" ? "falta_insumo" : prev.status,
                  }))}
                  className={`py-2.5 px-3 rounded-lg border-2 text-xs font-semibold transition-all text-left ${
                    editForm.aprovado ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground"
                  }`}
                >
                  📅 Calendário Oficial
                </button>
              </div>
            </div>
          </div>

          <SheetFooter className="px-5 py-4 border-t shrink-0 flex-row gap-2">
            <Button onClick={handleSavePost} disabled={savingPost} className="flex-1">
              {savingPost ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Salvar alterações"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeletePost} disabled={savingPost} className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10">
              Remover
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
