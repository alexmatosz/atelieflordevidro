import { Link } from 'react-router-dom'
import { db } from '../../lib/db'
import { useDados } from '../../lib/app'
import { MiniaturaArte } from '../../components/Peca'
import { Carregando } from '../../components/ui'

export default function Datas() {
  const [d] = useDados(async () => ({
    datas: await db.listar('datas_comemorativas'),
    artes: await db.listar('artes', { filtro: { ativo: true } }),
    modelos: await db.listar('modelos', { filtro: { disponivel: true } }),
  }))
  if (!d) return <Carregando />
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const lista = d.datas
    .map((x) => {
      let quando = new Date(hoje.getFullYear(), x.mes - 1, x.dia)
      if (quando < hoje) quando = new Date(hoje.getFullYear() + 1, x.mes - 1, x.dia)
      return { ...x, quando, faltam: Math.round((quando - hoje) / 86400000) }
    })
    .sort((a, b) => a.quando - b.quando)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="sobretitulo">Calendário do ateliê</p>
      <h1 className="text-3xl sm:text-4xl">Datas comemorativas</h1>
      <p className="mt-1 text-cinza">A pintura à mão leva alguns dias. Encomende com pelo menos 3 semanas de folga.</p>
      <div className="mt-6 space-y-4">
        {lista.map((x) => {
          const artes = x.artes_sugeridas.map((id) => d.artes.find((a) => a.id === id)).filter(Boolean)
          return (
            <section key={x.id} className="cartao grid gap-4 p-5 md:grid-cols-[180px_1fr]">
              <div>
                <p className="titulo text-4xl leading-none text-rosa">{x.quando.toLocaleDateString('pt-BR', { day: '2-digit' })}</p>
                <p className="titulo text-lg capitalize">{x.quando.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                <p className={`mt-1 text-xs font-semibold ${x.faltam < 21 ? 'text-rosa' : 'text-cinza'}`}>{x.faltam === 0 ? 'é hoje!' : `faltam ${x.faltam} dias${x.faltam < 21 ? ' — corra!' : ''}`}</p>
              </div>
              <div>
                <p className="titulo text-xl">{x.nome}</p>
                <p className="text-sm text-cinza">{x.descricao}</p>
                {artes.length > 0 && (
                  <div className="rolagem-fina mt-3 flex gap-2 overflow-x-auto">
                    {artes.map((a) => {
                      const m = d.modelos.find((mm) => a.modelos_aceitos.includes(mm.id))
                      if (!m) return null
                      return (
                        <Link key={a.id} to={`/modelo/${m.id}?arte=${a.id}`} className="w-28 shrink-0 overflow-hidden rounded-2xl bg-petala/60 ring-1 ring-borda/70 hover:ring-rosa">
                          <div className="aspect-square">
                            <MiniaturaArte arte={a} modelo={m} />
                          </div>
                          <p className="truncate bg-white px-2 py-1 text-xs font-semibold">{a.nome}</p>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
