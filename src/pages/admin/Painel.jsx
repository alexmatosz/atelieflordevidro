import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { db } from '../../lib/db'
import { useDados } from '../../lib/app'
import { ETAPAS, dataHora, moeda } from '../../lib/format'
import { TituloPagina } from '../../components/Layout'
import { Carregando } from '../../components/ui'

export default function Painel() {
  const [d] = useDados(async () => {
    const [modelos, solicitacoes, pedidos, corporativos] = await Promise.all([
      db.listar('modelos'),
      db.listar('solicitacoes_analise', { ordem: 'criado_em desc' }),
      db.listar('pedidos', { ordem: 'criado_em desc' }),
      db.listar('pedidos_corporativos', { filtro: { status: 'novo' } }),
    ])
    return { modelos, solicitacoes, pedidos, corporativos }
  })
  if (!d) return <Carregando />

  const emAnalise = d.solicitacoes.filter((s) => s.status === 'em_analise')
  const baixo = d.modelos.filter((m) => Number(m.estoque) <= Number(m.estoque_minimo))
  const abertos = d.pedidos.filter((p) => p.etapa !== 'enviado')
  const mes = new Date().toISOString().slice(0, 7)
  const faturamento = d.pedidos.filter((p) => (p.criado_em || '').startsWith(mes)).reduce((s, p) => s + Number(p.total), 0)

  const cards = [
    { nome: 'Esperando sua análise', valor: emAnalise.length, para: '/admin/analise' },
    { nome: 'Pedidos em produção', valor: abertos.length, para: '/admin/pedidos' },
    { nome: 'Vendido neste mês', valor: moeda(faturamento), para: '/admin/pedidos' },
    { nome: 'Empresas aguardando', valor: d.corporativos.length, para: '/admin/corporativo' },
  ]

  return (
    <div>
      <TituloPagina titulo="Visão geral" sub="O que precisa da sua atenção hoje." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.nome} to={c.para} className="cartao p-4 transition hover:border-terracota">
            <p className="text-xs font-semibold uppercase tracking-wide text-cinza">{c.nome}</p>
            <p className="titulo mt-2 text-3xl">{c.valor}</p>
          </Link>
        ))}
      </div>

      {baixo.length > 0 && (
        <div className="mt-6 rounded-2xl border border-mel/60 bg-mel/10 p-4">
          <p className="flex items-center gap-2 font-semibold text-argila">
            <AlertTriangle className="size-4 text-mel" /> Estoque baixo de peças em branco
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {baixo.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2">
                <Link to={`/admin/modelos/${m.id}`} className="hover:text-terracota">
                  {m.nome}
                </Link>
                <span className="text-cinza">
                  {m.estoque} em estoque (mínimo {m.estoque_minimo}){!m.disponivel && ' · fora do site'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="cartao p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg">Últimas solicitações</h2>
            <Link to="/admin/analise" className="text-sm font-semibold text-terracota">
              Ver fila <ArrowRight className="inline size-3.5" />
            </Link>
          </div>
          {emAnalise.length === 0 ? (
            <p className="text-sm text-cinza">Nenhuma arte esperando análise.</p>
          ) : (
            <ul className="divide-y divide-linho/70">
              {emAnalise.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <Link to={`/admin/analise/${s.id}`} className="flex items-center justify-between gap-2 py-2.5 text-sm hover:text-terracota">
                    <span>
                      <b>#{s.codigo}</b> · {s.cliente_nome} · {s.quantidade} un.
                    </span>
                    <span className="text-xs text-cinza">{dataHora(s.criado_em)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="cartao p-4">
          <h2 className="mb-3 text-lg">Produção</h2>
          <div className="grid grid-cols-5 gap-2 text-center">
            {ETAPAS.map((e) => (
              <Link key={e.id} to="/admin/pedidos" className="rounded-xl bg-areia/60 px-1 py-3 hover:bg-areia">
                <p className="titulo text-2xl">{d.pedidos.filter((p) => p.etapa === e.id).length}</p>
                <p className="text-[11px] leading-tight text-cinza">{e.nome}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
