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

END $$;
