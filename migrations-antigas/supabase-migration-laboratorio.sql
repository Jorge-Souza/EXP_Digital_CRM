-- Laboratório de Produção de Conteúdo
create table if not exists public.referencias_laboratorio (
  id          uuid default gen_random_uuid() primary key,
  client_id   uuid not null references public.clients(id) on delete cascade,
  url         text not null,
  plataforma  text,       -- 'youtube' | 'instagram' | 'tiktok'
  titulo      text,
  transcricao text,
  sugestoes   text,       -- sugestões geradas pela IA (texto livre)
  status      text not null default 'processando', -- 'processando' | 'concluido' | 'erro'
  erro        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.referencias_laboratorio enable row level security;

create policy "Usuários autenticados acessam laboratório"
  on public.referencias_laboratorio for all
  using (auth.role() = 'authenticated');
