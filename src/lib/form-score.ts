import type { ScoreLabel } from "@/lib/types"
export type { ScoreLabel }

export interface FormRespostaInput {
  tipo_venda?: string
  faturamento?: string
  executa_missoes?: string
  tempo_execucao?: string
  interesse_297?: string
  interesse_4500?: string
}

export function calcularScore(r: FormRespostaInput): number {
  let score = 0

  // Intenção de compra R$4.500 (peso máximo)
  if (r.interesse_4500?.startsWith('Sim')) score += 50
  else if (r.interesse_4500?.startsWith('Talvez')) score += 25

  // Intenção de compra R$297
  if (r.interesse_297?.startsWith('Sim')) score += 25
  else if (r.interesse_297?.startsWith('Talvez')) score += 12

  // Velocidade de execução
  if (r.tempo_execucao === 'No mesmo dia') score += 15
  else if (r.tempo_execucao?.includes('3 dias')) score += 12
  else if (r.tempo_execucao?.includes('semana')) score += 8

  // Comprometimento com missões
  if (r.executa_missoes?.includes('todas')) score += 10
  else if (r.executa_missoes?.includes('maioria')) score += 5

  // Faturamento
  if (r.faturamento?.includes('20.000')) score += 10
  else if (r.faturamento?.includes('5.000')) score += 8
  else if (r.faturamento?.includes('1.000')) score += 5
  else if (r.faturamento?.includes('R$1.000')) score += 3

  // Tipo de venda
  if (r.tipo_venda?.includes('Seller')) score += 5
  else if (r.tipo_venda?.includes('Afiliado')) score += 2

  return score
}

export function scoreLabel(score: number, temFormulario: boolean): ScoreLabel {
  if (!temFormulario) return 'sem_dados'
  if (score >= 70) return 'quente'
  if (score >= 40) return 'morno'
  return 'frio'
}

export const SCORE_DISPLAY: Record<ScoreLabel, { emoji: string; label: string; cor: string }> = {
  quente: { emoji: '🔥', label: 'Quente', cor: 'bg-red-500/20 text-red-400 border-red-500/30' },
  morno:  { emoji: '⚡', label: 'Morno',  cor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  frio:   { emoji: '❄️', label: 'Frio',   cor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  sem_dados: { emoji: '—', label: 'Sem dados', cor: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
}
