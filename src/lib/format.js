const moedaFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const moeda = (v) => moedaFmt.format(Number(v || 0))

export const data = (v) => (v ? new Date(v).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '')

export const dataHora = (v) =>
  v ? new Date(v).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''

export const diasUteis = (n) => (n === 1 ? '1 dia útil' : `${n} dias úteis`)

export const somenteDigitos = (v) => String(v || '').replace(/\D/g, '')

export const mascaraCep = (v) => {
  const d = somenteDigitos(v).slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

export const mascaraFone = (v) => {
  const d = somenteDigitos(v).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`
}

export const slug = (t) =>
  String(t || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const CATEGORIAS = [
  { id: 'copos', nome: 'Copos', forma: 'copo' },
  { id: 'canecas', nome: 'Xícaras e Canecas', forma: 'caneca' },
  { id: 'tacas', nome: 'Taças', forma: 'taca' },
  { id: 'garrafas', nome: 'Garrafas', forma: 'garrafa' },
]

export const MATERIAIS = [
  { id: 'vidro', nome: 'Vidro' },
  { id: 'ceramica', nome: 'Cerâmica' },
  { id: 'inox', nome: 'Inox' },
]

export const FORMAS = [
  { id: 'taca', nome: 'Taça' },
  { id: 'copo', nome: 'Copo' },
  { id: 'caneca', nome: 'Caneca' },
  { id: 'xicara', nome: 'Xícara' },
  { id: 'garrafa', nome: 'Garrafa' },
]

export const TEMAS = ['Floral', 'Nomes', 'Datas', 'Times', 'Minimalista', 'Infantil', 'Casamento', 'Natal']

export const OCASIOES = [
  { id: 'aniversario', nome: 'Aniversário' },
  { id: 'casamento', nome: 'Casamento' },
  { id: 'padrinhos', nome: 'Padrinhos' },
  { id: 'corporativo', nome: 'Corporativo' },
]

export const STATUS_ANALISE = {
  em_analise: { nome: 'Em análise', cor: 'bg-mel/20 text-argila' },
  aprovado: { nome: 'Aprovado', cor: 'bg-salvia-clara text-salvia' },
  ajuste_sugerido: { nome: 'Ajuste sugerido', cor: 'bg-rosa/40 text-terracota-escuro' },
  recusado: { nome: 'Recusado', cor: 'bg-linho text-cinza' },
  convertido: { nome: 'Virou pedido', cor: 'bg-terracota/15 text-terracota-escuro' },
}

export const ETAPAS = [
  { id: 'novo', nome: 'Novo' },
  { id: 'em_pintura', nome: 'Em pintura' },
  { id: 'secagem', nome: 'Secagem/Cura' },
  { id: 'embalagem', nome: 'Embalagem' },
  { id: 'enviado', nome: 'Enviado' },
]

export const nomeCategoria = (id) => CATEGORIAS.find((c) => c.id === id)?.nome || id
export const nomeMaterial = (id) => MATERIAIS.find((c) => c.id === id)?.nome || id
