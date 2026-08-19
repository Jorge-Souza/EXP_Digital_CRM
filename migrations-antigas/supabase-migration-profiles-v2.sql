-- EXP Digital CRM — Migration profiles-v2
-- Campos adicionais no perfil dos profissionais

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telefone    text,
  ADD COLUMN IF NOT EXISTS endereco    text,
  ADD COLUMN IF NOT EXISTS data_admissao date;
