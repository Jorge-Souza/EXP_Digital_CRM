-- Adiciona referência ao post para deduplicação de notificações de risco
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;
