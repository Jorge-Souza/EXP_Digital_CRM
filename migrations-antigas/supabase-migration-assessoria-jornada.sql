-- =============================================
-- Migration: Assessoria Jornada (3 Pilares e 6 Encontros)
-- =============================================

-- 1. Adicionar colunas de controle da jornada na tabela assessorados
alter table public.assessorados
  add column if not exists status_estrutura text not null default 'nao_iniciado' check (status_estrutura in ('nao_iniciado', 'em_andamento', 'concluido')),
  add column if not exists status_exposicao text not null default 'nao_iniciado' check (status_exposicao in ('nao_iniciado', 'em_andamento', 'concluido')),
  add column if not exists status_expansao text not null default 'nao_iniciado' check (status_expansao in ('nao_iniciado', 'em_andamento', 'concluido')),
  add column if not exists notas_jornada text;

-- 2. Adicionar colunas de controle dos encontros na tabela sessoes_assessoria
alter table public.sessoes_assessoria
  add column if not exists numero_sessao integer check (numero_sessao between 1 and 6),
  add column if not exists pilar_foco text check (pilar_foco in ('Estrutura', 'Exposição', 'Expansão', 'Geral')),
  add column if not exists plano_de_acao text;

-- FIM DA MIGRATION
