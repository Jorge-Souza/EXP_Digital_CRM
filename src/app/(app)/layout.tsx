import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import dynamic from "next/dynamic"

const NotificationBell = dynamic(
  () => import("@/components/notification-bell").then((m) => ({ default: m.NotificationBell })),
  { ssr: false }
)

export const dynamic = "force-dynamic"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const [{ data: profile }, { data: adminData }, clientsRes, clientsExtraRes] = await Promise.all([
    supabase.from("profiles").select("nome").eq("id", user.id).single(),
    supabase.rpc("current_user_is_admin"),
    supabase.from("clients").select("id, nome, status").order("nome"),
    supabase.from("clients").select("id, avatar_emoji, cor").order("nome"),
  ])

  const isAdmin = adminData === true

  const clientsBase = clientsRes.data ?? []
  const clientsExtra = clientsExtraRes.data ?? []
  const clients = clientsBase.map((c) => {
    const extra = clientsExtra.find((e) => e.id === c.id)
    return { ...c, avatar_emoji: extra?.avatar_emoji ?? "🏢", cor: extra?.cor ?? "#6366f1" }
  })

  return (
    <SidebarProvider>
      <AppSidebar userEmail={user.email} userName={profile?.nome} isAdmin={isAdmin} clients={clients} />
      <main className="flex flex-1 flex-col min-h-svh">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-semibold text-primary">✨ EXP Digital</span>
          <span className="text-sm text-muted-foreground">CRM</span>
          <div className="ml-auto">
            <NotificationBell userId={user.id} />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
