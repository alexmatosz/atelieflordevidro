import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados } from '../../lib/app'
import { promosVigentes } from '../../lib/promocoes'
import { ETAPAS, moeda } from '../../lib/format'
import { TituloPagina } from '../../components/Layout'
import { Carregando } from '../../components/ui'

export default function Painel() {
  const { config, promocoes } = useApp()
  const [d] = useDados(async () => {
    const [modelos, pedidos, corporativos] = await Promise.all([db.listar('modelos'), db.listar('pedidos', { ordem: 'criado_em desc' }), db.listar('pedidos_corporativos', { filtro: { status: 'novo' } })])
    return { modelos, pedidos, corporativos }
  })
  if (!d) return <Carregando />

  const baixo = d.modelos.filter((m) => Number(m.estoque) <= Number(m.estoque_minimo))
  const abertos = d.pedidos.filter((p) => p.etapa !== 'enviado')
  const mes = new Date().toISOString().slice(0, 7)
  const faturamento = d.pedidos.filter((p) => (p.criado_em || '').startsWith(mes)).reduce((s, p) => s + Number(p.total), 0)

  const cards = [
    { nome: 'Pedidos em produção', valor: abertos.length, para: '/admin/pedidos' },
    { nome: 'Vendido neste mês', valor: moeda(faturamento), para: '/admin/pedidos' },
    { nome: 'Peças no site', valor: d.modelos.filter((m) => m.disponivel).length, para: '/admin/modelos' },
    { nome: 'Promoções no ar', valor: promosVigentes(promocoes).length, para: '/admin/promocoes' },
  ]

  return (
    <div>
      <TituloPagina titulo="Visão geral" sub="Os pedidos chegam pelo WhatsApp. Registre cada um em Pedidos para acompanhar a pintura." />
      {(!config.loja?.cnpj || !config.loja?.endereco) && (
        <Link to="/admin/configuracoes" className="mb-4 flex items-start gap-3 rounded-2xl border border-ouro/50 bg-white p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-ouro-escuro" />
          <span>
            <b className="font-semibold">Falta o CNPJ (ou CPF) e o endereço da loja.</b> Quem vende pela internet precisa mostrar esses dados no site (Decreto nº 7.962/2013). Preencha em Configurações.
          </span>
        </Link>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.nome} to={c.para} className="cartao p-4 transition hover:border-rosa/40">
            <p className="text-sm text-cinza">{c.nome}</p>
            <p className="titulo mt-2 text-3xl">{c.valor}</p>
          </Link>
        ))}
      </div>

      {baixo.length > 0 && (
        <div className="mt-6 rounded-2xl border border-ouro/60 bg-ouro/10 p-4">
          <p className="flex items-center gap-2 font-medium text-ameixa">
            <AlertTriangle className="size-4 text-ouro" /> Estoque baixo de peças em branco
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {baixo.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2">
                <Link to={`/admin/modelos/${m.id}`} className="hover:text-rosa">
                  {m.nome}
                </Link>
                <span className="text-cinza">
                  {m.estoque} em estoque, mínimo {m.estoque_minimo}
                  {!m.disponivel && ', fora do site'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="cartao mt-6 p-4">
        <h2 className="mb-3 text-lg">Produção</h2>
        <div className="grid grid-cols-5 gap-2 text-center">
          {ETAPAS.map((e) => (
            <Link key={e.id} to="/admin/pedidos" className="rounded-xl bg-petala/60 px-1 py-3 hover:bg-petala">
              <p className="titulo text-2xl">{d.pedidos.filter((p) => p.etapa === e.id).length}</p>
              <p className="text-[11px] leading-tight text-cinza">{e.nome}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
