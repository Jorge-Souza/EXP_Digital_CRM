export type Venda = {
  plataforma: "kiwify" | "hotmart"
  external_id: string
  produto: string | null
  data_venda: string
  bruto: number
  taxa: number
  liquido: number
  status: "aprovada" | "reembolsada" | "chargeback"
  data_status: string | null
  liberacao: string | null
}
export type Saque = { plataforma: "kiwify" | "hotmart"; external_id: string; valor: number; status: string; data: string }
export type Lancamento = {
  id: string
  tipo: "despesa" | "retirada" | "saque"
  data: string
  categoria: string | null
  descricao: string | null
  valor: number
  plataforma: "kiwify" | "hotmart" | null
  pago: boolean
  vencimento: string | null
}
export type Config = { banco_inicial: number; prazo_hotmart: number; prazo_kiwify: number }
export type SaldoKiwify = { available: number; pending: number } | null

export const CATEGORIAS: Record<string, string> = {
  trafego: "Tráfego pago",
  comissoes: "Outras comissões (lançadas à mão)",
  impostos: "Impostos",
  equipe: "Equipe",
  ferramentas: "Ferramentas",
  fixas: "Contas fixas",
  outros: "Outros",
}
export const CATS_VARIAVEIS = ["trafego", "comissoes", "impostos"]
export const CATS_FIXAS = ["equipe", "ferramentas", "fixas", "outros"]
