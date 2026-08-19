-- EXP Digital CRM — Migration v6
-- Cole no SQL Editor do Supabase e clique Run

-- 1. Responsável na publicação
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS responsavel_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Avatar e cor dos clientes
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS avatar_emoji text NOT NULL DEFAULT '🏢',
  ADD COLUMN IF NOT EXISTS cor text NOT NULL DEFAULT '#6366f1';

-- 3. Tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titulo      text NOT NULL,
  mensagem    text NOT NULL,
  link        text,
  lida        boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem suas próprias notificações"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id);

-- 4. Trigger: notifica responsável quando é marcado em uma publicação
CREATE OR REPLACE FUNCTION public.notify_responsavel_post()
RETURNS trigger AS $$
DECLARE
  v_cliente_nome text;
BEGIN
  IF new.responsavel_id IS NOT NULL AND (
    old.responsavel_id IS NULL OR old.responsavel_id != new.responsavel_id
  ) THEN
    SELECT nome INTO v_cliente_nome FROM public.clients WHERE id = new.client_id;

    INSERT INTO public.notifications (user_id, titulo, mensagem, link)
    VALUES (
      new.responsavel_id,
      '📋 Nova publicação atribuída',
      'Você é o responsável por "' || new.titulo || '" — ' || COALESCE(v_cliente_nome, 'Cliente'),
      '/clientes/' || new.client_id || '/projeto'
    );
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_responsavel_change ON public.posts;
CREATE TRIGGER on_post_responsavel_change
  AFTER INSERT OR UPDATE OF responsavel_id ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.notify_responsavel_post();
