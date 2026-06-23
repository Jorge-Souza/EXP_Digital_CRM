"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  useDroppable, useDraggable, type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core"
import { Plus, Loader2, X, Instagram } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { LeadPipeline } from "./page"

const COLUMNS: { id: string; label: string; color: string; bg: string; dot: string }[] = [
  { id: "novo_lead",          label: "Novo Lead",          color: "text-gray-600",   bg: "bg-gray-100",   dot: "bg-gray-400" },
  { id: "engajou_instagram",  label: "Engajou Instagram",  color: "text-pink-600",   bg: "bg-pink-50",    dot: "bg-pink-500" },
  { id: "capturado_whatsapp", label: "Capturado WhatsApp", color: "text-green-600",  bg: "bg-green-50",   dot: "bg-green-500" },
  { id: "diagnostico_feito",  label: "Diagnóstico Feito",  color: "text-blue-600",   bg: "bg-blue-50",    dot: "bg-blue-500" },
  { id: "oferta_curso",       label: "Oferta Curso",       color: "text-purple-600", bg: "bg-purple-50",  dot: "bg-purple-500" },
  { id: "oferta_sos",         label: "Oferta SOS",         color: "text-purple-600", bg: "bg-purple-50",  dot: "bg-purple-500" },
  { id: "oferta_mentoria",    label: "Oferta Mentoria",    color: "text-purple-600", bg: "bg-purple-50",  dot: "bg-purple-500" },
  { id: "oferta_assessoria",  label: "Oferta Assessoria",  color: "text-purple-600", bg: "bg-purple-50",  dot: "bg-purple-500" },
  { id: "venda",              label: "Venda",              color: "text-emerald-700",bg: "bg-emerald-50", dot: "bg-emerald-500" },
  { id: "nutricao",           label: "Nutrição",           color: "text-orange-600", bg: "bg-orange-50",  dot: "bg-orange-500" },
  { id: "perdido",            label: "Perdido",            color: "text-red-600",    bg: "bg-red-50",     dot: "bg-red-500" },
]

const TIPO_LEAD_LABEL: Record<string, string> = {
  lead_instagram: "Lead Instagram",
  carrinho_abandonado: "Carrinho Abandonado",
  aluno_gratuito: "Aluno Gratuito",
  comprador_curso: "Comprador Curso",
  comprador_sos: "Comprador SOS",
  interessado_mentoria: "Interessado Mentoria",
  interessado_assessoria: "Interessado Assessoria",
}

type FormState = { nome: string; instagram: string; telefone: string; email: string }
const EMPTY_FORM: FormState = { nome: "", instagram: "", telefone: "", email: "" }

function LeadCard({ lead, onClick }: { lead: LeadPipeline; onClick: (l: LeadPipeline) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id })

  return (
    <div
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0.2 : 1, touchAction: "none" }}
      className="cursor-grab active:cursor-grabbing"
      {...attributes} {...listeners}
    >
      <button type="button" onClick={() => onClick(lead)}
        className="w-full text-left rounded-lg border bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-sm font-semibold text-gray-800 leading-tight mb-1">{lead.nome}</p>
        {lead.tipo_lead && (
          <p className="text-[10px] text-muted-foreground mb-1.5">{TIPO_LEAD_LABEL[lead.tipo_lead] ?? lead.tipo_lead}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
            🔥 {lead.score_comercial} pts
          </span>
          {lead.profiles?.nome && (
            <span className="text-[10px] text-muted-foreground ml-auto">👤 {lead.profiles.nome}</span>
          )}
        </div>
        {lead.proxima_melhor_oferta && (
          <p className="text-[10px] font-semibold text-orange-600 mt-1">→ {lead.proxima_melhor_oferta}</p>
        )}
      </button>
    </div>
  )
}

function LeadColumn({ col, leads, onCardClick }: {
  col: typeof COLUMNS[0]
  leads: LeadPipeline[]
  onCardClick: (l: LeadPipeline) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  return (
    <div ref={setNodeRef} className={`flex flex-col rounded-xl border transition-all ${isOver ? "ring-2 ring-primary ring-offset-1" : ""}`}>
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl ${col.bg} border-b`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${col.dot}`} />
          <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
          <span className="text-[10px] font-semibold bg-white/60 px-1.5 py-0.5 rounded-full text-gray-500">{leads.length}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-2 min-h-[160px] min-w-[220px]">
        {leads.map(l => <LeadCard key={l.id} lead={l} onClick={onCardClick} />)}
        {leads.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground py-6">Vazio</div>
        )}
      </div>
    </div>
  )
}

export function PipelineKanban({ initialLeads }: { initialLeads: LeadPipeline[] }) {
  const router = useRouter()
  const [leads, setLeads] = useState(initialLeads)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function openLead(lead: LeadPipeline) {
    router.push(`/produtos-tiktok/alunos/${lead.id}`)
  }

  async function handleCreate() {
    if (!form.nome.trim()) { toast.error("Nome obrigatório"); return }
    if (!form.email.trim() && !form.instagram.trim() && !form.telefone.trim()) {
      toast.error("Informe ao menos email, Instagram ou telefone")
      return
    }
    setSaving(true)
    const supabase = createClient()
    const payload = {
      nome: form.nome,
      instagram: form.instagram || null,
      telefone: form.telefone || null,
      email: form.email || `${form.instagram || form.telefone}@sem-email.exp`,
      origem: "instagram",
      tipo_lead: "lead_instagram",
      etapa_pipeline: "novo_lead",
    }
    const { data, error } = await supabase.from("alunos").insert(payload).select().single()
    if (error || !data) { toast.error("Erro ao criar lead"); setSaving(false); return }
    toast.success("Lead criado!")
    setLeads(prev => [data as LeadPipeline, ...prev])
    setForm(EMPTY_FORM)
    setSaving(false)
    setSheetOpen(false)
  }

  function handleDragStart(e: DragStartEvent) { setActiveId(e.active.id as string) }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    if (!e.over) return
    const id = e.active.id as string
    const newEtapa = e.over.id as string
    const lead = leads.find(l => l.id === id)
    if (!lead || lead.etapa_pipeline === newEtapa) return
    setLeads(prev => prev.map(l => l.id === id ? { ...l, etapa_pipeline: newEtapa } : l))
    const supabase = createClient()
    const { error } = await supabase.from("alunos").update({ etapa_pipeline: newEtapa, updated_at: new Date().toISOString() }).eq("id", id)
    if (error) {
      toast.error("Erro ao mover")
      setLeads(prev => prev.map(l => l.id === id ? { ...l, etapa_pipeline: lead.etapa_pipeline } : l))
    }
  }

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pipeline Comercial</h1>
          <p className="text-sm text-muted-foreground">Funil de ascensão: lead → curso → SOS → mentoria → assessoria</p>
        </div>
        <Button onClick={() => setSheetOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Novo Lead
        </Button>
      </div>

      {/* Kanban */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <div key={col.id} className="shrink-0 w-[240px]">
              <LeadColumn col={col}
                leads={leads.filter(l => l.etapa_pipeline === col.id)}
                onCardClick={openLead} />
            </div>
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeLead ? (
            <div className="rounded-lg border bg-white p-3 shadow-xl rotate-1 w-56 opacity-95">
              <p className="text-sm font-semibold text-gray-800">{activeLead.nome}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Sheet: novo lead manual (Instagram MVP) */}
      <Sheet open={sheetOpen} onOpenChange={open => { if (!open) setSheetOpen(false) }}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="px-5 py-4 border-b shrink-0 flex flex-row items-center justify-between">
            <SheetTitle className="text-base font-semibold flex items-center gap-2">
              <Instagram className="h-4 w-4" /> Novo Lead
            </SheetTitle>
            <button type="button" onClick={() => setSheetOpen(false)} className="p-1 rounded hover:bg-muted">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome *</Label>
              <Input value={form.nome} onChange={e => setField("nome", e.target.value)} placeholder="Nome completo" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Instagram</Label>
              <Input value={form.instagram} onChange={e => setField("instagram", e.target.value)} placeholder="@usuario" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Telefone / WhatsApp</Label>
              <Input value={form.telefone} onChange={e => setField("telefone", e.target.value)} placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</Label>
              <Input type="email" value={form.email} onChange={e => setField("email", e.target.value)} placeholder="opcional" />
            </div>

            <Button onClick={handleCreate} disabled={saving} className="w-full">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando...</> : "Criar Lead"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
