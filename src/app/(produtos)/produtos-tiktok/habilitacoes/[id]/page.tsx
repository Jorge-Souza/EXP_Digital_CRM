import React from "react"
import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { ArrowLeft, Download, ExternalLink, Package } from "lucide-react"

type Produto = {
  nome: string; descricao?: string; sku?: string; ncm: string
  preco: string; custo?: string; unidade: string; estoque: string; marca?: string
  comprimento?: string; largura?: string; altura?: string; peso?: string
  fotos?: string[]; tem_variacao?: boolean
  variacoes?: { tipo: string; itens: string; preco: string; imagem_url: string }[]
}

type Hab = {
  id: string; email: string; status: string | null; etapa_atual: number | null
  created_at: string; termos_aceitos_at: string | null
  nome_empresa: string | null; cnpj: string | null; data_constituicao: string | null
  endereco_comercial: string | null; cnpj_doc_url: string | null
  rep_nome: string | null; rep_data_nascimento: string | null
  rep_nacionalidade: string | null; rep_endereco: string | null
  rep_comprovante_url: string | null; tipo_documento: string | null
  doc_frente_url: string | null; selfie_url: string | null; selfie_doc_url: string | null
  inscricao_estadual: string | null; nicho: string | null; subnicho: string | null
  certificado_url: string | null; senha_certificado: string | null
  produtos: Produto[] | null
}

function fmt(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function Section({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5 mb-4"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{emoji}</span>
        <h2 className="text-white font-semibold text-base">{title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">{children}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-white/35 text-xs font-medium uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-white/80 text-sm">{value ?? <span className="text-white/25 italic">Não preenchido</span>}</p>
    </div>
  )
}

function FileLink({ label, url }: { label: string; url: string | null | undefined }) {
  if (!url) return (
    <div>
      <p className="text-white/35 text-xs font-medium uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-white/25 text-sm italic">Não enviado</p>
    </div>
  )
  return (
    <div>
      <p className="text-white/35 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <div className="flex gap-2">
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "#C084FC" }}>
          <ExternalLink size={12} />
          Visualizar
        </a>
        <a href={url} download
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.25)", color: "#34D399" }}>
          <Download size={12} />
          Baixar
        </a>
      </div>
    </div>
  )
}

const STATUS_LABELS: Record<string, string> = {
  enviado: "Enviado", em_analise: "Em análise", aprovado: "Aprovado", reprovado: "Reprovado", pendente: "Pendente",
}
const STATUS_COLORS: Record<string, string> = {
  enviado: "#34D399", em_analise: "#FBBF24", aprovado: "#34D399", reprovado: "#F87171", pendente: "rgba(255,255,255,0.4)",
}

export default async function HabilitacaoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/hub")

  const admin = createAdminClient()
  const { data } = await admin.from("habilitacoes").select("*").eq("id", id).maybeSingle()
  if (!data) notFound()

  const h = data as Hab
  const statusColor = STATUS_COLORS[h.status ?? "pendente"] ?? STATUS_COLORS.pendente
  const statusLabel = STATUS_LABELS[h.status ?? "pendente"] ?? "Pendente"

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back + header */}
      <div className="mb-6">
        <Link href="/produtos-tiktok/habilitacoes"
          className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-4 transition-colors">
          <ArrowLeft size={14} />
          Voltar para Habilitações
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {h.nome_empresa ?? <span className="text-white/40 italic">Empresa sem nome</span>}
            </h1>
            <p className="text-white/40 text-sm">{h.email}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ color: statusColor, background: `${statusColor}18`, border: `1px solid ${statusColor}40` }}>
              {statusLabel}
            </span>
            <span className="text-white/30 text-xs">
              Cadastro: {fmt(h.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Empresa */}
      <Section title="Informações da Empresa" emoji="🏢">
        <Field label="Razão social" value={h.nome_empresa} />
        <Field label="CNPJ" value={h.cnpj} />
        <Field label="Data de constituição" value={h.data_constituicao} />
        <Field label="Endereço comercial" value={h.endereco_comercial} />
        <div className="col-span-2">
          <FileLink label="Comprovante CNPJ" url={h.cnpj_doc_url} />
        </div>
      </Section>

      {/* Representante */}
      <Section title="Representante Legal" emoji="👤">
        <Field label="Nome civil completo" value={h.rep_nome} />
        <Field label="Data de nascimento" value={h.rep_data_nascimento} />
        <Field label="Nacionalidade" value={h.rep_nacionalidade} />
        <Field label="Endereço residencial" value={h.rep_endereco} />
        <div className="col-span-2">
          <FileLink label="Comprovante de residência" url={h.rep_comprovante_url} />
        </div>
      </Section>

      {/* Documentos de identidade */}
      <Section title="Documentos de Identidade" emoji="🪪">
        <Field label="Tipo de documento" value={h.tipo_documento} />
        <div />
        <FileLink label={`${h.tipo_documento ?? "Documento"} – frente`} url={h.doc_frente_url} />
        <FileLink label="Selfie do titular" url={h.selfie_url} />
        <div className="col-span-2">
          <FileLink label="Selfie com o documento" url={h.selfie_doc_url} />
        </div>
      </Section>

      {/* Loja */}
      <Section title="Dados da Loja" emoji="🏪">
        <Field label="Inscrição estadual" value={h.inscricao_estadual} />
        <Field label="Nicho" value={h.nicho} />
        <Field label="Subnicho" value={h.subnicho} />
        <div />
        <FileLink label="Certificado digital A1" url={h.certificado_url} />
        <div>
          <p className="text-white/35 text-xs font-medium uppercase tracking-wider mb-0.5">Senha do certificado</p>
          {h.senha_certificado ? (
            <p className="text-white/80 text-sm font-mono">{h.senha_certificado}</p>
          ) : (
            <p className="text-white/25 text-sm italic">Não informado</p>
          )}
        </div>
      </Section>

      {/* Termos */}
      <Section title="Aceite de termos" emoji="✅">
        <Field label="Termos aceitos em" value={fmt(h.termos_aceitos_at)} />
        <Field label="Etapa atual" value={h.etapa_atual != null ? `Etapa ${h.etapa_atual} de 3` : "—"} />
      </Section>

      {/* Produtos */}
      {h.produtos && h.produtos.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Package size={18} className="text-pink-400" />
            <h2 className="text-white font-semibold text-base">Produtos ({h.produtos.length})</h2>
          </div>

          {h.produtos.map((p, i) => (
            <div key={i} className="rounded-xl p-5 mb-3"
              style={{ background: "rgba(236,72,153,0.03)", border: "1px solid rgba(236,72,153,0.12)" }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-pink-400 font-bold text-sm px-3 py-1 rounded-md"
                  style={{ background: "rgba(236,72,153,0.12)" }}>
                  Produto #{i + 1}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-4">
                <Field label="Nome" value={p.nome} />
                <Field label="NCM" value={p.ncm} />
                <Field label="SKU" value={p.sku} />
                <Field label="Marca" value={p.marca} />
                <Field label="Preço de venda" value={p.preco ? `R$ ${p.preco}` : null} />
                <Field label="Custo" value={p.custo ? `R$ ${p.custo}` : null} />
                <Field label="Unidade" value={p.unidade} />
                <Field label="Estoque" value={p.estoque} />
                <Field label="Comprimento" value={p.comprimento ? `${p.comprimento} cm` : null} />
                <Field label="Largura" value={p.largura ? `${p.largura} cm` : null} />
                <Field label="Altura" value={p.altura ? `${p.altura} cm` : null} />
                <Field label="Peso" value={p.peso ? `${p.peso} kg` : null} />
                {p.descricao && (
                  <div className="col-span-2">
                    <p className="text-white/35 text-xs font-medium uppercase tracking-wider mb-0.5">Descrição</p>
                    <p className="text-white/70 text-sm leading-relaxed">{p.descricao}</p>
                  </div>
                )}
              </div>

              {/* Fotos */}
              {p.fotos && p.fotos.filter(Boolean).length > 0 && (
                <div className="mb-4">
                  <p className="text-white/35 text-xs font-medium uppercase tracking-wider mb-2">Fotos</p>
                  <div className="flex flex-wrap gap-2">
                    {p.fotos.filter(Boolean).map((url, fi) => (
                      <a key={fi} href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{ background: "rgba(139,92,246,0.10)", border: "1px solid rgba(139,92,246,0.2)", color: "#C084FC" }}>
                        <ExternalLink size={11} />
                        Foto {fi + 1}{fi === 0 ? " (capa)" : ""}
                      </a>
                    ))}
                    <a href={p.fotos.filter(Boolean).join("\n")}
                      download={`fotos-produto-${i + 1}.txt`}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", color: "#34D399" }}>
                      <Download size={11} />
                      URLs das fotos
                    </a>
                  </div>
                </div>
              )}

              {/* Variações */}
              {p.tem_variacao && p.variacoes && p.variacoes.length > 0 && (
                <div>
                  <p className="text-white/35 text-xs font-medium uppercase tracking-wider mb-2">Variações</p>
                  <div className="flex flex-col gap-2">
                    {p.variacoes.map((v, vi) => (
                      <div key={vi} className="flex flex-wrap items-center gap-3 px-3 py-2 rounded-lg text-sm"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <span className="text-white/50 font-medium">{v.tipo}:</span>
                        <span className="text-white/80">{v.itens || "—"}</span>
                        {v.preco && <span className="text-white/50">R$ {v.preco}</span>}
                        {v.imagem_url && (
                          <a href={v.imagem_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs"
                            style={{ color: "#C084FC" }}>
                            <ExternalLink size={10} /> Imagem
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(!h.produtos || h.produtos.length === 0) && (
        <div className="rounded-xl p-6 text-center text-white/25 text-sm"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          Nenhum produto cadastrado ainda.
        </div>
      )}
    </div>
  )
}
