"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CalendarDays } from "lucide-react"

const PRESETS = [
  { label: "Hoje",     since: () => { const d = toISO(new Date()); return { since: d, until: d } } },
  { label: "Ontem",   since: () => { const d = toISO(addDays(new Date(), -1)); return { since: d, until: d } } },
  { label: "7 dias",  since: () => ({ since: toISO(addDays(new Date(), -6)), until: toISO(new Date()) }) },
  { label: "30 dias", since: () => ({ since: toISO(addDays(new Date(), -29)), until: toISO(new Date()) }) },
  { label: "Este mês",since: () => { const t = new Date(); return { since: toISO(new Date(t.getFullYear(), t.getMonth(), 1)), until: toISO(t) } } },
]

function toISO(d: Date) { return d.toISOString().split("T")[0] }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r }

export function DateFilter({ since, until }: { since: string; until: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [s, setS] = useState(since)
  const [u, setU] = useState(until)

  function apply(ns: string, nu: string) {
    setS(ns); setU(nu)
    router.push(`${pathname}?since=${ns}&until=${nu}`)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
      {PRESETS.map(p => (
        <Button key={p.label} variant="outline" size="sm" className="h-7 text-xs px-3"
          onClick={() => { const r = p.since(); apply(r.since, r.until) }}>
          {p.label}
        </Button>
      ))}
      <div className="flex items-center gap-1 ml-1">
        <input type="date" value={s} onChange={e => setS(e.target.value)}
          className="h-7 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
        <span className="text-xs text-muted-foreground">→</span>
        <input type="date" value={u} onChange={e => setU(e.target.value)}
          className="h-7 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
        <Button size="sm" className="h-7 text-xs px-3" onClick={() => apply(s, u)}>Aplicar</Button>
      </div>
    </div>
  )
}
