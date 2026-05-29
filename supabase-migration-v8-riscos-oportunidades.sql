-- EXP Digital CRM — Migration v8
-- Adiciona campos de riscos e oportunidades ao planejamento mensal
-- Cole no SQL Editor do Supabase e clique Run

ALTER TABLE public.planejamentos
  ADD COLUMN IF NOT EXISTS riscos TEXT,
  ADD COLUMN IF NOT EXISTS oportunidades TEXT;
