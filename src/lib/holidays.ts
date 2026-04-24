export function calcularPascoa(year: number): Date {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100
  const d = Math.floor(b / 4), e = b % 4
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month, day)
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}

export function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function getNthSunday(year: number, month: number, n: number): Date {
  const firstDay = new Date(year, month, 1)
  const dow = firstDay.getDay()
  const toFirstSunday = dow === 0 ? 0 : 7 - dow
  return new Date(year, month, 1 + toFirstSunday + (n - 1) * 7)
}

function getLastFriday(year: number, month: number): Date {
  const last = new Date(year, month + 1, 0)
  const daysBack = (last.getDay() + 2) % 7
  return new Date(year, month, last.getDate() - daysBack)
}

export function getFeriadosBrasil(year: number): Map<string, string> {
  const f = new Map<string, string>()
  const add = (d: Date, n: string) => f.set(toKey(d), n)
  const dt = (m: number, day: number) => new Date(year, m - 1, day)
  add(dt(1, 1),   "Confraternização Universal")
  add(dt(4, 21),  "Tiradentes")
  add(dt(5, 1),   "Dia do Trabalho")
  add(dt(9, 7),   "Independência do Brasil")
  add(dt(10, 12), "Nossa Sra. Aparecida")
  add(dt(11, 2),  "Finados")
  add(dt(11, 15), "Proclamação da República")
  add(dt(11, 20), "Consciência Negra")
  add(dt(12, 25), "Natal")
  const pascoa = calcularPascoa(year)
  add(addDays(pascoa, -48), "Carnaval")
  add(addDays(pascoa, -47), "Carnaval (terça)")
  add(addDays(pascoa, -2),  "Sexta-feira Santa")
  add(pascoa,               "Páscoa")
  add(addDays(pascoa, 60),  "Corpus Christi")
  return f
}

function getDatasComerciais(year: number): Map<string, string> {
  const f = new Map<string, string>()
  const add = (d: Date, n: string) => { if (d.getFullYear() === year) f.set(toKey(d), n) }
  const dt = (m: number, day: number) => new Date(year, m - 1, day)
  add(dt(2, 14),  "Dia dos Namorados (internacional)")
  add(dt(3, 8),   "Dia Internacional da Mulher")
  add(dt(3, 15),  "Dia do Consumidor")
  add(dt(4, 22),  "Dia da Terra")
  add(getNthSunday(year, 4, 2), "Dia das Mães") // 2º domingo de maio (mês 4, 0-indexed)
  add(dt(6, 5),   "Dia Mundial do Meio Ambiente")
  add(dt(6, 12),  "Dia dos Namorados")
  add(dt(6, 24),  "Festa Junina / São João")
  add(dt(7, 28),  "Dia do Amigo")
  add(getNthSunday(year, 7, 2), "Dia dos Pais") // 2º domingo de agosto
  add(dt(9, 15),  "Dia do Cliente")
  add(dt(10, 15), "Dia do Professor")
  add(dt(10, 31), "Halloween")
  add(getLastFriday(year, 10), "Black Friday") // última sexta de novembro (mês 10, 0-indexed)
  add(dt(12, 31), "Réveillon")
  return f
}

export function getAllDatasDoMes(year: number, month: number): { data: string; nome: string }[] {
  const result: { data: string; nome: string }[] = []
  const seen = new Set<string>()

  const addAll = (map: Map<string, string>) => {
    map.forEach((nome, key) => {
      const [y, m] = key.split("-").map(Number)
      if (y === year && m - 1 === month && !seen.has(key)) {
        seen.add(key)
        result.push({ data: key, nome })
      }
    })
  }

  addAll(getFeriadosBrasil(year))
  addAll(getDatasComerciais(year))
  return result.sort((a, b) => a.data.localeCompare(b.data))
}

const SUGESTOES: Record<string, (nicho: string) => string> = {
  "Confraternização Universal": (n) =>
    `Dê as boas-vindas ao novo ano com um post especial sobre ${n}. Compartilhe metas, conquistas e o que está por vir. Uma ótima oportunidade para criar expectativa e engajar o público.`,
  "Carnaval": (n) =>
    `O Carnaval é uma das datas com mais energia do Brasil — use isso a favor de ${n}. Conteúdo festivo com cores vibrantes e ritmo tem alto engajamento. Que tal uma promoção especial ou post temático?`,
  "Carnaval (terça)": (n) =>
    `Último dia de Carnaval — ainda dá para manter o clima festivo em ${n} com conteúdo descontraído antes do retorno ao ritmo normal.`,
  "Sexta-feira Santa": (n) =>
    `Um momento de reflexão — conteúdo mais sóbrio e emocional funciona bem. Uma mensagem de gratidão e proximidade com o público de ${n} é uma boa pedida.`,
  "Páscoa": (n) =>
    `A Páscoa é tempo de renovação e alegria. Crie um conteúdo festivo para ${n} com o tema de recomeço — promoção especial, mensagem aos seguidores ou post temático criativo.`,
  "Tiradentes": (n) =>
    `Tiradentes representa liberdade e coragem — conecte esses valores ao propósito de ${n}. Um post institucional e reflexivo sobre o que a marca representa para os clientes.`,
  "Dia do Trabalho": (n) =>
    `No Dia do Trabalho, valorize quem faz ${n} acontecer. Mostre bastidores, a dedicação da equipe e o propósito por trás do trabalho. Conteúdo humanizado performa muito bem nessa data.`,
  "Corpus Christi": (n) =>
    `Feriado de fé e celebração. Uma mensagem de gratidão, fé e conexão com a comunidade de ${n} é adequada para esse dia.`,
  "Independência do Brasil": (n) =>
    `Celebre o 7 de Setembro com orgulho! Mostre como ${n} contribui para a comunidade e reforce os valores de dedicação com uma identidade visual verde e amarela.`,
  "Nossa Sra. Aparecida": (n) =>
    `Uma das datas de maior devoção do Brasil. Conteúdo com fé, esperança e gratidão gera alta conexão emocional com o público de ${n}. Ideal para reforçar os valores humanos da marca.`,
  "Finados": (n) =>
    `Uma data reflexiva — mantenha o tom sóbrio. Uma mensagem de memória, legado e gratidão pode ser adequada para ${n}, sem tom comercial excessivo.`,
  "Proclamação da República": (n) =>
    `Celebre cidadania e progresso. Uma boa oportunidade para ${n} mostrar seu papel na comunidade e reforçar valores institucionais.`,
  "Consciência Negra": (n) =>
    `O Dia da Consciência Negra pede autenticidade. Para ${n}, mostre diversidade, inclusão e respeito com conteúdo que vai além do superficial e reflete os valores reais da marca.`,
  "Natal": (n) =>
    `O Natal é a maior data do calendário! Planeje campanha completa para ${n}: contagem regressiva, promoções especiais, conteúdo emotivo e mensagem de gratidão. Alta época de engajamento e vendas.`,
  "Dia dos Namorados (internacional)": (n) =>
    `O Valentine's Day (14/02) tem forte presença nas redes. Uma oportunidade para ${n} criar conteúdo leve e afetivo, ou uma promoção especial para casais.`,
  "Dia Internacional da Mulher": (n) =>
    `O Dia da Mulher pede autenticidade. Para ${n}, celebre a mulher com conteúdo real — depoimentos de clientes, homenagem à equipe feminina ou uma campanha especial.`,
  "Dia do Consumidor": (n) =>
    `O Dia do Consumidor é uma excelente data para ${n} reconhecer e celebrar seus clientes. Promoção especial, sorteio ou conteúdo de valorização têm ótima resposta.`,
  "Dia da Terra": (n) =>
    `O Dia da Terra é uma oportunidade para ${n} mostrar seu lado sustentável. Conteúdo sobre responsabilidade ambiental e valores conscientes tem boa repercussão.`,
  "Dia das Mães": (n) =>
    `O Dia das Mães é uma das datas com maior impacto emocional do ano. Crie campanha especial para ${n} — conteúdo emocional, depoimentos e promoções conectando à experiência materna. Planeje com antecedência!`,
  "Dia Mundial do Meio Ambiente": (n) =>
    `Mostre o lado consciente de ${n}. Posts sobre sustentabilidade, impacto positivo e práticas eco-responsáveis se conectam bem com o público nessa data.`,
  "Dia dos Namorados": (n) =>
    `Dia dos Namorados é uma das maiores datas comerciais do Brasil. Crie campanha criativa para ${n} com sugestões de presentes, experiências a dois ou promoção especial. Conteúdo com casal tem alto engajamento.`,
  "Festa Junina / São João": (n) =>
    `São João é uma das festas mais queridas do Brasil! Para ${n}, crie conteúdo junino com estética de arraial. Pode incluir promoção temática, receitas, ou post interativo com identidade visual de bandeirinha.`,
  "Dia do Amigo": (n) =>
    `No Dia do Amigo, incentive seu público a marcar os amigos nos posts de ${n}. Conteúdo interativo e chamadas para compartilhar têm ótimo alcance orgânico nessa data.`,
  "Dia dos Pais": (n) =>
    `O Dia dos Pais é ideal para campanha emocional em ${n}. Explore força, dedicação e cuidado. Posts com depoimentos reais têm alto engajamento. Inclua promoção especial para a data.`,
  "Dia do Cliente": (n) =>
    `O Dia do Cliente é a hora de mostrar o quanto os clientes de ${n} são especiais! Post de valorização, promoção exclusiva ou sorteio são ótimas ideias.`,
  "Dia do Professor": (n) =>
    `Uma data para valorizar quem ensina e inspira. Para ${n}, uma mensagem de reconhecimento ao conhecimento e à educação conecta bem com o público.`,
  "Halloween": (n) =>
    `Halloween é uma data divertida e criativa para ${n}. Use fantasias, cores laranja e preta, e humor para conteúdo temático. Reels e Stories com pegada de terror divertido performam muito bem.`,
  "Black Friday": (n) =>
    `Black Friday é a maior data de vendas do ano — planeje com antecedência para ${n}! Sequência de conteúdos: aquecimento (1 semana antes), contagem regressiva e urgência (últimas horas). Alta capacidade de conversão.`,
  "Réveillon": (n) =>
    `Celebre o fim do ano com gratidão! Um post especial de retrospectiva e agradecimento pelos clientes de ${n} em ${new Date().getFullYear()} é muito bem recebido. Gere expectativa para o próximo ano.`,
}

export function gerarSugestaoFeriado(nome: string, nicho: string): string {
  return SUGESTOES[nome]?.(nicho)
    ?? `Crie um conteúdo especial de "${nome}" para engajar o público de ${nicho}. Aproveite o momento para reforçar a identidade e os valores da marca.`
}

export function gerarDatasDoMes(
  year: number,
  month: number,
  nicho: string,
): Array<{ data: string; nome: string; ideia: string; ativo: boolean }> {
  return getAllDatasDoMes(year, month).map(({ data, nome }) => ({
    data,
    nome,
    ideia: gerarSugestaoFeriado(nome, nicho),
    ativo: true,
  }))
}
