-- EXP Digital CRM — Migration v7
-- Adiciona 'a_fazer' à constraint de status dos posts
-- Cole no SQL Editor do Supabase e clique Run

ALTER TABLE public.posts
  DROP CONSTRAINT IF EXISTS posts_status_check;

ALTER TABLE public.posts
  ADD CONSTRAINT posts_status_check
  CHECK (status IN (
    'planejado',
    'a_fazer',
    'falta_insumo',
    'producao',
    'aprovado_design',
    'aprovado',
    'agendado',
    'publicado'
  ));
