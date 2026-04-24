"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  LogOut,
  ChevronUp,
  Zap,
  FolderKanban,
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
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Publicações", url: "/publicacoes", icon: CalendarDays },
]

const statusDot: Record<ClientStatus, string> = {
  ativo: "bg-green-500",
  pausado: "bg-yellow-500",
  inativo: "bg-gray-400",
}

interface AppSidebarProps {
  userEmail?: string
  userName?: string
  clients: { id: string; nome: string; status: ClientStatus }[]
}

export function AppSidebar({ userEmail, userName, clients }: AppSidebarProps) {
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
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">EXP Digital</p>
            <p className="text-xs text-muted-foreground">CRM</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Menu principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={pathname === item.url}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projetos por cliente */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-1.5">
            <FolderKanban className="h-3.5 w-3.5" />
            Projetos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {clients.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  Nenhum cliente ainda
                </p>
              ) : (
                clients.map((c) => (
                  <SidebarMenuItem key={c.id}>
                    <SidebarMenuButton
                      render={<Link href={`/clientes/${c.id}/projeto`} />}
                      isActive={pathname.startsWith(`/clientes/${c.id}`)}
                      className="gap-2.5"
                    >
                      <span className={`h-2 w-2 rounded-full shrink-0 ${statusDot[c.status]}`} />
                      <span className="truncate">{c.nome}</span>
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
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{userName ?? "Usuária"}</span>
                  <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                </div>
                <ChevronUp className="ml-auto h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
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
