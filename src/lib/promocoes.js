export const TIPOS_PROMO = [
  { id: 'black', nome: 'Black Friday', curto: 'Black' },
  { id: 'relampago', nome: 'Oferta relâmpago', curto: 'Relâmpago' },
  { id: 'semana', nome: 'Desconto da semana', curto: 'Da semana' },
  { id: 'outra', nome: 'Promoção', curto: 'Promoção' },
]

export const nomeTipo = (id) => TIPOS_PROMO.find((t) => t.id === id)?.nome || 'Promoção'

export function promoAtiva(p, agora = Date.now()) {
  if (!p?.ativo || !(Number(p.percentual) > 0)) return false
  if (p.inicio && new Date(p.inicio).getTime() > agora) return false
  if (p.fim && new Date(p.fim).getTime() <= agora) return false
  return true
}

export function promoVale(p, modelo) {
  if (!modelo) return false
  if (p.alvo === 'categorias') return (p.categorias || []).includes(modelo.categoria)
  if (p.alvo === 'modelos') return (p.modelos || []).includes(modelo.id)
  return true
}

export function promocaoDe(modelo, promocoes, agora = Date.now()) {
  return (promocoes || [])
    .filter((p) => promoAtiva(p, agora) && promoVale(p, modelo))
    .sort((a, b) => Number(b.percentual) - Number(a.percentual))[0] || null
}

export const comDesconto = (preco, promo) => (promo ? Math.round(Number(preco) * (1 - Number(promo.percentual) / 100) * 100) / 100 : Number(preco))

export function promosVigentes(promocoes, agora = Date.now()) {
  const ordem = { relampago: 0, black: 1, semana: 2, outra: 3 }
  return (promocoes || []).filter((p) => promoAtiva(p, agora)).sort((a, b) => ordem[a.tipo] - ordem[b.tipo])
}

export function tempoRestante(fim, agora = Date.now()) {
  const ms = new Date(fim).getTime() - agora
  if (!(ms > 0)) return null
  const s = Math.floor(ms / 1000)
  return { dias: Math.floor(s / 86400), horas: Math.floor((s % 86400) / 3600), minutos: Math.floor((s % 3600) / 60), segundos: s % 60 }
}

export function promocoesDemo() {
  const agora = new Date()
  const em = (horas) => new Date(agora.getTime() + horas * 3600000).toISOString()
  return [
    {
      id: 'promo-relampago',
      tipo: 'relampago',
      titulo: 'Taças com 15% off',
      descricao: 'Só até o relógio zerar. Vale para todas as taças, com qualquer arte.',
      percentual: 15,
      alvo: 'categorias',
      categorias: ['tacas'],
      modelos: [],
      inicio: em(-2),
      fim: em(30),
      ativo: true,
      banner: true,
    },
    {
      id: 'promo-semana',
      tipo: 'semana',
      titulo: 'Canecas da semana',
      descricao: 'Xícaras e canecas com 10% de desconto até domingo.',
      percentual: 10,
      alvo: 'categorias',
      categorias: ['canecas'],
      modelos: [],
      inicio: em(-24),
      fim: em(24 * 6),
      ativo: true,
      banner: true,
    },
    {
      id: 'promo-black',
      tipo: 'black',
      titulo: 'Black Flor de Vidro',
      descricao: 'Garrafas pintadas com 20% de desconto. Aproveite para os presentes de fim de ano.',
      percentual: 20,
      alvo: 'categorias',
      categorias: ['garrafas'],
      modelos: [],
      inicio: em(-1),
      fim: em(24 * 15),
      ativo: true,
      banner: true,
    },
  ]
}
