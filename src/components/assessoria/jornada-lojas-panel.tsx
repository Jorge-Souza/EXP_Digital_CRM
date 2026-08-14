"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { AssessoriaLoja } from "@/lib/types"
import { buildProximosPassosText } from "@/lib/assessoria-catalog"
import { DiagnosticoPilares } from "./diagnostico-pilares"
import { TrilhaPosEstrutura } from "./trilha-pos-estrutura"
import { TarefasAdicionais } from "./tarefas-adicionais"

interface Props {
  assessoradoId: string
  assessoradoNome: string
  lojaLegado: string | null
  lojasIniciais: AssessoriaLoja[]
}

export function JornadaLojasPanel({ assessoradoId, assessoradoNome, lojaLegado, lojasIniciais }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [lojas, setLojas] = useState<AssessoriaLoja[]>(lojasIniciais)
  const [activeLojaId, setActiveLojaId] = useState<string | null>(lojasIniciais[0]?.id ?? null)
  const [novaLojaLabel, setNovaLojaLabel] = useState(lojaLegado ?? "")
  const [criando, setCriando] = useState(false)

  const lojaAtiva = lojas.find((l) => l.id === activeLojaId) ?? lojas[0] ?? null

  async function criarLoja(label: string) {
    const nome = label.trim()
    if (!nome) return
    setCriando(true)
    const { data, error } = await supabase
      .from("assessoria_lojas")
      .insert({ assessorado_id: assessoradoId, label: nome })
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
    setNovaLojaLabel("")
  }

  async function updateLoja(lojaId: string, patch: Partial<AssessoriaLoja>) {
    setLojas((prev) => prev.map((l) => (l.id === lojaId ? { ...l, ...patch } : l)))
    const { error } = await supabase
      .from("assessoria_lojas")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", lojaId)
    if (error) toast.error("Erro ao salvar alteração")
  }

  function copiarProximosPassos() {
    if (!lojaAtiva) return
    const texto = buildProximosPassosText(lojaAtiva, assessoradoNome)
    navigator.clipboard.writeText(texto).then(() => toast.success("Próximos passos copiados."))
  }

  return (
    <div className="bg-[#010101] text-[#F5F5F5] rounded-xl border border-[#2b2b2b] p-4 md:p-6 space-y-5">
      {lojas.length === 0 ? (
        <div className="max-w-md mx-auto py-8 space-y-3 text-center">
          <p className="text-sm text-[#8a8a8a]">Nenhuma loja cadastrada ainda para este assessorado.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={novaLojaLabel}
              onChange={(e) => setNovaLojaLabel(e.target.value)}
              placeholder="Nome da loja (ex: Loja principal)"
              className="flex-1 bg-black border border-[#2b2b2b] text-[#F5F5F5] px-3 py-2 rounded-md text-sm outline-none focus:border-[#25F4EE]"
            />
            <button
              type="button"
              disabled={criando}
              onClick={() => criarLoja(novaLojaLabel)}
              className="bg-[#FE2C55] text-white text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-md disabled:opacity-50"
            >
              Criar loja
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {lojas.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setActiveLojaId(l.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
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
                className="px-3 py-1.5 rounded-full text-xs font-semibold border border-dashed border-[#2b2b2b] text-[#8a8a8a] hover:text-white hover:border-[#8a8a8a]"
              >
                + Nova loja
              </button>
            </div>
            <button
              type="button"
              onClick={copiarProximosPassos}
              className="text-xs font-semibold text-[#25F4EE] hover:underline"
            >
              Copiar próximos passos
            </button>
          </div>

          {lojaAtiva && (
            <div key={lojaAtiva.id} className="space-y-8">
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
