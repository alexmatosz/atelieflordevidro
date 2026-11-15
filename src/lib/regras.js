import { somenteDigitos } from './format'

export function percentualDesconto(qtd, cfgDescontos) {
  const faixas = cfgDescontos?.faixas || []
  return faixas.reduce((maior, f) => (qtd >= Number(f.minimo) ? Math.max(maior, Number(f.percentual)) : maior), 0)
}

export function proximaFaixa(qtd, cfgDescontos) {
  const faixas = [...(cfgDescontos?.faixas || [])].sort((a, b) => a.minimo - b.minimo)
  return faixas.find((f) => qtd < Number(f.minimo)) || null
}

export function calcularFrete(cep, subtotal, cfgFrete) {
  const d = somenteDigitos(cep)
  if (d.length !== 8) return null
  const gratis = cfgFrete?.gratis_acima != null && subtotal >= Number(cfgFrete.gratis_acima)
  for (const f of cfgFrete?.faixas || []) {
    for (const p of f.prefixos || []) {
      if (p && d.startsWith(String(p))) {
        return { valor: gratis ? 0 : Number(f.valor), dias: Number(f.dias), regiao: f.regiao, gratis }
      }
    }
  }
  return { valor: gratis ? 0 : 55, dias: 12, regiao: 'Norte e demais', gratis }
}

export function precoUnitario({ modelo, arte, kit, solicitacao }) {
  if (solicitacao) return Number(solicitacao.preco_unitario || 0)
  let p = Number(modelo?.preco_base || 0) + Number(arte?.acrescimo || 0)
  if (kit) p = Math.round(p * (1 - Number(kit.desconto_percentual || 0) / 100) * 100) / 100
  return p
}

export function resumoCarrinho(itens, config, cep) {
  const subtotal = itens.reduce((s, i) => s + i.preco * i.quantidade, 0)
  const qtd = itens.reduce((s, i) => s + i.quantidade, 0)
  const pct = percentualDesconto(qtd, config?.descontos)
  const desconto = Math.round(subtotal * pct) / 100
  const frete = calcularFrete(cep, subtotal - desconto, config?.frete)
  const prazoProducao = itens.reduce((m, i) => Math.max(m, Number(i.prazo || 0)), 0)
  return {
    subtotal,
    qtd,
    pct,
    desconto,
    frete,
    prazoProducao,
    total: subtotal - desconto + (frete?.valor || 0),
    proxima: proximaFaixa(qtd, config?.descontos),
  }
}

export const linkWhatsApp = (numero, texto) =>
  `https://wa.me/${somenteDigitos(numero)}?text=${encodeURIComponent(texto || '')}`

export const urlSite = (rota) => `${window.location.origin}${import.meta.env.BASE_URL}#${rota}`

export const linkEmail = (email, assunto, corpo) =>
  `mailto:${email || ''}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`
