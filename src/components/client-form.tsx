"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ExternalLink, Building2, Phone, BookOpen } from "lucide-react"
import { toast } from "sonner"
import type { Client, ClientStatus } from "@/lib/types"

interface ClientFormProps {
  client?: Client
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    nome: client?.nome ?? "",
    nicho: client?.nicho ?? "",
    contato_nome: client?.contato_nome ?? "",
    contato_email: client?.contato_email ?? "",
    contato_telefone: client?.contato_telefone ?? "",
    instagram: client?.instagram ?? "",
    tiktok: client?.tiktok ?? "",
    posts_mensais: String(client?.posts_mensais ?? 0),
    meta_posts_semana: String(client?.meta_posts_semana ?? 0),
    status: client?.status ?? "ativo",
    drive_folder_url: client?.drive_folder_url ?? "",
    objetivo: client?.objetivo ?? "",
    publico_alvo: client?.publico_alvo ?? "",
    tom_de_voz: client?.tom_de_voz ?? "",
    servicos_contratados: client?.servicos_contratados ?? "",
    diferenciais: client?.diferenciais ?? "",
    observacoes: client?.observacoes ?? "",
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const payload = {
      nome: form.nome,
      nicho: form.nicho,
      contato_nome: form.contato_nome,
      contato_email: form.contato_email,
      contato_telefone: form.contato_telefone,
      instagram: form.instagram || null,
      tiktok: form.tiktok || null,
      drive_folder_url: form.drive_folder_url || null,
      posts_mensais: parseInt(form.posts_mensais) || 0,
      meta_posts_semana: parseInt(form.meta_posts_semana) || 0,
      status: form.status as ClientStatus,
      objetivo: form.objetivo || null,
      publico_alvo: form.publico_alvo || null,
      tom_de_voz: form.tom_de_voz || null,
      servicos_contratados: form.servicos_contratados || null,
      diferenciais: form.diferenciais || null,
      observacoes: form.observacoes || null,
    }

    const { error } = client?.id
      ? await supabase.from("clients").update(payload).eq("id", client.id)
      : await supabase.from("clients").insert(payload)

    if (error) {
      toast.error("Erro ao salvar cliente: " + error.message)
      setLoading(false)
      return
    }

    toast.success(client?.id ? "Cliente atualizado!" : "Cliente cadastrado!")
    router.push("/clientes")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Dados Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Dados Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Empresa *</Label>
              <Input id="nome" value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Ex: Loja ABC" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nicho">Nicho / Segmento</Label>
              <Input id="nicho" value={form.nicho} onChange={(e) => set("nicho", e.target.value)} placeholder="Ex: Moda Feminina" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="posts_mensais">Meta de Posts / Mês</Label>
              <Input id="posts_mensais" type="number" min={0} value={form.posts_mensais} onChange={(e) => set("posts_mensais", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_posts_semana">Meta de Posts / Semana</Label>
              <Input id="meta_posts_semana" type="number" min={0} value={form.meta_posts_semana} onChange={(e) => set("meta_posts_semana", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v ?? "ativo")}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                  <SelectItem value="inativo">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Responsável & Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contato_nome">Nome do Responsável</Label>
            <Input id="contato_nome" value={form.contato_nome} onChange={(e) => set("contato_nome", e.target.value)} placeholder="Nome do dono ou contato principal" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contato_email">Email</Label>
              <Input id="contato_email" type="email" value={form.contato_email} onChange={(e) => set("contato_email", e.target.value)} placeholder="contato@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contato_telefone">WhatsApp</Label>
              <Input id="contato_telefone" value={form.contato_telefone} onChange={(e) => set("contato_telefone", e.target.value)} placeholder="(11) 99999-9999" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redes & Drive */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">IG</span>
            Redes Sociais & Arquivos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <Input id="instagram" className="pl-7" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="usuario" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <Input id="tiktok" className="pl-7" value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)} placeholder="usuario" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="drive_folder_url" className="flex items-center gap-1">
              Pasta no Google Drive
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </Label>
            <Input id="drive_folder_url" type="url" value={form.drive_folder_url} onChange={(e) => set("drive_folder_url", e.target.value)} placeholder="https://drive.google.com/drive/folders/..." />
          </div>
        </CardContent>
      </Card>

      {/* Briefing */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Briefing — Manual do Cliente
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Essas informações ficam visíveis para toda a equipe no perfil do cliente
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="objetivo">🎯 Objetivo do Cliente</Label>
            <Textarea
              id="objetivo"
              value={form.objetivo}
              onChange={(e) => set("objetivo", e.target.value)}
              placeholder="O que o cliente quer alcançar com as redes sociais? Ex: aumentar vendas, gerar leads, fortalecer marca..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="publico_alvo">👥 Público-alvo</Label>
            <Textarea
              id="publico_alvo"
              value={form.publico_alvo}
              onChange={(e) => set("publico_alvo", e.target.value)}
              placeholder="Quem são os clientes deles? Faixa etária, gênero, interesses, localização..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tom_de_voz">🎙️ Tom de Voz</Label>
            <Textarea
              id="tom_de_voz"
              value={form.tom_de_voz}
              onChange={(e) => set("tom_de_voz", e.target.value)}
              placeholder="Como a marca se comunica? Ex: descontraído e próximo, profissional e sério, divertido, inspirador..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="servicos_contratados">📋 Serviços Contratados</Label>
            <Textarea
              id="servicos_contratados"
              value={form.servicos_contratados}
              onChange={(e) => set("servicos_contratados", e.target.value)}
              placeholder="O que foi contratado? Ex: 12 reels + 8 stories + 4 carrosséis por mês, gestão Instagram e TikTok..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="diferenciais">⭐ Diferenciais da Marca</Label>
            <Textarea
              id="diferenciais"
              value={form.diferenciais}
              onChange={(e) => set("diferenciais", e.target.value)}
              placeholder="O que diferencia esse cliente da concorrência? Pontos fortes, valores, história..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoes">📝 Observações Importantes</Label>
            <Textarea
              id="observacoes"
              value={form.observacoes}
              onChange={(e) => set("observacoes", e.target.value)}
              placeholder="Restrições de conteúdo, preferências, coisas que não podem aparecer, datas importantes..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 pb-8">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
          ) : (
            client?.id ? "Salvar Alterações" : "Cadastrar Cliente"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
