-- Funde o checklist da Jornada (tiktok_assessoria_clientes/lojas) direto em assessorados.
-- Os campos status_estrutura/exposicao/expansao nunca eram editados por nenhuma tela
-- (sempre "nao_iniciado") e são substituídos pelo progresso real calculado a partir
-- de "situations". As tabelas tiktok_assessoria_clientes/tiktok_assessoria_lojas
-- permanecem como estão, só deixam de ser usadas pelo app.

alter table "public"."assessorados"
  add column "situations" jsonb not null default '[]'::jsonb,
  add column "trilha" jsonb not null default '[]'::jsonb,
  add column "custom_tasks" jsonb not null default '[]'::jsonb,
  add column "jornada_link" text;

alter table "public"."assessorados"
  drop column "status_estrutura",
  drop column "status_exposicao",
  drop column "status_expansao";
