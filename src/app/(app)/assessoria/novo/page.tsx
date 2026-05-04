"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NovoAssessoradoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    data_contratacao: new Date().toISOString().split("T")[0],
    valor_assessoria: "",
    observacoes: "",
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
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
          valor_assessoria: form.valor_assessoria ? parseFloat(form.valor_assessoria.replace(",", ".")) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success("Assessorado cadastrado!")
      router.push(`/assessoria/${data.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/assessoria" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Novo Assessorado</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do assessorado</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Nome completo" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@exemplo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                <Input id="telefone" value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(11) 99999-9999" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_contratacao">Data da contratação *</Label>
                <Input id="data_contratacao" type="date" value={form.data_contratacao} onChange={(e) => set("data_contratacao", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor da assessoria (R$)</Label>
                <Input id="valor" value={form.valor_assessoria} onChange={(e) => set("valor_assessoria", e.target.value)} placeholder="0,00" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="obs">Observações</Label>
              <textarea
                id="obs"
                value={form.observacoes}
                onChange={(e) => set("observacoes", e.target.value)}
                placeholder="Anotações sobre o assessorado, objetivos, etc."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Salvando..." : "Salvar"}
              </Button>
              <Link href="/assessoria">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
