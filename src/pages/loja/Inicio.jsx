import { Link } from 'react-router-dom'
import { ArrowRight, Brush, Gift, Heart, Briefcase, Cake, Sparkles } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados } from '../../lib/app'
import { CATEGORIAS } from '../../lib/format'
import Peca from '../../components/Peca'
import { CartaoModelo } from '../../components/ui'

const PERS_DEMO = { nome: 'Helena', frase: 'Para brindar a vida', data: '2026-05-10' }

const IDEIAS = [
  { id: 'aniversario', nome: 'Aniversário', texto: 'Nome, data e a flor preferida.', icone: Cake },
  { id: 'casamento', nome: 'Casamento', texto: 'Taças dos noivos e lembrancinhas.', icone: Heart },
  { id: 'padrinhos', nome: 'Padrinhos', texto: 'Kits para convidar com carinho.', icone: Gift },
  { id: 'corporativo', nome: 'Corporativo', texto: 'Brindes com o logo da empresa.', icone: Briefcase },
]

export default function Inicio() {
  const { config } = useApp()
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
  const modelo = (id) => modelos.find((m) => m.id === id) || modelos.find((m) => m.forma === id)
  const vitrine = [
    { m: modelo('taca-bordeaux') || modelo('taca'), a: arte('floral-aquarela') },
    { m: modelo('caneca-300') || modelo('caneca'), a: arte('nome-caligrafia') },
    { m: modelo('garrafa-vidro') || modelo('garrafa'), a: arte('ramo-minimalista') },
  ].filter((v) => v.m)
  const maisVendidos = modelos.filter((m) => m.mais_vendido).slice(0, 4)
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
      <section className="relative overflow-hidden bg-areia/70 textura">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-10 pt-10 md:grid-cols-[1.05fr_1fr] md:pb-16 md:pt-16">
          <div>
            <p className="font-mao text-2xl text-terracota">nada de adesivo, nada de impressão</p>
            <h1 className="mt-1 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              Pintado à mão,
              <br />
              <em className="font-light text-terracota-escuro">uma peça de cada vez.</em>
            </h1>
            <p className="mt-5 max-w-md text-base text-cinza sm:text-lg">
              Copos, canecas, taças e garrafas pintados com pincel no nosso ateliê. Escolha uma arte pronta ou desenhe a sua e o artesão diz se consegue pintar.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/catalogo" className="btn-primario !px-6 !py-3 text-base">
                Escolher minha peça <ArrowRight className="size-4" />
              </Link>
              <Link to="/criar" className="btn-secundario !px-6 !py-3 text-base">
                <Brush className="size-4" /> Criar minha arte
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-cinza">
              <Sparkles className="size-4 text-mel" /> Cada peça leva um número de série pintado na base.
            </p>
          </div>
          <div className="relative mx-auto flex w-full max-w-md items-end justify-center">
            {vitrine.map((v, i) => (
              <div key={i} className={`${i === 1 ? 'z-10 w-[44%] -mx-4' : 'w-[36%]'} ${i === 0 ? 'translate-y-4 -rotate-3' : i === 2 ? 'translate-y-6 rotate-3' : ''}`}>
                <Peca modelo={v.m} desenho={v.a?.desenho} pers={PERS_DEMO} className="w-full drop-shadow-xl" />
              </div>
            ))}
            <span className="absolute -bottom-2 right-0 rotate-[-4deg] rounded-full bg-white px-3 py-1 font-mao text-lg text-argila shadow">feito à mão ♥</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12">
        <h2 className="text-2xl sm:text-3xl">O que vamos pintar?</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {CATEGORIAS.map((c) => {
            const exemplo = modelos.find((m) => m.categoria === c.id)
            return (
              <Link key={c.id} to={`/catalogo?categoria=${c.id}`} className="group overflow-hidden rounded-3xl bg-white ring-1 ring-linho/70 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="aspect-square bg-gradient-to-b from-areia/40 to-areia">
                  <Peca modelo={exemplo || { forma: c.forma, material: 'vidro' }} desenho={arte(['floral-aquarela', 'margaridas', 'casamento-aliancas', 'ceu-estrelado'][CATEGORIAS.indexOf(c)])?.desenho} pers={PERS_DEMO} className="size-full p-3 transition duration-500 group-hover:scale-105" />
                </div>
                <p className="titulo flex items-center justify-between px-4 py-3 text-lg">
                  {c.nome} <ArrowRight className="size-4 text-terracota opacity-0 transition group-hover:opacity-100" />
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      {maisVendidos.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl">Mais vendidos</h2>
            <Link to="/catalogo" className="text-sm font-semibold text-terracota">
              Ver todos
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {maisVendidos.map((m) => (
              <CartaoModelo key={m.id} modelo={m} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pt-14">
        <h2 className="text-2xl sm:text-3xl">Ideias para presente</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {IDEIAS.map((i) => (
            <Link key={i.id} to={i.id === 'corporativo' ? '/corporativo' : `/presentes/${i.id}`} className="rounded-3xl bg-white p-5 ring-1 ring-linho/70 transition hover:ring-terracota">
              <i.icone className="size-6 text-terracota" />
              <p className="titulo mt-3 text-xl">{i.nome}</p>
              <p className="mt-1 text-sm text-cinza">{i.texto}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl px-4">
        <div className="grid items-center gap-6 overflow-hidden rounded-[2rem] bg-argila p-6 text-creme sm:p-10 md:grid-cols-2">
          <div>
            <p className="font-mao text-2xl text-mel">o nosso diferencial</p>
            <h2 className="mt-1 text-3xl sm:text-4xl">Crie sua arte e mande para o artesão</h2>
            <p className="mt-3 text-linho">Escreva nomes, escolha flores e corações da nossa biblioteca, envie uma foto de referência. Em até 2 dias úteis você recebe o preço e o prazo, ou uma sugestão de ajuste.</p>
            <ol className="mt-5 space-y-2 text-sm">
              {['Escolha o modelo', 'Monte o desenho no editor', 'Receba preço e prazo', 'Aprovou? Vira pedido com um clique'].map((p, i) => (
                <li key={p} className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-mel text-xs font-bold text-argila">{i + 1}</span> {p}
                </li>
              ))}
            </ol>
            <Link to="/criar" className="btn mt-6 bg-creme text-argila hover:bg-white">
              <Brush className="size-4" /> Abrir o editor
            </Link>
          </div>
          <div className="mx-auto w-56 sm:w-64">
            {modelo('caneca') && <Peca modelo={modelo('caneca-300') || modelo('caneca')} desenho={arte('ceu-estrelado')?.desenho} pers={{ nome: 'Theo' }} mostrarArea className="w-full" />}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-3 px-4 pt-14 md:grid-cols-2">
        <Link to="/kit" className="rounded-3xl bg-salvia-clara p-6 transition hover:shadow-lg">
          <p className="font-mao text-xl text-salvia">combina tudo</p>
          <p className="titulo text-2xl">Monte um kit</p>
          <p className="mt-1 text-sm text-cinza">Taças, garrafa e canecas com a mesma arte, com preço de kit.</p>
        </Link>
        {proxima && (
          <Link to="/datas" className="rounded-3xl bg-rosa/40 p-6 transition hover:shadow-lg">
            <p className="font-mao text-xl text-terracota">vem aí</p>
            <p className="titulo text-2xl">
              {proxima.nome} · {proxima.quando.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
            </p>
            <p className="mt-1 text-sm text-cinza">{proxima.descricao}</p>
          </Link>
        )}
      </section>

      {d?.galeria?.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-14">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl sm:text-3xl">Feitos por clientes</h2>
            <Link to="/feitos-por-clientes" className="text-sm font-semibold text-terracota">
              Ver galeria
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {d.galeria.slice(0, 4).map((g) => (
              <img key={g.id} src={g.foto} alt={g.legenda || 'Peça feita para cliente'} className="aspect-square w-full rounded-3xl object-cover" loading="lazy" />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 pt-16 text-center">
        <p className="font-mao text-2xl text-terracota">sobre o ateliê</p>
        <p className="titulo mt-2 text-2xl leading-snug sm:text-3xl">{config.textos?.sobre}</p>
      </section>
    </div>
  )
}
