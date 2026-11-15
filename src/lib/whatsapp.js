import { moeda, somenteDigitos } from './format'
import { nomeCor } from './elementos'
import { percentualDesconto } from './regras'

export const codigoPedido = () => `AFV-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

const dataBr = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v || '') ? v.split('-').reverse().join('/') : v)

export function resumoValores(carrinho, config) {
  const comPreco = carrinho.filter((i) => i.tipo !== 'personalizada')
  const subtotal = comPreco.reduce((s, i) => s + i.preco * i.quantidade, 0)
  const qtd = carrinho.reduce((s, i) => s + i.quantidade, 0)
  const pct = percentualDesconto(qtd, config?.descontos)
  const desconto = Math.round(subtotal * pct) / 100
  const aCombinar = carrinho.some((i) => i.tipo === 'personalizada')
  const economia = comPreco.reduce((s, i) => s + Math.max(0, Number(i.preco_cheio || i.preco) - i.preco) * i.quantidade, 0)
  return { subtotal, qtd, pct, desconto, total: subtotal - desconto, aCombinar, economia }
}

export function montarMensagem(carrinho, dados, config, codigo) {
  const v = resumoValores(carrinho, config)
  const linhas = [`Olá! Vim pelo site e quero fazer este pedido ♡`, '', `*Pedido ${codigo}*`]
  carrinho.forEach((i, n) => {
    linhas.push('', `*${n + 1}. ${i.descricao}*`)
    if (i.kit_nome) linhas.push(`Parte do ${i.kit_nome}`)
    linhas.push(`Quantidade: ${i.quantidade}`)
    const p = i.personalizacao || {}
    if (p.nome) linhas.push(`Nome: ${p.nome}`)
    if (p.frase) linhas.push(`Frase: ${p.frase}`)
    if (p.data) linhas.push(`Data: ${dataBr(p.data)}`)
    if (p.cor) linhas.push(`Cor: ${nomeCor(p.cor)}`)
    if (i.detalhes?.length) linhas.push(`Na arte: ${i.detalhes.join(', ')}`)
    if (i.observacoes) linhas.push(`Observações: ${i.observacoes}`)
    if (i.referencias?.length) linhas.push(`Tenho ${i.referencias.length} ${i.referencias.length === 1 ? 'imagem' : 'imagens'} de referência para enviar`)
    if (i.tipo === 'personalizada') linhas.push(`Valor: a partir de ${moeda(i.preco)} por peça, a combinar`)
    else linhas.push(`Valor: ${i.quantidade} × ${moeda(i.preco)} = ${moeda(i.preco * i.quantidade)}`)
    if (i.promocao) linhas.push(`Promoção: ${i.promocao.titulo} (−${i.promocao.percentual}%, de ${moeda(i.preco_cheio)} por ${moeda(i.preco)})`)
  })
  linhas.push('')
  if (v.desconto > 0) linhas.push(`Desconto de ${v.pct}% por quantidade: −${moeda(v.desconto)}`)
  linhas.push(`*Total estimado: ${moeda(v.total)}*${v.aCombinar ? ' + arte personalizada a combinar' : ''}`)
  linhas.push('Frete a combinar.')
  linhas.push('', '*Meus dados*', `Nome: ${dados.nome}`)
  if (dados.cidade) linhas.push(`Cidade: ${dados.cidade}`)
  if (dados.cep) linhas.push(`CEP: ${dados.cep}`)
  if (dados.dataDesejada) linhas.push(`Preciso receber até: ${dataBr(dados.dataDesejada)}`)
  if (dados.observacoes) linhas.push(`Recado: ${dados.observacoes}`)
  linhas.push('', 'Vou mandar as imagens das artes logo em seguida.')
  return linhas.join('\n')
}

export const linkWhats = (numero, texto) => `https://wa.me/${somenteDigitos(numero)}?text=${encodeURIComponent(texto || '')}`

async function paraArquivo(src, nome) {
  const blob = await (await fetch(src)).blob()
  const ext = blob.type.includes('png') ? 'png' : 'jpg'
  return new File([blob], `${nome}.${ext}`, { type: blob.type })
}

export async function imagensDoPedido(carrinho, codigo) {
  const arquivos = []
  for (const [n, i] of carrinho.entries()) {
    const base = `${codigo}-item${n + 1}`
    if (i.mockup) arquivos.push(await paraArquivo(i.mockup, `${base}-frente`))
    if (i.mockup_verso) arquivos.push(await paraArquivo(i.mockup_verso, `${base}-verso`))
    for (const [k, r] of (i.referencias || []).entries()) arquivos.push(await paraArquivo(r, `${base}-referencia${k + 1}`))
  }
  return arquivos
}

export async function enviarImagens(arquivos, codigo) {
  if (navigator.canShare?.({ files: arquivos })) {
    await navigator.share({ files: arquivos, title: `Pedido ${codigo}`, text: `Imagens do pedido ${codigo}` })
    return 'compartilhado'
  }
  for (const f of arquivos) {
    const url = URL.createObjectURL(f)
    const a = document.createElement('a')
    a.href = url
    a.download = f.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }
  return 'baixado'
}
