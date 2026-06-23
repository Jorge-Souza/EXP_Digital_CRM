-- Corrige "infinite recursion detected in policy for relation profiles".
-- current_user_is_admin()/current_user_is_vendas() consultam profiles; quando chamadas
-- de dentro de uma policy de SELECT em profiles, a consulta interna reaplica a mesma
-- policy, recursando. SET row_security = off faz a consulta interna ignorar RLS.

ALTER FUNCTION public.current_user_is_admin() SET row_security = off;
ALTER FUNCTION public.current_user_is_vendas() SET row_security = off;
