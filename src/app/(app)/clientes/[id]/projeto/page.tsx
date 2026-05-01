import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil, CalendarRange } from "lucide-react"
import Link from "next/link"
import { StatsSection } from "@/components/stats-section"
import { ProjetoView } from "@/components/projeto-view"
import type { Client, Post, Profile, ReferenciaLaboratorio } from "@/lib/types"
import { FileText } from "lucide-react"

const clientStatusConfig = {
  ativo:   { label: "Ativo",     variant: "default" as const },
  inativo: { label: "Cancelado", variant: "destructive" as const },
  pausado: { label: "Pausado",   variant: "secondary" as const },
}

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleString("pt-BR", { month: "long", year: "numeric" })
}

export default async function ProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: isAdminData } = await supabase.rpc("current_user_is_admin")
  const isAdmin = isAdminData === true

  const [{ data: client }, { data: posts }, { data: refsLab }, { data: profiles }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase.from("posts").select("*").eq("client_id", id).order("data_publicacao", { ascending: true }),
    supabase.from("referencias_laboratorio").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    adminClient.from("profiles").select("id, nome").eq("status", "ativo").order("nome"),
  ])

  if (!client) notFound()

  const c = client as Client
  const allPosts = (posts ?? []) as Post[]

  // Signed URL do contrato (admin only)
  let contratoDownloadUrl: string | null = null
  if (isAdmin && c.contrato_path) {
    const { data: signed } = await adminClient.storage
      .from("contratos")
      .createSignedUrl(c.contrato_path, 60 * 60)
    contratoDownloadUrl = signed?.signedUrl ?? null
  }
  const s = clientStatusConfig[c.status]

  const now = new Date()
  const cy = now.getFullYear()
  const cm = now.getMonth()
  const ny = cm === 11 ? cy + 1 : cy
  const nm = cm === 11 ? 0 : cm + 1

  const currentMonthPosts = allPosts.filter((p) => {
    if (!p.data_publicacao) return false
    const d = new Date(p.data_publicacao + "T00:00:00")
    return d.getFullYear() === cy && d.getMonth() === cm
  })

  const nextMonthPosts = allPosts.filter((p) => {
    if (!p.data_publicacao) return false
    const d = new Date(p.data_publicacao + "T00:00:00")
    return d.getFullYear() === ny && d.getMonth() === nm
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/clientes" className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{c.nome}</h1>
              <Badge variant={s.variant}>{s.label}</Badge>
            </div>
            <p className="text-muted-foreground text-sm">{c.nicho || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/clientes/${id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Ver Perfil
          </Link>
          <Link href={`/clientes/${id}/planejamento`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <CalendarRange className="mr-1.5 h-3.5 w-3.5" />
            Planejamento
          </Link>
          <Link href={`/clientes/${id}/editar`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Editar
          </Link>
        </div>
      </div>

      {/* Stats colapsável */}
      <StatsSection
        currentTitle={monthLabel(cy, cm)}
        currentPosts={currentMonthPosts}
        nextTitle={monthLabel(ny, nm)}
        nextPosts={nextMonthPosts}
        metaMensal={c.posts_mensais}
        metaSemanal={c.meta_posts_semana}
      />

      {/* Lista ou Calendário */}
      <ProjetoView
        clientId={id}
        clientNome={c.nome}
        posts={allPosts}
        initialRefs={(refsLab ?? []) as ReferenciaLaboratorio[]}
        profiles={(profiles ?? []) as Pick<Profile, "id" | "nome">[]}
        isAdmin={isAdmin}
        contrato={{
          nome: c.contrato_nome ?? null,
          inicio: c.contrato_inicio ?? null,
          duracaoMeses: c.contrato_duracao_meses ?? null,
          downloadUrl: contratoDownloadUrl,
        }}
      />
    </div>
  )
}
