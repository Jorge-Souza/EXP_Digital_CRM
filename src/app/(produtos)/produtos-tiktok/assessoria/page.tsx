import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { AssessoriaCliente, AssessoriaLoja } from "@/lib/types"
import { AssessoriaApp } from "./assessoria-app"

export const dynamic = "force-dynamic"

export default async function AssessoriaTiktokPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/produtos-tiktok/alunos")

  const [{ data: clientes }, { data: lojas }] = await Promise.all([
    supabase.from("tiktok_assessoria_clientes").select("*").order("created_at"),
    supabase.from("tiktok_assessoria_lojas").select("*").order("created_at"),
  ])

  const lojasPorCliente = new Map<string, AssessoriaLoja[]>()
  for (const loja of (lojas ?? []) as AssessoriaLoja[]) {
    const lista = lojasPorCliente.get(loja.cliente_id) ?? []
    lista.push(loja)
    lojasPorCliente.set(loja.cliente_id, lista)
  }

  const clientesComLojas = ((clientes ?? []) as AssessoriaCliente[]).map((c) => ({
    ...c,
    lojas: lojasPorCliente.get(c.id) ?? [],
  }))

  return <AssessoriaApp clientesIniciais={clientesComLojas} />
}
