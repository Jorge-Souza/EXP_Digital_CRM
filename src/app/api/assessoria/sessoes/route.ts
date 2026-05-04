import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { google } from "googleapis"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? ""
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? ""

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 })

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) return Response.json({ error: "Sem permissão" }, { status: 403 })

  const body = await req.json()
  const { assessorado_id, titulo, data_sessao, duracao_minutos, descricao, link_reuniao, sincronizar_google, assessorado_nome } = body

  let google_event_id: string | null = null
  let google_event_link: string | null = null

  // Sincronizar com Google Calendar se solicitado
  if (sincronizar_google) {
    const { data: tokenData } = await supabase
      .from("google_calendar_tokens")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (tokenData) {
      try {
        const oauth2 = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
        oauth2.setCredentials({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
        })

        // Refresh token se expirado
        if (tokenData.token_expiry && new Date(tokenData.token_expiry) < new Date()) {
          const { credentials } = await oauth2.refreshAccessToken()
          await supabase.from("google_calendar_tokens").update({
            access_token: credentials.access_token,
            token_expiry: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : null,
          }).eq("user_id", user.id)
          oauth2.setCredentials(credentials)
        }

        const calendar = google.calendar({ version: "v3", auth: oauth2 })
        const startTime = new Date(data_sessao)
        const endTime = new Date(startTime.getTime() + duracao_minutos * 60000)

        const event = await calendar.events.insert({
          calendarId: tokenData.calendar_id ?? "primary",
          requestBody: {
            summary: `${titulo} — ${assessorado_nome}`,
            description: descricao ?? `Sessão de Assessoria TikTok Shop\nAssessorado: ${assessorado_nome}`,
            start: { dateTime: startTime.toISOString(), timeZone: "America/Sao_Paulo" },
            end: { dateTime: endTime.toISOString(), timeZone: "America/Sao_Paulo" },
            ...(link_reuniao ? { location: link_reuniao } : {}),
          },
        })
        google_event_id = event.data.id ?? null
        google_event_link = event.data.htmlLink ?? null
      } catch (err) {
        console.error("Google Calendar error:", err)
      }
    }
  }

  const { data, error } = await supabase
    .from("sessoes_assessoria")
    .insert({
      assessorado_id,
      titulo,
      data_sessao,
      duracao_minutos: duracao_minutos ?? 60,
      descricao: descricao ?? null,
      link_reuniao: link_reuniao ?? null,
      google_event_id,
      google_event_link,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ...data, google_event_link }, { status: 201 })
}
