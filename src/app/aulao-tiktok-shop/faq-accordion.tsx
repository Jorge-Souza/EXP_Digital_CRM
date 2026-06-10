"use client"

import { useState } from "react"

const faqs = [
  {
    q: "Posso vender como pessoa física?",
    a: "Para <strong>vender como lojista</strong>, apenas CNPJ. Mas existe uma forma de PF participar: como <strong>afiliado</strong>. O afiliado promove produtos de terceiros e recebe comissão por cada venda — sem precisar ter estoque ou CNPJ. O requisito mínimo é ter <strong>2.000 seguidores</strong> no TikTok. O onboarding é pelo app, via QR Code.",
  },
  {
    q: "Quantas contas de vendedor posso ter?",
    a: "Até 5 contas por CNPJ. Cada conta pode ter 1 conta oficial + 4 contas de marketing vinculadas.",
  },
  {
    q: "Como sair do período de avaliação mais rápido?",
    a: "Foco nos indicadores: SFCR ≤ 5% (cancelamentos pela loja), LDR ≤ 8% (atraso no envio) e SFRR ≤ 1,5% (devoluções). Os três precisam estar dentro do limite ao mesmo tempo. O período mínimo é 30 dias — não tem como encurtar esse prazo. A única aceleração possível é não errar nas métricas.",
  },
  {
    q: "Preciso de ERP para começar?",
    a: "Não é obrigatório, mas para quem quer escalar é essencial. Sem ERP (ex: Bling), você emite NF manualmente para cada pedido. Com volume, isso vira gargalo. A plataforma tem integradores homologados.",
  },
  {
    q: "O que é GMV Max e é diferente do TikTok Ads?",
    a: "GMV Max é o sistema de tráfego pago integrado ao TikTok Shop, acessado direto da Central do Vendedor. O TikTok Ads Manager é usado para gerenciar as campanhas com mais controle. Os dois se complementam — GMV Max é o nome da solução, Ads Manager é onde você configura.",
  },
  {
    q: "Afiliado precisa ter quantos seguidores?",
    a: "Mínimo de 2.000 seguidores no TikTok para se cadastrar como afiliado. O onboarding é feito pelo app, via QR Code — não tem como fazer pelo desktop.",
  },
  {
    q: "Posso vender para outros países?",
    a: "Não. O TikTok Shop Brasil opera apenas para o mercado nacional, com documentação e contas bancárias brasileiras.",
  },
  {
    q: "Qual o prazo que o TikTok demora para aprovar minha conta?",
    a: "1 a 2 dias úteis após envio de toda a documentação. Documentos incompletos reiniciam o prazo. Verifique CNPJ ativo, documentos do representante legal e comprovante de residência no nome correto.",
  },
]

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {faqs.map((faq, i) => (
        <div
          key={i}
          style={{
            background: "#111111",
            border: `1px solid ${open === i ? "rgba(254,44,85,0.4)" : "#2A2A2A"}`,
            borderRadius: 12,
            overflow: "hidden",
            transition: "border-color 0.2s",
          }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              color: open === i ? "#25F4EE" : "#FFFFFF",
              fontFamily: "Inter, sans-serif",
              fontSize: 15,
              fontWeight: 600,
              textAlign: "left",
              padding: "18px 20px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              transition: "color 0.2s",
            }}
          >
            {faq.q}
            <span
              style={{
                flexShrink: 0,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: open === i ? "#FE2C55" : "#2A2A2A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                transform: open === i ? "rotate(180deg)" : "none",
                transition: "transform 0.25s, background 0.2s",
              }}
            >
              ▾
            </span>
          </button>
          {open === i && (
            <div
              style={{
                padding: "0 20px 18px",
                fontSize: 14,
                color: "#A0A0A0",
                lineHeight: 1.7,
                borderTop: "1px solid #2A2A2A",
              }}
              dangerouslySetInnerHTML={{ __html: faq.a }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
