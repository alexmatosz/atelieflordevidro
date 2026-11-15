import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Brush, CalendarHeart, Cog, GlassWater, Images, KanbanSquare, LayoutDashboard, Menu, Package, Palette, Shapes, ShoppingBag, Building2, X } from 'lucide-react'
import { useApp } from '../lib/app'
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

export function Logo({ tamanho = 'size-12', comNome = true }) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Atelier Flor de Vidro, página inicial">
      <img src={`${BASE}logo-pequena.webp`} alt="" className={`${tamanho} shrink-0 rounded-full ring-1 ring-borda`} />
      {comNome && (
        <span className="leading-tight">
          <span className="titulo block text-[19px] text-grafite">Flor de Vidro</span>
          <span className="block text-[11px] tracking-[0.18em] text-rosa">PINTURA EM VIDRO</span>
        </span>
      )}
    </Link>
  )
}

function Toast() {
  const { aviso } = useApp()
  if (!aviso) return null
  return (
    <div role="status" className={`fixed inset-x-4 bottom-24 z-[60] mx-auto max-w-sm rounded-2xl px-4 py-3 text-sm font-medium shadow-lg sm:bottom-8 ${aviso.tipo === 'erro' ? 'bg-rosa-escuro text-white' : 'bg-grafite text-papel'}`}>
      {aviso.texto}
    </div>
  )
}

function BotaoWhatsApp() {
  const { config, contextoWhats } = useApp()
  const local = useLocation()
  if (local.pathname === '/carrinho') return null
  const texto = contextoWhats || 'Olá! Vim pelo site e tenho uma dúvida ♡'
  return (
    <a href={linkWhatsApp(config.loja?.whatsapp, texto)} target="_blank" rel="noreferrer" className="fixed bottom-5 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/15 transition hover:scale-105" aria-label="Conversar no WhatsApp">
      <IconeWhats className="size-7" />
    </a>
  )
}

const LINKS_LOJA = [
  { para: '/catalogo', nome: 'Peças' },
  { para: '/criar', nome: 'Crie sua arte' },
  { para: '/kit', nome: 'Kits' },
  { para: '/presentes', nome: 'Presentes' },
  { para: '/feitos-por-clientes', nome: 'Clientes' },
]

export function LayoutLoja() {
  const { carrinho, config } = useApp()
  const [menu, setMenu] = useState(false)
  const local = useLocation()
  useEffect(() => {
    setMenu(false)
    window.scrollTo(0, 0)
  }, [local.pathname])
  const qtd = carrinho.reduce((s, i) => s + i.quantidade, 0)
  const insta = (config.loja?.instagram || '').replace('@', '')

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-borda/70 bg-papel/92 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
            {LINKS_LOJA.map((l) => (
              <NavLink key={l.para} to={l.para} className={({ isActive }) => `text-[15px] transition ${isActive ? 'text-rosa underline decoration-ouro decoration-1 underline-offset-8' : 'text-ameixa hover:text-rosa'}`}>
                {l.nome}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <Link to="/carrinho" className="relative rounded-full p-2.5 text-ameixa hover:bg-petala" aria-label={`Sacola com ${qtd} peças`}>
              <ShoppingBag className="size-5" strokeWidth={1.6} />
              {qtd > 0 && <span className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-rosa text-[10px] font-semibold text-white">{qtd}</span>}
            </Link>
            <button className="rounded-full p-2.5 text-ameixa hover:bg-petala lg:hidden" onClick={() => setMenu((m) => !m)} aria-label="Abrir menu" aria-expanded={menu}>
              {menu ? <X className="size-5" /> : <Menu className="size-5" strokeWidth={1.6} />}
            </button>
          </div>
        </div>
        {menu && (
          <nav className="border-t border-borda/70 px-4 pb-4 pt-2 lg:hidden" aria-label="Menu">
            {[...LINKS_LOJA, { para: '/corporativo', nome: 'Para empresas' }, { para: '/datas', nome: 'Datas especiais' }].map((l) => (
              <NavLink key={l.para} to={l.para} className="titulo block border-b border-borda/50 px-1 py-3.5 text-xl text-grafite last:border-0">
                {l.nome}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-borda bg-petala/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo tamanho="size-16" />
            <p className="max-w-sm text-sm leading-relaxed text-cinza">{config.textos?.sobre}</p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="titulo mb-3 text-lg text-grafite">Loja</p>
            <Link to="/catalogo" className="block text-ameixa hover:text-rosa">Todas as peças</Link>
            <Link to="/criar" className="block text-ameixa hover:text-rosa">Crie sua arte</Link>
            <Link to="/datas" className="block text-ameixa hover:text-rosa">Datas especiais</Link>
            <Link to="/corporativo" className="block text-ameixa hover:text-rosa">Para empresas</Link>
            <Link to="/sobre" className="block text-ameixa hover:text-rosa">Cuidados e trocas</Link>
          </div>
          <div className="space-y-2 text-sm">
            <p className="titulo mb-3 text-lg text-grafite">Fale com a gente</p>
            <a href={linkWhatsApp(config.loja?.whatsapp, 'Olá! Vim pelo site ♡')} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-ameixa hover:text-rosa">
              <IconeWhats className="size-4" /> WhatsApp
            </a>
            {insta && (
              <a href={`https://www.instagram.com/${insta}/`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-ameixa hover:text-rosa">
                <IconeInsta className="size-4" /> @{insta}
              </a>
            )}
            {config.loja?.cidade && <p className="text-cinza">{config.loja.cidade}</p>}
          </div>
        </div>
        <p className="pb-8 text-center font-mao text-2xl text-rosa">feito com amor ♡</p>
      </footer>

      <BotaoWhatsApp />
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
