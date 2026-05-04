-- =============================================
-- ASSESSORIA — Mentoria TikTok Shop
-- =============================================

-- Assessorados (quem contratou)
create table public.assessorados (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  email text,
  telefone text,
  data_contratacao date not null default current_date,
  valor_assessoria numeric(10,2),
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assessorados enable row level security;

create policy "Admins gerenciam assessorados"
  on public.assessorados for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Sessões de assessoria (agenda/encontros)
create table public.sessoes_assessoria (
  id uuid primary key default uuid_generate_v4(),
  assessorado_id uuid not null references public.assessorados(id) on delete cascade,
  data_sessao timestamptz not null,
  duracao_minutos int not null default 60,
  titulo text not null default 'Sessão de Assessoria',
  descricao text,
  link_reuniao text,
  google_event_id text,
  google_event_link text,
  status text not null default 'agendada' check (status in ('agendada', 'realizada', 'cancelada')),
  created_at timestamptz not null default now()
);

alter table public.sessoes_assessoria enable row level security;

create policy "Admins gerenciam sessoes"
  on public.sessoes_assessoria for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Tokens Google Calendar do admin
create table public.google_calendar_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  access_token text not null,
  refresh_token text,
  token_expiry timestamptz,
  calendar_id text not null default 'primary',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.google_calendar_tokens enable row level security;

create policy "Admin gerencia seus tokens"
  on public.google_calendar_tokens for all using (auth.uid() = user_id);

-- Índices
create index on public.sessoes_assessoria(assessorado_id);
create index on public.sessoes_assessoria(data_sessao);
