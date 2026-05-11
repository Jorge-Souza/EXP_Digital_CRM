import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const { clientName, clientId } = await request.json()

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

  // Salva a URL de volta no cliente se clientId foi fornecido
  if (clientId && data.folderUrl) {
    const supabase = createAdminClient()
    await supabase
      .from('clients')
      .update({ drive_folder_url: data.folderUrl })
      .eq('id', clientId)
  }

  return NextResponse.json({ folderUrl: data.folderUrl })
}
