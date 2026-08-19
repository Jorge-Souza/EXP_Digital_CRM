-- EXP Digital CRM — Migration v3
-- Cole no SQL Editor do Supabase e clique Run

-- Atualizar constraint de status dos posts com os novos valores
ALTER TABLE public.posts
  DROP CONSTRAINT IF EXISTS posts_status_check;

ALTER TABLE public.posts
  ADD CONSTRAINT posts_status_check
  CHECK (status IN (
    'planejado',
    'falta_insumo',
    'producao',
    'aprovado_design',
    'aprovado',
    'agendado',
    'publicado'
  ));
