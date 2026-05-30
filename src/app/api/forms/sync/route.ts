import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { calcularScore, scoreLabel } from "@/lib/form-score"

const SHEET_ID = "1rQV8b7uol7GkHp6qvDgFXXxDy271dgZ5bJd5allzRds"

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim()); current = ""
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&range=A:S`
  const res = await fetch(url)
  if (!res.ok) return NextResponse.json({ error: "Erro ao buscar planilha" }, { status: 500 })

  const csv = await res.text()
  const lines = csv.split("\n").slice(1).filter((l) => l.trim())

  const admin = createAdminClient()
  let upserted = 0
  let errors = 0

  for (const line of lines) {
    const cols = parseCSVLine(line)
    const email = cols[4]?.toLowerCase()
    if (!email) continue

    const respostaData = {
      timestamp_resposta: cols[0] ? new Date(cols[0].replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1")).toISOString() : null,
      nome: cols[1] || null,
      whatsapp: cols[2] || null,
      instagram: cols[3] || null,
      email,
      ja_vende_plataforma: cols[5] || null,
      nicho: cols[6] || null,
      tipo_venda: cols[7] || null,
      faturamento: cols[8] || null,
      cria_videos: cols[9] || null,
      dificuldade_tiktok: cols[10] || null,
      dor_tiktok: cols[11] || null,
      nichos_que_vende: cols[12] || null,
      nivel_tecnico: cols[13] || null,
      executa_missoes: cols[14] || null,
      tempo_execucao: cols[15] || null,
      interesse_297: cols[16] || null,
      interesse_4500: cols[17] || null,
      mural_futuro: cols[18] || null,
    }

    const score = calcularScore(respostaData)

    // Upsert ou create aluno
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

    if (!aluno) { errors++; continue }

    const { error } = await admin
      .from("respostas_formulario")
      .upsert(
        { ...respostaData, aluno_id: aluno.id, score, updated_at: new Date().toISOString() },
        { onConflict: "email" }
      )

    if (error) errors++
    else upserted++
  }

  return NextResponse.json({ upserted, errors, total: lines.length })
}
