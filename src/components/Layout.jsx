import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import {
  Brush,
  CalendarHeart,
  ClipboardCheck,
  Cog,
  GlassWater,
  Images,
  KanbanSquare,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Package,
  Palette,
  Shapes,
  ShoppingBag,
  Building2,
  User,
  X,
} from 'lucide-react'
import { useApp } from '../lib/app'
import { MODO_DEMO } from '../lib/db'
import { linkWhatsApp } from '../lib/regras'
import { Carregando } from './ui'

export function Logo({ claro = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Ateliê Flor de Vidro — início">
      <svg viewBox="0 0 64 64" className="size-9 shrink-0" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill={claro ? '#f8f3ec' : '#b4673f'} />
        <g fill={claro ? '#b4673f' : '#f8f3ec'}>
          <circle cx="32" cy="21" r="7" />
          <circle cx="22" cy="29" r="7" />
          <circle cx="42" cy="29" r="7" />
          <circle cx="26" cy="40" r="7" />
          <circle cx="38" cy="40" r="7" />
        </g>
        <circle cx="32" cy="31" r="5" fill="#e3b25a" />
      </svg>
      <span className="leading-none">
        <span className={`titulo block text-lg font-semibold ${claro ? 'text-creme' : 'text-tinta'}`}>Flor de Vidro</span>
        <span className={`font-mao text-base ${claro ? 'text-linho' : 'text-terracota'}`}>ateliê de pintura à mão</span>
      </span>
    </Link>
  )
}

function Toast() {
  const { aviso } = useApp()
  if (!aviso) return null
  return (
    <div role="status" className={`fixed inset-x-4 bottom-24 z-[60] mx-auto max-w-sm rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg sm:bottom-8 ${aviso.tipo === 'erro' ? 'bg-terracota-escuro text-white' : 'bg-tinta text-creme'}`}>
      {aviso.texto}
    </div>
  )
}

function BotaoWhatsApp() {
  const { config, contextoWhats } = useApp()
  const texto = contextoWhats || `Olá! Vim pelo site do ${config.loja?.nome || 'ateliê'} e tenho uma dúvida.`
  return (
    <a
      href={linkWhatsApp(config.loja?.whatsapp, texto)}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#1f9d55] py-3 pl-3 pr-4 text-sm font-bold text-white shadow-lg shadow-[#1f9d55]/30 transition hover:scale-105"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="size-6" />
      <span className="hidden sm:inline">Fale com o ateliê</span>
    </a>
  )
}

function FaixaDemo() {
  const { ehAdmin } = useApp()
  if (!MODO_DEMO) return null
  if (ehAdmin) return <div className="bg-argila px-4 py-1.5 text-center text-xs text-creme">Modo demonstração: os dados ficam só neste navegador.</div>
  return (
    <div className="bg-argila px-4 py-1.5 text-center text-xs text-creme">
      Modo demonstração: os dados ficam só neste navegador. <Link to="/entrar" className="underline underline-offset-2">Entrar como vendedor</Link> para ver o painel.
    </div>
  )
}

const LINKS_LOJA = [
  { para: '/catalogo', nome: 'Modelos' },
  { para: '/criar', nome: 'Crie sua arte' },
  { para: '/kit', nome: 'Monte um kit' },
  { para: '/presentes', nome: 'Presentes' },
  { para: '/feitos-por-clientes', nome: 'Feitos por clientes' },
]

export function LayoutLoja() {
  const { carrinho, usuario, ehAdmin, config } = useApp()
  const [menu, setMenu] = useState(false)
  const local = useLocation()
  useEffect(() => {
    setMenu(false)
    window.scrollTo(0, 0)
  }, [local.pathname])
  const qtd = carrinho.reduce((s, i) => s + i.quantidade, 0)

  return (
    <div className="flex min-h-dvh flex-col">
      <FaixaDemo />
      <header className="sticky top-0 z-30 border-b border-linho/60 bg-creme/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            {LINKS_LOJA.map((l) => (
              <NavLink key={l.para} to={l.para} className={({ isActive }) => `rounded-full px-3.5 py-2 text-sm font-semibold transition ${isActive ? 'bg-areia text-terracota-escuro' : 'text-argila hover:text-terracota'}`}>
                {l.nome}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            {ehAdmin && (
              <Link to="/admin" className="btn-fantasma hidden sm:inline-flex">
                <LayoutDashboard className="size-4" /> Painel
              </Link>
            )}
            <Link to={usuario ? '/minha-conta' : '/entrar'} className="rounded-full p-2.5 text-argila hover:bg-areia" aria-label={usuario ? 'Minha conta' : 'Entrar'}>
              <User className="size-5" />
            </Link>
            <Link to="/carrinho" className="relative rounded-full p-2.5 text-argila hover:bg-areia" aria-label={`Carrinho com ${qtd} peças`}>
              <ShoppingBag className="size-5" />
              {qtd > 0 && <span className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-terracota text-[10px] font-bold text-white">{qtd}</span>}
            </Link>
            <button className="rounded-full p-2.5 text-argila hover:bg-areia lg:hidden" onClick={() => setMenu((m) => !m)} aria-label="Abrir menu" aria-expanded={menu}>
              {menu ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {menu && (
          <nav className="border-t border-linho/60 px-4 pb-4 pt-2 lg:hidden" aria-label="Menu">
            {LINKS_LOJA.map((l) => (
              <NavLink key={l.para} to={l.para} className="block rounded-xl px-3 py-3 font-semibold text-argila hover:bg-areia">
                {l.nome}
              </NavLink>
            ))}
            <NavLink to="/corporativo" className="block rounded-xl px-3 py-3 font-semibold text-argila hover:bg-areia">
              Para empresas
            </NavLink>
            {ehAdmin && (
              <NavLink to="/admin" className="block rounded-xl px-3 py-3 font-semibold text-terracota hover:bg-areia">
                Painel do vendedor
              </NavLink>
            )}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 bg-argila text-creme">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Logo claro />
            <p className="text-sm text-linho">{config.textos?.sobre}</p>
          </div>
          <div>
            <p className="titulo mb-3 text-lg">Loja</p>
            <ul className="space-y-2 text-sm text-linho">
              <li><Link to="/catalogo" className="hover:text-white">Todos os modelos</Link></li>
              <li><Link to="/criar" className="hover:text-white">Crie sua arte</Link></li>
              <li><Link to="/kit" className="hover:text-white">Monte um kit</Link></li>
              <li><Link to="/datas" className="hover:text-white">Datas comemorativas</Link></li>
            </ul>
          </div>
          <div>
            <p className="titulo mb-3 text-lg">Atendimento</p>
            <ul className="space-y-2 text-sm text-linho">
              <li><Link to="/minha-conta" className="hover:text-white">Meus pedidos e análises</Link></li>
              <li><Link to="/corporativo" className="hover:text-white">Pedidos para empresas</Link></li>
              <li><Link to="/sobre" className="hover:text-white">Cuidados, trocas e envio</Link></li>
            </ul>
          </div>
          <div className="text-sm text-linho">
            <p className="titulo mb-3 text-lg text-creme">Contato</p>
            {config.loja?.cidade && <p>{config.loja.cidade}</p>}
            {config.loja?.email && <p>{config.loja.email}</p>}
            {config.loja?.instagram && <p>@{config.loja.instagram.replace('@', '')}</p>}
          </div>
        </div>
        <p className="border-t border-white/10 px-4 py-4 text-center text-xs text-linho">
          © {new Date().getFullYear()} {config.loja?.nome}. Cada peça pintada à mão, uma de cada vez.
        </p>
      </footer>

      <BotaoWhatsApp />
      <Toast />
    </div>
  )
}

const LINKS_ADMIN = [
  { para: '/admin', nome: 'Visão geral', icone: LayoutDashboard, fim: true },
  { para: '/admin/analise', nome: 'Fila de análise', icone: ClipboardCheck },
  { para: '/admin/pedidos', nome: 'Pedidos', icone: KanbanSquare },
  { para: '/admin/modelos', nome: 'Modelos', icone: GlassWater },
  { para: '/admin/artes', nome: 'Artes', icone: Palette },
  { para: '/admin/elementos', nome: 'Elementos do editor', icone: Shapes },
  { para: '/admin/kits', nome: 'Kits', icone: Package },
  { para: '/admin/galeria', nome: 'Feitos por clientes', icone: Images },
  { para: '/admin/corporativo', nome: 'Empresas', icone: Building2 },
  { para: '/admin/datas', nome: 'Datas comemorativas', icone: CalendarHeart },
  { para: '/admin/configuracoes', nome: 'Configurações', icone: Cog },
]

export function LayoutAdmin() {
  const { usuario, ehAdmin, carregandoUsuario, sair } = useApp()
  const local = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [local.pathname])
  if (carregandoUsuario) return <Carregando />
  if (!usuario) return <Navigate to="/entrar?voltar=/admin" replace />
  if (!ehAdmin) return <Navigate to="/" replace />

  return (
    <div className="min-h-dvh bg-[#f4efe8]">
      <FaixaDemo />
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-1 border-r border-linho/70 bg-creme px-3 py-5 lg:flex">
          <div className="mb-5 px-2">
            <Logo />
          </div>
          {LINKS_ADMIN.map((l) => (
            <NavLink key={l.para} to={l.para} end={l.fim} className={({ isActive }) => `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-terracota text-white' : 'text-argila hover:bg-areia'}`}>
              <l.icone className="size-4" /> {l.nome}
            </NavLink>
          ))}
          <div className="mt-auto space-y-1 border-t border-linho/70 pt-3">
            <Link to="/" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-argila hover:bg-areia">
              <Brush className="size-4" /> Ver a loja
            </Link>
            <button onClick={sair} className="w-full rounded-xl px-3 py-2 text-left text-sm text-cinza hover:bg-areia">
              Sair ({usuario.nome || usuario.email})
            </button>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="sticky top-0 z-30 border-b border-linho/70 bg-creme/95 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between px-4 py-2.5">
              <Logo />
              <Link to="/" className="btn-fantasma">Loja</Link>
            </div>
            <nav className="rolagem-fina flex gap-1 overflow-x-auto px-3 pb-2.5" aria-label="Painel">
              {LINKS_ADMIN.map((l) => (
                <NavLink key={l.para} to={l.para} end={l.fim} className={({ isActive }) => `flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${isActive ? 'bg-terracota text-white' : 'bg-white text-argila'}`}>
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
