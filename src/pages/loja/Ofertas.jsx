import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { db } from '../../lib/db'
import { useAgora, useApp, useDados } from '../../lib/app'
import { nomeTipo, promosVigentes, promoVale } from '../../lib/promocoes'
import { CartaoModelo, Carregando, Vazio } from '../../components/ui'
import { Contagem, Revelar } from '../../components/vitrine'

export const ESTILO_PROMO = {
  black: { fundo: 'bg-noite text-white', destaque: 'text-ouro', sub: 'text-white/75' },
  relampago: { fundo: 'bg-rosa text-white', destaque: 'text-white', sub: 'text-white/85' },
  semana: { fundo: 'bg-folha-clara text-grafite', destaque: 'text-folha', sub: 'text-cinza' },
  outra: { fundo: 'bg-petala text-grafite', destaque: 'text-rosa', sub: 'text-cinza' },
}

export function FaixaPromo({ promo, compacta = false }) {
  const e = ESTILO_PROMO[promo.tipo] || ESTILO_PROMO.outra
  const escuro = promo.tipo === 'black' || promo.tipo === 'relampago'
  return (
    <div className={`relative overflow-hidden rounded-[24px] px-5 py-6 sm:px-8 sm:py-8 ${e.fundo}`}>
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-lg">
          <p className={`flex items-center gap-1.5 text-sm font-semibold ${e.destaque}`}>
            {promo.tipo === 'relampago' && <Zap className="size-4 fill-current" />}
            {nomeTipo(promo.tipo)}
          </p>
          <h2 className={`mt-1 ${compacta ? 'text-2xl' : 'text-[28px] sm:text-4xl'}`}>{promo.titulo}</h2>
          {promo.descricao && <p className={`mt-2 text-[15px] leading-relaxed ${e.sub}`}>{promo.descricao}</p>}
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <p className={`titulo text-5xl leading-none sm:text-6xl ${e.destaque}`}>−{Number(promo.percentual)}%</p>
          {promo.fim && (
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${e.sub}`}>termina em</span>
              <Contagem fim={promo.fim} claro={escuro} />
            </div>
          )}
        </div>
      </div>
      <span aria-hidden="true" className={`pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border ${escuro ? 'border-white/15' : 'border-ouro/30'}`} />
      <span aria-hidden="true" className={`pointer-events-none absolute -right-6 -top-10 size-44 rounded-full border ${escuro ? 'border-white/10' : 'border-ouro/20'}`} />
    </div>
  )
}

export default function Ofertas() {
  const { promocoes } = useApp()
  const agora = useAgora(30000)
  const vigentes = promosVigentes(promocoes, agora)
  const [d] = useDados(async () => {
    const [modelos, artes] = await Promise.all([db.listar('modelos', { filtro: { disponivel: true }, ordem: 'nome' }), db.listar('artes', { filtro: { ativo: true } })])
    return { modelos, artes }
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <h1 className="text-[32px] sm:text-4xl">Ofertas</h1>
      <p className="mt-1 text-cinza">Black, ofertas relâmpago e o desconto da semana. O preço riscado é o preço normal da peça.</p>
      {!d ? (
        <Carregando />
      ) : vigentes.length === 0 ? (
        <div className="mt-8">
          <Vazio titulo="Nenhuma oferta no ar agora" texto="Siga o ateliê no Instagram para saber da próxima. Enquanto isso, veja as peças." acao={<Link to="/catalogo" className="btn-primario">Ver as peças</Link>} />
        </div>
      ) : (
        <div className="mt-8 space-y-14">
          {vigentes.map((p) => {
            const lista = d.modelos.filter((m) => promoVale(p, m))
            return (
              <section key={p.id}>
                <Revelar>
                  <FaixaPromo promo={p} />
                </Revelar>
                <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
                  {lista.map((m, i) => (
                    <Revelar key={m.id} atraso={(i % 4) * 70}>
                      <CartaoModelo modelo={m} artes={d.artes} />
                    </Revelar>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
