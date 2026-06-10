import { FaqAccordion } from "./faq-accordion"

const S = {
  black: "#010101",
  red: "#FE2C55",
  cyan: "#25F4EE",
  white: "#FFFFFF",
  gray100: "#F5F5F5",
  gray400: "#A0A0A0",
  gray700: "#2A2A2A",
  gray800: "#1A1A1A",
  gray900: "#111111",
  redDim: "rgba(254,44,85,0.12)",
  cyanDim: "rgba(37,244,238,0.10)",
}

function SectionLabel({ num, tag }: { num: number; tag: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%", background: S.red, color: S.white,
        fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{num}</div>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: S.cyan }}>{tag}</span>
    </div>
  )
}

function Card({ icon, title, desc, tag, tagRed }: { icon: string; title: string; desc: React.ReactNode; tag?: string; tagRed?: boolean }) {
  return (
    <div style={{
      background: S.gray900, border: `1px solid ${S.gray700}`, borderRadius: 14, padding: 24,
    }}>
      <span style={{ fontSize: 28, marginBottom: 12, display: "block" }}>{icon}</span>
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 8, color: S.white }}>{title}</h3>
      <p style={{ fontSize: 13.5, color: S.gray400, lineHeight: 1.55 }}>{desc}</p>
      {tag && (
        <span style={{
          display: "inline-block", marginTop: 12, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
          textTransform: "uppercase", color: tagRed ? S.red : S.cyan, background: tagRed ? S.redDim : S.cyanDim,
          borderRadius: 6, padding: "3px 8px",
        }}>{tag}</span>
      )}
    </div>
  )
}

function Highlight({ children, cyan }: { children: React.ReactNode; cyan?: boolean }) {
  return (
    <div style={{
      background: cyan ? S.cyanDim : S.redDim,
      border: `1px solid ${cyan ? "rgba(37,244,238,0.3)" : "rgba(254,44,85,0.3)"}`,
      borderRadius: 12, padding: "20px 24px", margin: "24px 0", fontSize: 14, lineHeight: 1.6, color: S.white,
    }}>
      {children}
    </div>
  )
}

function Grid2({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, ...style }}>
      {children}
    </div>
  )
}

function Grid3({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, ...style }}>
      {children}
    </div>
  )
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ padding: "64px 0 48px", borderBottom: `1px solid ${S.gray700}` }}>
      {children}
    </section>
  )
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.01em", marginBottom: 8, color: S.white }}>
      {children}
    </h2>
  )
}

function SectionDesc({ children }: { children: React.ReactNode }) {
  return <p style={{ color: S.gray400, fontSize: 15, marginBottom: 32, maxWidth: 620 }}>{children}</p>
}

function ScriptBlock({ step, fala, desc }: { step: string; fala: string; desc: string }) {
  return (
    <div style={{ background: S.gray900, border: `1px solid ${S.gray700}`, borderRadius: 14, padding: 24, marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: S.red, marginBottom: 6 }}>{step}</div>
      <div style={{ fontSize: 15, fontStyle: "italic", color: S.cyan, borderLeft: `3px solid ${S.cyan}`, paddingLeft: 14, margin: "10px 0", lineHeight: 1.5 }}>{fala}</div>
      <p style={{ fontSize: 13.5, color: S.gray400 }}>{desc}</p>
    </div>
  )
}

export default function AulaoPage() {
  return (
    <div style={{ background: S.black, color: S.white, fontFamily: "Inter, sans-serif", fontSize: 16, lineHeight: 1.65, margin: "-24px", minHeight: "100vh" }}>

      {/* HERO */}
      <div style={{
        position: "relative", padding: "60px 24px 56px", textAlign: "center", overflow: "hidden",
        borderBottom: `1px solid ${S.gray700}`,
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(254,44,85,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(37,244,238,0.10) 0%, transparent 60%), ${S.black}`,
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.14em", textTransform: "uppercase", color: S.cyan,
            border: "1px solid rgba(37,244,238,0.3)", borderRadius: 999, padding: "6px 16px", marginBottom: 28,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: S.red, display: "inline-block" }} />
            AO VIVO HOJE ÀS 16H
          </div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 700, lineHeight: 1.08,
            letterSpacing: "-0.02em", marginBottom: 16, color: S.white,
          }}>
            Aulão <span style={{ color: S.red }}>TikTok Shop</span><br />do Zero ao GMV
          </h1>
          <p style={{ fontSize: 17, color: S.gray400, maxWidth: 560, margin: "0 auto 32px" }}>
            Tudo o que você precisa saber para vender de verdade na plataforma — estrutura, conteúdo, tráfego e operação.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", fontSize: 13, color: S.gray400 }}>
            <span>👨‍🏫 <strong style={{ color: S.white }}>Prof. Jorge Souza</strong></span>
            <span>🕓 <strong style={{ color: S.white }}>Hoje, 16h00</strong></span>
            <span>📍 <strong style={{ color: S.white }}>Aula ao vivo + Q&A</strong></span>
            <span>🎯 <strong style={{ color: S.white }}>Alunos + público aberto</strong></span>
          </div>
        </div>
      </div>

      {/* NAV PILLS */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50, background: "rgba(1,1,1,0.92)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${S.gray700}`, padding: "12px 24px",
        display: "flex", gap: 8, overflowX: "auto",
      }}>
        {[
          ["#s1", "01 Plataforma"], ["#s2", "02 Operação"], ["#s3", "03 Produtos"],
          ["#s4", "04 4 Pilares"], ["#s5", "05 Live Shop"], ["#s6", "06 Afiliados"],
          ["#s7", "07 GMV Max"], ["#s8", "08 Logística"], ["#s9", "09 Financeiro"], ["#s10", "10 Q&A"],
        ].map(([href, label]) => (
          <a key={href} href={href} style={{
            flexShrink: 0, fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
            padding: "6px 14px", borderRadius: 999, border: `1px solid ${S.gray700}`,
            color: S.gray400, textDecoration: "none", whiteSpace: "nowrap",
          }}>{label}</a>
        ))}
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>

        {/* 01 - PLATAFORMA */}
        <Section id="s1">
          <SectionLabel num={1} tag="Fundamentos" />
          <H2>O que é o TikTok Shop e por que agora?</H2>
          <SectionDesc>Contexto de mercado, modelo de negócio e o que diferencia o TikTok Shop de qualquer outro marketplace.</SectionDesc>
          <Grid2>
            <Card icon="🏪" title="Marketplace dentro do TikTok" desc="Vendedores com CNPJ vendem diretamente para usuários sem sair do app. Descoberta de produto acontece via conteúdo — não via busca como no Mercado Livre." tag="Diferencial" />
            <Card icon="💸" title="Taxas da plataforma" desc={<>Comissão de <strong>6%</strong> sobre a venda + <strong>R$ 4 por item</strong> vendido + <strong>6%</strong> de taxa de frete. Não há mensalidade de plataforma.</>} tag="Custo" tagRed />
            <Card icon="📋" title="Quem pode vender?" desc="Apenas pessoas jurídicas (CNPJ). Aprovação em até 2 dias úteis. Limite inicial de 100 produtos/dia e 200 pedidos/dia até passar o período de avaliação." tag="Requisito" />
            <Card icon="⏱️" title="Período de Avaliação" desc="Sair do probation exige: 30+ dias de conta, 100+ pedidos concluídos, SFCR ≤ 5%, LDR ≤ 8% e SFRR ≤ 1,5% — tudo simultaneamente." tag="Atenção" tagRed />
          </Grid2>
          <Highlight><strong style={{ color: S.red }}>⚡ Ponto-chave:</strong> O TikTok Shop não é uma loja que você monta e espera o cliente chegar. É uma plataforma de <strong>venda por conteúdo</strong>. Quem não produz, não vende.</Highlight>
        </Section>

        {/* 02 - OPERAÇÃO */}
        <Section id="s2">
          <SectionLabel num={2} tag="Setup" />
          <H2>Montando sua operação do jeito certo</H2>
          <SectionDesc>Configurações essenciais antes de publicar o primeiro produto. Erro aqui custa caro depois.</SectionDesc>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, padding: 0, margin: 0 }}>
            {[
              { title: "Conta Oficial vs Conta de Marketing", desc: "A conta oficial sincroniza produtos automaticamente com o perfil. Já a de marketing (até 4 contas) não sincroniza, mas dá mais flexibilidade para criadores. Escolha com consciência." },
              { title: "Configuração do armazém", desc: "Defina o endereço de estoque na Central do Vendedor. Isso determina se você vai ter coleta ou precisará ir até um ponto de drop-off. Não pule essa etapa." },
              { title: "ERP integrado (ex: Bling)", desc: "Com integrador conectado, NF é emitida automaticamente. Sem ERP, você emite tudo na mão. Para quem quer escalar: integrador é obrigatório." },
              { title: "Autorização de Marca", desc: "Se você vende produto de terceiros, precisa do certificado + autorização do distribuidor. A plataforma é rígida com falsificação." },
              { title: "Usuários e Subcontas", desc: "Delegue acesso à equipe sem compartilhar senha de dono. Crie subcontas com permissões específicas (ex: gerente de publicidade)." },
            ].map((item, i) => (
              <li key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14.5,
                background: S.gray900, border: `1px solid ${S.gray700}`, borderRadius: 10, padding: "14px 16px",
              }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                  background: S.redDim, border: `1px solid ${S.red}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, marginTop: 1, color: S.white,
                }}>✓</span>
                <div><strong>{item.title}</strong> — {item.desc}</div>
              </li>
            ))}
          </ul>
        </Section>

        {/* 03 - PRODUTOS */}
        <Section id="s3">
          <SectionLabel num={3} tag="Publicação" />
          <H2>Como publicar produtos que vendem</H2>
          <SectionDesc>Título, imagem e descrição não são burocracia — são o seu vendedor silencioso 24h por dia.</SectionDesc>
          <Grid3>
            <Card icon="🖼️" title="Imagem" desc="Mínimo 600×600px, proporção 1:1, até 9 fotos. Sem marca d'água, sem texto promocional, sem moldura. Fundo branco converte mais." />
            <Card icon="🔤" title="Título" desc={<>25 a 200 caracteres. Fórmula: <strong>[Marca] + [Produto] + [Aplicação] + [Benefício]</strong>. Sem "promoção", "best-seller" ou linguagem caça-clique.</>} />
            <Card icon="📝" title="Descrição" desc="Mínimo 500 caracteres. Liste 3 a 5 características reais. Parágrafos separados. Sem CAPS LOCK desnecessário." />
          </Grid3>
          <Highlight cyan>
            <strong style={{ color: S.cyan }}>💡 Dica de ouro:</strong> O código GTIN (EAN/UPC) não pode ser repetido entre SKUs e não pode ser editado depois do envio. Confira <strong>antes</strong> de cadastrar.
          </Highlight>
        </Section>

        {/* 04 - 4 PILARES */}
        <Section id="s4">
          <SectionLabel num={4} tag="Estratégia de Vendas" />
          <H2>Os 4 Pilares para escalar o GMV</H2>
          <SectionDesc>Quem ativa só um pilar, cresce pouco. Quem ativa os quatro, escala. Entenda o peso de cada um.</SectionDesc>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginBottom: 24 }}>
            {[
              { pct: "~15%", title: "Short Videos", desc: "Descoberta orgânica. Não converte rápido, mas constrói comunidade e alimenta os outros pilares.", color: S.red },
              { pct: "~15%", title: "Live Shop", desc: "Conversão de 10–20% vs 1–3% do e-commerce tradicional. Alta urgência, compra por impulso.", color: S.cyan },
              { pct: "~50%", title: "Afiliados", desc: "O maior motor de crescimento. Criadores recomendam seus produtos para a audiência deles.", color: "#8B5CF6" },
              { pct: "~30%", title: "Shop Ads (GMV Max)", desc: "Tráfego pago integrado. Acelera o que já está funcionando — não conserta o que não funciona.", color: "#F59E0B" },
            ].map((p, i) => (
              <div key={i} style={{
                background: S.gray900, border: `1px solid ${S.gray700}`, borderRadius: 12, padding: "20px 18px",
                position: "relative", overflow: "hidden",
                borderTop: `3px solid ${p.color}`,
              }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, lineHeight: 1, marginBottom: 6, color: p.color }}>{p.pct}</div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: S.white }}>{p.title}</h4>
                <p style={{ fontSize: 12, color: S.gray400 }}>{p.desc}</p>
              </div>
            ))}
          </div>
          <Highlight><strong style={{ color: S.red }}>🎯 Regra de ouro:</strong> Use os pilares <strong>em conjunto</strong>. Afiliados sem produto bem cadastrado = desperdício. GMV Max sem prova social = dinheiro queimado.</Highlight>
        </Section>

        {/* 05 - LIVE SHOP */}
        <Section id="s5">
          <SectionLabel num={5} tag="Live Commerce" />
          <H2>Live Shop: sua vitrine em tempo real</H2>
          <SectionDesc>Live não é improviso. É script com repetição estratégica. Veja como estruturar.</SectionDesc>
          <ScriptBlock
            step="Abertura (30–60 seg)"
            fala='"Se você vende [produto] ou quer começar a vender no TikTok Shop, fica aqui — nos próximos minutos eu vou mostrar exatamente o que tá funcionando."'
            desc="Ganche forte. Apresente o produto principal. Mostre a sacola de compras. Crie ancoragem de preço."
          />
          <ScriptBlock
            step="Ciclo de 5 Minutos (repete ao longo da live)"
            fala='"Olha esse produto aqui — [benefício]. Quem já usou sabe. Comenta EU QUERO pra eu te mandar o link direto."'
            desc="Gancho → Demonstração → Quebra de objeção → Oferta → CTA → Interação com chat. Repita o ciclo."
          />
          <Grid2 style={{ marginTop: 16 }}>
            <Card icon="📦" title="Sacola de Compras" desc="Adicione os produtos antes da live. Durante a transmissão, fixe o produto que está apresentando. Promoção Relâmpago funciona muito bem em live." />
            <Card icon="🎁" title="Sorteio em Live" desc="Ferramenta nativa da plataforma. Cadastre o brinde como produto, configure na Central do Vendedor e atribua ao criador. Aumenta retenção e engajamento." />
          </Grid2>
          <Highlight cyan>
            <strong style={{ color: S.cyan }}>📊 Dado da plataforma:</strong> Live Shop converte entre <strong>10% e 20%</strong> dos espectadores. E-commerce tradicional converte 1%–3%. A diferença é a urgência e a interação em tempo real.
          </Highlight>
        </Section>

        {/* 06 - AFILIADOS */}
        <Section id="s6">
          <SectionLabel num={6} tag="Programa de Afiliados" />
          <H2>Afiliados: o motor que trabalha por você</H2>
          <SectionDesc>50% do GMV vem de afiliados. Entender isso muda o jogo — para quem vende e para quem ensina.</SectionDesc>
          <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${S.gray700}` }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: S.gray800 }}>
                  {["Configuração", "Plano Aberto", "Plano Direcionado"].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.gray400, borderBottom: `1px solid ${S.gray700}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Quem pode promover", "Qualquer criador (aprovado pelo vendedor)", "Apenas criadores selecionados"],
                  ["Recomendado?", "✅ Sim — mais alcance", "Para campanhas específicas"],
                  ["Comissão sugerida", "8% – 15%", "8% – 15%", true],
                  ["Amostras mínimas", "100 unidades", "Conforme negociação", true],
                  ["Prazo para o criador postar", "14 dias após receber a amostra", "14 dias após receber a amostra"],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < 4 ? `1px solid ${S.gray800}` : "none" }}>
                    <td style={{ padding: "13px 16px", color: S.white }}>{row[0]}</td>
                    <td style={{ padding: "13px 16px", color: row[3] ? S.cyan : S.gray400, fontFamily: row[3] ? "'Space Grotesk', sans-serif" : undefined, fontWeight: row[3] ? 700 : undefined }}>{row[1]}</td>
                    <td style={{ padding: "13px 16px", color: row[3] ? S.cyan : S.gray400, fontFamily: row[3] ? "'Space Grotesk', sans-serif" : undefined, fontWeight: row[3] ? 700 : undefined }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Highlight>
            <strong style={{ color: S.red }}>🚀 Estratégia Slingshot:</strong> Libere 100 amostras → 100 vídeos no ar. Identifique os 5–10 afiliados com melhor conversão → invista em anúncios nos vídeos deles. Produto ideal: R$ 100–250, leve, boa margem.
          </Highlight>
        </Section>

        {/* 07 - GMV MAX */}
        <Section id="s7">
          <SectionLabel num={7} tag="Tráfego Pago" />
          <H2>GMV Max: tráfego pago dentro do Shop</H2>
          <SectionDesc>Diferente do Meta Ads, o GMV Max já está integrado à jornada de compra. Entenda como não desperdiçar orçamento.</SectionDesc>
          <Grid2>
            <Card icon="📈" title="Maximizar Delivery" desc="A plataforma decide onde veicular. Ideal para quem está começando e quer volume de dados. Menor controle, maior alcance." tag="Para iniciantes" />
            <Card icon="🎯" title="Meta de ROI" desc={<>Você define o ROAS mínimo. <strong>Atenção:</strong> meta irreal = "Sem veiculação". Calibre com base no histórico real da campanha.</>} tag="Cuidado" tagRed />
          </Grid2>
          <Highlight>
            <strong style={{ color: S.red }}>⚠️ Erro mais comum:</strong> Colocar meta de ROI alta demais logo no início. A campanha para de rodar. Comece com Maximizar Delivery por 7–14 dias, colete dados, depois ative a Meta de ROI com número realista.
          </Highlight>
        </Section>

        {/* 08 - LOGÍSTICA */}
        <Section id="s8">
          <SectionLabel num={8} tag="Operação" />
          <H2>Logística: entenda antes de travar</H2>
          <SectionDesc>O modelo 4PL é diferente do que a maioria conhece. Ignorar as regras gera pontos de violação.</SectionDesc>
          <Grid3>
            <Card icon="🚚" title="Modelo 4PL" desc="A transportadora é definida pela plataforma: J&T, Correios, iMile ou Total Express. Você não escolhe — você prepara o pacote." />
            <Card icon="⏰" title="Prazo de 3 dias úteis" desc="Após o pedido, você tem 3 dias úteis para deixar o pacote 'Pronto para Envio'. Estourar esse prazo gera LDR — métrica que afeta seu ranking." tag="Crítico" tagRed />
            <Card icon="↩️" title="Devoluções" desc="30 dias para qualquer motivo. 90 dias para defeito. Reembolso em até 3 dias úteis após receber o produto de volta. Custo de frete: plataforma paga se for arrependimento." />
          </Grid3>
        </Section>

        {/* 09 - FINANCEIRO */}
        <Section id="s9">
          <SectionLabel num={9} tag="Financeiro" />
          <H2>Como o dinheiro chega na sua conta</H2>
          <SectionDesc>Fluxo de caixa diferente do Mercado Livre. Planeje-se.</SectionDesc>
          <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${S.gray700}` }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: S.gray800 }}>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.gray400, borderBottom: `1px solid ${S.gray700}` }}>Item</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.gray400, borderBottom: `1px solid ${S.gray700}` }}>Regra</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Prazo de repasse", "D+15 após entrega", true],
                  ["Comissão marketplace", "6% já descontado no repasse"],
                  ["Taxa frete", "6% já descontado"],
                  ["Taxa por item", "R$ 4 por item vendido"],
                  ["Nota fiscal TikTok", "RPS no dia 30 → NF até dia 4 do mês seguinte"],
                  ["Taxa de transferência", "Nenhuma", true],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < 5 ? `1px solid ${S.gray800}` : "none" }}>
                    <td style={{ padding: "13px 16px", color: S.white }}>{row[0]}</td>
                    <td style={{ padding: "13px 16px", color: row[2] ? S.cyan : S.gray400, fontFamily: row[2] ? "'Space Grotesk', sans-serif" : undefined, fontWeight: row[2] ? 700 : undefined }}>{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Highlight cyan>
            <strong style={{ color: S.cyan }}>📌 Importante:</strong> TikTok não retém dinheiro. Repasse diário após o D+15. Pedidos cancelados antes da entrega <strong>não aparecem</strong> no relatório financeiro. A comissão de afiliado aparece separada como "taxa de comissão de afiliado" no relatório de repasse.
          </Highlight>
        </Section>

        {/* 10 - Q&A */}
        <section id="s10" style={{ padding: "64px 0 64px" }}>
          <SectionLabel num={10} tag="Ao Vivo" />
          <H2>Dúvidas Frequentes — Q&A</H2>
          <SectionDesc>As perguntas que mais aparecem. Durante a aula, vamos abrir para o chat ao vivo.</SectionDesc>
          <FaqAccordion />
        </section>

      </div>

      {/* FOOTER */}
      <div style={{ textAlign: "center", padding: "48px 24px", borderTop: `1px solid ${S.gray700}`, fontSize: 13, color: S.gray400 }}>
        <strong style={{ color: S.white }}>Aulão TikTok Shop</strong> · Jorge Souza · EXP Digital<br />
        Material de apoio exclusivo para alunos.
      </div>
    </div>
  )
}
