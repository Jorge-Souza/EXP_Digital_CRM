import { NextResponse } from "next/server"
import { syncKiwify, syncHotmart } from "@/lib/financeiro/sync"

export const maxDuration = 300

// Sync diário das vendas e saques (Kiwify + Hotmart). ?desde=AAAA-MM-DD refaz o histórico.
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  const url = new URL(req.url)
  const desdeParam = url.searchParams.get("desde")
  const desde = desdeParam ? new Date(`${desdeParam}T00:00:00-03:00`) : new Date(Date.now() - 60 * 86_400_000)
  if (Number.isNaN(desde.getTime())) return NextResponse.json({ error: "desde inválido" }, { status: 400 })

  const resultado: Record<string, unknown> = {}
  for (const [nome, fn] of [["kiwify", syncKiwify], ["hotmart", syncHotmart]] as const) {
    try {
      resultado[nome] = await fn(desde)
    } catch (e) {
      resultado[nome] = { erro: e instanceof Error ? e.message : String(e) }
    }
  }
  return NextResponse.json({ desde: desde.toISOString(), ...resultado })
}
