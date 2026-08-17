"use client"

import { useState } from "react"
import type { AssessoriaLoja, CustomTask } from "@/lib/types"

interface Props {
  loja: AssessoriaLoja
  onUpdate: (patch: Partial<AssessoriaLoja>) => void
}

const TAGS = ["Estrutura", "Exposição", "Expansão", "Etapa 1", "Etapa 2", "Etapa 3", "Geral"]

export function TarefasAdicionais({ loja, onUpdate }: Props) {
  const [text, setText] = useState("")
  const [tag, setTag] = useState("Geral")

  function addTask() {
    const value = text.trim()
    if (!value) return
    const novaTask: CustomTask = { id: crypto.randomUUID(), text: value, tag, responsavel: null, prazo: null, done: false }
    onUpdate({ custom_tasks: [...loja.custom_tasks, novaTask] })
    setText("")
  }

  function patch(id: string, value: Partial<CustomTask>) {
    onUpdate({ custom_tasks: loja.custom_tasks.map((t) => (t.id === id ? { ...t, ...value } : t)) })
  }

  function remove(id: string) {
    onUpdate({ custom_tasks: loja.custom_tasks.filter((t) => t.id !== id) })
  }

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide mb-1">Tarefas Adicionais</h3>
      <p className="text-xs text-[#8a8a8a] mb-3.5">Vá somando aqui as tarefas específicas que forem surgindo na evolução dessa loja.</p>

      <div className="flex gap-2 mb-3.5 flex-wrap">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="ex: Selecionar operador para embalar e despachar produtos"
          className="flex-1 min-w-[220px] bg-[#1c1c1c] border border-[#2b2b2b] text-[#F5F5F5] px-3 py-2.5 rounded-lg text-sm outline-none focus:border-[#25F4EE]"
        />
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="bg-[#1c1c1c] border border-[#2b2b2b] text-[#F5F5F5] px-2.5 py-2.5 rounded-lg text-xs outline-none"
        >
          {TAGS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={addTask}
          className="bg-[#FE2C55] text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-lg"
        >
          + Adicionar tarefa
        </button>
      </div>

      {loja.custom_tasks.length === 0 ? (
        <p className="text-xs text-[#8a8a8a] py-2.5">Nenhuma tarefa adicional ainda.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {loja.custom_tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-2.5 bg-[#141414] border border-[#2b2b2b] rounded-lg px-3.5 py-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => patch(t.id, { done: !t.done })}
                className={`w-[18px] h-[18px] rounded-md border-[1.5px] shrink-0 flex items-center justify-center text-[11px] ${
                  t.done ? "bg-[#3ddc84] border-[#3ddc84] text-[#04150c]" : "border-[#8a8a8a]"
                }`}
              >
                {t.done ? "✓" : ""}
              </button>
              <button
                type="button"
                onClick={() => patch(t.id, { done: !t.done })}
                className={`text-[13px] flex-1 min-w-[180px] text-left ${t.done ? "text-[#8a8a8a] line-through" : ""}`}
              >
                {t.text}
              </button>
              <span className="text-[9.5px] uppercase tracking-wide font-extrabold px-1.5 py-0.5 rounded-md bg-[#232323] text-[#8a8a8a] shrink-0">
                {t.tag}
              </span>
              <span className="text-[9.5px] text-[#8a8a8a] uppercase tracking-wide shrink-0">Resp.</span>
              <input
                type="text"
                defaultValue={t.responsavel ?? ""}
                placeholder="quem"
                onBlur={(e) => patch(t.id, { responsavel: e.target.value || null })}
                className="bg-black border border-[#2b2b2b] text-[#F5F5F5] px-2 py-1 rounded-md text-[11px] outline-none focus:border-[#25F4EE] w-[110px] shrink-0"
              />
              <span className="text-[9.5px] text-[#8a8a8a] uppercase tracking-wide shrink-0">Data</span>
              <input
                type="text"
                defaultValue={t.prazo ?? ""}
                placeholder="20/08"
                onBlur={(e) => patch(t.id, { prazo: e.target.value || null })}
                className="bg-black border border-[#2b2b2b] text-[#F5F5F5] px-2 py-1 rounded-md text-[11px] outline-none focus:border-[#25F4EE] w-[90px] shrink-0"
              />
              <button
                type="button"
                onClick={() => remove(t.id)}
                title="Remover"
                className="text-[#8a8a8a] hover:text-[#FE2C55] text-base leading-none px-1 shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
