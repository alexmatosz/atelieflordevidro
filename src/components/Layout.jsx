import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Brush, CalendarHeart, Check, ChevronRight, Cog, GlassWater, Home, Images, KanbanSquare, LayoutDashboard, LayoutGrid, Menu, Package, Palette, Search, Shapes, ShoppingBag, Building2, Tag, X } from 'lucide-react'
import { useAgora, useApp } from '../lib/app'
import { nomeTipo, promosVigentes } from '../lib/promocoes'
import { mascaraFone, moeda } from '../lib/format'
import { MODO_DEMO } from '../lib/db'
import { linkWhatsApp } from '../lib/regras'
import { Campo, Carregando } from './ui'

const BASE = import.meta.env.BASE_URL

export function IconeWhats({ className = 'size-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function IconeInsta({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Logo({ tamanho = 'size-11', comNome = true }) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Atelier Flor de Vidro, página inicial">
      <img src={`${BASE}logo-pequena.webp`} alt="" className={`${tamanho} shrink-0 rounded-full ring-1 ring-borda`} />
      {comNome && (
        <span className="leading-tight">
          <span className="titulo block text-lg text-grafite">Flor de Vidro</span>
          <span className="block text-xs font-medium text-rosa">pintura à mão em vidro</span>
        </span>
      )}
    </Link>
  )
}

function Toast() {
  const { aviso } = useApp()
  if (!aviso) return null
  return (
    <div key={aviso.id} role="status" className={`fixed inset-x-4 bottom-24 z-[70] mx-auto max-w-sm animate-subir rounded-2xl px-4 py-3 text-sm font-medium shadow-lg lg:bottom-8 ${aviso.tipo === 'erro' ? 'bg-rosa-escuro text-white' : 'bg-grafite text-papel'}`}>
      {aviso.texto}
    </div>
  )
}

const SEM_BARRA = /^\/(modelo|criar|carrinho)/

function BotaoWhatsApp() {
  const { config, contextoWhats } = useApp()
  const local = useLocation()
  if (SEM_BARRA.test(local.pathname)) return null
  const texto = contextoWhats || 'Olá! Vim pelo site e tenho uma dúvida ♡'
  return (
    <a href={linkWhatsApp(config.loja?.whatsapp, texto)} target="_blank" rel="noreferrer" className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-40 flex size-[52px] items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/15 transition hover:scale-105 active:scale-95 lg:bottom-6 lg:size-14" aria-label="Conversar no WhatsApp">
      <IconeWhats className="size-7" />
    </a>
  )
}

const LINKS_LOJA = [
  { para: '/catalogo', nome: 'Peças' },
  { para: '/ofertas', nome: 'Ofertas' },
  { para: '/criar', nome: 'Crie sua arte' },
  { para: '/kit', nome: 'Kits' },
  { para: '/presentes', nome: 'Presentes' },
  { para: '/feitos-por-clientes', nome: 'Clientes' },
]

function IconeSacola() {
  const { carrinho } = useApp()
  const qtd = carrinho.reduce((s, i) => s + i.quantidade, 0)
  const [pulo, setPulo] = useState(0)
  const anterior = useRef(qtd)
  useEffect(() => {
    if (qtd > anterior.current) setPulo((p) => p + 1)
    anterior.current = qtd
  }, [qtd])
  return (
    <span key={pulo} className={`relative inline-flex ${pulo ? 'animate-pulo' : ''}`}>
      <ShoppingBag className="size-[22px]" strokeWidth={1.6} />
      {qtd > 0 && <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rosa px-1 text-[10px] font-bold text-white ring-2 ring-papel">{qtd}</span>}
    </span>
  )
}

function FaixaAvisos() {
  const { promocoes } = useApp()
  const agora = useAgora(60000)
  const avisos = [
    ...promosVigentes(promocoes, agora)
      .filter((p) => p.banner !== false)
      .map((p) => ({ texto: `${nomeTipo(p.tipo)}: ${p.titulo}`, para: '/ofertas' })),
    { texto: 'Pintado à mão e pedido pelo WhatsApp', para: '/sobre' },
  ]
  const [i, setI] = useState(0)
  useEffect(() => {
    if (avisos.length < 2) return
    const t = setInterval(() => setI((x) => x + 1), 5000)
    return () => clearInterval(t)
  }, [avisos.length])
  const a = avisos[i % avisos.length]
  return (
    <div className="bg-ameixa text-papel">
      <Link key={a.texto} to={a.para} className="mx-auto flex min-h-9 max-w-6xl animate-esmaecer items-center justify-center gap-1.5 px-4 py-1.5 text-center text-[13px] font-medium">
        {a.para === '/ofertas' && <Tag className="size-3.5 shrink-0 text-ouro" />}
        <span className="line-clamp-1">{a.texto}</span>
      </Link>
    </div>
  )
}

function Busca({ aoFechar }) {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  return (
    <form
      className="mx-auto flex max-w-6xl animate-esmaecer items-center gap-2 px-4 pb-3"
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        nav(`/catalogo${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)
        aoFechar()
      }}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-cinza" />
        <input autoFocus className="campo !rounded-full !pl-10" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Taça, caneca, tulipa, limão…" aria-label="Buscar peças" enterKeyHint="search" />
      </div>
      <button className="btn-primario !px-5">Buscar</button>
    </form>
  )
}

function MenuLateral({ aberto, aoFechar }) {
  const { config } = useApp()
  if (!aberto) return null
  const links = [
    { para: '/', nome: 'Início' },
    ...LINKS_LOJA,
    { para: '/datas', nome: 'Datas especiais' },
    { para: '/corporativo', nome: 'Para empresas' },
    { para: '/sobre', nome: 'Como comprar e cuidados' },
    { para: '/trocas', nome: 'Trocas e devoluções' },
  ]
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button className="absolute inset-0 animate-esmaecer bg-grafite/40" onClick={aoFechar} aria-label="Fechar menu" />
      <nav className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm animate-lateral flex-col bg-papel shadow-2xl">
        <div className="flex items-center justify-between border-b border-borda px-5 py-3">
          <Logo tamanho="size-10" />
          <button onClick={aoFechar} className="rounded-full p-2 text-ameixa hover:bg-petala" aria-label="Fechar menu">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {links.map((l, i) => (
            <NavLink key={l.para} to={l.para} end className={({ isActive }) => `flex animate-subir items-center justify-between border-b border-borda/60 py-3.5 text-lg ${isActive ? 'text-rosa' : 'text-grafite'}`} style={{ animationDelay: `${60 + i * 30}ms` }}>
              {l.nome} <ChevronRight className="size-4 text-cinza" />
            </NavLink>
          ))}
        </div>
        <a href={linkWhatsApp(config.loja?.whatsapp, 'Olá! Vim pelo site ♡')} target="_blank" rel="noreferrer" className="btn-whats m-5 mb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <IconeWhats /> Falar no WhatsApp
        </a>
      </nav>
    </div>
  )
}

function BarraInferior() {
  const local = useLocation()
  if (SEM_BARRA.test(local.pathname)) return null
  const itens = [
    { para: '/', nome: 'Início', icone: Home, fim: true },
    { para: '/catalogo', nome: 'Peças', icone: LayoutGrid },
    { para: '/ofertas', nome: 'Ofertas', icone: Tag },
    { para: '/criar', nome: 'Criar', icone: Brush },
  ]
  const classe = ({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition active:scale-90 ${isActive ? 'text-rosa' : 'text-cinza'}`
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-borda bg-papel/95 pb-seguro backdrop-blur lg:hidden" aria-label="Atalhos">
      <div className="grid grid-cols-5">
        {itens.map((it) => (
          <NavLink key={it.para} to={it.para} end={it.fim} className={classe}>
            <it.icone className="size-[22px]" strokeWidth={1.6} />
            {it.nome}
          </NavLink>
        ))}
        <NavLink to="/carrinho" className={classe}>
          <IconeSacola />
          Sacola
        </NavLink>
      </div>
    </nav>
  )
}

function AdicionadoSacola() {
  const { adicionado, setAdicionado, carrinho } = useApp()
  const local = useLocation()
  useEffect(() => {
    setAdicionado(null)
  }, [local.pathname, setAdicionado])
  if (!adicionado) return null
  const fechar = () => setAdicionado(null)
  const qtd = carrinho.reduce((s, i) => s + i.quantidade, 0)
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-start sm:justify-end sm:p-6 sm:pt-24" role="dialog" aria-modal="true" aria-label="Peça adicionada à sacola">
      <button className="absolute inset-0 animate-esmaecer bg-grafite/30" onClick={fechar} aria-label="Fechar" />
      <div className="relative w-full animate-folha rounded-t-3xl bg-papel p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-w-sm sm:animate-subir sm:rounded-3xl">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-borda sm:hidden" />
        <p className="flex items-center gap-2 font-semibold text-folha">
          <span className="flex size-6 items-center justify-center rounded-full bg-folha text-white">
            <Check className="size-4" strokeWidth={3} />
          </span>
          Adicionada à sacola
        </p>
        <div className="mt-4 flex gap-4">
          <div className="moldura aspect-[4/5] w-20 shrink-0">{adicionado.mockup && <img src={adicionado.mockup} alt="" className="size-full object-cover" />}</div>
          <div className="min-w-0">
            <p className="titulo leading-snug">{adicionado.descricao}</p>
            <p className="mt-1 text-sm text-cinza">
              {adicionado.quantidade} {adicionado.quantidade === 1 ? 'peça' : 'peças'}
              {adicionado.tipo === 'personalizada' ? ', valor a combinar' : `, ${moeda(adicionado.preco * adicionado.quantidade)}`}
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-2">
          <Link to="/carrinho" className="btn-primario !py-3" onClick={fechar}>
            Ver sacola e finalizar ({qtd})
          </Link>
          <button className="btn-secundario" onClick={fechar}>
            Continuar comprando
          </button>
        </div>
      </div>
    </div>
  )
}

function Rodape() {
  const { config } = useApp()
  const l = config.loja || {}
  const insta = (l.instagram || '').replace('@', '')
  const identificacao = [l.razao_social || l.nome, l.cnpj && `CNPJ ${l.cnpj}`, l.endereco].filter(Boolean)
  const grupo = (titulo, links) => (
    <div className="space-y-2.5 text-[15px]">
      <p className="titulo mb-3 text-lg text-grafite">{titulo}</p>
      {links.map(([para, nome]) => (
        <Link key={para} to={para} className="block text-ameixa transition-colors hover:text-rosa">
          {nome}
        </Link>
      ))}
    </div>
  )
  return (
    <footer className="mt-20 border-t border-borda bg-petala/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo tamanho="size-16" />
          <p className="max-w-sm text-sm leading-relaxed text-cinza">{config.textos?.sobre}</p>
        </div>
        {grupo('Loja', [
          ['/catalogo', 'Todas as peças'],
          ['/ofertas', 'Ofertas'],
          ['/criar', 'Crie sua arte'],
          ['/kit', 'Kits'],
          ['/corporativo', 'Para empresas'],
        ])}
        {grupo('Ajuda', [
          ['/sobre', 'Como comprar e cuidados'],
          ['/trocas', 'Trocas e devoluções'],
          ['/privacidade', 'Privacidade'],
          ['/datas', 'Datas especiais'],
        ])}
        <div className="space-y-2.5 text-[15px]">
          <p className="titulo mb-3 text-lg text-grafite">Atendimento</p>
          <a href={linkWhatsApp(l.whatsapp, 'Olá! Vim pelo site ♡')} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-ameixa hover:text-rosa">
            <IconeWhats className="size-4" /> {mascaraFone(String(l.whatsapp || '').replace(/^55/, ''))}
          </a>
          {insta && (
            <a href={`https://www.instagram.com/${insta}/`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-ameixa hover:text-rosa">
              <IconeInsta className="size-4" /> @{insta}
            </a>
          )}
          {l.email && (
            <a href={`mailto:${l.email}`} className="block break-all text-ameixa hover:text-rosa">
              {l.email}
            </a>
          )}
          {l.cidade && <p className="text-cinza">{l.cidade}</p>}
          <p className="pt-2 text-sm text-cinza">Pagamento por Pix ou cartão, combinado na conversa.</p>
        </div>
      </div>
      <div className="border-t border-borda/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-5 text-xs text-cinza sm:flex-row sm:justify-between lg:pb-5">
          <p>{identificacao.join(', ')}</p>
          <p>
            © {new Date().getFullYear()} {l.nome || 'Atelier Flor de Vidro'}. Pintado à mão.
          </p>
        </div>
      </div>
    </footer>
  )
}

export function LayoutLoja() {
  const [menu, setMenu] = useState(false)
  const [busca, setBusca] = useState(false)
  const local = useLocation()
  useEffect(() => {
    setMenu(false)
    setBusca(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [local.pathname, local.search])
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : ''
  }, [menu])

  return (
    <div className="flex min-h-dvh flex-col">
      <FaixaAvisos />
      <header className="sticky top-0 z-30 border-b border-borda/70 bg-papel/92 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
          <Logo />
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Principal">
            {LINKS_LOJA.map((l) => (
              <NavLink key={l.para} to={l.para} className={({ isActive }) => `relative py-1 text-[15px] font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-ouro after:transition-transform after:duration-300 ${isActive ? 'text-rosa after:scale-x-100' : 'text-ameixa after:scale-x-0 hover:text-rosa hover:after:scale-x-100'}`}>
                {l.nome}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center">
            <button className="rounded-full p-2.5 text-ameixa transition hover:bg-petala active:scale-90" onClick={() => setBusca((b) => !b)} aria-label="Buscar" aria-expanded={busca}>
              {busca ? <X className="size-[22px]" strokeWidth={1.6} /> : <Search className="size-[22px]" strokeWidth={1.6} />}
            </button>
            <Link to="/carrinho" className="hidden rounded-full p-2.5 text-ameixa transition hover:bg-petala active:scale-90 lg:inline-flex" aria-label="Sacola">
              <IconeSacola />
            </Link>
            <button className="rounded-full p-2.5 text-ameixa transition hover:bg-petala active:scale-90 lg:hidden" onClick={() => setMenu(true)} aria-label="Abrir menu" aria-expanded={menu}>
              <Menu className="size-[22px]" strokeWidth={1.6} />
            </button>
          </div>
        </div>
        {busca && <Busca aoFechar={() => setBusca(false)} />}
      </header>
      <MenuLateral aberto={menu} aoFechar={() => setMenu(false)} />

      <main className="flex-1">
        <Outlet />
      </main>

      <Rodape />
      <BotaoWhatsApp />
      <BarraInferior />
      <AdicionadoSacola />
      <Toast />
    </div>
  )
}

const LINKS_ADMIN = [
  { para: '/admin', nome: 'Visão geral', icone: LayoutDashboard, fim: true },
  { para: '/admin/pedidos', nome: 'Pedidos', icone: KanbanSquare },
  { para: '/admin/modelos', nome: 'Peças', icone: GlassWater },
  { para: '/admin/artes', nome: 'Artes', icone: Palette },
  { para: '/admin/elementos', nome: 'Desenhos do editor', icone: Shapes },
  { para: '/admin/promocoes', nome: 'Promoções', icone: Tag },
  { para: '/admin/kits', nome: 'Kits', icone: Package },
  { para: '/admin/galeria', nome: 'Feitos por clientes', icone: Images },
  { para: '/admin/corporativo', nome: 'Empresas', icone: Building2 },
  { para: '/admin/datas', nome: 'Datas especiais', icone: CalendarHeart },
  { para: '/admin/configuracoes', nome: 'Configurações', icone: Cog },
]

function EntrarAdmin() {
  const { entrarAdmin, usuario, sair, notificar } = useApp()
  const [f, setF] = useState({ email: '', senha: '' })
  const [enviando, setEnviando] = useState(false)
  const enviar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    try {
      await entrarAdmin(f.email, f.senha)
    } catch (err) {
      notificar(err.message, 'erro')
    } finally {
      setEnviando(false)
    }
  }
  return (
    <div className="flex min-h-dvh items-center justify-center bg-papel px-4">
      <form onSubmit={enviar} className="w-full max-w-sm space-y-4 text-center">
        <img src={`${BASE}logo.webp`} alt="Atelier Flor de Vidro" className="mx-auto size-40 rounded-full" />
        <h1 className="text-2xl">Área do ateliê</h1>
        {usuario && (
          <p className="text-sm text-rosa-escuro">
            Esta conta não tem acesso ao painel.{' '}
            <button type="button" className="underline" onClick={sair}>
              Sair
            </button>
          </p>
        )}
        {MODO_DEMO ? (
          <p className="text-sm text-cinza">Versão de demonstração: o painel abre sem senha e os dados ficam só neste navegador.</p>
        ) : (
          <div className="space-y-3 text-left">
            <Campo rotulo="E-mail">
              <input className="campo" type="email" required autoComplete="username" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </Campo>
            <Campo rotulo="Senha">
              <input className="campo" type="password" required autoComplete="current-password" value={f.senha} onChange={(e) => setF({ ...f, senha: e.target.value })} />
            </Campo>
          </div>
        )}
        <button className="btn-primario w-full" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar no painel'}
        </button>
        <Link to="/" className="block text-sm text-cinza hover:text-rosa">
          Voltar para a loja
        </Link>
      </form>
      <Toast />
    </div>
  )
}

export function LayoutAdmin() {
  const { ehAdmin, carregandoUsuario, sair } = useApp()
  const local = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [local.pathname])
  if (carregandoUsuario) return <Carregando />
  if (!ehAdmin) return <EntrarAdmin />

  return (
    <div className="min-h-dvh bg-[#f9f1f0]">
      {MODO_DEMO && <div className="bg-ameixa px-4 py-1.5 text-center text-xs text-papel">Demonstração: os dados ficam só neste navegador.</div>}
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-1 border-r border-borda bg-papel px-3 py-5 lg:flex">
          <div className="mb-5 px-2">
            <Logo tamanho="size-11" />
          </div>
          {LINKS_ADMIN.map((l) => (
            <NavLink key={l.para} to={l.para} end={l.fim} className={({ isActive }) => `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${isActive ? 'bg-rosa text-white' : 'text-ameixa hover:bg-petala'}`}>
              <l.icone className="size-4" strokeWidth={1.7} /> {l.nome}
            </NavLink>
          ))}
          <div className="mt-auto space-y-1 border-t border-borda pt-3">
            <Link to="/" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ameixa hover:bg-petala">
              <Brush className="size-4" /> Ver a loja
            </Link>
            <button onClick={sair} className="w-full rounded-xl px-3 py-2 text-left text-sm text-cinza hover:bg-petala">
              Sair do painel
            </button>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="sticky top-0 z-30 border-b border-borda bg-papel/95 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between px-4 py-2">
              <Logo tamanho="size-10" />
              <button onClick={sair} className="btn-fantasma !px-3">
                Sair
              </button>
            </div>
            <nav className="rolagem-fina flex gap-1 overflow-x-auto px-3 pb-2.5" aria-label="Painel">
              {LINKS_ADMIN.map((l) => (
                <NavLink key={l.para} to={l.para} end={l.fim} className={({ isActive }) => `flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${isActive ? 'bg-rosa text-white' : 'bg-white text-ameixa'}`}>
                  <l.icone className="size-3.5" /> {l.nome}
                </NavLink>
              ))}
            </nav>
          </div>
          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
      <Toast />
    </div>
  )
}

export function TituloPagina({ titulo, sub, acao }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl sm:text-3xl">{titulo}</h1>
        {sub && <p className="mt-1 text-sm text-cinza">{sub}</p>}
      </div>
      {acao}
    </div>
  )
}
