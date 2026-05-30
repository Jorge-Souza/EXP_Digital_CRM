import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ProdutosSidebar } from "@/components/produtos-sidebar"
import { Separator } from "@/components/ui/separator"

export const dynamic = "force-dynamic"

export default async function ProdutosLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: profile }, { data: adminData }] = await Promise.all([
    supabase.from("profiles").select("nome").eq("id", user.id).single(),
    supabase.rpc("current_user_is_admin"),
  ])

  if (!adminData) redirect("/hub")

  return (
    <SidebarProvider>
      <ProdutosSidebar userEmail={user.email} userName={profile?.nome} />
      <main className="flex flex-1 flex-col min-h-svh">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-10"
          style={{ background: "rgba(15,10,30,0.9)", backdropFilter: "blur(12px)", borderColor: "rgba(249,115,22,0.15)" }}>
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-semibold" style={{ color: "#fb923c" }}>🛍️ TikTok Shop</span>
          <span className="text-sm text-white/40">CRM Produtos</span>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
