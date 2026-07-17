"use client"

import { useState, useMemo } from "react"
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  useDroppable, useDraggable, type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core"
import {
  ChevronLeft, ChevronRight, Loader2, X, Phone, Mail, Package, Send, Download,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { CarrinhoAbandonado, Interacao } from "./page"

// ─── Config ──────────────────────────────────────────────────

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

const COLUMNS: { id: CarrinhoAbandonado["status"]; label: string; color: string; bg: string; dot: string }[] = [
  { id: "novo",       label: "Novo",        color: "text-gray-600",   bg: "bg-gray-100",   dot: "bg-gray-400" },
  { id: "em_contato", label: "Em Contato",  color: "text-blue-600",   bg: "bg-blue-50",    dot: "bg-blue-500" },
  { id: "recuperado", label: "Recuperado",  color: "text-green-700",  bg: "bg-green-50",   dot: "bg-green-500" },
  { id: "perdido",    label: "Perdido",     color: "text-red-600",    bg: "bg-red-50",     dot: "bg-red-500" },
]

const CANAL_LABEL: Record<NonNullable<Interacao["canal"]>, string> = {
  whatsapp: "WhatsApp",
  ligacao: "Ligação",
  dm_instagram: "DM Instagram",
  email: "E-mail",
}

const CARD_BG: Record<CarrinhoAbandonado["status"], string> = {
  novo: "#f3f4f6",
  em_contato: "#dbeafe",
  recuperado: "#dcfce7",
  perdido: "#fee2e2",
}

function csvEscape(value: string) {
  if (/[",\n;]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function exportarCsv(carrinhos: CarrinhoAbandonado[]) {
  const header = ["Nome", "Email", "Telefone", "Produto", "Data Abandono", "Status", "Próximo Follow-up", "Responsável", "Observações"]
  const linhas = carrinhos.map(c => [
    c.alunos?.nome ?? "",
    c.alunos?.email ?? "",
    c.alunos?.telefone ?? "",
    c.produtos_tiktok?.nome ?? "",
    c.data_abandono.slice(0, 10).split("-").reverse().join("/"),
    COLUMNS.find(col => col.id === c.status)?.label ?? c.status,
    c.proximo_followup ? c.proximo_followup.split("-").reverse().join("/") : "",
    c.responsavel ?? "",
    c.observacoes ?? "",
  ])
  const csv = [header, ...linhas].map(linha => linha.map(v => csvEscape(String(v))).join(";")).join("\n")
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `carrinhos-abandonados-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function whatsappUrl(phone: string) {
  const digits = phone.replace(/\D/g, "")
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`
  return `https://wa.me/${withCountry}`
}

function diasDesde(dataISO: string) {
  const dias = Math.floor((Date.now() - new Date(dataISO).getTime()) / 86400000)
  if (dias <= 0) return "hoje"
  if (dias === 1) return "1 dia"
  return `${dias} dias`
}

// ─── Card ─────────────────────────────────────────────────────

function CarrinhoCard({ carrinho, onClick }: { carrinho: CarrinhoAbandonado; onClick: (c: CarrinhoAbandonado) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: carrinho.id })

  return (
    <div
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0.2 : 1, touchAction: "none" }}
      className="cursor-grab active:cursor-grabbing"
      {...attributes} {...listeners}
    >
      <button type="button" onClick={() => onClick(carrinho)}
        className="w-full text-left rounded-lg border bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-sm font-semibold text-gray-800 leading-tight mb-1">{carrinho.alunos?.nome ?? "Sem nome"}</p>
        {carrinho.produtos_tiktok?.nome && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
            <Package className="h-3 w-3" /> {carrinho.produtos_tiktok.nome}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-muted-foreground">⏱ abandonado há {diasDesde(carrinho.data_abandono)}</span>
          {carrinho.proximo_followup && (
            <span className="text-[10px] font-semibold text-blue-600 ml-auto">
              📅 {carrinho.proximo_followup.split("-").reverse().join("/")}
            </span>
          )}
        </div>
        {carrinho.responsavel && (
          <p className="text-[10px] text-muted-foreground mt-1">👤 {carrinho.responsavel}</p>
        )}
      </button>
    </div>
  )
}

// ─── Coluna ───────────────────────────────────────────────────

function CarrinhoColumn({ col, carrinhos, onCardClick }: {
  col: typeof COLUMNS[0]
  carrinhos: CarrinhoAbandonado[]
  onCardClick: (c: CarrinhoAbandonado) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  return (
    <div ref={setNodeRef} className={`flex flex-col rounded-xl border transition-all ${isOver ? "ring-2 ring-primary ring-offset-1" : ""}`}>
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl ${col.bg} border-b`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${col.dot}`} />
          <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
          <span className="text-[10px] font-semibold bg-white/60 px-1.5 py-0.5 rounded-full text-gray-500">{carrinhos.length}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-2 min-h-[180px]">
        {carrinhos.map(c => <CarrinhoCard key={c.id} carrinho={c} onClick={onCardClick} />)}
        {carrinhos.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground py-6">Vazio</div>
        )}
      </div>
    </div>
  )
}

// ─── Calendário ───────────────────────────────────────────────

function CalendarioFollowup({ carrinhos, onCarrinhoClick }: {
  carrinhos: CarrinhoAbandonado[]
  onCarrinhoClick: (c: CarrinhoAbandonado) => void
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

  const byDate = new Map<string, CarrinhoAbandonado[]>()
  carrinhos.forEach(c => {
    if (!c.proximo_followup) return
    const key = c.proximo_followup.slice(0, 10)
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key)!.push(c)
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
            <div key={`e-${idx}`} className="border-r border-t border-gray-200 min-h-[100px]" style={{ background: "#f9fafb" }} />
          )
          const key = `${ano}-${String(mes + 1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`
          const dayCarrinhos = byDate.get(key) ?? []
          const isToday = dia === today.getDate() && mes === today.getMonth() && ano === today.getFullYear()
          const colIdx = (inicioCelula + dia - 1) % 7
          const isWeekend = colIdx === 5 || colIdx === 6

          return (
            <div key={key} className="border-r border-t border-gray-200 flex flex-col"
              style={{ background: isWeekend ? "#f9fafb" : "#ffffff" }}>
              <div className="flex items-center gap-1 px-1.5 py-1" style={{ background: isWeekend ? "#f1f5f9" : "#ffffff" }}>
                <span className={`text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full shrink-0 ${isToday ? "bg-primary text-primary-foreground" : "text-gray-400"}`}>
                  {dia}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 p-1 flex-1 min-h-[80px]">
                {dayCarrinhos.map(c => (
                  <button key={c.id} type="button" onClick={() => onCarrinhoClick(c)}
                    className="text-left w-full rounded p-1 hover:opacity-75 transition-opacity"
                    style={{ background: CARD_BG[c.status] }} title={c.alunos?.nome ?? ""}>
                    <p className="text-[10px] leading-snug line-clamp-2 text-gray-700">{c.alunos?.nome ?? "Sem nome"}</p>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Tabela ───────────────────────────────────────────────────

function TabelaCarrinhos({ carrinhos, onCarrinhoClick }: {
  carrinhos: CarrinhoAbandonado[]
  onCarrinhoClick: (c: CarrinhoAbandonado) => void
}) {
  const ordenados = useMemo(
    () => [...carrinhos].sort((a, b) => new Date(b.data_abandono).getTime() - new Date(a.data_abandono).getTime()),
    [carrinhos]
  )

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/30 border-b">
          <tr>
            <th className="text-left px-4 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Nome</th>
            <th className="text-left px-4 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Produto</th>
            <th className="text-left px-4 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Abandono</th>
            <th className="text-left px-4 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Status</th>
            <th className="text-left px-4 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Próximo Follow-up</th>
            <th className="text-left px-4 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Responsável</th>
          </tr>
        </thead>
        <tbody>
          {ordenados.map(c => {
            const col = COLUMNS.find(col => col.id === c.status)!
            return (
              <tr key={c.id} onClick={() => onCarrinhoClick(c)}
                className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors">
                <td className="px-4 py-2.5 font-medium">{c.alunos?.nome ?? "Sem nome"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{c.produtos_tiktok?.nome ?? "—"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{c.data_abandono.slice(0, 10).split("-").reverse().join("/")}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${col.bg} ${col.color}`}>{col.label}</span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {c.proximo_followup ? c.proximo_followup.split("-").reverse().join("/") : "—"}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{c.responsavel ?? "—"}</td>
              </tr>
            )
          })}
          {ordenados.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum carrinho abandonado</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ─── Board principal ──────────────────────────────────────────

export function CarrinhosBoard({ initialCarrinhos, initialInteracoes }: {
  initialCarrinhos: CarrinhoAbandonado[]
  initialInteracoes: Interacao[]
}) {
  const [carrinhos, setCarrinhos] = useState(initialCarrinhos)
  const [interacoes, setInteracoes] = useState(initialInteracoes)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<CarrinhoAbandonado | null>(null)
  const [saving, setSaving] = useState(false)

  const [status, setStatus] = useState<CarrinhoAbandonado["status"]>("novo")
  const [proximoFollowup, setProximoFollowup] = useState("")
  const [responsavel, setResponsavel] = useState("")
  const [observacoes, setObservacoes] = useState("")

  const [novoCanal, setNovoCanal] = useState<Interacao["canal"]>("whatsapp")
  const [novoResumo, setNovoResumo] = useState("")
  const [novoProximoPasso, setNovoProximoPasso] = useState("")
  const [savingInteracao, setSavingInteracao] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function openEdit(carrinho: CarrinhoAbandonado) {
    setEditing(carrinho)
    setStatus(carrinho.status)
    setProximoFollowup(carrinho.proximo_followup ?? "")
    setResponsavel(carrinho.responsavel ?? "")
    setObservacoes(carrinho.observacoes ?? "")
    setNovoCanal("whatsapp")
    setNovoResumo("")
    setNovoProximoPasso("")
    setSheetOpen(true)
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    const supabase = createClient()
    const payload = {
      status,
      proximo_followup: proximoFollowup || null,
      responsavel: responsavel || null,
      observacoes: observacoes || null,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from("carrinhos_abandonados").update(payload).eq("id", editing.id)
    if (error) { toast.error("Erro ao salvar"); setSaving(false); return }
    toast.success("Carrinho atualizado!")
    setCarrinhos(prev => prev.map(c => c.id === editing.id ? { ...c, ...payload } : c))
    setSaving(false)
    setSheetOpen(false)
  }

  async function handleAddInteracao() {
    if (!editing) return
    if (!novoResumo.trim()) { toast.error("Resumo obrigatório"); return }
    setSavingInteracao(true)
    const supabase = createClient()
    const payload = {
      carrinho_id: editing.id,
      canal: novoCanal,
      resumo: novoResumo,
      proximo_passo: novoProximoPasso || null,
    }
    const { data, error } = await supabase.from("interacoes_carrinho").insert(payload).select().single()
    if (error || !data) { toast.error("Erro ao registrar interação"); setSavingInteracao(false); return }
    toast.success("Interação registrada!")
    setInteracoes(prev => [data as Interacao, ...prev])
    setNovoResumo("")
    setNovoProximoPasso("")
    setSavingInteracao(false)
  }

  function handleDragStart(e: DragStartEvent) { setActiveId(e.active.id as string) }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    if (!e.over) return
    const id = e.active.id as string
    const newStatus = e.over.id as CarrinhoAbandonado["status"]
    const carrinho = carrinhos.find(c => c.id === id)
    if (!carrinho || carrinho.status === newStatus) return
    setCarrinhos(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    const supabase = createClient()
    const { error } = await supabase.from("carrinhos_abandonados").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", id)
    if (error) {
      toast.error("Erro ao mover")
      setCarrinhos(prev => prev.map(c => c.id === id ? { ...c, status: carrinho.status } : c))
    }
  }

  const activeCarrinho = activeId ? carrinhos.find(c => c.id === activeId) : null
  const interacoesDoCarrinho = editing ? interacoes.filter(i => i.carrinho_id === editing.id) : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Carrinhos Abandonados</h1>
          <p className="text-sm text-muted-foreground">Funil de recuperação alimentado automaticamente pela Kiwify</p>
        </div>
        <Button onClick={() => exportarCsv(carrinhos)} size="sm" variant="outline">
          <Download className="h-4 w-4 mr-1.5" /> Exportar CSV
        </Button>
      </div>

      {/* Views */}
      <Tabs defaultValue="kanban">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="kanban">🗂️ Kanban</TabsTrigger>
          <TabsTrigger value="lista">📋 Lista de Leads</TabsTrigger>
          <TabsTrigger value="calendario">📅 Calendário de Follow-up</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-4">
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {COLUMNS.map(col => (
                <CarrinhoColumn key={col.id} col={col}
                  carrinhos={carrinhos.filter(c => c.status === col.id)}
                  onCardClick={openEdit} />
              ))}
            </div>
            <DragOverlay dropAnimation={null}>
              {activeCarrinho ? (
                <div className="rounded-lg border bg-white p-3 shadow-xl rotate-1 w-56 opacity-95">
                  <p className="text-sm font-semibold text-gray-800">{activeCarrinho.alunos?.nome ?? "Sem nome"}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </TabsContent>

        <TabsContent value="lista" className="mt-4">
          <TabelaCarrinhos carrinhos={carrinhos} onCarrinhoClick={openEdit} />
        </TabsContent>

        <TabsContent value="calendario" className="mt-4">
          <CalendarioFollowup carrinhos={carrinhos.filter(c => c.proximo_followup)} onCarrinhoClick={openEdit} />
        </TabsContent>
      </Tabs>

      {/* Sheet */}
      <Sheet open={sheetOpen} onOpenChange={open => { if (!open) { setSheetOpen(false); setEditing(null) } }}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="px-5 py-4 border-b shrink-0 flex flex-row items-center justify-between">
            <SheetTitle className="text-base font-semibold">{editing?.alunos?.nome ?? "Carrinho"}</SheetTitle>
            <button type="button" onClick={() => setSheetOpen(false)} className="p-1 rounded hover:bg-muted">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {/* Dados do lead (somente leitura) */}
            <div className="rounded-lg border bg-muted/20 p-3 space-y-1.5">
              {editing?.alunos?.email && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" /> {editing.alunos.email}</p>
              )}
              {editing?.alunos?.telefone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone className="h-3 w-3" /> {editing.alunos.telefone}</p>
              )}
              {editing?.produtos_tiktok?.nome && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Package className="h-3 w-3" /> {editing.produtos_tiktok.nome}</p>
              )}
              {editing?.alunos?.telefone && (
                <a
                  href={whatsappUrl(editing.alunos.telefone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-500/15 text-green-600 border border-green-500/30 hover:bg-green-500/25 transition-colors mt-1"
                >
                  💬 Falar no WhatsApp
                </a>
              )}
            </div>

            {/* Status + Próximo follow-up */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</Label>
                <Select value={status} onValueChange={v => v && setStatus(v as CarrinhoAbandonado["status"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLUMNS.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Próximo Follow-up</Label>
                <Input type="date" value={proximoFollowup} onChange={e => setProximoFollowup(e.target.value)} />
              </div>
            </div>

            {/* Responsável */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Responsável</Label>
              <Input value={responsavel} onChange={e => setResponsavel(e.target.value)} placeholder="Quem está cuidando deste lead" />
            </div>

            {/* Observações */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Observações</Label>
              <Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={3} className="resize-none" placeholder="Contexto da conversa..." />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Salvar"}
            </Button>

            {/* Interações */}
            <div className="border-t pt-4 space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Interações</Label>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {interacoesDoCarrinho.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhuma interação registrada ainda.</p>
                )}
                {interacoesDoCarrinho.map(i => (
                  <div key={i.id} className="rounded-lg border bg-white p-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">{i.canal ? CANAL_LABEL[i.canal] : "—"}</span>
                      <span className="text-muted-foreground">{new Date(i.data).toLocaleDateString("pt-BR")}</span>
                    </div>
                    {i.resumo && <p className="text-muted-foreground">{i.resumo}</p>}
                    {i.proximo_passo && <p className="text-blue-600">Próximo passo: {i.proximo_passo}</p>}
                  </div>
                ))}
              </div>

              <div className="space-y-2 rounded-lg border p-3 bg-muted/10">
                <Select value={novoCanal ?? undefined} onValueChange={v => v && setNovoCanal(v as Interacao["canal"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CANAL_LABEL).map(([k, label]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Textarea value={novoResumo} onChange={e => setNovoResumo(e.target.value)} rows={2} className="resize-none" placeholder="O que foi conversado..." />
                <Input value={novoProximoPasso} onChange={e => setNovoProximoPasso(e.target.value)} placeholder="Próximo passo (opcional)" />
                <Button onClick={handleAddInteracao} disabled={savingInteracao} size="sm" variant="outline" className="w-full">
                  {savingInteracao ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
                  Registrar Interação
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
