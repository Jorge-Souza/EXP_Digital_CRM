export type ClientStatus = 'ativo' | 'inativo' | 'pausado'

// --- Assessoria ---
export type SessaoStatus = 'agendada' | 'realizada' | 'cancelada'
export type PilarStatus = 'nao_iniciado' | 'em_andamento' | 'concluido'
export type PilarFoco = 'Estrutura' | 'Exposição' | 'Expansão' | 'Geral'

export interface Assessorado {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  data_contratacao: string
  valor_assessoria: number | null
  observacoes: string | null
  status_estrutura: PilarStatus
  status_exposicao: PilarStatus
  status_expansao: PilarStatus
  notas_jornada: string | null
  created_at: string
  updated_at: string
}

export interface SessaoAssessoria {
  id: string
  assessorado_id: string
  data_sessao: string
  duracao_minutos: number
  titulo: string
  descricao: string | null
  link_reuniao: string | null
  google_event_id: string | null
  google_event_link: string | null
  status: SessaoStatus
  numero_sessao: number | null
  pilar_foco: PilarFoco | null
  plano_de_acao: string | null
  created_at: string
}
export type ClientServico = 'social_media' | 'trafego_pago' | 'ambos'
export type ClientRedeSocial = 'instagram' | 'tiktok' | 'insta_tiktok' | 'youtube' | 'linkedin'
export type ClientAds = 'meta_ads' | 'google_ads' | 'meta_google' | 'tiktok_ads' | 'ambos'
export type PostStatus = 'planejado' | 'a_fazer' | 'falta_insumo' | 'producao' | 'aprovado_design' | 'aprovado' | 'agendado' | 'publicado'
export type PostType = 'feed' | 'reels' | 'story' | 'tiktok' | 'carrossel'
export type PostPlatform = 'instagram' | 'tiktok' | 'ambos'
export type UserRole = 'admin' | 'profissional'

export interface Client {
  id: string
  nome: string
  nicho: string
  contato_nome: string
  contato_email: string
  contato_telefone: string
  instagram: string | null
  tiktok: string | null
  briefing: string | null
  objetivo: string | null
  publico_alvo: string | null
  tom_de_voz: string | null
  servicos_contratados: string | null
  diferenciais: string | null
  observacoes: string | null
  persona: string | null
  servico: ClientServico | null
  rede_social: ClientRedeSocial | null
  ads: ClientAds | null
  avatar_emoji: string
  cor: string
  drive_folder_url: string | null
  posts_mensais: number
  meta_posts_semana: number
  status: ClientStatus
  contrato_path: string | null
  contrato_nome: string | null
  contrato_inicio: string | null
  contrato_duracao_meses: number | null
  contrato_valor: number | null
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  client_id: string
  titulo: string
  tipo: PostType
  status: PostStatus
  tema: string | null
  data_publicacao: string | null
  drive_file_url: string | null
  notas: string | null
  plataforma: PostPlatform | null
  referencia_url: string | null
  aprovado: boolean
  responsavel_id: string | null
  created_at: string
  updated_at: string
  client?: Client
  responsavel?: Profile
}

export interface Notification {
  id: string
  user_id: string
  titulo: string
  mensagem: string
  link: string | null
  lida: boolean
  created_at: string
}

export interface DataComemorativa {
  data: string       // YYYY-MM-DD
  nome: string
  ideia: string
  ativo: boolean
}

export interface Referencia {
  id: string
  url: string
  label: string
}

export interface Planejamento {
  id: string
  client_id: string
  mes: string  // YYYY-MM
  objetivo_mes: string | null
  oportunidades: string | null
  riscos: string | null
  sugestoes_acoes: string | null
  referencias: Referencia[]
  datas_comemorativas: DataComemorativa[]
  share_token: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  nome: string
  email: string
  role: UserRole
  status: 'ativo' | 'inativo'
  avatar_url: string | null
  telefone: string | null
  endereco: string | null
  data_admissao: string | null
  created_at: string
}

// --- TikTok Shop CRM (alunos/kiwify) ---
export type AlunoEtapa = 'lead' | 'entrada' | 'core' | 'avancado'
export type ScoreLabel = 'quente' | 'morno' | 'frio' | 'sem_dados'
export type ProdutoTipoTiktok = 'lowticket' | 'core' | 'mentoria' | 'outro'
export type CompraStatus = 'ativo' | 'reembolsado' | 'chargeback'

export interface ProdutoTiktok {
  id: string
  nome: string
  tipo: ProdutoTipoTiktok
  preco: number | null
  kiwify_product_id: string | null
  ativo: boolean
  created_at: string
}

export interface Aluno {
  id: string
  nome: string
  email: string
  telefone: string | null
  kiwify_customer_id: string | null
  etapa: AlunoEtapa
  tags: string[]
  created_at: string
  updated_at: string
}

export interface CompraAluno {
  id: string
  aluno_id: string
  produto_id: string | null
  status: CompraStatus
  kiwify_order_id: string | null
  valor: number | null
  data_compra: string
  produto?: ProdutoTiktok
}

export interface CarrinhoAbandonado {
  id: string
  aluno_id: string
  produto_id: string | null
  kiwify_checkout_id: string | null
  data_abandono: string
  produto?: ProdutoTiktok
}

export interface RespostaFormulario {
  id: string
  aluno_id: string
  timestamp_resposta: string | null
  nome: string | null
  whatsapp: string | null
  instagram: string | null
  email: string
  ja_vende_plataforma: string | null
  nicho: string | null
  tipo_venda: string | null
  faturamento: string | null
  cria_videos: string | null
  dificuldade_tiktok: string | null
  dor_tiktok: string | null
  nichos_que_vende: string | null
  nivel_tecnico: string | null
  executa_missoes: string | null
  tempo_execucao: string | null
  interesse_297: string | null
  interesse_4500: string | null
  mural_futuro: string | null
  score: number
  created_at: string
  updated_at: string
}

export interface NotaAluno {
  id: string
  aluno_id: string
  texto: string
  admin_id: string | null
  created_at: string
  admin?: Profile
}

export interface ServicoAdicional {
  id: string
  client_id: string
  descricao: string
  valor: number
  data: string | null
  created_at: string
}

export type ReferenciaStatus = 'processando' | 'concluido' | 'erro'
export type ReferenciaPlataforma = 'youtube' | 'instagram' | 'tiktok'

export interface ReferenciaLaboratorio {
  id: string
  client_id: string
  url: string
  plataforma: ReferenciaPlataforma | null
  titulo: string | null
  transcricao: string | null
  sugestoes: string | null
  status: ReferenciaStatus
  erro: string | null
  created_at: string
  updated_at: string
}
