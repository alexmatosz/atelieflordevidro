import { useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../lib/db'
import { useDados } from '../../lib/app'
import { STATUS_ANALISE, data, dataHora } from '../../lib/format'
import { TituloPagina } from '../../components/Layout'
import { Carregando, Vazio } from '../../components/ui'

const FILTROS = [
  { id: 'em_analise', nome: 'Esperando' },
  { id: 'ajuste_sugerido', nome: 'Ajuste sugerido' },
  { id: 'aprovado', nome: 'Aprovadas' },
  { id: 'convertido', nome: 'Viraram pedido' },
  { id: 'recusado', nome: 'Recusadas' },
]

export default function Analise() {
  const [filtro, setFiltro] = useState('em_analise')
  const [dados] = useDados(async () => ({
    lista: await db.listar('solicitacoes_analise', { ordem: 'criado_em desc' }),
    modelos: await db.listar('modelos'),
  }))
  if (!dados) return <Carregando />
  const lista = dados.lista.filter((s) => s.status === filtro)
  const nomeModelo = (id) => dados.modelos.find((m) => m.id === id)?.nome || 'Modelo removido'

  return (
    <div>
      <TituloPagina titulo="Fila de análise" sub="Artes criadas pelos clientes. Diga se consegue pintar, quanto custa e em quanto tempo." />
      <div className="rolagem-fina mb-4 flex gap-2 overflow-x-auto pb-1">
        {FILTROS.map((f) => (
          <button key={f.id} onClick={() => setFiltro(f.id)} className={`chip shrink-0 ${filtro === f.id ? 'chip-ativo' : ''}`}>
            {f.nome} <span className="opacity-70">({dados.lista.filter((s) => s.status === f.id).length})</span>
          </button>
        ))}
      </div>
      {lista.length === 0 ? (
        <Vazio titulo="Nada por aqui" texto={filtro === 'em_analise' ? 'Quando um cliente enviar uma arte, ela aparece nesta fila.' : undefined} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map((s) => (
            <Link key={s.id} to={`/admin/analise/${s.id}`} className="cartao flex gap-3 p-3 transition hover:border-terracota">
              <img src={s.mockup_frente} alt="" className="aspect-[4/5] w-24 shrink-0 rounded-xl bg-areia object-cover" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-bold">#{s.codigo}</p>
                <p className="truncate">{s.cliente_nome}</p>
                <p className="truncate text-cinza">{nomeModelo(s.modelo_id)}</p>
                <p className="mt-1 text-cinza">
                  {s.quantidade} un.{s.data_desejada && ` · para ${data(s.data_desejada)}`}
                </p>
                <span className={`selo mt-2 ${STATUS_ANALISE[s.status].cor}`}>{STATUS_ANALISE[s.status].nome}</span>
                <p className="mt-1 text-xs text-cinza">{dataHora(s.atualizado_em || s.criado_em)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
