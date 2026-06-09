-- ════════════════════════════════════════════
-- Módulo TikTok Shop — Produtos
-- ════════════════════════════════════════════
create table if not exists tiktok_produtos (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid references clients(id) on delete cascade,

  -- Identificação
  nome          text not null,
  descricao     text,
  sku           text,
  ncm           text,

  -- Preço e margem
  preco         numeric(10,2),
  margem        numeric(5,2),  -- % de margem de ganho desejada

  -- Estoque e logística
  unidade       text,
  estoque       integer default 0,
  marca         text,

  -- Dimensões
  comprimento   numeric,
  largura       numeric,
  altura        numeric,
  peso          numeric,

  -- Categorização
  nicho         text,
  subnicho      text,

  -- Controle
  status        text default 'rascunho',  -- rascunho | ativo | inativo
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table tiktok_produtos enable row level security;

-- Admins têm acesso total
create policy "tiktok_produtos_admin_all" on tiktok_produtos
  for all to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Profissionais podem ler
create policy "tiktok_produtos_read" on tiktok_produtos
  for select to authenticated using (true);
