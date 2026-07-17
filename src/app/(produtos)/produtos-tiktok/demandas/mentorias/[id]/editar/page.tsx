"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import type { MentoriaStatus } from "@/lib/types"

const STATUS_OPCOES: { value: MentoriaStatus; label: string }[] = [
  { value: "nao_agendada", label: "Não agendada" },
  { value: "agendada", label: "Agendada" },
  { value: "executada", label: "Executada" },
  { value: "cancelada", label: "Cancelada" },
]

export default function EditarMentoriaPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    tipo: "",
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

  useEffect(() => {
    const supabase = createClient()
    supabase.from("mentorias").select("*").eq("id", id).single().then(({ data }) => {
      if (data) setForm({
        tipo: data.tipo,
        cliente_nome: data.cliente_nome,
        cliente_telefone: data.cliente_telefone ?? "",
        cliente_whatsapp: data.cliente_whatsapp ?? "",
        data_sessao: data.data_sessao ?? "",
        hora_sessao: data.hora_sessao ?? "",
        status: data.status,
        valor: data.valor != null ? String(data.valor) : "",
        pago: data.pago,
        local_pagamento: data.local_pagamento ?? "",
        observacoes: data.observacoes ?? "",
      })
    })
  }, [id])

  function set<K extends keyof typeof form>(field: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.cliente_nome) { toast.error("Nome do cliente é obrigatório"); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("mentorias").update({
      tipo: form.tipo,
      cliente_nome: form.cliente_nome,
      cliente_telefone: form.cliente_telefone || null,
      cliente_whatsapp: form.cliente_whatsapp || null,
      data_sessao: form.data_sessao || null,
      hora_sessao: form.hora_sessao || null,
      status: form.status,
      valor: form.valor ? parseFloat(form.valor.replace(",", ".")) : null,
      pago: form.pago,
      local_pagamento: form.local_pagamento || null,
      observacoes: form.observacoes || null,
      updated_at: new Date().toISOString(),
    }).eq("id", id)
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success("Mentoria atualizada!")
    router.push(`/produtos-tiktok/demandas/mentorias/${id}`)
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/produtos-tiktok/demandas/mentorias/${id}`} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Editar Mentoria</h1>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Dados</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Input value={form.tipo} onChange={(e) => set("tipo", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Nome do cliente *</Label>
              <Input value={form.cliente_nome} onChange={(e) => set("cliente_nome", e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={form.cliente_telefone} onChange={(e) => set("cliente_telefone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input value={form.cliente_whatsapp} onChange={(e) => set("cliente_whatsapp", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data da sessão</Label>
                <Input type="date" value={form.data_sessao} onChange={(e) => set("data_sessao", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input type="time" value={form.hora_sessao} onChange={(e) => set("hora_sessao", e.target.value)} />
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
              <Label>Valor (R$)</Label>
              <Input value={form.valor} onChange={(e) => set("valor", e.target.value)} />
            </div>

            <div className="space-y-2 rounded-md border p-3">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" checked={form.pago} onChange={(e) => set("pago", e.target.checked)} />
                Pagamento já realizado
              </label>
              {form.pago && (
                <div className="space-y-2 pt-2">
                  <Label>Onde foi pago</Label>
                  <Input value={form.local_pagamento} onChange={(e) => set("local_pagamento", e.target.value)} placeholder="Ex: Pix, Hotmart, Stripe..." />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />{loading ? "Salvando..." : "Salvar"}
              </Button>
              <Link href={`/produtos-tiktok/demandas/mentorias/${id}`}><Button type="button" variant="outline">Cancelar</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
