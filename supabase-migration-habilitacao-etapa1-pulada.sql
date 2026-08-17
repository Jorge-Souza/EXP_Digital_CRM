-- Cliente que já habilitou a loja pode pular a Etapa 1 (Empresa/Representante) e ir direto pros Produtos
ALTER TABLE habilitacoes ADD COLUMN IF NOT EXISTS etapa1_pulada boolean DEFAULT false;
