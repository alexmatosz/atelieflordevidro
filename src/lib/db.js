import { ARTES, CONFIG_PADRAO, DATAS, KITS, MODELOS } from './seed'
import { ELEMENTOS_PADRAO } from './elementos'
import { promocoesDemo } from './promocoes'

const URL = import.meta.env.VITE_SUPABASE_URL
const CHAVE = import.meta.env.VITE_SUPABASE_ANON_KEY

export const MODO_DEMO = !URL || !CHAVE

let clientePromise = null
export function supabase() {
  if (MODO_DEMO) return null
  if (!clientePromise) {
    clientePromise = import('@supabase/supabase-js').then(({ createClient }) => createClient(URL, CHAVE, { auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true } }))
  }
  return clientePromise
}

const PREFIXO = 'afv:'
const VERSAO_SEED = '3'

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
    gravarLocal('promocoes', promocoesDemo())
    gravarLocal('datas_comemorativas', DATAS)
    gravarLocal('configuracoes', Object.entries(CONFIG_PADRAO).map(([chave, valor]) => ({ chave, valor })))
    for (const t of ['solicitacoes_analise', 'pedidos', 'itens_pedido', 'galeria_clientes', 'pedidos_corporativos']) gravarLocal(t, [])
    localStorage.setItem(PREFIXO + 'seed', VERSAO_SEED)
  } catch {
    return
  }
}

if (MODO_DEMO) {
  semearLocal()
  try {
    if (localStorage.getItem(PREFIXO + 'promocoes') == null) gravarLocal('promocoes', promocoesDemo())
  } catch {
    void 0
  }
}

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
  }
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
