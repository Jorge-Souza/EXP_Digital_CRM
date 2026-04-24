import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { PlanejamentoEditor } from "@/components/planejamento-editor"
import { gerarDatasDoMes } from "@/lib/holidays"
import type { Client, Planejamento, Post } from "@/lib/types"

export default async function PlanejamentoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mes?: string }>
}) {
  const { id } = await params
  const { mes: mesParam } = await searchParams

  const now = new Date()
  const mes = mesParam ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const [year, month] = mes.split("-").map(Number)
  const mesIndex = month - 1 // 0-based

  const supabase = await createClient()

  const [{ data: clientData }, { data: postsData }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase
      .from("posts")
      .select("*")
      .eq("client_id", id)
      .gte("data_publicacao", `${mes}-01`)
      .lte("data_publicacao", `${mes}-31`)
      .order("data_publicacao", { ascending: true }),
  ])

  if (!clientData) notFound()
  const client = clientData as Client
  const posts = (postsData ?? []) as Post[]

  // Carrega ou cria o planejamento do mês
  let { data: planData } = await supabase
    .from("planejamentos")
    .select("*")
    .eq("client_id", id)
    .eq("mes", mes)
    .maybeSingle()

  if (!planData) {
    const datas = gerarDatasDoMes(year, mesIndex, client.nicho ?? "marketing digital")
    const { data: created } = await supabase
      .from("planejamentos")
      .insert({ client_id: id, mes, datas_comemorativas: datas })
      .select()
      .single()
    planData = created
  }

  if (!planData) notFound()
  const planejamento = planData as Planejamento

  const mesLabel = new Date(year, mesIndex, 1).toLocaleString("pt-BR", {
    month: "long", year: "numeric",
  })

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/clientes/${id}/projeto`} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h1 className="text-xl font-bold">Planejamento de Conteúdo</h1>
            </div>
            <p className="text-muted-foreground text-sm capitalize">{client.nome} · {mesLabel}</p>
          </div>
        </div>
        <Link href={`/clientes/${id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Ver Perfil
        </Link>
      </div>

      <PlanejamentoEditor
        planejamento={planejamento}
        client={client}
        posts={posts}
        mes={mes}
      />
    </div>
  )
}
