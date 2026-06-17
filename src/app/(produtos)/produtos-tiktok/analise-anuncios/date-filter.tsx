"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CalendarDays } from "lucide-react"

const PRESETS = [
  { label: "Hoje",        days: 0 },
  { label: "7 dias",      days: 7 },
  { label: "14 dias",     days: 14 },
  { label: "30 dias",     days: 30 },
  { label: "Este mês",    days: -1 },
]

function toISO(d: Date) {
  return d.toISOString().split("T")[0]
}

function addDays(d: Date, n: number) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

interface Props {
  since: string
  until: string
}

export function DateFilter({ since, until }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [s, setS] = useState(since)
  const [u, setU] = useState(until)

  function apply(ns: string, nu: string) {
    setS(ns); setU(nu)
    router.push(`${pathname}?since=${ns}&until=${nu}`)
  }

  function applyPreset(days: number) {
    const today = new Date()
    if (days === 0) {
      apply(toISO(today), toISO(today))
    } else if (days === -1) {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      apply(toISO(start), toISO(today))
    } else {
      apply(toISO(addDays(today, -days)), toISO(today))
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
      {PRESETS.map(p => (
        <Button key={p.label} variant="outline" size="sm" className="h-7 text-xs px-3"
          onClick={() => applyPreset(p.days)}>
          {p.label}
        </Button>
      ))}
      <div className="flex items-center gap-1 ml-1">
        <input
          type="date" value={s}
          onChange={e => setS(e.target.value)}
          className="h-7 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <span className="text-xs text-muted-foreground">→</span>
        <input
          type="date" value={u}
          onChange={e => setU(e.target.value)}
          className="h-7 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <Button size="sm" className="h-7 text-xs px-3" onClick={() => apply(s, u)}>
          Aplicar
        </Button>
      </div>
    </div>
  )
}
