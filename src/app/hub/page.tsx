import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Users, ShoppingBag } from "lucide-react"
import { HubLogoutButton } from "@/components/hub-logout-button"

export default async function HubPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: profile }, { data: adminData }] = await Promise.all([
    supabase.from("profiles").select("nome, role").eq("id", user.id).single(),
    supabase.rpc("current_user_is_admin"),
  ])

  const isAdmin = adminData === true
  const isVendas = profile?.role === "vendas"
  const nome = profile?.nome ?? user.email

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0f0a1e 0%, #1a0b2e 50%, #0f0a1e 100%)" }}>

      {/* Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)" }} />
      </div>

      <div className="relative w-full max-w-2xl space-y-10">
        {/* Logo + saudação */}
        <div className="text-center space-y-3">
          <div className="flex items-end justify-center gap-1 leading-none select-none">
            <span className="text-5xl font-black text-white tracking-tight">E</span>
            <span className="text-5xl font-black tracking-tight"
              style={{ background: "linear-gradient(135deg, #C084FC 0%, #7C3AED 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              X
            </span>
            <span className="text-5xl font-black text-white tracking-tight">P</span>
          </div>
          <p className="text-white/50 text-sm tracking-[0.3em] uppercase">digital</p>
          <p className="text-white/70 text-base pt-2">
            Olá, <span className="text-white font-semibold">{nome}</span> — em qual CRM você quer entrar?
          </p>
        </div>

        {/* Cards */}
        <div className={`grid gap-5 ${isAdmin ? "sm:grid-cols-2" : "sm:grid-cols-1 max-w-sm mx-auto"}`}>
          {/* CRM Serviços — bloqueado para vendas */}
          {!isVendas && (
            <Link href="/dashboard" className="group block">
              <div className="relative rounded-2xl border border-purple-500/20 p-8 transition-all duration-200 hover:border-purple-500/50 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
                style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)" }}>
                <div className="flex flex-col gap-5">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #7C3AED33, #9333EA22)", border: "1px solid #7C3AED44" }}>
                    <Users className="h-7 w-7 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-bold">CRM Serviços</h2>
                    <p className="text-white/40 text-sm mt-1">Gestão de clientes, publicações e assessoria</p>
                  </div>
                  <div className="flex items-center gap-2 text-purple-400 text-sm font-medium group-hover:gap-3 transition-all">
                    Acessar <span>→</span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* CRM Produtos TikTok Shop — admin ou vendas */}
          {(isAdmin || isVendas) && (
            <Link href={isVendas ? "/produtos-tiktok/alunos" : "/produtos-tiktok"} className="group block">
              <div className="relative rounded-2xl border border-orange-500/20 p-8 transition-all duration-200 hover:border-orange-500/50 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
                style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)" }}>
                <div className="flex flex-col gap-5">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #F9731633, #EF444422)", border: "1px solid #F9731644" }}>
                    <ShoppingBag className="h-7 w-7 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-bold">CRM Produtos</h2>
                    <p className="text-white/40 text-sm mt-1">Alunos, infoprodutos e TikTok Shop</p>
                  </div>
                  <div className="flex items-center gap-2 text-orange-400 text-sm font-medium group-hover:gap-3 transition-all">
                    Acessar <span>→</span>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Logout */}
        <div className="text-center">
          <HubLogoutButton />
        </div>
      </div>
    </div>
  )
}
