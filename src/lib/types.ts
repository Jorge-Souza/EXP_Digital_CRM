export type ClientStatus = 'ativo' | 'inativo' | 'pausado'
export type PostStatus = 'planejado' | 'falta_insumo' | 'producao' | 'aprovado_design' | 'aprovado' | 'agendado' | 'publicado'
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
  avatar_emoji: string
  cor: string
  drive_folder_url: string | null
  posts_mensais: number
  meta_posts_semana: number
  status: ClientStatus
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
  avatar_url: string | null
  telefone: string | null
  endereco: string | null
  data_admissao: string | null
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
