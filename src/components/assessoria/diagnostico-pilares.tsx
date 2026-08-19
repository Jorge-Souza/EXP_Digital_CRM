"use client"

import type { JornadaChecklist, SituationState } from "@/lib/types"
import { PILLARS, mergeSituations, upsertById, DEFAULT_SITUATION_STATE } from "@/lib/assessoria-catalog"

interface Props {
  data: JornadaChecklist
  onUpdate: (patch: Partial<JornadaChecklist>) => void
}

const PILAR_ACCENT: Record<string, { bg: string; text: string; tagBg: string; tagText: string }> = {
  estrutura: { bg: "bg-[#FE2C55]", text: "text-white", tagBg: "bg-[#3a1414]", tagText: "text-[#ff8a8a]" },
  exposicao: { bg: "bg-[#25F4EE]", text: "text-black", tagBg: "bg-[#0f2c2c]", tagText: "text-[#25F4EE]" },
  expansao: { bg: "bg-[#c9a8ff]", text: "text-black", tagBg: "bg-[#241c33]", tagText: "text-[#c9a8ff]" },
}

export function DiagnosticoPilares({ data, onUpdate }: Props) {
  const merged = mergeSituations(data.situations)

  function patch(id: string, value: Partial<SituationState>) {
    onUpdate({ situations: upsertById(data.situations, id, value, DEFAULT_SITUATION_STATE) })
  }

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide mb-1">Diagnóstico por Pilar</h3>
      <p className="text-xs text-[#8a8a8a] mb-4">Marque as situações que se aplicam a esta loja — cada uma mostra o entregável recomendado.</p>

      {PILLARS.map((pilar, idx) => {
        const accent = PILAR_ACCENT[pilar.id]
        return (
          <div key={pilar.id} className="mb-6">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${accent.bg} ${accent.text}`}>
                {idx + 1}
              </div>
              <h4 className="text-sm font-bold uppercase tracking-wide">{pilar.label}</h4>
              <span className="text-[11px] text-[#8a8a8a] ml-auto">{pilar.desc}</span>
            </div>

            {merged[pilar.id].map((sit) => (
              <div
                key={sit.id}
                className={`bg-[#141414] border rounded-lg mb-1.5 overflow-hidden ${
                  sit.sent ? "border-l-[3px] border-l-[#3ddc84] border-[#2b2b2b] bg-[#0d1a12]" : sit.active ? "border-l-[3px] border-l-[#FE2C55] border-[#2b2b2b]" : "border-[#2b2b2b]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => patch(sit.id, { active: !sit.active })}
                  className="w-full flex items-start gap-3 p-3 text-left"
                >
                  <span
                    className={`w-[19px] h-[19px] rounded-md border-[1.5px] shrink-0 mt-0.5 flex items-center justify-center text-xs font-extrabold ${
                      sit.sent ? "border-[#3ddc84] text-[#3ddc84]" : sit.active ? "border-[#FE2C55] text-[#FE2C55]" : "border-[#8a8a8a]"
                    }`}
                  >
                    {sit.sent ? "✓" : sit.active ? "!" : ""}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{sit.label}</span>
                    <span className="block text-xs text-[#8a8a8a] mt-0.5">{sit.diag}</span>
                  </span>
                </button>

                {sit.active && (
                  <div className="px-3 pb-3 pl-[45px]">
                    <div className={`rounded-md p-3 border ${sit.sent ? "border-[#1f4a30]" : "border-[#2b2b2b]"} bg-[#1c1c1c]`}>
                      <div className="text-[11px] uppercase tracking-wide text-[#25F4EE] mb-1">Entregável recomendado</div>
                      <div className="text-sm font-bold mb-2.5">{sit.deliverable}</div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <label className={`flex items-center gap-1.5 text-xs cursor-pointer ${sit.sent ? "text-[#3ddc84]" : "text-[#8a8a8a]"}`}>
                          <input
                            type="checkbox"
                            checked={sit.sent}
                            onChange={() => patch(sit.id, { sent: !sit.sent })}
                            className="accent-[#3ddc84] w-3.5 h-3.5"
                          />
                          Entregável enviado
                        </label>
                        <label className="text-[10.5px] text-[#8a8a8a]">Responsável</label>
                        <input
                          type="text"
                          defaultValue={sit.responsavel ?? ""}
                          placeholder="quem executa"
                          onBlur={(e) => patch(sit.id, { responsavel: e.target.value || null })}
                          className="bg-black border border-[#2b2b2b] text-[#F5F5F5] px-2 py-1.5 rounded-md text-xs outline-none focus:border-[#25F4EE] w-[140px]"
                        />
                        <label className="text-[10.5px] text-[#8a8a8a]">Prazo</label>
                        <input
                          type="text"
                          defaultValue={sit.prazo ?? ""}
                          placeholder="ex: 20/08"
                          onBlur={(e) => patch(sit.id, { prazo: e.target.value || null })}
                          className="bg-black border border-[#2b2b2b] text-[#F5F5F5] px-2 py-1.5 rounded-md text-xs outline-none focus:border-[#25F4EE] w-[110px]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
