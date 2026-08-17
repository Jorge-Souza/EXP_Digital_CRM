"use client"

import type { AssessoriaLoja, TrilhaSubtaskState } from "@/lib/types"
import { mergeTrilha, upsertById, DEFAULT_SUBTASK_STATE } from "@/lib/assessoria-catalog"

interface Props {
  loja: AssessoriaLoja
  onUpdate: (patch: Partial<AssessoriaLoja>) => void
}

export function TrilhaPosEstrutura({ loja, onUpdate }: Props) {
  const etapas = mergeTrilha(loja.trilha)

  function patch(id: string, value: Partial<TrilhaSubtaskState>) {
    onUpdate({ trilha: upsertById(loja.trilha, id, value, DEFAULT_SUBTASK_STATE) })
  }

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide mb-1">Trilha Pós-Estrutura</h3>
      <p className="text-xs text-[#8a8a8a] mb-4">Tarefas práticas de execução, cada uma com responsável e prazo.</p>

      {etapas.map((etapa) => {
        const allSubs = etapa.tasks.flatMap((t) => t.subtasks)
        const doneCount = allSubs.filter((s) => s.done).length
        const pct = allSubs.length ? Math.round((doneCount / allSubs.length) * 100) : 0

        return (
          <div key={etapa.id} className="bg-[#141414] border border-[#2b2b2b] rounded-xl p-4 md:p-5 mb-4">
            <div className="flex justify-between items-start gap-4 mb-1.5">
              <div>
                <h4 className="text-sm font-extrabold">{etapa.label}</h4>
                <div className="text-[11.5px] text-[#25F4EE] uppercase tracking-wide mt-0.5">
                  {etapa.subtitle} · {etapa.duration}
                </div>
              </div>
              <div className="text-xs text-[#8a8a8a] shrink-0">{pct}% concluído</div>
            </div>
            <div className="h-[5px] rounded-full bg-[#2b2b2b] overflow-hidden my-2.5 mb-4">
              <div className="h-full bg-gradient-to-r from-[#25F4EE] to-[#FE2C55]" style={{ width: `${pct}%` }} />
            </div>

            {etapa.reward && (
              <div className="bg-[#1a1408] border border-[#4a3a10] text-[#f4c95d] rounded-md px-3 py-2.5 text-xs mb-4">
                🎁 Recompensa ao concluir: <b className="text-[#ffdb8a]">{etapa.reward}</b>
              </div>
            )}

            {etapa.tasks.map((task) => {
              const taskDone = task.subtasks.filter((s) => s.done).length
              return (
                <div key={task.id} className="mb-3.5 last:mb-0">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-[13px] font-bold">{task.label}</h5>
                    <span className="text-[10.5px] text-[#8a8a8a]">{taskDone}/{task.subtasks.length}</span>
                  </div>
                  {task.subtasks.map((sub, i) => (
                    <div key={sub.id} className={`flex items-center gap-2.5 py-2 flex-wrap ${i > 0 ? "border-t border-[#232323]" : ""}`}>
                      <button
                        type="button"
                        onClick={() => patch(sub.id, { done: !sub.done })}
                        className={`w-[17px] h-[17px] rounded-md border-[1.5px] shrink-0 flex items-center justify-center text-[10.5px] ${
                          sub.done ? "bg-[#3ddc84] border-[#3ddc84] text-[#04150c]" : "border-[#8a8a8a]"
                        }`}
                      >
                        {sub.done ? "✓" : ""}
                      </button>
                      <button
                        type="button"
                        onClick={() => patch(sub.id, { done: !sub.done })}
                        className={`text-xs flex-1 min-w-[180px] text-left ${sub.done ? "text-[#8a8a8a] line-through" : ""}`}
                      >
                        {sub.label}
                      </button>
                      <span className="text-[9.5px] text-[#8a8a8a] uppercase tracking-wide shrink-0">Resp.</span>
                      <input
                        type="text"
                        defaultValue={sub.responsavel ?? ""}
                        placeholder="quem"
                        onBlur={(e) => patch(sub.id, { responsavel: e.target.value || null })}
                        className="bg-black border border-[#2b2b2b] text-[#F5F5F5] px-2 py-1 rounded-md text-[11px] outline-none focus:border-[#25F4EE] w-[110px] shrink-0"
                      />
                      <span className="text-[9.5px] text-[#8a8a8a] uppercase tracking-wide shrink-0">Data</span>
                      <input
                        type="text"
                        defaultValue={sub.prazo ?? ""}
                        placeholder="20/08"
                        onBlur={(e) => patch(sub.id, { prazo: e.target.value || null })}
                        className="bg-black border border-[#2b2b2b] text-[#F5F5F5] px-2 py-1 rounded-md text-[11px] outline-none focus:border-[#25F4EE] w-[90px] shrink-0"
                      />
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
