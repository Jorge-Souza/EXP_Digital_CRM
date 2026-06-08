-- Seed: 10 Carrosséis de Produção — @eujorgesouza TikTok Shop
-- Fonte: copy-carrosseis-jorge_1.html
-- semana = 5 (lote de produção separado do calendário de 30 dias)
-- status = pendente → prontos para produzir
-- client_id = NULL → CRM Produtos

DO $$
BEGIN

-- ============================================================
-- CARROSSEL 01 — A verdade sobre as taxas do TikTok Shop
-- ============================================================
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, direcao, cta_legenda, status) VALUES
(NULL, 1, 5, 'manha', 'carrossel', 'tutorial',
'A verdade sobre as taxas do TikTok Shop que ninguém calcula direito',
'SLIDE 01 — CAPA (Provocação)
Título: "A verdade sobre as taxas do TikTok Shop que ninguém calcula direito"
Subtítulo: "Você sabe quanto fica no seu bolso de verdade?"
Tag de categoria: TikTok Shop

SLIDE 02 — DOR (Opinião forte — Diagnóstico)
"Na minha opinião, a maioria dos sellers vive no prejuízo porque não faz essa conta."
Lista com toggles DESLIGADOS:
- Comissão marketplace: 6%
- Taxa de frete: 6%
- Taxa por item: R$4
- Custo do produto + embalagem
"Ninguém calcula tudo junto."

SLIDE 03 — VIRADA (Pessoal)
"Pra mim, o jogo mudou quando eu parei de olhar só para o preço de venda e comecei a olhar para a margem real."
Complemento: "Hoje toda precificação começa pelo trás pra frente: quanto quero de lucro → qual deve ser o preço."

SLIDE 04 — DADOS (Os números reais)
"A conta que todo seller deveria fazer antes de precificar:"
Preço de venda: R$100
(-) Comissão 6%: R$6
(-) Frete 6%: R$6
(-) Taxa por item: R$4
(-) Custo do produto: R$35
(-) Embalagem: R$3
= Lucro real: R$46 (46%)
"Mas se o produto custa R$60 e você vende R$100 achando que lucra R$40... está errado."

SLIDE 05 — REFRAME (Mental)
"E sinceramente? Você não precisa de mais vendas. Precisa de margem melhor."
"Vender mais com margem ruim só aumenta seu trabalho. A escala no TikTok Shop vem de produto bem precificado + afiliados multiplicando."

SLIDE 06 — CTA (Final)
"É exatamente isso que eu ensino na Assessoria Turbina TikTok Shop."
"Como estruturar operação, precificação e escala em 90 dias."
"7 vagas disponíveis."
Palavra-chave: TURBINA',
'Identidade visual: preto + vermelho + branco. Fonte bold sem serifa.
Slide 1: fundo preto, palavra TAXAS em vermelho gigante, foto de celular com TikTok Shop ao fundo desfocada.
Slide 2: fundo vermelho, lista com toggles desligados, texto branco bold.
Slides 3-4: fundo claro editorial (foto ambiente ou planilha branca com negativos em vermelho e lucro em verde).
Slide 5: fundo branco, "Você não precisa de mais vendas." em preto gigante, "Precisa de margem melhor." em vermelho grande.
Slide 6: fundo vermelho total, texto branco, botão preto com palavra-chave.
Handle @eujorgesouza em todos os slides, canto inferior.',
'Legenda: "Você sabe quanto realmente fica no seu bolso depois de cada venda no TikTok Shop? A maioria dos sellers não faz essa conta. Arrasta e descobre o número real. 👇"
CTA: Comenta TURBINA
Objetivo: Salvar + Comentar',
'pendente');

-- ============================================================
-- CARROSSEL 02 — GMV Max: obrigatório desde setembro de 2025
-- ============================================================
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, direcao, cta_legenda, status) VALUES
(NULL, 2, 5, 'manha', 'carrossel', 'tutorial',
'GMV Max: obrigatório desde setembro de 2025 — você ainda não configurou?',
'SLIDE 01 — CAPA (Urgência)
"GMV Max é obrigatório desde setembro de 2025. Você configurou direito?"
Tag: TikTok Shop Ads

SLIDE 02 — DOR (Diagnóstico — O problema)
"Na minha opinião, a maioria dos sellers ativou o GMV Max mas não entende como ele funciona de verdade."
Toggles DESLIGADOS:
- Não sabe a diferença entre GMV Max Produto e LIVE
- Não entende o modelo de atribuição em tempo real
- Não configurou as 3 permissões ACA corretamente
- Está pagando por clique sem ver retorno
"Ativar não é suficiente. Configurar certo é o que importa."

SLIDE 03 — VIRADA
"Pra mim, tudo ficou mais claro quando entendi que o GMV Max não é anúncio tradicional. É tráfego dentro do ecossistema do TikTok Shop."
"Ele distribui seus produtos para quem já tem intenção de compra dentro da plataforma. É diferente de impulsionar post."

SLIDE 04 — ESTRUTURA (O que você precisa saber)
"3 coisas que todo seller precisa entender sobre o GMV Max:"
1. GMV Max Produto — impulsiona seus produtos no feed e busca
2. GMV Max LIVE — distribui sua live para novos compradores
3. Atribuição em tempo real — o algoritmo otimiza por conversão, não por clique
"Período de graça para redução de comissão de afiliado: 30 dias após ativação."

SLIDE 05 — REFRAME
"E sinceramente? Você não precisa de mais seguidores. Precisa do GMV Max configurado certo."
"O algoritmo do TikTok Shop distribui produto — não perfil. Um seller com 200 seguidores pode vender mais que um com 50k se o GMV Max estiver rodando."

SLIDE 06 — CTA
"Quer aprender a configurar o GMV Max do jeito certo? No Programa de Aceleração TikTok Shop eu mostro tudo na prática."
Palavra-chave: GMV',
'Identidade: preto + vermelho + branco.
Slide 1: fundo preto, "GMV MAX" em vermelho gigante, subtítulo branco menor.
Slide 2: fundo vermelho com toggles desligados, texto branco bold.
Slides 3-4: editorial claro, foto de tela/dashboard com overlay de texto em blocos vermelho + branco.
Slide 5: tipografia grande fundo branco, destaque vermelho em "GMV Max configurado certo".
Slide 6: fundo vermelho total, texto branco, botão preto.
@eujorgesouza em todos.',
'Legenda: "O GMV Max é obrigatório no TikTok Shop desde setembro de 2025. Se você ainda não configurou direito, está perdendo tráfego agora. Arrasta e entende o que precisa fazer. 👇"
CTA: Comenta GMV
Objetivo: Salvar + Checklist',
'pendente');

-- ============================================================
-- CARROSSEL 03 — 100 amostras = 100 vídeos
-- ============================================================
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, direcao, cta_legenda, status) VALUES
(NULL, 3, 5, 'manha', 'carrossel', 'tutorial',
'100 amostras = 100 vídeos. A conta que todo seller ignora',
'SLIDE 01 — CAPA (Provocação)
"100 amostras grátis = 100 vídeos falando do seu produto."
"A conta que todo seller ignora no Programa de Afiliados."

SLIDE 02 — DOR (Diagnóstico)
"Na minha opinião, a maioria dos sellers trata afiliado como opcional. É o maior erro da operação."
Toggles DESLIGADOS:
- Não habilitou amostras grátis
- Comissão abaixo de 8% (criador não promove)
- Plano fechado (bloqueando criadores)
- Não monitora performance dos afiliados
"50% do GMV no TikTok Shop vem de afiliados. Você está ignorando metade do seu potencial."

SLIDE 03 — VIRADA
"Pra mim, tudo mudou quando entendi a lógica do slingshot: usar afiliados como alavanca, não como favor."
"100 amostras disponíveis = 100 criadores motivados a postar. Cada vídeo é um vendedor trabalhando por você 24h."

SLIDE 04 — ESTRUTURA (O método — Estratégia Slingshot)
"Como montar sua máquina de afiliados no TikTok Shop:"
Passo 1: Habilite mínimo 100 amostras dos seus top 5 produtos
Passo 2: Comissão entre 8-15% (abaixo disso ninguém promove)
Passo 3: Plano aberto com aprovação desativada
Passo 4: Identifique os 5-10 com melhor conversão
Passo 5: Invista anúncio nos vídeos desses afiliados (Spark Ads)

SLIDE 05 — REFRAME
"E sinceramente? Você não precisa criar todo o conteúdo. Precisa de criadores multiplicando seu produto."
"Seller que faz tudo sozinho tem teto. Seller que usa afiliados tem escala."

SLIDE 06 — CTA
"Quer montar sua estratégia de afiliados do zero? No Programa de Aceleração TikTok Shop eu ensino passo a passo."
Palavra-chave: SLINGSHOT',
'Identidade: preto + vermelho + branco.
Slide 1: fundo preto, "100" gigante em vermelho, subtítulo branco.
Slide 2: fundo vermelho, toggles desligados, texto branco bold.
Slide 3: foto de produto/embalagem com texto sobreposto em blocos coloridos.
Slide 4: fundo branco, lista numerada em vermelho, estilo checklist.
Slide 5: fundo branco, frase principal grande preta, destaque vermelho.
Slide 6: fundo vermelho total, texto branco, botão preto.
@eujorgesouza em todos.',
'Legenda: "Você não precisa de 100k seguidores. Precisa de 100 criadores certos falando do seu produto. A estratégia de afiliados que ninguém está usando direito 👇"
CTA: Comenta SLINGSHOT
Objetivo: Salvar + Engajamento',
'pendente');

-- ============================================================
-- CARROSSEL 04 — Live Shop converte 10–20%
-- ============================================================
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, direcao, cta_legenda, status) VALUES
(NULL, 4, 5, 'manha', 'carrossel', 'tutorial',
'Live Shop converte 10–20%. E-commerce tradicional converte 1–3%.',
'SLIDE 01 — CAPA (Dado que choca)
"Live Shop converte 10x mais que e-commerce tradicional."
"E a maioria dos sellers ainda não faz live. Por quê?"

SLIDE 02 — DOR (Diagnóstico)
"Na minha opinião, o seller que não faz live está deixando dinheiro na mesa todo dia."
Toggles DESLIGADOS (desculpas):
- "Não tenho tempo para fazer live"
- "Não sei o que falar na câmera"
- "Minha audiência é pequena"
- "Já tentei e não vendeu"
"Live não é improvisação. É script com repetição estratégica."

SLIDE 03 — DADOS (Comparativo — Os números)
"A diferença que ninguém mostra:"
E-commerce tradicional: Conversão 1–3% | Urgência baixa | Engajamento passivo
TikTok Live Shop: Conversão 10–20% | Urgência alta | Compra por impulso
"A live cria o ambiente que o produto sozinho não consegue criar."

SLIDE 04 — ESTRUTURA (Como funciona a live que vende)
"O ciclo de 5 minutos que se repete durante toda a live:"
Gancho: primeiros 5 segundos — geração de curiosidade
Demonstração: produto funcionando na prática
Quebra de objeção: antecipa a dúvida e responde
Oferta: preço + condição especial da live
CTA: "comenta EU QUERO" + urgência de estoque

SLIDE 05 — REFRAME
"E sinceramente? Você não precisa de audiência grande para vender na live. Precisa de script certo + produto certo."
"O algoritmo do TikTok Shop distribui a live para quem quer comprar — não para seus seguidores."

SLIDE 06 — CTA
"Quer o script completo de live que eu ensino para meus mentorados? Comenta aqui embaixo que eu te mando."
Palavra-chave: LIVE',
'Identidade: preto + vermelho + branco.
Slide 1: fundo preto, "10x" gigante em vermelho, resto branco.
Slide 2: fundo vermelho, toggles desligados representando desculpas, texto branco.
Slide 3: fundo branco, tabela visual comparativa duas colunas, coluna TikTok em vermelho.
Slides 4-5: editorial branco com lista circular/em etapas, números em vermelho.
Slide 6: fundo vermelho total, texto branco bold, botão preto.
@eujorgesouza em todos.',
'Legenda: "Live Shop converte até 20%. Seu e-commerce converte 1-3%. A conta não fecha sem live. Arrasta e entende por que todo seller precisa estar fazendo live agora. 👇"
CTA: Comenta LIVE
Objetivo: Salvar + Seguir',
'pendente');

-- ============================================================
-- CARROSSEL 05 — O que eu analiso antes de aceitar um aluno
-- ============================================================
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, direcao, cta_legenda, status) VALUES
(NULL, 5, 5, 'manha', 'carrossel', 'bastidor',
'O que eu analiso antes de aceitar um aluno na mentoria de TikTok Shop',
'SLIDE 01 — CAPA (Curiosidade)
"O que eu analiso antes de aceitar qualquer aluno novo"
"(e que a maioria dos sellers entrega de graça, ou nem entrega)"

SLIDE 02 — SALVAR
"SALVA ESSE POST"
"Você vai usar esse checklist antes de entrar em qualquer mentoria ou assessoria de TikTok Shop."

SLIDE 03 — PONTO 01
"01. O que você vende e para quem?"
"Não o produto em si. Quem de fato compra, o que motivou a compra, qual dor resolve."
"Seller que não sabe responder isso tem produto sem posicionamento."
"Sem clareza de produto → estratégia fraca."

SLIDE 04 — PONTO 02
"02. Você tem estoque real para escalar?"
"Não adianta montar estratégia de afiliados e GMV Max sem produto disponível."
"Mentoria funciona para quem está pronto para crescer — não para quem ainda está estruturando o básico."

SLIDE 05 — PONTO 03
"03. Qual é sua situação atual na plataforma?"
"Passou do período de avaliação? Já tem vendas? Usa GMV Max? Tem afiliados ativos?"
"Essas respostas definem o ponto de partida — e a velocidade de resultado."

SLIDE 06 — REFRAME
"E sinceramente? Não aceito qualquer seller. Aceito quem está pronto para escalar."
"A Assessoria Turbina TikTok Shop tem 7 vagas porque cada aluno recebe atenção individual. Não é curso. É aceleração real."

SLIDE 07 — CTA
"Quer saber se você está pronto para a assessoria? Me fala no Direct: o que você vende, sua situação atual e como me encontrou."
Palavra-chave: PRONTO',
'Slide 1: fundo branco limpo, ícone de lupa ou compass em vermelho, texto preto bold, sublinhado vermelho em "eu analiso".
Slide 2: fundo branco, ícone bookmark vermelho grande centralizado, "Salve Agora" repetido ao redor.
Slides 3-5: fundo branco, "01." / "02." / "03." em vermelho grande, texto preto limpo.
Slide 6: fundo branco, tipografia grande, "7 vagas" em destaque vermelho.
Slide 7: fundo vermelho total, texto branco, botão preto.
@eujorgesouza em todos.',
'Legenda: "Antes de fechar com qualquer aluno, eu faço um processo completo de análise. E a maioria dos sellers entrega isso de graça ou simplesmente nem faz. Arrasta pra descobrir o que eu analiso."
CTA: Comenta PRONTO
Objetivo: Qualificação + Conversão',
'pendente');

-- ============================================================
-- CARROSSEL 06 — Dá série: não viraliza, mas ajuda a vender
-- ============================================================
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, direcao, cta_legenda, status) VALUES
(NULL, 6, 5, 'manha', 'carrossel', 'tutorial',
'Dá série: não viraliza, mas ajuda a vender no TikTok Shop',
'SLIDE 01 — CAPA (Série)
"Dá série: NÃO VIRALIZA, MAS AJUDA A VENDER."

SLIDE 02 — TIPO 1 (Problema × Solução)
"Post: Problema × Solução"
"Você mostra um problema real do seller e apresenta a solução direta. Um problema por post."
Exemplo TikTok Shop:
❌ Problema: seller perde pedido por não emitir NF no prazo
✅ Solução: integrar Bling ao TikTok Shop e automatizar

SLIDE 03 — TIPO 2 (Prática do Dia a Dia)
"Post: Prática do dia a dia"
"Uma boa prática que ajuda o seller no dia a dia com um desafio real da operação."
Exemplos:
→ Como organizar os pedidos do dia antes de despachar
→ Rotina de 30 minutos do seller que mantém métricas no verde

SLIDE 04 — TIPO 3 (Ponto de Vista)
"Post: Ponto de Vista (POV)"
"Mostra o processo de compra do ponto de vista do comprador no TikTok Shop — desde descobrir o produto até finalizar a compra."
Exemplo: "POV: você é um comprador que acabou de entrar numa live de moda no TikTok Shop..."

SLIDE 05 — CTA
"Quer mais conteúdo que não viraliza mas vende no TikTok Shop? Me segue."
"Aqui é o único lugar no Brasil com conteúdo operacional real sobre TikTok Shop para sellers."
Palavra-chave: VENDER',
'Slide 1: segurar notebook/tablet mostrando tela vermelha com texto branco — fundo céu azul ou ambiente neutro.
Slides 2-4: editorial claro texturizado, antes/depois visual, grade de imagens ou sequência de prints storytelling.
Slide 5: fundo vermelho, texto branco, botão preto.
@eujorgesouza em todos.',
'Legenda: "Dá série: não viraliza, mas resolve o problema do seller que não sabe por onde começar no TikTok Shop. Arrasta 👇"
CTA: Comenta VENDER
Objetivo: Salvar + Alcance',
'pendente');

-- ============================================================
-- CARROSSEL 07 — Como organizar sua operação sem caos
-- ============================================================
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, direcao, cta_legenda, status) VALUES
(NULL, 7, 5, 'manha', 'carrossel', 'bastidor',
'Como organizar sua operação de TikTok Shop sem caos',
'SLIDE 01 — CAPA
"Como organizar sua OPERAÇÃO no TikTok Shop"
"O que separa um seller amador de um seller que escala?"

SLIDE 02 — DOR (O maior erro)
"O maior erro. A maioria vive assim:"
Post-it com texto manuscrito:
- pedido acumulado no prazo
- NF não emitida
- afiliado sem amostra
- GMV Max sem verba
- live sem script
"Aí tudo vira caos operacional."

SLIDE 03 — VIRADA
"Pra mim, o jogo mudou quando eu parei de depender da memória pra tocar a operação."
"Hoje praticamente tudo tem processo: cadastro de produto, emissão de NF, despacho, afiliados, live."
"Processo bom = menos caos + mais GMV."

SLIDE 04 — ESTRUTURA (Minha estrutura semanal)
"MINHA ESTRUTURA:"
SEGUNDA: Revisar pedidos + despacho do dia
TERÇA: Verificar métricas + GMV Max
QUARTA: Live Shop + conteúdo da semana
QUINTA: Afiliados + amostras + performance
SEXTA: Financeiro + próxima semana

SLIDE 05 — SEGREDO (Ferramentas)
"Hoje eu uso:"
- Bling para NF e integração com TikTok Shop
- Central do Vendedor para métricas diárias
- Claude para estratégia e scripts de live
- Processos claros para cada etapa da operação
"Operação organizada = menos retrabalho + mais escala."

SLIDE 06 — CTA
"Quer organizar sua operação de TikTok Shop de verdade? Na Assessoria Turbina eu vou mostrar: meu processo, minhas ferramentas e como estruturar para escalar."
Palavra-chave: OPERAÇÃO',
'Slide 1: fundo cinza claro, figura humana curvada com peso nas costas, texto sobreposto em vermelho e preto.
Slide 2: fundo branco, post-it vermelho com texto manuscrito no centro, título preto bold no topo.
Slide 3: foto de ambiente de trabalho com texto sobreposto em blocos vermelho + branco, estilo editorial.
Slide 4: fundo branco, dias da semana em vermelho bold, descrições em preto, estilo lista limpa.
Slide 5: fundo vermelho, janela de app estilizada com lista de ferramentas e ícones ao lado.
Slide 6: fundo vermelho total, texto branco, botão preto.
@eujorgesouza em todos.',
'Legenda: "Como ter mais vendas no TikTok Shop sem caos operacional. O que separa um seller amador de um seller que escala? Arrasta 👇"
CTA: Comenta OPERAÇÃO
Objetivo: Salvar + Conversão',
'pendente');

-- ============================================================
-- CARROSSEL 08 — 5 configurações do TikTok Shop em 2025
-- ============================================================
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, direcao, cta_legenda, status) VALUES
(NULL, 8, 5, 'manha', 'carrossel', 'tutorial',
'5 configurações do TikTok Shop que todo seller precisa ter em 2025',
'SLIDE 01 — CAPA (Lista numerada)
"5 CONFIGURAÇÕES QUE TODO SELLER DO TIKTOK SHOP PRECISA TER EM 2025"
"Se quiser vender mais →"

SLIDE 02 — CONFIGURAÇÃO 1
"Configuração 1: GMV Max ativo e calibrado"
"Obrigatório desde setembro de 2025. Configure o objetivo certo: Maximizar Delivery para volume ou Meta de ROI para eficiência."
"A maioria ativa sem calibrar — e queima verba."

SLIDE 03 — CONFIGURAÇÃO 2
"Configuração 2: Programa de Afiliados com plano aberto"
"Mínimo 100 amostras por produto. Comissão entre 8-15%. Aprovação de criadores desativada."
"Sem isso, nenhum criador vai promover seu produto."

SLIDE 04 — CONFIGURAÇÃO 3
"Configuração 3: Programa de Frete Grátis ativo"
"Vendedores participantes recebem subsídio de frete e tráfego gratuito em períodos específicos."
"Não participar = perder vantagem competitiva direta."

SLIDE 05 — CONFIGURAÇÃO 4
"Configuração 4: ERP integrado (Bling ou similar)"
"Emissão de NF manual é erro de iniciante. Com o Bling integrado, a NF sai automaticamente junto com a etiqueta."
"Zero risco de multa por atraso."

SLIDE 06 — CONFIGURAÇÃO 5
"Configuração 5: Live Shop agendada toda semana"
"A live precisa de agenda, script e sacola de produtos organizada. Seller que improvisa na live perde venda."
"Use o Live Manager da Central do Vendedor para planejar."

SLIDE 07 — CTA
"Quer configurar tudo isso com acompanhamento individual? Na Start TikTok Shop eu vou te mostrar: operação completa, configurações certas e como escalar seu GMV."
Palavra-chave: START',
'Slide 1: fundo azul/escuro impactante, "5" gigante em vermelho, pessoa sentada em computador nas nuvens (estilo "5 Automações").
Slides 2-6: editorial numerado limpo, fundo branco, "Configuração X:" em vermelho grande, texto preto, diagrama simples.
Slide 7: fundo vermelho total, texto branco, botão preto.
@eujorgesouza em todos.',
'Legenda: "5 configurações que todo seller de TikTok Shop precisa ter ativas agora. Se quiser vender mais para qualquer nicho, começa por aqui 👇"
CTA: Comenta START
Objetivo: Salvar + Alcance',
'pendente');

-- ============================================================
-- CARROSSEL 09 — Rotina do seller: certo vs. errado
-- ============================================================
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, direcao, cta_legenda, status) VALUES
(NULL, 9, 5, 'manha', 'carrossel', 'reacao',
'Rotina do seller de TikTok Shop: certo ✅ vs. errado ❌',
'SLIDE 01 — CAPA
"Rotina de seller de TikTok Shop: certo ✅ vs. errado ❌"

SLIDE 02 — OPERAÇÃO
"Operação:"
✅ Emite NF automaticamente com ERP integrado
❌ Emite NF manual quando lembra
✅ Despacha em até 3 dias úteis, sempre
❌ Deixa pedido acumular e perde prazo
✅ Monitora métricas diariamente na Central
❌ Abre o painel uma vez por semana

SLIDE 03 — CONTEÚDO
"Conteúdo:"
✅ Posta vídeo comprável 2x por dia
❌ Posta quando tem vontade
✅ Faz live com script e sacola organizada
❌ Liga a câmera e improvisa
✅ Tem afiliados ativos com amostras
❌ Espera o produto vender sozinho

SLIDE 04 — TRÁFEGO
"Tráfego:"
✅ GMV Max calibrado com objetivo certo
❌ GMV Max ativado sem configuração
✅ Investe em Spark Ads nos afiliados que convertem
❌ Boost aleatório em qualquer post
✅ Participa do Programa de Frete Grátis
❌ Frete por fora sem subsídio da plataforma

SLIDE 05 — CTA
"Quer montar a rotina certa do zero? Na Assessoria Turbina TikTok Shop eu acompanho sua operação por 90 dias."
Palavra-chave: ROTINA',
'Slide 1: fundo preto, dois lados divididos — verde (✅) e vermelho (❌), estilo comparativo dramático.
Slides 2-4: fundo branco, ✅ em verde e ❌ em vermelho em cada linha, fonte bold limpa.
Slide 5: fundo vermelho total, texto branco, botão preto.
@eujorgesouza em todos.',
'Legenda: "A rotina de quem escala no TikTok Shop parece com a sua? Certo ✅ vs. Errado ❌ — arrasta e descobre onde você está errando 👇"
CTA: Comenta ROTINA
Objetivo: Engajamento + Salvar',
'pendente');

-- ============================================================
-- CARROSSEL 10 — Carta aberta aos sellers estagnados (TEXTO PURO)
-- ============================================================
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, direcao, cta_legenda, status) VALUES
(NULL, 10, 5, 'manha', 'carrossel', 'narrativa',
'Carta aberta aos sellers estagnados no TikTok Shop',
'⚠️ FORMATO: TEXTO PURO — publicar direto como texto no Instagram, sem arte/imagem.

---

Carta aberta aos sellers que estão estagnados no TikTok Shop.

Você está fazendo a coisa certa do jeito errado.

Você cadastrou os produtos.
Ativou o GMV Max.
Postou alguns vídeos.
Talvez até tenha feito uma live.

Mas o GMV não cresce.

O problema não é a plataforma.
Não é o produto.
Não é o algoritmo.

É que cada uma dessas peças está rodando sozinha — sem estratégia conectando tudo.

Short-vídeo sem produto linkado é conteúdo, não venda.
GMV Max sem calibração é gasto, não investimento.
Live sem script é câmera ligada, não conversão.
Afiliado sem amostra é promessa, não resultado.

Quem escala no TikTok Shop não faz mais — faz certo.

Se você tem produto bom, tem estoque e quer sair da estagnação em 90 dias:

Me chama no Direct.
Comenta TURBINA aqui embaixo.

— Jorge Souza
Especialista em TikTok Shop · Embaixador TikTok Shop BR',
'TEXTO PURO — sem arte, sem imagem.
O impacto vem da linguagem direta.
Publicar direto como post de texto no Instagram.
Máximo de quebras de linha para facilitar leitura no mobile.',
'Legenda: (o próprio texto é a legenda)
CTA: Comenta TURBINA
Objetivo: Comentários + Conversão',
'pendente');

END $$;
