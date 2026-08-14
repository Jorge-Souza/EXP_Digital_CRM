-- =============================================
-- Migration: Assessoria Jornada Granular (Lojas / Diagnóstico por Pilar / Trilha / Tarefas)
-- =============================================

create table public.assessoria_lojas (
  id uuid primary key default uuid_generate_v4(),
  assessorado_id uuid not null references public.assessorados(id) on delete cascade,
  label text not null default 'Loja principal',
  link text,
  situations jsonb not null default '[]'::jsonb,
  trilha jsonb not null default '[]'::jsonb,
  custom_tasks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assessoria_lojas enable row level security;

create policy "Admins gerenciam lojas de assessoria"
  on public.assessoria_lojas for all using (current_user_is_admin());

create index if not exists idx_assessoria_lojas_assessorado_id on public.assessoria_lojas(assessorado_id);

-- FIM DA MIGRATION
