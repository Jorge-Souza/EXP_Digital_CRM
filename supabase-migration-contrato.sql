-- Adiciona campos de contrato na tabela clients
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS contrato_path text,
  ADD COLUMN IF NOT EXISTS contrato_nome text,
  ADD COLUMN IF NOT EXISTS contrato_inicio date,
  ADD COLUMN IF NOT EXISTS contrato_duracao_meses integer;

-- Bucket privado para contratos (executar no Supabase Dashboard > Storage)
-- Nome: contratos | Private: true
-- Ou via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('contratos', 'contratos', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: apenas usuários autenticados podem ler/escrever
CREATE POLICY "auth users can read contratos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'contratos');

CREATE POLICY "auth users can insert contratos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'contratos');

CREATE POLICY "auth users can delete contratos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'contratos');
