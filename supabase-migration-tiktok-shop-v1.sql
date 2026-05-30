-- Migration: TikTok Shop CRM v1
-- Novas tabelas para gestão de alunos/compradores dos infoprodutos

-- Catálogo de produtos
CREATE TABLE IF NOT EXISTS produtos_tiktok (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('lowticket', 'core', 'mentoria', 'outro')),
  preco numeric(10,2),
  kiwify_product_id text UNIQUE,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Base de alunos (sincronizada com Kiwify via webhook)
CREATE TABLE IF NOT EXISTS alunos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  telefone text,
  kiwify_customer_id text UNIQUE,
  etapa text DEFAULT 'lead' CHECK (etapa IN ('lead', 'entrada', 'core', 'avancado')),
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Histórico de compras
CREATE TABLE IF NOT EXISTS compras_alunos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES alunos(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES produtos_tiktok(id),
  status text DEFAULT 'ativo' CHECK (status IN ('ativo', 'reembolsado', 'chargeback')),
  kiwify_order_id text UNIQUE,
  valor numeric(10,2),
  data_compra timestamptz DEFAULT now()
);

-- Carrinhos abandonados
CREATE TABLE IF NOT EXISTS carrinhos_abandonados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES alunos(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES produtos_tiktok(id),
  kiwify_checkout_id text,
  data_abandono timestamptz DEFAULT now()
);

-- Notas/observações do admin sobre alunos
CREATE TABLE IF NOT EXISTS notas_alunos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES alunos(id) ON DELETE CASCADE,
  texto text NOT NULL,
  admin_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- RLS: somente admin acessa todas as tabelas
ALTER TABLE produtos_tiktok ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras_alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrinhos_abandonados ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_alunos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only" ON produtos_tiktok USING (current_user_is_admin());
CREATE POLICY "admin_only" ON alunos USING (current_user_is_admin());
CREATE POLICY "admin_only" ON compras_alunos USING (current_user_is_admin());
CREATE POLICY "admin_only" ON carrinhos_abandonados USING (current_user_is_admin());
CREATE POLICY "admin_only" ON notas_alunos USING (current_user_is_admin());

-- Insert policies (needed for webhook via service role — service role bypasses RLS)
CREATE POLICY "admin_only_insert" ON produtos_tiktok FOR INSERT WITH CHECK (current_user_is_admin());
CREATE POLICY "admin_only_insert" ON alunos FOR INSERT WITH CHECK (true); -- webhook uses service role
CREATE POLICY "admin_only_insert" ON compras_alunos FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_only_insert" ON carrinhos_abandonados FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_only_insert" ON notas_alunos FOR INSERT WITH CHECK (current_user_is_admin());

-- Update policies
CREATE POLICY "admin_only_update" ON alunos FOR UPDATE USING (true);
CREATE POLICY "admin_only_update" ON compras_alunos FOR UPDATE USING (true);
