-- Financeiro (DRE + caixa) do produto TikTok Shop.
-- Vendas e saques vêm das APIs da Kiwify e da Hotmart (sync diário); despesas, retiradas
-- e saques da Hotmart são lançados à mão. Acesso só via service role (sem policies).

create table if not exists public.financeiro_vendas (
  id uuid primary key default gen_random_uuid(),
  plataforma text not null check (plataforma in ('kiwify','hotmart')),
  external_id text not null,
  produto text,
  data_venda timestamptz not null,
  data_aprovacao timestamptz,
  bruto numeric(12,2) not null,
  taxa numeric(12,2) not null default 0,
  liquido numeric(12,2) not null,
  status text not null check (status in ('aprovada','reembolsada','chargeback')),
  data_status timestamptz,
  liberacao date,
  payment_method text,
  utm_campaign text,
  atualizado_em timestamptz not null default now(),
  unique (plataforma, external_id)
);
create index if not exists financeiro_vendas_data_idx on public.financeiro_vendas (data_venda);

create table if not exists public.financeiro_saques (
  id uuid primary key default gen_random_uuid(),
  plataforma text not null check (plataforma in ('kiwify','hotmart')),
  external_id text not null,
  valor numeric(12,2) not null,
  status text not null,
  data timestamptz not null,
  unique (plataforma, external_id)
);

create table if not exists public.financeiro_lancamentos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('despesa','retirada','saque')),
  data date not null,
  categoria text check (categoria in ('trafego','comissoes','impostos','equipe','ferramentas','fixas','outros')),
  descricao text,
  valor numeric(12,2) not null check (valor >= 0),
  plataforma text check (plataforma in ('kiwify','hotmart')),
  pago boolean not null default true,
  vencimento date,
  criado_em timestamptz not null default now()
);
create index if not exists financeiro_lancamentos_data_idx on public.financeiro_lancamentos (data);

create table if not exists public.financeiro_config (
  chave text primary key,
  valor numeric not null
);
insert into public.financeiro_config (chave, valor) values
  ('banco_inicial', 0), ('prazo_hotmart', 15), ('prazo_kiwify', 2)
on conflict (chave) do nothing;

alter table public.financeiro_vendas enable row level security;
alter table public.financeiro_saques enable row level security;
alter table public.financeiro_lancamentos enable row level security;
alter table public.financeiro_config enable row level security;
