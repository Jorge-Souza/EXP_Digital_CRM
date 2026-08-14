-- =============================================
-- Migration: Assessoria TikTok Shop (Painel de Jornada) — CRM Produtos
-- Feature independente do módulo Assessoria de CRM Serviços (assessorados).
-- =============================================

create table public.tiktok_assessoria_clientes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  nicho text,
  whatsapp text,
  created_at timestamptz not null default now()
);

create table public.tiktok_assessoria_lojas (
  id uuid primary key default uuid_generate_v4(),
  cliente_id uuid not null references public.tiktok_assessoria_clientes(id) on delete cascade,
  label text not null default 'Loja 1',
  link text,
  situations jsonb not null default '[]'::jsonb,
  trilha jsonb not null default '[]'::jsonb,
  custom_tasks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tiktok_assessoria_clientes enable row level security;
alter table public.tiktok_assessoria_lojas enable row level security;

create policy "Admins gerenciam clientes de assessoria tiktok"
  on public.tiktok_assessoria_clientes for all using (current_user_is_admin());

create policy "Admins gerenciam lojas de assessoria tiktok"
  on public.tiktok_assessoria_lojas for all using (current_user_is_admin());

create index if not exists idx_tiktok_assessoria_lojas_cliente_id on public.tiktok_assessoria_lojas(cliente_id);

-- FIM DA MIGRATION
