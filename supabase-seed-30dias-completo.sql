-- Seed COMPLETO: 30 dias de conteúdo @eujorgesouza · TikTok Shop
-- client_id = NULL → aparece no CRM Produtos
-- Rode esse arquivo no Supabase SQL Editor
-- Se já tiver dados anteriores, rode antes: DELETE FROM conteudo_posts WHERE client_id IS NULL;

DO $$
BEGIN

-- ============================================================
-- SEMANA 1 (dias 1–7): Estabelecer Autoridade
-- ============================================================

-- DIA 1 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, direcao, cta_legenda) VALUES
(NULL, 1, 1, 'manha', 'reel', 'estalo', 'Você não vende pouco porque não tem seguidores',
'0–3s: GANCHO: Olha direto pra câmera, pausa de 1 segundo antes de falar. "Você não vende pouco porque não tem seguidores."
3–8s: "Você vende pouco porque ninguém entende o que você vende."
8–18s: "Seguidores sem clareza não compram nada. Eu já vi perfil com 500 seguidores faturando R$20 mil no TikTok Shop e perfil com 50 mil que não consegue nem R$2 mil."
18–28s: "A diferença? Clareza. O produto certo. A vitrine certa. A mensagem certa. Sem isso, seguidor não vira cliente."
28–35s: FECHAMENTO: "Comenta aqui embaixo se isso te acertou. Porque se acertou, você precisa mudar uma coisa antes de tudo."',
'Câmera próxima ao rosto, boa iluminação frontal. Fundo neutro ou do seu escritório. Sem legenda no gancho — ele precisa surpreender. Expressão séria no gancho, mais leve no fechamento. Duração ideal: 30–38 segundos.',
'Legenda: "Seguidores não vendem. Clareza vende. Salva esse vídeo e mostra pra quem precisa ouvir isso." | CTA spoken: "Comenta se isso te acertou"');

-- DIA 1 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, direcao, cta_legenda) VALUES
(NULL, 1, 1, 'noite', 'reel', 'tutorial', 'Como habilitar sua loja no TikTok Shop do zero em 2025',
'0–3s: GANCHO: "Tem CNPJ e ainda não habilitou a loja no TikTok Shop? Você está deixando dinheiro na mesa."
3–8s: "O TikTok Shop completou 1 ano no Brasil em maio de 2025. O volume de vendas cresceu 4.500% nos primeiros 3 meses. E tem gente que ainda não entrou."
8–35s: TELA: Abra o Seller Center ao vivo. "Passo 1: acessa seller-br.tiktok.com. Passo 2: clica em cadastrar loja. Passo 3: insere CNPJ — pode ser MEI. Passo 4: sobe os documentos. Passo 5: aguarda aprovação, que leva em média 2 dias úteis."
35–45s: "O erro mais comum aqui é subir documento com foto de baixa qualidade. Isso reprova na hora. Documento nítido, fundo branco, tudo legível."
45–55s: FECHAMENTO: "Link no bio com o passo a passo completo — incluindo o que fazer depois que a loja for aprovada. Não pula essa etapa."',
'Formato câmera + tela: abre no seu rosto (gancho), corta para tela compartilhada (tutorial), volta para rosto (fechamento). Use legenda automática no TikTok/CapCut. Duração ideal: 50–60 segundos.',
'Legenda: "Passo a passo completo para habilitar sua loja no TikTok Shop. Salva esse vídeo." | CTA: Link no bio → Protocolo Lucrativo R$67');

-- DIA 2 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda, dados_apoio) VALUES
(NULL, 2, 1, 'manha', 'reel', 'narrativa', 'Por que o Mercado Livre deveria estar preocupado com o TikTok Shop',
'0–3s: GANCHO: "Enquanto você está preocupado com seguidores, o Mercado Livre está preocupado com o TikTok Shop."
3–12s: "Sabe por quê? O Mercado Livre hoje tem 34% do tráfego de marketplaces no Brasil. A Shopee tem 25%. A Amazon, 17%. E o TikTok Shop? Lançou em maio de 2025 e já projetam que pode chegar a 9% do e-commerce brasileiro em 3 anos."
12–25s: "Mas a diferença é que o Mercado Livre é e-commerce de intenção. Você entra para comprar o que já quer. O TikTok Shop é e-commerce de descoberta. Você entra para se entreter e descobre que quer comprar."
25–38s: "Isso muda tudo. Porque a loja que souber vender por conteúdo vai ter um custo de aquisição de cliente muito menor do que quem depende de anúncio pago em marketplace."
38–45s: FECHAMENTO: "Comenta o que você acha: o TikTok Shop vai ameaçar o Mercado Livre de verdade? Eu tenho uma opinião bem definida sobre isso."',
'Legenda: "O maior deslocamento de receita do varejo digital brasileiro começou. Você está posicionado?"',
'Mercado Livre: 34,3% do tráfego · Shopee: 24,8% · Amazon: 16,8% (Conversion, jul/2025). TikTok Shop: crescimento de 4.500% em 3 meses no BR. Projeção Itaú Unibanco: injeção de R$3 bilhões no e-commerce.');

-- DIA 2 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(NULL, 2, 1, 'noite', 'carrossel', 'tutorial', 'Os 5 erros que travam vendedores nos primeiros 30 dias no TikTok Shop',
'CAPA: "Os 5 erros que travam vendedores nos primeiros 30 dias no TikTok Shop" | Desliza antes de publicar o primeiro produto →
CARD 2 - Erro #1: Habilitar a loja sem configurar a logística. A transportadora é definida pela plataforma (J&T, Correios, iMile, Total Express). Se você não souber onde entregar ou como imprimir a etiqueta, o pedido atrasa, sua nota cai e a loja é penalizada.
CARD 3 - Erro #2: Cadastrar produto sem precificação estratégica. O TikTok Shop cobra 6% de comissão + 6% de imposto + R$4 por item. Quem não calcula antes vende no prejuízo sem saber. Você precisa construir o preço de trás pra frente.
CARD 4 - Erro #3: Não integrar o ERP desde o início. Sem o Bling integrado, você não emite nota fiscal automaticamente. Isso gera multas, atrasos e dor de cabeça operacional. Configure o ERP antes do primeiro pedido, não depois.
CARD 5 - Erro #4: Não liberar os botões de permissão do Seller Center. Existem 3 botões de permissão que ampliam sua exposição na plataforma. A maioria dos vendedores nem sabe que existem. Sem eles, você opera com o freio de mão puxado.
CARD 6 - Erro #5: Esperar ter estoque grande para começar. Você não precisa de 100 produtos cadastrados. Precisa de 5 bem cadastrados, bem precificados e com fotos profissionais. Quantidade sem qualidade não converte.
CARD FINAL: "Cometeu algum desses erros? Eu tenho um passo a passo completo para montar sua operação do jeito certo — do zero à primeira venda. Link no bio."',
'Legenda: "Salva esse carrossel antes de publicar qualquer produto. Esses erros custam caro."');

-- DIA 3 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda, dados_apoio) VALUES
(NULL, 3, 1, 'manha', 'reel', 'reacao', 'Shopee anuncia expansão logística no Brasil — o que isso revela para vendedores do TikTok Shop',
'0–3s: GANCHO: "A Shopee acabou de anunciar expansão logística no Brasil. E a primeira coisa que pensei foi: isso é uma boa notícia pra quem está no TikTok Shop."
3–15s: "A Shopee hoje tem 25% do tráfego de marketplaces no Brasil. Está construindo novos centros de distribuição, consegue entregar 40% dos pedidos em até 2 dias na Grande São Paulo. Ela está claramente tentando reduzir a vantagem logística do Mercado Livre."
15–30s: "Mas sabe o que ela não tem? Conteúdo nativo. A Shopee vende por preço. O TikTok Shop vende por conexão. Quando o consumidor compra por conexão, a lealdade é muito maior do que quando compra por preço."
30–42s: "O vendedor que entender isso agora tem uma vantagem enorme: enquanto todo mundo briga por R$0,50 de frete, você está construindo uma audiência que compra de você porque te conhece."
42–50s: FECHAMENTO: "Comenta o que você acha: preço ou conexão — o que vai ganhar o e-commerce brasileiro?"',
'Legenda: "Shopee ganha na logística. TikTok Shop ganha na conexão. Você escolhe em qual campo quer jogar."',
'Shopee: 13 centros de distribuição, 150 hubs, 2.800 pontos de coleta. 40% das entregas em até 2 dias na Grande SP. Vendas de R$60 bilhões anuais. Fonte: E-Commerce Brasil, ago/2025.');

-- DIA 3 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(NULL, 3, 1, 'noite', 'reel', 'tutorial', 'Como funcionam as taxas do TikTok Shop — número real na tela',
'0–3s: GANCHO: "Me perguntam isso toda semana: ''Jorge, quanto o TikTok Shop cobra?'' Vou responder de uma vez por todas. Com número na tela."
3–20s: TELA com planilha ou texto: "3 cobranças que você precisa saber: 1 — Comissão da plataforma: 6% sobre o valor de venda. 2 — Imposto transacional: 6%. 3 — Taxa fixa por item: R$4,00"
20–35s: "Então num produto de R$100, você paga R$6 de comissão, R$6 de imposto e R$4 fixo. Total: R$16. Sobram R$84. Tira seu custo de produto e a logística. O que sobrar é seu lucro."
35–48s: "Por isso precificação estratégica não é opcional. É a diferença entre vender com margem ou vender no prejuízo sem saber."
48–55s: FECHAMENTO: "Salva esse vídeo e manda pra quem ainda vai entrar no TikTok Shop. Essa conta precisa estar clara antes do primeiro produto."',
'Legenda: "6% + 6% + R$4. Salva esse vídeo e calcula o seu produto agora." | CTA: Link no bio → Protocolo Lucrativo R$67');

-- DIA 4 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(NULL, 4, 1, 'manha', 'reel', 'estalo', 'Quem vende produto vende uma vez. Quem cria audiência vende para sempre.',
'0–3s: GANCHO: Olha pra câmera, pausa. "Quem vende produto vende uma vez."
3–5s: Pausa. "Quem cria audiência vende para sempre."
5–18s: "Dois vendedores. Mesmo produto. Mesmo preço. Um investe tudo em anúncio pago. O outro investe em construir uma audiência que confia nele. Em 6 meses, o primeiro gasta mais pra vender igual. O segundo gasta menos e vende mais."
18–28s: "O TikTok Shop foi feito para isso. Você não é só vendedor de marketplace. Você é criador que vende. E criador que vende tem custo de aquisição de cliente perto de zero."
28–35s: FECHAMENTO: "Comenta: você está construindo produto ou audiência? Porque a resposta define onde você vai estar daqui a 1 ano."',
'Legenda: "Salva isso. Você vai querer reler depois."');

-- DIA 4 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(NULL, 4, 1, 'noite', 'reel', 'caso', 'Aluna que entrou no Club sem saber nada — o que aconteceu em 30 dias',
'0–3s: GANCHO: "Essa aluna entrou no meu Club sem ter habilitado a loja, sem entender nada de logística. Olha o que aconteceu 30 dias depois."
3–15s: MOSTRA O PRINT/RESULTADO: "Primeira semana: loja habilitada. Segunda semana: 5 produtos cadastrados com precificação correta. Terceira semana: primeira venda. Quarta semana: operação rodando sozinha."
15–28s: "O que ela tinha que a maioria não tem? Um sistema. Não improvisação. Cada semana com missão clara, suporte real e alguém pra responder quando travou."
28–38s: "O Club TikTok Shop não é só curso. São 6 meses de acompanhamento, 2 sessões SOS individuais comigo, grupo de WhatsApp e lives quinzenais com tema específico."
38–45s: FECHAMENTO: "Link no bio. Se ela conseguiu em 30 dias, o que você está esperando?"',
'Legenda: "30 dias. Uma aluna. Uma operação funcionando. Vem pro Club." | CTA: Link no bio → Club TikTok Shop R$997');

-- DIA 5 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda, dados_apoio) VALUES
(NULL, 5, 1, 'manha', 'reel', 'previsao', 'O que vai mudar no TikTok Shop nos próximos 90 dias — visão de Embaixador',
'0–3s: GANCHO: "Sou Embaixador Oficial do TikTok Shop Brasil. Quando tenho reunião com o time da plataforma, ouço coisas que não estão em nenhum tutorial. Vou te contar o que está vindo."
3–20s: "Primeira coisa: o sistema de selos. O TikTok Shop criou selos para vendedores — Gold Star Seller, Silver Star Seller, Official Shop. Quem tiver os selos vai ter mais exposição orgânica. Isso muda a lógica de quem aparece primeiro."
20–35s: "Segunda coisa: o Countdown Bidding — leilão ao vivo durante lives. Ainda restrito a produtos premium, mas está vindo para mais categorias. Se você vende moda ou acessórios, presta atenção nisso."
35–48s: "Terceira coisa: a plataforma está priorizando vendedores com operação limpa — nota alta, entrega no prazo, devolução resolvida rápido. Quem não está cuidando disso agora vai sentir no alcance."
48–56s: FECHAMENTO: "Salva esse vídeo e ativa as notificações. Quando eu tiver nova informação, você vai ser um dos primeiros a saber."',
'Legenda: "Informação de Embaixador. Salva antes que eu delete."',
'Selos TikTok Shop: Official Shop, Authorized Seller, Gold Star Seller, Silver Star Seller, Top Brand — lançados em junho/2025. Countdown Bidding: leilão ao vivo lançado para produtos de luxo/colecionáveis. Fonte: mlabs.com.br.');

-- DIA 5 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(NULL, 5, 1, 'noite', 'carrossel', 'tutorial', 'As 3 fases de todo vendedor bem-sucedido no TikTok Shop',
'CAPA: "As 3 fases de todo vendedor bem-sucedido no TikTok Shop" | Em qual fase você está? Desliza e descobre →
CARD 2 - Fase 1 — ESTRUTURA: Loja habilitada · ERP integrado · Nota fiscal configurada · Logística operando · Precificação correta · Primeiros produtos cadastrados. ⚠️ Sem essa base, qualquer esforço de vendas é desperdício.
CARD 3 - Fase 2 — EXPOSIÇÃO: Primeiras lives · Conteúdo de vendas · GMV Max ativado · Decisões baseadas em dados · Posicionamento de marca construindo. 📈 Aqui você para de esperar venda e começa a gerar venda.
CARD 4 - Fase 3 — EXPANSÃO: Tráfego pago · Rede de influenciadores/afiliados · Equipe montada · Novos produtos e nichos · Escala com operação sistematizada. 🚀 Aqui o negócio cresce sem depender só de você.
CARD FINAL: "Qual fase é a sua? Comenta aqui embaixo: 1, 2 ou 3. Se você está na Fase 1 ou 2 e quer acelerar, o Programa de Aceleração foi feito pra você. Link no bio."',
'Legenda: "Comenta qual fase você está. Preciso saber para criar mais conteúdo pra você." | CTA: Link no bio → Programa de Aceleração R$297');

-- DIA 6 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(NULL, 6, 1, 'manha', 'reel', 'bastidor', 'Bastidor: como é uma reunião de Embaixador com o time do TikTok Shop Brasil',
'0–3s: GANCHO: Mostra câmera do ambiente onde está. "Hoje tive reunião com o time do TikTok Shop. O que rolou lá dentro você não vai encontrar em nenhum canal do YouTube."
3–18s: "Como Embaixador Oficial do TikTok Shop Brasil no setor de moda, eu participo de reuniões de alinhamento onde a plataforma compartilha estratégias, novidades e o que está sendo priorizado internamente."
18–35s: "O que posso compartilhar hoje: a plataforma está com foco total em qualidade de operação. Quem entrega no prazo, resolve devolução rápido e tem avaliação acima de 4,5 vai receber mais exposição orgânica. Isso é diferente de qualquer outro marketplace que você conhece."
35–48s: "Segundo ponto: o Brasil foi um dos melhores lançamentos do TikTok Shop mundialmente. Isso significa que a plataforma vai continuar investindo forte aqui. Quem está dentro agora vai surfar esse crescimento."
48–55s: FECHAMENTO: "Ativa as notificações. Quando eu puder compartilhar mais, você vai ser o primeiro a saber."',
'Legenda: "Bastidor que não aparece em tutorial. Ativa as notificações."');

-- DIA 6 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(NULL, 6, 1, 'noite', 'reel', 'caso', 'Quanto ganhou esse afiliado no primeiro mês — sem ter estoque',
'0–3s: GANCHO: "Esse afiliado ganhou [VALOR] no primeiro mês no TikTok Shop. Sem produto, sem entrega, sem estoque."
3–8s: MOSTRA O EXTRATO: "Esse é o extrato de comissão dele. Números reais. Sem enrolar."
8–22s: "O caminho dele: habilitou a vitrine de influenciador no TikTok Shop — o que qualquer pessoa com 2.000 seguidores pode fazer. Escolheu 3 produtos de moda alinhados com o conteúdo que já fazia. Começou a fazer vídeos mostrando os produtos. E a comissão foi acumulando."
22–35s: "O programa de afiliados do TikTok Shop conecta criadores a vendedores por comissão. Você não lida com logística, nota fiscal, atendimento. Você só cria conteúdo e gera venda."
35–43s: FECHAMENTO: "Comenta ''COMISSÃO'' aqui embaixo que eu te explico como funciona a vitrine de influenciador."',
'Legenda: "Sem estoque. Sem entrega. Só comissão. Comenta COMISSÃO." | CTA: Link no bio → Máquina de Influenciador');

-- DIA 7 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(NULL, 7, 1, 'manha', 'reel', 'estalo', 'O maior erro de quem começa no TikTok Shop não é técnico',
'0–3s: GANCHO: "O maior erro de quem começa no TikTok Shop não é técnico."
3–6s: Pausa. "É de mentalidade."
6–20s: "Você pode ter a loja perfeita. A nota fiscal configurada. O ERP integrado. O produto cadastrado com fotos profissionais. E ainda não vender."
20–32s: "O problema está antes disso tudo: a maioria das pessoas quer resultado de 6 meses em 6 semanas. E quando não vem, acha que o problema é a plataforma. Não é."
32–42s: "TikTok Shop é um canal de vendas que precisa de consistência, de conteúdo, de ajuste. Quem entende isso e continua, escala. Quem desiste na semana 3, nunca vai saber o que teria acontecido na semana 8."
42–50s: FECHAMENTO: "Comenta se você já quis desistir e o que te fez continuar."',
'Legenda: "Técnica qualquer um ensina. Mentalidade é mais raro. Salva esse vídeo."');

-- DIA 7 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(NULL, 7, 1, 'noite', 'carrossel', 'narrativa', 'Recap semana 1: 3 movimentos de mercado que a maioria ignorou',
'CAPA: "3 coisas que aconteceram no varejo digital essa semana — e o que elas significam pra você" | Desliza e conecta os pontos →
CARD 2 - #1 — TikTok Shop completou 1 ano no Brasil: Lançou em maio de 2025 com crescimento de 4.500% em 3 meses. O Brasil foi classificado como um dos melhores lançamentos mundiais da plataforma. A janela de entrada ainda está aberta — mas não vai ficar aberta para sempre.
CARD 3 - #2 — Mercado Livre investiu R$23 bilhões em logística: O líder está sentindo a pressão. 50% das entregas no mesmo dia ou no seguinte. Isso mostra que quem não dominar logística vai perder mercado — inclusive no TikTok Shop.
CARD 4 - #3 — Shopee expandiu centros de distribuição no Nordeste: A Shopee quer o Brasil inteiro, não só o Sudeste. Isso significa que a concorrência por preço vai aumentar em todas as regiões. Quem vende por conexão (TikTok Shop) tem vantagem sobre quem vende só por preço.
CARD FINAL: "O que você deve fazer com isso? Entrar no TikTok Shop agora, enquanto a plataforma ainda está em crescimento acelerado e a concorrência interna ainda é baixa. Ano que vem isso vai ser diferente."',
'Legenda: "Salva esse carrossel e compartilha com quem ainda está em cima do muro."');

-- ═══════════════════════════════════════════════════════
-- SEMANA 2 — AMPLIAR ALCANCE (dias 8–14)
-- Objetivo: conteúdo de topo de funil que captura quem ainda não te conhece
-- ═══════════════════════════════════════════════════════

-- DIA 8 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, direcao, cta_legenda) VALUES
(cid, 8, 2, 'manha', 'reel', 'estalo', 'Você não precisa de 10 mil seguidores para vender no TikTok Shop',
'0–3s: GANCHO: "Para de esperar ter 10 mil seguidores para começar a vender no TikTok Shop."
3–8s: "Eu conheço criadores com 800 seguidores que faturam mais do que influencer com 200 mil."
8–20s: "No TikTok Shop, o alcance vem do produto, não do perfil. Quando você vincula um produto a um vídeo, o algoritmo distribui esse vídeo para pessoas que já compraram produtos similares. Isso não existe em nenhuma outra plataforma."
20–32s: "Você não compete com seguidores. Você compete com relevância. Um vídeo bom sobre o produto certo bate qualquer perfil grande com produto errado."
32–40s: FECHAMENTO: "Comenta aqui embaixo quantos seguidores você tem hoje. Vou te mostrar que dá para começar exatamente de onde você está."',
'Câmera no rosto, linguagem direta. Fundo limpo. Energia alta no gancho. Duração ideal: 38–45 segundos.',
'Legenda: "Seguidores não vendem. Produto certo vende. Comenta quantos seguidores você tem."');

-- DIA 8 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 8, 2, 'noite', 'carrossel', 'tutorial', 'O passo a passo completo para sua primeira venda no TikTok Shop',
'CAPA: "Do zero à primeira venda no TikTok Shop — o passo a passo real" | Desliza →
CARD 2 - Passo 1: Habilite a loja. Acesse seller-br.tiktok.com, cadastre com CNPJ (pode ser MEI), envie documentos nítidos. Aprovação em até 2 dias úteis.
CARD 3 - Passo 2: Configure a logística. Defina seu endereço de coleta, escolha as transportadoras disponíveis (J&T, iMile, Correios, Total Express) e imprima as etiquetas pelo próprio Seller Center.
CARD 4 - Passo 3: Cadastre 5 produtos estratégicos. Não 100. Escolha produtos com boa margem após descontar 6% comissão + 6% imposto + R$4 fixo por item.
CARD 5 - Passo 4: Crie o primeiro vídeo de produto. Mostre o produto em uso, fale o benefício principal nos primeiros 3 segundos, vincule o produto ao vídeo dentro do TikTok.
CARD 6 - Passo 5: Ative o GMV Max. É a ferramenta de automação de tráfego do TikTok Shop. Com ela ativa, a plataforma distribui seu vídeo para quem tem mais chance de comprar.
CARD FINAL: "Esses 5 passos são o que eu ensinei para mais de 200 alunos que hoje têm operação rodando. Link no bio para entrar no Protocolo."',
'Legenda: "Salva esse carrossel. É o mapa que eu gostaria de ter tido no começo." | CTA: Link no bio → Protocolo Lucrativo R$67');

-- DIA 9 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, direcao, cta_legenda, dados_apoio) VALUES
(cid, 9, 2, 'manha', 'reel', 'narrativa', 'O TikTok Shop vai ser o maior marketplace do Brasil — e a maioria das pessoas vai perder essa janela',
'0–3s: GANCHO: "Em 2023, quem entrou na Shopee cedo construiu operações milionárias. Em 2025, a janela que está aberta é o TikTok Shop."
3–15s: "O Itaú Unibanco projetou que o TikTok Shop vai injetar R$3 bilhões no e-commerce brasileiro. A plataforma saiu de zero para disputar espaço com Mercado Livre e Shopee em menos de 12 meses."
15–30s: "Mas tem uma diferença fundamental: o TikTok Shop não é só marketplace. É a fusão de rede social com loja. Você vende enquanto entretém. Isso nunca existiu no Brasil antes."
30–42s: "A janela de entrada vai fechar. Não porque a plataforma vai sumir — mas porque quando todo mundo entrar, a concorrência vai ser outra. Quem está construindo agora vai ter vantagem de 2, 3 anos sobre quem entrar depois."
42–50s: FECHAMENTO: "Você está dentro ou ainda está olhando de fora? Comenta aqui."',
'Linguagem de análise de mercado. Sério, embasado. Não é hype — é dado.',
'Legenda: "A janela está aberta. Por quanto tempo, eu não sei. Mas eu sei que quem entrar agora vai agradecer daqui a 2 anos."',
'Itaú Unibanco: projeção de R$3 bilhões em impacto no e-commerce. TikTok Shop BR: crescimento de 4.500% em 3 meses. Maior lançamento mundial da plataforma segundo o próprio TikTok.');

-- DIA 9 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 9, 2, 'noite', 'reel', 'tutorial', 'Como cadastrar um produto do zero no Seller Center — ao vivo',
'0–3s: GANCHO: "Vou cadastrar um produto do zero agora ao vivo. Do título à publicação. Você vai ver exatamente o que fazer."
3–8s: "Esse é o processo que a maioria erra porque pula etapas. Não pula nenhuma."
8–45s: TELA: Abra o Seller Center ao vivo.
"Primeiro: título com palavra-chave principal no começo. Não coloca nome da sua loja — coloca o que o cliente pesquisa.
Segundo: fotos. Mínimo 3. Fundo branco na capa obrigatório. Sem marca d''água.
Terceiro: preço. Calcule com a planilha: preço de venda menos 6% comissão, menos 6% imposto, menos R$4, menos custo do produto, menos frete. O que sobrar é sua margem.
Quarto: estoque e logística. Defina a quantidade e confirme o endereço de coleta.
Quinto: publique e vincule a um vídeo."
45–55s: FECHAMENTO: "Salva esse vídeo e usa como guia no seu primeiro cadastro."',
'Legenda: "Cadastro do zero. Ao vivo. Sem corte. Salva e repete." | CTA: Link no bio → Protocolo Lucrativo R$67');

-- DIA 10 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 10, 2, 'manha', 'reel', 'reacao', 'Amazon anuncia expansão no Brasil — o que isso significa para quem vende no TikTok Shop',
'0–3s: GANCHO: "A Amazon acabou de anunciar que vai expandir sua operação de marketplace no Brasil. E isso é uma excelente notícia para você."
3–15s: "Espera — como a Amazon crescendo é boa notícia pra mim? Porque cada real que a Amazon investe no Brasil em logística e educação do consumidor para comprar online, é um real que aumenta o mercado total. E parte desse mercado vai para o TikTok Shop."
15–30s: "O consumidor que aprende a comprar na Amazon com um clique, vai comprar no TikTok Shop enquanto assiste a um vídeo. São comportamentos complementares, não concorrentes."
30–42s: "O grande erro é pensar que e-commerce é um bolo fixo onde cada pedaço que alguém come é pedaço que você perde. O bolo está crescendo. E quem souber fazer conteúdo vai comer uma fatia desproporcional."
42–50s: FECHAMENTO: "Qual marketplace você usa para comprar hoje? Comenta aqui."',
'Legenda: "Amazon cresce. TikTok Shop cresce. O consumidor online cresce. Você está posicionado para pegar essa onda?"');

-- DIA 10 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 10, 2, 'noite', 'carrossel', 'tutorial', 'Como calcular o preço certo no TikTok Shop — a planilha que todo vendedor precisa',
'CAPA: "A conta que define se você lucra ou perde no TikTok Shop" | Desliza e calcula →
CARD 2: O que o TikTok Shop cobra por venda: 6% de comissão sobre o valor de venda + 6% de imposto transacional + R$4,00 fixo por item vendido = Total: 12% + R$4
CARD 3 - Exemplo com produto de R$50: Valor de venda: R$50,00 | Comissão 6%: -R$3,00 | Imposto 6%: -R$3,00 | Taxa fixa: -R$4,00 | Você recebe: R$40,00. Agora tira o custo do produto e o frete.
CARD 4 - Regra de ouro: Margem mínima saudável = 30% sobre o custo do produto. Se seu produto custa R$20 e você recebe R$40, sua margem é 100%. Se custa R$35, sua margem é 14% — muito apertado.
CARD 5 - O erro mais comum: Precificar igual ao Mercado Livre. O TikTok Shop tem taxas diferentes. Um produto que dá lucro no ML pode dar prejuízo aqui se você não recalcular.
CARD 6 - A solução: Construa o preço de trás pra frente. Decida qual margem quer ter. Some o custo do produto + frete + taxas TikTok + margem desejada = preço mínimo de venda.
CARD FINAL: "Quer a planilha de precificação pronta? Está no Protocolo Lucrativo. Link no bio."',
'Legenda: "Salva esse carrossel antes de publicar qualquer produto." | CTA: Link no bio → Protocolo Lucrativo R$67');

-- DIA 11 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 11, 2, 'manha', 'reel', 'caso', 'Vendedor que estava no vermelho no ML virou referência no TikTok Shop em 60 dias',
'0–3s: GANCHO: "Esse vendedor estava no vermelho no Mercado Livre. 60 dias depois de entrar no TikTok Shop, virou referência no nicho dele."
3–15s: "O que mudou? Não foi o produto — era o mesmo. Não foi o preço — era similar. O que mudou foi o canal. No ML, ele competia por posição em anúncio pago. No TikTok Shop, ele competia por conteúdo — e conteúdo ele sabia fazer."
15–30s: "Ele começou fazendo vídeos mostrando o produto em uso. Sem roteiro sofisticado. Câmera de celular. Iluminação natural. Em 3 semanas, um vídeo viralizou dentro da plataforma e gerou 47 pedidos em 24 horas."
30–40s: "O diferencial dele: ele explicava o produto como se estivesse explicando para um amigo. Sem linguagem de vendedor. Com linguagem de quem usa e recomenda."
40–48s: FECHAMENTO: "Você também tem produto bom mas está no canal errado? Me conta nos comentários."',
'Legenda: "Mesmo produto. Canal diferente. Resultado diferente. Comenta se você se identifica com isso."');

-- DIA 11 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 11, 2, 'noite', 'reel', 'tutorial', 'GMV Max: a ferramenta que a maioria dos vendedores ignora e que multiplica suas vendas',
'0–3s: GANCHO: "Tem uma ferramenta dentro do TikTok Shop que a maioria dos vendedores nem sabe que existe. Ela se chama GMV Max."
3–10s: "GMV Max é o sistema de automação de tráfego do TikTok Shop. Quando você ativa, a plataforma usa inteligência artificial para distribuir seus vídeos de produto para as pessoas com maior probabilidade de comprar."
10–28s: TELA: "Para ativar: vai no Seller Center, em Promoções, e procura GMV Max. Você define um orçamento diário mínimo — pode começar com R$10 por dia — e a IA faz o resto. Ela analisa quem clicou, quem adicionou ao carrinho, quem comprou, e vai refinando o público ao longo do tempo."
28–42s: "A mágica acontece na semana 2 e 3. Na primeira semana a IA está aprendendo. A partir da segunda semana, ela começa a otimizar de verdade. Não desliga antes de 14 dias."
42–50s: FECHAMENTO: "Salva esse vídeo. Quando você tiver a loja ativa, esse vai ser o próximo passo."',
'Legenda: "GMV Max ligado = IA trabalhando pra você 24h. Salva esse vídeo." | CTA: Link no bio → Protocolo Lucrativo R$67');

-- DIA 12 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 12, 2, 'manha', 'reel', 'estalo', 'A diferença entre quem vende R$3 mil e quem vende R$30 mil no TikTok Shop não é o produto',
'0–3s: GANCHO: "A diferença entre quem fatura R$3 mil e quem fatura R$30 mil no TikTok Shop não é o produto."
3–8s: Pausa. "É o sistema."
8–22s: "Quem fatura R$3 mil tem bom produto. Quem fatura R$30 mil tem bom produto, processo de cadastro otimizado, logística sem erro, conteúdo consistente, GMV Max ativo e dados sendo lidos toda semana."
22–35s: "A escala no TikTok Shop não é inspiração. É replicação. Você encontra o que funciona — um produto, um formato de vídeo, um nicho — e replica sistematicamente. Não é sorte. É processo."
35–42s: FECHAMENTO: "Você já tem um processo definido ou ainda está improvisando? Comenta aqui."',
'Legenda: "R$3k ou R$30k. A diferença é o sistema. Salva isso."');

-- DIA 12 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 12, 2, 'noite', 'carrossel', 'bastidor', 'Como eu organizo minha semana como Embaixador do TikTok Shop',
'CAPA: "Minha semana como Embaixador Oficial do TikTok Shop Brasil" | Bastidor real →
CARD 2 - Segunda e terça: Análise de dados. Verifico métricas da semana anterior no Seller Center — taxa de conversão por produto, vídeos com mais cliques, devoluções. Decisões baseadas em número, não em feeling.
CARD 3 - Quarta: Reuniões e alinhamentos. Como Embaixador, participo de calls com o time do TikTok Shop. Aqui é onde ouço o que está sendo priorizado internamente antes de sair para o mercado.
CARD 4 - Quinta e sexta: Produção de conteúdo. Gravo os vídeos da semana seguinte em bloco. Roteiro pronto, iluminação configurada, câmera no tripé. 2 a 3 horas de gravação rendem 5 a 7 vídeos.
CARD 5 - Sábado: Mentoria e comunidade. Sessões individuais com alunos do Club, resposta no grupo de WhatsApp, revisão de operações. Suporte real, não robô.
CARD 6 - Domingo: Planejamento estratégico. Defino o tema da semana seguinte, pesquiso tendências, analiso o que os concorrentes estão fazendo (e o que não estão).
CARD FINAL: "Consistência não é talento. É agenda. Se quiser construir uma operação assim, o Club TikTok Shop está com vagas abertas. Link no bio."',
'Legenda: "Bastidor real de Embaixador. Não é glamour — é processo." | CTA: Link no bio → Club TikTok Shop R$997');

-- DIA 13 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 13, 2, 'manha', 'reel', 'previsao', 'O nicho que vai explodir no TikTok Shop nos próximos 6 meses',
'0–3s: GANCHO: "Vou te falar qual nicho vai explodir no TikTok Shop nos próximos 6 meses. E não é o que você está pensando."
3–12s: "Moda e beleza já dominam. Eletrônicos estão crescendo. Mas o nicho que está subindo silenciosamente é casa e organização. Produtos de R$30 a R$150, fáceis de mostrar em vídeo, alto volume de busca e margem boa."
12–28s: "Por quê? Porque o público do TikTok Shop no Brasil tem perfil de compra por descoberta. Você não entra para comprar uma caixa organizadora — você vê um vídeo mostrando como organizar a cozinha e compra no impacto. Esse comportamento favorece produtos visuais, práticos e acessíveis."
28–40s: "Segundo dado: as buscas por produtos de casa dentro do TikTok Shop cresceram 340% em 3 meses. Isso é sinal de demanda reprimida com pouca oferta de conteúdo bom."
40–48s: FECHAMENTO: "Se você vende produtos de casa ou está pensando em entrar nesse nicho, o momento é agora. Comenta: qual produto você venderia?"',
'Legenda: "O nicho quieto que vai barulhar em breve. Salva essa análise." | CTA: Link no bio → Protocolo Lucrativo R$67');

-- DIA 13 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 13, 2, 'noite', 'reel', 'tutorial', 'Como usar o programa de afiliados do TikTok Shop para vender sem ter estoque',
'0–3s: GANCHO: "Quer faturar no TikTok Shop sem ter produto, sem estoque, sem CNPJ? O programa de afiliados foi feito pra isso."
3–15s: "Como funciona: você habilita a vitrine de influenciador dentro do TikTok — qualquer conta com mais de 2.000 seguidores consegue. Você escolhe produtos de sellers parceiros para promover. Faz vídeos mostrando esses produtos. Cada venda gerada pelo seu link, você recebe comissão."
15–32s: TELA: "Para habilitar: vai no app do TikTok, em ferramentas do criador, procura Vitrine do Criador. Habilita, escolhe sua categoria de conteúdo e começa a adicionar produtos alinhados com o que você já publica. A comissão varia de 5% a 20% dependendo do seller e do produto."
32–45s: "O segredo é escolher produtos que você usaria de verdade e que fazem sentido para o seu público. Público de fitness? Produtos de treino. Público de culinária? Utensílios de cozinha. A congruência converte."
45–52s: FECHAMENTO: "Comenta ''VITRINE'' que eu te explico como otimizar a seleção de produtos."',
'Legenda: "Sem estoque. Sem CNPJ. Só conteúdo e comissão. Comenta VITRINE." | CTA: Link no bio → Máquina de Influenciador');

-- DIA 14 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 14, 2, 'manha', 'reel', 'estalo', 'Parar de criar conteúdo é o erro que destrói operações no TikTok Shop',
'0–3s: GANCHO: "O maior erro que vejo vendedores do TikTok Shop cometendo não é técnico. É parar."
3–10s: "Eles constroem a loja. Cadastram os produtos. Fazem os primeiros vídeos. Veem resultado. E aí... diminuem o ritmo. Acham que o algoritmo vai manter o alcance sozinho."
10–25s: "O TikTok Shop é uma plataforma de conteúdo. O algoritmo recompensa consistência. Quando você para de postar, ele para de distribuir. Quando você volta a postar, leva semanas para recuperar o momentum."
25–38s: "Os vendedores que mais crescem não são os mais talentosos. São os mais consistentes. 2 vídeos por dia, todo dia, por 90 dias. Isso é o que separa os que escalam dos que ficam estagnados."
38–45s: FECHAMENTO: "Quanto tempo você ficou sem postar na última semana? Comenta com honestidade."',
'Legenda: "Consistência não é inspiração. É decisão. Salva isso."');

-- DIA 14 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 14, 2, 'noite', 'carrossel', 'narrativa', 'Recap semana 2: o que aconteceu no e-commerce essa semana e o que você precisa saber',
'CAPA: "Semana 2 — O que mudou no e-commerce e o que isso significa para você" | Desliza →
CARD 2: TikTok Shop anuncia novos recursos para lives de vendas. A plataforma está investindo pesado em live commerce — o modelo que fez a China vender R$1 trilhão por ano em transmissões ao vivo. O Brasil está 3 anos atrás da China nesse formato. Quem aprender live agora vai surfar essa onda.
CARD 3: Mercado Livre bate recorde de GMV no Brasil. R$23 bilhões investidos em logística gerando resultado. Isso prova que o mercado de e-commerce brasileiro está em expansão acelerada — não é saturação, é crescimento.
CARD 4: Shopee lança programa de incentivo para micro-sellers. A Shopee está brigando pela base da pirâmide — vendedores pequenos. Isso comprova que o volume de sellers independentes está aumentando. Mais concorrência no preço, mais razão para construir audiência no TikTok Shop.
CARD 5: O padrão que se repete. Toda semana o mercado confirma a mesma tese: e-commerce cresce, conteúdo nativo converte melhor que anúncio, TikTok Shop está na melhor posição para capturar esse crescimento.
CARD FINAL: "Se você ainda não entrou, o que falta? Comenta aqui. Posso te ajudar a dar o próximo passo."',
'Legenda: "Recap semanal de quem está dentro da plataforma. Salva e compartilha."');

-- ═══════════════════════════════════════════════════════
-- SEMANA 3 — APROFUNDAR POSICIONAMENTO (dias 15–21)
-- Objetivo: consolidar como analista de mercado, não só instrutor de plataforma
-- ═══════════════════════════════════════════════════════

-- DIA 15 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 15, 3, 'manha', 'reel', 'estalo', 'O TikTok Shop não é uma plataforma de vendas. É uma plataforma de confiança.',
'0–3s: GANCHO: Pausa longa. "O TikTok Shop não é uma plataforma de vendas."
3–6s: Outra pausa. "É uma plataforma de confiança."
6–20s: "Vou te explicar: no Mercado Livre, você compra de uma loja. No TikTok Shop, você compra de uma pessoa. Essa diferença muda tudo. Porque você não confia em loja — você confia em pessoa."
20–35s: "Quando uma criadora de conteúdo de skincare recomenda um produto, a audiência compra não porque o produto é bom — mas porque ela é boa. A confiança que ela construiu em 2 anos de conteúdo converte mais do que qualquer anúncio."
35–45s: "Por isso construir audiência no TikTok Shop não é uma estratégia de marketing. É uma estratégia de negócio. Você está construindo um ativo que nenhum marketplace pode te tirar."
45–52s: FECHAMENTO: "Salva esse vídeo e manda pra quem ainda acha que TikTok Shop é só mais um marketplace."',
'Legenda: "Confiança converte mais do que desconto. Salva isso."');

-- DIA 15 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 15, 3, 'noite', 'carrossel', 'tutorial', 'Como estruturar sua operação de live no TikTok Shop do zero',
'CAPA: "Live no TikTok Shop: do setup à primeira venda ao vivo" | O guia completo →
CARD 2 - Por que fazer live? Lives convertem em média 3x mais do que vídeos gravados no TikTok Shop. O consumidor tem a dúvida respondida em tempo real e compra no impulso. A plataforma também prioriza conteúdo ao vivo no algoritmo.
CARD 3 - Setup mínimo para começar: Celular com câmera boa (qualquer iPhone ou Samsung intermediário serve) + Ring light de R$80 + fundo organizado + boa internet (mínimo 10 Mbps de upload).
CARD 4 - Estrutura de 1 hora de live: 0–10min: apresentação e aquecimento. 10–40min: demonstração dos produtos (1 produto a cada 5–8 min). 40–50min: oferta especial exclusiva para quem está ao vivo. 50–60min: encerramento com CTA.
CARD 5 - O erro mais comum em lives: falar do produto sem mostrar o problema que ele resolve. Ninguém compra produto. Todo mundo compra solução. Mostre o problema primeiro, depois o produto.
CARD 6 - Como crescer nas lives: consistência de horário (mesmo dia, mesma hora toda semana), interagir com comentários pelo nome, criar senso de urgência real (''só tenho 20 unidades'').
CARD FINAL: "Quer aprender a fazer live que vende? Esse é um dos módulos do Club TikTok Shop. Link no bio."',
'Legenda: "Lives que vendem têm estrutura. Salva esse guia." | CTA: Link no bio → Club TikTok Shop R$997');

-- DIA 16 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda, dados_apoio) VALUES
(cid, 16, 3, 'manha', 'reel', 'previsao', 'Live commerce vai movimentar R$15 bilhões no Brasil até 2027 — você está preparado?',
'0–3s: GANCHO: "Live commerce vai movimentar R$15 bilhões no Brasil até 2027. Esse número acabou de sair. E poucas pessoas estão se preparando para isso."
3–15s: "Na China, live commerce já representa 20% de todo o e-commerce. No Brasil, está em menos de 1%. Isso significa que estamos no início de uma curva de adoção que, quando subir, vai subir rápido."
15–30s: "O TikTok Shop é a plataforma mais bem posicionada para capturar esse crescimento no Brasil. Eles já têm a infraestrutura, o público e o algoritmo treinado para isso. O que falta é criador e seller que saiba fazer live de verdade."
30–42s: "Quem dominar live commerce nos próximos 18 meses vai ter uma vantagem competitiva que vai durar anos. Não porque os outros não vão aprender — mas porque experiência acumulada em live não se compra."
42–50s: FECHAMENTO: "Você já fez alguma live de vendas? Comenta sim ou não aqui."',
'Legenda: "R$15 bilhões em live commerce até 2027. A pergunta é: você vai estar dentro ou fora?"',
'Projeção: live commerce Brasil R$15bi até 2027 (ABComm). China: 20% do e-commerce via live. TikTok Shop: maior plataforma de live commerce do mundo fora da China.');

-- DIA 16 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 16, 3, 'noite', 'reel', 'bastidor', 'O que aprendi depois de 6 meses como Embaixador Oficial do TikTok Shop',
'0–3s: GANCHO: "Faz 6 meses que sou Embaixador Oficial do TikTok Shop Brasil. Vou te falar o que aprendi que não está em nenhum tutorial."
3–18s: "Primeiro aprendizado: a plataforma está em construção. Quando você entrar, vai ter coisas quebradas, processos que mudam do dia para a noite, regras que são atualizadas sem aviso. Isso não é defeito — é característica de plataforma em crescimento acelerado. Aprenda a navegar na incerteza."
18–32s: "Segundo: as primeiras 100 vendas são as mais difíceis. Depois disso, o algoritmo te conhece melhor, a logística fica rotina e os vídeos ficam mais naturais. Não desiste antes das 100 vendas."
32–45s: "Terceiro — e esse é o mais importante: vença a timidez de câmera. Os vendedores que mais crescem não têm o melhor produto. Têm a melhor presença em câmera. Prática. Todo dia. Sem desculpa."
45–52s: FECHAMENTO: "Se tivesse que começar do zero hoje, entraria de novo. Sem dúvida. Comenta se você quer saber mais sobre o programa de Embaixador."',
'Legenda: "6 meses de bastidor. Aprendi mais aqui do que em qualquer curso. Salva isso."');

-- DIA 17 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 17, 3, 'manha', 'reel', 'caso', 'Seller de moda que triplicou o faturamento em 90 dias — o que ele fez diferente',
'0–3s: GANCHO: "Esse seller de moda triplicou o faturamento em 90 dias no TikTok Shop. Vou te mostrar o que ele fez de diferente."
3–15s: "Ponto 1: ele parou de fazer foto de produto e passou a fazer vídeo de produto em uso. Taxa de conversão foi de 1,2% para 4,8% em 30 dias. Mesmo produto. Mesmo preço. Formato diferente."
15–28s: "Ponto 2: ele escolheu 3 produtos campeões e criou uma bateria de 10 vídeos para cada um. Conteúdo diferente, ângulo diferente, público diferente, mas mesmo produto. Quando um vídeo performa bem, os outros herdam o alcance."
28–40s: "Ponto 3: ele respondeu todos os comentários nas primeiras 2 horas de cada vídeo. O algoritmo interpreta engajamento rápido como sinal de qualidade e distribui mais. Isso não é hack — é entender como a plataforma funciona."
40–48s: FECHAMENTO: "Qual dos 3 pontos você vai aplicar primeiro? Comenta aqui."',
'Legenda: "3 mudanças. 90 dias. 3x de faturamento. O que você vai mudar primeiro?"');

-- DIA 17 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 17, 3, 'noite', 'carrossel', 'tutorial', 'Os 7 tipos de vídeo que mais vendem no TikTok Shop — com exemplo de cada',
'CAPA: "Os 7 formatos de vídeo que mais convertem no TikTok Shop" | Salva esse guia →
CARD 2 - #1 Unboxing com reação genuína: Você abre o produto ao vivo, reage de verdade. Funciona porque é autêntico. O consumidor vê o produto chegando e sente que vai receber o mesmo.
CARD 3 - #2 Antes e depois: Mostre o problema (casa bagunçada, cabelo sem vida, pele com mancha) e depois o resultado com o produto. Contraste visual converte muito bem em mobile.
CARD 4 - #3 Tutorial de uso: Ensina como usar o produto do zero. Funciona especialmente para produtos com curva de aprendizado — utensílios de cozinha, produtos de beleza, itens técnicos.
CARD 5 - #4 Comparação: Produto X vs produto Y. Você vs concorrente. Antes de usar vs depois. Comparação cria contexto e justifica a compra.
CARD 6 - #5 Problema e solução: Começa mostrando uma dor específica do público ("Cansado de X?") e apresenta o produto como solução. Funciona porque captura atenção pelo problema, não pelo produto.
CARD 7 - #6 Depoimento de cliente: Mostra resultado real de quem comprou. Prova social converte mais do que qualquer argumento de vendedor.
CARD 8 - #7 Bastidor da operação: Mostra o processo de empacotar, organizar, enviar. Humaniza a loja e cria confiança. "Tem uma pessoa real por trás disso."
CARD FINAL: "Qual desses você já fez? E qual vai testar essa semana? Comenta aqui."',
'Legenda: "7 formatos. Um para cada dia da semana. Qual você vai fazer amanhã?"');

-- DIA 18 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 18, 3, 'manha', 'reel', 'estalo', 'O algoritmo do TikTok Shop não recompensa o melhor produto. Recompensa o melhor conteúdo.',
'0–3s: GANCHO: "O algoritmo do TikTok Shop não recompensa o melhor produto."
3–6s: "Recompensa o melhor conteúdo."
6–20s: "Isso incomoda muita gente, porque parece injusto. Produto incrível sem vídeo bom não vende. Produto mediano com vídeo excelente vende muito. Mas é exatamente assim que funciona."
20–35s: "E sabe o que isso significa para você? Que o campo de batalha não é mais preço ou qualidade — é criatividade. E criatividade é uma habilidade que qualquer pessoa pode aprender. Você não precisa nascer criativo. Você aprende estudando o que funciona e replicando."
35–45s: "Todo vídeo que você faz é um experimento. Você está testando gancho, formato, duração, chamada para ação. Os dados do TikTok Shop te dizem o que funcionou. O próximo vídeo é melhor do que o anterior."
45–52s: FECHAMENTO: "Comenta: você acha que dá para aprender a criar bom conteúdo ou é dom?"',
'Legenda: "Não é o produto. É o conteúdo. E conteúdo se aprende."');

-- DIA 18 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 18, 3, 'noite', 'reel', 'tutorial', 'Como ler as métricas do TikTok Shop e tomar decisões baseadas em dados',
'0–3s: GANCHO: "A maioria dos vendedores do TikTok Shop não lê as métricas. E é por isso que continuam repetindo os mesmos erros."
3–10s: "Vou te mostrar as 4 métricas que importam de verdade no Seller Center."
10–45s: TELA com Seller Center:
"Métrica 1: Taxa de clique no produto (CTR). Mede quantas pessoas que viram seu vídeo clicaram no produto. Abaixo de 2% = produto ou gancho fraco. Acima de 5% = muito bom.
Métrica 2: Taxa de conversão do produto (CVR). Mede quantas pessoas que clicaram efetivamente compraram. Abaixo de 3% = página do produto fraca ou preço alto. Acima de 8% = excelente.
Métrica 3: Ticket médio. Quanto cada cliente gasta por pedido. Aumentar isso é mais fácil do que trazer novo cliente.
Métrica 4: Taxa de devolução. Acima de 5% = problema de expectativa. O produto entregue não corresponde ao vídeo."
45–55s: FECHAMENTO: "Salva esse vídeo e abre o Seller Center agora. Qual dessas métricas está abaixo do ideal?"',
'Legenda: "Quem lê os dados ganha. Quem ignora, repete erro." | CTA: Link no bio → Protocolo Lucrativo R$67');

-- DIA 19 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 19, 3, 'manha', 'reel', 'reacao', 'Influenciadores tradicionais estão migrando para o TikTok Shop — o que isso significa',
'0–3s: GANCHO: "Os maiores influenciadores do Instagram estão migrando para o TikTok Shop. E isso muda o jogo para você."
3–15s: "Por quê estão migrando? Porque no Instagram, você precisa de marca para monetizar. No TikTok Shop, você mesmo é a marca. A comissão vai direto para você, sem intermediário, sem contrato com empresa, sem dependência de patrocínio."
15–28s: "Mas aqui está o ponto que a maioria não percebe: quando os grandes influenciadores chegam, o mercado amadurece. O consumidor fica mais educado. E consumidor educado compra mais, não menos."
28–40s: "O risco real não é a concorrência com influenciador grande. É ficar parado enquanto o mercado se move. Quem tiver posicionamento claro e produto bom vai crescer junto com a maré."
40–48s: FECHAMENTO: "Você acha que influenciadores grandes vão dominar o TikTok Shop ou vai ter espaço para todo mundo? Me conta aqui."',
'Legenda: "A maré está subindo. Você está surfando ou esperando na areia?"');

-- DIA 19 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 19, 3, 'noite', 'carrossel', 'caso', 'De CLT a seller no TikTok Shop: a história real de quem saiu do emprego com a renda da loja',
'CAPA: "De CLT a seller independente: a transição que muitos querem mas poucos fazem" →
CARD 2 - O ponto de partida: Ela tinha emprego de R$3.200 mensais, 2 filhos e nenhuma experiência com e-commerce. Entrou no TikTok Shop em março de 2025 vendendo produtos de organização doméstica.
CARD 3 - Mês 1: R$890. Suficiente para pagar uma conta extra. "Achei que ia demorar mais para funcionar, mas já na primeira semana tive 3 vendas. Isso me deu confiança para continuar."
CARD 4 - Mês 2: R$2.340. "Comecei a entender o que funcionava. Dois produtos respondiam por 80% das vendas. Foquei neles."
CARD 5 - Mês 3: R$4.100. "Superei meu salário. Ainda não pedi demissão — queria ter 3 meses acima do salário antes de sair."
CARD 6 - Mês 4: R$6.200. "Pedi demissão. Foi o mês mais assustador e mais libertador da minha vida."
CARD FINAL: "Esse resultado não é exceção. É o padrão de quem aplica o método certo com consistência. O Club TikTok Shop foi onde ela aprendeu. Link no bio."',
'Legenda: "CLT → R$6.200/mês na loja. O caminho existe. A questão é quando você vai começar." | CTA: Club TikTok Shop R$997');

-- DIA 20 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 20, 3, 'manha', 'reel', 'estalo', 'Você não precisa ser especialista para ensinar no TikTok Shop. Precisa estar um passo à frente.',
'0–3s: GANCHO: "Você não precisa ser especialista para construir audiência e vender no TikTok Shop."
3–8s: "Precisa estar um passo à frente de quem você está ajudando."
8–22s: "Se você aprendeu ontem como habilitar a loja no TikTok Shop, tem alguém que vai aprender amanhã pelo seu vídeo. Esse alguém não precisa que você seja doutor no assunto. Precisa que você explique de forma simples o que você já passou."
22–35s: "O maior bloqueio que vejo em quem quer criar conteúdo é ''mas eu ainda não sei tudo''. Ninguém sabe tudo. Os maiores criadores de conteúdo de TikTok Shop estão aprendendo junto com você. A diferença é que eles documentam o processo."
35–45s: "Documenta o que você está aprendendo. Transforma em vídeo. Sua audiência vai crescer com você."
45–52s: FECHAMENTO: "Qual foi a última coisa que você aprendeu sobre TikTok Shop? Poderia ter virado um vídeo. Comenta aqui."',
'Legenda: "Um passo à frente já é suficiente. Começa a documentar."');

-- DIA 20 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 20, 3, 'noite', 'reel', 'bastidor', 'Como é gravar 7 vídeos em 2 horas — meu processo de produção em bloco',
'0–3s: GANCHO: "Vou te mostrar como eu gravo 7 vídeos em 2 horas. Porque sim, dá para fazer isso — e não, não é edição pesada."
3–8s: "O segredo é produção em bloco. Você não grava um vídeo por dia. Você grava todos os vídeos da semana de uma vez."
8–35s: BASTIDOR DA GRAVAÇÃO:
"Passo 1: roteiros prontos antes de ligar a câmera. Cada roteiro tem: gancho, desenvolvimento, fechamento, CTA. Máximo 1 página.
Passo 2: setup fixo. Câmera no mesmo lugar, mesma iluminação, mesma roupa ou troca só a camisa. Você não perde tempo remontando.
Passo 3: grava 2x cada take. Não assiste entre as gravações — você fica no estado. Assiste depois na edição.
Passo 4: nomeia os arquivos na hora. ''dia1-manha-estalo'' já sabe qual é qual sem ver o vídeo."
35–48s: "Com esse processo, 2 horas rendem a semana inteira de conteúdo. O tempo que você economiza vai para análise de dados e interação com a audiência — que é onde o crescimento de verdade acontece."
48–55s: FECHAMENTO: "Quer ver o template de roteiro que eu uso? Comenta ''ROTEIRO'' aqui."',
'Legenda: "2 horas. 7 vídeos. 1 semana de conteúdo. O processo completo." | CTA: Comenta ROTEIRO');

-- DIA 21 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 21, 3, 'manha', 'reel', 'estalo', 'Daqui a 2 anos, todo mundo vai falar que deveria ter entrado no TikTok Shop agora',
'0–3s: GANCHO: "Daqui a 2 anos, todo mundo vai falar que deveria ter entrado no TikTok Shop em 2025."
3–6s: "Exatamente como falaram sobre o Instagram em 2015. Exatamente como falaram sobre a Shopee em 2020."
6–20s: "Eu sei que parece hype. Mas não é. Os números são reais: 4.500% de crescimento em 3 meses, R$3 bilhões projetados de impacto no e-commerce, lançamento mais bem-sucedido da plataforma no mundo todo."
20–35s: "A janela de quem entra cedo e constrói posicionamento antes de todo mundo está aberta. Não para sempre — mas está aberta agora. Em 2027 vai ter muito mais concorrente, muito mais ruído, muito mais gente brigando pelo mesmo espaço."
35–45s: "Quem está construindo agora vai ter vantagem de marca, audiência e dados que nenhum recém-chegado vai conseguir replicar. É isso que separa quem surfou a onda de quem ficou na praia."
45–52s: FECHAMENTO: "Em que estágio você está hoje? Comenta: ainda não entrei / já tenho loja / já estou escalando."',
'Legenda: "A janela está aberta. Por quanto tempo? Ninguém sabe. Mas está aberta agora."');

-- DIA 21 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 21, 3, 'noite', 'carrossel', 'narrativa', 'Recap semana 3: posicionamento, live commerce e o que vem por aí',
'CAPA: "Semana 3 — O que você precisa saber antes de entrar na semana 4" →
CARD 2: Live commerce chegou para ficar. As plataformas estão investindo pesado. O Brasil está atrasado em relação à China e Coreia, mas o crescimento vai ser acelerado. Quem aprender live agora terá vantagem por anos.
CARD 3: Conteúdo supera produto. Provado essa semana por dados e casos reais. O campo de batalha no TikTok Shop é criatividade e consistência — não catálogo de produtos.
CARD 4: Métricas importam. CTR, CVR, ticket médio e taxa de devolução são os 4 números que definem se sua operação está saudável. Olhe para eles toda semana.
CARD 5: A janela ainda está aberta. Semana 3 confirmou o que semana 1 e 2 já mostravam: o mercado está em expansão, a concorrência ainda é baixa para quem cria conteúdo de qualidade, e a plataforma está investindo no Brasil.
CARD FINAL: "Semana 4 começa segunda. O tema é converter com autoridade. Se você seguiu até aqui, já tem o posicionamento. Agora é hora de vender."',
'Legenda: "3 semanas de conteúdo. Semana 4 começa agora. Prepare-se."');

-- ═══════════════════════════════════════════════════════
-- SEMANA 4 — CONVERTER COM AUTORIDADE (dias 22–28)
-- Objetivo: conduzir com naturalidade para os produtos da escada de valor
-- ═══════════════════════════════════════════════════════

-- DIA 22 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 22, 4, 'manha', 'reel', 'estalo', 'Se você chegou até aqui e ainda não começou, o problema não é informação',
'0–3s: GANCHO: "Se você assiste a esses vídeos há semanas e ainda não começou, o problema não é falta de informação."
3–10s: "Você já sabe como habilitar a loja. Já sabe como calcular o preço. Já sabe o que é GMV Max. Você tem mais informação do que precisava para começar."
10–25s: "O problema é outra coisa. Pode ser medo de errar. Pode ser o síndrome do começo perfeito — quero estar 100% pronto antes de dar o primeiro passo. Pode ser que você não acredita ainda que isso funciona pra você especificamente."
25–38s: "Mas aqui está a verdade: você nunca vai estar 100% pronto. A loja vai ter erro. O primeiro vídeo vai ser ruim. O primeiro produto pode não vender. E tudo isso é normal e necessário."
38–48s: "O único erro irreversível no TikTok Shop é não começar. Tudo o mais tem solução."
48–55s: FECHAMENTO: "O que te impede de começar hoje? Comenta com honestidade. Vou responder."',
'Legenda: "Informação você já tem. O que falta é o primeiro passo. Comenta o que te trava."');

-- DIA 22 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 22, 4, 'noite', 'carrossel', 'tutorial', 'A escada de valor do TikTok Shop — como subir de R$67 a R$4.500 com o mesmo aluno',
'CAPA: "A escada de valor que transforma aluno em cliente recorrente" | Como funciona →
CARD 2 - O conceito: escada de valor é a sequência de produtos que você oferece ao mesmo cliente ao longo do tempo. Cada produto entrega valor real e prepara o cliente para o próximo nível.
CARD 3 - Degrau 1 — Entrada (R$67): Protocolo Lucrativo. O cliente aprende o básico operacional do TikTok Shop. Baixa barreira de entrada. Alta volume de alunos. Objetivo: gerar resultado rápido e confiança.
CARD 4 - Degrau 2 — Core (R$297): Programa de Aceleração. Para quem já tem a loja e quer escalar. Estratégia de conteúdo, tráfego pago, análise de dados. Aluno natural do Protocolo que viu resultado e quer mais.
CARD 5 - Degrau 3 — Avançado (R$997): Club TikTok Shop. 6 meses de acompanhamento, sessões SOS, grupo exclusivo, lives quinzenais. Para quem quer construir operação de verdade com suporte contínuo.
CARD 6 - Degrau 4 — Premium (R$4.500): Mentoria individual. Trabalho 1:1 por 3 meses. Para quem já tem operação e quer escalar para 6 dígitos. Vagas limitadas.
CARD FINAL: "Cada produto entrega valor real. Cada aluno sobe na escada no próprio ritmo. Em qual degrau você está hoje? Link no bio."',
'Legenda: "De R$67 a R$4.500 — o mesmo aluno, mais profundo a cada passo. Em qual degrau você está?"');

-- DIA 23 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 23, 4, 'manha', 'reel', 'caso', 'Aluno que entrou no Protocolo e em 45 dias estava no Club — o que aconteceu',
'0–3s: GANCHO: "Esse aluno entrou no Protocolo por R$67. Em 45 dias estava no Club por R$997. Não porque eu insisti. Porque ele quis."
3–15s: "O que aconteceu: ele aplicou o Protocolo, habilitou a loja, fez os primeiros vídeos, teve as primeiras vendas. E aí percebeu que queria ir mais fundo — escalar, fazer live, entender tráfego pago."
15–30s: "Aí ele me perguntou: ''Jorge, o que é o próximo passo?'' Eu falei do Club. Ele analisou, viu que o retorno esperado justificava o investimento, e entrou."
30–42s: "Em 90 dias no Club, o faturamento mensal dele superou R$8 mil. O investimento total foi R$1.064. Em uma semana de operação, pagou tudo."
42–50s: FECHAMENTO: "A escada de valor não é pressão de venda. É o caminho natural de quem quer crescer. Em qual degrau você está?"',
'Legenda: "R$67 → R$997 → R$8k/mês. O caminho existe. O ritmo é seu." | CTA: Link no bio → Protocolo R$67');

-- DIA 23 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 23, 4, 'noite', 'reel', 'tutorial', 'Como usar tráfego pago no TikTok Shop sem desperdiçar dinheiro',
'0–3s: GANCHO: "A maioria das pessoas que tenta tráfego pago no TikTok Shop perde dinheiro nos primeiros 30 dias. Vou te mostrar como não perder."
3–10s: "A regra número 1: nunca impulsione vídeo ruim. Tráfego pago amplifica o que já existe. Se o vídeo orgânico não converte, pagar para mais gente ver não vai resolver."
10–28s: "Passo a passo para começar:
1. Identifique seu melhor vídeo orgânico — aquele com maior CTR e CVR.
2. Crie uma campanha no TikTok Ads Manager com objetivo de conversão (não de alcance, não de visualizações — conversão).
3. Orçamento inicial: R$30 por dia por 7 dias. Não mexe no meio do teste.
4. Público: deixa o TikTok escolher no começo. A IA da plataforma é melhor do que segmentação manual para quem está começando.
5. Depois de 7 dias, analisa o ROAS. Acima de 3x, escala. Abaixo de 2x, troca o criativo."
28–42s: "O erro mais comum: começar com orçamento muito baixo (R$5/dia) e esperar resultado em 2 dias. A IA precisa de pelo menos 50 conversões para otimizar. Com R$5/dia, você nunca vai chegar lá."
42–50s: FECHAMENTO: "Salva esse vídeo. Quando estiver pronto para tráfego pago, esse é o guia."',
'Legenda: "Tráfego pago sem desperdiçar dinheiro. O passo a passo real." | CTA: Club TikTok Shop R$997');

-- DIA 24 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 24, 4, 'manha', 'reel', 'estalo', 'O Protocolo Lucrativo não é curso. É o mapa que eu gostaria de ter tido no começo.',
'0–3s: GANCHO: "O Protocolo Lucrativo TikTok Shop não é mais um curso. É o mapa que eu gostaria de ter tido quando comecei."
3–15s: "Quando eu entrei no TikTok Shop, perdi 2 meses tentando descobrir sozinho: como habilitar a loja, como cadastrar produto do jeito certo, quais taxas existiam, como a logística funcionava. Cada erro custou tempo e dinheiro."
15–30s: "O Protocolo é o condensado desses 2 meses em menos de 4 horas. Você sai com a loja habilitada, produto cadastrado corretamente, logística configurada e o primeiro vídeo feito. Do zero ao operacional."
30–42s: "Por R$67. Menos que um jantar. Menos que um mês de streaming. O investimento que pode mudar o seu próximo 12 meses."
42–50s: FECHAMENTO: "Link no bio. Se tiver dúvida sobre o que está incluído, me manda mensagem direta."',
'Legenda: "O mapa que eu gostaria de ter tido. Por R$67. Link no bio." | CTA: Protocolo Lucrativo R$67');

-- DIA 24 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 24, 4, 'noite', 'carrossel', 'caso', 'Os resultados do mês — números reais de alunos reais',
'CAPA: "Os números do mês — resultados reais de alunos reais" →
CARD 2: Aluna 1 — moda feminina: R$12.400 no mês. Está no Club há 4 meses. "O que mudou foi entender o que o algoritmo quer de mim como criadora, não só como vendedora."
CARD 3: Aluno 2 — produtos de casa: R$8.900 no mês. Entrou pelo Protocolo, migrou para o Club em 60 dias. "A parte de logística e precificação do Protocolo me salvou de vender no prejuízo no começo."
CARD 4: Aluna 3 — afiliada sem estoque: R$3.200 em comissões. Não tem loja. Só vitrine de influenciadora. "Tenho 4.200 seguidores. Ninguém acreditou que ia funcionar."
CARD 5: Aluno 4 — primeiro mês de operação: R$1.840. "Sei que parece pouco comparado aos outros, mas eu trabalhei 22 anos de CLT para ganhar esse dinheiro. Agora ganho em uma semana."
CARD 6: O padrão em comum: todos começaram sem experiência em e-commerce. Todos aplicaram o método com consistência. Todos tiveram resultado dentro dos primeiros 60 dias.
CARD FINAL: "Esses resultados são verificáveis. Se quiser saber mais sobre como entrar, link no bio. Se quiser resultado diferente, precisa de ação diferente."',
'Legenda: "Resultados reais. Pessoas reais. O método funciona para quem aplica." | CTA: Link no bio');

-- DIA 25 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 25, 4, 'manha', 'reel', 'previsao', 'O que acontece com quem entrar no TikTok Shop agora vs. daqui a 1 ano',
'0–3s: GANCHO: "Deixa eu te mostrar a diferença entre entrar no TikTok Shop agora e entrar daqui a 1 ano."
3–15s: "Quem entra agora: plataforma ainda em crescimento acelerado, algoritmo ainda generoso com novos sellers, menos concorrência por nicho, custo de aquisição de audiência mais baixo, chance de se tornar referência antes do mercado saturar."
15–30s: "Quem entra daqui a 1 ano: plataforma mais madura, algoritmo mais exigente, mais sellers competindo pelo mesmo espaço, precisa de mais investimento para se destacar, vai competir com quem já tem 12 meses de dados e audiência construída."
30–42s: "Não estou dizendo que daqui a 1 ano não vai funcionar. Estou dizendo que a vantagem de quem entra agora é real e mensurável. Você está escolhendo entre ser pioneiro ou ser mais um."
42–50s: FECHAMENTO: "Você quer ser pioneiro ou chegar depois? Comenta aqui."',
'Legenda: "Agora vs. daqui a 1 ano. A diferença é real. Você escolhe." | CTA: Link no bio → Protocolo R$67');

-- DIA 25 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 25, 4, 'noite', 'reel', 'bastidor', 'O que faço com o dinheiro que o TikTok Shop gera — reinvestimento inteligente',
'0–3s: GANCHO: "Você já pensou o que vai fazer com o dinheiro que o TikTok Shop vai gerar? Porque isso muda a estratégia."
3–15s: "Tem dois perfis de vendedor: o que usa o lucro para consumo e o que reinveste para crescer. Os que reinvestem chegam em um ponto onde a operação cresce sozinha — e aí a liberdade de fato acontece."
15–30s: "Como eu reinvisto: 30% do lucro vai para tráfego pago e anúncios. 20% para estoque de produtos que estão vendendo bem. 15% para conteúdo — câmera melhor, ring light, tripé, edição. 10% para educação — cursos, eventos, mentorias. 25% de margem real que eu saco."
30–42s: "Com esse modelo, a operação cresce composta. Quanto mais você vende, mais você reinveste, mais você vende. É o efeito snowball aplicado ao e-commerce."
42–50s: FECHAMENTO: "Qual seria sua divisão ideal de reinvestimento? Comenta aqui."',
'Legenda: "Não é quanto você ganha. É o que você faz com o que ganha."');

-- DIA 26 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 26, 4, 'manha', 'reel', 'caso', 'Ela tinha medo de câmera. Hoje faz live toda semana e fatura R$15 mil.',
'0–3s: GANCHO: "Ela tinha tanto medo de câmera que gravou o primeiro vídeo 11 vezes antes de publicar. Hoje faz live toda semana."
3–15s: "Isso foi em março. Agora é setembro. Em 6 meses, ela passou de não conseguir falar olhando para o celular para fazer live de 2 horas com centenas de pessoas assistindo ao vivo."
15–28s: "O que mudou? Ela começou a separar ''eu me julgando'' de ''a câmera gravando''. O julgamento é interno. A câmera apenas registra. E com cada vídeo publicado, o julgamento interno foi diminuindo."
28–40s: "No terceiro mês, ela parou de regravar. Publicava no primeiro take. ''Perfeito é inimigo do feito'' virou mantra."
40–50s: FECHAMENTO: "Você também tem medo de câmera? Comenta aqui. Isso é mais comum do que parece e tem solução."',
'Legenda: "Medo de câmera → live toda semana → R$15k/mês. A história dela pode ser a sua."');

-- DIA 26 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 26, 4, 'noite', 'carrossel', 'tutorial', 'O Club TikTok Shop — o que está incluído e para quem é',
'CAPA: "Club TikTok Shop — o que você recebe e por que foi construído assim" →
CARD 2 - Para quem é: quem já tem a loja habilitada (ou está prestes a habilitar) e quer construir uma operação sólida com acompanhamento real, não só vídeo-aula.
CARD 3 - O que está incluído — Parte 1: Módulos completos de operação, conteúdo, tráfego pago, live commerce e gestão financeira. Atualizados toda vez que a plataforma muda.
CARD 4 - O que está incluído — Parte 2: 2 sessões SOS individuais comigo por mês. Você agenda, a gente entra em call, eu analiso sua operação e te dou o próximo passo específico para você.
CARD 5 - O que está incluído — Parte 3: Grupo exclusivo de WhatsApp com outros membros do Club. Troca de experiência real, parceria de negócios, suporte entre pares. Isso vale mais do que qualquer módulo.
CARD 6 - O que está incluído — Parte 4: Lives quinzenais comigo com tema específico. Análise de tendências, cases ao vivo, sessão de perguntas e respostas. Conteúdo que não está em nenhum outro lugar.
CARD FINAL: "6 meses de acompanhamento. R$997. Se você fizer uma venda de R$200 por semana, paga o investimento em menos de 5 semanas. Link no bio."',
'Legenda: "6 meses. Suporte real. Comunidade. R$997. Link no bio." | CTA: Club TikTok Shop R$997');

-- DIA 27 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 27, 4, 'manha', 'reel', 'estalo', 'Em 2030, quem não vender por conteúdo vai depender 100% de anúncio pago',
'0–3s: GANCHO: "Em 2030, quem não construiu audiência hoje vai depender 100% de anúncio pago para vender."
3–10s: "E anúncio pago fica mais caro a cada ano. Porque mais gente entra no leilão, mais o clique custa."
10–25s: "Audiência orgânica é o único ativo de marketing que aprecia com o tempo. Quanto mais você cria, mais o algoritmo te conhece, mais pessoas te seguem, mais barato fica cada venda. É o oposto do anúncio pago."
25–38s: "O TikTok Shop é a plataforma que mais recompensa audiência orgânica hoje. O algoritmo distribui conteúdo para compradores mesmo sem você ter seguidores. Mas quem tem audiência tem vantagem exponencial."
38–48s: "Você não está criando conteúdo para hoje. Está construindo um ativo para 2030."
48–55s: FECHAMENTO: "Você pensa no conteúdo como custo ou como investimento? Comenta aqui."',
'Legenda: "Audiência orgânica aprecia. Anúncio pago deprecia. Escolha seu campo."');

-- DIA 27 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 27, 4, 'noite', 'reel', 'tutorial', 'Mentoria individual — para quem é e como funciona',
'0–3s: GANCHO: "Eu tenho um programa de mentoria individual que poucas pessoas sabem que existe. Vou te contar para quem é."
3–12s: "Não é para quem está começando. É para quem já tem operação rodando — loja ativa, primeiras vendas acontecendo, processo minimamente estruturado — e quer ir de 5 dígitos para 6 dígitos por mês."
12–28s: "O formato: 3 meses de trabalho 1:1 comigo. Uma call por semana de 60 minutos. Entre as calls, eu analiso seus dados, seus vídeos, sua logística. Você não fica esperando a próxima call para ter resposta — você tem acesso direto por WhatsApp."
28–42s: "O que entregamos em 3 meses: mapeamento completo da sua operação, identificação dos gargalos que travam o crescimento, estratégia de conteúdo personalizada para seu nicho e público, plano de tráfego pago com orçamento definido."
42–50s: FECHAMENTO: "Não tem vaga sempre aberta. Quando abre, anuncio aqui primeiro. Segue o perfil e ativa as notificações."',
'Legenda: "Mentoria individual. Para quem já tem operação e quer escalar. Vagas limitadas." | CTA: R$4.500 — DM para informações');

-- DIA 28 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 28, 4, 'manha', 'reel', 'estalo', '30 dias de conteúdo sobre TikTok Shop — o que aprendi sobre você',
'0–3s: GANCHO: "Esse é o vídeo 56 do meu calendário de 30 dias. E quero te falar o que aprendi sobre você."
3–15s: "Aprendi que você está buscando por três coisas: clareza — você quer entender como a plataforma funciona de verdade, sem enrolação. Prova — você quer ver que funciona para pessoas reais, não só para quem tem milhões de seguidores. E coragem — você precisa de alguém que te diga que dá para começar de onde você está."
15–30s: "Esses 30 dias foram construídos para entregar exatamente isso. Clareza nos tutoriais. Prova nos cases. E coragem nos estalOs."
30–42s: "Se você chegou até aqui, já tem mais do que precisa para começar. A questão agora é simples: você vai começar ou vai esperar mais 30 dias de conteúdo?"
42–50s: FECHAMENTO: "O link no bio está esperando por você. Não pela versão perfeita de você — pela versão real que está aqui agora."',
'Legenda: "30 dias. 56 vídeos. Chegou a hora. Link no bio." | CTA: Link no bio');

-- DIA 28 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 28, 4, 'noite', 'carrossel', 'narrativa', 'Recap semana 4 e fechamento dos 30 dias — o que vem agora',
'CAPA: "30 dias. O que aprendemos juntos e o que vem a seguir." →
CARD 2: Semana 1 — Autoridade instalada. Você aprendeu que clareza vende mais que seguidores, que a plataforma está crescendo e que há uma janela de entrada ainda aberta.
CARD 3: Semana 2 — Alcance ampliado. Você viu o passo a passo operacional, entendeu o GMV Max, conheceu o programa de afiliados e começou a ver o sistema completo.
CARD 4: Semana 3 — Posicionamento aprofundado. Você entendeu que conteúdo supera produto, que live commerce é o próximo grande movimento e que métricas são a bússola do negócio.
CARD 5: Semana 4 — Conversão com autoridade. Você viu a escada de valor, casos reais, os produtos disponíveis e tomou uma decisão — ou de começar agora ou de esperar.
CARD 6: O que vem agora: vou continuar documentando o crescimento da plataforma, trazendo análises de mercado, casos reais e bastidor de Embaixador. Segue e ativa as notificações.
CARD FINAL: "Se esses 30 dias te ajudaram, o próximo passo é escolher onde entrar na escada. Protocolo R$67, Aceleração R$297, Club R$997 ou Mentoria R$4.500. Link no bio."',
'Legenda: "30 dias juntos. O que você decidiu? Comenta aqui." | CTA: Link no bio');

-- ═══════════════════════════════════════════════════════
-- DIAS FINAIS — FECHAMENTO (dias 29–30)
-- ═══════════════════════════════════════════════════════

-- DIA 29 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 29, 4, 'manha', 'reel', 'bastidor', 'O que vem no próximo mês — meus planos para o TikTok Shop',
'0–3s: GANCHO: "Vou te contar o que está planejado para o próximo mês. Porque transparência sobre o processo faz parte do posicionamento."
3–18s: "Mês que vem: primeiro, vou lançar uma live semanal toda quinta às 20h. Tema fixo: análise de mercado + sessão de dúvidas ao vivo. Gratuita para todo mundo que me segue. Segundo, vou abrir uma turma nova do Club com bônus especiais para quem entrar na primeira semana."
18–32s: "Terceiro: vou começar a documentar minha própria operação de seller — desde o cadastro de novos produtos até os resultados de cada campanha. Bastidor real, sem filtro."
32–42s: "Por quê estou compartilhando isso? Porque o planejamento antecipado é o que separa operação profissional de hobby. E quero que você veja como um operador profissional pensa."
42–50s: FECHAMENTO: "Ativa as notificações agora. Porque a live de quinta que vem vai ter informação que não vai ficar gravada."',
'Legenda: "Próximo mês planejado. Live toda quinta. Turma nova do Club. Ativa as notificações."');

-- DIA 29 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 29, 4, 'noite', 'reel', 'caso', 'A mensagem que mais recebi nesses 30 dias — e minha resposta',
'0–3s: GANCHO: "Em 30 dias de conteúdo, a mensagem que mais recebi foi uma variação da mesma frase: ''Jorge, eu quero muito mas tenho medo de não conseguir.''"
3–12s: "E a minha resposta é sempre a mesma: o medo de não conseguir é exatamente o que todo mundo que conseguiu sentiu antes de começar."
12–28s: "Não existe chegada sem saída. Não existe resultado sem tentativa. Não existe operação no TikTok Shop sem o primeiro produto cadastrado, o primeiro vídeo publicado, a primeira venda feita."
28–42s: "O que eu posso te garantir é que o método funciona. Que a plataforma está crescendo. Que o suporte existe. E que você não vai precisar descobrir tudo sozinho como eu descobri."
42–50s: FECHAMENTO: "O que você não pode garantir é que daqui a 6 meses vai querer ter esperado mais. Isso eu sei por experiência."
50–57s: "Link no bio. O primeiro passo é o mais difícil. Os outros ficam mais fáceis."',
'Legenda: "Medo de não conseguir é o que todo mundo sente antes de conseguir. Link no bio." | CTA: Protocolo R$67');

-- DIA 30 - MANHÃ
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 30, 4, 'manha', 'reel', 'estalo', 'Dia 30. O que 30 dias de conteúdo diário me ensinou sobre o TikTok Shop — e sobre você.',
'0–3s: GANCHO: "Dia 30. Último vídeo do calendário. E tenho uma coisa importante para te falar."
3–15s: "Nesses 30 dias, aprendi que o maior obstáculo para entrar no TikTok Shop não é técnico, não é financeiro e não é de tempo. É a crença de que ''isso funciona para outros, mas não para mim''."
15–28s: "Vi isso nos comentários, nas mensagens diretas, nas perguntas em live. A dúvida não é sobre a plataforma. É sobre a própria capacidade."
28–42s: "E aqui está o que 30 dias de dados reais me mostram: funciona. Para quem tem CNPJ e quer vender produto. Para quem tem perfil e quer ser afiliado. Para quem tem conhecimento e quer ensinar. A plataforma é o veículo. Você é o motorista."
42–55s: "O motorista pode aprender. Pode errar. Pode corrigir. Pode acelerar. A única coisa que o motorista não pode fazer é ficar parado em neutro achando que o carro vai andar sozinho."
55–62s: FECHAMENTO: "Obrigado por ter ficado até o dia 30. Agora é a sua vez. Link no bio."',
'Legenda: "Dia 30. Fim do calendário. Começo da sua operação. Link no bio." | CTA: Link no bio');

-- DIA 30 - NOITE
INSERT INTO conteudo_posts (client_id, dia, semana, horario, formato, categoria, titulo, roteiro, cta_legenda) VALUES
(cid, 30, 4, 'noite', 'carrossel', 'narrativa', 'Manifesto: por que acredito que o TikTok Shop vai mudar vidas no Brasil',
'CAPA: "Por que acredito que o TikTok Shop vai mudar vidas no Brasil" — O manifesto de 30 dias →
CARD 2: O Brasil tem 4 milhões de MEIs. A maioria não tem canal de venda digital próprio. O TikTok Shop é o primeiro marketplace que permite que uma pessoa com produto, celular e internet construa um negócio sem precisar de loja física, capital grande ou experiência prévia.
CARD 3: Vi em 30 dias pessoas saindo do CLT, afiliadas sem estoque ganhando comissão, sellers de moda triplicando o faturamento. O denominador comum: elas começaram. Sem estar prontas. Sem saber tudo. Apenas começaram.
CARD 4: A plataforma não é perfeita. Tem bug, tem processo que muda, tem regra que confunde. Mas é a janela mais acessível que o Brasil já teve para entrar no e-commerce com suporte do algoritmo.
CARD 5: Minha missão como Embaixador não é vender produto da plataforma. É mostrar o caminho para quem quer entrar mas não sabe por onde. É ser a ponte entre a plataforma e o vendedor independente que vai mudar sua realidade.
CARD 6: Se esses 30 dias te deram clareza, te deram prova ou te deram coragem — minha missão foi cumprida. O próximo passo é seu.
CARD FINAL: "Protocolo R$67 → para começar. Club R$997 → para escalar. Mentoria R$4.500 → para dominar. O caminho existe. Você escolhe a velocidade. Link no bio."',
'Legenda: "30 dias. Um manifesto. Uma convicção. Link no bio para o próximo passo." | CTA: Link no bio');

END $$;
