import { Link, useParams } from 'react-router-dom'
import { db } from '../../lib/db'
import { useDados } from '../../lib/app'
import { OCASIOES, moeda } from '../../lib/format'
import { MiniaturaArte } from '../../components/Peca'
import { Carregando, Vazio } from '../../components/ui'

const TEXTOS = {
  aniversario: 'Nome, data e a flor preferida de quem faz aniversário.',
  maes: 'Tulipas, margaridas e cosmos para a mãe, com o nome dela em caligrafia.',
  casamento: 'Taças dos noivos, lembrancinhas para os convidados e presentes de bodas.',
  padrinhos: 'Convites para padrinhos que viram lembrança para sempre.',
  corporativo: 'Brindes de fim de ano e boas-vindas com a cara da sua empresa.',
}

export default function Presentes() {
  const { ocasiao } = useParams()
  const atual = ocasiao || 'aniversario'
  const [d] = useDados(async () => ({ artes: await db.listar('artes', { filtro: { ativo: true }, ordem: 'nome' }), modelos: await db.listar('modelos', { filtro: { disponivel: true } }) }))
  if (!d) return <Carregando />
  const artes = d.artes.filter((a) => a.ocasioes?.includes(atual))
  const modeloDe = (a) => d.modelos.find((m) => a.modelos_aceitos.includes(m.id))

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="sobretitulo">Ideias para presente</p>
      <h1 className="text-3xl sm:text-4xl">{OCASIOES.find((o) => o.id === atual)?.nome}</h1>
      <p className="mt-1 text-cinza">{TEXTOS[atual]}</p>
      <div className="rolagem-fina mt-5 flex gap-2 overflow-x-auto pb-1">
        {OCASIOES.map((o) => (
          <Link key={o.id} to={o.id === 'corporativo' ? '/corporativo' : `/presentes/${o.id}`} className={`chip shrink-0 ${o.id === atual ? 'chip-ativo' : ''}`}>
            {o.nome}
          </Link>
        ))}
      </div>
      <div className="mt-6">
        {artes.length === 0 ? (
          <Vazio titulo="Ainda não há artes para essa ocasião" acao={<Link to="/criar" className="btn-primario">Criar a minha</Link>} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {artes.map((a) => {
              const m = modeloDe(a)
              if (!m) return null
              return (
                <Link key={a.id} to={`/modelo/${m.id}?arte=${a.id}`} className="overflow-hidden rounded-3xl bg-white ring-1 ring-borda/70 transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="aspect-[4/5] bg-petala/60 p-3">{a.fotos?.[0] ? <img src={a.fotos[0]} alt="" className="size-full rounded-2xl object-cover" /> : <MiniaturaArte arte={a} modelo={m} pers={{ nome: 'Ana & Léo', data: '2026-11-21' }} />}</div>
                  <div className="p-4">
                    <p className="titulo text-lg">{a.nome}</p>
                    <p className="text-xs text-cinza">
                      {m.nome}, a partir de {moeda(Number(m.preco_base) + Number(a.acrescimo))}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
