"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { ProdutoTiktok, ProdutoTipoTiktok } from "@/lib/types"

const tipoLabel: Record<ProdutoTipoTiktok, string> = {
  lowticket: "Low-ticket",
  core: "Core",
  mentoria: "Mentoria",
  outro: "Outro",
}

type FormState = { nome: string; tipo: ProdutoTipoTiktok; preco: string; kiwify_product_id: string }
const vazio: FormState = { nome: "", tipo: "lowticket", preco: "", kiwify_product_id: "" }

interface Props {
  produto?: ProdutoTiktok
}

export function ProdutosTiktokActions({ produto }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(
    produto
      ? { nome: produto.nome, tipo: produto.tipo, preco: produto.preco?.toString() ?? "", kiwify_product_id: produto.kiwify_product_id ?? "" }
      : vazio
  )

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function save() {
    if (!form.nome.trim()) { toast.error("Nome obrigatório"); return }
    setSaving(true)
    const payload = {
      nome: form.nome.trim(),
      tipo: form.tipo,
      preco: form.preco ? parseFloat(form.preco) : null,
      kiwify_product_id: form.kiwify_product_id.trim() || null,
    }
    const { error } = produto
      ? await supabase.from("produtos_tiktok").update(payload).eq("id", produto.id)
      : await supabase.from("produtos_tiktok").insert(payload)
    setSaving(false)
    if (error) { toast.error("Erro ao salvar produto"); return }
    toast.success(produto ? "Produto atualizado" : "Produto criado")
    setOpen(false)
    if (!produto) setForm(vazio)
    router.refresh()
  }

  async function toggle() {
    if (!produto) return
    await supabase.from("produtos_tiktok").update({ ativo: !produto.ativo }).eq("id", produto.id)
    router.refresh()
  }

  async function remove() {
    if (!produto) return
    if (!confirm(`Remover "${produto.nome}"?`)) return
    await supabase.from("produtos_tiktok").delete().eq("id", produto.id)
    toast.success("Produto removido")
    router.refresh()
  }

  if (produto) {
    return (
      <div className="flex gap-1 mt-2">
        <Button size="sm" variant="ghost" onClick={() => setOpen(true)} className="h-7 px-2">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" onClick={toggle} className="h-7 px-2 text-muted-foreground">
          {produto.ativo ? "Desativar" : "Ativar"}
        </Button>
        <Button size="sm" variant="ghost" onClick={remove} className="h-7 px-2 text-destructive hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Editar produto</DialogTitle></DialogHeader>
            <ProdutoForm form={form} set={set} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Novo produto
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo produto</DialogTitle></DialogHeader>
          <ProdutoForm form={form} set={set} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ProdutoForm({ form, set }: { form: FormState; set: (k: string, v: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>Nome</Label>
        <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Ex: Protocolo TikTok Shop" />
      </div>
      <div className="space-y-1">
        <Label>Tipo</Label>
        <Select value={form.tipo ?? "lowticket"} onValueChange={(v) => set("tipo", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(tipoLabel).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Preço (R$)</Label>
        <Input type="number" value={form.preco} onChange={(e) => set("preco", e.target.value)} placeholder="97.00" />
      </div>
      <div className="space-y-1">
        <Label>ID do produto na Kiwify</Label>
        <Input value={form.kiwify_product_id} onChange={(e) => set("kiwify_product_id", e.target.value)} placeholder="prod_xxx..." />
      </div>
    </div>
  )
}
