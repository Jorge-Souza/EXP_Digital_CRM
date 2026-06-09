-- ============================================================
-- Portal de Habilitação TikTok Shop
-- ============================================================

CREATE TABLE IF NOT EXISTS habilitacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,

  -- Termos
  termos_aceitos_at timestamptz,
  aceito_privacidade boolean DEFAULT false,
  aceito_uso_imagem boolean DEFAULT false,
  aceito_divulgacao boolean DEFAULT false,

  -- Etapa 1: Empresa
  nome_empresa text,
  cnpj text,
  data_constituicao text,
  endereco_comercial text,
  cnpj_doc_url text,

  -- Etapa 1: Representante Legal
  rep_nome text,
  rep_data_nascimento text,
  rep_nacionalidade text,
  rep_endereco text,
  rep_comprovante_url text,

  -- Etapa 2: Loja
  inscricao_estadual text,
  nicho text,
  subnicho text,
  certificado_url text,
  senha_certificado text,

  -- Etapa 3: Produtos
  produtos jsonb DEFAULT '[]'::jsonb,

  -- Controle
  status text DEFAULT 'rascunho',  -- rascunho | enviado
  etapa_atual integer DEFAULT 1,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE habilitacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cliente vê própria habilitação" ON habilitacoes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Cliente insere própria habilitação" ON habilitacoes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Cliente atualiza própria habilitação" ON habilitacoes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin vê todas habilitações" ON habilitacoes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER habilitacoes_updated_at
  BEFORE UPDATE ON habilitacoes
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- Storage: criar bucket 'habilitacao' no Supabase Dashboard
-- Storage > New bucket > Nome: habilitacao > Private: SIM
--
-- Políticas do bucket (Storage > habilitacao > Policies):
--
-- INSERT policy:
--   Nome: "Autenticados podem fazer upload"
--   Expressão: (auth.uid() IS NOT NULL)
--
-- SELECT policy:
--   Nome: "Usuário acessa próprios arquivos"
--   Expressão: (auth.uid()::text = (storage.foldername(name))[1])
--             OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
-- ============================================================
