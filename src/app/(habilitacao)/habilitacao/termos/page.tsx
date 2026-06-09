"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, ExternalLink } from "lucide-react"

const BASE: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0d0d0f 0%, #131016 60%, #0d0d0f 100%)",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "40px 24px",
  fontFamily: "system-ui, -apple-system, sans-serif",
  position: "relative",
}

const TERMOS = [
  {
    id: "privacidade",
    titulo: "Privacidade e segurança da informação (LGPD)",
    texto: "Li e aceito os termos de coleta, armazenamento e uso dos meus dados conforme a LGPD. Estou ciente de que as credenciais fornecidas não serão retidas após a conclusão da habilitação.",
  },
  {
    id: "uso_imagem",
    titulo: "Uso de imagem e marca",
    texto: "Autorizo a EXP Digital - TikTok Shop a utilizar o nome, logotipo e marca da minha empresa em materiais de marketing e comunicação institucional.",
  },
  {
    id: "divulgacao",
    titulo: "Divulgação do relacionamento comercial",
    texto: "Autorizo a EXP Digital - TikTok Shop a mencionar o relacionamento comercial entre as partes para fins de portfólio e marketing, preservando informações comercialmente sensíveis.",
  },
]

export default function TermosPage() {
  const [aceitos, setAceitos] = useState<Record<string, boolean>>({
    privacidade: false, uso_imagem: false, divulgacao: false,
  })
  const [loading, setLoading] = useState(false)
  const [verificando, setVerificando] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function verificar() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/habilitacao"); return }

      const { data: hab } = await supabase
        .from("habilitacoes")
        .select("termos_aceitos_at, status")
        .maybeSingle()

      if (hab?.status === "enviado") { router.push("/habilitacao/concluido"); return }
      if (hab?.termos_aceitos_at) { router.push("/habilitacao/formulario"); return }
      setVerificando(false)
    }
    verificar()
  }, [router])

  const todosAceitos = Object.values(aceitos).every(Boolean)

  async function handleAceitar() {
    if (!todosAceitos) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/habilitacao"); return }

    const agora = new Date().toISOString()

    const { data: hab } = await supabase
      .from("habilitacoes")
      .select("id")
      .maybeSingle()

    if (!hab) {
      await supabase.from("habilitacoes").insert({
        user_id: user.id,
        email: user.email,
        termos_aceitos_at: agora,
        aceito_privacidade: aceitos.privacidade,
        aceito_uso_imagem: aceitos.uso_imagem,
        aceito_divulgacao: aceitos.divulgacao,
      })
    } else {
      await supabase.from("habilitacoes").update({
        termos_aceitos_at: agora,
        aceito_privacidade: aceitos.privacidade,
        aceito_uso_imagem: aceitos.uso_imagem,
        aceito_divulgacao: aceitos.divulgacao,
      }).eq("id", hab.id)
    }

    router.push("/habilitacao/formulario")
  }

  if (verificando) {
    return (
      <div style={{ ...BASE, alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={28} style={{ color: "#EC4899", animation: "spin 1s linear infinite" }} />
      </div>
    )
  }

  return (
    <div style={BASE}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "20%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)",
        }} />
      </div>

      <div style={{ width: "100%", maxWidth: 640, position: "relative" }}>
        {/* Badge */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 999, padding: "6px 16px",
            color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500,
          }}>
            📋 Termos e condições
          </span>
        </div>

        {/* Título */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#fff", margin: "0 0 10px", lineHeight: 1.2 }}>
            Antes de continuar,<br />leia e aceite os termos
          </h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.65, margin: 0 }}>
            Para prosseguir com a habilitação da sua loja, é necessário que você<br />
            leia e concorde com todos os termos abaixo.
          </p>
        </div>

        {/* Card Contrato */}
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12, padding: "16px 20px", marginBottom: 12,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 18 }}>📄</span>
            <div>
              <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: "0 0 2px" }}>
                Termos e Condições de Prestação de Serviços
              </p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0 }}>
                11 cláusulas · LGPD, obrigações, prazos e limitações de responsabilidade
              </p>
            </div>
          </div>
          <a
            href="https://mundodaslives.com.br/termos.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#EC4899", fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
              textDecoration: "none",
            }}
          >
            Ler <ExternalLink size={12} />
          </a>
        </div>

        {/* Checkboxes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {TERMOS.map((t) => (
            <label
              key={t.id}
              style={{
                display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer",
                background: aceitos[t.id]
                  ? "rgba(236,72,153,0.06)"
                  : "rgba(255,255,255,0.03)",
                border: aceitos[t.id]
                  ? "1px solid rgba(236,72,153,0.3)"
                  : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "16px 18px",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 2,
                  background: aceitos[t.id]
                    ? "linear-gradient(135deg, #EC4899, #8B5CF6)"
                    : "rgba(255,255,255,0.08)",
                  border: aceitos[t.id]
                    ? "none"
                    : "1px solid rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                {aceitos[t.id] && (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={aceitos[t.id]}
                onChange={e => setAceitos(prev => ({ ...prev, [t.id]: e.target.checked }))}
                style={{ display: "none" }}
              />
              <div>
                <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>
                  {t.titulo}
                </p>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                  {t.texto}
                </p>
              </div>
            </label>
          ))}
        </div>

        {/* Botão */}
        <button
          onClick={handleAceitar}
          disabled={!todosAceitos || loading}
          style={{
            width: "100%", padding: "15px 0",
            background: todosAceitos && !loading
              ? "linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #06B6D4 100%)"
              : "rgba(255,255,255,0.08)",
            border: "none", borderRadius: 10,
            cursor: todosAceitos && !loading ? "pointer" : "not-allowed",
            color: todosAceitos ? "#fff" : "rgba(255,255,255,0.3)",
            fontSize: 15, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: todosAceitos ? "0 4px 24px rgba(236,72,153,0.25)" : "none",
            transition: "all 0.2s",
          }}
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Aguarde..." : "Aceitar termos e iniciar habilitação →"}
        </button>

        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center", marginTop: 14 }}>
          Ao aceitar, a data e hora do seu aceite são registradas automaticamente.
        </p>
      </div>
    </div>
  )
}
