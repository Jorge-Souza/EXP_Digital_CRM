import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY não configurada' }, { status: 500 })
  }

  const formData = await req.formData()
  const audio = formData.get('audio') as Blob | null
  if (!audio) return NextResponse.json({ error: 'Áudio não enviado' }, { status: 400 })

  const groqForm = new FormData()
  groqForm.append('file', audio, 'audio.webm')
  groqForm.append('model', 'whisper-large-v3-turbo')
  groqForm.append('response_format', 'json')
  groqForm.append('language', 'pt')

  const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: groqForm,
  })

  const groq = await groqRes.json() as { text?: string; error?: { message: string } }
  if (!groq.text) {
    return NextResponse.json({ error: groq.error?.message ?? 'Erro ao transcrever' }, { status: 500 })
  }

  return NextResponse.json({ transcricao: groq.text })
}
