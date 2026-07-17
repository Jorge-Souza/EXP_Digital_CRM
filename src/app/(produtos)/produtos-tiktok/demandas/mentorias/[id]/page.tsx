import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Phone, MessageCircle, Calendar, DollarSign } from "lucide-react"
import type { Mentoria, MentoriaStatus } from "@/lib/types"
import { MentoriaDeleteButton } from "./delete-button"

const STATUS_COR: Record<MentoriaStatus, string> = {
  nao_agendada: "bg-gray-500/10 text-gray-500 border-gray-400/20",
  agendada:     "bg-blue-500/15 text-blue-600 border-blue-500/30",
  executada:    "bg-green-500/15 text-green-700 border-green-500/30",
  cancelada:    "bg-red-500/15 text-red-600 border-red-500/30",
}

const STATUS_LABEL: Record<MentoriaStatus, string> = {
  nao_agendada: "Não agendada",
  agendada: "Agendada",
  executada: "Executada",
  cancelada: "Cancelada",
}

export default async function MentoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/produtos-tiktok/alunos")

  const { data: mentoria } = await supabase.from("mentorias").select("*").eq("id", id).single()
  if (!mentoria) notFound()

  const m = mentoria as Mentoria

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/produtos-tiktok/demandas/mentorias" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{m.cliente_nome}</h1>
          <p className="text-muted-foreground text-sm">{m.tipo}</p>
        </div>
        <Link href={`/produtos-tiktok/demandas/mentorias/${id}/editar`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          Editar
        </Link>
        <MentoriaDeleteButton id={id} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Dados</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={STATUS_COR[m.status]}>{STATUS_LABEL[m.status]}</Badge>
            <Badge variant="outline" className={m.pago ? "bg-green-500/15 text-green-700 border-green-500/30" : "bg-yellow-500/15 text-yellow-700 border-yellow-500/30"}>
              {m.pago ? "Pago" : "Pendente"}
            </Badge>
          </div>

          {m.cliente_telefone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" /> {m.cliente_telefone}
            </div>
          )}
          {m.cliente_whatsapp && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageCircle className="h-4 w-4" /> {m.cliente_whatsapp} (WhatsApp)
            </div>
          )}
          {m.data_sessao && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(m.data_sessao + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              {m.hora_sessao && ` às ${m.hora_sessao.slice(0, 5)}`}
            </div>
          )}
          {m.valor != null && (
            <div className="flex items-center gap-2 font-semibold text-green-400">
              <DollarSign className="h-4 w-4" />
              {m.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
          )}
          {m.pago && m.local_pagamento && (
            <div className="text-muted-foreground">
              Pago via: <span className="text-foreground">{m.local_pagamento}</span>
            </div>
          )}
          {m.observacoes && (
            <div className="pt-2 border-t text-muted-foreground whitespace-pre-wrap">
              {m.observacoes}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
