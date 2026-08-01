"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Loader2 } from "lucide-react"

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0d0d0f 0%, #131016 60%, #0d0d0f 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 24,
    fontFamily: "system-ui, -apple-system, sans-serif",
    position: "relative",
  },
  glow: {
    position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden",
  },
  glowInner: {
    position: "absolute", top: "30%", left: "50%",
    transform: "translate(-50%, -50%)",
    width: 700, height: 700, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)",
  },
  wrap: { width: "100%", maxWidth: 480, position: "relative" },
  badge: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 999, padding: "6px 16px",
    color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500,
    marginBottom: 20,
  },
  titleWrap: { textAlign: "center", marginBottom: 28 },
  title: { fontSize: 30, fontWeight: 800, color: "#fff", margin: "0 0 10px" },
  gradient: {
    background: "linear-gradient(135deg, #C084FC 0%, #EC4899 50%, #06B6D4 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  subtitle: { color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.65, margin: 0 },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16, padding: "28px 28px 24px",
    backdropFilter: "blur(20px)",
  },
  tabs: {
    display: "flex", gap: 4, marginBottom: 24,
    background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 4,
  },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  label: {
    display: "block", color: "rgba(255,255,255,0.65)",
    fontSize: 13, fontWeight: 500, marginBottom: 6,
  },
  input: {
    width: "100%", background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8, padding: "12px 14px",
    color: "#fff", fontSize: 14, outline: "none",
    boxSizing: "border-box" as const,
  },
  inputWrap: { position: "relative" as const },
  eyeBtn: {
    position: "absolute" as const, right: 12, top: "50%",
    transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer",
    color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center",
    padding: 0,
  },
  erro: { color: "#F87171", fontSize: 13, textAlign: "center" as const, margin: 0 },
  btn: {
    width: "100%", padding: "14px 0",
    background: "linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #06B6D4 100%)",
    border: "none", borderRadius: 10, cursor: "pointer",
    color: "#fff", fontSize: 15, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    marginTop: 4,
    boxShadow: "0 4px 24px rgba(236,72,153,0.25)",
  },
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
    cursor: "pointer", fontSize: 14, fontWeight: 600,
    background: active ? "linear-gradient(135deg, #EC4899, #8B5CF6)" : "transparent",
    color: active ? "#fff" : "rgba(255,255,255,0.35)",
    transition: "all 0.2s",
  }
}

export default function HabilitacaoPortalPage() {
  const [tab, setTab] = useState<"criar" | "entrar">("criar")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmaSenha, setConfirmaSenha] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    setLoading(true)
    const supabase = createClient()

    if (tab === "criar") {
      if (senha.length < 8) {
        setErro("A senha deve ter pelo menos 8 caracteres.")
        setLoading(false)
        return
      }
      if (senha !== confirmaSenha) {
        setErro("As senhas não coincidem.")
        setLoading(false)
        return
      }
      const resp = await fetch("/api/habilitacao/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: senha }),
      })
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}))
        setErro(
          body.error === "already_registered"
            ? "Este e-mail já tem cadastro. Use 'Já tenho acesso'."
            : "Erro ao criar acesso. Tente novamente."
        )
        setLoading(false)
        return
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (signInError) {
        setErro("Conta criada, mas não foi possível entrar automaticamente. Use 'Já tenho acesso'.")
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) {
        setErro(
          error.message.toLowerCase().includes("not confirmed")
            ? "Seu e-mail ainda não foi confirmado. Fale com a equipe pelo WhatsApp."
            : "E-mail ou senha incorretos."
        )
        setLoading(false)
        return
      }
    }

    const { data: hab } = await supabase
      .from("habilitacoes")
      .select("termos_aceitos_at, status")
      .maybeSingle()

    if (!hab || !hab.termos_aceitos_at) {
      router.push("/habilitacao/termos")
    } else if (hab.status === "enviado") {
      router.push("/habilitacao/concluido")
    } else {
      router.push("/habilitacao/formulario")
    }
  }

  return (
    <div style={S.page}>
      <div style={S.glow}><div style={S.glowInner} /></div>

      <div style={S.wrap}>
        <div style={{ textAlign: "center" }}>
          <span style={S.badge}>🔒 Acesso seguro</span>
        </div>

        <div style={S.titleWrap}>
          <h1 style={S.title}>
            Portal de <span style={S.gradient}>Habilitação</span>
          </h1>
          <p style={S.subtitle}>
            Crie seu acesso ou entre com suas credenciais para<br />
            iniciar o processo de habilitação da sua loja no TikTok Shop.
          </p>
        </div>

        <div style={S.card}>
          <div style={S.tabs}>
            <button onClick={() => { setTab("criar"); setErro("") }} style={tabStyle(tab === "criar")}>
              Criar acesso
            </button>
            <button onClick={() => { setTab("entrar"); setErro("") }} style={tabStyle(tab === "entrar")}>
              Já tenho acesso
            </button>
          </div>

          <form onSubmit={handleSubmit} style={S.form}>
            <div>
              <label style={S.label}>E-mail <span style={{ color: "#EC4899" }}>*</span></label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" required style={S.input}
              />
            </div>

            <div>
              <label style={S.label}>
                Senha <span style={{ color: "#EC4899" }}>*</span>
                {tab === "criar" && (
                  <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}> — Mínimo 8 caracteres</span>
                )}
              </label>
              <div style={S.inputWrap}>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder={tab === "criar" ? "Mínimo 8 caracteres" : "Sua senha"}
                  required style={{ ...S.input, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={S.eyeBtn}>
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {tab === "criar" && (
              <div>
                <label style={S.label}>Confirmar senha <span style={{ color: "#EC4899" }}>*</span></label>
                <div style={S.inputWrap}>
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={confirmaSenha} onChange={e => setConfirmaSenha(e.target.value)}
                    placeholder="Repita a senha"
                    required style={{ ...S.input, paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={S.eyeBtn}>
                    {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {erro && <p style={S.erro}>{erro}</p>}

            <button
              type="submit" disabled={loading}
              style={{ ...S.btn, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Aguarde..." : tab === "criar" ? "Criar meu acesso →" : "Entrar →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
