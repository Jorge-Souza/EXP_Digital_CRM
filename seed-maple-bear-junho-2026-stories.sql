-- ============================================================
-- Seed: Maple Bear São Miguel — Stories Junho 2026
-- Cole no SQL Editor do Supabase e clique Run
-- (NÃO deleta posts existentes — só adiciona stories)
-- ============================================================

DO $$
DECLARE
  v_client_id uuid;
BEGIN

  SELECT id INTO v_client_id
  FROM public.clients
  WHERE nome ILIKE '%maple bear%são miguel%'
     OR nome ILIKE '%maple bear são miguel%'
  LIMIT 1;

  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Cliente "Maple Bear São Miguel" não encontrado.';
  END IF;

  INSERT INTO public.posts
    (client_id, titulo, tipo, status, tema, data_publicacao, notas, aprovado, plataforma)
  VALUES

  -- 06/06 Sáb | STORIES — Jogo Copa ⚽
  (v_client_id,
   'Stories: Torcida Maple Bear — Jogo do Brasil na Copa',
   'story', 'planejado', 'Copa do Mundo', '2026-06-06',
   'Stories ao vivo durante o jogo. Mostrar alunos e professores torcendo com a camisa do Brasil.',
   false, 'instagram'),

  -- 09/06 Ter | STORIES — Bastidores Festa Junina
  (v_client_id,
   'Stories: Bastidores da preparação para a Festa Junina',
   'story', 'planejado', 'Festa Junina', '2026-06-09',
   'Stories dos bastidores da decoração e ensaios para a Festa Junina.',
   false, 'instagram'),

  -- 13/06 Sáb | STORIES — Jogo Copa ⚽
  (v_client_id,
   'Stories: Maple Bear torce junto — Jogo do Brasil',
   'story', 'planejado', 'Copa do Mundo', '2026-06-13',
   'Stories durante o jogo. Engajamento com enquetes e contagem de gols.',
   false, 'instagram'),

  -- 19/06 Sex | STORIES — Jogo Copa ⚽
  (v_client_id,
   'Stories: Jogo do Brasil — Maple Bear na torcida',
   'story', 'planejado', 'Copa do Mundo', '2026-06-19',
   'Stories ao vivo do jogo com alunos e professores.',
   false, 'instagram'),

  -- 20/06 Sáb | STORIES — Festa Junina ao vivo 🎉
  (v_client_id,
   'Stories: Festa Junina ao vivo — quadrilha, comidas e diversão',
   'story', 'planejado', 'Festa Junina', '2026-06-20',
   'Stories ao vivo do evento: quadrilha, barracas, momentos dos alunos e famílias.',
   false, 'instagram'),

  -- 22/06 Seg | STORIES — Fun Week dia 1
  (v_client_id,
   'Stories: Fun Week começa hoje!',
   'story', 'planejado', 'Fun Week', '2026-06-22',
   'Stories ao vivo do primeiro dia da Fun Week.',
   false, 'instagram'),

  -- 23/06 Ter | STORIES — Fun Week dia 2
  (v_client_id,
   'Stories: Fun Week Dia 2 — atividades e bastidores',
   'story', 'planejado', 'Fun Week', '2026-06-23',
   'Stories das atividades do segundo dia.',
   false, 'instagram'),

  -- 24/06 Qua | STORIES — Fun Week + Copa
  (v_client_id,
   'Stories: Fun Week + Jogo do Brasil — dia duplo!',
   'story', 'planejado', 'Fun Week / Copa', '2026-06-24',
   'Stories do dia com os dois eventos: Fun Week e jogo da Copa.',
   false, 'instagram'),

  -- 25/06 Qui | STORIES — Fun Week dia 4
  (v_client_id,
   'Stories: Fun Week — momentos especiais do dia',
   'story', 'planejado', 'Fun Week', '2026-06-25',
   'Stories das atividades e momentos marcantes.',
   false, 'instagram'),

  -- 26/06 Sex | STORIES — Fun Week último dia
  (v_client_id,
   'Stories: Último dia da Fun Week — despedida e memórias',
   'story', 'planejado', 'Fun Week', '2026-06-26',
   'Stories finais da Fun Week. Momentos emocionantes do encerramento.',
   false, 'instagram');

  RAISE NOTICE '✅ 10 stories adicionados ao calendário da Maple Bear São Miguel — Junho 2026';

END $$;
