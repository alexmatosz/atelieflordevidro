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
  { id: 'pires', nome: 'Pires ou prato' },
  { id: 'jarra', nome: 'Jarra' },
  { id: 'pote', nome: 'Pote com tampa' },
]

export const TEMAS = ['Floral', 'Frutas', 'Delicado', 'Nomes', 'Casamento', 'Datas especiais']

export const OCASIOES = [
  { id: 'aniversario', nome: 'Aniversário' },
  { id: 'maes', nome: 'Para a mãe' },
  { id: 'casamento', nome: 'Casamento' },
  { id: 'padrinhos', nome: 'Padrinhos' },
  { id: 'corporativo', nome: 'Corporativo' },
]

export const ETAPAS = [
  { id: 'novo', nome: 'Novo' },
  { id: 'em_pintura', nome: 'Em pintura' },
  { id: 'secagem', nome: 'Secagem/Cura' },
  { id: 'embalagem', nome: 'Embalagem' },
  { id: 'enviado', nome: 'Enviado' },
]

export const nomeMaterial = (id) => MATERIAIS.find((c) => c.id === id)?.nome || id
