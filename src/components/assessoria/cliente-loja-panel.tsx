"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { AssessoriaCliente, AssessoriaLoja } from "@/lib/types"
import { PILLARS, mergeSituations, buildProximosPassosText } from "@/lib/assessoria-catalog"
import { DiagnosticoPilares } from "./diagnostico-pilares"
import { TrilhaPosEstrutura } from "./trilha-pos-estrutura"
import { TarefasAdicionais } from "./tarefas-adicionais"

interface Props {
  cliente: AssessoriaCliente
  lojasIniciais: AssessoriaLoja[]
  onDeleteCliente: () => void
}

export function ClienteLojaPanel({ cliente, lojasIniciais, onDeleteCliente }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [lojas, setLojas] = useState<AssessoriaLoja[]>(lojasIniciais)
  const [activeLojaId, setActiveLojaId] = useState<string | null>(lojasIniciais[0]?.id ?? null)
  const [criando, setCriando] = useState(false)

  const lojaAtiva = lojas.find((l) => l.id === activeLojaId) ?? lojas[0] ?? null
  const waLink = cliente.whatsapp ? `https://wa.me/55${cliente.whatsapp.replace(/\D/g, "")}` : null

  async function criarLoja(label: string) {
    const nome = label.trim()
    if (!nome) return
    setCriando(true)
    const { data, error } = await supabase
      .from("tiktok_assessoria_lojas")
      .insert({ cliente_id: cliente.id, label: nome })
      .select()
      .single()
    setCriando(false)
    if (error || !data) {
      toast.error("Erro ao criar loja")
      return
    }
    const nova = data as AssessoriaLoja
    setLojas((prev) => [...prev, nova])
    setActiveLojaId(nova.id)
  }

  async function updateLoja(lojaId: string, patch: Partial<AssessoriaLoja>) {
    setLojas((prev) => prev.map((l) => (l.id === lojaId ? { ...l, ...patch } : l)))
    const { error } = await supabase
      .from("tiktok_assessoria_lojas")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", lojaId)
    if (error) toast.error("Erro ao salvar alteração")
  }

  function copiarProximosPassos() {
    if (!lojaAtiva) return
    const texto = buildProximosPassosText(lojaAtiva, cliente.nome)
    navigator.clipboard.writeText(texto).then(() => toast.success("Próximos passos copiados."))
  }

  const pendentes = lojaAtiva
    ? PILLARS.flatMap((pilar) =>
        mergeSituations(lojaAtiva.situations)[pilar.id]
          .filter((s) => s.active && !s.sent)
          .map((s) => {
            const [titulo, ...resto] = s.deliverable.split(" — ")
            return { pilar, titulo, sub: resto.join(" — ") }
          })
      )
    : []

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-extrabold">{cliente.nome}</h2>
          <div className="text-[#8a8a8a] text-xs mt-1">
            {cliente.nicho || "nicho não definido"}
            {cliente.whatsapp && <> · {cliente.whatsapp}</>}
          </div>
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-[#3ddc84] text-xs hover:underline">
              Abrir WhatsApp →
            </a>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={copiarProximosPassos}
            className="border border-[#2b2b2b] text-[#8a8a8a] hover:text-white hover:border-[#8a8a8a] text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-md"
          >
            Copiar próximos passos
          </button>
          <button
            type="button"
            onClick={onDeleteCliente}
            className="border border-[#2b2b2b] text-[#8a8a8a] hover:text-white hover:border-[#8a8a8a] text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-md"
          >
            Remover
          </button>
        </div>
      </div>

      {lojas.length === 0 ? (
        <div className="max-w-md space-y-3">
          <p className="text-sm text-[#8a8a8a]">Nenhuma loja cadastrada ainda para este cliente.</p>
          <CriarLojaForm criando={criando} onCriar={criarLoja} />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            {lojas.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setActiveLojaId(l.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  l.id === lojaAtiva?.id
                    ? "bg-[#FE2C55] border-[#FE2C55] text-white"
                    : "bg-[#1c1c1c] border-[#2b2b2b] text-[#8a8a8a] hover:text-white hover:border-[#8a8a8a]"
                }`}
              >
                {l.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                const nome = prompt("Nome da nova loja:")
                if (nome) criarLoja(nome)
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-dashed border-[#2b2b2b] text-[#8a8a8a] hover:text-white hover:border-[#8a8a8a]"
            >
              + Nova loja
            </button>
          </div>

          {lojaAtiva && (
            <div key={lojaAtiva.id} className="space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-[11px] uppercase tracking-wide text-[#8a8a8a]">Link da loja ({lojaAtiva.label})</label>
                <input
                  type="text"
                  defaultValue={lojaAtiva.link ?? ""}
                  placeholder="https://..."
                  onBlur={(e) => updateLoja(lojaAtiva.id, { link: e.target.value || null })}
                  className="max-w-[420px] flex-1 bg-[#1c1c1c] border border-[#2b2b2b] text-[#F5F5F5] px-2.5 py-1.5 rounded-md text-xs outline-none focus:border-[#25F4EE]"
                />
                {lojaAtiva.link && (
                  <a href={lojaAtiva.link} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#25F4EE]">
                    abrir →
                  </a>
                )}
              </div>

              <div className="bg-gradient-to-br from-[#1a1010] to-[#101a1a] border border-[#2b2b2b] border-l-[3px] border-l-[#FE2C55] rounded-lg px-4 py-3.5">
                <h3 className="text-[11px] uppercase tracking-wide text-[#8a8a8a] mb-2.5">Próximos passos recomendados — {lojaAtiva.label}</h3>
                {pendentes.length === 0 ? (
                  <p className="text-[#3ddc84] text-sm">Nenhuma situação ativa pendente — marque os pontos de atenção do cliente abaixo.</p>
                ) : (
                  <div className="divide-y divide-[#2b2b2b]">
                    {pendentes.map((p, i) => (
                      <div key={i} className="flex justify-between items-center gap-3 py-2 first:pt-0">
                        <div>
                          <div className="text-sm font-semibold">{p.titulo}</div>
                          {p.sub && <div className="text-[10.5px] text-[#8a8a8a] mt-0.5">{p.sub}</div>}
                        </div>
                        <span className="shrink-0 text-[9.5px] uppercase tracking-wide font-extrabold px-1.5 py-0.5 rounded-md bg-[#3a1414] text-[#ff8a8a]">
                          {p.pilar.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DiagnosticoPilares loja={lojaAtiva} onUpdate={(patch) => updateLoja(lojaAtiva.id, patch)} />
              <TrilhaPosEstrutura loja={lojaAtiva} onUpdate={(patch) => updateLoja(lojaAtiva.id, patch)} />
              <TarefasAdicionais loja={lojaAtiva} onUpdate={(patch) => updateLoja(lojaAtiva.id, patch)} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function CriarLojaForm({ criando, onCriar }: { criando: boolean; onCriar: (label: string) => void }) {
  const [label, setLabel] = useState("Loja 1")
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="flex-1 bg-black border border-[#2b2b2b] text-[#F5F5F5] px-3 py-2 rounded-md text-sm outline-none focus:border-[#25F4EE]"
      />
      <button
        type="button"
        disabled={criando}
        onClick={() => onCriar(label)}
        className="bg-[#FE2C55] text-white text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-md disabled:opacity-50"
      >
        Criar loja
      </button>
    </div>
  )
}
