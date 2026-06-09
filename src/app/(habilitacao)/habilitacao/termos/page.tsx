"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, X } from "lucide-react"

const CLAUSULAS = [
  {
    n: 1,
    titulo: "Coleta e uso de dados — LGPD",
    texto: `A EXP Digital - TikTok Shop coleta as informações e documentos fornecidos neste formulário exclusivamente para fins de habilitação e configuração da sua loja no TikTok Shop e integração com sistemas de gestão (Bling). Os dados são armazenados com criptografia e protegidos conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD). Nenhuma informação será compartilhada com terceiros sem consentimento prévio e expresso do titular.`,
  },
  {
    n: 2,
    titulo: "Segurança das credenciais de acesso",
    texto: `As credenciais fornecidas neste processo — incluindo certificado digital e senha — são utilizadas exclusivamente para a habilitação da loja no TikTok Shop. A EXP Digital - TikTok Shop não reterá qualquer acesso às contas e sistemas do cliente após a conclusão do processo. Após a habilitação, o cliente poderá e deverá atualizar todas as suas credenciais de acesso.`,
  },
  {
    n: 3,
    titulo: "Autorização de uso de imagem e marca",
    texto: `O cliente autoriza a EXP Digital - TikTok Shop a utilizar o nome comercial, logotipo e marca da empresa para divulgação em materiais de marketing, cases de sucesso, redes sociais, apresentações e comunicação institucional, de forma gratuita e sem limitação de prazo, podendo revogar esta autorização mediante solicitação escrita.`,
  },
  {
    n: 4,
    titulo: "Divulgação do relacionamento comercial",
    texto: `O cliente autoriza a EXP Digital - TikTok Shop a mencionar o relacionamento comercial firmado entre as partes para fins de portfólio, prospecção de novos clientes e ações de marketing, respeitando o sigilo sobre informações comercialmente sensíveis e valores contratuais, que não serão divulgados sem autorização expressa.`,
  },
  {
    n: 5,
    titulo: "Veracidade das informações",
    texto: `O cliente declara que todas as informações, documentos e arquivos fornecidos neste formulário são verídicos, atualizados e de sua responsabilidade. A EXP Digital - TikTok Shop não se responsabiliza por erros ou omissões causados por informações incorretas fornecidas pelo cliente.`,
  },
  {
    n: 6,
    titulo: "Obrigações do cliente e envio de materiais",
    texto: `O cliente compromete-se a fornecer, dentro dos prazos solicitados pela EXP Digital - TikTok Shop, todas as informações, documentos, imagens, vídeos, descrições, especificações técnicas, tabelas de medidas, dados logísticos e demais materiais necessários para a execução dos serviços contratados.\n\nO cliente declara ser o único responsável pela veracidade, atualização, qualidade e legalidade das informações e materiais fornecidos.\n\nA EXP Digital - TikTok Shop não poderá ser responsabilizada por atrasos, reprovações, bloqueios, suspensão de cadastros, erros em anúncios, divergências de estoque, informações incorretas, perda de oportunidades comerciais ou qualquer prejuízo decorrente da ausência, atraso ou inconsistência dos materiais enviados pelo cliente.\n\nCaso o cliente não forneça os materiais solicitados dentro do prazo informado, os prazos de execução dos serviços serão automaticamente prorrogados pelo período correspondente ao atraso, sem qualquer penalidade para a EXP Digital - TikTok Shop.`,
  },
  {
    n: 7,
    titulo: "Responsabilidade sobre produtos e operação da loja",
    texto: `A EXP Digital - TikTok Shop atua exclusivamente como prestadora de serviços de consultoria, configuração, habilitação e suporte operacional da plataforma.\n\nToda a responsabilidade relacionada aos produtos comercializados, estoque, preços, promoções, emissão de notas fiscais, atendimento ao consumidor, logística, envio de pedidos, trocas, devoluções, garantias e cumprimento das políticas do TikTok Shop é de responsabilidade exclusiva do cliente.\n\nA EXP Digital - TikTok Shop não garante volume mínimo de vendas, faturamento, aprovação de produtos, alcance de transmissões ao vivo ou resultados financeiros, uma vez que tais fatores dependem de variáveis externas e da operação conduzida pelo cliente.`,
  },
  {
    n: 8,
    titulo: "Obrigações da EXP Digital - TikTok Shop",
    texto: `A EXP Digital - TikTok Shop compromete-se a executar os serviços contratados conforme o plano adquirido pelo cliente, incluindo:\n\n• Análise inicial da documentação necessária para habilitação da loja TikTok Shop;\n• Auxílio e acompanhamento do processo de habilitação da conta seller;\n• Configuração inicial da loja na plataforma TikTok Shop;\n• Integração e configuração do sistema de emissão de notas fiscais, quando contratado e disponibilizado pelo cliente;\n• Configuração inicial de integração com ERP ou sistema de gestão, incluindo Bling, quando aplicável;\n• Cadastro de até 10 (dez) produtos na plataforma;\n• Organização inicial de categorias, informações institucionais e estrutura básica da loja;\n• Configuração visual básica da vitrine da loja;\n• Orientação inicial sobre funcionamento da plataforma e boas práticas operacionais.`,
  },
  {
    n: 9,
    titulo: "Prazo de execução",
    texto: `O prazo estimado para conclusão da implantação e configuração inicial da loja é de até 20 (vinte) dias úteis, contados a partir do recebimento integral de todos os documentos, materiais, informações e acessos necessários solicitados pela EXP Digital - TikTok Shop.\n\nO prazo poderá ser suspenso ou prorrogado automaticamente caso haja pendências, atrasos ou ausência de informações por parte do cliente.`,
  },
  {
    n: 10,
    titulo: "Alterações após a entrega",
    texto: `Após a conclusão da implantação inicial, o cliente terá direito a 01 (uma) rodada de ajustes corretivos sem custo adicional, desde que solicitada em até 07 (sete) dias corridos após a entrega.\n\nSolicitações adicionais, recadastros completos, alterações estruturais, inclusão de novos produtos, novas integrações ou modificações não previstas no escopo inicial poderão ser cobradas à parte mediante aprovação prévia do cliente.`,
  },
  {
    n: 11,
    titulo: "Limitação de responsabilidade",
    texto: `A EXP Digital - TikTok Shop não se responsabiliza por reprovações decorrentes de documentos inválidos, informações incorretas fornecidas pelo cliente, políticas da plataforma TikTok Shop, bloqueios realizados pela plataforma, indisponibilidades de sistemas de terceiros ou qualquer situação fora de seu controle operacional.\n\nA EXP Digital - TikTok Shop compromete-se a executar os serviços contratados com diligência e boa-fé, não garantindo resultados comerciais, volume de vendas, faturamento, aprovação de produtos específicos ou desempenho da loja após sua habilitação.`,
  },
]

const CHECKBOXES = [
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

const BASE: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0d0d0f 0%, #131016 60%, #0d0d0f 100%)",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "40px 24px",
  fontFamily: "system-ui, -apple-system, sans-serif",
  position: "relative",
}

export default function TermosPage() {
  const [aceitos, setAceitos] = useState<Record<string, boolean>>({
    privacidade: false, uso_imagem: false, divulgacao: false,
  })
  const [loading, setLoading] = useState(false)
  const [verificando, setVerificando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
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
    const { data: hab } = await supabase.from("habilitacoes").select("id").maybeSingle()

    if (!hab) {
      await supabase.from("habilitacoes").insert({
        user_id: user.id, email: user.email,
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
      <div style={{ ...BASE }}>
        <Loader2 size={28} style={{ color: "#EC4899", animation: "spin 1s linear infinite" }} />
      </div>
    )
  }

  return (
    <div style={BASE}>
      {/* Glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "20%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)",
        }} />
      </div>

      {/* ── Modal de Termos ── */}
      {modalAberto && (
        <div
          onClick={() => setModalAberto(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 680, maxHeight: "85vh",
              background: "#161618", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16, display: "flex", flexDirection: "column",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {/* Cabeçalho do modal */}
            <div style={{
              padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 16 }}>📄</span>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>
                    Termos e Condições de Prestação de Serviços
                  </p>
                </div>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>
                  EXP Digital - TikTok Shop · 11 cláusulas
                </p>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                style={{
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8, padding: 8, cursor: "pointer",
                  color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Conteúdo rolável */}
            <div style={{ overflowY: "auto", padding: "24px", flex: 1 }}>
              <p style={{
                color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.6,
                margin: "0 0 24px",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 8,
                borderLeft: "3px solid #EC4899",
              }}>
                Leia com atenção antes de prosseguir com a habilitação da sua loja no TikTok Shop.
              </p>

              {CLAUSULAS.map((c) => (
                <div key={c.n} style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                    <span style={{
                      background: "linear-gradient(135deg, #EC4899, #8B5CF6)",
                      color: "#fff", fontSize: 11, fontWeight: 800,
                      width: 22, height: 22, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 1,
                    }}>{c.n}</span>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>
                      {c.titulo}
                    </p>
                  </div>
                  <div style={{ paddingLeft: 32 }}>
                    {c.texto.split("\n\n").map((par, i) => (
                      <p key={i} style={{
                        color: "rgba(255,255,255,0.55)", fontSize: 13,
                        lineHeight: 1.7, margin: i === 0 ? 0 : "10px 0 0",
                        whiteSpace: "pre-line",
                      }}>
                        {par}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Rodapé do modal */}
            <div style={{
              padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}>
              <button
                onClick={() => setModalAberto(false)}
                style={{
                  width: "100%", padding: "12px 0",
                  background: "linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #06B6D4 100%)",
                  border: "none", borderRadius: 10, cursor: "pointer",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                }}
              >
                Fechar e voltar →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Conteúdo principal ── */}
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

        {/* Card — Documento de termos */}
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
          <button
            onClick={() => setModalAberto(true)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#EC4899", fontSize: 13, fontWeight: 600,
              whiteSpace: "nowrap", padding: "4px 8px",
            }}
          >
            Ler →
          </button>
        </div>

        {/* Checkboxes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {CHECKBOXES.map((t) => (
            <label
              key={t.id}
              style={{
                display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer",
                background: aceitos[t.id] ? "rgba(236,72,153,0.06)" : "rgba(255,255,255,0.03)",
                border: aceitos[t.id]
                  ? "1px solid rgba(236,72,153,0.3)"
                  : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "16px 18px", transition: "all 0.2s",
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 2,
                background: aceitos[t.id]
                  ? "linear-gradient(135deg, #EC4899, #8B5CF6)"
                  : "rgba(255,255,255,0.08)",
                border: aceitos[t.id] ? "none" : "1px solid rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}>
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
                <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>{t.titulo}</p>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.5, margin: 0 }}>{t.texto}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Botão aceitar */}
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
