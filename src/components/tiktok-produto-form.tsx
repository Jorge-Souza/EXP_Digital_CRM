"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Percent } from "lucide-react"
import Link from "next/link"
import type { TikTokProduto, Client } from "@/lib/types"

interface Props {
  clients: Pick<Client, "id" | "nome" | "avatar_emoji">[]
  initial?: TikTokProduto
}

export function TikTokProdutoForm({ clients, initial }: Props) {
  const router = useRouter()
  const isEdit = !!initial
  const [loading, setLoading] = useState(false)
  const [showMargem, setShowMargem] = useState(!!initial?.margem)

  const [form, setForm] = useState({
    client_id:   initial?.client_id  ?? "",
    nome:        initial?.nome       ?? "",
    descricao:   initial?.descricao  ?? "",
    sku:         initial?.sku        ?? "",
    ncm:         initial?.ncm        ?? "",
    preco:       initial?.preco != null ? String(initial.preco) : "",
    margem:      initial?.margem != null ? String(initial.margem) : "",
    unidade:     initial?.unidade    ?? "UN",
    estoque:     initial?.estoque != null ? String(initial.estoque) : "0",
    marca:       initial?.marca      ?? "",
    comprimento: initial?.comprimento != null ? String(initial.comprimento) : "",
    largura:     initial?.largura    != null ? String(initial.largura)    : "",
    altura:      initial?.altura     != null ? String(initial.altura)     : "",
    peso:        initial?.peso       != null ? String(initial.peso)       : "",
    nicho:       initial?.nicho      ?? "",
    subnicho:    initial?.subnicho   ?? "",
    status:      initial?.status     ?? "rascunho",
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome) { toast.error("Nome é obrigatório"); return }
    setLoading(true)
    try {
      const payload = { ...form, margem: showMargem ? form.margem : "" }
      const url = isEdit ? `/api/tiktok-shop/produtos/${initial!.id}` : "/api/tiktok-shop/produtos"
      const method = isEdit ? "PATCH" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(isEdit ? "Produto atualizado!" : "Produto cadastrado!")
      router.push("/tiktok-shop")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar")
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Remover este produto?")) return
    setLoading(true)
    try {
      const res = await fetch(`/api/tiktok-shop/produtos/${initial!.id}`, { method: "DELETE" })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      toast.success("Produto removido")
      router.push("/tiktok-shop")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/tiktok-shop" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">{isEdit ? "Editar Produto" : "Novo Produto"}</h1>
        </div>
        {isEdit && (
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
            Remover
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cliente */}
        <Card>
          <CardHeader><CardTitle className="text-base">Vinculação</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente</Label>
              <select
                id="client_id"
                value={form.client_id}
                onChange={(e) => set("client_id", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— Sem cliente vinculado —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.avatar_emoji} {c.nome}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="rascunho">Rascunho</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Identificação */}
        <Card>
          <CardHeader><CardTitle className="text-base">Identificação</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do produto *</Label>
              <Input id="nome" value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Ex: Camiseta Dry Fit Masculina" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <textarea
                id="descricao"
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                placeholder="Descrição completa do produto"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="Ex: CAM-DRY-M-AZL" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ncm">NCM</Label>
                <Input id="ncm" value={form.ncm} onChange={(e) => set("ncm", e.target.value)} placeholder="Ex: 6203.42.00" maxLength={10} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input id="marca" value={form.marca} onChange={(e) => set("marca", e.target.value)} placeholder="Ex: Nike" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nicho">Nicho</Label>
                <Input id="nicho" value={form.nicho} onChange={(e) => set("nicho", e.target.value)} placeholder="Ex: Moda" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subnicho">Subnicho</Label>
              <Input id="subnicho" value={form.subnicho} onChange={(e) => set("subnicho", e.target.value)} placeholder="Ex: Moda Masculina Fitness" />
            </div>
          </CardContent>
        </Card>

        {/* Preço e estoque */}
        <Card>
          <CardHeader><CardTitle className="text-base">Preço e Estoque</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Preço + botão margem */}
            <div className="space-y-2">
              <Label htmlFor="preco">Preço de venda (R$)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="preco"
                  value={form.preco}
                  onChange={(e) => set("preco", e.target.value)}
                  placeholder="Ex: 89,90"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMargem((v) => !v)}
                  className={`gap-1.5 shrink-0 transition-colors ${showMargem ? "border-purple-500 text-purple-400 bg-purple-500/10" : ""}`}
                >
                  <Percent className="h-3.5 w-3.5" />
                  Margem
                </Button>
              </div>
              {showMargem && (
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                  <Label htmlFor="margem" className="text-xs text-muted-foreground">
                    Margem de ganho desejada (%)
                  </Label>
                  <Input
                    id="margem"
                    type="number"
                    value={form.margem}
                    onChange={(e) => set("margem", e.target.value)}
                    placeholder="Ex: 40"
                    min={0}
                    max={999}
                    step={0.1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentual de margem sobre o custo do produto.
                  </p>
                  {form.preco && form.margem && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/5 text-xs">
                        Preço sugerido:{" "}
                        {(Number(form.preco.replace(",", ".")) * (1 + Number(form.margem) / 100))
                          .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade</Label>
                <select
                  id="unidade"
                  value={form.unidade}
                  onChange={(e) => set("unidade", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="UN">UN – Unidade</option>
                  <option value="PC">PC – Peça</option>
                  <option value="KG">KG – Quilograma</option>
                  <option value="MT">MT – Metro</option>
                  <option value="CX">CX – Caixa</option>
                  <option value="PAR">PAR – Par</option>
                  <option value="KIT">KIT – Kit</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estoque">Estoque atual</Label>
                <Input id="estoque" type="number" value={form.estoque} onChange={(e) => set("estoque", e.target.value)} min={0} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dimensões */}
        <Card>
          <CardHeader><CardTitle className="text-base">Dimensões e Peso</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="comprimento">Comprimento (cm)</Label>
                <Input id="comprimento" type="number" value={form.comprimento} onChange={(e) => set("comprimento", e.target.value)} placeholder="0" step="0.1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="largura">Largura (cm)</Label>
                <Input id="largura" type="number" value={form.largura} onChange={(e) => set("largura", e.target.value)} placeholder="0" step="0.1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="altura">Altura (cm)</Label>
                <Input id="altura" type="number" value={form.altura} onChange={(e) => set("altura", e.target.value)} placeholder="0" step="0.1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input id="peso" type="number" value={form.peso} onChange={(e) => set("peso", e.target.value)} placeholder="0.00" step="0.001" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar produto"}
          </Button>
          <Link href="/tiktok-shop">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
