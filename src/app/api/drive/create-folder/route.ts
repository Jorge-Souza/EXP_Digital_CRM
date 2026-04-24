import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { clientName } = await request.json()

  if (!clientName) {
    return NextResponse.json({ error: 'clientName obrigatório' }, { status: 400 })
  }

  const scriptUrl = process.env.APPS_SCRIPT_URL
  if (!scriptUrl) {
    return NextResponse.json({ error: 'APPS_SCRIPT_URL não configurada' }, { status: 500 })
  }

  const response = await fetch(scriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientName }),
  })

  const data = await response.json()

  if (!data.success) {
    return NextResponse.json({ error: data.error ?? 'Erro ao criar pasta' }, { status: 500 })
  }

  return NextResponse.json({ folderUrl: data.folderUrl })
}
