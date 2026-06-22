-- Novo papel "vendas" com acesso restrito a Alunos + Carrinhos Abandonados

DO $$
DECLARE conname text;
BEGIN
  SELECT con.conname INTO conname
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'profiles' AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%role%';
  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE profiles DROP CONSTRAINT %I', conname);
  END IF;
END $$;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'profissional', 'vendas'));

CREATE OR REPLACE FUNCTION public.current_user_is_vendas()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'vendas');
$$;
GRANT EXECUTE ON FUNCTION public.current_user_is_vendas() TO authenticated;

CREATE POLICY "vendas_select" ON alunos FOR SELECT USING (current_user_is_vendas());
CREATE POLICY "vendas_select_carrinhos" ON carrinhos_abandonados FOR SELECT USING (current_user_is_vendas());
CREATE POLICY "vendas_update_carrinhos" ON carrinhos_abandonados FOR UPDATE USING (current_user_is_vendas());
CREATE POLICY "vendas_select_interacoes" ON interacoes_carrinho FOR SELECT USING (current_user_is_vendas());
CREATE POLICY "vendas_insert_interacoes" ON interacoes_carrinho FOR INSERT WITH CHECK (current_user_is_vendas());
