-- Migration: TikTok Shop CRM v2
-- Respostas do formulário Google Forms + score de vendas

CREATE TABLE IF NOT EXISTS respostas_formulario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES alunos(id) ON DELETE CASCADE,
  -- Identificação
  timestamp_resposta timestamptz,
  nome text,
  whatsapp text,
  instagram text,
  email text NOT NULL,
  -- Contexto de negócio
  ja_vende_plataforma text,
  nicho text,
  tipo_venda text,           -- "Vendedor (Seller)" | "Afiliado (Creator)"
  faturamento text,          -- faixa de faturamento
  cria_videos text,
  -- Dores e dificuldades
  dificuldade_tiktok text,
  dor_tiktok text,
  nichos_que_vende text,
  nivel_tecnico text,
  -- Comprometimento
  executa_missoes text,      -- "Sim, vou executar todas as missões" | "Vou tentar executar a maioria"
  tempo_execucao text,       -- "No mesmo dia" | "Em até 3 dias" | "Durante a semana"
  -- Intenção de compra (score)
  interesse_297 text,        -- "Sim" | "Talvez..." | "Não"
  interesse_4500 text,       -- "Sim" | "Talvez..." | "Não"
  mural_futuro text,         -- campo livre
  -- Score calculado
  score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(email)
);

-- Adiciona score e classificação na tabela de alunos
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS score integer DEFAULT 0;
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS score_label text DEFAULT 'sem_dados' CHECK (score_label IN ('quente', 'morno', 'frio', 'sem_dados'));
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS instagram text;
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS tem_formulario boolean DEFAULT false;

-- RLS
ALTER TABLE respostas_formulario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_only" ON respostas_formulario USING (current_user_is_admin());
CREATE POLICY "admin_only_insert" ON respostas_formulario FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_only_update" ON respostas_formulario FOR UPDATE USING (true);
