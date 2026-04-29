import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Statuses que indicam que o post ainda não entrou em produção real
const STATUS_RISCO = ["planejado", "a_fazer", "falta_insumo"]

export async function GET(req: Request) {
  // Valida o secret do Vercel Cron
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const admin = createAdminClient()
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const em3dias = new Date(hoje)
  em3dias.setDate(hoje.getDate() + 3)

  // Busca posts com data de publicação entre hoje e 3 dias, em status de risco
  const { data: posts, error } = await admin
    .from("posts")
    .select("id, titulo, status, data_publicacao, responsavel_id, client_id, clients(nome)")
    .in("status", STATUS_RISCO)
    .gte("data_publicacao", hoje.toISOString().split("T")[0])
    .lte("data_publicacao", em3dias.toISOString().split("T")[0])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!posts || posts.length === 0) return NextResponse.json({ ok: true, notificados: 0 })

  // Busca admins
  const { data: admins } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "admin")

  const adminIds: string[] = admins?.map((a) => a.id) ?? []

  let notificados = 0

  for (const post of posts) {
    const pubDate = new Date(post.data_publicacao + "T00:00:00")
    const diasRestantes = Math.ceil((pubDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    const clientRaw = post.clients as unknown
    const clientNome = (Array.isArray(clientRaw) ? (clientRaw[0] as { nome: string } | undefined)?.nome : (clientRaw as { nome: string } | null)?.nome) ?? ""

    // Urgente: hoje ou amanhã com qualquer status de risco
    // Atenção: 2-3 dias e ainda em planejado/a_fazer
    const isUrgente = diasRestantes <= 1
    const isAtencao = diasRestantes <= 3 && ["planejado", "a_fazer"].includes(post.status)

    if (!isUrgente && !isAtencao) continue

    const emoji = isUrgente ? "🔴" : "🟡"
    const prazo = diasRestantes === 0 ? "hoje" : diasRestantes === 1 ? "amanhã" : `em ${diasRestantes} dias`
    const titulo = `${emoji} Risco de entrega — publicação ${prazo}`
    const mensagem = `"${post.titulo}" (${clientNome}) está como "${post.status}" e precisa ser publicado ${prazo}`

    // Verifica se já foi notificado hoje para esse post (evita duplicatas no mesmo dia)
    const { data: jaNotificado } = await admin
      .from("notifications")
      .select("id")
      .eq("post_id", post.id)
      .gte("created_at", hoje.toISOString())
      .limit(1)
      .maybeSingle()

    if (jaNotificado) continue

    // Destinatários: responsável + admins (sem duplicar)
    const destinatarios = new Set<string>(adminIds)
    if (post.responsavel_id) destinatarios.add(post.responsavel_id)

    for (const userId of destinatarios) {
      await admin.from("notifications").insert({
        user_id: userId,
        titulo,
        mensagem,
        link: "/publicacoes",
        post_id: post.id,
      })
      notificados++
    }
  }

  return NextResponse.json({ ok: true, notificados })
}
