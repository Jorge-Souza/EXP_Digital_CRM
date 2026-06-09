"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function ConcluidoPage() {
  const [verificando, setVerificando] = useState(true)
  const [email, setEmail] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function verificar() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/habilitacao"); return }

      const { data: hab } = await supabase
        .from("habilitacoes")
        .select("status")
        .maybeSingle()

      if (!hab || hab.status !== "enviado") {
        router.push("/habilitacao/formulario")
        return
      }

      setEmail(user.email ?? "")
      setVerificando(false)
    }
    verificar()
  }, [router])

  if (verificando) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0d0d0f 0%, #131016 60%, #0d0d0f 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}>
        <Loader2 size={28} style={{ color: "#EC4899", animation: "spin 1s linear infinite" }} />
      </div>
    )
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0d0d0f 0%, #131016 60%, #0d0d0f 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
      fontFamily: "system-ui, -apple-system, sans-serif",
      position: "relative",
    }}>
      {/* Glow verde */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: "40%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%)",
        }} />
      </div>

      <div style={{ width: "100%", maxWidth: 520, textAlign: "center", position: "relative" }}>
        {/* Ícone animado */}
        <div style={{
          width: 90, height: 90, borderRadius: "50%",
          background: "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 28px",
          boxShadow: "0 0 0 16px rgba(52,211,153,0.1)",
        }}>
          <svg width="40" height="32" viewBox="0 0 40 32" fill="none">
            <path d="M3 16L14 27L37 4" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)",
          borderRadius: 999, padding: "5px 14px",
          color: "#34D399", fontSize: 12, fontWeight: 700,
          letterSpacing: "0.05em", textTransform: "uppercase",
          marginBottom: 20,
        }}>
          ✅ Habilitação enviada
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: "0 0 16px", lineHeight: 1.2 }}>
          Suas informações foram<br />enviadas com sucesso!
        </h1>

        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.7, margin: "0 0 32px" }}>
          Recebemos todos os dados para habilitar sua loja no TikTok Shop.
          Nossa equipe vai analisar as informações e entrar em contato pelo
          e-mail <strong style={{ color: "rgba(255,255,255,0.7)" }}>{email}</strong> em até 3 dias úteis.
        </p>

        {/* Cards de próximos passos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
          {[
            { icon: "📋", titulo: "Análise dos dados", desc: "Nossa equipe verifica todas as informações enviadas." },
            { icon: "🔗", titulo: "Integração TikTok Shop", desc: "Configuramos e habilitamos a sua loja na plataforma." },
            { icon: "🚀", titulo: "Sua loja no ar!", desc: "Você recebe o acesso e começa a vender no TikTok Shop." },
          ].map((item, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, padding: "14px 18px",
              display: "flex", alignItems: "center", gap: 14, textAlign: "left",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: "rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>{item.icon}</div>
              <div>
                <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: "0 0 2px" }}>{item.titulo}</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>{item.desc}</p>
              </div>
              <div style={{
                marginLeft: "auto", width: 24, height: 24, borderRadius: "50%",
                background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#34D399", fontWeight: 700, fontSize: 12, flexShrink: 0,
              }}>{i + 1}</div>
            </div>
          ))}
        </div>

        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
          Dúvidas? Entre em contato pelo WhatsApp da EXP Digital.
        </p>

        {/* Rodapé */}
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "rgba(255,255,255,0.3)", fontSize: 13,
          }}>
            Powered by{" "}
            <strong style={{
              background: "linear-gradient(135deg, #C084FC, #EC4899)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>EXP Digital</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
