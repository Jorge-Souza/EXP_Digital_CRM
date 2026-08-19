-- Migration: Planejamento de Operação — TikTok Academy (lives semanais)
-- Rotação fixa de 12 temas + campos de tema/público/checklist em marketing_iniciativas

CREATE TABLE IF NOT EXISTS academy_temas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero integer NOT NULL UNIQUE CHECK (numero BETWEEN 1 AND 12),
  titulo text NOT NULL,
  descricao text,
  categoria text NOT NULL DEFAULT 'operacao' CHECK (categoria IN ('preparacao', 'vendas', 'operacao', 'conteudo', 'engajamento')),
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE academy_temas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_gerencia_temas" ON academy_temas FOR ALL USING (current_user_is_admin());
CREATE POLICY "autenticados_veem_temas" ON academy_temas FOR SELECT USING (auth.role() = 'authenticated');

INSERT INTO academy_temas (numero, titulo, descricao, categoria) VALUES
  (1,  'O que antecede uma Live Shop',              'Preparação de cenário, produtos, roteiro e checklist antes de ir ao ar.',                     'preparacao'),
  (2,  'Execução da Live Shop',                     'Ciclo de vendas de 5 minutos, gancho, demonstração, oferta e CTA.',                           'vendas'),
  (3,  'Marketing de ofertas no TikTok Shop',       'Cupons, kits promocionais, promoção relâmpago e como escalonar promoções.',                   'vendas'),
  (4,  'Qualidade de produto',                      'Como evitar devolução, ficha técnica, imagens e descrição que reduzem reclamação.',           'operacao'),
  (5,  'Pesquisa de influenciadores',                'Como encontrar e selecionar afiliados, amostra grátis e estratégia slingshot.',               'vendas'),
  (6,  'Precificação e margem',                     'Comissão, frete, imposto e como precificar sem quebrar a margem.',                            'operacao'),
  (7,  'GMV Max e tráfego pago',                    'Como estruturar campanha, ler métricas e escalar investimento com segurança.',                'vendas'),
  (8,  'Shorts-vídeos shoppable',                   'Como gravar, linkar produto e manter frequência de postagem.',                                'conteudo'),
  (9,  'Bling / ERP e nota fiscal',                 'Integração, emissão de nota e organização de estoque para escalar sem dor de cabeça.',        'operacao'),
  (10, 'Logística e prazos de envio',               'Modelo 4PL, transportadoras, coleta x ponto de entrega, devoluções.',                          'operacao'),
  (11, 'Cases de alunos',                           'Aluno convidado compartilha o que funcionou — prova social ao vivo.',                          'vendas'),
  (12, 'Live aberta de dúvidas',                    'Sem tema fixo — tira-dúvidas geral e leitura de comentários da caixinha.',                     'engajamento')
ON CONFLICT (numero) DO NOTHING;

ALTER TABLE marketing_iniciativas ADD COLUMN IF NOT EXISTS tema_id uuid REFERENCES academy_temas(id);
ALTER TABLE marketing_iniciativas ADD COLUMN IF NOT EXISTS publico text CHECK (publico IN ('comunidade_aberta', 'alunos', 'ambos')) DEFAULT 'ambos';
ALTER TABLE marketing_iniciativas ADD COLUMN IF NOT EXISTS checklist jsonb DEFAULT '[]'::jsonb;
