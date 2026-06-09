import React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { ClipboardList, ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

type Habilitacao = {
  id: string
  email: string
  nome_empresa: string | null
  status: string | null
  etapa_atual: number | null
  created_at: string
  termos_aceitos_at: string | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  enviado:    { label: "Enviado",    color: "#34D399", bg: "rgba(52,211,153,0.1)",    icon: <CheckCircle2 size={14} /> },
  em_analise: { label: "Em análise", color: "#FBBF24", bg: "rgba(251,191,36,0.1)",   icon: <Clock size={14} /> },
  aprovado:   { label: "Aprovado",   color: "#34D399", bg: "rgba(52,211,153,0.1)",   icon: <CheckCircle2 size={14} /> },
  reprovado:  { label: "Reprovado",  color: "#F87171", bg: "rgba(248,113,113,0.1)",  icon: <XCircle size={14} /> },
  pendente:   { label: "Pendente",   color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.06)", icon: <AlertCircle size={14} /> },
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export default async function HabilitacoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/hub")

  const admin = createAdminClient()
  const { data: habs } = await admin
    .from("habilitacoes")
    .select("id, email, nome_empresa, status, etapa_atual, created_at, termos_aceitos_at")
    .order("created_at", { ascending: false })

  const lista = (habs ?? []) as Habilitacao[]

  const totais = {
    total: lista.length,
    enviados: lista.filter(h => h.status === "enviado" || h.status === "aprovado").length,
    pendentes: lista.filter(h => !h.status || h.status === "pendente").length,
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #EC4899, #8B5CF6)" }}>
          <ClipboardList className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Habilitações</h1>
          <p className="text-sm text-white/40">Cadastros de clientes para TikTok Shop</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", value: totais.total, color: "#8B5CF6" },
          { label: "Enviados", value: totais.enviados, color: "#34D399" },
          { label: "Pendentes", value: totais.pendentes, color: "#FBBF24" },
        ].map(c => (
          <div key={c.label} className="rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">{c.label}</p>
            <p className="text-3xl font-bold" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="grid grid-cols-[1fr_160px_100px_80px_36px] gap-4 px-4 py-3 text-xs font-semibold text-white/30 uppercase tracking-wider"
          style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span>Cliente / Empresa</span>
          <span>Data</span>
          <span>Etapa</span>
          <span>Status</span>
          <span />
        </div>

        {lista.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-white/30">
            <ClipboardList size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Nenhuma habilitação registrada ainda.</p>
          </div>
        )}

        {lista.map((h, i) => {
          const statusKey = h.status ?? "pendente"
          const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.pendente
          return (
            <Link key={h.id} href={`/produtos-tiktok/habilitacoes/${h.id}`}
              className="grid grid-cols-[1fr_160px_100px_80px_36px] gap-4 px-4 py-4 items-center hover:bg-white/5 transition-colors"
              style={{ borderBottom: i < lista.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div className="min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {h.nome_empresa ?? <span className="text-white/30 italic">Empresa não preenchida</span>}
                </p>
                <p className="text-white/40 text-xs truncate">{h.email}</p>
              </div>
              <p className="text-white/50 text-sm">{fmt(h.created_at)}</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-1.5 flex-1 rounded-full"
                    style={{
                      background: (h.etapa_atual ?? 0) >= n
                        ? "linear-gradient(90deg,#EC4899,#8B5CF6)"
                        : "rgba(255,255,255,0.1)",
                    }} />
                ))}
                <span className="text-white/30 text-xs ml-1">{h.etapa_atual ?? 0}/3</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold w-fit"
                style={{ color: cfg.color, background: cfg.bg }}>
                {cfg.icon}
                <span>{cfg.label}</span>
              </div>
              <ChevronRight size={16} className="text-white/20" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
