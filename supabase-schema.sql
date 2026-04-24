-- =============================================
-- EXP Digital CRM — Schema Supabase
-- Cole esse SQL no SQL Editor do Supabase
-- =============================================

-- Extensão para UUID
create extension if not exists "uuid-ossp";

-- =============================================
-- PROFILES (dados extras do usuário)
-- =============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nome text not null,
  email text not null,
  role text not null default 'profissional' check (role in ('admin', 'profissional')),
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Usuários veem seus próprios perfis"
  on public.profiles for select using (auth.uid() = id);

create policy "Admins veem todos os perfis"
  on public.profiles for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Usuários atualizam seus próprios perfis"
  on public.profiles for update using (auth.uid() = id);

-- Cria perfil automaticamente ao criar usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)), new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- CLIENTS
-- =============================================
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  nome text not null,
  nicho text not null default '',
  contato_nome text not null default '',
  contato_email text not null default '',
  contato_telefone text not null default '',
  instagram text,
  tiktok text,
  briefing text,
  drive_folder_url text,
  posts_mensais integer not null default 0,
  status text not null default 'ativo' check (status in ('ativo', 'inativo', 'pausado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "Usuários autenticados acessam clientes"
  on public.clients for all using (auth.role() = 'authenticated');

-- Atualiza updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- =============================================
-- POSTS / PUBLICAÇÕES
-- =============================================
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients on delete cascade not null,
  titulo text not null,
  tipo text not null default 'feed' check (tipo in ('feed', 'reels', 'story', 'tiktok', 'carrossel')),
  status text not null default 'planejado' check (status in ('planejado', 'producao', 'aprovado', 'publicado')),
  data_publicacao date,
  drive_file_url text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "Usuários autenticados acessam posts"
  on public.posts for all using (auth.role() = 'authenticated');

create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();
