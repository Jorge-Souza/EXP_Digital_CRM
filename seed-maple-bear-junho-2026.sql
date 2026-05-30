-- ============================================================
-- Seed: Maple Bear São Miguel — Planejamento Junho 2026
-- Cole no SQL Editor do Supabase e clique Run
-- ============================================================

DO $$
DECLARE
  v_client_id uuid;
  v_plan_id   uuid;
BEGIN

  -- 1. Localizar o cliente
  SELECT id INTO v_client_id
  FROM public.clients
  WHERE nome ILIKE '%maple bear%são miguel%'
     OR nome ILIKE '%maple bear são miguel%'
  LIMIT 1;

  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Cliente "Maple Bear São Miguel" não encontrado. Verifique o nome exato no CRM.';
  END IF;

  RAISE NOTICE 'Cliente encontrado: %', v_client_id;

  -- 2. Criar ou obter o planejamento de junho 2026
  SELECT id INTO v_plan_id
  FROM public.planejamentos
  WHERE client_id = v_client_id AND mes = '2026-06';

  IF v_plan_id IS NULL THEN
    INSERT INTO public.planejamentos (client_id, mes, objetivo_mes, datas_comemorativas, referencias, sugestoes_acoes)
    VALUES (v_client_id, '2026-06', '', '[]'::jsonb, '[]'::jsonb, NULL)
    RETURNING id INTO v_plan_id;
  END IF;

  -- 3. Atualizar objetivo e datas comemorativas
  UPDATE public.planejamentos
  SET
    objetivo_mes = 'Campanhas para Festa Junina e Winter Camp',
    datas_comemorativas = '[
      {"data":"2026-06-02","nome":"Gravação","ideia":"","ativo":true},
      {"data":"2026-06-04","nome":"Emenda Feriado","ideia":"","ativo":true},
      {"data":"2026-06-05","nome":"Emenda Feriado","ideia":"","ativo":true},
      {"data":"2026-06-06","nome":"Jogo Copa","ideia":"","ativo":true},
      {"data":"2026-06-13","nome":"Jogo Copa","ideia":"","ativo":true},
      {"data":"2026-06-19","nome":"Jogo Copa","ideia":"","ativo":true},
      {"data":"2026-06-20","nome":"Festa Junina","ideia":"","ativo":true},
      {"data":"2026-06-22","nome":"Fun Week","ideia":"","ativo":true},
      {"data":"2026-06-23","nome":"Fun Week","ideia":"","ativo":true},
      {"data":"2026-06-24","nome":"Jogo Copa + Fun Week","ideia":"","ativo":true},
      {"data":"2026-06-25","nome":"Fun Week","ideia":"","ativo":true},
      {"data":"2026-06-26","nome":"Fun Week","ideia":"","ativo":true}
    ]'::jsonb,
    sugestoes_acoes = 'Gravação geral no dia 02/06 (Terça).
Divulgação Winter Camp ao longo do mês.
Aproveitar jogos do Brasil (06, 13, 19 e 24/06) para conteúdo de engajamento.
Festa Junina ao vivo no dia 20/06.
Fun Week de 22 a 26/06 com conteúdo diário.'
  WHERE id = v_plan_id;

  -- 4. Remover posts existentes de junho 2026 deste cliente (evitar duplicatas)
  DELETE FROM public.posts
  WHERE client_id = v_client_id
    AND data_publicacao >= '2026-06-01'
    AND data_publicacao <= '2026-06-30';

  -- 5. Inserir os 24 posts com referências
  INSERT INTO public.posts
    (client_id, titulo, tipo, status, tema, data_publicacao, notas, referencia_url, aprovado, plataforma)
  VALUES

  -- 01 | 02/06 Ter | GRAVAÇÃO
  (v_client_id,
   'Gravação dos conteúdos de todo o mês (Winter Camp + Festa Junina)',
   'feed', 'agendado', 'Gravação', '2026-06-02',
   'Dia de gravação de todos os conteúdos do mês.',
   NULL, false, 'instagram'),

  -- 02 | 03/06 Qua | REELS — Winter Camp
  (v_client_id,
   'Winter Camp: o que é, como funciona e por que vale a pena',
   'reels', 'planejado', 'Winter Camp', '2026-06-03',
   NULL,
   NULL, false, 'ambos'),

  -- 03 | 04/06 Qui | ESTÁTICO — Feriado
  (v_client_id,
   'Emenda de feriado — comunicado: não haverá aula nos dias 4 e 5',
   'feed', 'planejado', 'Institucional', '2026-06-04',
   NULL,
   NULL, false, 'instagram'),

  -- 04 | 06/06 Sáb | REELS — Jogo Copa ⚽
  (v_client_id,
   'Torcida Maple Bear na Copa do Mundo — #VaiBrasil',
   'reels', 'planejado', 'Copa do Mundo', '2026-06-06',
   'Sugestão: substituir a música por Waka Waka - Shakira. Alunos com a camisa do Brasil e acessórios relacionados. Ref TikTok: https://www.tiktok.com/@avaitubsport/video/7628369440647793928?_r=1&_t=ZS-96iLZVIGc2k',
   'https://www.instagram.com/reel/DYAH3dHOiuW/?utm_source=ig_web_copy_link&igsh=MzRIODBiNWFIZA==',
   false, 'ambos'),

  -- 05 | 08/06 Seg | CARROSSEL — Winter Camp divulgação
  (v_client_id,
   'Divulgação Winter Camp: datas, programação e como se inscrever',
   'carrossel', 'planejado', 'Winter Camp', '2026-06-08',
   'Sugestão: falar algo relacionado à escola não ficar vazia nas férias, divulgando o Winter Camp.',
   'https://www.instagram.com/reel/DXpa7MTPZ_I/?utm_source=ig_web_copy_link&igsh=MzRIODBiNWFIZA==',
   false, 'instagram'),

  -- 06 | 09/06 Ter | REELS — Bastidores Festa Junina
  (v_client_id,
   'Bastidores: preparação da Festa Junina na escola',
   'reels', 'planejado', 'Festa Junina', '2026-06-09',
   'Ref Instagram: https://www.instagram.com/reel/DYJ2N91yo6S/?utm_source=ig_web_copy_link&igsh=MzRIODBiNWFIZA==',
   'https://www.tiktok.com/@colegioconstrutivo/video/7382945376917032197?_r=1&_t=ZS-96iMQwsAhbW',
   false, 'ambos'),

  -- 07 | 10/06 Qua | ESTÁTICO — Contagem regressiva
  (v_client_id,
   'Contagem regressiva Festa Junina — 10 dias!',
   'feed', 'planejado', 'Festa Junina', '2026-06-10',
   NULL,
   NULL, false, 'instagram'),

  -- 08 | 11/06 Qui | REELS — Bilinguismo
  (v_client_id,
   'Bilinguismo: como a metodologia canadense prepara para o futuro',
   'reels', 'planejado', 'Educação / Metodologia', '2026-06-11',
   NULL,
   'https://www.instagram.com/reel/DYz6wxYxegs/?utm_source=ig_web_copy_link&igsh=MzRIODBiNWFIZA==',
   false, 'ambos'),

  -- 09 | 12/06 Sex | REELS — Winter Camp vs colônia
  (v_client_id,
   'Por que o Winter Camp é diferente de qualquer colônia de férias',
   'reels', 'planejado', 'Winter Camp', '2026-06-12',
   NULL,
   NULL, false, 'ambos'),

  -- 10 | 13/06 Sáb | REELS — Jogo Copa ⚽
  (v_client_id,
   'Copa do Mundo na Maple Bear — torcendo juntos',
   'reels', 'planejado', 'Copa do Mundo', '2026-06-13',
   'Alunos com a camisa do Brasil e com acessórios relacionados.',
   'https://www.instagram.com/reel/DYw6HP0gb1k/?utm_source=ig_web_copy_link&igsh=MzRIODBiNWFIZA==',
   false, 'ambos'),

  -- 11 | 15/06 Seg | CARROSSEL — Winter Camp depoimentos
  (v_client_id,
   'Winter Camp: depoimentos de alunos e famílias',
   'carrossel', 'planejado', 'Winter Camp', '2026-06-15',
   NULL,
   NULL, false, 'instagram'),

  -- 12 | 16/06 Ter | REELS (Trend) — Inglês no dia a dia
  (v_client_id,
   'Alunos mostram como falam frases do dia a dia em inglês',
   'reels', 'planejado', 'Educação / Trend', '2026-06-16',
   NULL,
   NULL, false, 'ambos'),

  -- 13 | 17/06 Qua | CARROSSEL — Programação Festa Junina
  (v_client_id,
   'Programação completa da Festa Junina: data, horário e atrações',
   'carrossel', 'planejado', 'Festa Junina', '2026-06-17',
   'Sugestão: adaptar para chamar para o Winter Camp também. Ref 2: https://www.instagram.com/reel/DY0luxepawa/?utm_source=ig_web_copy_link&igsh=MzRIODBiNWFIZA==',
   'https://www.instagram.com/reel/DYpScaR56X/?utm_source=ig_web_copy_link&igsh=MzRIODBiNWFIZA==',
   false, 'instagram'),

  -- 14 | 18/06 Qui | REELS — Últimas vagas Winter Camp
  (v_client_id,
   'Últimas vagas Winter Camp — garanta já!',
   'reels', 'planejado', 'Winter Camp', '2026-06-18',
   NULL,
   NULL, false, 'instagram'),

  -- 15 | 19/06 Sex | REELS — Jogo Copa ⚽
  (v_client_id,
   'Jogo da Copa + Maple Bear torce junto',
   'reels', 'planejado', 'Copa do Mundo', '2026-06-19',
   'Sugestão: adaptar para a Copa — "Como vamos ficar tristes... Se hoje tem jogo do Brasil".',
   'https://www.instagram.com/reel/DYJ2N91yo6S/?utm_source=ig_web_copy_link&igsh=MzRIODBiNWFIZA==',
   false, 'ambos'),

  -- 16 | 20/06 Sáb | REELS + FOTO — Festa Junina ao vivo 🎉
  (v_client_id,
   'Festa Junina ao vivo! Registros do evento e stories',
   'reels', 'planejado', 'Festa Junina', '2026-06-20',
   'Conteúdo ao vivo + fotos do evento. Fazer stories no dia.',
   NULL, false, 'instagram'),

  -- 17 | 22/06 Seg | REELS — Fun Week dia 1
  (v_client_id,
   'Fun Week começa hoje! O que esperar dessa semana incrível',
   'reels', 'planejado', 'Fun Week', '2026-06-22',
   'Conteúdo ao vivo.',
   NULL, false, 'ambos'),

  -- 18 | 23/06 Ter | REELS — Fun Week dia 2
  (v_client_id,
   'Fun Week Dia 2: bastidores das atividades especiais',
   'reels', 'planejado', 'Fun Week', '2026-06-23',
   'Conteúdo ao vivo.',
   NULL, false, 'ambos'),

  -- 19 | 24/06 Qua | REELS — Fun Week + Jogo Copa ⚽
  (v_client_id,
   'Fun Week + Copa do Mundo — dia duplo na Maple Bear!',
   'reels', 'planejado', 'Fun Week / Copa', '2026-06-24',
   'Sugestão: alunos e professores se abraçam torcendo pelo Brasil. Trocar música por uma relacionada à Copa.',
   'https://www.instagram.com/reel/DYpgIJsgnsJ/?utm_source=ig_web_copy_link&igsh=MzRIODBiNWFIZA==',
   false, 'ambos'),

  -- 20 | 25/06 Qui | REELS — Fun Week dia 4
  (v_client_id,
   'Fun Week: atividades em destaque e momentos dos alunos',
   'reels', 'planejado', 'Fun Week', '2026-06-25',
   'Sugestão: mostrar as crianças se divertindo durante a Fun Week.',
   'https://www.instagram.com/reel/DV1esopDX8r/?utm_source=ig_web_copy_link&igsh=MzRIODBiNWFIZA==',
   false, 'ambos'),

  -- 21 | 26/06 Sex | REELS — Fun Week último dia
  (v_client_id,
   'Último dia da Fun Week — retrospectiva e momentos marcantes',
   'reels', 'planejado', 'Fun Week', '2026-06-26',
   'Conteúdo ao vivo.',
   NULL, false, 'ambos'),

  -- 22 | 27/06 Sáb | FOTO — Resumo semana
  (v_client_id,
   'Resumo da semana + chamada Winter Camp',
   'feed', 'planejado', 'Fun Week / Winter Camp', '2026-06-27',
   'Conteúdo ao vivo.',
   NULL, false, 'instagram'),

  -- 23 | 29/06 Seg | REELS — Winter Camp últimas vagas
  (v_client_id,
   'Winter Camp: últimas vagas, inscrições encerram em breve',
   'reels', 'planejado', 'Winter Camp', '2026-06-29',
   NULL,
   'https://www.instagram.com/reel/DVRkVIekUXk/?utm_source=ig_web_copy_link&igsh=MzRIODBiNWFIZA==',
   false, 'instagram'),

  -- 24 | 30/06 Ter | CARROSSEL — Retrospectiva junho
  (v_client_id,
   'Retrospectiva junho + prévia do que vem em julho',
   'carrossel', 'planejado', 'Institucional', '2026-06-30',
   NULL,
   NULL, false, 'instagram');

  RAISE NOTICE '✅ Importação concluída: 24 posts criados para Maple Bear São Miguel — Junho 2026 (planejamento: %)', v_plan_id;

END $$;
