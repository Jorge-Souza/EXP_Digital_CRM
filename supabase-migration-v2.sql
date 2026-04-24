-- =============================================
-- EXP Digital CRM — Migration v2
-- Cole no SQL Editor do Supabase e clique Run
-- =============================================

-- Adicionar campos estruturados de briefing na tabela clients
alter table public.clients
  add column if not exists objetivo text,
  add column if not exists publico_alvo text,
  add column if not exists tom_de_voz text,
  add column if not exists servicos_contratados text,
  add column if not exists diferenciais text,
  add column if not exists observacoes text;

-- Adicionar campo tema/ideia na tabela posts
alter table public.posts
  add column if not exists tema text;

-- Manter briefing antigo para não perder dados existentes
-- (pode remover depois de migrar os dados)
