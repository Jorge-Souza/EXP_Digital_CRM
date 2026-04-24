export type ClientStatus = 'ativo' | 'inativo' | 'pausado'
export type PostStatus = 'planejado' | 'falta_insumo' | 'producao' | 'aprovado' | 'publicado'
export type PostType = 'feed' | 'reels' | 'story' | 'tiktok' | 'carrossel'
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
  // briefing legado
  briefing: string | null
  // briefing estruturado
  objetivo: string | null
  publico_alvo: string | null
  tom_de_voz: string | null
  servicos_contratados: string | null
  diferenciais: string | null
  observacoes: string | null
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
  created_at: string
  updated_at: string
  client?: Client
}

export interface Profile {
  id: string
  nome: string
  email: string
  role: UserRole
  avatar_url: string | null
  created_at: string
}
