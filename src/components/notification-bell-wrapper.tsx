"use client"

import dynamic from "next/dynamic"

const NotificationBell = dynamic(
  () => import("@/components/notification-bell").then((m) => ({ default: m.NotificationBell })),
  { ssr: false, loading: () => <div className="h-9 w-9" /> }
)

export function NotificationBellWrapper({ userId }: { userId: string }) {
  return <NotificationBell userId={userId} />
}
