"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Notification } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20)
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
    <DropdownMenu>
      <DropdownMenuTrigger className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">Notificações</DropdownMenuLabel>
          {unread > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.slice(0, 15).map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotificationItem({ notification: n, onRead }: { notification: Notification; onRead: (id: string) => void }) {
  const router = useRouter()

  function handleClick() {
    onRead(n.id)
    if (n.link) router.push(n.link)
  }

  return (
    <div
      className={`px-4 py-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors ${!n.lida ? "bg-primary/5" : ""}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-2">
        {!n.lida && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
        <div className={!n.lida ? "" : "pl-4"}>
          <p className={`text-sm font-medium leading-snug ${!n.lida ? "text-foreground" : "text-muted-foreground"}`}>
            {n.titulo}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{n.mensagem}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
          </p>
        </div>
      </div>
    </div>
  )
}
