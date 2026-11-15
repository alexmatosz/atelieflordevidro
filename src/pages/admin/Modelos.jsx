import { Link } from 'react-router-dom'
import { Eye, EyeOff, Plus } from 'lucide-react'
import { db } from '../../lib/db'
import { nomeCategoria, useApp, useDados } from '../../lib/app'
import { diasUteis, moeda, nomeMaterial } from '../../lib/format'
import { TituloPagina } from '../../components/Layout'
import { Carregando, Vazio } from '../../components/ui'
import Peca from '../../components/Peca'

export default function Modelos() {
  const { notificar, categorias } = useApp()
  const [modelos, recarregar] = useDados(() => db.listar('modelos', { ordem: 'nome' }))

  const alternar = async (m) => {
    await db.atualizar('modelos', m.id, { disponivel: !m.disponivel })
    notificar(m.disponivel ? `${m.nome} saiu do site.` : `${m.nome} voltou para o site.`)
    recarregar()
  }

  return (
    <div>
      <TituloPagina
        titulo="Peças"
        sub="As peças em branco que você pinta. Desative quando acabar o estoque."
        acao={
          <Link to="/admin/modelos/novo" className="btn-primario">
            <Plus className="size-4" /> Nova peça
          </Link>
        }
      />
      {!modelos ? (
        <Carregando />
      ) : modelos.length === 0 ? (
        <Vazio titulo="Nenhum modelo ainda" texto="Cadastre a primeira peça que você pinta." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {modelos.map((m) => {
            const baixo = Number(m.estoque) <= Number(m.estoque_minimo)
            return (
              <div key={m.id} className={`cartao flex gap-3 p-3 ${m.disponivel ? '' : 'opacity-70'}`}>
                <Link to={`/admin/modelos/${m.id}`} className="w-24 shrink-0 overflow-hidden rounded-xl bg-petala/60">
                  {m.fotos?.[0] ? <img src={m.fotos[0]} alt="" className="aspect-[4/5] w-full object-cover" /> : <Peca modelo={m} className="aspect-[4/5] w-full p-1" comSombra={false} ajustar />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link to={`/admin/modelos/${m.id}`} className="titulo truncate text-lg hover:text-rosa">
                    {m.nome}
                  </Link>
                  <p className="text-xs text-cinza">
                    {nomeCategoria(categorias, m.categoria)}, {nomeMaterial(m.material).toLowerCase()}{m.capacidade_ml ? `, ${m.capacidade_ml} ml` : ''}
                  </p>
                  <p className="mt-1 text-sm">
                    {moeda(m.preco_base)}, pintura em {diasUteis(m.prazo_producao_dias)}
                  </p>
                  <p className={`mt-1 text-xs font-semibold ${baixo ? 'text-rosa' : 'text-folha'}`}>
                    {m.estoque} em branco{baixo && ', estoque baixo'}
                  </p>
                  <button onClick={() => alternar(m)} className={`mt-auto self-start rounded-full px-3 py-1 text-xs font-bold ${m.disponivel ? 'bg-folha-clara text-folha' : 'bg-borda text-cinza'}`}>
                    {m.disponivel ? (
                      <>
                        <Eye className="mr-1 inline size-3.5" /> Visível no site
                      </>
                    ) : (
                      <>
                        <EyeOff className="mr-1 inline size-3.5" /> Oculto no site
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
