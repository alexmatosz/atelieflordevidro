import { ARTES, CONFIG_PADRAO, DATAS, KITS, MODELOS } from './seed'
import { ELEMENTOS_PADRAO } from './elementos'
import { calcularFrete, percentualDesconto, precoUnitario } from './regras'

const URL = import.meta.env.VITE_SUPABASE_URL
const CHAVE = import.meta.env.VITE_SUPABASE_ANON_KEY

export const MODO_DEMO = !URL || !CHAVE

let clientePromise = null
export function supabase() {
  if (MODO_DEMO) return null
  if (!clientePromise) {
    clientePromise = import('@supabase/supabase-js').then(({ createClient }) => createClient(URL, CHAVE))
  }
  return clientePromise
}

const PREFIXO = 'afv:'
const VERSAO_SEED = '1'

function lerLocal(tabela) {
  try {
    return JSON.parse(localStorage.getItem(PREFIXO + tabela) || '[]')
  } catch {
    return []
  }
}

function gravarLocal(tabela, linhas) {
  try {
    localStorage.setItem(PREFIXO + tabela, JSON.stringify(linhas))
  } catch {
    throw new Error('O navegador ficou sem espaço para salvar. Use imagens menores.')
  }
}

function semearLocal() {
  try {
    if (localStorage.getItem(PREFIXO + 'seed') === VERSAO_SEED) return
    gravarLocal('modelos', MODELOS)
    gravarLocal('artes', ARTES)
    gravarLocal('elementos_editor', ELEMENTOS_PADRAO.map((e) => ({ ...e, ativo: true })))
    gravarLocal('kits', KITS)
    gravarLocal('datas_comemorativas', DATAS)
    gravarLocal('configuracoes', Object.entries(CONFIG_PADRAO).map(([chave, valor]) => ({ chave, valor })))
    for (const t of ['solicitacoes_analise', 'pedidos', 'itens_pedido', 'galeria_clientes', 'pedidos_corporativos']) gravarLocal(t, [])
    localStorage.setItem(PREFIXO + 'seed', VERSAO_SEED)
  } catch {
    return
  }
}

if (MODO_DEMO) semearLocal()

export function reiniciarDemo() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIXO))
    .forEach((k) => localStorage.removeItem(k))
  semearLocal()
}

const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36))
const codigo = () => Math.random().toString(36).slice(2, 8).toUpperCase()

function filtrar(linhas, filtro = {}) {
  return linhas.filter((l) => Object.entries(filtro).every(([k, v]) => (Array.isArray(v) ? v.includes(l[k]) : l[k] === v)))
}

function ordenar(linhas, ordem) {
  if (!ordem) return linhas
  const [campo, dir] = ordem.split(' ')
  const s = dir === 'desc' ? -1 : 1
  return [...linhas].sort((a, b) => (a[campo] > b[campo] ? s : a[campo] < b[campo] ? -s : 0))
}

async function sb() {
  return await supabase()
}

function falha(error) {
  if (error) throw new Error(error.message || 'Erro ao falar com o servidor.')
}

export const db = {
  async listar(tabela, { filtro, ordem } = {}) {
    if (MODO_DEMO) return ordenar(filtrar(lerLocal(tabela), filtro), ordem)
    const c = await sb()
    let q = c.from(tabela).select('*')
    for (const [k, v] of Object.entries(filtro || {})) q = Array.isArray(v) ? q.in(k, v) : q.eq(k, v)
    if (ordem) {
      const [campo, dir] = ordem.split(' ')
      q = q.order(campo, { ascending: dir !== 'desc' })
    }
    const { data, error } = await q
    falha(error)
    return data
  },

  async obter(tabela, id, campo = 'id') {
    if (MODO_DEMO) return lerLocal(tabela).find((l) => l[campo] === id) || null
    const c = await sb()
    const { data, error } = await c.from(tabela).select('*').eq(campo, id).maybeSingle()
    falha(error)
    return data
  },

  async inserir(tabela, obj) {
    if (MODO_DEMO) {
      const linhas = lerLocal(tabela)
      const novo = { id: uuid(), criado_em: new Date().toISOString(), ...obj }
      if (tabela === 'solicitacoes_analise' && !novo.codigo) novo.codigo = codigo()
      gravarLocal(tabela, [...linhas, novo])
      return novo
    }
    const c = await sb()
    const { data, error } = await c.from(tabela).insert(obj).select().single()
    falha(error)
    return data
  },

  async atualizar(tabela, id, patch) {
    if (MODO_DEMO) {
      const linhas = lerLocal(tabela)
      const i = linhas.findIndex((l) => l.id === id)
      if (i < 0) throw new Error('Registro não encontrado.')
      linhas[i] = { ...linhas[i], ...patch }
      gravarLocal(tabela, linhas)
      return linhas[i]
    }
    const c = await sb()
    const { data, error } = await c.from(tabela).update(patch).eq('id', id).select().single()
    falha(error)
    return data
  },

  async remover(tabela, id) {
    if (MODO_DEMO) {
      gravarLocal(
        tabela,
        lerLocal(tabela).filter((l) => l.id !== id)
      )
      return
    }
    const c = await sb()
    const { error } = await c.from(tabela).delete().eq('id', id)
    falha(error)
  },

  async config() {
    const linhas = await db.listar('configuracoes')
    const cfg = structuredClone(CONFIG_PADRAO)
    for (const l of linhas) cfg[l.chave] = { ...(cfg[l.chave] || {}), ...l.valor }
    return cfg
  },

  async salvarConfig(chave, valor) {
    if (MODO_DEMO) {
      const linhas = lerLocal('configuracoes').filter((l) => l.chave !== chave)
      gravarLocal('configuracoes', [...linhas, { chave, valor }])
      return
    }
    const c = await sb()
    const { error } = await c.from('configuracoes').upsert({ chave, valor, atualizado_em: new Date().toISOString() })
    falha(error)
  },

  async enviarImagem(arquivo, pasta = 'clientes') {
    const dataUrl = typeof arquivo === 'string' ? arquivo : await reduzirImagem(arquivo)
    if (MODO_DEMO) return dataUrl
    const c = await sb()
    const blob = await (await fetch(dataUrl)).blob()
    const ext = blob.type.includes('png') ? 'png' : 'jpg'
    const caminho = `${pasta}/${uuid()}.${ext}`
    const { error } = await c.storage.from('imagens').upload(caminho, blob, { contentType: blob.type })
    falha(error)
    return c.storage.from('imagens').getPublicUrl(caminho).data.publicUrl
  },

  async criarPedido(itens, dados, usuario) {
    if (!MODO_DEMO) {
      const c = await sb()
      const { data, error } = await c.rpc('criar_pedido', { p_itens: itens, p_dados: dados })
      falha(error)
      return data
    }
    const cfg = await db.config()
    const modelos = lerLocal('modelos')
    const artes = lerLocal('artes')
    const kits = lerLocal('kits')
    const solicitacoes = lerLocal('solicitacoes_analise')
    let prazo = 0
    let origem = 'loja'
    const linhas = itens.map((it) => {
      const modelo = modelos.find((m) => m.id === it.modelo_id && m.disponivel)
      if (!modelo) throw new Error('Um dos modelos do carrinho não está mais disponível.')
      const sol = it.solicitacao_id ? solicitacoes.find((s) => s.id === it.solicitacao_id && s.status === 'aprovado') : null
      if (it.solicitacao_id && !sol) throw new Error('A solicitação não está mais aprovada.')
      const arte = it.arte_id ? artes.find((a) => a.id === it.arte_id) : null
      const kit = it.kit_id ? kits.find((k) => k.id === it.kit_id) : null
      if (sol) origem = 'analise'
      else if (kit) origem = 'kit'
      prazo = Math.max(prazo, sol?.prazo_dias || modelo.prazo_producao_dias)
      return { ...it, preco: precoUnitario({ modelo, arte, kit, solicitacao: sol }) }
    })
    const subtotal = linhas.reduce((s, l) => s + l.preco * l.quantidade, 0)
    const qtd = linhas.reduce((s, l) => s + l.quantidade, 0)
    const desconto = Math.round(subtotal * percentualDesconto(qtd, cfg.descontos)) / 100
    const frete = calcularFrete(dados.cep, subtotal - desconto, cfg.frete) || { valor: 0, dias: 0 }
    const pedido = await db.inserir('pedidos', {
      numero: lerLocal('pedidos').length + 1001,
      cliente_id: usuario?.id,
      cliente_nome: dados.nome,
      cliente_email: dados.email,
      cliente_whatsapp: dados.whatsapp,
      cep: dados.cep,
      endereco: dados.endereco,
      subtotal,
      desconto,
      frete: frete.valor,
      total: subtotal - desconto + frete.valor,
      pagamento: dados.pagamento,
      pagamento_status: 'pendente',
      prazo_producao_dias: prazo,
      prazo_entrega_dias: frete.dias,
      etapa: 'novo',
      origem,
      autoriza_galeria: !!dados.autoriza_galeria,
      foto_pronta: null,
      foto_aprovada_cliente: null,
    })
    let serie = Number(localStorage.getItem(PREFIXO + 'serie') || '0')
    for (const l of linhas) {
      const numeros = Array.from({ length: l.quantidade }, () => ++serie)
      await db.inserir('itens_pedido', {
        pedido_id: pedido.id,
        modelo_id: l.modelo_id,
        arte_id: l.arte_id || null,
        solicitacao_id: l.solicitacao_id || null,
        kit_id: l.kit_id || null,
        descricao: l.descricao,
        personalizacao: l.personalizacao || {},
        mockup: l.mockup || null,
        quantidade: l.quantidade,
        preco_unitario: l.preco,
        numeros_serie: numeros,
      })
      if (l.solicitacao_id) await db.atualizar('solicitacoes_analise', l.solicitacao_id, { status: 'convertido', pedido_id: pedido.id })
      const m = modelos.find((x) => x.id === l.modelo_id)
      await db.atualizar('modelos', l.modelo_id, { estoque: Math.max(0, Number(m.estoque || 0) - l.quantidade) })
    }
    localStorage.setItem(PREFIXO + 'serie', String(serie))
    return pedido.id
  },

  async reenviarSolicitacao(id, dados) {
    if (!MODO_DEMO) {
      const c = await sb()
      const { error } = await c.rpc('reenviar_solicitacao', { p_id: id, p_dados: dados })
      falha(error)
      return
    }
    const s = await db.obter('solicitacoes_analise', id)
    await db.atualizar('solicitacoes_analise', id, {
      ...dados,
      status: 'em_analise',
      historico: [...(s.historico || []), { status: 'em_analise', em: new Date().toISOString(), texto: 'Cliente reenviou com ajustes' }],
      atualizado_em: new Date().toISOString(),
    })
  },

  async responderFoto(id, aprovada, autoriza) {
    if (!MODO_DEMO) {
      const c = await sb()
      const { error } = await c.rpc('responder_foto_pedido', { p_id: id, p_aprovada: aprovada, p_autoriza: autoriza })
      falha(error)
      return
    }
    await db.atualizar('pedidos', id, { foto_aprovada_cliente: aprovada, autoriza_galeria: autoriza })
  },
}

export function reduzirImagem(arquivo, max = MODO_DEMO ? 800 : 1600) {
  return new Promise((resolve, reject) => {
    if (!arquivo.type.startsWith('image/')) return reject(new Error('Envie um arquivo de imagem.'))
    const leitor = new FileReader()
    leitor.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    leitor.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Imagem inválida.'))
      img.onload = () => {
        const escala = Math.min(1, max / Math.max(img.width, img.height))
        const cv = document.createElement('canvas')
        cv.width = Math.round(img.width * escala)
        cv.height = Math.round(img.height * escala)
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height)
        const png = arquivo.type === 'image/png' || arquivo.type === 'image/svg+xml'
        resolve(cv.toDataURL(png ? 'image/png' : 'image/jpeg', 0.85))
      }
      img.src = leitor.result
    }
    leitor.readAsDataURL(arquivo)
  })
}
