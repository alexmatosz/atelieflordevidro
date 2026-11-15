import { useState } from 'react'
import { Plus } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados } from '../../lib/app'
import { CORES_TINTA, GRUPOS_ELEMENTOS, dataUrlSvg, svgElemento, temCor } from '../../lib/elementos'
import { TituloPagina } from '../../components/Layout'
import { Campo, Carregando, EnviarImagens, Modal } from '../../components/ui'

const previa = (e) => e.imagem || dataUrlSvg(svgElemento(e.svg, e.cor))

export default function Elementos() {
  const { notificar } = useApp()
  const [lista, recarregar] = useDados(() => db.listar('elementos_editor', { ordem: 'nome' }))
  const [edit, setEdit] = useState(null)

  const salvar = async (e) => {
    e.preventDefault()
    if (!edit.svg && !edit.imagem) return notificar('Envie a imagem do desenho.', 'erro')
    const dados = { nome: edit.nome, grupo: edit.grupo, cor: edit.cor || null, imagem: edit.imagem || null, svg: edit.svg || null, ativo: edit.ativo !== false }
    if (edit.id) await db.atualizar('elementos_editor', edit.id, dados)
    else await db.inserir('elementos_editor', dados)
    setEdit(null)
    notificar('Desenho salvo.')
    recarregar()
  }

  const excluir = async () => {
    if (!window.confirm(`Excluir "${edit.nome}" da biblioteca? Artes que já usam esse desenho continuam iguais.`)) return
    await db.remover('elementos_editor', edit.id)
    setEdit(null)
    recarregar()
  }

  return (
    <div>
      <TituloPagina
        titulo="Desenhos do editor"
        sub="O que a cliente pode usar no “Crie sua arte”. Deixe só o que você pinta bem e oculte o que saiu de moda."
        acao={
          <button className="btn-primario" onClick={() => setEdit({ nome: '', grupo: 'flores', imagem: null, svg: null, ativo: true })}>
            <Plus className="size-4" /> Novo desenho
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
            <section key={g.id} className="mb-8">
              <h2 className="mb-3 text-xl">{g.nome}</h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
                {itens.map((e) => (
                  <button key={e.id} onClick={() => setEdit({ ...e })} className={`cartao p-2 text-left transition hover:border-rosa/50 ${e.ativo ? '' : 'opacity-45'}`}>
                    <div className="aspect-square rounded-xl bg-petala/50 p-2">
                      <img src={previa(e)} alt="" className="size-full object-contain" />
                    </div>
                    <p className="mt-1.5 truncate text-xs">{e.nome}</p>
                    {!e.ativo && <p className="text-[11px] text-cinza">oculto</p>}
                  </button>
                ))}
              </div>
            </section>
          )
        })
      )}

      <Modal aberto={!!edit} aoFechar={() => setEdit(null)} titulo={edit?.id ? 'Editar desenho' : 'Novo desenho'}>
        {edit && (
          <form onSubmit={salvar} className="space-y-4">
            {edit.svg ? (
              <div className="mx-auto size-32 rounded-2xl bg-petala/50 p-3">
                <img src={previa(edit)} alt="" className="size-full object-contain" />
              </div>
            ) : (
              <div>
                <span className="rotulo">Imagem (PNG com fundo transparente)</span>
                <EnviarImagens valor={edit.imagem ? [edit.imagem] : []} aoMudar={(v) => setEdit({ ...edit, imagem: v[0] || null })} pasta="elementos" maximo={1} aceitar="image/png,image/svg+xml,image/webp" />
                <p className="mt-2 text-xs text-cinza">Imagens enviadas mantêm as cores originais.</p>
              </div>
            )}
            <Campo rotulo="Nome">
              <input className="campo" required value={edit.nome} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} placeholder="Limão siciliano" />
            </Campo>
            <Campo rotulo="Grupo">
              <select className="campo" value={edit.grupo} onChange={(e) => setEdit({ ...edit, grupo: e.target.value })}>
                {GRUPOS_ELEMENTOS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nome}
                  </option>
                ))}
              </select>
            </Campo>
            {edit.svg && temCor(edit.svg) && (
              <div>
                <span className="rotulo">Cor que já vem escolhida</span>
                <div className="flex flex-wrap gap-1.5">
                  {CORES_TINTA.map(({ cor, nome }) => (
                    <button key={cor} type="button" title={nome} aria-label={nome} onClick={() => setEdit({ ...edit, cor })} className={`size-7 rounded-full border-2 ring-1 ring-borda ${edit.cor === cor ? 'border-grafite' : 'border-white'}`} style={{ background: cor }} />
                  ))}
                </div>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-rosa" checked={edit.ativo !== false} onChange={(e) => setEdit({ ...edit, ativo: e.target.checked })} /> Aparece no editor
            </label>
            <div className="flex gap-2">
              <button className="btn-primario flex-1">Salvar</button>
              {edit.id && (
                <button type="button" className="btn-fantasma text-rosa" onClick={excluir}>
                  Excluir
                </button>
              )}
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
