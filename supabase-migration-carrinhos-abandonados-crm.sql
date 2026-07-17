-- Controle de follow-up para carrinhos abandonados (Kiwify)

ALTER TABLE carrinhos_abandonados
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'novo'
    CHECK (status IN ('novo', 'em_contato', 'recuperado', 'perdido')),
  ADD COLUMN IF NOT EXISTS proximo_followup date,
  ADD COLUMN IF NOT EXISTS responsavel text,
  ADD COLUMN IF NOT EXISTS observacoes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE TABLE IF NOT EXISTS interacoes_carrinho (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrinho_id uuid REFERENCES carrinhos_abandonados(id) ON DELETE CASCADE,
  data timestamptz DEFAULT now(),
  canal text CHECK (canal IN ('whatsapp', 'ligacao', 'dm_instagram', 'email')),
  resumo text,
  proximo_passo text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE interacoes_carrinho ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only" ON interacoes_carrinho USING (current_user_is_admin());
CREATE POLICY "admin_only_insert" ON interacoes_carrinho FOR INSERT WITH CHECK (current_user_is_admin());
