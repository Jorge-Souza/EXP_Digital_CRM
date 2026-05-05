"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Calendar } from "lucide-react"

interface Props {
  assessoradoId: string
  assessoradoNome: string
  temGoogleCal: boolean
}

export function NovaSessaoDialog({ assessoradoId, assessoradoNome, temGoogleCal }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const amanha = new Date()
  amanha.setDate(amanha.getDate() + 1)
  amanha.setHours(10, 0, 0, 0)

  const [form, setForm] = useState({
    titulo: "Sessão de Assessoria TikTok Shop",
    data: amanha.toISOString().slice(0, 16),
    duracao_minutos: "60",
    descricao: "",
    link_reuniao: "",
    sincronizar_google: temGoogleCal,
    numero_sessao: "1",
    pilar_foco: "Estrutura",
    plano_de_acao: "",
  })

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/assessoria/sessoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessorado_id: assessoradoId,
          titulo: form.titulo,
          data_sessao: new Date(form.data).toISOString(),
          duracao_minutos: parseInt(form.duracao_minutos),
          descricao: form.descricao || null,
          link_reuniao: form.link_reuniao || null,
          sincronizar_google: form.sincronizar_google,
          assessorado_nome: assessoradoNome,
          numero_sessao: parseInt(form.numero_sessao),
          pilar_foco: form.pilar_foco,
          plano_de_acao: form.plano_de_acao || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(data.google_event_link ? "Sessão criada e adicionada ao Google Agenda!" : "Sessão agendada!")
      setOpen(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao agendar sessão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Nova Sessão</Button>} />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            Agendar Sessão
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data e hora *</Label>
              <Input type="datetime-local" value={form.data} onChange={(e) => set("data", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Duração (min)</Label>
              <Input type="number" value={form.duracao_minutos} onChange={(e) => set("duracao_minutos", e.target.value)} min={15} step={15} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número da Sessão</Label>
              <select value={form.numero_sessao} onChange={(e) => set("numero_sessao", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n.toString()}>{n}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Pilar de Foco</Label>
              <select value={form.pilar_foco} onChange={(e) => set("pilar_foco", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="Estrutura">Estrutura</option>
                <option value="Exposição">Exposição</option>
                <option value="Expansão">Expansão</option>
                <option value="Geral">Geral</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição / Pauta</Label>
            <textarea
              value={form.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              rows={2}
              placeholder="Tópicos da sessão..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Plano de Ação (Tarefas)</Label>
            <textarea
              value={form.plano_de_acao}
              onChange={(e) => set("plano_de_acao", e.target.value)}
              rows={2}
              placeholder="Ex: Refazer a bio do Instagram..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Link da reunião (Google Meet, Zoom...)</Label>
            <Input value={form.link_reuniao} onChange={(e) => set("link_reuniao", e.target.value)} placeholder="https://meet.google.com/..." />
          </div>
          {temGoogleCal && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.sincronizar_google}
                onChange={(e) => set("sincronizar_google", e.target.checked)}
                className="rounded"
              />
              Adicionar ao Google Agenda
            </label>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Agendando..." : "Agendar"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
