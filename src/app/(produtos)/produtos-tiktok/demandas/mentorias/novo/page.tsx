"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import type { MentoriaStatus } from "@/lib/types"

const TIPOS_PADRAO = ["SOS TikTok Shop", "Outro"]

const STATUS_OPCOES: { value: MentoriaStatus; label: string }[] = [
  { value: "nao_agendada", label: "Não agendada" },
  { value: "agendada", label: "Agendada" },
  { value: "executada", label: "Executada" },
  { value: "cancelada", label: "Cancelada" },
]

export default function NovaMentoriaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tipoSelecionado, setTipoSelecionado] = useState("SOS TikTok Shop")
  const [tipoCustom, setTipoCustom] = useState("")
  const [form, setForm] = useState({
    cliente_nome: "",
    cliente_telefone: "",
    cliente_whatsapp: "",
    data_sessao: "",
    hora_sessao: "",
    status: "nao_agendada" as MentoriaStatus,
    valor: "",
    pago: false,
    local_pagamento: "",
    observacoes: "",
  })

  function set<K extends keyof typeof form>(field: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.cliente_nome) { toast.error("Nome do cliente é obrigatório"); return }
    const tipo = tipoSelecionado === "Outro" ? tipoCustom.trim() : tipoSelecionado
    if (!tipo) { toast.error("Informe o tipo da mentoria"); return }

    setLoading(true)
    try {
      const res = await fetch("/api/mentorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tipo,
          data_sessao: form.data_sessao || null,
          hora_sessao: form.hora_sessao || null,
          valor: form.valor ? parseFloat(form.valor.replace(",", ".")) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success("Mentoria cadastrada!")
      router.push(`/produtos-tiktok/demandas/mentorias/${data.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/produtos-tiktok/demandas/mentorias" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Nova Mentoria</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da mentoria</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={tipoSelecionado} onValueChange={v => v && setTipoSelecionado(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPOS_PADRAO.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              {tipoSelecionado === "Outro" && (
                <Input value={tipoCustom} onChange={(e) => setTipoCustom(e.target.value)} placeholder="Nome do novo tipo de mentoria" />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente_nome">Nome do cliente *</Label>
              <Input id="cliente_nome" value={form.cliente_nome} onChange={(e) => set("cliente_nome", e.target.value)} placeholder="Nome completo" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente_telefone">Telefone</Label>
                <Input id="cliente_telefone" value={form.cliente_telefone} onChange={(e) => set("cliente_telefone", e.target.value)} placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cliente_whatsapp">WhatsApp</Label>
                <Input id="cliente_whatsapp" value={form.cliente_whatsapp} onChange={(e) => set("cliente_whatsapp", e.target.value)} placeholder="(11) 99999-9999" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_sessao">Data da sessão</Label>
                <Input id="data_sessao" type="date" value={form.data_sessao} onChange={(e) => set("data_sessao", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora_sessao">Horário</Label>
                <Input id="hora_sessao" type="time" value={form.hora_sessao} onChange={(e) => set("hora_sessao", e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => v && set("status", v as MentoriaStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPCOES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input id="valor" value={form.valor} onChange={(e) => set("valor", e.target.value)} placeholder="0,00" />
            </div>

            <div className="space-y-2 rounded-md border p-3">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" checked={form.pago} onChange={(e) => set("pago", e.target.checked)} />
                Pagamento já realizado
              </label>
              {form.pago && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="local_pagamento">Onde foi pago</Label>
                  <Input id="local_pagamento" value={form.local_pagamento} onChange={(e) => set("local_pagamento", e.target.value)} placeholder="Ex: Pix, Hotmart, Stripe..." />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="obs">Observações</Label>
              <textarea
                id="obs"
                value={form.observacoes}
                onChange={(e) => set("observacoes", e.target.value)}
                placeholder="Anotações sobre a mentoria, contexto do cliente, etc."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Salvando..." : "Salvar"}
              </Button>
              <Link href="/produtos-tiktok/demandas/mentorias">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
