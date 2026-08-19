-- Função que dispara notificações automáticas ao criar/atualizar posts
CREATE OR REPLACE FUNCTION public.notify_post_changes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  client_nome TEXT;
  notif_titulo TEXT;
  notif_mensagem TEXT;
  notif_link TEXT;
  admin_id UUID;
BEGIN
  SELECT nome INTO client_nome FROM public.clients WHERE id = NEW.client_id;
  notif_link := '/publicacoes';

  -- Post atribuído a um responsável
  IF NEW.responsavel_id IS NOT NULL
    AND NEW.responsavel_id IS DISTINCT FROM OLD.responsavel_id
  THEN
    INSERT INTO public.notifications (user_id, titulo, mensagem, link)
    VALUES (
      NEW.responsavel_id,
      '📋 Nova publicação atribuída',
      '"' || NEW.titulo || '" (' || COALESCE(client_nome, '') || ') foi atribuída a você',
      notif_link
    );
  END IF;

  -- Mudança de status
  IF NEW.status IS DISTINCT FROM OLD.status THEN

    -- Notifica o responsável
    IF NEW.responsavel_id IS NOT NULL THEN
      notif_titulo := NULL;
      CASE NEW.status
        WHEN 'falta_insumo' THEN
          notif_titulo  := '⚠️ Falta insumo';
          notif_mensagem := '"' || NEW.titulo || '" (' || COALESCE(client_nome, '') || ') está aguardando insumo';
        WHEN 'aprovado' THEN
          notif_titulo  := '✅ Pronto para aprovação';
          notif_mensagem := '"' || NEW.titulo || '" (' || COALESCE(client_nome, '') || ') aguarda aprovação do cliente';
        WHEN 'publicado' THEN
          notif_titulo  := '🎉 Post publicado!';
          notif_mensagem := '"' || NEW.titulo || '" (' || COALESCE(client_nome, '') || ') foi publicado com sucesso';
        ELSE NULL;
      END CASE;

      IF notif_titulo IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, titulo, mensagem, link)
        VALUES (NEW.responsavel_id, notif_titulo, notif_mensagem, notif_link);
      END IF;
    END IF;

    -- Notifica todos os admins em eventos críticos (sem duplicar para o responsável)
    IF NEW.status IN ('falta_insumo', 'aprovado') THEN
      CASE NEW.status
        WHEN 'falta_insumo' THEN
          notif_titulo   := '⚠️ Falta insumo';
          notif_mensagem := '"' || NEW.titulo || '" (' || COALESCE(client_nome, '') || ') precisa de insumo';
        WHEN 'aprovado' THEN
          notif_titulo   := '✅ Post para aprovação de cliente';
          notif_mensagem := '"' || NEW.titulo || '" (' || COALESCE(client_nome, '') || ') aguarda aprovação';
      END CASE;

      FOR admin_id IN
        SELECT id FROM public.profiles WHERE role = 'admin'
      LOOP
        IF admin_id IS DISTINCT FROM NEW.responsavel_id THEN
          INSERT INTO public.notifications (user_id, titulo, mensagem, link)
          VALUES (admin_id, notif_titulo, notif_mensagem, notif_link);
        END IF;
      END LOOP;
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

-- Remove trigger anterior se existir e recria
DROP TRIGGER IF EXISTS on_post_change ON public.posts;

CREATE TRIGGER on_post_change
  AFTER UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.notify_post_changes();
