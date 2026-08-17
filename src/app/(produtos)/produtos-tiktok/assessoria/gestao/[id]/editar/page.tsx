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

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/produtos-tiktok/assessoria/gestao/${id}`} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Editar Assessorado</h1>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Dados</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loja / Marca</Label>
                <Input value={form.loja} onChange={(e) => set("loja", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Segmento</Label>
                <Input value={form.segmento} onChange={(e) => set("segmento", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nº da vaga (1-7)</Label>
                <Input type="number" min={1} max={7} value={form.numero_vaga} onChange={(e) => set("numero_vaga", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => v && set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                    <SelectItem value="encerrado">Encerrado</SelectItem>
                    <SelectItem value="renovado">Renovado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data contratação</Label>
                <Input type="date" value={form.data_contratacao} onChange={(e) => set("data_contratacao", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Fim previsto</Label>
                <Input type="date" value={form.data_fim_prevista} onChange={(e) => set("data_fim_prevista", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input value={form.valor_assessoria} onChange={(e) => set("valor_assessoria", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>GMV atual (R$)</Label>
                <Input value={form.gmv_atual} onChange={(e) => set("gmv_atual", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Saúde da conta</Label>
                <Select value={form.saude_conta} onValueChange={(v) => v && set("saude_conta", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verde">🟢 Evoluindo</SelectItem>
                    <SelectItem value="amarelo">🟡 Estagnado</SelectItem>
                    <SelectItem value="vermelho">🔴 Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              <Link href={`/produtos-tiktok/assessoria/gestao/${id}`}><Button variant="outline">Cancelar</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
