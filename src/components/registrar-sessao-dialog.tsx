"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ClipboardCheck } from "lucide-react"
import type { SessaoAssessoria } from "@/lib/types"

interface Props {
  sessao: SessaoAssessoria
  assessoradoId: string
}

export function RegistrarSessaoDialog({ sessao, assessoradoId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    descricao: sessao.descricao ?? "",
    tarefas_passadas: sessao.tarefas_passadas ?? sessao.plano_de_acao ?? "",
    tarefas_anteriores_cumpridas: sessao.tarefas_anteriores_cumpridas ?? "",
    pilar_foco: sessao.pilar_foco ?? "Estrutura",
    gmv_atual: "",
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/assessoria/sessoes/${sessao.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "realizada",
          descricao: form.descricao,
          tarefas_passadas: form.tarefas_passadas,
          plano_de_acao: form.tarefas_passadas,
          tarefas_anteriores_cumpridas: form.tarefas_anteriores_cumpridas || null,
          pilar_foco: form.pilar_foco,
          assessorado_id: assessoradoId,
          gmv_atual: form.gmv_atual ? parseFloat(form.gmv_atual.replace(",", ".")) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success("Sessão registrada!")
      setOpen(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar sessão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline"><ClipboardCheck className="mr-1.5 h-3.5 w-3.5" />Registrar sessão</Button>} />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-green-500" />
            Registrar Sessão Realizada
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>O que foi trabalhado</Label>
            <textarea
              value={form.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              rows={3}
              placeholder="Resumo da sessão..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>As tarefas da sessão anterior foram cumpridas?</Label>
            <select value={form.tarefas_anteriores_cumpridas} onChange={(e) => set("tarefas_anteriores_cumpridas", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Não se aplica / primeira sessão</option>
              <option value="sim">Sim</option>
              <option value="parcial">Parcial</option>
              <option value="nao">Não</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Tarefas passadas para o assessorado</Label>
            <textarea
              value={form.tarefas_passadas}
              onChange={(e) => set("tarefas_passadas", e.target.value)}
              rows={3}
              placeholder="Ex: Refazer a bio do Instagram, subir 3 vídeos..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estágio 3E&apos;s em foco</Label>
              <select value={form.pilar_foco} onChange={(e) => set("pilar_foco", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="Estrutura">Estrutura</option>
                <option value="Exposição">Exposição</option>
                <option value="Expansão">Expansão</option>
                <option value="Geral">Geral</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>GMV do mês (se souber)</Label>
              <Input value={form.gmv_atual} onChange={(e) => set("gmv_atual", e.target.value)} placeholder="0,00" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Salvando..." : "Salvar registro"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
