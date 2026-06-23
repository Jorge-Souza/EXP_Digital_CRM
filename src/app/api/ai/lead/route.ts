import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

async function assertAcesso() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const [{ data: isAdmin }, { data: isVendas }] = await Promise.all([
    supabase.rpc("current_user_is_admin"),
    supabase.rpc("current_user_is_vendas"),
  ])
  return isAdmin === true || isVendas === true
}

const PROMPTS: Record<string, string> = {
  resumir: "Resuma o histórico desse lead em até 5 linhas, destacando o estágio atual do funil, principais interações e o que já foi oferecido.",
  abordagem_whatsapp: "Escreva uma mensagem curta e natural de WhatsApp para reabordar esse lead, considerando o histórico abaixo. Tom direto, sem parecer script de vendas, com um único CTA claro.",
  identificar_objecao: "Com base no histórico abaixo, identifique a principal objeção (ou hipótese de objeção) desse lead para avançar na compra, e explique por quê.",
  proxima_acao: "Com base no histórico abaixo, sugira a próxima ação concreta que o SDR deve tomar com esse lead (ex: ligar, mandar áudio, oferecer X), em 1-2 frases.",
  sugerir_produto: "Com base no histórico, perfil e compras abaixo, sugira qual produto (Curso, SOS TikTok Shop, Mentoria ou Assessoria) é o ideal para a ascensão comercial desse lead agora, e justifique brevemente.",
}

export async function POST(req: Request) {
  if (!await assertAcesso()) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { alunoId, acao } = await req.json() as { alunoId: string; acao: string }
  const prompt = PROMPTS[acao]
  if (!alunoId || !prompt) return NextResponse.json({ error: "Ação inválida" }, { status: 400 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada no ambiente" }, { status: 500 })
  }

  const admin = createAdminClient()
  const [{ data: aluno }, { data: interacoes }, { data: compras }, { data: notas }] = await Promise.all([
    admin.from("alunos").select("nome, email, etapa_pipeline, origem, tipo_lead, score_comercial, proxima_melhor_oferta").eq("id", alunoId).single(),
    admin.from("interacoes_comerciais").select("tipo, resumo, proximo_passo, data").eq("aluno_id", alunoId).order("data", { ascending: false }).limit(20),
    admin.from("compras_alunos").select("status, valor, data_compra, produtos_tiktok(nome, tipo)").eq("aluno_id", alunoId),
    admin.from("notas_alunos").select("texto, created_at").eq("aluno_id", alunoId).order("created_at", { ascending: false }).limit(10),
  ])

  if (!aluno) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 })

  const contexto = `
Lead: ${aluno.nome} (${aluno.email})
Etapa do pipeline: ${aluno.etapa_pipeline}
Origem: ${aluno.origem} | Tipo: ${aluno.tipo_lead ?? "não classificado"}
Score comercial: ${aluno.score_comercial}
Próxima oferta sugerida: ${aluno.proxima_melhor_oferta ?? "nenhuma ainda"}

Compras:
${(compras ?? []).map(c => `- ${(c.produtos_tiktok as unknown as { nome: string } | null)?.nome ?? "produto removido"} (${c.status}) em ${c.data_compra}`).join("\n") || "Nenhuma compra."}

Histórico de interações (mais recentes primeiro):
${(interacoes ?? []).map(i => `- [${i.tipo}] ${i.resumo ?? ""} ${i.proximo_passo ? `(próximo passo: ${i.proximo_passo})` : ""}`).join("\n") || "Nenhuma interação registrada."}

Notas internas:
${(notas ?? []).map(n => `- ${n.texto}`).join("\n") || "Nenhuma nota."}
`.trim()

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    messages: [{
      role: "user",
      content: `${prompt}\n\nContexto do lead:\n${contexto}`,
    }],
  })

  const textBlock = message.content.find((b): b is Anthropic.TextBlock => b.type === "text")
  const texto = textBlock?.text ?? ""
  return NextResponse.json({ texto })
}
