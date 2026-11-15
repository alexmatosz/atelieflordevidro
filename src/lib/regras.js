import { somenteDigitos } from './format'

export function percentualDesconto(qtd, cfgDescontos) {
  const faixas = cfgDescontos?.faixas || []
  return faixas.reduce((maior, f) => (qtd >= Number(f.minimo) ? Math.max(maior, Number(f.percentual)) : maior), 0)
}

export function proximaFaixa(qtd, cfgDescontos) {
  const faixas = [...(cfgDescontos?.faixas || [])].sort((a, b) => a.minimo - b.minimo)
  return faixas.find((f) => qtd < Number(f.minimo)) || null
}

export function precoUnitario({ modelo, arte, kit }) {
  let p = Number(modelo?.preco_base || 0) + Number(arte?.acrescimo || 0)
  if (kit) p = Math.round(p * (1 - Number(kit.desconto_percentual || 0) / 100) * 100) / 100
  return p
}

export const linkWhatsApp = (numero, texto) => `https://wa.me/${somenteDigitos(numero)}?text=${encodeURIComponent(texto || '')}`

export const linkEmail = (email, assunto, corpo) => `mailto:${email || ''}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`
