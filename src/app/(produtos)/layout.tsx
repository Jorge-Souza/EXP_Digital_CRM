import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ProdutosSidebar } from "@/components/produtos-sidebar"

export const dynamic = "force-dynamic"

export default async function ProdutosLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: profile }, { data: adminData }] = await Promise.all([
    supabase.from("profiles").select("nome, role").eq("id", user.id).single(),
    supabase.rpc("current_user_is_admin"),
  ])

  const isAdmin = adminData === true
  const isVendas = profile?.role === "vendas"

  if (!isAdmin && !isVendas) redirect("/hub")

  return (
    <SidebarProvider>
      <ProdutosSidebar userEmail={user.email} userName={profile?.nome} isVendas={isVendas} />
      <main className="flex flex-1 flex-col min-h-svh">
        <div className="sticky top-0 z-10 h-9 flex items-center px-3" style={{ background: "rgba(15,10,30,0.9)", backdropFilter: "blur(12px)" }}>
          <SidebarTrigger />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
