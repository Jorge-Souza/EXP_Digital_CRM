import { NextResponse } from "next/server"

export const maxDuration = 60

export async function POST(req: Request) {
  const { texto } = await req.json()

  if (!texto || typeof texto !== "string") {
    return NextResponse.json({ error: "Texto inválido" }, { status: 400 })
  }

  const prompt = `Você é um especialista em marketing digital. A partir da narração abaixo (que pode ser uma conversa, perguntas e respostas, ou texto livre), organize as informações em um briefing estruturado para uma agência de marketing.

Crie um texto corrido organizado em seções com os tópicos relevantes que encontrar no texto. Use os títulos em negrito (ex: **Objetivo**, **Público-alvo**, **Tom de Voz**, **Serviços Contratados**, **Diferenciais**, **Observações Importantes**). Inclua apenas os tópicos que tiverem informação disponível. Seja direto e claro — isso vai ser lido pela equipe de produção de conteúdo.

Narração:
${texto}`

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.5,
    }),
  })

  const groq = await res.json() as {
    choices?: Array<{ message: { content: string } }>
    error?: { message: string }
  }

  if (!res.ok || !groq.choices?.[0]) {
    const msg = groq.error?.message ?? "Erro ao gerar briefing"
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({ briefing: groq.choices[0].message.content })
}
