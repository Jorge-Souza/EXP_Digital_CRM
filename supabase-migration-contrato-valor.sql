-- Valor mensal do contrato
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS contrato_valor numeric(10,2);

-- Tabela de serviços adicionais por cliente
CREATE TABLE IF NOT EXISTS contrato_servicos_adicionais (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  valor numeric(10,2) NOT NULL DEFAULT 0,
  data date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contrato_servicos_adicionais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth users can manage servicos adicionais"
  ON contrato_servicos_adicionais
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
