import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const EXCLUDED = ['Trezentos WTC']

export async function POST() {
  const scriptUrl = process.env.APPS_SCRIPT_URL
  if (!scriptUrl) {
    return NextResponse.json({ error: 'APPS_SCRIPT_URL não configurada' }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, nome, drive_folder_url')
    .order('nome')

  if (error || !clients) {
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 })
  }

  const targets = clients.filter((c) => !EXCLUDED.includes(c.nome))

  const results: { nome: string; success: boolean; folderUrl?: string; error?: string }[] = []

  for (const client of targets) {
    try {
      const res = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName: client.nome }),
      })
      const data = await res.json()
      if (data.success && data.folderUrl) {
        await supabase
          .from('clients')
          .update({ drive_folder_url: data.folderUrl })
          .eq('id', client.id)
        results.push({ nome: client.nome, success: true, folderUrl: data.folderUrl })
      } else {
        results.push({ nome: client.nome, success: false, error: data.error ?? 'Sem retorno' })
      }
    } catch (e) {
      results.push({ nome: client.nome, success: false, error: String(e) })
    }
  }

  return NextResponse.json({ results })
}
