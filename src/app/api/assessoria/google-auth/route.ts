import { NextRequest } from "next/server"
import { google } from "googleapis"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? ""
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? ""
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export async function GET(_req: NextRequest) {
  const oauth2 = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `${APP_URL}/api/assessoria/google-callback`
  )

  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
  })

  return Response.redirect(url)
}
