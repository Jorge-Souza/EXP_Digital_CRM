import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { calcularScore, scoreLabel } from "@/lib/form-score"

// Called by Google Apps Script on each new form submission
// Payload: { secret, timestamp, nome, whatsapp, instagram, email, ...fields }
export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null)
  if (!payload) return NextResponse.json({ error: "Payload inválido" }, { status: 400 })

  const secret = process.env.GOOGLE_FORMS_WEBHOOK_SECRET
  if (secret && payload.secret !== secret) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const email = payload.email?.toLowerCase()
  if (!email) return NextResponse.json({ error: "Email obrigatório" }, { status: 400 })

  const respostaData = {
    timestamp_resposta: payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString(),
    nome: payload.nome || null,
    whatsapp: payload.whatsapp || null,
    instagram: payload.instagram || null,
    email,
    ja_vende_plataforma: payload.ja_vende_plataforma || null,
    nicho: payload.nicho || null,
    tipo_venda: payload.tipo_venda || null,
    faturamento: payload.faturamento || null,
    cria_videos: payload.cria_videos || null,
    dificuldade_tiktok: payload.dificuldade_tiktok || null,
    dor_tiktok: payload.dor_tiktok || null,
    nichos_que_vende: payload.nichos_que_vende || null,
    nivel_tecnico: payload.nivel_tecnico || null,
    executa_missoes: payload.executa_missoes || null,
    tempo_execucao: payload.tempo_execucao || null,
    interesse_297: payload.interesse_297 || null,
    interesse_4500: payload.interesse_4500 || null,
    mural_futuro: payload.mural_futuro || null,
  }

  const score = calcularScore(respostaData)
  const admin = createAdminClient()

  const { data: aluno } = await admin
    .from("alunos")
    .upsert(
      {
        nome: respostaData.nome || email,
        email,
        telefone: respostaData.whatsapp || null,
        whatsapp: respostaData.whatsapp || null,
        instagram: respostaData.instagram || null,
        score,
        score_label: scoreLabel(score, true),
        tem_formulario: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    )
    .select("id")
    .single()

  if (!aluno) return NextResponse.json({ error: "Erro ao salvar aluno" }, { status: 500 })

  await admin
    .from("respostas_formulario")
    .upsert(
      { ...respostaData, aluno_id: aluno.id, score, updated_at: new Date().toISOString() },
      { onConflict: "email" }
    )

  return NextResponse.json({ ok: true, aluno_id: aluno.id, score })
}
