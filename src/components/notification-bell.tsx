"use client"

import { useState, useEffect } from "react"
import { Bell, X, Check, CheckCheck, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Notification } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

export function NotificationBell({ userId }: { userId: string }) {
  const [supabase] = useState(() => createClient())
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(30)
        if (data) setNotifications(data as Notification[])
      } catch {}
    })()

    let channel: ReturnType<typeof supabase.channel> | null = null
    try {
      channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
          (payload) => {
            setNotifications((prev) => [payload.new as Notification, ...prev])
          }
        )
        .subscribe()
    } catch {}

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const unread = notifications.filter((n) => !n.lida).length

  async function markAsRead(id: string) {
    await supabase.from("notifications").update({ lida: true }).eq("id", id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)))
  }

  async function markAllAsRead() {
    await supabase.from("notifications").update({ lida: true }).eq("user_id", userId).eq("lida", false)
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })))
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:w-[420px] p-0 flex flex-col">
          <SheetHeader className="px-5 py-4 border-b shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-bold flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações
                {unread > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unread}
                  </span>
                )}
              </SheetTitle>
              {unread > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs gap-1.5 h-7">
                  <CheckCheck className="h-3.5 w-3.5" />
                  Marcar todas como lidas
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center gap-3">
                <Bell className="h-10 w-10 text-muted-foreground/30" />
                <p className="font-medium text-muted-foreground">Nenhuma notificação</p>
                <p className="text-xs text-muted-foreground/60">Você está em dia!</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onRead={markAsRead}
                    onClose={() => setOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function NotificationItem({
  notification: n,
  onRead,
  onClose,
}: {
  notification: Notification
  onRead: (id: string) => void
  onClose: () => void
}) {
  function handleNavigate() {
    if (!n.lida) onRead(n.id)
    if (n.link) {
      onClose()
      window.location.href = n.link
    }
  }

  return (
    <div className={`px-5 py-4 transition-colors ${!n.lida ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {!n.lida
            ? <span className="h-2.5 w-2.5 rounded-full bg-primary block mt-1" />
            : <span className="h-2.5 w-2.5 rounded-full bg-transparent block mt-1" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug ${!n.lida ? "text-foreground" : "text-muted-foreground"}`}>
            {n.titulo}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.mensagem}</p>
          <p className="text-[10px] text-muted-foreground/50 mt-1.5">
            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          {n.link && (
            <button
              onClick={handleNavigate}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Ir para"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          )}
          {!n.lida && (
            <button
              onClick={() => onRead(n.id)}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
              title="Marcar como lida"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
