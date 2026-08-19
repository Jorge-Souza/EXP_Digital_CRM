


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."current_user_is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "row_security" TO 'off'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;


ALTER FUNCTION "public"."current_user_is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_user_is_vendas"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "row_security" TO 'off'
    AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'vendas');
$$;


ALTER FUNCTION "public"."current_user_is_vendas"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, nome, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)), new.email);
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_post_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  client_nome TEXT;
  notif_titulo TEXT;
  notif_mensagem TEXT;
  notif_link TEXT;
  admin_id UUID;
BEGIN
  SELECT nome INTO client_nome FROM public.clients WHERE id = NEW.client_id;
  notif_link := '/publicacoes';

  -- Post atribuído a um responsável
  IF NEW.responsavel_id IS NOT NULL
    AND NEW.responsavel_id IS DISTINCT FROM OLD.responsavel_id
  THEN
    INSERT INTO public.notifications (user_id, titulo, mensagem, link)
    VALUES (
      NEW.responsavel_id,
      '📋 Nova publicação atribuída',
      '"' || NEW.titulo || '" (' || COALESCE(client_nome, '') || ') foi atribuída a você',
      notif_link
    );
  END IF;

  -- Mudança de status
  IF NEW.status IS DISTINCT FROM OLD.status THEN

    -- Notifica o responsável
    IF NEW.responsavel_id IS NOT NULL THEN
      notif_titulo := NULL;
      CASE NEW.status
        WHEN 'falta_insumo' THEN
          notif_titulo  := '⚠️ Falta insumo';
          notif_mensagem := '"' || NEW.titulo || '" (' || COALESCE(client_nome, '') || ') está aguardando insumo';
        WHEN 'aprovado' THEN
          notif_titulo  := '✅ Pronto para aprovação';
          notif_mensagem := '"' || NEW.titulo || '" (' || COALESCE(client_nome, '') || ') aguarda aprovação do cliente';
        WHEN 'publicado' THEN
          notif_titulo  := '🎉 Post publicado!';
          notif_mensagem := '"' || NEW.titulo || '" (' || COALESCE(client_nome, '') || ') foi publicado com sucesso';
        ELSE NULL;
      END CASE;

      IF notif_titulo IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, titulo, mensagem, link)
        VALUES (NEW.responsavel_id, notif_titulo, notif_mensagem, notif_link);
      END IF;
    END IF;

    -- Notifica todos os admins em eventos críticos (sem duplicar para o responsável)
    IF NEW.status IN ('falta_insumo', 'aprovado') THEN
      CASE NEW.status
        WHEN 'falta_insumo' THEN
          notif_titulo   := '⚠️ Falta insumo';
          notif_mensagem := '"' || NEW.titulo || '" (' || COALESCE(client_nome, '') || ') precisa de insumo';
        WHEN 'aprovado' THEN
          notif_titulo   := '✅ Post para aprovação de cliente';
          notif_mensagem := '"' || NEW.titulo || '" (' || COALESCE(client_nome, '') || ') aguarda aprovação';
      END CASE;

      FOR admin_id IN
        SELECT id FROM public.profiles WHERE role = 'admin'
      LOOP
        IF admin_id IS DISTINCT FROM NEW.responsavel_id THEN
          INSERT INTO public.notifications (user_id, titulo, mensagem, link)
          VALUES (admin_id, notif_titulo, notif_mensagem, notif_link);
        END IF;
      END LOOP;
    END IF;

  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_post_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_responsavel_post"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_cliente_nome text;
BEGIN
  IF new.responsavel_id IS NOT NULL AND (
    old.responsavel_id IS NULL OR old.responsavel_id != new.responsavel_id
  ) THEN
    SELECT nome INTO v_cliente_nome FROM public.clients WHERE id = new.client_id;

    INSERT INTO public.notifications (user_id, titulo, mensagem, link)
    VALUES (
      new.responsavel_id,
      '📋 Nova publicação atribuída',
      'Você é o responsável por "' || new.titulo || '" — ' || COALESCE(v_cliente_nome, 'Cliente'),
      '/clientes/' || new.client_id || '/projeto'
    );
  END IF;
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."notify_responsavel_post"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recalcular_score_comercial"("p_aluno_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "row_security" TO 'off'
    AS $$
DECLARE
  v_interacoes integer;
  v_peso_etapa integer;
BEGIN
  SELECT count(*) INTO v_interacoes FROM interacoes_comerciais WHERE aluno_id = p_aluno_id;
  SELECT array_position(
    ARRAY['novo_lead','engajou_instagram','capturado_whatsapp','diagnostico_feito',
          'oferta_curso','oferta_sos','oferta_mentoria','oferta_assessoria','venda','nutricao','perdido'],
    etapa_pipeline
  ) INTO v_peso_etapa FROM alunos WHERE id = p_aluno_id;

  UPDATE alunos SET score_comercial = (v_interacoes * 5) + (coalesce(v_peso_etapa, 1) * 10)
  WHERE id = p_aluno_id;
END;
$$;


ALTER FUNCTION "public"."recalcular_score_comercial"("p_aluno_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."touch_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;


ALTER FUNCTION "public"."touch_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_recalcular_score_interacao"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  PERFORM recalcular_score_comercial(NEW.aluno_id);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trg_recalcular_score_interacao"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."academy_temas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "numero" integer NOT NULL,
    "titulo" "text" NOT NULL,
    "descricao" "text",
    "categoria" "text" DEFAULT 'operacao'::"text" NOT NULL,
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "academy_temas_categoria_check" CHECK (("categoria" = ANY (ARRAY['preparacao'::"text", 'vendas'::"text", 'operacao'::"text", 'conteudo'::"text", 'engajamento'::"text"]))),
    CONSTRAINT "academy_temas_numero_check" CHECK ((("numero" >= 1) AND ("numero" <= 12)))
);


ALTER TABLE "public"."academy_temas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."alunos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" "text" NOT NULL,
    "email" "text" NOT NULL,
    "telefone" "text",
    "kiwify_customer_id" "text",
    "etapa" "text" DEFAULT 'lead'::"text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "score" integer DEFAULT 0,
    "score_label" "text" DEFAULT 'sem_dados'::"text",
    "whatsapp" "text",
    "instagram" "text",
    "tem_formulario" boolean DEFAULT false,
    "etapa_pipeline" "text" DEFAULT 'novo_lead'::"text",
    "origem" "text" DEFAULT 'outro'::"text",
    "tipo_lead" "text",
    "score_comercial" integer DEFAULT 0,
    "proxima_melhor_oferta" "text",
    "responsavel_id" "uuid",
    "organization_id" "uuid",
    CONSTRAINT "alunos_etapa_check" CHECK (("etapa" = ANY (ARRAY['lead'::"text", 'entrada'::"text", 'core'::"text", 'avancado'::"text"]))),
    CONSTRAINT "alunos_etapa_pipeline_check" CHECK (("etapa_pipeline" = ANY (ARRAY['novo_lead'::"text", 'engajou_instagram'::"text", 'capturado_whatsapp'::"text", 'diagnostico_feito'::"text", 'oferta_curso'::"text", 'oferta_sos'::"text", 'oferta_mentoria'::"text", 'oferta_assessoria'::"text", 'venda'::"text", 'nutricao'::"text", 'perdido'::"text"]))),
    CONSTRAINT "alunos_origem_check" CHECK (("origem" = ANY (ARRAY['kiwify_compra'::"text", 'kiwify_carrinho'::"text", 'instagram'::"text", 'whatsapp'::"text", 'formulario'::"text", 'outro'::"text"]))),
    CONSTRAINT "alunos_score_label_check" CHECK (("score_label" = ANY (ARRAY['quente'::"text", 'morno'::"text", 'frio'::"text", 'sem_dados'::"text"]))),
    CONSTRAINT "alunos_tipo_lead_check" CHECK (("tipo_lead" = ANY (ARRAY['lead_instagram'::"text", 'carrinho_abandonado'::"text", 'aluno_gratuito'::"text", 'comprador_curso'::"text", 'comprador_sos'::"text", 'interessado_mentoria'::"text", 'interessado_assessoria'::"text"])))
);


ALTER TABLE "public"."alunos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."assessorados" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nome" "text" NOT NULL,
    "email" "text",
    "telefone" "text",
    "data_contratacao" "date" DEFAULT CURRENT_DATE NOT NULL,
    "valor_assessoria" numeric(10,2),
    "observacoes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status_estrutura" "text" DEFAULT 'nao_iniciado'::"text" NOT NULL,
    "status_exposicao" "text" DEFAULT 'nao_iniciado'::"text" NOT NULL,
    "status_expansao" "text" DEFAULT 'nao_iniciado'::"text" NOT NULL,
    "notas_jornada" "text",
    "numero_vaga" integer,
    "loja" "text",
    "segmento" "text",
    "data_fim_prevista" "date",
    "status" "text" DEFAULT 'ativo'::"text" NOT NULL,
    "gmv_atual" numeric(12,2),
    "saude_conta" "text" DEFAULT 'verde'::"text" NOT NULL,
    CONSTRAINT "assessorados_numero_vaga_check" CHECK ((("numero_vaga" >= 1) AND ("numero_vaga" <= 7))),
    CONSTRAINT "assessorados_saude_conta_check" CHECK (("saude_conta" = ANY (ARRAY['verde'::"text", 'amarelo'::"text", 'vermelho'::"text"]))),
    CONSTRAINT "assessorados_status_check" CHECK (("status" = ANY (ARRAY['ativo'::"text", 'pausado'::"text", 'encerrado'::"text", 'renovado'::"text"]))),
    CONSTRAINT "assessorados_status_estrutura_check" CHECK (("status_estrutura" = ANY (ARRAY['nao_iniciado'::"text", 'em_andamento'::"text", 'concluido'::"text"]))),
    CONSTRAINT "assessorados_status_expansao_check" CHECK (("status_expansao" = ANY (ARRAY['nao_iniciado'::"text", 'em_andamento'::"text", 'concluido'::"text"]))),
    CONSTRAINT "assessorados_status_exposicao_check" CHECK (("status_exposicao" = ANY (ARRAY['nao_iniciado'::"text", 'em_andamento'::"text", 'concluido'::"text"])))
);


ALTER TABLE "public"."assessorados" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."assessoria_lojas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "assessorado_id" "uuid" NOT NULL,
    "label" "text" DEFAULT 'Loja principal'::"text" NOT NULL,
    "link" "text",
    "situations" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "trilha" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "custom_tasks" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."assessoria_lojas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."carrinhos_abandonados" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "aluno_id" "uuid",
    "produto_id" "uuid",
    "kiwify_checkout_id" "text",
    "data_abandono" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'novo'::"text",
    "proximo_followup" "date",
    "responsavel" "text",
    "observacoes" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "carrinhos_abandonados_status_check" CHECK (("status" = ANY (ARRAY['novo'::"text", 'em_contato'::"text", 'recuperado'::"text", 'perdido'::"text"])))
);


ALTER TABLE "public"."carrinhos_abandonados" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nome" "text" NOT NULL,
    "nicho" "text" DEFAULT ''::"text" NOT NULL,
    "contato_nome" "text" DEFAULT ''::"text" NOT NULL,
    "contato_email" "text" DEFAULT ''::"text" NOT NULL,
    "contato_telefone" "text" DEFAULT ''::"text" NOT NULL,
    "instagram" "text",
    "tiktok" "text",
    "briefing" "text",
    "drive_folder_url" "text",
    "posts_mensais" integer DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT 'ativo'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "objetivo" "text",
    "publico_alvo" "text",
    "tom_de_voz" "text",
    "servicos_contratados" "text",
    "diferenciais" "text",
    "observacoes" "text",
    "meta_posts_semana" integer DEFAULT 0,
    "persona" "text",
    "avatar_emoji" "text" DEFAULT '🏢'::"text" NOT NULL,
    "cor" "text" DEFAULT '#6366f1'::"text" NOT NULL,
    "servico" "text",
    "rede_social" "text",
    "ads" "text",
    "contrato_path" "text",
    "contrato_nome" "text",
    "contrato_inicio" "date",
    "contrato_duracao_meses" integer,
    "contrato_valor" numeric(10,2),
    CONSTRAINT "clients_status_check" CHECK (("status" = ANY (ARRAY['ativo'::"text", 'inativo'::"text", 'pausado'::"text"])))
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."compras_alunos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "aluno_id" "uuid",
    "produto_id" "uuid",
    "status" "text" DEFAULT 'ativo'::"text",
    "kiwify_order_id" "text",
    "valor" numeric(10,2),
    "data_compra" timestamp with time zone DEFAULT "now"(),
    "payment_method" "text",
    "utm_source" "text",
    "utm_medium" "text",
    "valor_bruto" numeric(10,2),
    "valor_liquido" numeric(10,2),
    "taxa_gateway" numeric(10,2),
    "valor_afiliado" numeric(10,2),
    "imposto" numeric(10,2),
    "payment_approved_at" timestamp with time zone,
    "utm_campaign" "text",
    CONSTRAINT "compras_alunos_status_check" CHECK (("status" = ANY (ARRAY['ativo'::"text", 'reembolsado'::"text", 'chargeback'::"text"])))
);


ALTER TABLE "public"."compras_alunos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conteudo_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid",
    "dia" integer NOT NULL,
    "semana" integer NOT NULL,
    "horario" "text" NOT NULL,
    "formato" "text" NOT NULL,
    "categoria" "text" NOT NULL,
    "titulo" "text" NOT NULL,
    "roteiro" "text",
    "direcao" "text",
    "cta_legenda" "text",
    "dados_apoio" "text",
    "status" "text" DEFAULT 'pendente'::"text" NOT NULL,
    "data_publicacao" "date",
    "notas" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "conteudo_posts_dia_check" CHECK ((("dia" >= 1) AND ("dia" <= 30))),
    CONSTRAINT "conteudo_posts_formato_check" CHECK (("formato" = ANY (ARRAY['reel'::"text", 'carrossel'::"text"]))),
    CONSTRAINT "conteudo_posts_horario_check" CHECK (("horario" = ANY (ARRAY['manha'::"text", 'noite'::"text"]))),
    CONSTRAINT "conteudo_posts_semana_check" CHECK ((("semana" >= 1) AND ("semana" <= 5))),
    CONSTRAINT "conteudo_posts_status_check" CHECK (("status" = ANY (ARRAY['pendente'::"text", 'gravado'::"text", 'editado'::"text", 'publicado'::"text"])))
);


ALTER TABLE "public"."conteudo_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contrato_servicos_adicionais" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "descricao" "text" NOT NULL,
    "valor" numeric(10,2) DEFAULT 0 NOT NULL,
    "data" "date",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."contrato_servicos_adicionais" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."demandas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "titulo" "text" NOT NULL,
    "descricao" "text",
    "status" "text" DEFAULT 'a_fazer'::"text" NOT NULL,
    "prioridade" "text" DEFAULT 'media'::"text" NOT NULL,
    "data_prazo" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."demandas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."google_calendar_tokens" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "access_token" "text" NOT NULL,
    "refresh_token" "text",
    "token_expiry" timestamp with time zone,
    "calendar_id" "text" DEFAULT 'primary'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."google_calendar_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."habilitacoes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "email" "text" NOT NULL,
    "termos_aceitos_at" timestamp with time zone,
    "aceito_privacidade" boolean DEFAULT false,
    "aceito_uso_imagem" boolean DEFAULT false,
    "aceito_divulgacao" boolean DEFAULT false,
    "nome_empresa" "text",
    "cnpj" "text",
    "data_constituicao" "text",
    "endereco_comercial" "text",
    "cnpj_doc_url" "text",
    "rep_nome" "text",
    "rep_data_nascimento" "text",
    "rep_nacionalidade" "text",
    "rep_endereco" "text",
    "rep_comprovante_url" "text",
    "inscricao_estadual" "text",
    "nicho" "text",
    "subnicho" "text",
    "certificado_url" "text",
    "senha_certificado" "text",
    "produtos" "jsonb" DEFAULT '[]'::"jsonb",
    "status" "text" DEFAULT 'rascunho'::"text",
    "etapa_atual" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "tipo_documento" "text",
    "doc_frente_url" "text",
    "selfie_url" "text",
    "selfie_doc_url" "text",
    "ja_habilitou_loja" boolean DEFAULT false,
    "etapa1_pulada" boolean DEFAULT false
);


ALTER TABLE "public"."habilitacoes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interacoes_carrinho" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "carrinho_id" "uuid",
    "data" timestamp with time zone DEFAULT "now"(),
    "canal" "text",
    "resumo" "text",
    "proximo_passo" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "interacoes_carrinho_canal_check" CHECK (("canal" = ANY (ARRAY['whatsapp'::"text", 'ligacao'::"text", 'dm_instagram'::"text", 'email'::"text"])))
);


ALTER TABLE "public"."interacoes_carrinho" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interacoes_comerciais" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "aluno_id" "uuid",
    "tipo" "text",
    "resumo" "text",
    "proximo_passo" "text",
    "autor_id" "uuid",
    "data" timestamp with time zone DEFAULT "now"(),
    "organization_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "interacoes_comerciais_tipo_check" CHECK (("tipo" = ANY (ARRAY['comentario_instagram'::"text", 'direct_instagram'::"text", 'whatsapp'::"text", 'ligacao'::"text", 'reuniao'::"text", 'compra'::"text", 'carrinho_abandonado'::"text"])))
);


ALTER TABLE "public"."interacoes_comerciais" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."marketing_iniciativas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "titulo" "text" NOT NULL,
    "descricao" "text",
    "tipo" "text" DEFAULT 'acao'::"text" NOT NULL,
    "status" "text" DEFAULT 'ideia'::"text" NOT NULL,
    "prioridade" "text" DEFAULT 'media'::"text" NOT NULL,
    "data_inicio" "date",
    "data_fim" "date",
    "meta" "text",
    "resultado" "text",
    "notas" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "tema_id" "uuid",
    "publico" "text" DEFAULT 'ambos'::"text",
    "checklist" "jsonb" DEFAULT '[]'::"jsonb",
    CONSTRAINT "marketing_iniciativas_prioridade_check" CHECK (("prioridade" = ANY (ARRAY['alta'::"text", 'media'::"text", 'baixa'::"text"]))),
    CONSTRAINT "marketing_iniciativas_publico_check" CHECK (("publico" = ANY (ARRAY['comunidade_aberta'::"text", 'alunos'::"text", 'ambos'::"text"]))),
    CONSTRAINT "marketing_iniciativas_status_check" CHECK (("status" = ANY (ARRAY['ideia'::"text", 'planejando'::"text", 'em_execucao'::"text", 'concluido'::"text", 'pausado'::"text"]))),
    CONSTRAINT "marketing_iniciativas_tipo_check" CHECK (("tipo" = ANY (ARRAY['lancamento'::"text", 'campanha'::"text", 'conteudo'::"text", 'live'::"text", 'parceria'::"text", 'acao'::"text"])))
);


ALTER TABLE "public"."marketing_iniciativas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mentorias" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tipo" "text" DEFAULT 'SOS TikTok Shop'::"text" NOT NULL,
    "cliente_nome" "text" NOT NULL,
    "cliente_telefone" "text",
    "cliente_whatsapp" "text",
    "data_sessao" "date",
    "hora_sessao" time without time zone,
    "status" "text" DEFAULT 'nao_agendada'::"text" NOT NULL,
    "valor" numeric(10,2),
    "pago" boolean DEFAULT false NOT NULL,
    "local_pagamento" "text",
    "observacoes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "mentorias_status_check" CHECK (("status" = ANY (ARRAY['nao_agendada'::"text", 'agendada'::"text", 'executada'::"text", 'cancelada'::"text"])))
);


ALTER TABLE "public"."mentorias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notas_alunos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "aluno_id" "uuid",
    "texto" "text" NOT NULL,
    "admin_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notas_alunos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "titulo" "text" NOT NULL,
    "mensagem" "text" NOT NULL,
    "link" "text",
    "lida" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "post_id" "uuid"
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ofertas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "aluno_id" "uuid",
    "produto_tipo" "text",
    "status" "text" DEFAULT 'sugerida'::"text",
    "valor" numeric(10,2),
    "criado_por" "uuid",
    "organization_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ofertas_produto_tipo_check" CHECK (("produto_tipo" = ANY (ARRAY['curso'::"text", 'sos'::"text", 'mentoria'::"text", 'assessoria'::"text"]))),
    CONSTRAINT "ofertas_status_check" CHECK (("status" = ANY (ARRAY['sugerida'::"text", 'enviada'::"text", 'aceita'::"text", 'recusada'::"text"])))
);


ALTER TABLE "public"."ofertas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."planejamentos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "mes" "text" NOT NULL,
    "objetivo_mes" "text",
    "sugestoes_acoes" "text",
    "referencias" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "datas_comemorativas" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "share_token" "text" DEFAULT "encode"("extensions"."gen_random_bytes"(16), 'hex'::"text") NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "riscos" "text",
    "oportunidades" "text"
);


ALTER TABLE "public"."planejamentos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "titulo" "text" NOT NULL,
    "tipo" "text" DEFAULT 'feed'::"text" NOT NULL,
    "status" "text" DEFAULT 'planejado'::"text" NOT NULL,
    "data_publicacao" "date",
    "drive_file_url" "text",
    "notas" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tema" "text",
    "plataforma" "text" DEFAULT 'instagram'::"text",
    "referencia_url" "text",
    "aprovado" boolean DEFAULT false NOT NULL,
    "responsavel_id" "uuid",
    CONSTRAINT "posts_plataforma_check" CHECK (("plataforma" = ANY (ARRAY['instagram'::"text", 'tiktok'::"text", 'ambos'::"text"]))),
    CONSTRAINT "posts_status_check" CHECK (("status" = ANY (ARRAY['planejado'::"text", 'a_fazer'::"text", 'falta_insumo'::"text", 'producao'::"text", 'aprovado_design'::"text", 'aprovado'::"text", 'agendado'::"text", 'publicado'::"text"]))),
    CONSTRAINT "posts_tipo_check" CHECK (("tipo" = ANY (ARRAY['feed'::"text", 'reels'::"text", 'story'::"text", 'tiktok'::"text", 'carrossel'::"text"])))
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."produtos_tiktok" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" "text" NOT NULL,
    "tipo" "text" NOT NULL,
    "preco" numeric(10,2),
    "kiwify_product_id" "text",
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "produtos_tiktok_tipo_check" CHECK (("tipo" = ANY (ARRAY['lowticket'::"text", 'core'::"text", 'mentoria'::"text", 'outro'::"text"])))
);


ALTER TABLE "public"."produtos_tiktok" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "nome" "text" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" DEFAULT 'profissional'::"text" NOT NULL,
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "telefone" "text",
    "endereco" "text",
    "data_admissao" "date",
    "status" "text" DEFAULT 'ativo'::"text",
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'profissional'::"text", 'vendas'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."referencias_laboratorio" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "plataforma" "text",
    "titulo" "text",
    "transcricao" "text",
    "sugestoes" "text",
    "status" "text" DEFAULT 'processando'::"text" NOT NULL,
    "erro" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."referencias_laboratorio" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."respostas_formulario" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "aluno_id" "uuid",
    "timestamp_resposta" timestamp with time zone,
    "nome" "text",
    "whatsapp" "text",
    "instagram" "text",
    "email" "text" NOT NULL,
    "ja_vende_plataforma" "text",
    "nicho" "text",
    "tipo_venda" "text",
    "faturamento" "text",
    "cria_videos" "text",
    "dificuldade_tiktok" "text",
    "dor_tiktok" "text",
    "nichos_que_vende" "text",
    "nivel_tecnico" "text",
    "executa_missoes" "text",
    "tempo_execucao" "text",
    "interesse_297" "text",
    "interesse_4500" "text",
    "mural_futuro" "text",
    "score" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."respostas_formulario" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sessoes_assessoria" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "assessorado_id" "uuid" NOT NULL,
    "data_sessao" timestamp with time zone NOT NULL,
    "duracao_minutos" integer DEFAULT 60 NOT NULL,
    "titulo" "text" DEFAULT 'Sessão de Assessoria'::"text" NOT NULL,
    "descricao" "text",
    "link_reuniao" "text",
    "google_event_id" "text",
    "google_event_link" "text",
    "status" "text" DEFAULT 'agendada'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "numero_sessao" integer,
    "pilar_foco" "text",
    "plano_de_acao" "text",
    "tipo" "text" DEFAULT 'individual'::"text" NOT NULL,
    "tarefas_passadas" "text",
    "tarefas_anteriores_cumpridas" "text",
    CONSTRAINT "sessoes_assessoria_numero_sessao_check" CHECK ((("numero_sessao" >= 1) AND ("numero_sessao" <= 6))),
    CONSTRAINT "sessoes_assessoria_pilar_foco_check" CHECK (("pilar_foco" = ANY (ARRAY['Estrutura'::"text", 'Exposição'::"text", 'Expansão'::"text", 'Geral'::"text"]))),
    CONSTRAINT "sessoes_assessoria_status_check" CHECK (("status" = ANY (ARRAY['agendada'::"text", 'realizada'::"text", 'remarcada'::"text", 'cancelada'::"text", 'no_show'::"text"]))),
    CONSTRAINT "sessoes_assessoria_tarefas_anteriores_cumpridas_check" CHECK (("tarefas_anteriores_cumpridas" = ANY (ARRAY['sim'::"text", 'parcial'::"text", 'nao'::"text"]))),
    CONSTRAINT "sessoes_assessoria_tipo_check" CHECK (("tipo" = ANY (ARRAY['individual'::"text", 'grupo'::"text"])))
);


ALTER TABLE "public"."sessoes_assessoria" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tarefas_sdr" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "aluno_id" "uuid",
    "titulo" "text" NOT NULL,
    "descricao" "text",
    "data_prazo" "date",
    "status" "text" DEFAULT 'pendente'::"text",
    "responsavel_id" "uuid",
    "organization_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "tarefas_sdr_status_check" CHECK (("status" = ANY (ARRAY['pendente'::"text", 'concluida'::"text", 'cancelada'::"text"])))
);


ALTER TABLE "public"."tarefas_sdr" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tiktok_assessoria_clientes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nome" "text" NOT NULL,
    "nicho" "text",
    "whatsapp" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tiktok_assessoria_clientes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tiktok_assessoria_lojas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "cliente_id" "uuid" NOT NULL,
    "label" "text" DEFAULT 'Loja 1'::"text" NOT NULL,
    "link" "text",
    "situations" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "trilha" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "custom_tasks" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tiktok_assessoria_lojas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tiktok_produtos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid",
    "nome" "text" NOT NULL,
    "descricao" "text",
    "sku" "text",
    "ncm" "text",
    "preco" numeric(10,2),
    "margem" numeric(5,2),
    "unidade" "text",
    "estoque" integer DEFAULT 0,
    "marca" "text",
    "comprimento" numeric,
    "largura" numeric,
    "altura" numeric,
    "peso" numeric,
    "nicho" "text",
    "subnicho" "text",
    "status" "text" DEFAULT 'rascunho'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tiktok_produtos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."videos_gerados" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "imagem_original_url" "text" NOT NULL,
    "video_url" "text",
    "higgsfield_job_id" "text",
    "prompt" "text" DEFAULT ''::"text" NOT NULL,
    "modelo" "text" DEFAULT 'dop-lite'::"text" NOT NULL,
    "aspecto" "text" DEFAULT '9:16'::"text" NOT NULL,
    "duracao" integer DEFAULT 5 NOT NULL,
    "creditos_usados" integer DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT 'processando'::"text" NOT NULL,
    "erro" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "videos_gerados_status_check" CHECK (("status" = ANY (ARRAY['processando'::"text", 'concluido'::"text", 'erro'::"text"])))
);


ALTER TABLE "public"."videos_gerados" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."webhook_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "detected" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."webhook_logs" OWNER TO "postgres";


ALTER TABLE ONLY "public"."academy_temas"
    ADD CONSTRAINT "academy_temas_numero_key" UNIQUE ("numero");



ALTER TABLE ONLY "public"."academy_temas"
    ADD CONSTRAINT "academy_temas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."alunos"
    ADD CONSTRAINT "alunos_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."alunos"
    ADD CONSTRAINT "alunos_kiwify_customer_id_key" UNIQUE ("kiwify_customer_id");



ALTER TABLE ONLY "public"."alunos"
    ADD CONSTRAINT "alunos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assessorados"
    ADD CONSTRAINT "assessorados_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assessoria_lojas"
    ADD CONSTRAINT "assessoria_lojas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."carrinhos_abandonados"
    ADD CONSTRAINT "carrinhos_abandonados_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compras_alunos"
    ADD CONSTRAINT "compras_alunos_kiwify_order_id_key" UNIQUE ("kiwify_order_id");



ALTER TABLE ONLY "public"."compras_alunos"
    ADD CONSTRAINT "compras_alunos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conteudo_posts"
    ADD CONSTRAINT "conteudo_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contrato_servicos_adicionais"
    ADD CONSTRAINT "contrato_servicos_adicionais_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."demandas"
    ADD CONSTRAINT "demandas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."google_calendar_tokens"
    ADD CONSTRAINT "google_calendar_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."google_calendar_tokens"
    ADD CONSTRAINT "google_calendar_tokens_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."habilitacoes"
    ADD CONSTRAINT "habilitacoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interacoes_carrinho"
    ADD CONSTRAINT "interacoes_carrinho_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interacoes_comerciais"
    ADD CONSTRAINT "interacoes_comerciais_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."marketing_iniciativas"
    ADD CONSTRAINT "marketing_iniciativas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mentorias"
    ADD CONSTRAINT "mentorias_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notas_alunos"
    ADD CONSTRAINT "notas_alunos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ofertas"
    ADD CONSTRAINT "ofertas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."planejamentos"
    ADD CONSTRAINT "planejamentos_client_id_mes_key" UNIQUE ("client_id", "mes");



ALTER TABLE ONLY "public"."planejamentos"
    ADD CONSTRAINT "planejamentos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."planejamentos"
    ADD CONSTRAINT "planejamentos_share_token_key" UNIQUE ("share_token");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."produtos_tiktok"
    ADD CONSTRAINT "produtos_tiktok_kiwify_product_id_key" UNIQUE ("kiwify_product_id");



ALTER TABLE ONLY "public"."produtos_tiktok"
    ADD CONSTRAINT "produtos_tiktok_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referencias_laboratorio"
    ADD CONSTRAINT "referencias_laboratorio_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."respostas_formulario"
    ADD CONSTRAINT "respostas_formulario_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."respostas_formulario"
    ADD CONSTRAINT "respostas_formulario_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessoes_assessoria"
    ADD CONSTRAINT "sessoes_assessoria_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tarefas_sdr"
    ADD CONSTRAINT "tarefas_sdr_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tiktok_assessoria_clientes"
    ADD CONSTRAINT "tiktok_assessoria_clientes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tiktok_assessoria_lojas"
    ADD CONSTRAINT "tiktok_assessoria_lojas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tiktok_produtos"
    ADD CONSTRAINT "tiktok_produtos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."videos_gerados"
    ADD CONSTRAINT "videos_gerados_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."webhook_logs"
    ADD CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id");



CREATE INDEX "conteudo_posts_client_dia" ON "public"."conteudo_posts" USING "btree" ("client_id", "dia");



CREATE INDEX "conteudo_posts_sem_cliente" ON "public"."conteudo_posts" USING "btree" ("dia") WHERE ("client_id" IS NULL);



CREATE INDEX "idx_assessorados_numero_vaga" ON "public"."assessorados" USING "btree" ("numero_vaga");



CREATE INDEX "idx_assessorados_status" ON "public"."assessorados" USING "btree" ("status");



CREATE INDEX "idx_assessoria_lojas_assessorado_id" ON "public"."assessoria_lojas" USING "btree" ("assessorado_id");



CREATE INDEX "idx_tiktok_assessoria_lojas_cliente_id" ON "public"."tiktok_assessoria_lojas" USING "btree" ("cliente_id");



CREATE INDEX "mentorias_data_sessao_idx" ON "public"."mentorias" USING "btree" ("data_sessao");



CREATE INDEX "mentorias_status_idx" ON "public"."mentorias" USING "btree" ("status");



CREATE INDEX "mentorias_tipo_idx" ON "public"."mentorias" USING "btree" ("tipo");



CREATE INDEX "sessoes_assessoria_assessorado_id_idx" ON "public"."sessoes_assessoria" USING "btree" ("assessorado_id");



CREATE INDEX "sessoes_assessoria_data_sessao_idx" ON "public"."sessoes_assessoria" USING "btree" ("data_sessao");



CREATE OR REPLACE TRIGGER "clients_updated_at" BEFORE UPDATE ON "public"."clients" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "habilitacoes_updated_at" BEFORE UPDATE ON "public"."habilitacoes" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "on_post_change" AFTER UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."notify_post_changes"();



CREATE OR REPLACE TRIGGER "on_post_responsavel_change" AFTER INSERT OR UPDATE OF "responsavel_id" ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."notify_responsavel_post"();



CREATE OR REPLACE TRIGGER "posts_updated_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "recalc_score_on_interacao" AFTER INSERT ON "public"."interacoes_comerciais" FOR EACH ROW EXECUTE FUNCTION "public"."trg_recalcular_score_interacao"();



ALTER TABLE ONLY "public"."alunos"
    ADD CONSTRAINT "alunos_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."assessoria_lojas"
    ADD CONSTRAINT "assessoria_lojas_assessorado_id_fkey" FOREIGN KEY ("assessorado_id") REFERENCES "public"."assessorados"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."carrinhos_abandonados"
    ADD CONSTRAINT "carrinhos_abandonados_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "public"."alunos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."carrinhos_abandonados"
    ADD CONSTRAINT "carrinhos_abandonados_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos_tiktok"("id");



ALTER TABLE ONLY "public"."compras_alunos"
    ADD CONSTRAINT "compras_alunos_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "public"."alunos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."compras_alunos"
    ADD CONSTRAINT "compras_alunos_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos_tiktok"("id");



ALTER TABLE ONLY "public"."conteudo_posts"
    ADD CONSTRAINT "conteudo_posts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contrato_servicos_adicionais"
    ADD CONSTRAINT "contrato_servicos_adicionais_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."google_calendar_tokens"
    ADD CONSTRAINT "google_calendar_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."habilitacoes"
    ADD CONSTRAINT "habilitacoes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interacoes_carrinho"
    ADD CONSTRAINT "interacoes_carrinho_carrinho_id_fkey" FOREIGN KEY ("carrinho_id") REFERENCES "public"."carrinhos_abandonados"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interacoes_comerciais"
    ADD CONSTRAINT "interacoes_comerciais_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "public"."alunos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interacoes_comerciais"
    ADD CONSTRAINT "interacoes_comerciais_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."marketing_iniciativas"
    ADD CONSTRAINT "marketing_iniciativas_tema_id_fkey" FOREIGN KEY ("tema_id") REFERENCES "public"."academy_temas"("id");



ALTER TABLE ONLY "public"."notas_alunos"
    ADD CONSTRAINT "notas_alunos_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."notas_alunos"
    ADD CONSTRAINT "notas_alunos_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "public"."alunos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ofertas"
    ADD CONSTRAINT "ofertas_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "public"."alunos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ofertas"
    ADD CONSTRAINT "ofertas_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."planejamentos"
    ADD CONSTRAINT "planejamentos_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referencias_laboratorio"
    ADD CONSTRAINT "referencias_laboratorio_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."respostas_formulario"
    ADD CONSTRAINT "respostas_formulario_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "public"."alunos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessoes_assessoria"
    ADD CONSTRAINT "sessoes_assessoria_assessorado_id_fkey" FOREIGN KEY ("assessorado_id") REFERENCES "public"."assessorados"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tarefas_sdr"
    ADD CONSTRAINT "tarefas_sdr_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "public"."alunos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tarefas_sdr"
    ADD CONSTRAINT "tarefas_sdr_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."tiktok_assessoria_lojas"
    ADD CONSTRAINT "tiktok_assessoria_lojas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."tiktok_assessoria_clientes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tiktok_produtos"
    ADD CONSTRAINT "tiktok_produtos_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."videos_gerados"
    ADD CONSTRAINT "videos_gerados_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin gerencia seus tokens" ON "public"."google_calendar_tokens" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Admins gerenciam assessorados" ON "public"."assessorados" USING ("public"."current_user_is_admin"());



CREATE POLICY "Admins gerenciam clientes de assessoria tiktok" ON "public"."tiktok_assessoria_clientes" USING ("public"."current_user_is_admin"());



CREATE POLICY "Admins gerenciam lojas de assessoria" ON "public"."assessoria_lojas" USING ("public"."current_user_is_admin"());



CREATE POLICY "Admins gerenciam lojas de assessoria tiktok" ON "public"."tiktok_assessoria_lojas" USING ("public"."current_user_is_admin"());



CREATE POLICY "Admins gerenciam mentorias" ON "public"."mentorias" USING ("public"."current_user_is_admin"());



CREATE POLICY "Admins gerenciam sessoes" ON "public"."sessoes_assessoria" USING ("public"."current_user_is_admin"());



CREATE POLICY "Admins leem todos os perfis" ON "public"."profiles" FOR SELECT USING (("public"."current_user_is_admin"() OR ("auth"."uid"() = "id")));



CREATE POLICY "Cliente atualiza própria habilitação" ON "public"."habilitacoes" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Cliente insere própria habilitação" ON "public"."habilitacoes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Cliente vê própria habilitação" ON "public"."habilitacoes" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuário atualiza próprias notificações" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuário lê próprias notificações" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários atualizam seus próprios perfis" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Usuários autenticados acessam clientes" ON "public"."clients" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados acessam laboratório" ON "public"."referencias_laboratorio" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários autenticados acessam posts" ON "public"."posts" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários veem seus próprios perfis" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Usuários veem suas próprias notificações" ON "public"."notifications" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."academy_temas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admin_all" ON "public"."demandas" USING (true) WITH CHECK (true);



CREATE POLICY "admin_gerencia_conteudo" ON "public"."conteudo_posts" USING ("public"."current_user_is_admin"());



CREATE POLICY "admin_gerencia_iniciativas" ON "public"."marketing_iniciativas" USING ("public"."current_user_is_admin"());



CREATE POLICY "admin_gerencia_temas" ON "public"."academy_temas" USING ("public"."current_user_is_admin"());



CREATE POLICY "admin_only" ON "public"."alunos" USING ("public"."current_user_is_admin"());



CREATE POLICY "admin_only" ON "public"."carrinhos_abandonados" USING ("public"."current_user_is_admin"());



CREATE POLICY "admin_only" ON "public"."compras_alunos" USING ("public"."current_user_is_admin"());



CREATE POLICY "admin_only" ON "public"."interacoes_carrinho" USING ("public"."current_user_is_admin"());



CREATE POLICY "admin_only" ON "public"."interacoes_comerciais" USING ("public"."current_user_is_admin"());



CREATE POLICY "admin_only" ON "public"."notas_alunos" USING ("public"."current_user_is_admin"());



CREATE POLICY "admin_only" ON "public"."ofertas" USING ("public"."current_user_is_admin"());



CREATE POLICY "admin_only" ON "public"."produtos_tiktok" USING ("public"."current_user_is_admin"());



CREATE POLICY "admin_only" ON "public"."respostas_formulario" USING ("public"."current_user_is_admin"());



CREATE POLICY "admin_only" ON "public"."tarefas_sdr" USING ("public"."current_user_is_admin"());



CREATE POLICY "admin_only" ON "public"."webhook_logs" USING ("public"."current_user_is_admin"());



CREATE POLICY "admin_only_insert" ON "public"."alunos" FOR INSERT WITH CHECK (true);



CREATE POLICY "admin_only_insert" ON "public"."carrinhos_abandonados" FOR INSERT WITH CHECK (true);



CREATE POLICY "admin_only_insert" ON "public"."compras_alunos" FOR INSERT WITH CHECK (true);



CREATE POLICY "admin_only_insert" ON "public"."interacoes_carrinho" FOR INSERT WITH CHECK ("public"."current_user_is_admin"());



CREATE POLICY "admin_only_insert" ON "public"."interacoes_comerciais" FOR INSERT WITH CHECK ("public"."current_user_is_admin"());



CREATE POLICY "admin_only_insert" ON "public"."notas_alunos" FOR INSERT WITH CHECK ("public"."current_user_is_admin"());



CREATE POLICY "admin_only_insert" ON "public"."ofertas" FOR INSERT WITH CHECK ("public"."current_user_is_admin"());



CREATE POLICY "admin_only_insert" ON "public"."produtos_tiktok" FOR INSERT WITH CHECK ("public"."current_user_is_admin"());



CREATE POLICY "admin_only_insert" ON "public"."respostas_formulario" FOR INSERT WITH CHECK (true);



CREATE POLICY "admin_only_insert" ON "public"."tarefas_sdr" FOR INSERT WITH CHECK ("public"."current_user_is_admin"());



CREATE POLICY "admin_only_insert" ON "public"."webhook_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "admin_only_update" ON "public"."alunos" FOR UPDATE USING (true);



CREATE POLICY "admin_only_update" ON "public"."compras_alunos" FOR UPDATE USING (true);



CREATE POLICY "admin_only_update" ON "public"."respostas_formulario" FOR UPDATE USING (true);



ALTER TABLE "public"."alunos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assessorados" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assessoria_lojas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "autenticados_podem_ver_conteudo" ON "public"."conteudo_posts" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "autenticados_veem_iniciativas" ON "public"."marketing_iniciativas" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "autenticados_veem_temas" ON "public"."academy_temas" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "auth users can manage servicos adicionais" ON "public"."contrato_servicos_adicionais" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "auth_manage_planejamentos" ON "public"."planejamentos" TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."carrinhos_abandonados" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compras_alunos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conteudo_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contrato_servicos_adicionais" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."demandas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."google_calendar_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."habilitacoes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interacoes_carrinho" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interacoes_comerciais" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."marketing_iniciativas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mentorias" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notas_alunos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ofertas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."planejamentos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."produtos_tiktok" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public_read_planejamentos" ON "public"."planejamentos" FOR SELECT TO "anon" USING (true);



ALTER TABLE "public"."referencias_laboratorio" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."respostas_formulario" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sessoes_assessoria" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tarefas_sdr" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tiktok_assessoria_clientes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tiktok_assessoria_lojas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tiktok_produtos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tiktok_produtos_admin_all" ON "public"."tiktok_produtos" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "tiktok_produtos_read" ON "public"."tiktok_produtos" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "usuarios atualizam seus videos" ON "public"."videos_gerados" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "usuarios inserem seus videos" ON "public"."videos_gerados" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "usuarios veem seus videos" ON "public"."videos_gerados" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "vendas_insert" ON "public"."interacoes_comerciais" FOR INSERT WITH CHECK ("public"."current_user_is_vendas"());



CREATE POLICY "vendas_insert" ON "public"."ofertas" FOR INSERT WITH CHECK ("public"."current_user_is_vendas"());



CREATE POLICY "vendas_insert" ON "public"."tarefas_sdr" FOR INSERT WITH CHECK ("public"."current_user_is_vendas"());



CREATE POLICY "vendas_insert_interacoes" ON "public"."interacoes_carrinho" FOR INSERT WITH CHECK ("public"."current_user_is_vendas"());



CREATE POLICY "vendas_select" ON "public"."alunos" FOR SELECT USING ("public"."current_user_is_vendas"());



CREATE POLICY "vendas_select" ON "public"."interacoes_comerciais" FOR SELECT USING ("public"."current_user_is_vendas"());



CREATE POLICY "vendas_select" ON "public"."ofertas" FOR SELECT USING ("public"."current_user_is_vendas"());



CREATE POLICY "vendas_select" ON "public"."tarefas_sdr" FOR SELECT USING ("public"."current_user_is_vendas"());



CREATE POLICY "vendas_select_carrinhos" ON "public"."carrinhos_abandonados" FOR SELECT USING ("public"."current_user_is_vendas"());



CREATE POLICY "vendas_select_interacoes" ON "public"."interacoes_carrinho" FOR SELECT USING ("public"."current_user_is_vendas"());



CREATE POLICY "vendas_update" ON "public"."ofertas" FOR UPDATE USING ("public"."current_user_is_vendas"());



CREATE POLICY "vendas_update" ON "public"."tarefas_sdr" FOR UPDATE USING ("public"."current_user_is_vendas"());



CREATE POLICY "vendas_update_carrinhos" ON "public"."carrinhos_abandonados" FOR UPDATE USING ("public"."current_user_is_vendas"());



CREATE POLICY "vendas_update_pipeline" ON "public"."alunos" FOR UPDATE USING ("public"."current_user_is_vendas"());



ALTER TABLE "public"."videos_gerados" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."webhook_logs" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."current_user_is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."current_user_is_vendas"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_is_vendas"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_is_vendas"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_post_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_post_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_post_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_responsavel_post"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_responsavel_post"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_responsavel_post"() TO "service_role";



GRANT ALL ON FUNCTION "public"."recalcular_score_comercial"("p_aluno_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."recalcular_score_comercial"("p_aluno_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."recalcular_score_comercial"("p_aluno_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."touch_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."touch_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."touch_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_recalcular_score_interacao"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_recalcular_score_interacao"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_recalcular_score_interacao"() TO "service_role";



GRANT ALL ON TABLE "public"."academy_temas" TO "anon";
GRANT ALL ON TABLE "public"."academy_temas" TO "authenticated";
GRANT ALL ON TABLE "public"."academy_temas" TO "service_role";



GRANT ALL ON TABLE "public"."alunos" TO "anon";
GRANT ALL ON TABLE "public"."alunos" TO "authenticated";
GRANT ALL ON TABLE "public"."alunos" TO "service_role";



GRANT ALL ON TABLE "public"."assessorados" TO "anon";
GRANT ALL ON TABLE "public"."assessorados" TO "authenticated";
GRANT ALL ON TABLE "public"."assessorados" TO "service_role";



GRANT ALL ON TABLE "public"."assessoria_lojas" TO "anon";
GRANT ALL ON TABLE "public"."assessoria_lojas" TO "authenticated";
GRANT ALL ON TABLE "public"."assessoria_lojas" TO "service_role";



GRANT ALL ON TABLE "public"."carrinhos_abandonados" TO "anon";
GRANT ALL ON TABLE "public"."carrinhos_abandonados" TO "authenticated";
GRANT ALL ON TABLE "public"."carrinhos_abandonados" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON TABLE "public"."compras_alunos" TO "anon";
GRANT ALL ON TABLE "public"."compras_alunos" TO "authenticated";
GRANT ALL ON TABLE "public"."compras_alunos" TO "service_role";



GRANT ALL ON TABLE "public"."conteudo_posts" TO "anon";
GRANT ALL ON TABLE "public"."conteudo_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."conteudo_posts" TO "service_role";



GRANT ALL ON TABLE "public"."contrato_servicos_adicionais" TO "anon";
GRANT ALL ON TABLE "public"."contrato_servicos_adicionais" TO "authenticated";
GRANT ALL ON TABLE "public"."contrato_servicos_adicionais" TO "service_role";



GRANT ALL ON TABLE "public"."demandas" TO "anon";
GRANT ALL ON TABLE "public"."demandas" TO "authenticated";
GRANT ALL ON TABLE "public"."demandas" TO "service_role";



GRANT ALL ON TABLE "public"."google_calendar_tokens" TO "anon";
GRANT ALL ON TABLE "public"."google_calendar_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."google_calendar_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."habilitacoes" TO "anon";
GRANT ALL ON TABLE "public"."habilitacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."habilitacoes" TO "service_role";



GRANT ALL ON TABLE "public"."interacoes_carrinho" TO "anon";
GRANT ALL ON TABLE "public"."interacoes_carrinho" TO "authenticated";
GRANT ALL ON TABLE "public"."interacoes_carrinho" TO "service_role";



GRANT ALL ON TABLE "public"."interacoes_comerciais" TO "anon";
GRANT ALL ON TABLE "public"."interacoes_comerciais" TO "authenticated";
GRANT ALL ON TABLE "public"."interacoes_comerciais" TO "service_role";



GRANT ALL ON TABLE "public"."marketing_iniciativas" TO "anon";
GRANT ALL ON TABLE "public"."marketing_iniciativas" TO "authenticated";
GRANT ALL ON TABLE "public"."marketing_iniciativas" TO "service_role";



GRANT ALL ON TABLE "public"."mentorias" TO "anon";
GRANT ALL ON TABLE "public"."mentorias" TO "authenticated";
GRANT ALL ON TABLE "public"."mentorias" TO "service_role";



GRANT ALL ON TABLE "public"."notas_alunos" TO "anon";
GRANT ALL ON TABLE "public"."notas_alunos" TO "authenticated";
GRANT ALL ON TABLE "public"."notas_alunos" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."ofertas" TO "anon";
GRANT ALL ON TABLE "public"."ofertas" TO "authenticated";
GRANT ALL ON TABLE "public"."ofertas" TO "service_role";



GRANT ALL ON TABLE "public"."planejamentos" TO "anon";
GRANT ALL ON TABLE "public"."planejamentos" TO "authenticated";
GRANT ALL ON TABLE "public"."planejamentos" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."produtos_tiktok" TO "anon";
GRANT ALL ON TABLE "public"."produtos_tiktok" TO "authenticated";
GRANT ALL ON TABLE "public"."produtos_tiktok" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."referencias_laboratorio" TO "anon";
GRANT ALL ON TABLE "public"."referencias_laboratorio" TO "authenticated";
GRANT ALL ON TABLE "public"."referencias_laboratorio" TO "service_role";



GRANT ALL ON TABLE "public"."respostas_formulario" TO "anon";
GRANT ALL ON TABLE "public"."respostas_formulario" TO "authenticated";
GRANT ALL ON TABLE "public"."respostas_formulario" TO "service_role";



GRANT ALL ON TABLE "public"."sessoes_assessoria" TO "anon";
GRANT ALL ON TABLE "public"."sessoes_assessoria" TO "authenticated";
GRANT ALL ON TABLE "public"."sessoes_assessoria" TO "service_role";



GRANT ALL ON TABLE "public"."tarefas_sdr" TO "anon";
GRANT ALL ON TABLE "public"."tarefas_sdr" TO "authenticated";
GRANT ALL ON TABLE "public"."tarefas_sdr" TO "service_role";



GRANT ALL ON TABLE "public"."tiktok_assessoria_clientes" TO "anon";
GRANT ALL ON TABLE "public"."tiktok_assessoria_clientes" TO "authenticated";
GRANT ALL ON TABLE "public"."tiktok_assessoria_clientes" TO "service_role";



GRANT ALL ON TABLE "public"."tiktok_assessoria_lojas" TO "anon";
GRANT ALL ON TABLE "public"."tiktok_assessoria_lojas" TO "authenticated";
GRANT ALL ON TABLE "public"."tiktok_assessoria_lojas" TO "service_role";



GRANT ALL ON TABLE "public"."tiktok_produtos" TO "anon";
GRANT ALL ON TABLE "public"."tiktok_produtos" TO "authenticated";
GRANT ALL ON TABLE "public"."tiktok_produtos" TO "service_role";



GRANT ALL ON TABLE "public"."videos_gerados" TO "anon";
GRANT ALL ON TABLE "public"."videos_gerados" TO "authenticated";
GRANT ALL ON TABLE "public"."videos_gerados" TO "service_role";



GRANT ALL ON TABLE "public"."webhook_logs" TO "anon";
GRANT ALL ON TABLE "public"."webhook_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_logs" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







