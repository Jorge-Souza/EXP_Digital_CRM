import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { referencia_id } = await req.json() as { referencia_id: string }
  if (!referencia_id) return NextResponse.json({ error: 'referencia_id obrigatório' }, { status: 400 })

  const { data: ref } = await supabase
    .from('referencias_laboratorio')
    .select('*, clients(nome, objetivo, publico_alvo, tom_de_voz, diferenciais, nicho)')
    .eq('id', referencia_id)
    .single()

  if (!ref) return NextResponse.json({ error: 'Referência não encontrada' }, { status: 404 })
  if (!ref.transcricao) return NextResponse.json({ error: 'Referência ainda sem transcrição' }, { status: 400 })

  if (ref.sugestoes) return NextResponse.json({ sugestoes: ref.sugestoes })

  const c = ref.clients as {
    nome: string; objetivo: string | null; publico_alvo: string | null
    tom_de_voz: string | null; diferenciais: string | null; nicho: string
  }

  const briefing = [
    `Cliente: ${c.nome} (nicho: ${c.nicho})`,
    c.objetivo && `Objetivo: ${c.objetivo}`,
    c.publico_alvo && `Público-alvo: ${c.publico_alvo}`,
    c.tom_de_voz && `Tom de voz: ${c.tom_de_voz}`,
    c.diferenciais && `Diferenciais: ${c.diferenciais}`,
  ].filter(Boolean).join('\n')

  const prompt = `Você é um estrategista de conteúdo digital especializado em redes sociais.

BRIEFING DO CLIENTE:
${briefing}

TRANSCRIÇÃO DE CONTEÚDO DE REFERÊNCIA (${ref.plataforma?.toUpperCase() ?? 'MANUAL'}):
${ref.transcricao}

Com base nessa transcrição como referência e no perfil do cliente acima, crie 3 sugestões de conteúdo adaptadas para o cliente. Para cada sugestão forneça:

**Sugestão 1 — [Formato: Reels/Carrossel/Feed]**
📌 Tema:
🎯 Gancho (primeira frase):
📝 Roteiro resumido (3-5 pontos):
💬 Call to action:

**Sugestão 2 — [Formato: Reels/Carrossel/Feed]**
📌 Tema:
🎯 Gancho:
📝 Roteiro resumido:
💬 Call to action:

**Sugestão 3 — [Formato: Reels/Carrossel/Feed]**
📌 Tema:
🎯 Gancho:
📝 Roteiro resumido:
💬 Call to action:

Adapte o tom de voz, linguagem e abordagem para o perfil do cliente. Seja direto e prático — isso vai para a equipe de produção.`

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    })

    const groq = await groqRes.json() as {
      choices?: Array<{ message: { content: string } }>
      error?: { message: string }
    }

    if (!groqRes.ok || !groq.choices?.[0]) {
      throw new Error(groq.error?.message ?? 'Groq não retornou sugestões')
    }

    const sugestoes = groq.choices[0].message.content

    await supabase
      .from('referencias_laboratorio')
      .update({ sugestoes, updated_at: new Date().toISOString() })
      .eq('id', referencia_id)

    return NextResponse.json({ sugestoes })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
