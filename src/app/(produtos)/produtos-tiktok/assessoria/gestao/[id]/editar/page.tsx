"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, User, Store, FileText, CalendarDays } from "lucide-react"
import Link from "next/link"

const fieldClass = "bg-white/5 border-white/10 text-white placeholder:text-white/25 h-10 focus-visible:border-purple-400/60 focus-visible:ring-purple-400/20"
const labelClass = "text-xs font-semibold text-white/50 uppercase tracking-wide"

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
        <Icon className="h-4 w-4 text-purple-400" />
        {title}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export default function EditarAssessoradoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: "", email: "", telefone: "", loja: "", segmento: "", numero_vaga: "",
    data_contratacao: "", data_fim_prevista: "", status: "ativo",
    valor_assessoria: "", gmv_atual: "", saude_conta: "verde", observacoes: "",
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.from("assessorados").select("*").eq("id", id).single().then(({ data }) => {
      if (data) setForm({
        nome: data.nome,
        email: data.email ?? "",
        telefone: data.telefone ?? "",
        loja: data.loja ?? "",
        segmento: data.segmento ?? "",
        numero_vaga: data.numero_vaga ? String(data.numero_vaga) : "",
        data_contratacao: data.data_contratacao,
        data_fim_prevista: data.data_fim_prevista ?? "",
        status: data.status ?? "ativo",
        valor_assessoria: data.valor_assessoria ? String(data.valor_assessoria) : "",
        gmv_atual: data.gmv_atual ? String(data.gmv_atual) : "",
        saude_conta: data.saude_conta ?? "verde",
        observacoes: data.observacoes ?? "",
      })
    })
  }, [id])

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("assessorados").update({
      nome: form.nome,
      email: form.email || null,
      telefone: form.telefone || null,
      loja: form.loja || null,
      segmento: form.segmento || null,
      numero_vaga: form.numero_vaga ? parseInt(form.numero_vaga, 10) : null,
      data_contratacao: form.data_contratacao,
      data_fim_prevista: form.data_fim_prevista || null,
      status: form.status,
      valor_assessoria: form.valor_assessoria ? parseFloat(form.valor_assessoria.replace(",", ".")) : null,
      gmv_atual: form.gmv_atual ? parseFloat(form.gmv_atual.replace(",", ".")) : null,
      saude_conta: form.saude_conta,
      observacoes: form.observacoes || null,
      updated_at: new Date().toISOString(),
    }).eq("id", id)
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success("Dados atualizados!")
    router.push(`/produtos-tiktok/assessoria/gestao/${id}`)
  }

  const iniciais = form.nome.trim()
    ? form.nome.trim().split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : "?"

  return (
    <div className="dark bg-background text-foreground -m-6 min-h-[calc(100vh-3.5rem)] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/produtos-tiktok/assessoria/gestao/${id}`} className="text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #A855F7, #7C3AED)" }}>
            {iniciais}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Editar Assessorado</h1>
            <p className="text-xs text-white/40">{form.nome || "Carregando..."}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Section icon={User} title="Identificação">
            <div className="space-y-2">
              <Label className={labelClass}>Nome *</Label>
              <Input className={fieldClass} value={form.nome} onChange={(e) => set("nome", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={labelClass}>Email</Label>
                <Input type="email" className={fieldClass} value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Telefone</Label>
                <Input className={fieldClass} value={form.telefone} onChange={(e) => set("telefone", e.target.value)} />
              </div>
            </div>
          </Section>

          <Section icon={Store} title="Loja & vaga">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={labelClass}>Loja / Marca</Label>
                <Input className={fieldClass} value={form.loja} onChange={(e) => set("loja", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Segmento</Label>
                <Input className={fieldClass} value={form.segmento} onChange={(e) => set("segmento", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className={labelClass}>Nº da vaga (1-7)</Label>
                <Input type="number" min={1} max={7} className={fieldClass} value={form.numero_vaga} onChange={(e) => set("numero_vaga", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Status</Label>
                <Select value={form.status} onValueChange={(v) => v && set("status", v)}>
                  <SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                    <SelectItem value="encerrado">Encerrado</SelectItem>
                    <SelectItem value="renovado">Renovado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Saúde da conta</Label>
                <Select value={form.saude_conta} onValueChange={(v) => v && set("saude_conta", v)}>
                  <SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verde">🟢 Evoluindo</SelectItem>
                    <SelectItem value="amarelo">🟡 Estagnado</SelectItem>
                    <SelectItem value="vermelho">🔴 Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          <Section icon={CalendarDays} title="Contrato & financeiro">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={labelClass}>Data contratação</Label>
                <Input type="date" className={fieldClass} value={form.data_contratacao} onChange={(e) => set("data_contratacao", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Fim previsto</Label>
                <Input type="date" className={fieldClass} value={form.data_fim_prevista} onChange={(e) => set("data_fim_prevista", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={labelClass}>Valor (R$)</Label>
                <Input className={fieldClass} value={form.valor_assessoria} onChange={(e) => set("valor_assessoria", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>GMV atual (R$)</Label>
                <Input className={fieldClass} value={form.gmv_atual} onChange={(e) => set("gmv_atual", e.target.value)} />
              </div>
            </div>
          </Section>

          <Section icon={FileText} title="Observações">
            <textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} rows={3}
              className={`w-full rounded-lg px-3 py-2 text-sm resize-none outline-none ${fieldClass}`} />
          </Section>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />{loading ? "Salvando..." : "Salvar"}
            </Button>
            <Link href={`/produtos-tiktok/assessoria/gestao/${id}`}><Button variant="outline">Cancelar</Button></Link>
          </div>
        </form>
      </div>
    </div>
  )
}
