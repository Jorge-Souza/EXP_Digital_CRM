"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles, Target, Plus, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { InteracaoComercial, TarefaSdr } from "@/lib/types"

const ETAPAS = [
  { id: "novo_lead", label: "Novo Lead" },
  { id: "engajou_instagram", label: "Engajou Instagram" },
  { id: "capturado_whatsapp", label: "Capturado WhatsApp" },
  { id: "diagnostico_feito", label: "Diagnóstico Feito" },
  { id: "oferta_curso", label: "Oferta Curso" },
  { id: "oferta_sos", label: "Oferta SOS" },
  { id: "oferta_mentoria", label: "Oferta Mentoria" },
  { id: "oferta_assessoria", label: "Oferta Assessoria" },
  { id: "venda", label: "Venda" },
  { id: "nutricao", label: "Nutrição" },
  { id: "perdido", label: "Perdido" },
]

const TIPOS_INTERACAO: Record<string, string> = {
  comentario_instagram: "Comentário Instagram",
  direct_instagram: "Direct Instagram",
  whatsapp: "WhatsApp",
  ligacao: "Ligação",
  reuniao: "Reunião",
  compra: "Compra",
  carrinho_abandonado: "Carrinho Abandonado",
}

function sugerirOferta(tipoLead: string | null): string {
  if (tipoLead === "comprador_curso") return "Oferecer SOS TikTok Shop"
  if (tipoLead === "comprador_sos") return "Oferecer Mentoria"
  if (tipoLead === "interessado_mentoria") return "Oferecer Assessoria"
  if (tipoLead === "interessado_assessoria") return "Manter relacionamento de Assessoria"
  return "Oferecer Curso de entrada"
}

interface Props {
  alunoId: string
  etapaPipeline: string
  tipoLead: string | null
  scoreComercial: number
  proximaMelhorOferta: string | null
  responsavelId: string | null
  responsaveis: { id: string; nome: string }[]
  interacoes: InteracaoComercial[]
  tarefas: TarefaSdr[]
}

export function LeadPipelinePainel({
  alunoId, etapaPipeline, tipoLead, scoreComercial, proximaMelhorOferta,
  responsavelId, responsaveis, interacoes, tarefas,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [savingEtapa, setSavingEtapa] = useState(false)
  const [savingResp, setSavingResp] = useState(false)
  const [savingOferta, setSavingOferta] = useState(false)

  const [tipoInteracao, setTipoInteracao] = useState("whatsapp")
  const [resumoInteracao, setResumoInteracao] = useState("")
  const [proximoPassoInteracao, setProximoPassoInteracao] = useState("")
  const [savingInteracao, setSavingInteracao] = useState(false)

  const [tituloTarefa, setTituloTarefa] = useState("")
  const [dataPrazoTarefa, setDataPrazoTarefa] = useState("")
  const [savingTarefa, setSavingTarefa] = useState(false)

  async function handleEtapaChange(novaEtapa: string) {
    setSavingEtapa(true)
    const { error } = await supabase.from("alunos").update({ etapa_pipeline: novaEtapa, updated_at: new Date().toISOString() }).eq("id", alunoId)
    setSavingEtapa(false)
    if (error) { toast.error("Erro ao mover etapa"); return }
    toast.success("Etapa atualizada")
    router.refresh()
  }

  async function handleResponsavelChange(novoId: string) {
    setSavingResp(true)
    const { error } = await supabase.from("alunos").update({ responsavel_id: novoId === "nenhum" ? null : novoId }).eq("id", alunoId)
    setSavingResp(false)
    if (error) { toast.error("Erro ao definir responsável"); return }
    toast.success("Responsável atualizado")
    router.refresh()
  }

  async function handleSugerirOferta() {
    setSavingOferta(true)
    const sugestao = sugerirOferta(tipoLead)
    const { error } = await supabase.from("alunos").update({ proxima_melhor_oferta: sugestao }).eq("id", alunoId)
    setSavingOferta(false)
    if (error) { toast.error("Erro ao sugerir oferta"); return }
    toast.success("Próxima oferta sugerida")
    router.refresh()
  }

  async function handleAddInteracao() {
    if (!resumoInteracao.trim()) { toast.error("Resumo obrigatório"); return }
    setSavingInteracao(true)
    const { error } = await supabase.from("interacoes_comerciais").insert({
      aluno_id: alunoId,
      tipo: tipoInteracao,
      resumo: resumoInteracao,
      proximo_passo: proximoPassoInteracao || null,
    })
    setSavingInteracao(false)
    if (error) { toast.error("Erro ao registrar interação"); return }
    toast.success("Interação registrada!")
    setResumoInteracao("")
    setProximoPassoInteracao("")
    router.refresh()
  }

  async function handleAddTarefa() {
    if (!tituloTarefa.trim()) { toast.error("Título obrigatório"); return }
    setSavingTarefa(true)
    const { error } = await supabase.from("tarefas_sdr").insert({
      aluno_id: alunoId,
      titulo: tituloTarefa,
      data_prazo: dataPrazoTarefa || null,
    })
    setSavingTarefa(false)
    if (error) { toast.error("Erro ao criar tarefa"); return }
    toast.success("Tarefa criada!")
    setTituloTarefa("")
    setDataPrazoTarefa("")
    router.refresh()
  }

  async function handleConcluirTarefa(tarefaId: string) {
    const { error } = await supabase.from("tarefas_sdr").update({ status: "concluida" }).eq("id", tarefaId)
    if (error) { toast.error("Erro ao concluir tarefa"); return }
    router.refresh()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4" /> Pipeline Comercial
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Etapa + Responsável + Score */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Etapa</label>
            <Select value={etapaPipeline} onValueChange={v => v && handleEtapaChange(v)} disabled={savingEtapa}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ETAPAS.map(e => <SelectItem key={e.id} value={e.id}>{e.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Responsável</label>
            <Select value={responsavelId ?? "nenhum"} onValueChange={v => v && handleResponsavelChange(v)} disabled={savingResp}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Sem responsável</SelectItem>
                {responsaveis.map(r => <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Score Comercial</label>
            <div className="h-9 flex items-center px-3 rounded-md border bg-muted/30 text-sm font-semibold">
              🔥 {scoreComercial} pts
            </div>
          </div>
        </div>

        {/* Próxima melhor oferta */}
        <div className="flex items-center gap-2 flex-wrap">
          {proximaMelhorOferta && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
              → {proximaMelhorOferta}
            </span>
          )}
          <Button size="sm" variant="outline" onClick={handleSugerirOferta} disabled={savingOferta}>
            {savingOferta ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
            Sugerir próxima oferta
          </Button>
        </div>

        {/* Interações Comerciais */}
        <div className="space-y-3 border-t pt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Interações Comerciais</p>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {interacoes.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma interação ainda.</p>}
            {interacoes.map(i => (
              <div key={i.id} className="text-sm border-b pb-2 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{i.tipo ? TIPOS_INTERACAO[i.tipo] ?? i.tipo : "—"}</span>
                  <span className="text-xs text-muted-foreground">{new Date(i.data).toLocaleDateString("pt-BR")}</span>
                </div>
                {i.resumo && <p className="text-muted-foreground">{i.resumo}</p>}
                {i.proximo_passo && <p className="text-xs text-blue-600">Próximo passo: {i.proximo_passo}</p>}
              </div>
            ))}
          </div>
          <div className="rounded-lg border p-3 bg-muted/10 space-y-2">
            <Select value={tipoInteracao} onValueChange={v => v && setTipoInteracao(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TIPOS_INTERACAO).map(([k, label]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea value={resumoInteracao} onChange={e => setResumoInteracao(e.target.value)} rows={2} className="resize-none" placeholder="O que foi conversado..." />
            <Input value={proximoPassoInteracao} onChange={e => setProximoPassoInteracao(e.target.value)} placeholder="Próximo passo (opcional)" />
            <Button onClick={handleAddInteracao} disabled={savingInteracao} size="sm" className="w-full">
              {savingInteracao ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
              Registrar Interação
            </Button>
          </div>
        </div>

        {/* Tarefas de Follow-up */}
        <div className="space-y-3 border-t pt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tarefas de Follow-up</p>
          <div className="space-y-2">
            {tarefas.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma tarefa ainda.</p>}
            {tarefas.map(t => (
              <div key={t.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0 last:pb-0">
                <div>
                  <p className={t.status === "concluida" ? "line-through text-muted-foreground" : ""}>{t.titulo}</p>
                  {t.data_prazo && <span className="text-xs text-muted-foreground">{new Date(t.data_prazo).toLocaleDateString("pt-BR")}</span>}
                </div>
                {t.status !== "concluida" && (
                  <Button size="icon-sm" variant="ghost" onClick={() => handleConcluirTarefa(t.id)}>
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={tituloTarefa} onChange={e => setTituloTarefa(e.target.value)} placeholder="Nova tarefa..." />
            <Input type="date" value={dataPrazoTarefa} onChange={e => setDataPrazoTarefa(e.target.value)} className="w-40" />
            <Button onClick={handleAddTarefa} disabled={savingTarefa} size="sm">
              {savingTarefa ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
