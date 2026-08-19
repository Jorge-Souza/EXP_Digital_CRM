import type { PilarId, SituationState, TrilhaSubtaskState, JornadaChecklist } from "./types"

export interface Situation {
  id: string
  label: string
  diag: string
  deliverable: string
}

export interface Pilar {
  id: PilarId
  label: string
  desc: string
  situations: Situation[]
}

export const PILLARS: Pilar[] = [
  {
    id: "estrutura",
    label: "Estrutura",
    desc: "Fundação técnica e operacional",
    situations: [
      { id: "sem_rp", label: "Sem ERP integrado", diag: "Não tem ERP conectado ao TikTok Shop — sem sincronização automática de produtos, estoque e emissão de nota fiscal.", deliverable: "Checklist de Integração de ERP — conectar Bling/Olist ao Seller Center, sincronizar produtos, estoque e nota fiscal." },
      { id: "sem_cert", label: "Sem certificado digital", diag: "CNPJ aberto, mas sem certificado digital comprado/instalado — trava a emissão de nota fiscal.", deliverable: "Comprar e instalar certificado digital — pré-requisito para nota fiscal e integração com ERP." },
      { id: "loja_nao_hab", label: "Loja não habilitada", diag: "Tem CNPJ mas ainda não concluiu a habilitação da loja na plataforma.", deliverable: "Checklist de Habilitação da Loja — etapas dentro do Seller Center." },
      { id: "preco", label: "Loja habilitada, problema de precificação", diag: "Loja ativa, mas margem, frete e comissão não estão calculados corretamente.", deliverable: "Guia de Precificação e Margem — validar tabela de precificação com planilha + cenários." },
      { id: "decisao_estrutura", label: "Decisão de abrir loja física / contratar equipe", diag: "Negócio em ponto de decisão estrutural sobre investimento e time.", deliverable: "Plano de Decisão e Estrutura de Time — cenários, custos e cronograma." },
      { id: "sem_resp_conteudo", label: "Sem responsável interno para conteúdo e live shop", diag: "Ninguém do time está designado para gravar conteúdo e conduzir as lives.", deliverable: "Selecionar uma pessoa para fazer conteúdo e live shop internamente — definir papel e rotina." },
      { id: "sem_resp_logistica", label: "Sem responsável interno para logística", diag: "Ninguém do time está designado para embalar e despachar os pedidos.", deliverable: "Selecionar operador para embalar e despachar produtos internamente." },
      { id: "equip", label: "Equipamentos inadequados", diag: "Falta ring light, microfone e celular compatíveis com o padrão de produção.", deliverable: "Checklist de Equipamentos de Gravação — lista mínima e recomendada." },
      { id: "ambiente", label: "Sem ambientação física", diag: "Não tem espaço estruturado para lives/conteúdo (showroom ou vitrine).", deliverable: "Guia de Ambientação de Espaço TikTok Shop — layout e montagem." },
      { id: "rotina_operacional", label: "Loja habilitada, sem rotina de crescimento/atendimento", diag: "Não usa as missões de crescimento da plataforma nem tem checagem diária de atendimento.", deliverable: "Rotina Operacional — habilitar tarefas de Marketing > Crescimento (cupons) + checagem diária de pedidos e devoluções." },
    ],
  },
  {
    id: "exposicao",
    label: "Exposição",
    desc: "Conteúdo, presença e relacionamento",
    situations: [
      { id: "sem_conteudo", label: "Sem planejamento de conteúdo", diag: "Não produz conteúdo de relacionamento, autoridade, dúvidas ou antecipação de live.", deliverable: "Planejador Semanal de Conteúdo — pauta por formato e objetivo." },
      { id: "sem_lives", label: "Sem cronograma de lives", diag: "Faz lives sem regularidade nem calendário definido.", deliverable: "Cronograma Semanal de Lives — dias, horários e temas fixos." },
      { id: "sem_promo", label: "Não usa promoções nativas da plataforma", diag: "Loja pronta, mas sem cupom, desconto no produto, promoção relâmpago ou kit promocional ativos.", deliverable: "Guia de Ativação de Promoções — cupom, desconto no produto, promoção relâmpago do vendedor, kit promocional." },
      { id: "iniciar_afiliados", label: "Precisa iniciar afiliados", diag: "Loja pronta para vender, mas sem tração de afiliados na plataforma.", deliverable: "Guia de Ativação de Afiliados — comissionamento, briefing e abertura de vagas." },
      { id: "influ_interno", label: "Precisa formar criadores internos (equipe)", diag: "Precisa formar atendentes/colaboradores como criadores de conteúdo da própria marca.", deliverable: "Plano de Contratação e Formação de Time Interno — vaga, trilha e rotina." },
      { id: "influ_externo", label: "Precisa organizar criadores externos (comunidade)", diag: "Precisa captar e organizar criadores externos via grupo/comunidade.", deliverable: "Guia de Criação de Comunidade de Afiliados — criar grupo com afiliados, textos de comunicação com afiliados e imagens de ranking." },
      { id: "oportunidade_campanha", label: "Não disponibiliza oportunidades de campanha", diag: "Produtos não estão abertos para as campanhas comerciais/co-financiadas que a plataforma oferece.", deliverable: "Disponibilizar oportunidade de campanha — abrir produtos para as campanhas em Marketing > Campanhas." },
    ],
  },
  {
    id: "expansao",
    label: "Expansão",
    desc: "Escala, investimento e crescimento",
    situations: [
      { id: "escalar_afiliados", label: "Pronto para escalar afiliados", diag: "Programa de afiliados validado, precisa crescer volume e diversificar perfis.", deliverable: "Plano de Escala de Afiliados — metas, funil de recrutamento e ranking." },
      { id: "expandir_catalogo", label: "Pronto para expandir catálogo", diag: "Operação estável, espaço para novas categorias/SKUs.", deliverable: "Plano de Expansão de Catálogo — priorização de produtos e teste de mercado." },
      { id: "trafego_pago", label: "Pronto para tráfego pago", diag: "Base orgânica consolidada, pronta para investir em mídia paga na plataforma.", deliverable: "Plano de Mídia Paga TikTok Shop (GMV Max) — trackeamento, verba inicial e metas de ROAS." },
    ],
  },
]

export interface TrilhaSubtask {
  id: string
  label: string
}

export interface TrilhaTask {
  id: string
  label: string
  subtasks: TrilhaSubtask[]
}

export interface TrilhaEtapa {
  id: string
  label: string
  subtitle: string
  duration: string
  reward: string | null
  tasks: TrilhaTask[]
}

export const TRILHA: TrilhaEtapa[] = [
  {
    id: "etapa1",
    label: "Etapa 1",
    subtitle: "Começar a Vender",
    duration: "5 dias",
    reward: "Até R$ 2.400 em cupons de desconto · sessões de suporte · 0% de comissão por 60 dias",
    tasks: [
      {
        id: "t1_ofertas", label: "Cadastro e Ofertas", subtasks: [
          { id: "produtos10", label: "Cadastrar pelo menos 10 produtos" },
          { id: "promo5", label: "Colocar promoção em 5 produtos" },
          { id: "cupom1", label: "Criar 1 cupom (10 unidades)" },
          { id: "relampago1", label: "Ativar 1 oferta relâmpago" },
        ],
      },
      {
        id: "t2_conteudo", label: "Começar a Ter Conteúdo", subtasks: [
          { id: "amostra_top3", label: "Garantir amostra grátis nos top 3 produtos" },
          { id: "amostra_reemb", label: "Garantir amostra reembolsável em 3 produtos" },
          { id: "live30", label: "Fazer 1 live (mínimo 30 min)" },
          { id: "video3", label: "Postar 3 vídeos com link do produto" },
        ],
      },
      {
        id: "t3_afiliados", label: "Ativar Afiliados (essencial)", subtasks: [
          { id: "colab_aberta", label: "Colocar TODOS os produtos em colaboração aberta (comissão acima de 10%)" },
          { id: "amostras30", label: "Enviar no mínimo 30 amostras grátis de um mesmo produto para criadores diversos" },
        ],
      },
    ],
  },
  {
    id: "etapa2",
    label: "Etapa 2",
    subtitle: "Escalar Vendas",
    duration: "60 dias",
    reward: null,
    tasks: [
      {
        id: "t1_afiliados", label: "Manter Afiliados Ativos (essencial)", subtasks: [
          { id: "colab_aberta_manter", label: "Manter TODOS os produtos em colaboração aberta (comissão acima de 10%)" },
          { id: "amostras30_manter", label: "Enviar no mínimo 30 amostras grátis de um mesmo produto para criadores diversos" },
        ],
      },
      {
        id: "t2_escalar", label: "Escalar Conteúdo", subtasks: [
          { id: "video14", label: "Postar 14 vídeos com link do produto" },
          { id: "live20h", label: "Fazer lives (mínimo 20h no total, acumulado)" },
        ],
      },
      {
        id: "t3_ads_account", label: "Preparar Estrutura de Tráfego Pago", subtasks: [
          { id: "tt_business", label: "Criar uma conta no TikTok for Business (ferramenta de ads dentro do TikTok)" },
        ],
      },
    ],
  },
  {
    id: "etapa3",
    label: "Etapa 3",
    subtitle: "Acelerar Vendas",
    duration: "90 dias",
    reward: null,
    tasks: [
      {
        id: "t1_criadores", label: "Escalar Criadores (máquina de conteúdo)", subtasks: [
          { id: "video1500", label: "Trabalhar com criadores ativos até chegar em alto volume de vídeos (1.500 vídeos)" },
          { id: "reforcar_top", label: "Reforçar relacionamento com os top criadores (mandar mais produtos)" },
        ],
      },
      {
        id: "t2_lives_intensidade", label: "Aumentar Intensidade de Lives", subtasks: [
          { id: "lives_frequentes", label: "Fazer lives frequentes" },
          { id: "lives40h", label: "Atingir 40 horas de lives no mês" },
        ],
      },
      {
        id: "t3_gmvmax", label: "Investir em Tráfego (GMV Max)", subtasks: [
          { id: "primeira_campanha", label: "Criar a primeira campanha para os produtos com mais conteúdo (mínimo 30 vídeos por produto)" },
          { id: "investimento2500", label: "Investimento inicial sugerido: R$ 2.500" },
          { id: "campanhas_comerciais", label: "Garantir participação nas campanhas comerciais — acompanhar em Marketing > Campanhas (oportunidades co-financiadas pelo TikTok)" },
        ],
      },
    ],
  },
]

export const DEFAULT_SITUATION_STATE = { active: false, sent: false, responsavel: null, prazo: null }
export const DEFAULT_SUBTASK_STATE = { done: false, responsavel: null, prazo: null }

export function upsertById<T extends { id: string }>(arr: T[], id: string, patch: Partial<T>, defaults: Omit<T, "id">): T[] {
  const idx = arr.findIndex((item) => item.id === id)
  if (idx === -1) return [...arr, { id, ...defaults, ...patch } as T]
  const next = [...arr]
  next[idx] = { ...next[idx], ...patch }
  return next
}

export type MergedSituation = Situation & SituationState & { pilarId: PilarId; pilarLabel: string }

export function mergeSituations(situations: SituationState[]): Record<PilarId, MergedSituation[]> {
  const byId = new Map(situations.map((s) => [s.id, s]))
  const result = {} as Record<PilarId, MergedSituation[]>
  for (const pilar of PILLARS) {
    result[pilar.id] = pilar.situations.map((sit) => ({
      ...sit,
      ...(byId.get(sit.id) ?? { id: sit.id, ...DEFAULT_SITUATION_STATE }),
      pilarId: pilar.id,
      pilarLabel: pilar.label,
    }))
  }
  return result
}

export type MergedTrilhaEtapa = Omit<TrilhaEtapa, "tasks"> & {
  tasks: (Omit<TrilhaTask, "subtasks"> & { subtasks: (TrilhaSubtask & TrilhaSubtaskState)[] })[]
}

export function mergeTrilha(trilha: TrilhaSubtaskState[]): MergedTrilhaEtapa[] {
  const byId = new Map(trilha.map((s) => [s.id, s]))
  return TRILHA.map((etapa) => ({
    ...etapa,
    tasks: etapa.tasks.map((task) => ({
      ...task,
      subtasks: task.subtasks.map((sub) => ({
        ...sub,
        ...(byId.get(sub.id) ?? { id: sub.id, ...DEFAULT_SUBTASK_STATE }),
      })),
    })),
  }))
}

export function buildProximosPassosText(data: JornadaChecklist, clienteNome: string): string {
  const linhas: string[] = []

  const merged = mergeSituations(data.situations)
  for (const pilar of PILLARS) {
    for (const sit of merged[pilar.id]) {
      if (sit.active && !sit.sent) {
        const detalhes = [sit.responsavel && `Responsável: ${sit.responsavel}`, sit.prazo && `Prazo: ${sit.prazo}`].filter(Boolean).join(" · ")
        linhas.push(`[${pilar.label}] ${sit.deliverable}${detalhes ? ` (${detalhes})` : ""}`)
      }
    }
  }

  for (const etapa of mergeTrilha(data.trilha)) {
    for (const task of etapa.tasks) {
      for (const sub of task.subtasks) {
        if (!sub.done) {
          const detalhes = [sub.responsavel && `Responsável: ${sub.responsavel}`, sub.prazo && `Prazo: ${sub.prazo}`].filter(Boolean).join(" · ")
          linhas.push(`[${etapa.label}] ${sub.label}${detalhes ? ` (${detalhes})` : ""}`)
        }
      }
    }
  }

  for (const t of data.custom_tasks) {
    if (!t.done) {
      const detalhes = [t.responsavel && `Responsável: ${t.responsavel}`, t.prazo && `Prazo: ${t.prazo}`].filter(Boolean).join(" · ")
      linhas.push(`[${t.tag ?? "Geral"}] ${t.text}${detalhes ? ` (${detalhes})` : ""}`)
    }
  }

  const header = `Próximos passos — ${clienteNome}`
  return linhas.length ? `${header}\n\n${linhas.map((l, i) => `${i + 1}. ${l}`).join("\n")}` : `${header}\n\nNenhum entregável pendente no momento.`
}
