"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  LogOut,
  ChevronUp,
  FolderKanban,
  UserCog,
} from "lucide-react"
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
import { useRouter } from "next/navigation"
import type { ClientStatus } from "@/lib/types"

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, emoji: "📊" },
  { title: "Clientes", url: "/clientes", icon: Users, emoji: "👥" },
  { title: "Publicações", url: "/publicacoes", icon: CalendarDays, emoji: "📅" },
]

const statusDot: Record<ClientStatus, string> = {
  ativo: "bg-green-400",
  pausado: "bg-yellow-400",
  inativo: "bg-gray-500",
}

interface AppSidebarProps {
  userEmail?: string
  userName?: string
  isAdmin?: boolean
  clients: { id: string; nome: string; status: ClientStatus; avatar_emoji?: string; cor?: string }[]
}

export function AppSidebar({ userEmail, userName, isAdmin, clients }: AppSidebarProps) {
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
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-4">
          {/* Logo EXP */}
          <div className="flex items-end leading-none select-none shrink-0">
            <span className="text-2xl font-black text-white tracking-tight">E</span>
            <span className="text-2xl font-black tracking-tight"
              style={{ background: "linear-gradient(135deg, #C084FC, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              X
            </span>
            <span className="text-2xl font-black text-white tracking-tight">P</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">EXP Digital</p>
            <p className="text-[10px] text-white/40 tracking-wider uppercase">Sistema CRM</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40 text-[10px] tracking-widest uppercase px-3">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={pathname === item.url}
                    className="text-white/70 hover:text-white hover:bg-white/10 data-[active=true]:bg-purple-600/30 data-[active=true]:text-white font-medium"
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-white/40 text-[10px] tracking-widest uppercase px-3">
              Administração
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/usuarios" />}
                    isActive={pathname === "/usuarios"}
                    className="text-white/70 hover:text-white hover:bg-white/10 data-[active=true]:bg-purple-600/30 data-[active=true]:text-white font-medium"
                  >
                    <UserCog className="h-4 w-4" />
                    <span>Usuários</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40 text-[10px] tracking-widest uppercase px-3 flex items-center gap-1.5">
            <FolderKanban className="h-3 w-3" />
            Projetos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {clients.length === 0 ? (
                <p className="px-3 py-2 text-xs text-white/30">
                  Nenhum cliente ainda
                </p>
              ) : (
                clients.map((c) => (
                  <SidebarMenuItem key={c.id}>
                    <SidebarMenuButton
                      render={<Link href={`/clientes/${c.id}/projeto`} />}
                      isActive={pathname.startsWith(`/clientes/${c.id}`)}
                      className="text-white/60 hover:text-white hover:bg-white/10 data-[active=true]:bg-purple-600/30 data-[active=true]:text-white gap-2.5"
                    >
                      <span
                        className="h-6 w-6 rounded-md shrink-0 flex items-center justify-center text-sm leading-none"
                        style={{ background: c.cor ? `${c.cor}30` : "rgba(99,102,241,0.2)", border: `1px solid ${c.cor ?? "#6366f1"}40` }}
                      >
                        {c.avatar_emoji ?? "🏢"}
                      </span>
                      <span className="truncate text-sm">{c.nome}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="hover:bg-white/10" />}>
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white">{userName ?? "Usuária"}</span>
                  <span className="truncate text-xs text-white/40">{userEmail}</span>
                </div>
                <ChevronUp className="ml-auto h-4 w-4 text-white/40" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
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
