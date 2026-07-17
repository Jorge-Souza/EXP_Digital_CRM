import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { GraduationCap, Plus, Kanban } from "lucide-react"
import type { Mentoria } from "@/lib/types"
import { MentoriasTable } from "./mentorias-table"

export const dynamic = "force-dynamic"

export default async function MentoriasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/produtos-tiktok/alunos")

  const admin = createAdminClient()
  const { data: mentorias } = await admin
    .from("mentorias")
    .select("*")
    .order("created_at", { ascending: false })

  const lista = (mentorias ?? []) as Mentoria[]
  const totais = {
    total: lista.length,
    naoAgendadas: lista.filter(m => m.status === "nao_agendada").length,
    agendadas: lista.filter(m => m.status === "agendada").length,
    executadas: lista.filter(m => m.status === "executada").length,
    aReceber: lista.filter(m => !m.pago).reduce((s, m) => s + (m.valor ?? 0), 0),
    recebido: lista.filter(m => m.pago).reduce((s, m) => s + (m.valor ?? 0), 0),
  }
  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #EC4899, #8B5CF6)" }}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mentorias / Assessorias Avulsas</h1>
            <p className="text-sm text-muted-foreground">{totais.total} registro(s) cadastrado(s)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/produtos-tiktok/demandas" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Kanban className="mr-2 h-4 w-4" />
            Demandas
          </Link>
          <Link href="/produtos-tiktok/demandas/mentorias/novo" className={buttonVariants({ size: "sm" })}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Mentoria
          </Link>
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total</p>
            <p className="text-2xl font-bold text-purple-600">{totais.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Não agendadas</p>
            <p className="text-2xl font-bold text-gray-500">{totais.naoAgendadas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Agendadas</p>
            <p className="text-2xl font-bold text-blue-600">{totais.agendadas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Executadas</p>
            <p className="text-2xl font-bold text-green-600">{totais.executadas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">A receber / Recebido</p>
            <p className="text-lg font-bold text-orange-600">{fmt(totais.aReceber)}</p>
            <p className="text-xs text-green-600">{fmt(totais.recebido)} recebido</p>
          </CardContent>
        </Card>
      </div>

      <MentoriasTable mentorias={lista} />
    </div>
  )
}
