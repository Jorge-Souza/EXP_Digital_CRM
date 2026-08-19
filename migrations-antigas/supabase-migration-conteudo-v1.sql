-- Tabela de posts do calendário de conteúdo estratégico
CREATE TABLE IF NOT EXISTS conteudo_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  dia integer NOT NULL CHECK (dia BETWEEN 1 AND 30),
  semana integer NOT NULL CHECK (semana BETWEEN 1 AND 4),
  horario text NOT NULL CHECK (horario IN ('manha', 'noite')),
  formato text NOT NULL CHECK (formato IN ('reel', 'carrossel')),
  categoria text NOT NULL,
  titulo text NOT NULL,
  roteiro text,
  direcao text,
  cta_legenda text,
  dados_apoio text,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'gravado', 'editado', 'publicado')),
  data_publicacao date,
  notas text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE conteudo_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "autenticados_podem_ver_conteudo" ON conteudo_posts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "admin_gerencia_conteudo" ON conteudo_posts
  FOR ALL USING (current_user_is_admin());

-- Index
CREATE INDEX IF NOT EXISTS conteudo_posts_client_dia ON conteudo_posts(client_id, dia);
