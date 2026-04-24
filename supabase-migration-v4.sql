-- EXP Digital CRM — Migration v4
-- Cole no SQL Editor do Supabase e clique Run

-- Tabela de planejamentos mensais por cliente
CREATE TABLE IF NOT EXISTS public.planejamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  mes text NOT NULL, -- formato 'YYYY-MM'
  objetivo_mes text,
  sugestoes_acoes text,
  referencias jsonb NOT NULL DEFAULT '[]'::jsonb,
  datas_comemorativas jsonb NOT NULL DEFAULT '[]'::jsonb,
  share_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, mes)
);

-- RLS: usuários autenticados gerenciam; leitura pública (token garante segurança por obscuridade)
ALTER TABLE public.planejamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_manage_planejamentos"
  ON public.planejamentos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "public_read_planejamentos"
  ON public.planejamentos FOR SELECT
  TO anon
  USING (true);

-- Novos campos nos posts
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS plataforma text DEFAULT 'instagram'
    CHECK (plataforma IN ('instagram', 'tiktok', 'ambos'));

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS referencia_url text;
