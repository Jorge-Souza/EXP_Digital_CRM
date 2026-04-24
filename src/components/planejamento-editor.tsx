"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronLeft, ChevronRight, Link2, Copy, Plus, Trash2,
  ExternalLink, ChevronDown, ChevronUp, Loader2, Check,
} from "lucide-react"
import { toast } from "sonner"
import { CalendarioPlan } from "@/components/calendario-plan"
import type { Client, Planejamento, DataComemorativa, Referencia, Post } from "@/lib/types"

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

  // Fields state
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
      .update({ [field]: value, updated_at: new Date().toISOString() })
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
    const current = postFields[postId]?.aprovado ?? false
    const next = !current
    setPostFields((prev) => ({ ...prev, [postId]: { ...prev[postId], aprovado: next } }))
    await supabase.from("posts").update({ aprovado: next }).eq("id", postId)
    toast.success(next ? "Aprovado para o calendário" : "Removido do calendário")
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

  const savingIndicator = (field: string) =>
    savingField === field ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => navMes(-1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-black capitalize">{MESES[mesIndex]} {ano}</h2>
          <button onClick={() => navMes(1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
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

      {/* Datas Comemorativas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">📅 Datas Comemorativas</CardTitle>
        </CardHeader>
        <CardContent>
          {datas.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Nenhuma data comemorativa neste mês.</p>
          ) : (
            <div className="space-y-4">
              {datas.map((d, idx) => (
                <div key={d.data} className={`rounded-xl border p-4 space-y-3 transition-opacity ${d.ativo ? "" : "opacity-50"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleAtivo(idx)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          d.ativo ? "bg-primary border-primary" : "border-muted-foreground/40"
                        }`}
                      >
                        {d.ativo && <Check className="h-3 w-3 text-primary-foreground" />}
                      </button>
                      <div>
                        <p className="font-semibold text-sm">{d.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(d.data + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={d.ativo ? "default" : "outline"} className="text-xs shrink-0">
                      {d.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Sugestão de ideia</Label>
                    <Textarea
                      value={d.ideia}
                      onChange={(e) => handleIdeiaChange(idx, e.target.value)}
                      rows={3}
                      className="resize-none text-sm"
                      placeholder="Descreva a ideia de conteúdo para esta data..."
                    />
                  </div>
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
            onClick={() => setRefExpanded((v) => !v)}
            className="flex items-center justify-between w-full text-left"
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
                  onKeyDown={(e) => e.key === "Enter" && addReferencia()}
                />
                <Button size="sm" onClick={addReferencia} disabled={!newRefUrl.trim()}>
                  <Plus className="h-4 w-4" />
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
                    <th className="px-3 py-2 text-center font-semibold">No Calendário</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => {
                    const pf = postFields[post.id] ?? { plataforma: "instagram", referencia_url: "" }
                    return (
                      <tr key={post.id} className="border-b last:border-0 hover:bg-muted/20">
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
                        <td className="px-3 py-2.5">
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
                        <td className="px-3 py-2.5">
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
                        <td className="px-3 py-2.5 text-center">
                          <button
                            onClick={() => toggleAprovado(post.id)}
                            title={pf.aprovado ? "Remover do calendário" : "Aprovar para o calendário"}
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

      {/* Calendário — apenas posts aprovados */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">📆 Calendário de Publicações</CardTitle>
            <span className="text-xs text-muted-foreground">
              {posts.filter((p) => postFields[p.id]?.aprovado).length} aprovados
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          <CalendarioPlan
            posts={posts.filter((p) => postFields[p.id]?.aprovado === true)}
            ano={ano}
            mes={mesIndex}
          />
        </CardContent>
      </Card>
    </div>
  )
}
