-- Função auxiliar: retorna true se o usuário atual tem role = 'admin'
-- SECURITY DEFINER bypassa RLS e o conflito do nome 'role' no PostgREST
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;
