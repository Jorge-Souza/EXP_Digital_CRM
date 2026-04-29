import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ReferenciaPlataforma } from '@/lib/types'

export const maxDuration = 60

function detectPlataforma(url: string): ReferenciaPlataforma | null {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube'
  if (/instagram\.com/.test(url)) return 'instagram'
  if (/tiktok\.com/.test(url)) return 'tiktok'
  return null
}

function extrairVideoId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match?.[1] ?? null
}

async function transcreverYouTube(videoId: string): Promise<{ titulo: string; transcricao: string }> {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  })
  const html = await res.text()

  const tituloMatch = html.match(/<title>(.+?) - YouTube<\/title>/)
  const titulo = tituloMatch?.[1] ?? 'Vídeo do YouTube'

  const prMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;(?:var |const |let |<)/)
  if (!prMatch) throw new Error('Não foi possível extrair playerResponse')

  let playerResponse: Record<string, unknown>
  try {
    playerResponse = JSON.parse(prMatch[1])
  } catch {
    throw new Error('Erro ao parsear playerResponse')
  }

  const tracks = (playerResponse as {
    captions?: {
      playerCaptionsTracklistRenderer?: {
        captionTracks?: Array<{ languageCode: string; baseUrl: string }>
      }
    }
  }).captions?.playerCaptionsTracklistRenderer?.captionTracks

  if (!tracks || tracks.length === 0) throw new Error('Este vídeo não possui legendas disponíveis')

  const track = tracks.find(t => t.languageCode === 'pt') ??
                tracks.find(t => t.languageCode === 'pt-BR') ??
                tracks[0]

  const captionRes = await fetch(track.baseUrl)
  const xml = await captionRes.text()

  const transcricao = xml
    .match(/<text[^>]*>([^<]*)<\/text>/g)
    ?.map(t =>
      t.replace(/<[^>]+>/g, '')
       .replace(/&amp;/g, '&')
       .replace(/&lt;/g, '<')
       .replace(/&gt;/g, '>')
       .replace(/&#39;/g, "'")
       .replace(/&quot;/g, '"')
    )
    .join(' ') ?? ''

  if (!transcricao.trim()) throw new Error('Legenda vazia')

  return { titulo, transcricao }
}

async function getAudioUrlTikTok(url: string): Promise<string> {
  const res = await fetch(`https://tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  const data = await res.json() as { code: number; data?: { music?: string; play?: string } }
  if (data.code !== 0 || !data.data) throw new Error('Não foi possível obter o áudio do TikTok')
  const audioUrl = data.data.music ?? data.data.play
  if (!audioUrl) throw new Error('URL de áudio não encontrada no TikTok')
  return audioUrl
}

async function getAudioUrlInstagram(url: string): Promise<string> {
  const shortcodeMatch = url.match(/\/(?:p|reel|reels)\/([A-Za-z0-9_-]+)/)
  if (!shortcodeMatch) throw new Error('URL do Instagram inválida')
  const shortcode = shortcodeMatch[1]

  const embedRes = await fetch(`https://www.instagram.com/p/${shortcode}/embed/captioned/`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'pt-BR,pt;q=0.9',
    },
  })

  const html = await embedRes.text()

  // Tenta extrair URL do vídeo do HTML do embed
  const patterns = [
    /playableUrl\\?":\s*\\?"(https:[^"\\]+)\\?"/,
    /"video_url":"(https:[^"]+)"/,
    /property="og:video"\s+content="([^"]+)"/,
    /video_url&quot;:&quot;(https:[^&]+)&quot;/,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match) {
      return match[1].replace(/\\u002F/g, '/').replace(/\\/g, '').replace(/&amp;/g, '&')
    }
  }

  throw new Error('Não foi possível extrair o vídeo do Instagram. O conteúdo pode ser privado ou o Instagram bloqueou o acesso.')
}

async function transcreverAudioUrl(audioUrl: string, tipo: 'audio/mp3' | 'video/mp4'): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY não configurada no Vercel (Settings → Environment Variables).')
  }

  const audioRes = await fetch(audioUrl)
  if (!audioRes.ok) throw new Error('Erro ao baixar o áudio')
  const audioBuffer = await audioRes.arrayBuffer()

  const form = new FormData()
  const ext = tipo === 'video/mp4' ? 'mp4' : 'mp3'
  form.append('file', new Blob([audioBuffer], { type: tipo }), `audio.${ext}`)
  form.append('model', 'whisper-large-v3-turbo')
  form.append('response_format', 'json')

  const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: form,
  })

  const groq = await groqRes.json() as { text?: string; error?: { message: string } }
  if (!groq.text) throw new Error(groq.error?.message ?? 'Groq não retornou transcrição')
  return groq.text
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { url, client_id } = await req.json() as { url: string; client_id: string }
  if (!url || !client_id) return NextResponse.json({ error: 'url e client_id são obrigatórios' }, { status: 400 })

  const plataforma = detectPlataforma(url)
  if (!plataforma) return NextResponse.json({ error: 'URL não reconhecida. Use links do YouTube, Instagram ou TikTok.' }, { status: 400 })

  // Cache: mesma URL já processada
  const { data: existente } = await supabase
    .from('referencias_laboratorio')
    .select('*')
    .eq('client_id', client_id)
    .eq('url', url)
    .eq('status', 'concluido')
    .maybeSingle()

  if (existente) return NextResponse.json(existente)

  const { data: registro, error: insertErr } = await supabase
    .from('referencias_laboratorio')
    .insert({ client_id, url, plataforma, status: 'processando' })
    .select()
    .single()

  if (insertErr || !registro) {
    return NextResponse.json({ error: 'Erro ao salvar referência' }, { status: 500 })
  }

  try {
    let resultado: { titulo: string; transcricao: string }

    if (plataforma === 'youtube') {
      const videoId = extrairVideoId(url)
      if (!videoId) throw new Error('ID do vídeo não encontrado na URL')
      resultado = await transcreverYouTube(videoId)
    } else if (plataforma === 'tiktok') {
      const audioUrl = await getAudioUrlTikTok(url)
      const transcricao = await transcreverAudioUrl(audioUrl, 'audio/mp3')
      resultado = { titulo: 'TikTok', transcricao }
    } else {
      // Instagram
      const videoUrl = await getAudioUrlInstagram(url)
      const transcricao = await transcreverAudioUrl(videoUrl, 'video/mp4')
      resultado = { titulo: 'Instagram Reel', transcricao }
    }

    const { data: atualizado } = await supabase
      .from('referencias_laboratorio')
      .update({ ...resultado, status: 'concluido', updated_at: new Date().toISOString() })
      .eq('id', registro.id)
      .select()
      .single()

    return NextResponse.json(atualizado)
  } catch (err) {
    const erro = err instanceof Error ? err.message : 'Erro desconhecido'
    await supabase
      .from('referencias_laboratorio')
      .update({ status: 'erro', erro, updated_at: new Date().toISOString() })
      .eq('id', registro.id)

    return NextResponse.json({ error: erro }, { status: 500 })
  }
}
