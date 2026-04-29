import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(req: Request) {
  const { texto, cliente_nome, nicho } = await req.json() as {
    texto: string
    cliente_nome?: string
    nicho?: string
  }

  if (!texto) return NextResponse.json({ error: 'Texto obrigatório' }, { status: 400 })

  const contexto = [
    cliente_nome && `Cliente: ${cliente_nome}`,
    nicho && `Nicho: ${nicho}`,
  ].filter(Boolean).join(' | ')

  const prompt = `Você é um especialista em marketing digital e psicologia do consumidor.

${contexto ? `CONTEXTO: ${contexto}\n` : ''}
A partir da descrição abaixo sobre o cliente/persona ideal, crie um documento de persona detalhado e estratégico para a equipe de produção de conteúdo.

DESCRIÇÃO:
${texto}

Crie o documento no seguinte formato exato:

👤 PERFIL
[Nome fictício, idade, profissão, cidade, estado civil, escolaridade, renda aproximada]

🎯 OBJETIVOS
[O que essa persona quer alcançar — profissional e pessoalmente]

😩 BARREIRAS E OBJEÇÕES
[O que impede ela de agir. Medos, dúvidas, experiências ruins anteriores]

🔥 5 DORES LATENTES (com a voz dela)
1. [Dor 1] "Quote em primeira pessoa"
2. [Dor 2] "Quote em primeira pessoa"
3. [Dor 3] "Quote em primeira pessoa"
4. [Dor 4] "Quote em primeira pessoa"
5. [Dor 5] "Quote em primeira pessoa"

💎 5 DESEJOS PROFUNDOS (com a voz dela)
1. [Desejo 1] "Quote em primeira pessoa"
2. [Desejo 2] "Quote em primeira pessoa"
3. [Desejo 3] "Quote em primeira pessoa"
4. [Desejo 4] "Quote em primeira pessoa"
5. [Desejo 5] "Quote em primeira pessoa"

🛒 GATILHO DA COMPRA
[O que faz essa persona decidir agir — o momento ou situação que gera urgência]

✅ CRITÉRIOS DE DECISÃO
[O que ela analisa antes de comprar: preço, prova social, autoridade, garantia, facilidade, resultado rápido...]

📱 ONDE ELA ESTÁ
[Quais redes sociais usa, que tipo de conteúdo consome, influenciadores que segue, horários]

💬 COMO FALAR COM ELA
[Tom de voz ideal, palavras que ressoam, abordagens que funcionam, o que evitar]

Seja específico, humano e estratégico. Use linguagem que a equipe de conteúdo consiga aplicar direto na produção.`

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
    const msg = groq.error?.message ?? 'Erro ao gerar persona'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({ persona: groq.choices[0].message.content })
}
