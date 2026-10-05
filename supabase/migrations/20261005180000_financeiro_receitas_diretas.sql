-- Receitas diretas (Pix: SOS, Mentoria, Assessoria) e devoluções a clientes,
-- vindas dos extratos bancários. `ref` evita duplicar ao reimportar o mesmo extrato.

alter table public.financeiro_lancamentos drop constraint if exists financeiro_lancamentos_tipo_check;
alter table public.financeiro_lancamentos add constraint financeiro_lancamentos_tipo_check
  check (tipo in ('despesa','retirada','saque','receita','devolucao'));

alter table public.financeiro_lancamentos add column if not exists produto text;
alter table public.financeiro_lancamentos add column if not exists conta text check (conta in ('c6','picpay'));
alter table public.financeiro_lancamentos add column if not exists ref text;

create unique index if not exists financeiro_lancamentos_ref_uidx on public.financeiro_lancamentos (ref);
