/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Upload, X, Plus, ImageIcon } from "lucide-react"

// ─── Tipos ───────────────────────────────────────────────────
type Variacao = { tipo: string; itens: string; preco: string; imagem_url: string }
type Produto = {
  nome: string; descricao: string; sku: string; ncm: string
  preco: string; custo: string; mostrar_margem: boolean
  unidade: string; estoque: string; marca: string
  comprimento: string; largura: string; altura: string; peso: string
  fotos: string[]
  tem_variacao: boolean; variacoes: Variacao[]
}

function produtoVazio(): Produto {
  return {
    nome: "", descricao: "", sku: "", ncm: "",
    preco: "", custo: "", mostrar_margem: false,
    unidade: "", estoque: "", marca: "",
    comprimento: "", largura: "", altura: "", peso: "",
    fotos: Array(9).fill(""),
    tem_variacao: false, variacoes: [{ tipo: "Cor", itens: "", preco: "", imagem_url: "" }],
  }
}

// ─── Estilos base ─────────────────────────────────────────────
const PAGE: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(160deg, #0d0d0f 0%, #131016 60%, #0d0d0f 100%)",
  padding: "40px 24px 80px",
  fontFamily: "system-ui, -apple-system, sans-serif",
  position: "relative",
}
const CARD: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 14,
  padding: "22px 24px",
  marginBottom: 16,
}
const FIELD_LABEL: React.CSSProperties = {
  display: "block", color: "rgba(255,255,255,0.6)",
  fontSize: 13, fontWeight: 500, marginBottom: 6,
}
const INPUT: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8, padding: "11px 14px",
  color: "#fff", fontSize: 14, outline: "none",
  boxSizing: "border-box" as const,
}
const TEXTAREA: React.CSSProperties = {
  ...INPUT, resize: "vertical" as const, minHeight: 88, lineHeight: 1.5,
}
const SELECT: React.CSSProperties = {
  ...INPUT, appearance: "none" as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 36,
}
const GRID2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }
const RED = <span style={{ color: "#EC4899" }}>*</span>

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div style={GRID2}>{children}</div>
}
function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={FIELD_LABEL}>{label} {required && RED}</label>
      {children}
      {error && <p style={{ color: "#EC4899", fontSize: 12, margin: "5px 0 0" }}>{error}</p>}
    </div>
  )
}

// ─── Upload de arquivo ────────────────────────────────────────
function FileUpload({
  label, hint, accept, value, onUpload, uploading, error,
}: {
  label: string; hint: string; accept: string
  value: string; onUpload: (file: File) => Promise<void>; uploading: boolean; error?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <label style={FIELD_LABEL}>{label}</label>
      <div
        onClick={() => !uploading && ref.current?.click()}
        style={{
          border: error ? "1.5px dashed rgba(236,72,153,0.5)" : "1.5px dashed rgba(255,255,255,0.15)",
          borderRadius: 10, padding: "22px 16px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          cursor: uploading ? "wait" : "pointer",
          background: value ? "rgba(16,185,129,0.06)" : error ? "rgba(236,72,153,0.04)" : "rgba(255,255,255,0.03)",
          transition: "all 0.2s",
        }}
      >
        {uploading ? (
          <Loader2 size={22} style={{ color: "#EC4899", animation: "spin 1s linear infinite" }} />
        ) : value ? (
          <>
            <span style={{ fontSize: 20 }}>✅</span>
            <span style={{ color: "#34D399", fontSize: 13, fontWeight: 600 }}>Arquivo enviado</span>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Clique para substituir</span>
          </>
        ) : (
          <>
            <Upload size={22} style={{ color: "rgba(255,255,255,0.3)" }} />
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
              Clique para selecionar ou arraste aqui
            </span>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>{hint}</span>
          </>
        )}
      </div>
      {error && <p style={{ color: "#EC4899", fontSize: 12, margin: "5px 0 0" }}>{error}</p>}
      <input ref={ref} type="file" accept={accept} style={{ display: "none" }}
        onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
    </div>
  )
}

// ─── Exemplos de documento (SVG) ─────────────────────────────
const EXEMPLO_DOC = (
  <svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }}>
    <rect x="2" y="2" width="156" height="96" rx="8" fill="#1e1730" stroke="#5B3F8A" strokeWidth="1.5"/>
    <rect x="2" y="2" width="156" height="18" rx="8" fill="#2d2050"/>
    <rect x="2" y="10" width="156" height="10" fill="#2d2050"/>
    <text x="80" y="16" fontSize="7" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">IDENTIDADE  /  CNH  /  PASSAPORTE</text>
    <rect x="10" y="26" width="38" height="48" rx="4" fill="#2d2050" stroke="#5B3F8A" strokeWidth="1"/>
    <ellipse cx="29" cy="40" rx="9" ry="10" fill="#5B3F8A"/>
    <path d="M14 74 Q29 62 44 74" fill="#5B3F8A"/>
    <rect x="56" y="28" width="92" height="6" rx="3" fill="#5B3F8A" opacity="0.9"/>
    <rect x="56" y="40" width="68" height="5" rx="2.5" fill="#4a3d6b" opacity="0.7"/>
    <rect x="56" y="51" width="78" height="5" rx="2.5" fill="#4a3d6b" opacity="0.7"/>
    <rect x="56" y="62" width="56" height="5" rx="2.5" fill="#4a3d6b" opacity="0.7"/>
    <text x="80" y="93" fontSize="8" fill="rgba(255,255,255,0.25)" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">EXEMPLO</text>
  </svg>
)

const EXEMPLO_SELFIE = (
  <svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }}>
    <rect width="120" height="130" fill="#1a1525"/>
    <ellipse cx="60" cy="48" rx="24" ry="28" fill="#3d3060"/>
    <ellipse cx="51" cy="44" rx="4" ry="5" fill="#1a1525"/>
    <ellipse cx="69" cy="44" rx="4" ry="5" fill="#1a1525"/>
    <ellipse cx="51" cy="43" rx="2" ry="2.5" fill="#5B3F8A"/>
    <ellipse cx="69" cy="43" rx="2" ry="2.5" fill="#5B3F8A"/>
    <path d="M52 60 Q60 66 68 60" stroke="#1a1525" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M10 130 Q22 92 60 88 Q98 92 110 130Z" fill="#3d3060"/>
    <text x="60" y="124" fontSize="8" fill="rgba(255,255,255,0.25)" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">EXEMPLO</text>
  </svg>
)

const EXEMPLO_SELFIE_DOC = (
  <svg viewBox="0 0 150 130" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }}>
    <rect width="150" height="130" fill="#1a1525"/>
    <ellipse cx="75" cy="36" rx="20" ry="22" fill="#3d3060"/>
    <ellipse cx="67" cy="32" rx="3.5" ry="4" fill="#1a1525"/>
    <ellipse cx="83" cy="32" rx="3.5" ry="4" fill="#1a1525"/>
    <ellipse cx="67" cy="31" rx="1.8" ry="2" fill="#5B3F8A"/>
    <ellipse cx="83" cy="31" rx="1.8" ry="2" fill="#5B3F8A"/>
    <path d="M67 48 Q75 53 83 48" stroke="#1a1525" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <path d="M20 130 Q32 82 75 78 Q118 82 130 130Z" fill="#3d3060"/>
    <rect x="22" y="86" width="106" height="36" rx="7" fill="#2d2050" stroke="#5B3F8A" strokeWidth="1.5"/>
    <rect x="28" y="92" width="28" height="24" rx="3" fill="#3d3060" stroke="#5B3F8A" strokeWidth="1"/>
    <ellipse cx="42" cy="100" rx="6" ry="7" fill="#5B3F8A"/>
    <path d="M30 116 Q42 108 56 116" fill="#5B3F8A"/>
    <rect x="64" y="95" width="56" height="4" rx="2" fill="#5B3F8A" opacity="0.8"/>
    <rect x="64" y="104" width="40" height="3.5" rx="2" fill="#4a3d6b" opacity="0.6"/>
    <rect x="64" y="112" width="48" height="3.5" rx="2" fill="#4a3d6b" opacity="0.6"/>
    <text x="75" y="125" fontSize="7" fill="rgba(255,255,255,0.25)" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">EXEMPLO</text>
  </svg>
)

// ─── Upload com imagem de exemplo ────────────────────────────
function DocUploadExample({
  label, example, value, onUpload, uploading, error,
}: {
  label: string
  example: React.ReactNode
  value: string
  onUpload: (file: File) => Promise<void>
  uploading: boolean
  error?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <label style={FIELD_LABEL}>{label}</label>
      <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 12, alignItems: "stretch" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
          <span style={{
            fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>Amostra</span>
          <div style={{
            width: "100%", borderRadius: 8, overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            {example}
          </div>
        </div>
        <div
          onClick={() => !uploading && ref.current?.click()}
          style={{
            border: error ? "1.5px dashed rgba(236,72,153,0.5)" : "1.5px dashed rgba(255,255,255,0.15)",
            borderRadius: 10,
            padding: "16px 12px", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 6,
            cursor: uploading ? "wait" : "pointer",
            background: value ? "rgba(16,185,129,0.06)" : error ? "rgba(236,72,153,0.04)" : "rgba(255,255,255,0.03)",
            minHeight: 90,
          }}
        >
          {uploading ? (
            <Loader2 size={20} style={{ color: "#EC4899", animation: "spin 1s linear infinite" }} />
          ) : value ? (
            <>
              <span style={{ fontSize: 18 }}>✅</span>
              <span style={{ color: "#34D399", fontSize: 12, fontWeight: 600 }}>Enviado</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>Clique para substituir</span>
            </>
          ) : (
            <>
              <Upload size={20} style={{ color: "rgba(255,255,255,0.3)" }} />
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, textAlign: "center" }}>
                Clique para carregar
              </span>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>JPG ou PNG</span>
            </>
          )}
        </div>
        <input ref={ref} type="file" accept="image/*" style={{ display: "none" }}
          onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
      </div>
      {error && <p style={{ color: "#EC4899", fontSize: 12, margin: "5px 0 0" }}>{error}</p>}
    </div>
  )
}

// ─── Progress steps ───────────────────────────────────────────
function Steps({ current }: { current: number }) {
  const steps = [
    { n: 1, label: "Empresa" },
    { n: 2, label: "Loja" },
    { n: 3, label: "Produtos" },
  ]
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32, gap: 0 }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: s.n < current
                ? "linear-gradient(135deg,#EC4899,#8B5CF6)"
                : s.n === current
                  ? "transparent"
                  : "rgba(255,255,255,0.06)",
              border: s.n === current
                ? "2px solid #EC4899"
                : s.n < current ? "none" : "2px solid rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: s.n <= current ? "#fff" : "rgba(255,255,255,0.3)",
              fontWeight: 700, fontSize: 14,
              boxShadow: s.n === current ? "0 0 0 4px rgba(236,72,153,0.15)" : "none",
            }}>
              {s.n < current ? (
                <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                  <path d="M1 5.5L5 9.5L13 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : s.n}
            </div>
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: s.n === current ? "#EC4899" : s.n < current ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)",
            }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              width: 80, height: 2, marginBottom: 20,
              background: s.n < current
                ? "linear-gradient(90deg,#EC4899,#8B5CF6)"
                : "rgba(255,255,255,0.08)",
              transition: "all 0.3s",
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Botões de navegação ──────────────────────────────────────
function NavButtons({
  step, loading, onVoltar, onProximo, labelProximo,
}: {
  step: number; loading: boolean
  onVoltar?: () => void; onProximo: () => void; labelProximo: string
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, gap: 12 }}>
      {step > 1 ? (
        <button onClick={onVoltar} style={{
          padding: "12px 24px", background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
          color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}>
          ← Voltar
        </button>
      ) : <div />}
      <button
        onClick={onProximo} disabled={loading}
        style={{
          padding: "12px 28px",
          background: loading
            ? "rgba(255,255,255,0.08)"
            : "linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #06B6D4 100%)",
          border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer",
          color: "#fff", fontSize: 14, fontWeight: 700,
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: loading ? "none" : "0 4px 20px rgba(236,72,153,0.25)",
        }}
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Salvando..." : labelProximo}
      </button>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────
export default function FormularioPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [verificando, setVerificando] = useState(true)
  const [habId, setHabId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  function clearError(key: string) {
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  // Etapa 1 – Empresa
  const [etapa1Pulada, setEtapa1Pulada] = useState(false)
  const [nomeEmpresa, setNomeEmpresa] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [dataConst, setDataConst] = useState("")
  const [endComercial, setEndComercial] = useState("")
  const [cnpjDocUrl, setCnpjDocUrl] = useState("")
  // Representante
  const [repNome, setRepNome] = useState("")
  const [repNascimento, setRepNascimento] = useState("")
  const [repNacionalidade, setRepNacionalidade] = useState("")
  const [repEndereco, setRepEndereco] = useState("")
  const [repComprovanteUrl, setRepComprovanteUrl] = useState("")

  // Etapa 2 – Loja
  const [inscricaoEstadual, setInscricaoEstadual] = useState("")
  const [nicho, setNicho] = useState("")
  const [subnicho, setSubnicho] = useState("")
  const [certificadoUrl, setCertificadoUrl] = useState("")
  const [senhaCertificado, setSenhaCertificado] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [tipoDocumento, setTipoDocumento] = useState("RG")
  const [docFrenteUrl, setDocFrenteUrl] = useState("")
  const [selfieUrl, setSelfieUrl] = useState("")
  const [selfieDocUrl, setSelfieDocUrl] = useState("")
  const [jaHabilitouLoja, setJaHabilitouLoja] = useState(false)

  // Etapa 3 – Produtos
  const [produtos, setProdutos] = useState<Produto[]>([produtoVazio()])

  // ─── Verificação de auth e carregamento de dados ──────────
  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/habilitacao"); return }
      setUserId(user.id)

      const { data: hab } = await supabase
        .from("habilitacoes")
        .select("*")
        .maybeSingle()

      if (!hab) { router.push("/habilitacao/termos"); return }
      if (!hab.termos_aceitos_at) { router.push("/habilitacao/termos"); return }
      if (hab.status === "enviado") { router.push("/habilitacao/concluido"); return }

      setHabId(hab.id)
      if (hab.etapa_atual) setStep(hab.etapa_atual)

      // Preencher campos com dados salvos
      if (hab.nome_empresa) setNomeEmpresa(hab.nome_empresa)
      if (hab.cnpj) setCnpj(hab.cnpj)
      if (hab.data_constituicao) setDataConst(hab.data_constituicao)
      if (hab.endereco_comercial) setEndComercial(hab.endereco_comercial)
      if (hab.cnpj_doc_url) setCnpjDocUrl(hab.cnpj_doc_url)
      if (hab.rep_nome) setRepNome(hab.rep_nome)
      if (hab.rep_data_nascimento) setRepNascimento(hab.rep_data_nascimento)
      if (hab.rep_nacionalidade) setRepNacionalidade(hab.rep_nacionalidade)
      if (hab.rep_endereco) setRepEndereco(hab.rep_endereco)
      if (hab.rep_comprovante_url) setRepComprovanteUrl(hab.rep_comprovante_url)
      if (hab.inscricao_estadual) setInscricaoEstadual(hab.inscricao_estadual)
      if (hab.nicho) setNicho(hab.nicho)
      if (hab.subnicho) setSubnicho(hab.subnicho)
      if (hab.certificado_url) setCertificadoUrl(hab.certificado_url)
      if (hab.senha_certificado) setSenhaCertificado(hab.senha_certificado)
      if (hab.tipo_documento) setTipoDocumento(hab.tipo_documento)
      if (hab.doc_frente_url) setDocFrenteUrl(hab.doc_frente_url)
      if (hab.selfie_url) setSelfieUrl(hab.selfie_url)
      if (hab.selfie_doc_url) setSelfieDocUrl(hab.selfie_doc_url)
      if (hab.ja_habilitou_loja) setJaHabilitouLoja(hab.ja_habilitou_loja)
      if (hab.etapa1_pulada) setEtapa1Pulada(hab.etapa1_pulada)
      if (hab.produtos?.length) setProdutos(hab.produtos)

      setVerificando(false)
    }
    init()
  }, [router])

  // ─── Upload genérico para Supabase Storage ─────────────────
  async function uploadFile(file: File, campo: string): Promise<string> {
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const path = `${userId}/${campo}-${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from("habilitacao")
      .upload(path, file, { upsert: true })
    if (error) throw error
    // Tenta URL pública primeiro; se o bucket for privado, gera signed URL (1 ano)
    const { data: urlData } = supabase.storage.from("habilitacao").getPublicUrl(data.path)
    const publicUrl = urlData.publicUrl
    // Verifica se a URL pública é acessível (bucket pode ser privado)
    try {
      const check = await fetch(publicUrl, { method: "HEAD" })
      if (check.ok) return publicUrl
    } catch { /* ignora erro de rede */ }
    // Fallback: signed URL válida por 1 ano
    const { data: signed, error: signErr } = await supabase.storage
      .from("habilitacao")
      .createSignedUrl(data.path, 60 * 60 * 24 * 365)
    if (signErr || !signed) throw signErr ?? new Error("Erro ao gerar URL")
    return signed.signedUrl
  }

  async function handleUpload(file: File, campo: string, setter: (url: string) => void) {
    setUploadingField(campo)
    try {
      const url = await uploadFile(file, campo)
      setter(url)
    } catch {
      alert("Erro ao enviar arquivo. Verifique o bucket 'habilitacao' no Supabase Storage.")
    } finally {
      setUploadingField(null)
    }
  }

  async function uploadFotoProduto(file: File, prodIdx: number, fotoIdx: number) {
    const campo = `produto-${prodIdx}-foto-${fotoIdx}`
    setUploadingField(campo)
    try {
      const url = await uploadFile(file, campo)
      setProdutos(prev => {
        const novo = [...prev]
        const fotos = [...novo[prodIdx].fotos]
        fotos[fotoIdx] = url
        novo[prodIdx] = { ...novo[prodIdx], fotos }
        return novo
      })
    } catch {
      alert("Erro ao enviar foto.")
    } finally {
      setUploadingField(null)
    }
  }

  async function uploadVariacaoImagem(file: File, prodIdx: number, varIdx: number) {
    const campo = `produto-${prodIdx}-var-${varIdx}`
    setUploadingField(campo)
    try {
      const url = await uploadFile(file, campo)
      setProdutos(prev => {
        const novo = [...prev]
        const variacoes = [...novo[prodIdx].variacoes]
        variacoes[varIdx] = { ...variacoes[varIdx], imagem_url: url }
        novo[prodIdx] = { ...novo[prodIdx], variacoes }
        return novo
      })
    } catch {
      alert("Erro ao enviar imagem.")
    } finally {
      setUploadingField(null)
    }
  }

  // ─── Salvar etapa ──────────────────────────────────────────
  async function salvarEtapa(dados: Record<string, unknown>, proximaEtapa: number) {
    const supabase = createClient()
    await supabase.from("habilitacoes")
      .update({ ...dados, etapa_atual: proximaEtapa })
      .eq("id", habId)
  }

  // ─── Navegação ─────────────────────────────────────────────
  async function avancarEtapa1() {
    setErrors({})
    setLoading(true)
    await salvarEtapa({
      nome_empresa: nomeEmpresa || null, cnpj: cnpj || null, data_constituicao: dataConst || null,
      endereco_comercial: endComercial || null, cnpj_doc_url: cnpjDocUrl || null,
      rep_nome: repNome || null, rep_data_nascimento: repNascimento || null,
      rep_nacionalidade: repNacionalidade || null, rep_endereco: repEndereco || null,
      rep_comprovante_url: repComprovanteUrl || null,
      etapa1_pulada: etapa1Pulada,
    }, 2)
    setLoading(false)
    setStep(2)
    window.scrollTo(0, 0)
  }

  async function avancarEtapa2() {
    setErrors({})
    setLoading(true)
    await salvarEtapa({
      inscricao_estadual: inscricaoEstadual || null, nicho: nicho || null, subnicho: subnicho || null,
      certificado_url: certificadoUrl || null, senha_certificado: senhaCertificado || null,
      tipo_documento: tipoDocumento,
      doc_frente_url: docFrenteUrl || null,
      selfie_url: selfieUrl || null,
      selfie_doc_url: selfieDocUrl || null,
      ja_habilitou_loja: jaHabilitouLoja,
    }, 3)
    setLoading(false)
    setStep(3)
    window.scrollTo(0, 0)
  }

  async function enviarFormulario() {
    setErrors({})
    setLoading(true)
    const supabase = createClient()
    await supabase.from("habilitacoes").update({
      produtos, status: "enviado", etapa_atual: 3,
    }).eq("id", habId)
    setLoading(false)
    router.push("/habilitacao/concluido")
  }

  function updateProduto<K extends keyof Produto>(idx: number, campo: K, valor: Produto[K]) {
    setProdutos(prev => {
      const novo = [...prev]
      novo[idx] = { ...novo[idx], [campo]: valor }
      return novo
    })
  }

  function calcularMargem(p: Produto) {
    const preco = parseFloat(p.preco.replace(",", "."))
    const custo = parseFloat(p.custo.replace(",", "."))
    if (!preco || !custo || custo >= preco) return null
    return (((preco - custo) / preco) * 100).toFixed(1)
  }

  if (verificando) {
    return (
      <div style={{ ...PAGE, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={28} style={{ color: "#EC4899", animation: "spin 1s linear infinite" }} />
      </div>
    )
  }

  return (
    <div style={PAGE}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: "15%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 800, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
        }} />
      </div>

      <div style={{ width: "100%", maxWidth: 680, margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 999, padding: "5px 14px",
            color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 600,
            letterSpacing: "0.05em", textTransform: "uppercase",
          }}>
            📋 Formulário de Habilitação
          </span>
        </div>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>
            Habilite sua loja no{" "}
            <span style={{
              background: "linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #06B6D4 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              TikTok Shop
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>
            Preencha as informações abaixo em 3 etapas. Seus dados ficam protegidos e serão usados exclusivamente para o processo de habilitação da sua loja.
          </p>
        </div>

        <Steps current={step} />

        {/* ════════════════════════════════════════════════════ */}
        {/* ETAPA 1 – Empresa + Representante Legal              */}
        {/* ════════════════════════════════════════════════════ */}
        {step === 1 && (
          <>
            <button
              type="button"
              onClick={() => setEtapa1Pulada(!etapa1Pulada)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                textAlign: "left", width: "100%", marginBottom: 16,
                background: etapa1Pulada ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
                border: etapa1Pulada ? "1.5px solid rgba(52,211,153,0.4)" : "1.5px solid rgba(255,255,255,0.12)",
              }}
            >
              <span style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: etapa1Pulada ? "linear-gradient(135deg,#EC4899,#8B5CF6)" : "rgba(255,255,255,0.08)",
                border: etapa1Pulada ? "none" : "1.5px solid rgba(255,255,255,0.2)",
              }}>
                {etapa1Pulada && (
                  <svg width="12" height="9" viewBox="0 0 14 11" fill="none">
                    <path d="M1 5.5L5 9.5L13 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <span style={{ color: etapa1Pulada ? "#34D399" : "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600 }}>
                ✅ Já fiz a Etapa 1 (habilitação da loja)
                <span style={{ display: "block", color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 400, marginTop: 2 }}>
                  Marque se os dados da empresa e do representante já foram tratados por outro canal — assim você pula direto para o cadastro de produtos
                </span>
              </span>
            </button>

            {!etapa1Pulada && (
            <>
            {/* Informações da Empresa */}
            <div style={CARD}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 22 }}>🏢</span>
                <div>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>Informações da Empresa</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>Dados de registro para abertura da conta no TikTok Shop</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="Nome da empresa" error={errors.nomeEmpresa}>
                  <input style={{ ...INPUT, borderColor: errors.nomeEmpresa ? "rgba(236,72,153,0.5)" : undefined }}
                    value={nomeEmpresa} onChange={e => { setNomeEmpresa(e.target.value); clearError("nomeEmpresa") }}
                    placeholder="Razão social completa" />
                </Field>

                <FieldRow>
                  <Field label="CNPJ" error={errors.cnpj}>
                    <input style={{ ...INPUT, borderColor: errors.cnpj ? "rgba(236,72,153,0.5)" : undefined }}
                      value={cnpj} onChange={e => { setCnpj(e.target.value); clearError("cnpj") }}
                      placeholder="00.000.000/0001-00" />
                  </Field>
                  <Field label="Data de constituição" error={errors.dataConst}>
                    <input style={{ ...INPUT, borderColor: errors.dataConst ? "rgba(236,72,153,0.5)" : undefined }}
                      type="date" value={dataConst} onChange={e => { setDataConst(e.target.value); clearError("dataConst") }} />
                  </Field>
                </FieldRow>

                <Field label="Endereço comercial principal" error={errors.endComercial}>
                  <input style={{ ...INPUT, borderColor: errors.endComercial ? "rgba(236,72,153,0.5)" : undefined }}
                    value={endComercial} onChange={e => { setEndComercial(e.target.value); clearError("endComercial") }}
                    placeholder="Rua, número, bairro, cidade – UF, CEP" />
                </Field>

                <FileUpload
                  label="Comprovante de inscrição no CNPJ"
                  hint="PDF, JPG ou PNG · Cartão CNPJ ou Comprovante de Inscrição Federal"
                  accept=".pdf,.jpg,.jpeg,.png"
                  value={cnpjDocUrl}
                  uploading={uploadingField === "cnpj_doc"}
                  onUpload={f => handleUpload(f, "cnpj_doc", setCnpjDocUrl)}
                />
              </div>
            </div>

            {/* Representante Legal */}
            <div style={CARD}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 22 }}>👤</span>
                <div>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>Representante Legal</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>Identificação do responsável pelo cadastro</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="Nome civil completo" error={errors.repNome}>
                  <input style={{ ...INPUT, borderColor: errors.repNome ? "rgba(236,72,153,0.5)" : undefined }}
                    value={repNome} onChange={e => { setRepNome(e.target.value); clearError("repNome") }}
                    placeholder="Conforme documento oficial (RG/CNH)" />
                </Field>

                <FieldRow>
                  <Field label="Data de nascimento" error={errors.repNascimento}>
                    <input style={{ ...INPUT, borderColor: errors.repNascimento ? "rgba(236,72,153,0.5)" : undefined }}
                      type="date" value={repNascimento} onChange={e => { setRepNascimento(e.target.value); clearError("repNascimento") }} />
                  </Field>
                  <Field label="Nacionalidade" error={errors.repNacionalidade}>
                    <input style={{ ...INPUT, borderColor: errors.repNacionalidade ? "rgba(236,72,153,0.5)" : undefined }}
                      value={repNacionalidade} onChange={e => { setRepNacionalidade(e.target.value); clearError("repNacionalidade") }}
                      placeholder="Ex: Brasileira" />
                  </Field>
                </FieldRow>

                <Field label="Endereço residencial" error={errors.repEndereco}>
                  <input style={{ ...INPUT, borderColor: errors.repEndereco ? "rgba(236,72,153,0.5)" : undefined }}
                    value={repEndereco} onChange={e => { setRepEndereco(e.target.value); clearError("repEndereco") }}
                    placeholder="Rua, número, bairro, cidade – UF, CEP" />
                </Field>

                <FileUpload
                  label="Comprovante de residência (opcional)"
                  hint="PDF, JPG ou PNG · Conta de água, luz, gás ou banco — máx. 90 dias"
                  accept=".pdf,.jpg,.jpeg,.png"
                  value={repComprovanteUrl}
                  uploading={uploadingField === "rep_comprovante"}
                  onUpload={f => handleUpload(f, "rep_comprovante", setRepComprovanteUrl)}
                />
              </div>
            </div>
            </>
            )}

            <NavButtons step={1} loading={loading} onProximo={avancarEtapa1} labelProximo="Próximo: Dados da Loja →" />
          </>
        )}

        {/* ════════════════════════════════════════════════════ */}
        {/* ETAPA 2 – Dados da Loja                             */}
        {/* ════════════════════════════════════════════════════ */}
        {step === 2 && (
          <>
            <button
              type="button"
              onClick={() => setJaHabilitouLoja(!jaHabilitouLoja)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                textAlign: "left", width: "100%", marginBottom: 16,
                background: jaHabilitouLoja ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
                border: jaHabilitouLoja ? "1.5px solid rgba(52,211,153,0.4)" : "1.5px solid rgba(255,255,255,0.12)",
              }}
            >
              <span style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: jaHabilitouLoja ? "linear-gradient(135deg,#EC4899,#8B5CF6)" : "rgba(255,255,255,0.08)",
                border: jaHabilitouLoja ? "none" : "1.5px solid rgba(255,255,255,0.2)",
              }}>
                {jaHabilitouLoja && (
                  <svg width="12" height="9" viewBox="0 0 14 11" fill="none">
                    <path d="M1 5.5L5 9.5L13 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <span style={{ color: jaHabilitouLoja ? "#34D399" : "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600 }}>
                ✅ Já habilitei a loja
                <span style={{ display: "block", color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 400, marginTop: 2 }}>
                  Marque se você já fez a habilitação da loja por conta própria — assim não precisa preencher os dados da loja nem enviar os documentos abaixo
                </span>
              </span>
            </button>

            {!jaHabilitouLoja && (
            <>
            <div style={CARD}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 22 }}>🏪</span>
                <div>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>Dados da Loja</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>Informações fiscais e certificado para integração</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="Inscrição estadual" error={errors.inscricaoEstadual}>
                  <input style={{ ...INPUT, borderColor: errors.inscricaoEstadual ? "rgba(236,72,153,0.5)" : undefined }}
                    value={inscricaoEstadual} onChange={e => { setInscricaoEstadual(e.target.value); clearError("inscricaoEstadual") }}
                    placeholder="Número da inscrição estadual" />
                </Field>

                <FieldRow>
                  <Field label="Nicho" error={errors.nicho}>
                    <input style={{ ...INPUT, borderColor: errors.nicho ? "rgba(236,72,153,0.5)" : undefined }}
                      value={nicho} onChange={e => { setNicho(e.target.value); clearError("nicho") }}
                      placeholder="Ex: Moda, Eletrônicos, Beleza" />
                  </Field>
                  <Field label="Subnicho" error={errors.subnicho}>
                    <input style={{ ...INPUT, borderColor: errors.subnicho ? "rgba(236,72,153,0.5)" : undefined }}
                      value={subnicho} onChange={e => { setSubnicho(e.target.value); clearError("subnicho") }}
                      placeholder="Ex: Moda Feminina, Skincare" />
                  </Field>
                </FieldRow>

                <FileUpload
                  label="Certificado digital A1 (.PFX / .P12)"
                  hint=".PFX ou .P12"
                  accept=".pfx,.p12"
                  value={certificadoUrl}
                  uploading={uploadingField === "certificado"}
                  onUpload={f => handleUpload(f, "certificado", setCertificadoUrl)}
                />

                <Field label="Senha do certificado digital" error={errors.senhaCertificado}>
                  <div style={{ position: "relative" }}>
                    <input
                      type={mostrarSenha ? "text" : "password"}
                      style={{ ...INPUT, paddingRight: 44, borderColor: errors.senhaCertificado ? "rgba(236,72,153,0.5)" : undefined }}
                      value={senhaCertificado}
                      onChange={e => { setSenhaCertificado(e.target.value); clearError("senhaCertificado") }}
                      placeholder="Senha de acesso ao arquivo .PFX"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      style={{
                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "rgba(255,255,255,0.35)", padding: 0, display: "flex",
                      }}
                    >
                      {mostrarSenha ? "🙈" : "👁"}
                    </button>
                  </div>
                </Field>

                {/* Info de segurança */}
                <div style={{
                  background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)",
                  borderRadius: 10, padding: "12px 16px",
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <span style={{ color: "#06B6D4", fontSize: 14, flexShrink: 0 }}>🔒</span>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 1.6, margin: 0 }}>
                    Os dados são transmitidos via HTTPS e armazenados com criptografia. A senha do certificado é usada exclusivamente para habilitar sua loja no TikTok Shop e realizar a integração fiscal.
                  </p>
                </div>
              </div>
            </div>

            {/* Documentos de identidade */}
            <div style={CARD}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 22 }}>🪪</span>
                <div>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>Documentos de Identidade</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>Necessários para validar o representante legal no TikTok Shop</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <Field label="Qual documento você irá usar para a habilitação?">
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {["RG", "CNH", "Passaporte"].map(doc => {
                          const ativo = tipoDocumento === doc
                          return (
                            <button
                              key={doc} type="button"
                              onClick={() => setTipoDocumento(doc)}
                              style={{
                                padding: "9px 20px",
                                background: ativo
                                  ? "linear-gradient(135deg,#EC4899,#8B5CF6)"
                                  : "rgba(255,255,255,0.06)",
                                border: ativo ? "none" : "1px solid rgba(255,255,255,0.12)",
                                borderRadius: 8, cursor: "pointer",
                                color: ativo ? "#fff" : "rgba(255,255,255,0.4)",
                                fontSize: 14, fontWeight: 600,
                              }}
                            >{doc}</button>
                          )
                        })}
                      </div>
                    </Field>

                    <DocUploadExample
                      label={`Carregue uma imagem bem posicionada do ${tipoDocumento} (parte da frente)`}
                      example={EXEMPLO_DOC}
                      value={docFrenteUrl}
                      uploading={uploadingField === "doc_frente"}
                      onUpload={f => { clearError("docFrenteUrl"); return handleUpload(f, "doc_frente", setDocFrenteUrl) }}
                      error={errors.docFrenteUrl}
                    />

                    <DocUploadExample
                      label={`Selfie do titular da ${tipoDocumento === "Passaporte" ? "passaporte" : "identidade"}`}
                      example={EXEMPLO_SELFIE}
                      value={selfieUrl}
                      uploading={uploadingField === "selfie"}
                      onUpload={f => { clearError("selfieUrl"); return handleUpload(f, "selfie", setSelfieUrl) }}
                      error={errors.selfieUrl}
                    />

                    <DocUploadExample
                      label={`Selfie com o documento de ${tipoDocumento === "Passaporte" ? "passaporte" : "identidade"}`}
                      example={EXEMPLO_SELFIE_DOC}
                      value={selfieDocUrl}
                      uploading={uploadingField === "selfie_doc"}
                      onUpload={f => { clearError("selfieDocUrl"); return handleUpload(f, "selfie_doc", setSelfieDocUrl) }}
                      error={errors.selfieDocUrl}
                    />
              </div>
            </div>
            </>
            )}

            <NavButtons
              step={2} loading={loading}
              onVoltar={() => { setStep(1); window.scrollTo(0, 0) }}
              onProximo={avancarEtapa2}
              labelProximo="Próximo: Produtos →"
            />
          </>
        )}

        {/* ════════════════════════════════════════════════════ */}
        {/* ETAPA 3 – Produtos                                  */}
        {/* ════════════════════════════════════════════════════ */}
        {step === 3 && (
          <>
            <div style={CARD}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <span style={{ fontSize: 22 }}>📦</span>
                <div>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>Cadastro de Produtos</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>Campos obrigatórios para migração ao Bling</p>
                </div>
              </div>
            </div>

            {produtos.map((p, pi) => (
              <div key={pi} style={{
                ...CARD,
                border: "1px solid rgba(236,72,153,0.15)",
                background: "rgba(236,72,153,0.03)",
              }}>
                {/* Cabeçalho produto */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <span style={{
                    color: "#EC4899", fontWeight: 700, fontSize: 14,
                    background: "rgba(236,72,153,0.12)", padding: "4px 12px", borderRadius: 6,
                  }}>
                    Produto #{pi + 1}
                  </span>
                  {produtos.length > 1 && (
                    <button
                      onClick={() => setProdutos(prev => prev.filter((_, i) => i !== pi))}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "rgba(255,255,255,0.3)", fontSize: 13,
                        display: "flex", alignItems: "center", gap: 4,
                      }}
                    >
                      <X size={14} /> Remover
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Field label="Nome" error={errors[`produto_${pi}_nome`]}>
                    <input style={{ ...INPUT, borderColor: errors[`produto_${pi}_nome`] ? "rgba(236,72,153,0.5)" : undefined }}
                      value={p.nome}
                      onChange={e => { updateProduto(pi, "nome", e.target.value); clearError(`produto_${pi}_nome`) }}
                      placeholder="Nome do produto" />
                  </Field>

                  <Field label="Descrição">
                    <textarea style={TEXTAREA} value={p.descricao}
                      onChange={e => updateProduto(pi, "descricao", e.target.value)}
                      placeholder="Descrição detalhada do produto..." />
                  </Field>

                  <FieldRow>
                    <Field label="SKU (código específico, se desejar)">
                      <input style={INPUT} value={p.sku}
                        onChange={e => updateProduto(pi, "sku", e.target.value)}
                        placeholder="Sugestivo ou defina o seu" />
                    </Field>
                    <Field label="NCM" error={errors[`produto_${pi}_ncm`]}>
                      <input style={{ ...INPUT, borderColor: errors[`produto_${pi}_ncm`] ? "rgba(236,72,153,0.5)" : undefined }}
                        value={p.ncm}
                        onChange={e => { updateProduto(pi, "ncm", e.target.value); clearError(`produto_${pi}_ncm`) }}
                        placeholder="Ex: 6203.42.00" />
                    </Field>
                  </FieldRow>

                  <FieldRow>
                    <Field label="Preço de venda (R$)" error={errors[`produto_${pi}_preco`]}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input style={{ ...INPUT, flex: 1, borderColor: errors[`produto_${pi}_preco`] ? "rgba(236,72,153,0.5)" : undefined }}
                          value={p.preco}
                          onChange={e => { updateProduto(pi, "preco", e.target.value); clearError(`produto_${pi}_preco`) }}
                          placeholder="Ex: 89,90" />
                        <button
                          type="button"
                          onClick={() => updateProduto(pi, "mostrar_margem", !p.mostrar_margem)}
                          style={{
                            padding: "0 12px", background: p.mostrar_margem
                              ? "linear-gradient(135deg,#EC4899,#8B5CF6)"
                              : "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 8, cursor: "pointer",
                            color: "#fff", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
                          }}
                        >
                          % Margem
                        </button>
                      </div>
                      {p.mostrar_margem && (
                        <div style={{ marginTop: 8 }}>
                          <input style={{ ...INPUT, marginBottom: 6 }} value={p.custo}
                            onChange={e => updateProduto(pi, "custo", e.target.value)}
                            placeholder="Custo (R$)" />
                          {calcularMargem(p) && (
                            <span style={{ color: "#34D399", fontSize: 12 }}>
                              Margem: {calcularMargem(p)}%
                            </span>
                          )}
                        </div>
                      )}
                    </Field>
                    <Field label="Unidade" error={errors[`produto_${pi}_unidade`]}>
                      <select style={{ ...SELECT, borderColor: errors[`produto_${pi}_unidade`] ? "rgba(236,72,153,0.5)" : undefined }}
                        value={p.unidade}
                        onChange={e => { updateProduto(pi, "unidade", e.target.value); clearError(`produto_${pi}_unidade`) }}>
                        <option value="" style={{ background: "#1a1a1a" }}>Selecione</option>
                        {["UN", "PC", "KG", "CX", "PR", "L", "M"].map(u => (
                          <option key={u} value={u} style={{ background: "#1a1a1a" }}>{u}</option>
                        ))}
                      </select>
                    </Field>
                  </FieldRow>

                  <FieldRow>
                    <Field label="Estoque atual" error={errors[`produto_${pi}_estoque`]}>
                      <input style={{ ...INPUT, borderColor: errors[`produto_${pi}_estoque`] ? "rgba(236,72,153,0.5)" : undefined }}
                        value={p.estoque} type="number"
                        onChange={e => { updateProduto(pi, "estoque", e.target.value); clearError(`produto_${pi}_estoque`) }}
                        placeholder="Ex: 50" />
                    </Field>
                    <Field label="Marca">
                      <input style={INPUT} value={p.marca}
                        onChange={e => updateProduto(pi, "marca", e.target.value)}
                        placeholder="Nome da marca" />
                    </Field>
                  </FieldRow>

                  {/* Dimensões */}
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
                      Dimensões do produto
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                      {([
                        ["comprimento", "Comprimento (cm)"],
                        ["largura", "Largura (cm)"],
                        ["altura", "Altura (cm)"],
                        ["peso", "Peso (kg)"],
                      ] as [keyof Produto, string][]).map(([campo, label]) => {
                        const errKey = `produto_${pi}_${campo}`
                        return (
                          <div key={campo}>
                            <label style={{ ...FIELD_LABEL, fontSize: 11 }}>
                              {label}
                            </label>
                            <input
                              style={{ ...INPUT, fontSize: 13, borderColor: errors[errKey] ? "rgba(236,72,153,0.5)" : undefined }}
                              value={p[campo] as string}
                              onChange={e => { updateProduto(pi, campo, e.target.value); clearError(errKey) }}
                              placeholder="Ex: 30" type="number" />
                            {errors[errKey] && <p style={{ color: "#EC4899", fontSize: 11, margin: "3px 0 0" }}>{errors[errKey]}</p>}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Fotos */}
                  <div>
                    <label style={FIELD_LABEL}>
                      Fotos do produto{" "}
                      <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>
                        (até 9 — primeira é a capa)
                      </span>
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                      {p.fotos.map((foto, fi) => {
                        const campo = `produto-${pi}-foto-${fi}`
                        const isUploading = uploadingField === campo
                        return (
                          <label key={fi} style={{
                            aspectRatio: "1",
                            border: foto
                              ? "1.5px solid rgba(236,72,153,0.3)"
                              : "1.5px dashed rgba(255,255,255,0.1)",
                            borderRadius: 8, cursor: "pointer",
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center", gap: 6,
                            background: foto ? "rgba(236,72,153,0.06)" : "rgba(255,255,255,0.03)",
                            overflow: "hidden", position: "relative",
                          }}>
                            {foto ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={foto} alt={`Foto ${fi + 1}`}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                            ) : isUploading ? (
                              <Loader2 size={18} style={{ color: "#EC4899", animation: "spin 1s linear infinite" }} />
                            ) : (
                              <>
                                <ImageIcon size={18} style={{ color: "rgba(255,255,255,0.2)" }} />
                                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>
                                  {fi === 0 ? "Foto 1 (capa)" : `Foto ${fi + 1}`}
                                </span>
                              </>
                            )}
                            <input type="file" accept="image/*" style={{ display: "none" }}
                              onChange={e => e.target.files?.[0] && uploadFotoProduto(e.target.files[0], pi, fi)} />
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Variação */}
                  <div>
                    <label style={FIELD_LABEL}>Variação</label>
                    <div style={{ display: "flex", gap: 6, marginBottom: p.tem_variacao ? 16 : 0 }}>
                      {["Não", "Sim"].map((v) => {
                        const ativo = v === "Sim" ? p.tem_variacao : !p.tem_variacao
                        return (
                          <button
                            key={v} type="button"
                            onClick={() => updateProduto(pi, "tem_variacao", v === "Sim")}
                            style={{
                              padding: "8px 20px",
                              background: ativo
                                ? "linear-gradient(135deg,#EC4899,#8B5CF6)"
                                : "rgba(255,255,255,0.06)",
                              border: ativo ? "none" : "1px solid rgba(255,255,255,0.12)",
                              borderRadius: 8, cursor: "pointer",
                              color: ativo ? "#fff" : "rgba(255,255,255,0.4)",
                              fontSize: 14, fontWeight: 600,
                            }}
                          >{v}</button>
                        )
                      })}
                    </div>

                    {p.tem_variacao && p.variacoes.map((v, vi) => (
                      <div key={vi} style={{
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 10, padding: "14px 16px", marginBottom: 10,
                        background: "rgba(255,255,255,0.03)",
                      }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                          <select
                            style={{ ...SELECT, flex: "0 0 120px" }}
                            value={v.tipo}
                            onChange={e => {
                              const variacoes = [...p.variacoes]
                              variacoes[vi] = { ...variacoes[vi], tipo: e.target.value }
                              updateProduto(pi, "variacoes", variacoes)
                            }}
                          >
                            {["Cor", "Tamanho", "Material", "Outro"].map(t => (
                              <option key={t} value={t} style={{ background: "#1a1a1a" }}>{t}</option>
                            ))}
                          </select>
                          <input
                            style={{ ...INPUT, flex: 1 }}
                            value={v.itens}
                            onChange={e => {
                              const variacoes = [...p.variacoes]
                              variacoes[vi] = { ...variacoes[vi], itens: e.target.value }
                              updateProduto(pi, "variacoes", variacoes)
                            }}
                            placeholder="Itens: Azul, Vermelho, Preto..." />
                          {p.variacoes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                updateProduto(pi, "variacoes", p.variacoes.filter((_, i) => i !== vi))
                              }}
                              style={{
                                background: "none", border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: 8, cursor: "pointer",
                                color: "rgba(255,255,255,0.3)", padding: "0 10px",
                              }}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>

                        <FieldRow>
                          <div>
                            <label style={{ ...FIELD_LABEL, fontSize: 12 }}>Preço (R$)</label>
                            <input style={{ ...INPUT, fontSize: 13 }} value={v.preco}
                              onChange={e => {
                                const variacoes = [...p.variacoes]
                                variacoes[vi] = { ...variacoes[vi], preco: e.target.value }
                                updateProduto(pi, "variacoes", variacoes)
                              }}
                              placeholder="Ex: 89,90" />
                          </div>
                          <div>
                            <label style={{ ...FIELD_LABEL, fontSize: 12 }}>Imagem da variação</label>
                            <label style={{
                              display: "flex", alignItems: "center", justifyContent: "center",
                              gap: 6, height: 42,
                              border: v.imagem_url
                                ? "1.5px solid rgba(52,211,153,0.4)"
                                : "1.5px dashed rgba(255,255,255,0.12)",
                              borderRadius: 8, cursor: "pointer",
                              background: v.imagem_url ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.03)",
                              color: "rgba(255,255,255,0.3)", fontSize: 12,
                            }}>
                              {uploadingField === `produto-${pi}-var-${vi}` ? (
                                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                              ) : v.imagem_url ? (
                                <span style={{ color: "#34D399" }}>✅ Enviado</span>
                              ) : (
                                <><Upload size={14} /> Enviar foto</>
                              )}
                              <input type="file" accept="image/*" style={{ display: "none" }}
                                onChange={e => e.target.files?.[0] && uploadVariacaoImagem(e.target.files[0], pi, vi)} />
                            </label>
                          </div>
                        </FieldRow>
                      </div>
                    ))}

                    {p.tem_variacao && (
                      <button
                        type="button"
                        onClick={() => updateProduto(pi, "variacoes", [
                          ...p.variacoes,
                          { tipo: "Cor", itens: "", preco: "", imagem_url: "" },
                        ])}
                        style={{
                          width: "100%", padding: "10px 0",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px dashed rgba(255,255,255,0.12)",
                          borderRadius: 8, cursor: "pointer",
                          color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        }}
                      >
                        <Plus size={14} /> Adicionar variação
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Botão adicionar produto */}
            <button
              type="button"
              onClick={() => setProdutos(prev => [...prev, produtoVazio()])}
              style={{
                width: "100%", padding: "14px 0",
                background: "rgba(255,255,255,0.04)",
                border: "1.5px dashed rgba(236,72,153,0.25)",
                borderRadius: 12, cursor: "pointer",
                color: "#EC4899", fontSize: 14, fontWeight: 600, marginBottom: 16,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <Plus size={16} /> Adicionar produto
            </button>

            <NavButtons
              step={3} loading={loading}
              onVoltar={() => { setStep(2); window.scrollTo(0, 0) }}
              onProximo={enviarFormulario}
              labelProximo="Enviar habilitação →"
            />
          </>
        )}
      </div>
    </div>
  )
}
