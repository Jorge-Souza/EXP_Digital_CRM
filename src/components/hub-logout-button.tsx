"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function HubLogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className="text-white/30 hover:text-white/60 text-sm flex items-center gap-1.5 mx-auto transition-colors">
      <LogOut className="h-3.5 w-3.5" />
      Sair
    </button>
  )
}
