-- =============================================
-- Assessoria: gestão de vagas, status geral, GMV/saúde e tipo/tarefas de sessão
-- =============================================

alter table public.assessorados
  add column if not exists numero_vaga integer check (numero_vaga between 1 and 7),
  add column if not exists loja text,
  add column if not exists segmento text,
  add column if not exists data_fim_prevista date,
  add column if not exists status text not null default 'ativo' check (status in ('ativo', 'pausado', 'encerrado', 'renovado')),
  add column if not exists gmv_atual numeric(12,2),
  add column if not exists saude_conta text not null default 'verde' check (saude_conta in ('verde', 'amarelo', 'vermelho'));

alter table public.sessoes_assessoria
  add column if not exists tipo text not null default 'individual' check (tipo in ('individual', 'grupo')),
  add column if not exists tarefas_passadas text,
  add column if not exists tarefas_anteriores_cumpridas text check (tarefas_anteriores_cumpridas in ('sim', 'parcial', 'nao'));

-- Amplia os status possíveis da sessão (era só agendada/realizada/cancelada)
alter table public.sessoes_assessoria drop constraint if exists sessoes_assessoria_status_check;
alter table public.sessoes_assessoria add constraint sessoes_assessoria_status_check
  check (status in ('agendada', 'realizada', 'remarcada', 'cancelada', 'no_show'));

create index if not exists idx_assessorados_status on public.assessorados(status);
create index if not exists idx_assessorados_numero_vaga on public.assessorados(numero_vaga);
