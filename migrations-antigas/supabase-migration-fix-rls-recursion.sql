-- Corrige "infinite recursion detected in policy for relation profiles".
--
-- Causa real: a policy antiga "Admins veem todos os perfis" faz uma subconsulta
-- inline na própria tabela profiles (EXISTS (SELECT 1 FROM profiles ...)) dentro
-- do seu USING — toda leitura de profiles reaplica essa policy, que lê profiles de
-- novo, recursando infinitamente. A policy "Admins leem todos os perfis" (que usa
-- current_user_is_admin()) já cobre o mesmo caso de uso sem recursão.

DROP POLICY IF EXISTS "Admins veem todos os perfis" ON profiles;

-- Mantido por segurança (sem efeito relacionado à recursão acima, mas não custa nada):
ALTER FUNCTION public.current_user_is_admin() SET row_security = off;
ALTER FUNCTION public.current_user_is_vendas() SET row_security = off;
