"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { AssessoriaCliente, AssessoriaLoja } from "@/lib/types"
import { PILLARS, mergeSituations } from "@/lib/assessoria-catalog"
import { ClienteLojaPanel } from "@/components/assessoria/cliente-loja-panel"

type ClienteComLojas = AssessoriaCliente & { lojas: AssessoriaLoja[] }

interface Props {
  clientesIniciais: ClienteComLojas[]
}

function progressoPct(cliente: ClienteComLojas): number {
  let ativos = 0
  let enviados = 0
  for (const loja of cliente.lojas) {
    const merged = mergeSituations(loja.situations)
    for (const pilar of PILLARS) {
      for (const s of merged[pilar.id]) {
        if (s.active) {
          ativos++
          if (s.sent) enviados++
        }
      }
    }
  }
  return ativos === 0 ? 0 : Math.round((enviados / ativos) * 100)
}

export function AssessoriaApp({ clientesIniciais }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [clientes, setClientes] = useState<ClienteComLojas[]>(clientesIniciais)
  const [activeId, setActiveId] = useState<string | null>(clientesIniciais[0]?.id ?? null)
  const [nome, setNome] = useState("")
  const [nicho, setNicho] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [criando, setCriando] = useState(false)

  const clienteAtivo = clientes.find((c) => c.id === activeId) ?? null

  async function addClient() {
    const nomeTrim = nome.trim()
    if (!nomeTrim) return
    setCriando(true)
    const { data, error } = await supabase
      .from("tiktok_assessoria_clientes")
      .insert({ nome: nomeTrim, nicho: nicho.trim() || null, whatsapp: whatsapp.trim() || null })
      .select()
      .single()
    setCriando(false)
    if (error || !data) {
      toast.error("Erro ao adicionar assessorado")
      return
    }
    const novo: ClienteComLojas = { ...(data as AssessoriaCliente), lojas: [] }
    setClientes((prev) => [...prev, novo])
    setActiveId(novo.id)
    setNome("")
    setNicho("")
    setWhatsapp("")
  }

  async function deleteClient(id: string) {
    if (!confirm("Remover este assessorado do painel? Isso apaga o histórico salvo dele.")) return
    const { error } = await supabase.from("tiktok_assessoria_clientes").delete().eq("id", id)
    if (error) {
      toast.error("Erro ao remover assessorado")
      return
    }
    setClientes((prev) => prev.filter((c) => c.id !== id))
    setActiveId((cur) => (cur === id ? null : cur))
  }

  return (
    <div className="bg-[#010101] text-[#F5F5F5] flex fixed inset-0 z-50">
      {/* Sidebar */}
      <div className="w-[290px] shrink-0 bg-[#141414] border-r border-[#2b2b2b] p-5 flex flex-col gap-4 overflow-y-auto">
        <div>
          <Link href="/produtos-tiktok" className="flex items-center gap-1.5 text-[11px] text-[#8a8a8a] hover:text-white mb-3">
            <ArrowLeft className="h-3 w-3" /> Voltar ao CRM
          </Link>
          <h1 className="text-sm font-extrabold uppercase tracking-wide">
            EXP <span className="text-[#FE2C55]">·</span> Assessoria<span className="text-[#25F4EE]">.</span>
          </h1>
          <p className="text-[11px] text-[#8a8a8a] mt-1">Jornada TikTok Shop por assessorado</p>
        </div>

        <div className="bg-[#1c1c1c] border border-[#2b2b2b] rounded-lg p-3 flex flex-col gap-2">
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do assessorado"
            className="bg-black border border-[#2b2b2b] text-[#F5F5F5] px-2.5 py-2 rounded-md text-[13px] outline-none focus:border-[#25F4EE]"
          />
          <input
            type="text"
            value={nicho}
            onChange={(e) => setNicho(e.target.value)}
            placeholder="Nicho / segmento (ex: moda feminina)"
            className="bg-black border border-[#2b2b2b] text-[#F5F5F5] px-2.5 py-2 rounded-md text-[13px] outline-none focus:border-[#25F4EE]"
          />
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="WhatsApp (ex: 11999998888)"
            className="bg-black border border-[#2b2b2b] text-[#F5F5F5] px-2.5 py-2 rounded-md text-[13px] outline-none focus:border-[#25F4EE]"
          />
          <button
            type="button"
            disabled={criando}
            onClick={addClient}
            className="bg-[#FE2C55] text-white text-xs font-bold uppercase tracking-wide px-3 py-2.5 rounded-md disabled:opacity-50"
          >
            + Adicionar assessorado
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-1.5">
          {clientes.length === 0 ? (
            <p className="text-[#8a8a8a] text-xs text-center py-5">Nenhum assessorado cadastrado ainda.</p>
          ) : (
            clientes.map((c) => {
              const pct = progressoPct(c)
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={`text-left bg-[#1c1c1c] border rounded-lg px-3 py-2.5 transition-colors ${
                    c.id === activeId ? "border-[#25F4EE] bg-[#132022]" : "border-[#2b2b2b] hover:border-[#8a8a8a]"
                  }`}
                >
                  <div className="text-[13.5px] font-bold">{c.nome}</div>
                  <div className="text-[11px] text-[#8a8a8a] mt-0.5">{c.nicho || "sem nicho definido"}</div>
                  <div className="text-[10.5px] text-[#8a8a8a] mt-0.5">
                    {c.lojas.length} loja{c.lojas.length !== 1 ? "s" : ""}
                    {c.whatsapp && <> · {c.whatsapp}</>}
                  </div>
                  <div className="h-1 rounded-full bg-[#2b2b2b] overflow-hidden mt-2">
                    <div className="h-full bg-gradient-to-r from-[#25F4EE] to-[#FE2C55]" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[10px] text-[#8a8a8a] mt-1">{pct}% dos entregáveis ativos enviados</div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-7 max-w-[1080px] overflow-y-auto">
        {clienteAtivo ? (
          <ClienteLojaPanel
            key={clienteAtivo.id}
            cliente={clienteAtivo}
            lojasIniciais={clienteAtivo.lojas}
            onDeleteCliente={() => deleteClient(clienteAtivo.id)}
          />
        ) : (
          <div className="h-[80vh] flex flex-col items-center justify-center text-center gap-2 text-[#8a8a8a]">
            <h2 className="text-white text-xl font-bold">Selecione ou cadastre um assessorado</h2>
            <p>O diagnóstico por pilar mostra o entregável certo para o momento de cada cliente.</p>
          </div>
        )}
      </div>
    </div>
  )
}
