import { NextRequest } from "next/server"
import { google } from "googleapis"
import { createClient } from "@/lib/supabase/server"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? ""
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? ""
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  if (!code) return Response.redirect(`${APP_URL}/assessoria?erro=sem_codigo`)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.redirect(`${APP_URL}/login`)

  try {
    const oauth2 = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      `${APP_URL}/api/assessoria/google-callback`
    )
    const { tokens } = await oauth2.getToken(code)

    await supabase.from("google_calendar_tokens").upsert({
      user_id: user.id,
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token ?? null,
      token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" })

    return Response.redirect(`${APP_URL}/assessoria?google=conectado`)
  } catch (err) {
    console.error("Google OAuth error:", err)
    return Response.redirect(`${APP_URL}/assessoria?erro=oauth`)
  }
}
