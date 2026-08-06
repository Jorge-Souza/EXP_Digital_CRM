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
          Analisaremos suas informações e em até 20 dias iremos trabalhar para habilitar sua loja.
          Nossa equipe vai entrar em contato pelo e-mail{" "}
          <strong style={{ color: "rgba(255,255,255,0.7)" }}>{email}</strong>{" "}
          ou através do WhatsApp.
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

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.25)",
              borderRadius: 12, padding: "12px 24px",
              color: "#25D366", fontSize: 14, fontWeight: 600,
              textDecoration: "none", transition: "all 0.2s",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Falar pelo WhatsApp
          </a>

          <button
            type="button"
            onClick={() => router.push("/habilitacao/formulario?editar=1")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12, padding: "12px 24px", cursor: "pointer",
              color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600,
            }}
          >
            ← Voltar para alterar meus dados
          </button>
        </div>

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
