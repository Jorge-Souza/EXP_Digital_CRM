"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, User, Store, FileText, CalendarDays } from "lucide-react"
import Link from "next/link"

function addMonths(dateStr: string, months: number) {
  const d = new Date(dateStr + "T00:00:00")
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split("T")[0]
}

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

export default function NovoAssessoradoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const hoje = new Date().toISOString().split("T")[0]
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    loja: "",
    segmento: "",
    numero_vaga: "",
    data_contratacao: hoje,
    data_fim_prevista: addMonths(hoje, 3),
    status: "ativo",
    valor_assessoria: "",
    gmv_atual: "",
    saude_conta: "verde",
    observacoes: "",
  })

  function set(field: string, value: string) {
    setForm((f) => {
      const next = { ...f, [field]: value }
      // Sugere data fim = contratação + 3 meses, só se o usuário ainda não mexeu manualmente nela
      if (field === "data_contratacao" && value) {
        next.data_fim_prevista = addMonths(value, 3)
      }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome) { toast.error("Nome é obrigatório"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/assessoria/assessorados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          numero_vaga: form.numero_vaga ? parseInt(form.numero_vaga, 10) : null,
          valor_assessoria: form.valor_assessoria ? parseFloat(form.valor_assessoria.replace(",", ".")) : null,
          gmv_atual: form.gmv_atual ? parseFloat(form.gmv_atual.replace(",", ".")) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success("Assessorado cadastrado!")
      router.push(`/produtos-tiktok/assessoria/gestao/${data.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar")
      setLoading(false)
    }
  }

  const iniciais = form.nome.trim()
    ? form.nome.trim().split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : "?"

  return (
    <div className="dark bg-background text-foreground -m-6 min-h-[calc(100vh-3.5rem)] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/produtos-tiktok/assessoria/gestao" className="text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #A855F7, #7C3AED)" }}>
            {iniciais}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Novo Assessorado</h1>
            <p className="text-xs text-white/40">Cadastro de uma nova vaga da assessoria</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Section icon={User} title="Identificação">
            <div className="space-y-2">
              <Label htmlFor="nome" className={labelClass}>Nome *</Label>
              <Input id="nome" className={fieldClass} value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className={labelClass}>Email</Label>
                <Input id="email" type="email" className={fieldClass} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@exemplo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone" className={labelClass}>Telefone / WhatsApp</Label>
                <Input id="telefone" className={fieldClass} value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(11) 99999-9999" />
              </div>
            </div>
          </Section>

          <Section icon={Store} title="Loja & vaga">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loja" className={labelClass}>Loja / Marca</Label>
                <Input id="loja" className={fieldClass} value={form.loja} onChange={(e) => set("loja", e.target.value)} placeholder="Nome da loja no TikTok Shop" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="segmento" className={labelClass}>Segmento</Label>
                <Input id="segmento" className={fieldClass} value={form.segmento} onChange={(e) => set("segmento", e.target.value)} placeholder="Ex: Moda, Acessórios" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vaga" className={labelClass}>Nº da vaga (1-7)</Label>
                <Input id="vaga" type="number" min={1} max={7} className={fieldClass} value={form.numero_vaga} onChange={(e) => set("numero_vaga", e.target.value)} placeholder="1 a 7" />
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
                <Label htmlFor="data_contratacao" className={labelClass}>Data da contratação *</Label>
                <Input id="data_contratacao" type="date" className={fieldClass} value={form.data_contratacao} onChange={(e) => set("data_contratacao", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_fim" className={labelClass}>Fim previsto (3 meses)</Label>
                <Input id="data_fim" type="date" className={fieldClass} value={form.data_fim_prevista} onChange={(e) => set("data_fim_prevista", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor" className={labelClass}>Valor da assessoria (R$)</Label>
                <Input id="valor" className={fieldClass} value={form.valor_assessoria} onChange={(e) => set("valor_assessoria", e.target.value)} placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gmv" className={labelClass}>GMV atual (R$)</Label>
                <Input id="gmv" className={fieldClass} value={form.gmv_atual} onChange={(e) => set("gmv_atual", e.target.value)} placeholder="0,00" />
              </div>
            </div>
          </Section>

          <Section icon={FileText} title="Observações">
            <textarea
              id="obs"
              value={form.observacoes}
              onChange={(e) => set("observacoes", e.target.value)}
              placeholder="Anotações sobre o assessorado, objetivos, etc."
              rows={3}
              className={`w-full rounded-lg px-3 py-2 text-sm resize-none outline-none ${fieldClass}`}
            />
          </Section>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Salvando..." : "Salvar"}
            </Button>
            <Link href="/produtos-tiktok/assessoria/gestao">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
