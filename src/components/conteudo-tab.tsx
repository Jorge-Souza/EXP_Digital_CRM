"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { ChevronDown, ChevronUp, FileText, Video, LayoutGrid } from "lucide-react"

type ConteudoPost = {
  id: string
  dia: number
  semana: number
  horario: "manha" | "noite"
  formato: "reel" | "carrossel"
  categoria: string
  titulo: string
  roteiro: string | null
  direcao: string | null
  cta_legenda: string | null
  dados_apoio: string | null
  status: "pendente" | "gravado" | "editado" | "publicado"
  data_publicacao: string | null
  notas: string | null
}

const STATUS_CONFIG: Record<ConteudoPost["status"], { label: string; cor: string; next: ConteudoPost["status"] | null }> = {
  pendente:  { label: "Pendente",  cor: "bg-gray-500/20 text-gray-400 border-gray-500/30",    next: "gravado" },
  gravado:   { label: "Gravado",   cor: "bg-blue-500/20 text-blue-400 border-blue-500/30",    next: "editado" },
  editado:   { label: "Editado",   cor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", next: "publicado" },
  publicado: { label: "Publicado", cor: "bg-green-500/20 text-green-400 border-green-500/30", next: null },
}

const CATEGORIA_COR: Record<string, string> = {
  estalo:    "bg-red-500/10 text-red-400 border-red-500/20",
  tutorial:  "bg-green-500/10 text-green-400 border-green-500/20",
  reacao:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  caso:      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  bastidor:  "bg-pink-500/10 text-pink-400 border-pink-500/20",
  previsao:  "bg-purple-500/10 text-purple-400 border-purple-500/20",
  narrativa: "bg-teal-500/10 text-teal-400 border-teal-500/20",
}

const SEMANA_LABEL: Record<number, string> = {
  1: "Semana 1 — Instalar Autoridade",
  2: "Semana 2 — Ampliar Alcance",
  3: "Semana 3 — Aprofundar Posicionamento",
  4: "Semana 4 — Converter com Autoridade",
}

function PostCard({ post, isAdmin }: { post: ConteudoPost; isAdmin: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notas, setNotas] = useState(post.notas ?? "")
  const [status, setStatus] = useState(post.status)
  const router = useRouter()
  const supabase = createClient()

  const statusInfo = STATUS_CONFIG[status]
  const catCor = CATEGORIA_COR[post.categoria] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20"

  async function avancarStatus() {
    const next = statusInfo.next
    if (!next) return
    setSaving(true)
    const { error } = await supabase
      .from("conteudo_posts")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", post.id)
    setSaving(false)
    if (error) { toast.error("Erro ao atualizar status"); return }
    setStatus(next)
    toast.success(`Status: ${STATUS_CONFIG[next].label}`)
    router.refresh()
  }

  async function salvarNotas() {
    setSaving(true)
    await supabase.from("conteudo_posts").update({ notas, updated_at: new Date().toISOString() }).eq("id", post.id)
    setSaving(false)
    toast.success("Notas salvas")
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="flex items-start justify-between gap-3 p-4 pb-3">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {post.horario === "manha" ? "☀️ Manhã" : "🌙 Noite"}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${post.formato === "reel" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"}`}>
              {post.formato === "reel" ? <><Video className="h-2.5 w-2.5" />Reel</> : <><LayoutGrid className="h-2.5 w-2.5" />Carrossel</>}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${catCor}`}>
              {post.categoria}
            </span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${statusInfo.cor}`}>
            {statusInfo.label}
          </span>
        </div>
        <div className="px-4 pb-3">
          <p className="font-semibold text-sm leading-tight">{post.titulo}</p>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {/* Expandir roteiro */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <FileText className="h-3.5 w-3.5" />
          {expanded ? "Ocultar roteiro" : "Ver roteiro completo"}
          {expanded ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
        </button>

        {expanded && (
          <div className="space-y-3 text-xs">
            {post.roteiro && (
              <div className="bg-muted/30 rounded-md p-3 border border-border">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Roteiro</p>
                <pre className="whitespace-pre-wrap font-sans text-foreground/80 leading-relaxed">{post.roteiro}</pre>
              </div>
            )}
            {post.direcao && (
              <div className="bg-muted/20 rounded-md p-3 border border-border">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Direção de gravação</p>
                <p className="text-foreground/70 leading-relaxed">{post.direcao}</p>
              </div>
            )}
            {post.cta_legenda && (
              <div className="bg-primary/5 rounded-md p-3 border border-primary/20">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">CTA + Legenda</p>
                <p className="text-foreground/80 leading-relaxed">{post.cta_legenda}</p>
              </div>
            )}
            {post.dados_apoio && (
              <div className="bg-muted/10 rounded-md p-3 border border-border">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Dados de apoio</p>
                <p className="text-foreground/60 leading-relaxed">{post.dados_apoio}</p>
              </div>
            )}
            {isAdmin && (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Notas internas</p>
                <Textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Observações, ajustes, feedback..."
                  className="text-xs resize-none h-20"
                />
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={salvarNotas} disabled={saving}>
                  Salvar notas
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Botão avançar status */}
        {isAdmin && statusInfo.next && (
          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs"
            onClick={avancarStatus}
            disabled={saving}
          >
            Marcar como {STATUS_CONFIG[statusInfo.next].label} →
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

interface ConteudoTabProps {
  posts: ConteudoPost[]
  isAdmin: boolean
}

export function ConteudoTab({ posts, isAdmin }: ConteudoTabProps) {
  const [diaAtivo, setDiaAtivo] = useState(1)

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Nenhum conteúdo cadastrado ainda.
      </div>
    )
  }

  const dias = Array.from(new Set(posts.map(p => p.dia))).sort((a, b) => a - b)
  const postsDia = posts.filter(p => p.dia === diaAtivo)
  const semana = posts.find(p => p.dia === diaAtivo)?.semana ?? 1

  // Progresso geral
  const total = posts.length
  const publicados = posts.filter(p => p.status === "publicado").length
  const gravados = posts.filter(p => p.status === "gravado" || p.status === "editado").length

  return (
    <div className="space-y-4">
      {/* Progresso geral */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">{publicados} publicados</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">{gravados} em produção</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gray-500" />
          <span className="text-muted-foreground">{total - publicados - gravados} pendentes</span>
        </div>
      </div>

      {/* Navegação por dia */}
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
          const temPost = dias.includes(d)
          const postsDoDia = posts.filter(p => p.dia === d)
          const todoPublicado = postsDoDia.length > 0 && postsDoDia.every(p => p.status === "publicado")
          const algumGravado = postsDoDia.some(p => p.status === "gravado" || p.status === "editado")
          return (
            <button
              key={d}
              onClick={() => setDiaAtivo(d)}
              disabled={!temPost}
              className={`w-8 h-8 text-xs font-mono rounded-md border transition-colors ${
                d === diaAtivo
                  ? "bg-primary text-primary-foreground border-primary"
                  : todoPublicado
                  ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                  : algumGravado
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"
                  : temPost
                  ? "bg-muted/50 border-border hover:bg-accent text-foreground"
                  : "border-border/30 text-muted-foreground/30 cursor-not-allowed"
              }`}
            >
              {d < 10 ? `0${d}` : d}
            </button>
          )
        })}
      </div>

      {/* Semana label */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{SEMANA_LABEL[semana]}</p>
      </div>

      {/* Posts do dia */}
      {postsDia.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm border rounded-md border-dashed">
          Roteiro do dia {diaAtivo} ainda não foi criado.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {postsDia.sort((a, b) => a.horario === "manha" ? -1 : 1).map(post => (
            <PostCard key={post.id} post={post} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  )
}
