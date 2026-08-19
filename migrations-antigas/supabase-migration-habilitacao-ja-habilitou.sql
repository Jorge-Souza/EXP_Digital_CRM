-- Cliente que já habilitou a loja por conta própria pula o envio de documentos de identidade
ALTER TABLE habilitacoes ADD COLUMN IF NOT EXISTS ja_habilitou_loja boolean DEFAULT false;
