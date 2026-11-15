import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { CONFIG_PADRAO } from './seed'
import { db, MODO_DEMO, supabase } from './db'
import { comDesconto, promocaoDe } from './promocoes'

const Ctx = createContext(null)

const CHAVE_ADMIN = 'afv:usuario'
const CHAVE_CARRINHO = 'afv:carrinho'

function lerJson(chave, padrao) {
  try {
    return JSON.parse(localStorage.getItem(chave)) ?? padrao
  } catch {
    return padrao
  }
}

function gravarJson(chave, valor) {
  try {
    if (valor == null) localStorage.removeItem(chave)
    else localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    return
  }
}

export function ProvedorApp({ children }) {
  const [config, setConfig] = useState(CONFIG_PADRAO)
  const [usuario, setUsuario] = useState(() => (MODO_DEMO ? lerJson(CHAVE_ADMIN, null) : null))
  const [carregandoUsuario, setCarregandoUsuario] = useState(!MODO_DEMO)
  const [carrinho, setCarrinho] = useState(() => lerJson(CHAVE_CARRINHO, []))
  const [contextoWhats, setContextoWhats] = useState('')
  const [aviso, setAviso] = useState(null)
  const [promocoes, setPromocoes] = useState([])
  const [adicionado, setAdicionado] = useState(null)

  const recarregarConfig = useCallback(() => db.config().then(setConfig).catch(() => {}), [])
  useEffect(() => {
    recarregarConfig()
  }, [recarregarConfig])

  const recarregarPromocoes = useCallback(
    () =>
      db
        .listar('promocoes')
        .then(setPromocoes)
        .catch(() => setPromocoes([])),
    []
  )
  useEffect(() => {
    recarregarPromocoes()
  }, [recarregarPromocoes])

  useEffect(() => {
    gravarJson(CHAVE_CARRINHO, carrinho)
  }, [carrinho])

  useEffect(() => {
    if (MODO_DEMO) return
    let cancelado = false
    let assinatura
    supabase().then(async (c) => {
      const carregarPerfil = async (sessao) => {
        if (!sessao?.user) return setUsuario(null)
        const { data } = await c.from('perfis').select('*').eq('id', sessao.user.id).maybeSingle()
        if (!cancelado) setUsuario({ id: sessao.user.id, email: sessao.user.email, nome: data?.nome || '', papel: data?.papel || 'cliente' })
      }
      const { data } = await c.auth.getSession()
      await carregarPerfil(data.session)
      if (!cancelado) setCarregandoUsuario(false)
      assinatura = c.auth.onAuthStateChange((_e, sessao) => carregarPerfil(sessao)).data.subscription
    })
    return () => {
      cancelado = true
      assinatura?.unsubscribe()
    }
  }, [])

  const entrarAdmin = useCallback(async (email, senha) => {
    if (MODO_DEMO) {
      const u = { id: 'admin-demo', nome: 'Ateliê', email: email || 'demo', papel: 'admin' }
      gravarJson(CHAVE_ADMIN, u)
      setUsuario(u)
      return
    }
    const c = await supabase()
    const { error } = await c.auth.signInWithPassword({ email, password: senha })
    if (error) throw new Error(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message)
  }, [])

  const sair = useCallback(async () => {
    if (MODO_DEMO) gravarJson(CHAVE_ADMIN, null)
    else await (await supabase()).auth.signOut()
    setUsuario(null)
  }, [])

  const adicionarAoCarrinho = useCallback((item, { mostrar = true } = {}) => {
    const novo = { chave: Math.random().toString(36).slice(2), ...item }
    setCarrinho((c) => [...c, novo])
    if (mostrar) setAdicionado({ ...novo, quando: Date.now() })
  }, [])
  const alterarItem = useCallback((chave, patch) => setCarrinho((c) => c.map((i) => (i.chave === chave ? { ...i, ...patch } : i))), [])
  const removerItem = useCallback((chave) => setCarrinho((c) => c.filter((i) => i.chave !== chave)), [])
  const limparCarrinho = useCallback(() => setCarrinho([]), [])

  const notificar = useCallback((texto, tipo = 'ok') => {
    setAviso({ texto, tipo, id: Date.now() })
    setTimeout(() => setAviso((a) => (a?.texto === texto ? null : a)), 3800)
  }, [])

  const categorias = config.categorias?.lista?.length ? config.categorias.lista : CONFIG_PADRAO.categorias.lista

  const valor = useMemo(
    () => ({
      config,
      categorias,
      recarregarConfig,
      usuario,
      carregandoUsuario,
      ehAdmin: usuario?.papel === 'admin',
      entrarAdmin,
      sair,
      carrinho,
      adicionarAoCarrinho,
      alterarItem,
      removerItem,
      limparCarrinho,
      contextoWhats,
      setContextoWhats,
      aviso,
      notificar,
      promocoes,
      recarregarPromocoes,
      adicionado,
      setAdicionado,
    }),
    [config, categorias, recarregarConfig, usuario, carregandoUsuario, entrarAdmin, sair, carrinho, adicionarAoCarrinho, alterarItem, removerItem, limparCarrinho, contextoWhats, aviso, notificar, promocoes, recarregarPromocoes, adicionado]
  )

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export const useApp = () => useContext(Ctx)

export const nomeCategoria = (categorias, id) => categorias.find((c) => c.id === id)?.nome || id

export function useDados(carregar, deps = []) {
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)
  useEffect(() => {
    let vivo = true
    setErro(null)
    Promise.resolve()
      .then(carregar)
      .then((d) => vivo && setDados(d))
      .catch((e) => vivo && setErro(e.message))
    return () => {
      vivo = false
    }
  }, [...deps, versao])
  const recarregar = useCallback(() => setVersao((v) => v + 1), [])
  return [dados, recarregar, erro]
}

export function useWhats(texto) {
  const { setContextoWhats } = useApp()
  useEffect(() => {
    setContextoWhats(texto || '')
    return () => setContextoWhats('')
  }, [texto, setContextoWhats])
}

export function useAgora(intervalo = 1000, ligado = true) {
  const [agora, setAgora] = useState(() => Date.now())
  useEffect(() => {
    if (!ligado) return
    const t = setInterval(() => setAgora(Date.now()), intervalo)
    return () => clearInterval(t)
  }, [intervalo, ligado])
  return agora
}

export function usePreco(modelo, acrescimo = 0) {
  const { promocoes } = useApp()
  return precoDoModelo(modelo, promocoes, acrescimo)
}

export function precoDoModelo(modelo, promocoes, acrescimo = 0) {
  const cheio = Number(modelo?.preco_base || 0) + Number(acrescimo || 0)
  const promo = promocaoDe(modelo, promocoes)
  return { cheio, preco: comDesconto(cheio, promo), promo }
}
