-- =============================================
-- MENTORIAS — Consultorias avulsas (SOS TikTok Shop e futuros tipos)
-- =============================================

create table public.mentorias (
  id uuid primary key default uuid_generate_v4(),
  tipo text not null default 'SOS TikTok Shop',
  cliente_nome text not null,
  cliente_telefone text,
  cliente_whatsapp text,
  data_sessao date,
  hora_sessao time,
  status text not null default 'nao_agendada'
    check (status in ('nao_agendada', 'agendada', 'executada', 'cancelada')),
  valor numeric(10,2),
  pago boolean not null default false,
  local_pagamento text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mentorias enable row level security;

create policy "Admins gerenciam mentorias"
  on public.mentorias for all using (current_user_is_admin());

create index on public.mentorias(tipo);
create index on public.mentorias(status);
create index on public.mentorias(data_sessao);
