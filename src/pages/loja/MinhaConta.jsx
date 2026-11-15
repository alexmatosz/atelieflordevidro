import { Link, Navigate } from 'react-router-dom'
import { db } from '../../lib/db'
import { useApp, useDados } from '../../lib/app'
import { ETAPAS, STATUS_ANALISE, dataHora, moeda } from '../../lib/format'
import { Carregando, Vazio } from '../../components/ui'

export default function MinhaConta() {
  const { usuario, carregandoUsuario, sair, ehAdmin } = useApp()
  const [d] = useDados(async () => {
    if (!usuario) return null
    const [solicitacoes, pedidos] = await Promise.all([
      db.listar('solicitacoes_analise', { filtro: { cliente_id: usuario.id }, ordem: 'criado_em desc' }),
      db.listar('pedidos', { filtro: { cliente_id: usuario.id }, ordem: 'criado_em desc' }),
    ])
    return { solicitacoes, pedidos }
  }, [usuario?.id])

  if (carregandoUsuario) return <Carregando />
  if (!usuario) return <Navigate to="/entrar" replace />

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mao text-2xl text-terracota">olá,</p>
          <h1 className="text-3xl">{usuario.nome || usuario.email}</h1>
        </div>
        <div className="flex gap-2">
          {ehAdmin && (
            <Link to="/admin" className="btn-secundario">
              Painel
            </Link>
          )}
          <button onClick={sair} className="btn-fantasma">
            Sair
          </button>
        </div>
      </div>
      {!d ? (
        <Carregando />
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <section>
            <h2 className="mb-3 text-xl">Minhas artes em análise</h2>
            {d.solicitacoes.length === 0 ? (
              <Vazio titulo="Nenhuma arte enviada" acao={<Link to="/criar" className="btn-primario">Criar minha arte</Link>} />
            ) : (
              <div className="space-y-2">
                {d.solicitacoes.map((s) => (
                  <Link key={s.id} to={`/solicitacao/${s.id}`} className="cartao flex gap-3 p-3 hover:border-terracota">
                    <img src={s.mockup_frente} alt="" className="aspect-[4/5] w-16 rounded-lg bg-areia object-cover" />
                    <div className="text-sm">
                      <p className="font-bold">#{s.codigo}</p>
                      <span className={`selo ${STATUS_ANALISE[s.status].cor}`}>{STATUS_ANALISE[s.status].nome}</span>
                      <p className="mt-1 text-xs text-cinza">{dataHora(s.atualizado_em || s.criado_em)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
          <section>
            <h2 className="mb-3 text-xl">Meus pedidos</h2>
            {d.pedidos.length === 0 ? (
              <Vazio titulo="Nenhum pedido ainda" acao={<Link to="/catalogo" className="btn-primario">Ver modelos</Link>} />
            ) : (
              <div className="space-y-2">
                {d.pedidos.map((p) => (
                  <Link key={p.id} to={`/pedido/${p.id}`} className="cartao flex items-center justify-between gap-3 p-4 hover:border-terracota">
                    <div className="text-sm">
                      <p className="font-bold">Pedido #{p.numero}</p>
                      <p className="text-cinza">{dataHora(p.criado_em)}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold">{moeda(p.total)}</p>
                      <p className="text-xs text-terracota">{ETAPAS.find((e) => e.id === p.etapa)?.nome}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
