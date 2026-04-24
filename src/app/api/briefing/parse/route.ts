import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  const { texto } = await req.json()

  if (!texto || typeof texto !== "string") {
    return NextResponse.json({ error: "Texto inválido" }, { status: 400 })
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Você é um especialista em marketing digital. A partir da narração abaixo (que pode ser uma conversa, perguntas e respostas, ou texto livre), organize as informações em um briefing estruturado para uma agência de marketing.

Crie um texto corrido organizado em seções com os tópicos relevantes que encontrar no texto. Use os títulos em negrito (ex: **Objetivo**, **Público-alvo**, **Tom de Voz**, **Serviços Contratados**, **Diferenciais**, **Observações Importantes**). Inclua apenas os tópicos que tiverem informação disponível. Seja direto e claro — isso vai ser lido pela equipe de produção de conteúdo.

Narração:
${texto}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return NextResponse.json({ briefing: text })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
