import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados } from '../../lib/app'
import { moeda } from '../../lib/format'
import { TituloPagina } from '../../components/Layout'
import { Campo, Carregando, Modal, Vazio } from '../../components/ui'

export default function Kits() {
  const { notificar } = useApp()
  const [d, recarregar] = useDados(async () => ({ kits: await db.listar('kits', { ordem: 'nome' }), modelos: await db.listar('modelos', { ordem: 'nome' }) }))
  const [edit, setEdit] = useState(null)
  if (!d) return <Carregando />
  const modelo = (id) => d.modelos.find((m) => m.id === id)
  const precoCheio = (k) => k.composicao.reduce((s, c) => s + Number(modelo(c.modelo_id)?.preco_base || 0) * c.quantidade, 0)

  const salvar = async (e) => {
    e.preventDefault()
    const comp = edit.composicao.filter((c) => c.modelo_id && c.quantidade > 0)
    if (!comp.length) return notificar('Adicione pelo menos uma peça ao kit.', 'erro')
    const dados = { nome: edit.nome, descricao: edit.descricao, composicao: comp, desconto_percentual: Number(edit.desconto_percentual), ativo: edit.ativo }
    if (edit.id) await db.atualizar('kits', edit.id, dados)
    else await db.inserir('kits', dados)
    setEdit(null)
    notificar('Kit salvo.')
    recarregar()
  }

  return (
    <div>
      <TituloPagina
        titulo="Kits"
        sub="Peças diferentes com a mesma arte, com preço de kit."
        acao={
          <button className="btn-primario" onClick={() => setEdit({ nome: '', descricao: '', composicao: [{ modelo_id: d.modelos[0]?.id, quantidade: 2 }], desconto_percentual: 10, ativo: true })}>
            <Plus className="size-4" /> Novo kit
          </button>
        }
      />
      {d.kits.length === 0 ? (
        <Vazio titulo="Nenhum kit" texto="Ex.: 2 taças + 1 garrafa com a mesma pintura." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {d.kits.map((k) => (
            <button key={k.id} onClick={() => setEdit(structuredClone(k))} className={`cartao p-4 text-left transition hover:border-terracota ${k.ativo ? '' : 'opacity-60'}`}>
              <p className="titulo text-lg">{k.nome}</p>
              <ul className="mt-1 text-sm text-cinza">
                {k.composicao.map((c, i) => (
                  <li key={i}>
                    {c.quantidade}× {modelo(c.modelo_id)?.nome || 'modelo removido'}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm">
                {k.desconto_percentual}% de desconto · peças a partir de <b>{moeda(precoCheio(k) * (1 - k.desconto_percentual / 100))}</b>
              </p>
            </button>
          ))}
        </div>
      )}
      <Modal aberto={!!edit} aoFechar={() => setEdit(null)} titulo={edit?.id ? 'Editar kit' : 'Novo kit'}>
        {edit && (
          <form onSubmit={salvar} className="space-y-4">
            <Campo rotulo="Nome">
              <input className="campo" required value={edit.nome} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} />
            </Campo>
            <Campo rotulo="Descrição">
              <input className="campo" value={edit.descricao} onChange={(e) => setEdit({ ...edit, descricao: e.target.value })} />
            </Campo>
            <div>
              <span className="rotulo">Peças</span>
              <div className="space-y-2">
                {edit.composicao.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <input className="campo !w-20" type="number" min="1" value={c.quantidade} onChange={(e) => setEdit({ ...edit, composicao: edit.composicao.map((x, j) => (j === i ? { ...x, quantidade: Number(e.target.value) } : x)) })} aria-label="Quantidade" />
                    <select className="campo" value={c.modelo_id} onChange={(e) => setEdit({ ...edit, composicao: edit.composicao.map((x, j) => (j === i ? { ...x, modelo_id: e.target.value } : x)) })}>
                      {d.modelos.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nome}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="px-2 text-cinza" onClick={() => setEdit({ ...edit, composicao: edit.composicao.filter((_, j) => j !== i) })} aria-label="Remover peça">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="mt-2 text-sm font-semibold text-terracota" onClick={() => setEdit({ ...edit, composicao: [...edit.composicao, { modelo_id: d.modelos[0]?.id, quantidade: 1 }] })}>
                + Adicionar peça
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Campo rotulo="Desconto do kit (%)">
                <input className="campo" type="number" min="0" max="80" value={edit.desconto_percentual} onChange={(e) => setEdit({ ...edit, desconto_percentual: e.target.value })} />
              </Campo>
              <label className="flex items-center gap-2 pt-6 text-sm">
                <input type="checkbox" className="size-4 accent-terracota" checked={edit.ativo} onChange={(e) => setEdit({ ...edit, ativo: e.target.checked })} /> Visível no site
              </label>
            </div>
            <div className="flex gap-2">
              <button className="btn-primario flex-1">Salvar</button>
              {edit.id && (
                <button
                  type="button"
                  className="btn-fantasma text-terracota"
                  onClick={async () => {
                    if (!window.confirm('Excluir este kit?')) return
                    await db.remover('kits', edit.id)
                    setEdit(null)
                    recarregar()
                  }}
                >
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
