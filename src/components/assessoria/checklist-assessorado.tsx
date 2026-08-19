"use client"

import { useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { JornadaChecklist } from "@/lib/types"
import { PILLARS, mergeSituations, buildProximosPassosText } from "@/lib/assessoria-catalog"
import { DiagnosticoPilares } from "./diagnostico-pilares"
import { TrilhaPosEstrutura } from "./trilha-pos-estrutura"
import { TarefasAdicionais } from "./tarefas-adicionais"

interface Props {
  assessoradoId: string
  assessoradoNome: string
  initial: JornadaChecklist
}

export function ChecklistAssessorado({ assessoradoId, assessoradoNome, initial }: Props) {
  const [data, setData] = useState<JornadaChecklist>(initial)

  async function update(patch: Partial<JornadaChecklist>) {
    setData((prev) => ({ ...prev, ...patch }))
    const supabase = createClient()
    const { error } = await supabase
      .from("assessorados")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", assessoradoId)
    if (error) toast.error("Erro ao salvar alteração")
  }

  function copiarProximosPassos() {
    const texto = buildProximosPassosText(data, assessoradoNome)
    navigator.clipboard.writeText(texto).then(() => toast.success("Próximos passos copiados."))
  }

  const pendentes = PILLARS.flatMap((pilar) =>
    mergeSituations(data.situations)[pilar.id]
      .filter((s) => s.active && !s.sent)
      .map((s) => {
        const [titulo, ...resto] = s.deliverable.split(" — ")
        return { pilar, titulo, sub: resto.join(" — ") }
      })
  )

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-white/80">Jornada TikTok Shop</h3>
          <p className="text-xs text-white/40">Diagnóstico por pilar, trilha de onboarding e tarefas extras</p>
        </div>
        <button
          type="button"
          onClick={copiarProximosPassos}
          className="text-xs font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/30 rounded-md px-3 py-1.5 transition-colors"
        >
          Copiar próximos passos
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-[11px] uppercase tracking-wide text-white/40">Link da loja</label>
        <input
          type="text"
          defaultValue={data.link ?? ""}
          placeholder="https://..."
          onBlur={(e) => update({ link: e.target.value || null })}
          className="max-w-[420px] flex-1 bg-white/5 border border-white/10 text-white px-2.5 py-1.5 rounded-md text-xs outline-none focus:border-purple-400/60"
        />
        {data.link && (
          <a href={data.link} target="_blank" rel="noopener noreferrer" className="text-[11px] text-purple-300">
            abrir →
          </a>
        )}
      </div>

      <div className="rounded-xl border border-white/10 border-l-2 border-l-purple-400 bg-white/[0.02] px-4 py-3.5">
        <h4 className="text-[11px] uppercase tracking-wide text-white/40 mb-2.5">Próximos passos recomendados</h4>
        {pendentes.length === 0 ? (
          <p className="text-green-400 text-sm">Nenhuma situação ativa pendente — marque os pontos de atenção abaixo.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {pendentes.map((p, i) => (
              <div key={i} className="flex justify-between items-center gap-3 py-2 first:pt-0">
                <div>
                  <div className="text-sm font-semibold text-white">{p.titulo}</div>
                  {p.sub && <div className="text-[10.5px] text-white/40 mt-0.5">{p.sub}</div>}
                </div>
                <span className="shrink-0 text-[9.5px] uppercase tracking-wide font-extrabold px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300">
                  {p.pilar.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <DiagnosticoPilares data={data} onUpdate={update} />
      <TrilhaPosEstrutura data={data} onUpdate={update} />
      <TarefasAdicionais data={data} onUpdate={update} />
    </div>
  )
}
