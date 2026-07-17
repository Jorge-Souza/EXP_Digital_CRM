-- ============================================================
-- Migração: Documentos de identidade na habilitação
-- ============================================================

ALTER TABLE habilitacoes
  ADD COLUMN IF NOT EXISTS tipo_documento text,
  ADD COLUMN IF NOT EXISTS doc_frente_url text,
  ADD COLUMN IF NOT EXISTS selfie_url text,
  ADD COLUMN IF NOT EXISTS selfie_doc_url text;
