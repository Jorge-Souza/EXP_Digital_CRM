-- Permite que admins leiam todos os perfis (necessário para a página /usuarios)
CREATE POLICY "Admins leem todos os perfis"
  ON public.profiles FOR SELECT
  USING (current_user_is_admin() OR auth.uid() = id);
