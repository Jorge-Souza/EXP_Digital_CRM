"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Post, PostStatus, PostType } from "@/lib/types"

const STATUS_COLORS: Record<string, string> = {
  planejado: "bg-gray-300 text-gray-800",
  falta_insumo:    "bg-red-400 text-red-950",
  producao:        "bg-yellow-300 text-yellow-900",
  aprovado_design: "bg-orange-400 text-orange-950",
  aprovado:        "bg-blue-400 text-blue-950",
  agendado:        "bg-amber-800 text-amber-50",
  publicado:       "bg-green-400 text-green-950",
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

const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
]

function calcularPascoa(year: number): Date {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100
  const d = Math.floor(b / 4), e = b % 4
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month, day)
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date); d.setDate(d.getDate() + days); return d
}

function toKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function getFeriadosBrasil(year: number): Map<string, string> {
  const f = new Map<string, string>()
  const add = (date: Date, nome: string) => f.set(toKey(date), nome)
  const d = (m: number, day: number) => new Date(year, m - 1, day)
  add(d(1, 1),   "Confraternização Universal")
  add(d(4, 21),  "Tiradentes")
  add(d(5, 1),   "Dia do Trabalho")
  add(d(9, 7),   "Independência")
  add(d(10, 12), "N. Sra. Aparecida")
  add(d(11, 2),  "Finados")
  add(d(11, 15), "Proclamação da República")
  add(d(11, 20), "Consciência Negra")
  add(d(12, 25), "Natal")
  const pascoa = calcularPascoa(year)
  add(addDays(pascoa, -48), "Carnaval")
  add(addDays(pascoa, -47), "Carnaval")
  add(addDays(pascoa, -2),  "Sexta-feira Santa")
  add(pascoa,               "Páscoa")
  add(addDays(pascoa, 60),  "Corpus Christi")
  return f
}

interface EditForm {
  titulo: string; tipo: string; status: string
  data_publicacao: string; drive_file_url: string; notas: string; tema: string
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
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({
    titulo: "", tipo: "feed", status: "planejado",
    data_publicacao: "", drive_file_url: "", notas: "", tema: "",
  })
  const [saving, setSaving] = useState(false)

  const feriados = getFeriadosBrasil(ano)
  const primeiroDia = new Date(ano, mes, 1)
  const totalDias = new Date(ano, mes + 1, 0).getDate()
  let inicioCelula = primeiroDia.getDay() - 1
  if (inicioCelula < 0) inicioCelula = 6

  const postsByDate = new Map<string, Post[]>()
  posts.forEach((p) => {
    if (!p.data_publicacao) return
    const key = p.data_publicacao.slice(0, 10)
    if (!postsByDate.has(key)) postsByDate.set(key, [])
    postsByDate.get(key)!.push(p)
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
    })
  }

  function setField(field: keyof EditForm, value: string) {
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
      setEditingPost(null)
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
      setEditingPost(null)
      router.refresh()
    }
    setSaving(false)
  }

  const celulas: (number | null)[] = [
    ...Array(inicioCelula).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ]
  while (celulas.length % 7 !== 0) celulas.push(null)

  return (
    <>
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
          <button onClick={() => navMes(-1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-black capitalize">{MESES[mes]} {ano}</h2>
          <button onClick={() => navMes(1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Cabeçalho dias */}
        <div className="grid grid-cols-7 border-b">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-bold text-muted-foreground uppercase tracking-wide border-r last:border-r-0">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7">
          {celulas.map((dia, idx) => {
            if (dia === null) {
              return <div key={`e-${idx}`} className="border-r border-b last:border-r-0 bg-muted/20 min-h-[120px]" />
            }
            const key = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
            const feriado = feriados.get(key)
            const dayPosts = postsByDate.get(key) ?? []
            const isToday = dia === today.getDate() && mes === today.getMonth() && ano === today.getFullYear()
            const colIdx = (inicioCelula + dia - 1) % 7
            const isWeekend = colIdx === 5 || colIdx === 6

            return (
              <div
                key={key}
                className={`border-r border-b last:border-r-0 min-h-[120px] p-1.5 flex flex-col gap-1 group/day
                  ${feriado
                    ? "bg-purple-100 dark:bg-purple-900/40"
                    : isWeekend
                    ? "bg-muted/30"
                    : "bg-background"
                  }
                `}
              >
                {/* Número + feriado + botão + */}
                <div className="flex items-start justify-between gap-1">
                  <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shrink-0
                    ${isToday ? "bg-primary text-primary-foreground" : isWeekend ? "text-muted-foreground" : ""}
                  `}>
                    {dia}
                  </span>
                  {feriado && (
                    <span className="text-[9px] font-bold text-purple-700 dark:text-purple-300 leading-tight text-right flex-1 line-clamp-2">
                      {feriado}
                    </span>
                  )}
                  <a
                    href={`/publicacoes/novo?client_id=${clientId}&data=${key}`}
                    className="opacity-0 group-hover/day:opacity-100 transition-opacity shrink-0 h-5 w-5 flex items-center justify-center rounded bg-primary/10 hover:bg-primary/20 text-primary"
                    title="Adicionar publicação"
                  >
                    <Plus className="h-3 w-3" />
                  </a>
                </div>

                {/* Posts */}
                <div className="flex flex-col gap-0.5">
                  {dayPosts.slice(0, 4).map((post) => (
                    <button
                      key={post.id}
                      onClick={() => openEdit(post)}
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded truncate leading-tight text-left hover:opacity-80 transition-opacity ${STATUS_COLORS[post.status] ?? "bg-gray-200 text-gray-700"}`}
                      title={post.titulo}
                    >
                      {post.titulo}
                    </button>
                  ))}
                  {dayPosts.length > 4 && (
                    <span className="text-[10px] text-muted-foreground px-1">+{dayPosts.length - 4} mais</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 px-5 py-3 border-t bg-muted/20">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={`h-3 w-3 rounded-sm ${STATUS_COLORS[status]}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-purple-200 dark:bg-purple-700 border border-purple-300" />
            <span className="text-xs text-muted-foreground">Feriado</span>
          </div>
        </div>
      </div>

      {/* Sheet de edição */}
      <Sheet open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
          <SheetHeader className="px-5 py-4 border-b shrink-0">
            <SheetTitle className="text-base font-semibold">Editar Publicação</SheetTitle>
            {editForm.status && (
              <div className="flex items-center gap-2 mt-1">
                <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[editForm.status]?.split(" ")[0] ?? "bg-gray-400"}`} />
                <span className="text-xs text-muted-foreground">{STATUS_LABELS[editForm.status] ?? editForm.status}</span>
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
