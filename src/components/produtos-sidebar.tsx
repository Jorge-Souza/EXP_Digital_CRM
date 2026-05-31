"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, GraduationCap, Package, LogOut, ChevronUp, ArrowLeft, ShoppingBag, Megaphone } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { title: "Dashboard",  url: "/produtos-tiktok",           icon: LayoutDashboard, emoji: "📊" },
  { title: "Alunos",     url: "/produtos-tiktok/alunos",    icon: GraduationCap,   emoji: "🎓" },
  { title: "Produtos",   url: "/produtos-tiktok/produtos",  icon: Package,         emoji: "📦" },
  { title: "Conteúdo",   url: "/produtos-tiktok/conteudo",  icon: Megaphone,       emoji: "🎬" },
]

interface ProdutosSidebarProps {
  userEmail?: string
  userName?: string
}

export function ProdutosSidebar({ userEmail, userName }: ProdutosSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : userEmail?.[0]?.toUpperCase() ?? "U"

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <Sidebar style={{ "--sidebar-background": "hsl(var(--sidebar-background))" } as React.CSSProperties}>
      <SidebarHeader className="border-b" style={{ borderColor: "rgba(249,115,22,0.2)" }}>
        {/* Logo TikTok Shop */}
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #F97316, #EF4444)", boxShadow: "0 0 16px rgba(249,115,22,0.4)" }}>
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">TikTok Shop</p>
            <p className="text-[10px] text-white/40 tracking-wider uppercase">CRM Produtos</p>
          </div>
        </div>

        {/* Voltar ao Hub */}
        <div className="px-2 pb-3">
          <Link href="/hub"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao Hub
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40 text-[10px] tracking-widest uppercase px-3">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={item.url === "/produtos-tiktok" ? pathname === item.url : pathname.startsWith(item.url)}
                    className="text-white/70 hover:text-white hover:bg-white/10 data-[active=true]:text-white font-medium"
                    style={{ "--sidebar-accent": "rgba(249,115,22,0.2)" } as React.CSSProperties}
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t" style={{ borderColor: "rgba(249,115,22,0.15)" }}>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="hover:bg-white/10" />}>
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #F97316, #EF4444)" }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white">{userName ?? "Admin"}</span>
                  <span className="truncate text-xs text-white/40">{userEmail}</span>
                </div>
                <ChevronUp className="ml-auto h-4 w-4 text-white/40" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem onClick={() => window.location.href = '/hub'} className="cursor-pointer">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Hub
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
