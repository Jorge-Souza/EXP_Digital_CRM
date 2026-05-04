"use client"

import { Button } from "@/components/ui/button"
import { CalendarCheck, CalendarX } from "lucide-react"

export function GoogleCalendarConnect({ conectado }: { conectado: boolean }) {
  if (conectado) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400">
        <CalendarCheck className="h-4 w-4" />
        <span>Conectado</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarX className="h-4 w-4" />
        <span>Não conectado</span>
      </div>
      <Button size="sm" variant="outline" onClick={() => window.location.href = "/api/assessoria/google-auth"}>
        Conectar Google Agenda
      </Button>
    </div>
  )
}
