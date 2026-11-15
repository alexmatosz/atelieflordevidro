import { Link } from 'react-router-dom'
import { db } from '../../lib/db'
import { useApp, useDados } from '../../lib/app'
import { moeda } from '../../lib/format'
import Peca from '../../components/Peca'
import { IconeWhats } from '../../components/Layout'

const BASE = import.meta.env.BASE_URL
const PERS = { nome: 'Helena', frase: 'para brindar a vida', data: '2026-05-10' }

const IDEIAS = [
  { para: '/presentes/maes', nome: 'Para a mãe' },
  { para: '/presentes/aniversario', nome: 'Aniversário' },
  { para: '/presentes/casamento', nome: 'Casamento' },
  { para: '/presentes/padrinhos', nome: 'Padrinhos' },
  { para: '/corporativo', nome: 'Empresas' },
]

function Moldura({ modelo, arte, className = '', pers = PERS }) {
  if (!modelo) return null
  return (
    <div className={`arco aspect-[4/5] overflow-hidden bg-petala ${className}`}>
      <Peca modelo={modelo} desenho={arte?.desenho} pers={pers} className="size-full px-3 pb-1 pt-6" comSombra={false} ajustar />
    </div>
  )
}

export default function Inicio() {
  const { config, categorias } = useApp()
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
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-8 text-center sm:pt-12">
        <img src={`${BASE}logo.webp`} alt="Atelier Flor de Vidro, pintura em vidro" className="mx-auto w-48 rounded-full sm:w-60" width="240" height="240" />
        <h1 className="mx-auto mt-4 max-w-2xl text-[34px] leading-[1.12] text-grafite sm:text-5xl">Pintura à mão em taças, canecas e garrafas</h1>
        <p className="mx-auto mt-4 max-w-lg text-[17px] leading-relaxed text-cinza">Cada peça é pintada com pincel, uma de cada vez, aqui em {config.loja?.cidade || 'Sombrio, SC'}. Escolha uma arte ou crie a sua e feche o pedido pelo WhatsApp.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/catalogo" className="btn-primario !px-7 !py-3 text-base">
            Escolher minha peça
          </Link>
          <Link to="/criar" className="btn-secundario !px-7 !py-3 text-base">
            Criar minha arte
          </Link>
        </div>
        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 items-end gap-3 sm:gap-5">
          {vitrine.map((v, i) => (
            <Link key={i} to={v.m ? `/modelo/${v.m.id}?arte=${v.a?.id}` : '/catalogo'} className={i === 1 ? '' : 'mb-6 sm:mb-10'}>
              <Moldura modelo={v.m} arte={v.a} />
              <p className="mt-2 font-mao text-xl text-rosa sm:text-2xl">{v.a?.nome}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14">
        <p className="ornamento mx-auto max-w-md">
          <span className="titulo text-2xl text-grafite sm:text-3xl">Escolha a peça</span>
        </p>
        <div className="rolagem-fina -mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-auto sm:grid sm:max-w-4xl sm:grid-cols-5 sm:px-0">
          {categorias.map((c) => {
            const m = modelos.find((x) => x.categoria === c.id)
            return (
              <Link key={c.id} to={`/catalogo?categoria=${c.id}`} className="group w-32 shrink-0 snap-start text-center sm:w-auto">
                <div className="arco aspect-[4/5] overflow-hidden bg-petala">
                  {m?.fotos?.[0] ? <img src={m.fotos[0]} alt="" className="size-full object-cover" /> : <Peca modelo={m || { forma: c.forma, material: 'vidro' }} className="size-full px-3 pt-5 transition duration-700 group-hover:scale-105" comSombra={false} ajustar />}
                </div>
                <p className="titulo mt-2 text-lg text-grafite group-hover:text-rosa">{c.nome}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {destaques.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-16">
          <p className="ornamento mx-auto max-w-md">
            <span className="titulo text-2xl text-grafite sm:text-3xl">As artes mais pedidas</span>
          </p>
          <div className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {destaques.map((a) => {
              const m = modelos.find((x) => a.modelos_aceitos.includes(x.id) && x.forma === 'caneca') || modelos.find((x) => a.modelos_aceitos.includes(x.id))
              if (!m) return null
              return (
                <Link key={a.id} to={`/modelo/${m.id}?arte=${a.id}`} className="group text-center">
                  <Moldura modelo={m} arte={a} />
                  <p className="titulo mt-3 text-lg text-grafite group-hover:text-rosa">{a.nome}</p>
                  <p className="text-sm text-cinza">a partir de {moeda(Number(m.preco_base) + Number(a.acrescimo))}</p>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pt-16 text-center">
        <p className="font-mao text-3xl text-rosa">ideias para presentear</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {IDEIAS.map((i) => (
            <Link key={i.para} to={i.para} className="chip !px-5 !py-2 !text-[15px]">
              {i.nome}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16 bg-petala/70">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[1fr_1.1fr]">
          <div className="mx-auto w-full max-w-[280px]">
            <Moldura modelo={modelo('caneca-300', 'caneca')} arte={arte('lacinhos')} pers={{ nome: 'Ana' }} className="bg-white" />
          </div>
          <div>
            <p className="font-mao text-3xl text-rosa">do seu jeitinho</p>
            <h2 className="mt-1 text-3xl text-grafite sm:text-4xl">Crie a sua arte</h2>
            <p className="mt-3 max-w-md leading-relaxed text-cinza">Monte o desenho com as flores, frutinhas e lacinhos que a gente pinta, escreva o nome, mande uma foto de referência. A pintora vê tudo e responde pelo WhatsApp.</p>
            <ol className="mt-6 space-y-3">
              {['Escolha a peça', 'Monte o desenho no editor', 'Mande pelo WhatsApp com tudo pronto'].map((p, i) => (
                <li key={p} className="flex items-center gap-3">
                  <span className="titulo flex size-8 items-center justify-center rounded-full border border-ouro text-ouro">{i + 1}</span>
                  <span className="text-grafite">{p}</span>
                </li>
              ))}
            </ol>
            <Link to="/criar" className="btn-primario mt-7">
              Abrir o editor
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pt-14 md:grid-cols-2">
        <Link to="/kit" className="group rounded-[22px] border border-borda bg-white p-7 transition hover:border-rosa/40">
          <p className="font-mao text-2xl text-folha">tudo combinando</p>
          <p className="titulo text-2xl text-grafite group-hover:text-rosa">Kits com a mesma arte</p>
          <p className="mt-2 text-cinza">Duas taças e uma garrafa, xícaras com pires, canecas do casal. Com desconto de kit.</p>
        </Link>
        {proxima && (
          <Link to="/datas" className="group rounded-[22px] border border-borda bg-white p-7 transition hover:border-rosa/40">
            <p className="font-mao text-2xl text-rosa">vem aí</p>
            <p className="titulo text-2xl text-grafite group-hover:text-rosa">
              {proxima.nome}, {proxima.quando.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
            </p>
            <p className="mt-2 text-cinza">{proxima.descricao}</p>
          </Link>
        )}
      </section>

      {d?.galeria?.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-16">
          <p className="ornamento mx-auto max-w-md">
            <span className="titulo text-2xl text-grafite sm:text-3xl">Feitas para clientes</span>
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {d.galeria.slice(0, 4).map((g) => (
              <img key={g.id} src={g.foto} alt={g.legenda || 'Peça pintada para cliente'} className="arco aspect-[4/5] w-full object-cover" loading="lazy" />
            ))}
          </div>
          <p className="mt-6 text-center">
            <Link to="/feitos-por-clientes" className="text-rosa underline decoration-ouro underline-offset-4">
              Ver todas as fotos
            </Link>
          </p>
        </section>
      )}

      <section className="mx-auto max-w-2xl px-4 pt-16 text-center">
        <p className="titulo text-2xl leading-snug text-grafite sm:text-[28px]">{config.textos?.sobre}</p>
        <a href={`https://wa.me/${config.loja?.whatsapp}?text=${encodeURIComponent('Olá! Vim pelo site ♡')}`} target="_blank" rel="noreferrer" className="btn-whats mt-8">
          <IconeWhats /> Conversar com o ateliê
        </a>
      </section>
    </div>
  )
}
