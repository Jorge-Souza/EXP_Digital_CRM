'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { ReferenciaLaboratorio } from '@/lib/types'
import {
  PlayCircle, Camera, Music2, Link, Loader2,
  Sparkles, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Trash2, PenLine,
} from 'lucide-react'

const plataformaConfig = {
  youtube:   { label: 'YouTube',   icon: PlayCircle, color: 'text-red-500' },
  instagram: { label: 'Instagram', icon: Camera,     color: 'text-pink-500' },
  tiktok:    { label: 'TikTok',    icon: Music2,     color: 'text-foreground' },
}

function ReferenciaCard({ ref: r, onDelete }: { ref: ReferenciaLaboratorio; onDelete: (id: string) => void }) {
  const [gerandoSugestoes, setGerandoSugestoes] = useState(false)
  const [sugestoes, setSugestoes] = useState(r.sugestoes ?? '')
  const [expandirTranscricao, setExpandirTranscricao] = useState(false)
  const [expandirSugestoes, setExpandirSugestoes] = useState(!!r.sugestoes)
  const [textoManual, setTextoManual] = useState('')
  const [salvandoManual, setSalvandoManual] = useState(false)
  const [mostrarManual, setMostrarManual] = useState(false)

  const plat = r.plataforma ? plataformaConfig[r.plataforma] : null
  const Icon = plat?.icon ?? Link

  async function salvarTranscricaoManual() {
    if (!textoManual.trim()) return
    setSalvandoManual(true)
    try {
      const res = await fetch(`/api/laboratorio/referencias/${r.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcricao: textoManual.trim(), status: 'concluido' }),
      })
      if (!res.ok) throw new Error('Erro ao salvar')
      r.transcricao = textoManual.trim()
      r.status = 'concluido'
      setMostrarManual(false)
      setExpandirTranscricao(true)
      toast.success('Transcrição salva!')
      window.location.reload()
    } catch {
      toast.error('Erro ao salvar transcrição')
    } finally {
      setSalvandoManual(false)
    }
  }

  async function gerarSugestoes() {
    setGerandoSugestoes(true)
    try {
      const res = await fetch('/api/laboratorio/sugerir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referencia_id: r.id }),
      })
      const data = await res.json() as { sugestoes?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erro ao gerar sugestões')
      setSugestoes(data.sugestoes ?? '')
      setExpandirSugestoes(true)
      toast.success('Sugestões geradas!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao gerar sugestões')
    } finally {
      setGerandoSugestoes(false)
    }
  }

  return (
    <Card className="border border-border">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className={`h-4 w-4 shrink-0 ${plat?.color ?? ''}`} />
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{r.titulo ?? plat?.label ?? 'Referência'}</p>
              <a href={r.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary truncate block max-w-xs">
                {r.url}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {r.status === 'processando' && (
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Processando
              </Badge>
            )}
            {r.status === 'concluido' && (
              <Badge variant="default" className="gap-1 bg-green-600">
                <CheckCircle2 className="h-3 w-3" /> Concluído
              </Badge>
            )}
            {r.status === 'erro' && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" /> Erro
              </Badge>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(r.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Erro + opção manual */}
        {r.status === 'erro' && (
          <div className="space-y-2">
            <p className="text-xs text-destructive bg-destructive/10 rounded p-2">{r.erro}</p>
            {!mostrarManual ? (
              <Button variant="outline" size="sm" className="w-full text-xs h-8 gap-1"
                onClick={() => setMostrarManual(true)}>
                <PenLine className="h-3 w-3" />
                Inserir transcrição manualmente
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Cole ou escreva o texto do vídeo:</p>
                <Textarea
                  placeholder="Cole aqui o conteúdo falado no vídeo..."
                  value={textoManual}
                  onChange={e => setTextoManual(e.target.value)}
                  className="text-xs min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 text-xs" onClick={salvarTranscricaoManual}
                    disabled={salvandoManual || !textoManual.trim()}>
                    {salvandoManual ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Salvar e gerar sugestões
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => setMostrarManual(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transcrição */}
        {r.transcricao && (
          <div>
            <button className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground w-full"
              onClick={() => setExpandirTranscricao(v => !v)}>
              {expandirTranscricao ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Transcrição
            </button>
            {expandirTranscricao && (
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed bg-muted/50 rounded p-3 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {r.transcricao}
              </p>
            )}
          </div>
        )}

        {/* Sugestões */}
        {r.status === 'concluido' && (
          <>
            <Separator />
            <div className="space-y-2">
              {sugestoes ? (
                <>
                  <button className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground w-full"
                    onClick={() => setExpandirSugestoes(v => !v)}>
                    {expandirSugestoes ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    <Sparkles className="h-3 w-3 text-primary" />
                    Sugestões de Conteúdo
                  </button>
                  {expandirSugestoes && (
                    <div className="text-xs text-foreground leading-relaxed bg-primary/5 border border-primary/20 rounded p-3 max-h-96 overflow-y-auto whitespace-pre-wrap">
                      {sugestoes}
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="w-full text-xs h-7"
                    onClick={gerarSugestoes} disabled={gerandoSugestoes}>
                    {gerandoSugestoes ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                    Gerar novas sugestões
                  </Button>
                </>
              ) : (
                <Button size="sm" className="w-full text-xs" onClick={gerarSugestoes} disabled={gerandoSugestoes}>
                  {gerandoSugestoes ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                  Gerar sugestões com IA
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function LaboratorioTab({
  clientId,
  clientNome,
  initialRefs,
}: {
  clientId: string
  clientNome: string
  initialRefs: ReferenciaLaboratorio[]
}) {
  const [refs, setRefs] = useState<ReferenciaLaboratorio[]>(initialRefs)
  const [url, setUrl] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function adicionarReferencia() {
    if (!url.trim()) return
    setCarregando(true)
    try {
      const res = await fetch('/api/laboratorio/transcrever', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), client_id: clientId }),
      })
      const data = await res.json() as ReferenciaLaboratorio & { error?: string }
      if (!res.ok) {
        // Mesmo com erro, tenta buscar o registro criado para mostrar na lista
        const { error: _e, ...registro } = data
        if (registro.id) {
          setRefs(prev => {
            const existe = prev.find(r => r.id === registro.id)
            if (existe) return prev
            return [registro as ReferenciaLaboratorio, ...prev]
          })
        }
        toast.error(data.error ?? 'Erro ao processar URL')
        setUrl('')
        return
      }
      setRefs(prev => {
        const existe = prev.find(r => r.id === data.id)
        if (existe) return prev.map(r => r.id === data.id ? data : r)
        return [data, ...prev]
      })
      setUrl('')
      toast.success('Conteúdo transcrito com sucesso!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao processar URL')
    } finally {
      setCarregando(false)
    }
  }

  async function excluirReferencia(id: string) {
    const res = await fetch(`/api/laboratorio/referencias/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setRefs(prev => prev.filter(r => r.id !== id))
      toast.success('Referência removida')
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
            Laboratório de Conteúdo — {clientNome}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Cole um link do Instagram, TikTok ou YouTube para transcrever o conteúdo e gerar sugestões adaptadas para este cliente.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="https://www.youtube.com/watch?v=... ou tiktok.com/..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !carregando && adicionarReferencia()}
              disabled={carregando}
              className="text-sm"
            />
            <Button onClick={adicionarReferencia} disabled={carregando || !url.trim()} className="shrink-0">
              {carregando ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Transcrever'}
            </Button>
          </div>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><PlayCircle className="h-3 w-3 text-red-500" /> YouTube</span>
            <span className="flex items-center gap-1"><Music2 className="h-3 w-3" /> TikTok</span>
            <span className="flex items-center gap-1"><Camera className="h-3 w-3 text-pink-500" /> Instagram (manual se falhar)</span>
          </div>
        </CardContent>
      </Card>

      {refs.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground text-sm">
            Nenhuma referência adicionada ainda. Cole um link acima para começar.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {refs.map(r => (
            <ReferenciaCard key={r.id} ref={r} onDelete={excluirReferencia} />
          ))}
        </div>
      )}
    </div>
  )
}
