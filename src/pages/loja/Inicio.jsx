import { Link } from 'react-router-dom'
import { Brush, Camera, ChevronRight, PenLine, Truck } from 'lucide-react'
import { db } from '../../lib/db'
import { precoDoModelo, useAgora, useApp, useDados } from '../../lib/app'
import { promosVigentes, promoVale } from '../../lib/promocoes'
import Peca from '../../components/Peca'
import { CartaoModelo } from '../../components/ui'
import { Carrossel, Preco, Revelar, SeloPromo } from '../../components/vitrine'
import { IconeWhats } from '../../components/Layout'
import { FaixaPromo } from './Ofertas'

const BASE = import.meta.env.BASE_URL
const PERS = { nome: 'Helena', frase: 'para brindar a vida', data: '2026-05-10' }

const IDEIAS = [
  { para: '/presentes/maes', nome: 'Para a mãe' },
  { para: '/presentes/aniversario', nome: 'Aniversário' },
  { para: '/presentes/casamento', nome: 'Casamento' },
  { para: '/presentes/padrinhos', nome: 'Padrinhos' },
  { para: '/corporativo', nome: 'Empresas' },
]

const BENEFICIOS = [
  { icone: Brush, titulo: 'Pintura à mão', texto: 'Tinta e pincel, peça por peça' },
  { icone: PenLine, titulo: 'Do seu jeito', texto: 'Nome, frase, data e cor' },
  { icone: Camera, titulo: 'Foto antes do envio', texto: 'Você vê a peça pronta' },
  { icone: Truck, titulo: 'Para todo o Brasil', texto: 'Frete combinado no WhatsApp' },
]

function Moldura({ modelo, arte, className = '', pers = PERS }) {
  if (!modelo) return null
  return (
    <div className={`moldura aspect-[4/5] ${className}`}>
      <Peca modelo={modelo} desenho={arte?.desenho} pers={pers} className="zoom-suave size-full px-4 pb-3 pt-8" comSombra={false} ajustar />
    </div>
  )
}

function Cabecalho({ titulo, para, rotulo = 'Ver tudo' }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="text-[26px] text-grafite sm:text-3xl">{titulo}</h2>
      {para && (
        <Link to={para} className="group inline-flex shrink-0 items-center gap-0.5 pb-1 text-sm font-semibold text-rosa">
          {rotulo} <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}

export default function Inicio() {
  const { config, categorias, promocoes } = useApp()
  const agora = useAgora(60000)
  const [d] = useDados(async () => {
    const [modelos, artes, galeria, datas] = await Promise.all([
      db.listar('modelos', { filtro: { disponivel: true } }),
      db.listar('artes', { filtro: { ativo: true } }),
      db.listar('galeria_clientes', { filtro: { publicado: true, autorizado: true } }),
      db.listar('datas_comemorativas'),
    ])
    return { modelos, artes, galeria, datas }
  })
  const modelos = d?.modelos || []
  const artes = d?.artes || []
  const arte = (id) => artes.find((a) => a.id === id) || artes[0]
  const modelo = (id, forma) => modelos.find((m) => m.id === id) || modelos.find((m) => m.forma === forma)
  const vitrine = [
    { m: modelo('taca-bordeaux', 'taca'), a: arte('girassois') },
    { m: modelo('caneca-300', 'caneca'), a: arte('tulipas-rose') },
    { m: modelo('garrafa-vidro', 'garrafa'), a: arte('limao-siciliano') },
  ]
  const vigentes = promosVigentes(promocoes, agora)
  const banners = vigentes.filter((p) => p.banner !== false)
  const emOferta = modelos.filter((m) => vigentes.some((p) => promoVale(p, m))).slice(0, 4)
  const maisVendidos = [...modelos].sort((a, b) => Number(!!b.mais_vendido) - Number(!!a.mais_vendido)).slice(0, 4)
  const destaques = artes.filter((a) => a.mais_vendida).slice(0, 4)
  const hoje = new Date()
  const proxima = (d?.datas || [])
    .map((x) => {
      let quando = new Date(hoje.getFullYear(), x.mes - 1, x.dia)
      if (quando < hoje) quando = new Date(hoje.getFullYear() + 1, x.mes - 1, x.dia)
      return { ...x, quando }
    })
    .sort((a, b) => a.quando - b.quando)[0]

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-4 pt-6 text-center sm:pt-10">
        <img src={`${BASE}logo.webp`} alt="Atelier Flor de Vidro, pintura em vidro" className="mx-auto w-28 animate-subir rounded-full sm:w-44" width="176" height="176" />
        <h1 className="mx-auto mt-4 max-w-2xl animate-subir text-[30px] leading-[1.15] text-grafite [animation-delay:80ms] sm:text-5xl">Pintura à mão em taças, canecas e garrafas</h1>
        <p className="mx-auto mt-3 max-w-md animate-subir text-[16px] leading-relaxed text-cinza [animation-delay:160ms] sm:text-[17px]">Cada peça é pintada com pincel, uma de cada vez, em {config.loja?.cidade || 'Sombrio, SC'}. Escolha a arte ou crie a sua.</p>
        <div className="mt-6 flex animate-subir flex-col justify-center gap-2.5 [animation-delay:240ms] sm:flex-row sm:gap-3">
          <Link to="/catalogo" className="btn-primario !px-7 !py-3 text-base">
            Escolher minha peça
          </Link>
          <Link to="/criar" className="btn-secundario !px-7 !py-3 text-base">
            Criar minha arte
          </Link>
        </div>
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 items-end gap-3 sm:mt-12 sm:gap-6">
          {vitrine.map((v, i) => (
            <Link key={i} to={v.m ? `/modelo/${v.m.id}?arte=${v.a?.id}` : '/catalogo'} className={`group animate-subir ${i === 1 ? '' : 'mb-5 sm:mb-10'}`} style={{ animationDelay: `${320 + i * 110}ms` }}>
              <Moldura modelo={v.m} arte={v.a} />
              <p className="mt-2 text-[13px] font-semibold text-ameixa sm:text-[15px]">{v.a?.nome}</p>
            </Link>
          ))}
        </div>
      </section>

      {banners.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-8">
          <Carrossel rotulo="Promoções" automatico={6000} setas={banners.length > 1} pontosClaros className="overflow-hidden rounded-[24px]" classeSlide="flex">
            {banners.map((p) => (
              <Link key={p.id} to="/ofertas" className="block w-full">
                <div className="h-full [&>div]:h-full [&>div]:pb-10 sm:[&>div]:pb-8">
                  <FaixaPromo promo={p} />
                </div>
              </Link>
            ))}
          </Carrossel>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pt-8">
        <ul className="sem-barra -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0">
          {BENEFICIOS.map((b, i) => (
            <Revelar as="li" key={b.titulo} atraso={i * 70} className="flex w-[70%] shrink-0 snap-start items-center gap-3 rounded-2xl border border-borda bg-white px-4 py-3.5 sm:w-auto">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-petala text-rosa">
                <b.icone className="size-5" strokeWidth={1.7} />
              </span>
              <span className="leading-tight">
                <span className="block text-[15px] font-semibold text-grafite">{b.titulo}</span>
                <span className="text-[13px] text-cinza">{b.texto}</span>
              </span>
            </Revelar>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14">
        <Revelar>
          <Cabecalho titulo="Escolha a peça" para="/catalogo" />
        </Revelar>
        <div className="sem-barra -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:px-0">
          {categorias.map((c, i) => {
            const m = modelos.find((x) => x.categoria === c.id)
            const a = m && (artes.find((x) => x.mais_vendida && x.modelos_aceitos?.includes(m.id)) || artes.find((x) => x.modelos_aceitos?.includes(m.id)))
            return (
              <Revelar key={c.id} atraso={i * 60} className="w-[38%] shrink-0 snap-start sm:w-auto">
                <Link to={`/catalogo?categoria=${c.id}`} className="group block text-center">
                  <div className="moldura aspect-[4/5]">{m?.fotos?.[0] ? <img src={m.fotos[0]} alt="" className="zoom-suave size-full object-cover" /> : <Peca modelo={m || { forma: c.forma, material: 'vidro' }} desenho={a?.desenho} pers={PERS} className="zoom-suave size-full px-4 pb-2 pt-7" comSombra={false} ajustar />}</div>
                  <p className="mt-2.5 text-[15px] font-semibold text-grafite transition-colors group-hover:text-rosa">{c.nome}</p>
                </Link>
              </Revelar>
            )
          })}
        </div>
      </section>

      {emOferta.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-16">
          <Revelar>
            <Cabecalho titulo="Em oferta agora" para="/ofertas" rotulo="Todas as ofertas" />
          </Revelar>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {emOferta.map((m, i) => (
              <Revelar key={m.id} atraso={i * 80}>
                <CartaoModelo modelo={m} artes={artes} />
              </Revelar>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pt-16">
        <Revelar>
          <Cabecalho titulo="Mais vendidas" para="/catalogo" />
        </Revelar>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {maisVendidos.map((m, i) => (
            <Revelar key={m.id} atraso={i * 80}>
              <CartaoModelo modelo={m} artes={artes} />
            </Revelar>
          ))}
        </div>
      </section>

      {destaques.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-16">
          <Revelar>
            <Cabecalho titulo="As artes mais pedidas" />
          </Revelar>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {destaques.map((a, i) => {
              const m = modelos.find((x) => a.modelos_aceitos.includes(x.id) && x.forma === 'caneca') || modelos.find((x) => a.modelos_aceitos.includes(x.id))
              if (!m) return null
              const { preco, cheio, promo } = precoDoModelo(m, promocoes, a.acrescimo)
              return (
                <Revelar key={a.id} atraso={i * 80}>
                  <Link to={`/modelo/${m.id}?arte=${a.id}`} className="group block text-center">
                    <div className="relative">
                      <Moldura modelo={m} arte={a} />
                      <SeloPromo promo={promo} className="absolute left-3 top-[18%] z-10" />
                    </div>
                    <p className="titulo mt-3 text-[17px] text-grafite group-hover:text-rosa">{a.nome}</p>
                    <Preco preco={preco} cheio={cheio} prefixo="a partir de" className="justify-center" />
                  </Link>
                </Revelar>
              )
            })}
          </div>
        </section>
      )}

      <section className="mt-16 bg-petala/70">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[1fr_1.1fr]">
          <Revelar className="mx-auto w-full max-w-[260px]">
            <Moldura modelo={modelo('caneca-300', 'caneca')} arte={arte('lacinhos')} pers={{ nome: 'Ana' }} className="!bg-white" />
          </Revelar>
          <Revelar atraso={120}>
            <p className="sobretitulo">Do seu jeitinho</p>
            <h2 className="mt-1 text-3xl text-grafite sm:text-4xl">Crie a sua arte</h2>
            <p className="mt-3 max-w-md leading-relaxed text-cinza">Monte o desenho com as flores, frutinhas e lacinhos que a gente pinta, escreva o nome e mande uma foto de referência. A pintora vê tudo e responde pelo WhatsApp.</p>
            <ol className="mt-6 space-y-3">
              {['Escolha a peça', 'Monte o desenho no editor', 'Mande pelo WhatsApp com tudo pronto'].map((p, i) => (
                <li key={p} className="flex items-center gap-3">
                  <span className="titulo flex size-8 shrink-0 items-center justify-center rounded-full border border-ouro text-ouro-escuro">{i + 1}</span>
                  <span className="text-grafite">{p}</span>
                </li>
              ))}
            </ol>
            <Link to="/criar" className="btn-primario mt-7 w-full sm:w-auto">
              Abrir o editor
            </Link>
          </Revelar>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14 text-center">
        <Revelar>
          <h2 className="text-[26px] text-grafite sm:text-3xl">Ideias para presentear</h2>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {IDEIAS.map((i) => (
              <Link key={i.para} to={i.para} className="chip !px-5 !py-2 !text-[15px]">
                {i.nome}
              </Link>
            ))}
          </div>
        </Revelar>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pt-12 md:grid-cols-2">
        <Revelar>
          <Link to="/kit" className="group block h-full rounded-[22px] border border-borda bg-white p-6 transition hover:-translate-y-0.5 hover:border-rosa/40 hover:shadow-md sm:p-7">
            <p className="sobretitulo !text-folha">Tudo combinando</p>
            <p className="titulo mt-1 text-2xl text-grafite group-hover:text-rosa">Kits com a mesma arte</p>
            <p className="mt-2 text-cinza">Duas taças e uma garrafa, xícaras com pires, canecas do casal. Com desconto de kit.</p>
          </Link>
        </Revelar>
        {proxima && (
          <Revelar atraso={100}>
            <Link to="/datas" className="group block h-full rounded-[22px] border border-borda bg-white p-6 transition hover:-translate-y-0.5 hover:border-rosa/40 hover:shadow-md sm:p-7">
              <p className="sobretitulo">Próxima data especial</p>
              <p className="titulo mt-1 text-2xl text-grafite group-hover:text-rosa">
                {proxima.nome}, {proxima.quando.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
              </p>
              <p className="mt-2 text-cinza">{proxima.descricao}</p>
            </Link>
          </Revelar>
        )}
      </section>

      {d?.galeria?.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-16">
          <Revelar>
            <Cabecalho titulo="Feitas para clientes" para="/feitos-por-clientes" rotulo="Ver fotos" />
          </Revelar>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {d.galeria.slice(0, 4).map((g, i) => (
              <Revelar key={g.id} atraso={i * 70}>
                <div className="moldura aspect-[4/5]">
                  <img src={g.foto} alt={g.legenda || 'Peça pintada para cliente'} className="size-full object-cover" loading="lazy" />
                </div>
              </Revelar>
            ))}
          </div>
        </section>
      )}

      <Revelar as="section" className="mx-auto max-w-2xl px-4 pt-16 text-center">
        <p className="titulo text-[22px] leading-snug text-grafite sm:text-[28px]">{config.textos?.sobre}</p>
        <a href={`https://wa.me/${config.loja?.whatsapp}?text=${encodeURIComponent('Olá! Vim pelo site ♡')}`} target="_blank" rel="noreferrer" className="btn-whats mt-8">
          <IconeWhats /> Conversar com o ateliê
        </a>
      </Revelar>
    </div>
  )
}
