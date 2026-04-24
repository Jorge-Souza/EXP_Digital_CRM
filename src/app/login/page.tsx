"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    const supabase = createClient()
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error("Email ou senha incorretos")
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0f0a1e 0%, #1a0b2e 50%, #0f0a1e 100%)" }}>

      {/* Glow de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)" }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="flex items-end gap-1 leading-none select-none">
            <span className="text-6xl font-black text-white tracking-tight">E</span>
            <span className="text-6xl font-black tracking-tight"
              style={{ background: "linear-gradient(135deg, #C084FC 0%, #7C3AED 50%, #4C1D95 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              X
            </span>
            <span className="text-6xl font-black text-white tracking-tight">P</span>
          </div>
          <span className="text-white/60 text-sm font-light tracking-[0.3em] uppercase">digital</span>
          <div className="mt-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10">
            <span className="text-purple-300 text-xs font-medium tracking-wider">✨ Sistema CRM</span>
          </div>
        </div>

        <Card className="border-purple-500/20 shadow-2xl"
          style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)" }}>
          <CardHeader className="text-center pb-2">
            <p className="text-white/90 text-lg font-semibold">Bem-vinda de volta 👋</p>
            <p className="text-white/40 text-sm">Entre com suas credenciais para acessar</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70 text-sm">📧 Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-purple-400 focus:ring-purple-400/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/70 text-sm">🔒 Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-purple-400 focus:ring-purple-400/30"
                />
              </div>
              <Button
                type="submit"
                className="w-full font-semibold text-base h-11 mt-2"
                style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Entrando...</>
                ) : (
                  "Entrar →"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
