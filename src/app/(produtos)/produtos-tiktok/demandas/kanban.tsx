"use client"

import { useState, useCallback } from "react"
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  useDroppable, useDraggable, type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import {
  Plus, ChevronLeft, ChevronRight, Loader2,
  Circle, AlertCircle, ArrowUp, X, ClipboardList, Calendar, Briefcase,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Demanda } from "./page"

// ─── Config ──────────────────────────────────────────────────

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

const COLUMNS: { id: Demanda["status"]; label: string; color: string; bg: string; dot: string }[] = [
  { id: "a_fazer",        label: "A Fazer",         color: "text-gray-600",   bg: "bg-gray-100",   dot: "bg-gray-400" },
  { id: "em_andamento",   label: "Em Andamento",    color: "text-blue-600",   bg: "bg-blue-50",    dot: "bg-blue-500" },
  { id: "fazer_reuniao",  label: "Fazer Reunião",   color: "text-purple-600", bg: "bg-purple-50",  dot: "bg-purple-500" },
  { id: "reuniao_feita",  label: "Reunião Feita",   color: "text-orange-600", bg: "bg-orange-50",  dot: "bg-orange-500" },
  { id: "pagamento_feito",label: "Pagamento Feito", color: "text-green-700",  bg: "bg-green-50",   dot: "bg-green-500" },
]

const TIPO_CONFIG: Record<Demanda["tipo"], { label: string; color: string; Icon: React.ElementType }> = {
  tarefa:  { label: "Tarefa Operacional", color: "bg-gray-100 text-gray-600",    Icon: ClipboardList },
  agenda:  { label: "Agenda",             color: "bg-blue-100 text-blue-700",    Icon: Calendar },
  demanda: { label: "Demanda",            color: "bg-orange-100 text-orange-700", Icon: Briefcase },
}

const PRIORIDADE_CONFIG: Record<Demanda["prioridade"], { label: string; color: string; Icon: React.ElementType }> = {
  baixa: { label: "Baixa", color: "bg-gray-100 text-gray-500",    Icon: Circle },
  media: { label: "Média", color: "bg-yellow-100 text-yellow-700", Icon: AlertCircle },
  alta:  { label: "Alta",  color: "bg-red-100 text-red-600",      Icon: ArrowUp },
}

const CARD_BG: Record<Demanda["status"], string> = {
  a_fazer:         "#f3f4f6",
  em_andamento:    "#dbeafe",
  fazer_reuniao:   "#ede9fe",
  reuniao_feita:   "#fed7aa",
  pagamento_feito: "#dcfce7",
}

type FormState = {
  titulo: string
  descricao: string
  tipo: Demanda["tipo"]
  status: Demanda["status"]
  prioridade: Demanda["prioridade"]
  data_prazo: string
  hora_prazo: string
  valor: string
}

const EMPTY_FORM: FormState = {
  titulo: "", descricao: "", tipo: "tarefa", status: "a_fazer",
  prioridade: "media", data_prazo: "", hora_prazo: "", valor: "",
}

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

// ─── Card ─────────────────────────────────────────────────────

function DemandaCard({ demanda, onClick }: { demanda: Demanda; onClick: (d: Demanda) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: demanda.id })
  const tipo = TIPO_CONFIG[demanda.tipo]
  const prio = PRIORIDADE_CONFIG[demanda.prioridade]
  const PrioIcon = prio.Icon
  const TipoIcon = tipo.Icon

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), opacity: isDragging ? 0.2 : 1, touchAction: "none" }}
      className="cursor-grab active:cursor-grabbing"
      {...attributes} {...listeners}
    >
      <button type="button" onClick={() => onClick(demanda)}
        className="w-full text-left rounded-lg border bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
        {/* Tipo badge */}
        <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full mb-2 ${tipo.color}`}>
          <TipoIcon className="h-2.5 w-2.5" />
          {tipo.label}
        </div>
        <p className="text-sm font-semibold text-gray-800 leading-tight mb-2">{demanda.titulo}</p>
        {demanda.descricao && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{demanda.descricao}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${prio.color}`}>
            <PrioIcon className="h-2.5 w-2.5" />
            {prio.label}
          </span>
          {demanda.data_prazo && (
            <span className="text-[10px] text-muted-foreground">
              📅 {demanda.data_prazo.split("-").reverse().join("/")}
              {demanda.hora_prazo && ` ${demanda.hora_prazo.slice(0,5)}`}
            </span>
          )}
          {demanda.valor != null && demanda.valor > 0 && (
            <span className="text-[10px] font-semibold text-green-700 ml-auto">{fmt(demanda.valor)}</span>
          )}
        </div>
      </button>
    </div>
  )
}

// ─── Coluna ───────────────────────────────────────────────────

function KanbanColumn({ col, demandas, onCardClick, onAddClick }: {
  col: typeof COLUMNS[0]
  demandas: Demanda[]
  onCardClick: (d: Demanda) => void
  onAddClick: (status: Demanda["status"]) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  return (
    <div ref={setNodeRef} className={`flex flex-col rounded-xl border transition-all ${isOver ? "ring-2 ring-primary ring-offset-1" : ""}`}>
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl ${col.bg} border-b`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${col.dot}`} />
          <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
          <span className="text-[10px] font-semibold bg-white/60 px-1.5 py-0.5 rounded-full text-gray-500">{demandas.length}</span>
        </div>
        <button type="button" onClick={() => onAddClick(col.id)}
          className="p-1 rounded-md hover:bg-black/10 transition-colors" title="Nova demanda">
          <Plus className="h-3.5 w-3.5 text-gray-500" />
        </button>
      </div>
      <div className="flex flex-col gap-2 p-2 min-h-[180px]">
        {demandas.map(d => <DemandaCard key={d.id} demanda={d} onClick={onCardClick} />)}
        {demandas.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground py-6">Vazio</div>
        )}
      </div>
    </div>
  )
}

// ─── Calendário ───────────────────────────────────────────────

function CalendarioDemandas({ demandas, onDemandaClick, onNewDemanda }: {
  demandas: Demanda[]
  onDemandaClick: (d: Demanda) => void
  onNewDemanda: (date: string) => void
}) {
  const today = new Date()
  const [ano, setAno] = useState(today.getFullYear())
  const [mes, setMes] = useState(today.getMonth())

  function navMes(delta: number) {
    let nm = mes + delta, na = ano
    if (nm < 0) { nm = 11; na-- }
    if (nm > 11) { nm = 0; na++ }
    setMes(nm); setAno(na)
  }

  const primeiroDia = new Date(ano, mes, 1)
  const totalDias = new Date(ano, mes + 1, 0).getDate()
  let inicioCelula = primeiroDia.getDay() - 1
  if (inicioCelula < 0) inicioCelula = 6

  const byDate = new Map<string, Demanda[]>()
  demandas.forEach(d => {
    if (!d.data_prazo) return
    const key = d.data_prazo.slice(0, 10)
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key)!.push(d)
  })

  const celulas: (number | null)[] = [
    ...Array(inicioCelula).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ]
  while (celulas.length % 7 !== 0) celulas.push(null)

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
        <button onClick={() => navMes(-1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-base font-black capitalize">{MESES[mes]} {ano}</h2>
        <button onClick={() => navMes(1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7" style={{ background: "#1f2937" }}>
        {DIAS_SEMANA.map((d, i) => (
          <div key={d} className={`py-2.5 text-center text-xs font-bold text-white uppercase tracking-widest ${i < 6 ? "border-r border-gray-600" : ""}`}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 border-l border-b border-gray-200">
        {celulas.map((dia, idx) => {
          if (dia === null) return (
            <div key={`e-${idx}`} className="border-r border-t border-gray-200 min-h-[110px]" style={{ background: "#f9fafb" }} />
          )
          const key = `${ano}-${String(mes + 1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`
          const dayDemandas = byDate.get(key) ?? []
          const isToday = dia === today.getDate() && mes === today.getMonth() && ano === today.getFullYear()
          const colIdx = (inicioCelula + dia - 1) % 7
          const isWeekend = colIdx === 5 || colIdx === 6

          return (
            <div key={key} className="group border-r border-t border-gray-200 flex flex-col"
              style={{ background: isWeekend ? "#f9fafb" : "#ffffff" }}>
              <div className="flex items-center gap-1 px-1.5 py-1" style={{ background: isWeekend ? "#f1f5f9" : "#ffffff" }}>
                <span className={`text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full shrink-0 ${isToday ? "bg-primary text-primary-foreground" : "text-gray-400"}`}>
                  {dia}
                </span>
                <button type="button" onClick={() => onNewDemanda(key)} title="Nova demanda"
                  className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-gray-400 hover:text-gray-600">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <div className="flex flex-col gap-0.5 p-1 flex-1 min-h-[90px]">
                {dayDemandas.map(d => {
                  const tipo = TIPO_CONFIG[d.tipo]
                  const TipoIcon = tipo.Icon
                  return (
                    <button key={d.id} type="button" onClick={() => onDemandaClick(d)}
                      className="text-left w-full rounded p-1 hover:opacity-75 transition-opacity"
                      style={{ background: CARD_BG[d.status] }} title={d.titulo}>
                      <div className="flex items-center gap-0.5 mb-0.5">
                        <TipoIcon className="h-2 w-2 text-gray-500 shrink-0" />
                        {d.hora_prazo && <span className="text-[9px] text-gray-500">{d.hora_prazo.slice(0,5)}</span>}
                      </div>
                      <p className="text-[10px] leading-snug line-clamp-2 text-gray-700">{d.titulo}</p>
                      {d.valor != null && d.valor > 0 && (
                        <p className="text-[9px] font-semibold text-green-700 mt-0.5">{fmt(d.valor)}</p>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legenda tipos */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 px-5 py-3 border-t border-gray-200 bg-gray-50">
        {Object.entries(TIPO_CONFIG).map(([key, t]) => {
          const Icon = t.Icon
          return (
            <div key={key} className="flex items-center gap-1.5">
              <Icon className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-muted-foreground">{t.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Board principal ──────────────────────────────────────────

export function KanbanBoard({ initialDemandas }: { initialDemandas: Demanda[] }) {
  const [demandas, setDemandas] = useState(initialDemandas)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Demanda | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const setField = useCallback(<K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm(prev => ({ ...prev, [k]: v }))
  }, [])

  function openNew(status: Demanda["status"] = "a_fazer", date?: string) {
    setEditing(null)
    setForm({ ...EMPTY_FORM, status, data_prazo: date ?? "" })
    setSheetOpen(true)
  }

  function openEdit(demanda: Demanda) {
    setEditing(demanda)
    setForm({
      titulo: demanda.titulo,
      descricao: demanda.descricao ?? "",
      tipo: demanda.tipo,
      status: demanda.status,
      prioridade: demanda.prioridade,
      data_prazo: demanda.data_prazo ?? "",
      hora_prazo: demanda.hora_prazo ?? "",
      valor: demanda.valor != null ? String(demanda.valor) : "",
    })
    setSheetOpen(true)
  }

  async function handleSave() {
    if (!form.titulo.trim()) { toast.error("Título obrigatório"); return }
    setSaving(true)
    const supabase = createClient()
    const payload = {
      titulo: form.titulo,
      descricao: form.descricao || null,
      tipo: form.tipo,
      status: form.status,
      prioridade: form.prioridade,
      data_prazo: form.data_prazo || null,
      hora_prazo: form.hora_prazo || null,
      valor: form.valor ? Number(form.valor.replace(",", ".")) : null,
      updated_at: new Date().toISOString(),
    }

    if (editing) {
      const { error } = await supabase.from("demandas").update(payload).eq("id", editing.id)
      if (error) { toast.error("Erro ao salvar"); setSaving(false); return }
      toast.success("Demanda atualizada!")
      setDemandas(prev => prev.map(d => d.id === editing.id
        ? { ...d, ...payload, data_prazo: payload.data_prazo, hora_prazo: payload.hora_prazo } : d))
    } else {
      const { data, error } = await supabase.from("demandas").insert(payload).select().single()
      if (error || !data) { toast.error("Erro ao criar"); setSaving(false); return }
      toast.success("Demanda criada!")
      setDemandas(prev => [data as Demanda, ...prev])
    }
    setSheetOpen(false)
    setSaving(false)
  }

  async function handleDelete() {
    if (!editing || !confirm("Remover esta demanda?")) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from("demandas").delete().eq("id", editing.id)
    if (error) { toast.error("Erro ao remover"); setSaving(false); return }
    toast.success("Demanda removida!")
    setDemandas(prev => prev.filter(d => d.id !== editing.id))
    setSheetOpen(false)
    setSaving(false)
  }

  function handleDragStart(e: DragStartEvent) { setActiveId(e.active.id as string) }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    if (!e.over) return
    const id = e.active.id as string
    const newStatus = e.over.id as Demanda["status"]
    const demanda = demandas.find(d => d.id === id)
    if (!demanda || demanda.status === newStatus) return
    setDemandas(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d))
    const supabase = createClient()
    const { error } = await supabase.from("demandas").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", id)
    if (error) {
      toast.error("Erro ao mover")
      setDemandas(prev => prev.map(d => d.id === id ? { ...d, status: demanda.status } : d))
    }
  }

  const activeDemanda = activeId ? demandas.find(d => d.id === activeId) : null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Demandas</h1>
          <p className="text-sm text-muted-foreground">Tarefas, agendas e assessorias</p>
        </div>
        <Button onClick={() => openNew()} size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Nova
        </Button>
      </div>

      {/* Kanban */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {COLUMNS.map(col => (
            <KanbanColumn key={col.id} col={col}
              demandas={demandas.filter(d => d.status === col.id)}
              onCardClick={openEdit} onAddClick={openNew} />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeDemanda ? (
            <div className="rounded-lg border bg-white p-3 shadow-xl rotate-1 w-56 opacity-95">
              <p className="text-sm font-semibold text-gray-800">{activeDemanda.titulo}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Calendário */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Calendário</h2>
        <CalendarioDemandas
          demandas={demandas.filter(d => d.data_prazo)}
          onDemandaClick={openEdit}
          onNewDemanda={(date) => openNew("a_fazer", date)}
        />
      </div>

      {/* Sheet */}
      <Sheet open={sheetOpen} onOpenChange={open => { if (!open) { setSheetOpen(false); setEditing(null) } }}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="px-5 py-4 border-b shrink-0 flex flex-row items-center justify-between">
            <SheetTitle className="text-base font-semibold">
              {editing ? "Editar" : "Nova"} Demanda
            </SheetTitle>
            <button type="button" onClick={() => setSheetOpen(false)} className="p-1 rounded hover:bg-muted">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {/* Tipo */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(TIPO_CONFIG) as [Demanda["tipo"], typeof TIPO_CONFIG[Demanda["tipo"]]][]).map(([key, t]) => {
                  const Icon = t.Icon
                  return (
                    <button key={key} type="button" onClick={() => setField("tipo", key)}
                      className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border-2 text-xs font-semibold transition-all ${form.tipo === key ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground hover:border-muted-foreground/30"}`}>
                      <Icon className="h-4 w-4" />
                      <span className="text-center leading-tight">{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Título */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Título *</Label>
              <Input value={form.titulo} onChange={e => setField("titulo", e.target.value)}
                placeholder="Ex: Assessoria cliente João" autoFocus />
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Descrição</Label>
              <Textarea value={form.descricao} onChange={e => setField("descricao", e.target.value)}
                rows={3} className="resize-none" placeholder="Detalhes..." />
            </div>

            {/* Status + Prioridade */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</Label>
                <Select value={form.status} onValueChange={v => v && setField("status", v as Demanda["status"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLUMNS.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prioridade</Label>
                <Select value={form.prioridade} onValueChange={v => v && setField("prioridade", v as Demanda["prioridade"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Data + Hora */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data</Label>
                <Input type="date" value={form.data_prazo} onChange={e => setField("data_prazo", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hora</Label>
                <Input type="time" value={form.hora_prazo} onChange={e => setField("hora_prazo", e.target.value)} />
              </div>
            </div>

            {/* Valor */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.valor}
                onChange={e => setField("valor", e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          <SheetFooter className="px-5 py-4 border-t shrink-0 flex-row gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : editing ? "Salvar" : "Criar"}
            </Button>
            {editing && (
              <Button variant="outline" size="sm" onClick={handleDelete} disabled={saving}
                className="text-destructive hover:text-destructive border-destructive/30">
                Remover
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
