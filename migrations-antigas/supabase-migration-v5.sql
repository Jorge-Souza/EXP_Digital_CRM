-- EXP Digital CRM — Migration v5
-- Cole no SQL Editor do Supabase e clique Run

-- Adiciona campo de aprovação para aparecer no calendário do planejamento
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS aprovado boolean NOT NULL DEFAULT false;
