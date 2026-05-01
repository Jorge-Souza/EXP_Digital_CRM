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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import type { Client, ClientStatus, ClientServico, ClientRedeSocial, ClientAds } from "@/lib/types"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import {
  Loader2, ExternalLink, Building2, Phone, BookOpen,
  Mic, Square, Sparkles, Users, ChevronDown, ChevronUp, Palette,
} from "lucide-react"

interface ClientFormProps {
  client?: Client
}

const EMOJIS = [
  "🏢","🏪","🏬","🏭","🏗️","🏠","🏡","🏨","🏦","🏥",
  "💼","💰","🛍️","🛒","🎯","🚀","⭐","💎","🎨","📸",
  "📱","💻","🍕","🍔","🍜","☕","🧁","🌸","🌺","💄",
  "👗","👠","💪","🏋️","🎭","🎬","🎵","🎮","🐾","🌿",
  "🌱","💊","🔧","🔑","🚗","✈️","⚡","🌊","🧠","🏆",
]

const guiaPerguntas = [
  { num: "1", pergunta: "Quem é essa pessoa?", detalhe: "Características demográficas e comportamentais: idade, profissão, cargo, escolaridade, estilo de vida, rotina, interesses e contexto pessoal/profissional." },
  { num: "2", pergunta: "O que ela quer alcançar?", detalhe: "Principais objetivos e metas, tanto profissionais quanto pessoais. O que significa sucesso para ela?" },
  { num: "3", pergunta: "O que a impede de alcançar seus objetivos?", detalhe: "Desafios, dores e frustrações. Quais obstáculos encontra? O que a estressa ou atrapalha na jornada?" },
  { num: "4", pergunta: "Onde e como busca soluções?", detalhe: "Fontes de informação: redes sociais, blogs, influenciadores, eventos. Como pesquisa e toma decisões?" },
  { num: "5", pergunta: "Por que escolheria sua solução?", detalhe: "Critérios de decisão, fatores de confiança, possíveis objeções e o que poderia fazê-la desistir." },
]

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [guiaAberto, setGuiaAberto] = useState(false)
  const [gerandoBriefing, setGerandoBriefing] = useState(false)
  const [gerandoPersona, setGerandoPersona] = useState(false)
  const [narrativaBriefing, setNarrativaBriefing] = useState("")
  const [narrativaPersona, setNarrativaPersona] = useState("")

  const [emojiPickerAberto, setEmojiPickerAberto] = useState(false)

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
    persona: client?.persona ?? "",
    avatar_emoji: client?.avatar_emoji ?? "🏢",
    cor: client?.cor ?? "#6366f1",
    servico: client?.servico ?? "",
    rede_social: client?.rede_social ?? "",
    ads: client?.ads ?? "",
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const audioNarrativa = useAudioRecorder(texto => setNarrativaBriefing(prev => prev ? prev + " " + texto : texto))
  const audioPersona = useAudioRecorder(texto => setNarrativaPersona(prev => prev ? prev + " " + texto : texto))

  async function gerarBriefingComIA() {
    if (!narrativaBriefing.trim()) return
    setGerandoBriefing(true)
    try {
      const res = await fetch("/api/briefing/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: narrativaBriefing }),
      })
      const data = await res.json() as { briefing?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar briefing")
      set("objetivo", data.briefing ?? "")
      toast.success("Briefing gerado! Revise e ajuste os campos.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar briefing")
    } finally {
      setGerandoBriefing(false)
    }
  }

  async function gerarPersonaComIA() {
    if (!narrativaPersona.trim()) return
    setGerandoPersona(true)
    try {
      const res = await fetch("/api/cliente/gerar-persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: narrativaPersona,
          cliente_nome: form.nome,
          nicho: form.nicho,
        }),
      })
      const data = await res.json() as { persona?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar persona")
      set("persona", data.persona ?? "")
      toast.success("Persona gerada com sucesso!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar persona")
    } finally {
      setGerandoPersona(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) { toast.error("Nome do cliente é obrigatório"); return }
    if (!form.nicho.trim()) { toast.error("Nicho é obrigatório"); return }
    if (form.contato_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contato_email)) {
      toast.error("E-mail de contato inválido"); return
    }
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
      persona: form.persona || null,
      avatar_emoji: form.avatar_emoji,
      cor: form.cor,
      servico: (form.servico || null) as ClientServico | null,
      rede_social: (form.rede_social || null) as ClientRedeSocial | null,
      ads: (form.ads || null) as ClientAds | null,
    }

    if (client?.id) {
      const { error } = await supabase.from("clients").update(payload).eq("id", client.id)
      if (error) { toast.error("Erro ao salvar: " + error.message); setLoading(false); return }
    } else {
      const { data: novo, error } = await supabase.from("clients").insert(payload).select("id, nome").single()
      if (error || !novo) { toast.error("Erro ao salvar: " + (error?.message ?? "desconhecido")); setLoading(false); return }

      if (!payload.drive_folder_url) {
        try {
          const res = await fetch("/api/drive/create-folder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientName: novo.nome }),
          })
          const driveData = await res.json()
          if (driveData.folderUrl) {
            await supabase.from("clients").update({ drive_folder_url: driveData.folderUrl }).eq("id", novo.id)
          }
        } catch { /* não bloqueia */ }
      }
    }

    toast.success(client?.id ? "Cliente atualizado!" : "Cliente cadastrado!")
    router.push("/clientes")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="dados">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dados" className="gap-2">
            <Building2 className="h-4 w-4" /> Dados do Cliente
          </TabsTrigger>
          <TabsTrigger value="persona" className="gap-2">
            <Users className="h-4 w-4" /> Persona
          </TabsTrigger>
        </TabsList>

        {/* ─── ABA: DADOS DO CLIENTE ─── */}
        <TabsContent value="dados" className="space-y-5 mt-5">

          {/* Dados Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" /> Dados Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Avatar + Cor */}
              <div className="flex items-end gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Palette className="h-3.5 w-3.5 text-muted-foreground" /> Avatar</Label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setEmojiPickerAberto(v => !v)}
                      className="h-10 w-14 rounded-lg border border-input flex items-center justify-center text-2xl hover:bg-muted transition-colors"
                      style={{ background: `${form.cor}18` }}
                    >
                      {form.avatar_emoji}
                    </button>
                    {emojiPickerAberto && (
                      <div className="absolute top-12 left-0 z-20 bg-popover border border-border rounded-xl shadow-xl p-3 w-64">
                        <div className="grid grid-cols-10 gap-1">
                          {EMOJIS.map(e => (
                            <button
                              key={e}
                              type="button"
                              className={`text-xl p-1 rounded hover:bg-muted transition-colors ${form.avatar_emoji === e ? "bg-primary/20 ring-1 ring-primary" : ""}`}
                              onClick={() => { set("avatar_emoji", e); setEmojiPickerAberto(false) }}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.cor}
                      onChange={e => set("cor", e.target.value)}
                      className="h-10 w-14 rounded-lg border border-input cursor-pointer p-1"
                    />
                    <span className="text-xs text-muted-foreground font-mono">{form.cor}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="nome">Nome da Empresa *</Label>
                  <Input id="nome" value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Ex: Loja ABC" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nicho">Nicho / Segmento</Label>
                <Input id="nicho" value={form.nicho} onChange={e => set("nicho", e.target.value)} placeholder="Ex: Moda Feminina" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Meta Posts / Mês</Label>
                  <Input type="number" min={0} value={form.posts_mensais} onChange={e => set("posts_mensais", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Meta Posts / Semana</Label>
                  <Input type="number" min={0} value={form.meta_posts_semana} onChange={e => set("meta_posts_semana", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => set("status", v ?? "ativo")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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

          {/* Serviços Contratados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" /> Serviços Contratados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Serviço</Label>
                  <Select value={form.servico} onValueChange={v => set("servico", v ?? "")}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="trafego_pago">Tráfego Pago</SelectItem>
                      <SelectItem value="ambos">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(form.servico === "social_media" || form.servico === "ambos") && (
                  <div className="space-y-2">
                    <Label>Rede Social</Label>
                    <Select value={form.rede_social} onValueChange={v => set("rede_social", v ?? "")}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="insta_tiktok">Insta & TikTok</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(form.servico === "trafego_pago" || form.servico === "ambos") && (
                  <div className="space-y-2">
                    <Label>Ads</Label>
                    <Select value={form.ads} onValueChange={v => set("ads", v ?? "")}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meta_ads">Meta Ads</SelectItem>
                        <SelectItem value="google_ads">Google Ads</SelectItem>
                        <SelectItem value="meta_google">Meta & Google</SelectItem>
                        <SelectItem value="tiktok_ads">TikTok Ads</SelectItem>
                        <SelectItem value="ambos">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" /> Responsável & Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Responsável</Label>
                <Input value={form.contato_nome} onChange={e => set("contato_nome", e.target.value)} placeholder="Nome do dono ou contato principal" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.contato_email} onChange={e => set("contato_email", e.target.value)} placeholder="contato@email.com" />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input value={form.contato_telefone} onChange={e => set("contato_telefone", e.target.value)} placeholder="(11) 99999-9999" />
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
                  <Label>Instagram</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                    <Input className="pl-7" value={form.instagram} onChange={e => set("instagram", e.target.value)} placeholder="usuario" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>TikTok</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                    <Input className="pl-7" value={form.tiktok} onChange={e => set("tiktok", e.target.value)} placeholder="usuario" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Pasta no Google Drive <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Input type="url" value={form.drive_folder_url} onChange={e => set("drive_folder_url", e.target.value)} placeholder="https://drive.google.com/drive/folders/..." />
              </div>
            </CardContent>
          </Card>

          {/* Briefing com narração IA */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> Briefing — Manual do Cliente
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Narre sobre o cliente ou preencha os campos manualmente. A IA organiza tudo para você.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bloco de narração */}
              <div className="bg-muted/40 rounded-lg p-4 space-y-3 border border-dashed border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gerar com IA</p>
                <p className="text-xs text-muted-foreground">
                  Grave um áudio ou escreva tudo que sabe sobre o cliente. A IA vai organizar o briefing.
                </p>
                <div className="flex gap-2">
                  {!audioNarrativa.gravando ? (
                    <Button type="button" variant="outline" size="sm" className="gap-1.5"
                      onClick={audioNarrativa.iniciar} disabled={audioNarrativa.transcrevendo || gerandoBriefing}>
                      {audioNarrativa.transcrevendo
                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Transcrevendo...</>
                        : <><Mic className="h-3.5 w-3.5 text-red-500" /> Gravar Áudio</>}
                    </Button>
                  ) : (
                    <Button type="button" variant="destructive" size="sm" className="gap-1.5 animate-pulse"
                      onClick={audioNarrativa.parar}>
                      <Square className="h-3.5 w-3.5" /> Parar Gravação
                    </Button>
                  )}
                </div>
                <Textarea
                  placeholder="Ou escreva aqui sobre o cliente: o que faz, seus objetivos, público, diferenciais, tom de comunicação..."
                  value={narrativaBriefing}
                  onChange={e => setNarrativaBriefing(e.target.value)}
                  rows={4}
                  className="text-sm"
                />
                <Button type="button" onClick={gerarBriefingComIA}
                  disabled={gerandoBriefing || !narrativaBriefing.trim()} className="w-full gap-2">
                  {gerandoBriefing
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Gerando briefing...</>
                    : <><Sparkles className="h-4 w-4" /> Gerar Briefing com IA</>}
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>🎯 Objetivo / Briefing</Label>
                <Textarea value={form.objetivo} onChange={e => set("objetivo", e.target.value)}
                  placeholder="O que o cliente quer alcançar com as redes sociais?" rows={4} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── ABA: PERSONA ─── */}
        <TabsContent value="persona" className="space-y-5 mt-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Persona do Cliente
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Descreva quem é o cliente ideal deste cliente. A IA cria um documento completo de persona.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Guia recolhível */}
              <div className="border rounded-lg overflow-hidden">
                <button type="button" onClick={() => setGuiaAberto(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold bg-muted/50 hover:bg-muted transition-colors">
                  <span>Guia para criar a persona</span>
                  {guiaAberto ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {guiaAberto && (
                  <div className="p-4 space-y-3 border-t">
                    <p className="text-xs text-muted-foreground font-medium">Para criar a persona, considere responder:</p>
                    {guiaPerguntas.map(q => (
                      <div key={q.num} className="space-y-0.5">
                        <p className="text-sm font-semibold text-primary">{q.num}. {q.pergunta}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{q.detalhe}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bloco de narração */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Grave um áudio ou descreva a persona por texto
                </p>
                <div className="flex gap-2">
                  {!audioPersona.gravando ? (
                    <Button type="button" variant="outline" size="sm" className="gap-1.5"
                      onClick={audioPersona.iniciar} disabled={audioPersona.transcrevendo || gerandoPersona}>
                      {audioPersona.transcrevendo
                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Transcrevendo...</>
                        : <><Mic className="h-3.5 w-3.5 text-red-500" /> Gravar Áudio</>}
                    </Button>
                  ) : (
                    <Button type="button" variant="destructive" size="sm" className="gap-1.5 animate-pulse"
                      onClick={audioPersona.parar}>
                      <Square className="h-3.5 w-3.5" /> Parar Gravação
                    </Button>
                  )}
                </div>
                <Textarea
                  placeholder="Descreva aqui quem é o cliente ideal: idade, profissão, dores, desejos, objeções, onde está, o que consome..."
                  value={narrativaPersona}
                  onChange={e => setNarrativaPersona(e.target.value)}
                  rows={5}
                  className="text-sm"
                />
                <Button type="button" onClick={gerarPersonaComIA}
                  disabled={gerandoPersona || !narrativaPersona.trim()} className="w-full gap-2">
                  {gerandoPersona
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Gerando persona...</>
                    : <><Sparkles className="h-4 w-4" /> Gerar Persona com IA</>}
                </Button>
              </div>

              {/* Resultado da persona */}
              {form.persona && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Persona gerada — revise e edite se necessário</Label>
                    <Textarea
                      value={form.persona}
                      onChange={e => set("persona", e.target.value)}
                      rows={20}
                      className="text-sm font-mono leading-relaxed"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botões de ação */}
      <div className="flex gap-3 pb-8">
        <Button type="submit" disabled={loading}>
          {loading
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
            : client?.id ? "Salvar Alterações" : "Cadastrar Cliente"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
