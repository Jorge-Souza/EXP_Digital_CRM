"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Plus, Video, LayoutGrid, ChevronDown, ChevronUp,
  FileText, Rocket, Megaphone, Tv2, Handshake, Zap, Target,
  Calendar, CheckCircle2, Clock, PauseCircle, Lightbulb, Pencil, Trash2
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

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
  notas: string | null
}

type Iniciativa = {
  id: string
  titulo: string
  descricao: string | null
  tipo: "lancamento" | "campanha" | "conteudo" | "live" | "parceria" | "acao"
  status: "ideia" | "planejando" | "em_execucao" | "concluido" | "pausado"
  prioridade: "alta" | "media" | "baixa"
  data_inicio: string | null
  data_fim: string | null
  meta: string | null
  resultado: string | null
  notas: string | null
}

// ─── Config ──────────────────────────────────────────────────────────────────

const POST_STATUS: Record<ConteudoPost["status"], { label: string; cor: string; next: ConteudoPost["status"] | null }> = {
  pendente:  { label: "Pendente",  cor: "bg-gray-500/20 text-gray-400 border-gray-500/30",       next: "gravado" },
  gravado:   { label: "Gravado",   cor: "bg-blue-500/20 text-blue-400 border-blue-500/30",       next: "editado" },
  editado:   { label: "Editado",   cor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", next: "publicado" },
  publicado: { label: "Publicado", cor: "bg-green-500/20 text-green-400 border-green-500/30",    next: null },
}

const INIC_STATUS: Record<Iniciativa["status"], { label: string; cor: string; icon: React.ElementType }> = {
  ideia:       { label: "Ideia",        cor: "bg-gray-500/20 text-gray-400 border-gray-500/30",    icon: Lightbulb },
  planejando:  { label: "Planejando",   cor: "bg-blue-500/20 text-blue-400 border-blue-500/30",   icon: Clock },
  em_execucao: { label: "Em Execução",  cor: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: Zap },
  concluido:   { label: "Concluído",    cor: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2 },
  pausado:     { label: "Pausado",      cor: "bg-red-500/20 text-red-400 border-red-500/30",      icon: PauseCircle },
}

const INIC_TIPO: Record<Iniciativa["tipo"], { label: string; icon: React.ElementType; cor: string }> = {
  lancamento: { label: "Lançamento", icon: Rocket,     cor: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  campanha:   { label: "Campanha",   icon: Megaphone,  cor: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  conteudo:   { label: "Conteúdo",   icon: Video,      cor: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  live:       { label: "Live",       icon: Tv2,        cor: "bg-red-500/10 text-red-400 border-red-500/20" },
  parceria:   { label: "Parceria",   icon: Handshake,  cor: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
  acao:       { label: "Ação",       icon: Target,     cor: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
}

const PRIORIDADE: Record<Iniciativa["prioridade"], { label: string; cor: string }> = {
  alta:  { label: "Alta",  cor: "bg-red-500/20 text-red-400 border-red-500/30" },
  media: { label: "Média", cor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  baixa: { label: "Baixa", cor: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
}

const CAT_COR: Record<string, string> = {
  estalo:    "bg-red-500/10 text-red-400 border-red-500/20",
  tutorial:  "bg-green-500/10 text-green-400 border-green-500/20",
  reacao:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  caso:      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  bastidor:  "bg-pink-500/10 text-pink-400 border-pink-500/20",
  previsao:  "bg-purple-500/10 text-purple-400 border-purple-500/20",
  narrativa: "bg-teal-500/10 text-teal-400 border-teal-500/20",
}

const SEMANA_LABEL: Record<number, { titulo: string; sub: string }> = {
  1: { titulo: "Semana 1", sub: "Instalar Autoridade" },
  2: { titulo: "Semana 2", sub: "Ampliar Alcance" },
  3: { titulo: "Semana 3", sub: "Aprofundar Posicionamento" },
  4: { titulo: "Semana 4", sub: "Converter com Autoridade" },
}

// ─── Post Card ───────────────────────────────────────────────────────────────

function PostCard({ post }: { post: ConteudoPost }) {
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState(post.status)
  const [notas, setNotas] = useState(post.notas ?? "")
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const st = POST_STATUS[status]
  const catCor = CAT_COR[post.categoria] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20"

  async function avancar() {
    const next = st.next; if (!next) return
    setSaving(true)
    const { error } = await supabase.from("conteudo_posts").update({ status: next, updated_at: new Date().toISOString() }).eq("id", post.id)
    setSaving(false)
    if (error) { toast.error("Erro"); return }
    setStatus(next); toast.success(`✓ ${POST_STATUS[next].label}`); router.refresh()
  }

  async function salvarNotas() {
    setSaving(true)
    await supabase.from("conteudo_posts").update({ notas, updated_at: new Date().toISOString() }).eq("id", post.id)
    setSaving(false); toast.success("Notas salvas")
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-2 p-3 pb-2">
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-[10px] text-muted-foreground font-medium">{post.horario === "manha" ? "☀️ Manhã" : "🌙 Noite"}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${post.formato === "reel" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"}`}>
            {post.formato === "reel" ? "Reel" : "Carrossel"}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${catCor}`}>{post.categoria}</span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${st.cor}`}>{st.label}</span>
      </div>
      <div className="px-3 pb-2">
        <p className="text-sm font-semibold leading-tight">{post.titulo}</p>
      </div>
      <div className="px-3 pb-3 space-y-2">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground w-full">
          <FileText className="h-3 w-3" />{expanded ? "Ocultar roteiro" : "Ver roteiro"}
          {expanded ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
        </button>
        {expanded && (
          <div className="space-y-2 text-xs">
            {post.roteiro && <div className="bg-muted/30 rounded p-2.5 border text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">{post.roteiro}</div>}
            {post.direcao && <div className="bg-muted/20 rounded p-2.5 border"><span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">Direção</span><p className="text-foreground/70">{post.direcao}</p></div>}
            {post.cta_legenda && <div className="bg-primary/5 rounded p-2.5 border border-primary/20"><span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">CTA + Legenda</span><p className="text-foreground/80">{post.cta_legenda}</p></div>}
            {post.dados_apoio && <div className="bg-muted/10 rounded p-2.5 border"><span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">Dados de Apoio</span><p className="text-foreground/60">{post.dados_apoio}</p></div>}
            <div>
              <Textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Notas de produção..." className="text-xs resize-none h-16 mb-1" />
              <Button size="sm" variant="outline" className="h-6 text-[11px]" onClick={salvarNotas} disabled={saving}>Salvar notas</Button>
            </div>
          </div>
        )}
        {st.next && (
          <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={avancar} disabled={saving}>
            Marcar como {POST_STATUS[st.next].label} →
          </Button>
        )}
      </div>
    </Card>
  )
}

// ─── Iniciativa Card ─────────────────────────────────────────────────────────

function InicativaCard({ ini, onEdit, onDelete }: { ini: Iniciativa; onEdit: (i: Iniciativa) => void; onDelete: (id: string) => void }) {
  const st = INIC_STATUS[ini.status]
  const tipo = INIC_TIPO[ini.tipo]
  const prio = PRIORIDADE[ini.prioridade]
  const Icon = tipo.icon

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${tipo.cor}`}>
              <Icon className="h-2.5 w-2.5" />{tipo.label}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${prio.cor}`}>{prio.label}</span>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => onEdit(ini)} className="text-muted-foreground hover:text-foreground transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
            <button onClick={() => onDelete(ini.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        </div>
        <p className="font-semibold text-sm leading-tight">{ini.titulo}</p>
        {ini.descricao && <p className="text-xs text-muted-foreground leading-relaxed">{ini.descricao}</p>}
        {ini.meta && <div className="text-xs bg-muted/20 rounded p-2 border"><span className="font-medium text-muted-foreground">Meta:</span> {ini.meta}</div>}
        {ini.resultado && <div className="text-xs bg-green-500/5 rounded p-2 border border-green-500/20"><span className="font-medium text-green-400">Resultado:</span> {ini.resultado}</div>}
        {(ini.data_inicio || ini.data_fim) && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {ini.data_inicio && new Date(ini.data_inicio + "T00:00").toLocaleDateString("pt-BR")}
            {ini.data_inicio && ini.data_fim && " → "}
            {ini.data_fim && new Date(ini.data_fim + "T00:00").toLocaleDateString("pt-BR")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Form Iniciativa ──────────────────────────────────────────────────────────

type FormInic = { titulo: string; descricao: string; tipo: string; status: string; prioridade: string; data_inicio: string; data_fim: string; meta: string; resultado: string; notas: string }
const emptyForm: FormInic = { titulo: "", descricao: "", tipo: "acao", status: "ideia", prioridade: "media", data_inicio: "", data_fim: "", meta: "", resultado: "", notas: "" }

function InicativaDialog({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: Iniciativa | null }) {
  const [form, setForm] = useState<FormInic>(editing ? {
    titulo: editing.titulo, descricao: editing.descricao ?? "", tipo: editing.tipo, status: editing.status,
    prioridade: editing.prioridade, data_inicio: editing.data_inicio ?? "", data_fim: editing.data_fim ?? "",
    meta: editing.meta ?? "", resultado: editing.resultado ?? "", notas: editing.notas ?? "",
  } : emptyForm)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function set(k: string, v: string) { setForm(prev => ({ ...prev, [k]: v })) }

  async function save() {
    if (!form.titulo.trim()) { toast.error("Título obrigatório"); return }
    setSaving(true)
    const payload = {
      titulo: form.titulo.trim(), descricao: form.descricao || null, tipo: form.tipo, status: form.status,
      prioridade: form.prioridade, data_inicio: form.data_inicio || null, data_fim: form.data_fim || null,
      meta: form.meta || null, resultado: form.resultado || null, notas: form.notas || null,
      updated_at: new Date().toISOString(),
    }
    const { error } = editing
      ? await supabase.from("marketing_iniciativas").update(payload).eq("id", editing.id)
      : await supabase.from("marketing_iniciativas").insert(payload)
    setSaving(false)
    if (error) { toast.error("Erro ao salvar"); return }
    toast.success(editing ? "Iniciativa atualizada" : "Iniciativa criada")
    onClose(); router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "Editar iniciativa" : "Nova iniciativa"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Título *</Label><Input value={form.titulo} onChange={e => set("titulo", e.target.value)} placeholder="Ex: Lançamento Protocolo TikTok Shop" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={v => set("tipo", v ?? "acao")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(INIC_TIPO).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Prioridade</Label>
              <Select value={form.prioridade} onValueChange={v => set("prioridade", v ?? "media")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(PRIORIDADE).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Status</Label>
            <Select value={form.status} onValueChange={v => set("status", v ?? "ideia")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(INIC_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Descrição</Label><Textarea value={form.descricao} onChange={e => set("descricao", e.target.value)} placeholder="O que é essa iniciativa?" className="resize-none h-20" /></div>
          <div><Label>Meta</Label><Input value={form.meta} onChange={e => set("meta", e.target.value)} placeholder="Ex: 50 vendas, 10k visualizações..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Data início</Label><Input type="date" value={form.data_inicio} onChange={e => set("data_inicio", e.target.value)} /></div>
            <div><Label>Data fim</Label><Input type="date" value={form.data_fim} onChange={e => set("data_fim", e.target.value)} /></div>
          </div>
          <div><Label>Resultado</Label><Textarea value={form.resultado} onChange={e => set("resultado", e.target.value)} placeholder="O que aconteceu? Quais foram os números?" className="resize-none h-16" /></div>
          <div><Label>Notas</Label><Textarea value={form.notas} onChange={e => set("notas", e.target.value)} placeholder="Observações internas..." className="resize-none h-16" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : editing ? "Salvar" : "Criar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ConteudoMarketing({ posts, iniciativas: iniciativasInit }: { posts: ConteudoPost[]; iniciativas: Iniciativa[] }) {
  const [diaAtivo, setDiaAtivo] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Iniciativa | null>(null)
  const [iniciativas, setIniciativas] = useState(iniciativasInit)
  const router = useRouter()
  const supabase = createClient()

  const dias = Array.from(new Set(posts.map(p => p.dia))).sort((a, b) => a - b)
  const postsDia = posts.filter(p => p.dia === diaAtivo)
  const semana = posts.find(p => p.dia === diaAtivo)?.semana ?? 1
  const semInfo = SEMANA_LABEL[semana] ?? { titulo: `Semana ${semana}`, sub: "" }

  const totalPosts = posts.length
  const publicados = posts.filter(p => p.status === "publicado").length
  const emProducao = posts.filter(p => p.status === "gravado" || p.status === "editado").length
  const pendentes = totalPosts - publicados - emProducao

  const statusCols: Iniciativa["status"][] = ["ideia", "planejando", "em_execucao", "concluido"]

  async function deleteIniciativa(id: string) {
    if (!confirm("Remover iniciativa?")) return
    await supabase.from("marketing_iniciativas").delete().eq("id", id)
    setIniciativas(prev => prev.filter(i => i.id !== id))
    toast.success("Removida")
  }

  function openEdit(ini: Iniciativa) { setEditing(ini); setDialogOpen(true) }
  function openNew() { setEditing(null); setDialogOpen(true) }
  function closeDialog() { setDialogOpen(false); setEditing(null) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Conteúdo & Marketing</h1>
          <p className="text-sm text-muted-foreground">Calendário de produção e iniciativas estratégicas</p>
        </div>
      </div>

      <Tabs defaultValue="calendario">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendario">🎬 Calendário de Conteúdo</TabsTrigger>
          <TabsTrigger value="iniciativas">🚀 Iniciativas de Marketing</TabsTrigger>
        </TabsList>

        {/* ── CALENDÁRIO ── */}
        <TabsContent value="calendario" className="mt-4 space-y-4">
          {/* Métricas */}
          <div className="grid grid-cols-3 gap-3">
            <Card><CardContent className="p-3 text-center"><div className="text-2xl font-bold text-green-400">{publicados}</div><div className="text-xs text-muted-foreground mt-0.5">Publicados</div></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><div className="text-2xl font-bold text-blue-400">{emProducao}</div><div className="text-xs text-muted-foreground mt-0.5">Em produção</div></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><div className="text-2xl font-bold text-gray-400">{pendentes}</div><div className="text-xs text-muted-foreground mt-0.5">Pendentes</div></CardContent></Card>
          </div>

          {/* Navegação dias */}
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(d => {
              const temPost = dias.includes(d)
              const dp = posts.filter(p => p.dia === d)
              const todoPub = dp.length > 0 && dp.every(p => p.status === "publicado")
              const algumGrav = dp.some(p => p.status === "gravado" || p.status === "editado")
              return (
                <button key={d} onClick={() => temPost && setDiaAtivo(d)} disabled={!temPost}
                  className={`w-9 h-9 text-xs font-mono rounded-md border transition-colors ${
                    d === diaAtivo ? "bg-primary text-primary-foreground border-primary"
                    : todoPub ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                    : algumGrav ? "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"
                    : temPost ? "bg-muted/50 border-border hover:bg-accent"
                    : "border-border/20 text-muted-foreground/20 cursor-not-allowed"
                  }`}>
                  {d < 10 ? `0${d}` : d}
                </button>
              )
            })}
          </div>

          {/* Semana label */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-foreground">{semInfo.titulo}</span>
            <span className="text-sm text-muted-foreground">— {semInfo.sub}</span>
          </div>

          {/* Posts */}
          {postsDia.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm border rounded-md border-dashed">
              Roteiro do dia {diaAtivo} ainda não foi criado.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {[...postsDia].sort(a => a.horario === "manha" ? -1 : 1).map(p => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </TabsContent>

        {/* ── INICIATIVAS ── */}
        <TabsContent value="iniciativas" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{iniciativas.length} iniciativas cadastradas</p>
            <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1.5" />Nova iniciativa</Button>
          </div>

          {/* Kanban por status */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statusCols.map(col => {
              const st = INIC_STATUS[col]
              const Icon = st.icon
              const colInics = iniciativas.filter(i => i.status === col)
              return (
                <div key={col} className="space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-border">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{st.label}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">{colInics.length}</Badge>
                  </div>
                  {colInics.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground/40 border border-dashed rounded-md">vazio</div>
                  ) : (
                    colInics.map(ini => <InicativaCard key={ini.id} ini={ini} onEdit={openEdit} onDelete={deleteIniciativa} />)
                  )}
                </div>
              )
            })}
          </div>

          {/* Pausados */}
          {iniciativas.filter(i => i.status === "pausado").length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Pausados</p>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {iniciativas.filter(i => i.status === "pausado").map(ini => (
                  <InicativaCard key={ini.id} ini={ini} onEdit={openEdit} onDelete={deleteIniciativa} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <InicativaDialog open={dialogOpen} onClose={closeDialog} editing={editing} />
    </div>
  )
}
