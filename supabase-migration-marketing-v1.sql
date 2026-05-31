-- Iniciativas de Marketing (campanhas, lançamentos, ações)
CREATE TABLE IF NOT EXISTS marketing_iniciativas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  tipo text NOT NULL DEFAULT 'acao' CHECK (tipo IN ('lancamento', 'campanha', 'conteudo', 'live', 'parceria', 'acao')),
  status text NOT NULL DEFAULT 'ideia' CHECK (status IN ('ideia', 'planejando', 'em_execucao', 'concluido', 'pausado')),
  prioridade text NOT NULL DEFAULT 'media' CHECK (prioridade IN ('alta', 'media', 'baixa')),
  data_inicio date,
  data_fim date,
  meta text,
  resultado text,
  notas text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_iniciativas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_gerencia_iniciativas" ON marketing_iniciativas FOR ALL USING (current_user_is_admin());
CREATE POLICY "autenticados_veem_iniciativas" ON marketing_iniciativas FOR SELECT USING (auth.role() = 'authenticated');

-- Ajuste na conteudo_posts: permitir sem client_id (posts do CRM Produtos)
ALTER TABLE conteudo_posts ALTER COLUMN client_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS conteudo_posts_sem_cliente ON conteudo_posts(dia) WHERE client_id IS NULL;
