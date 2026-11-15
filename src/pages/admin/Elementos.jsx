import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados } from '../../lib/app'
import { GRUPOS_ELEMENTOS, dataUrlSvg, svgElemento } from '../../lib/elementos'
import { TituloPagina } from '../../components/Layout'
import { Campo, Carregando, EnviarImagens, Modal } from '../../components/ui'

export default function Elementos() {
  const { notificar } = useApp()
  const [lista, recarregar] = useDados(() => db.listar('elementos_editor', { ordem: 'nome' }))
  const [novo, setNovo] = useState(null)

  const salvar = async (e) => {
    e.preventDefault()
    if (!novo.imagem) return notificar('Envie a imagem do elemento.', 'erro')
    await db.inserir('elementos_editor', { ...novo, ativo: true })
    setNovo(null)
    notificar('Elemento adicionado à biblioteca.')
    recarregar()
  }

  return (
    <div>
      <TituloPagina
        titulo="Biblioteca do editor"
        sub="Os elementos que o cliente pode usar no “Crie sua arte”. Suba só o que você pinta bem."
        acao={
          <button className="btn-primario" onClick={() => setNovo({ nome: '', grupo: 'flores', imagem: null })}>
            <Plus className="size-4" /> Novo elemento
          </button>
        }
      />
      {!lista ? (
        <Carregando />
      ) : (
        GRUPOS_ELEMENTOS.map((g) => {
          const itens = lista.filter((e) => e.grupo === g.id)
          if (!itens.length) return null
          return (
            <section key={g.id} className="mb-6">
              <h2 className="mb-2 text-lg">{g.nome}</h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
                {itens.map((e) => (
                  <div key={e.id} className={`cartao p-2 ${e.ativo ? '' : 'opacity-50'}`}>
                    <div className="aspect-square rounded-xl bg-areia/50 p-2">
                      <img src={e.imagem || dataUrlSvg(svgElemento(e.svg, '#b4673f'))} alt={e.nome} className="size-full object-contain" />
                    </div>
                    <p className="mt-1.5 truncate text-xs font-semibold">{e.nome}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <button
                        className="text-[11px] font-semibold text-terracota"
                        onClick={async () => {
                          await db.atualizar('elementos_editor', e.id, { ativo: !e.ativo })
                          recarregar()
                        }}
                      >
                        {e.ativo ? 'Ocultar' : 'Mostrar'}
                      </button>
                      <button
                        className="text-cinza hover:text-terracota"
                        aria-label={`Excluir ${e.nome}`}
                        onClick={async () => {
                          if (!window.confirm(`Excluir "${e.nome}" da biblioteca?`)) return
                          await db.remover('elementos_editor', e.id)
                          recarregar()
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })
      )}

      <Modal aberto={!!novo} aoFechar={() => setNovo(null)} titulo="Novo elemento">
        {novo && (
          <form onSubmit={salvar} className="space-y-4">
            <Campo rotulo="Nome">
              <input className="campo" required value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} placeholder="Girassol" />
            </Campo>
            <Campo rotulo="Grupo">
              <select className="campo" value={novo.grupo} onChange={(e) => setNovo({ ...novo, grupo: e.target.value })}>
                {GRUPOS_ELEMENTOS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nome}
                  </option>
                ))}
              </select>
            </Campo>
            <div>
              <span className="rotulo">Imagem (PNG transparente ou SVG)</span>
              <EnviarImagens valor={novo.imagem ? [novo.imagem] : []} aoMudar={(v) => setNovo({ ...novo, imagem: v[0] || null })} pasta="elementos" maximo={1} aceitar="image/png,image/svg+xml,image/webp" />
              <p className="mt-2 text-xs text-cinza">Elementos enviados como imagem mantêm as cores originais. Os que vieram prontos mudam de cor no editor.</p>
            </div>
            <button className="btn-primario w-full">Adicionar</button>
          </form>
        )}
      </Modal>
    </div>
  )
}
