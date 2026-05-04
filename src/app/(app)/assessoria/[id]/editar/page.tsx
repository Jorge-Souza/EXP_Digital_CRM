"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function EditarAssessoradoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: "", email: "", telefone: "",
    data_contratacao: "", valor_assessoria: "", observacoes: "",
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.from("assessorados").select("*").eq("id", id).single().then(({ data }) => {
      if (data) setForm({
        nome: data.nome,
        email: data.email ?? "",
        telefone: data.telefone ?? "",
        data_contratacao: data.data_contratacao,
        valor_assessoria: data.valor_assessoria ? String(data.valor_assessoria) : "",
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
      data_contratacao: form.data_contratacao,
      valor_assessoria: form.valor_assessoria ? parseFloat(form.valor_assessoria.replace(",", ".")) : null,
      observacoes: form.observacoes || null,
      updated_at: new Date().toISOString(),
    }).eq("id", id)
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success("Dados atualizados!")
    router.push(`/assessoria/${id}`)
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/assessoria/${id}`} className="text-muted-foreground hover:text-foreground">
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
                <Label>Data contratação</Label>
                <Input type="date" value={form.data_contratacao} onChange={(e) => set("data_contratacao", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input value={form.valor_assessoria} onChange={(e) => set("valor_assessoria", e.target.value)} />
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
              <Link href={`/assessoria/${id}`}><Button variant="outline">Cancelar</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
