-- Sistema SDR de Ascensão Comercial (Fase 1)
-- Estende alunos como registro mestre do lead, sem criar tabela leads paralela.

ALTER TABLE alunos
  ADD COLUMN IF NOT EXISTS etapa_pipeline text DEFAULT 'novo_lead' CHECK (etapa_pipeline IN (
    'novo_lead','engajou_instagram','capturado_whatsapp','diagnostico_feito',
    'oferta_curso','oferta_sos','oferta_mentoria','oferta_assessoria','venda','nutricao','perdido'
  )),
  ADD COLUMN IF NOT EXISTS origem text DEFAULT 'outro' CHECK (origem IN (
    'kiwify_compra','kiwify_carrinho','instagram','whatsapp','formulario','outro'
  )),
  ADD COLUMN IF NOT EXISTS tipo_lead text CHECK (tipo_lead IN (
    'lead_instagram','carrinho_abandonado','aluno_gratuito','comprador_curso',
    'comprador_sos','interessado_mentoria','interessado_assessoria'
  )),
  ADD COLUMN IF NOT EXISTS score_comercial integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS proxima_melhor_oferta text,
  ADD COLUMN IF NOT EXISTS responsavel_id uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS organization_id uuid;

-- Histórico de interações multi-canal (Instagram, WhatsApp, ligação, reunião, compra, carrinho)
CREATE TABLE IF NOT EXISTS interacoes_comerciais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES alunos(id) ON DELETE CASCADE,
  tipo text CHECK (tipo IN ('comentario_instagram','direct_instagram','whatsapp','ligacao','reuniao','compra','carrinho_abandonado')),
  resumo text,
  proximo_passo text,
  autor_id uuid REFERENCES profiles(id),
  data timestamptz DEFAULT now(),
  organization_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Ofertas feitas/aceitas/recusadas por lead
CREATE TABLE IF NOT EXISTS ofertas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES alunos(id) ON DELETE CASCADE,
  produto_tipo text CHECK (produto_tipo IN ('curso','sos','mentoria','assessoria')),
  status text DEFAULT 'sugerida' CHECK (status IN ('sugerida','enviada','aceita','recusada')),
  valor numeric(10,2),
  criado_por uuid REFERENCES profiles(id),
  organization_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tarefas de follow-up do SDR
CREATE TABLE IF NOT EXISTS tarefas_sdr (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES alunos(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  data_prazo date,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente','concluida','cancelada')),
  responsavel_id uuid REFERENCES profiles(id),
  organization_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE interacoes_comerciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE ofertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas_sdr ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only" ON interacoes_comerciais USING (current_user_is_admin());
CREATE POLICY "admin_only_insert" ON interacoes_comerciais FOR INSERT WITH CHECK (current_user_is_admin());
CREATE POLICY "vendas_select" ON interacoes_comerciais FOR SELECT USING (current_user_is_vendas());
CREATE POLICY "vendas_insert" ON interacoes_comerciais FOR INSERT WITH CHECK (current_user_is_vendas());

CREATE POLICY "admin_only" ON ofertas USING (current_user_is_admin());
CREATE POLICY "admin_only_insert" ON ofertas FOR INSERT WITH CHECK (current_user_is_admin());
CREATE POLICY "vendas_select" ON ofertas FOR SELECT USING (current_user_is_vendas());
CREATE POLICY "vendas_insert" ON ofertas FOR INSERT WITH CHECK (current_user_is_vendas());
CREATE POLICY "vendas_update" ON ofertas FOR UPDATE USING (current_user_is_vendas());

CREATE POLICY "admin_only" ON tarefas_sdr USING (current_user_is_admin());
CREATE POLICY "admin_only_insert" ON tarefas_sdr FOR INSERT WITH CHECK (current_user_is_admin());
CREATE POLICY "vendas_select" ON tarefas_sdr FOR SELECT USING (current_user_is_vendas());
CREATE POLICY "vendas_insert" ON tarefas_sdr FOR INSERT WITH CHECK (current_user_is_vendas());
CREATE POLICY "vendas_update" ON tarefas_sdr FOR UPDATE USING (current_user_is_vendas());

-- Vendas pode mover o pipeline e atualizar campos comerciais do lead (não o cadastro inteiro)
DROP POLICY IF EXISTS "vendas_update_pipeline" ON alunos;
CREATE POLICY "vendas_update_pipeline" ON alunos FOR UPDATE USING (current_user_is_vendas());

-- Score comercial: recalculado de forma simples a cada interação
CREATE OR REPLACE FUNCTION public.recalcular_score_comercial(p_aluno_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET row_security = off AS $$
DECLARE
  v_interacoes integer;
  v_peso_etapa integer;
BEGIN
  SELECT count(*) INTO v_interacoes FROM interacoes_comerciais WHERE aluno_id = p_aluno_id;
  SELECT array_position(
    ARRAY['novo_lead','engajou_instagram','capturado_whatsapp','diagnostico_feito',
          'oferta_curso','oferta_sos','oferta_mentoria','oferta_assessoria','venda','nutricao','perdido'],
    etapa_pipeline
  ) INTO v_peso_etapa FROM alunos WHERE id = p_aluno_id;

  UPDATE alunos SET score_comercial = (v_interacoes * 5) + (coalesce(v_peso_etapa, 1) * 10)
  WHERE id = p_aluno_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_recalcular_score_interacao()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM recalcular_score_comercial(NEW.aluno_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS recalc_score_on_interacao ON interacoes_comerciais;
CREATE TRIGGER recalc_score_on_interacao
  AFTER INSERT ON interacoes_comerciais
  FOR EACH ROW EXECUTE FUNCTION trg_recalcular_score_interacao();
