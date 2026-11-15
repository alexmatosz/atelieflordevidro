import { useState } from 'react'
import { Plus } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados } from '../../lib/app'
import { TituloPagina } from '../../components/Layout'
import { Campo, Carregando, Modal } from '../../components/ui'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export default function DatasAdmin() {
  const { notificar } = useApp()
  const [d, recarregar] = useDados(async () => ({ datas: await db.listar('datas_comemorativas'), artes: await db.listar('artes', { ordem: 'nome' }) }))
  const [edit, setEdit] = useState(null)
  if (!d) return <Carregando />
  const ordenadas = [...d.datas].sort((a, b) => a.mes - b.mes || a.dia - b.dia)

  const salvar = async (e) => {
    e.preventDefault()
    const dados = { nome: edit.nome, dia: Number(edit.dia), mes: Number(edit.mes), descricao: edit.descricao, artes_sugeridas: edit.artes_sugeridas }
    if (edit.id) await db.atualizar('datas_comemorativas', edit.id, dados)
    else await db.inserir('datas_comemorativas', dados)
    setEdit(null)
    notificar('Data salva.')
    recarregar()
  }

  return (
    <div>
      <TituloPagina
        titulo="Datas comemorativas"
        sub="Aparecem no calendário da loja com sugestões de arte."
        acao={
          <button className="btn-primario" onClick={() => setEdit({ nome: '', dia: 1, mes: 1, descricao: '', artes_sugeridas: [] })}>
            <Plus className="size-4" /> Nova data
          </button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ordenadas.map((x) => (
          <button key={x.id} onClick={() => setEdit(structuredClone(x))} className="cartao flex gap-3 p-4 text-left hover:border-terracota">
            <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-areia">
              <span className="titulo text-xl leading-none">{x.dia}</span>
              <span className="text-xs uppercase text-cinza">{MESES[x.mes - 1]}</span>
            </div>
            <div className="text-sm">
              <p className="font-semibold">{x.nome}</p>
              <p className="text-cinza">{x.artes_sugeridas.length} artes sugeridas</p>
            </div>
          </button>
        ))}
      </div>
      <Modal aberto={!!edit} aoFechar={() => setEdit(null)} titulo={edit?.id ? 'Editar data' : 'Nova data'}>
        {edit && (
          <form onSubmit={salvar} className="space-y-4">
            <Campo rotulo="Nome">
              <input className="campo" required value={edit.nome} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} />
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo rotulo="Dia">
                <input className="campo" type="number" min="1" max="31" required value={edit.dia} onChange={(e) => setEdit({ ...edit, dia: e.target.value })} />
              </Campo>
              <Campo rotulo="Mês">
                <select className="campo" value={edit.mes} onChange={(e) => setEdit({ ...edit, mes: e.target.value })}>
                  {MESES.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>
            <Campo rotulo="Texto">
              <textarea className="campo" value={edit.descricao} onChange={(e) => setEdit({ ...edit, descricao: e.target.value })} />
            </Campo>
            <div>
              <span className="rotulo">Artes sugeridas</span>
              <div className="flex flex-wrap gap-2">
                {d.artes.map((a) => (
                  <button
                    type="button"
                    key={a.id}
                    className={`chip ${edit.artes_sugeridas.includes(a.id) ? 'chip-ativo' : ''}`}
                    onClick={() => setEdit({ ...edit, artes_sugeridas: edit.artes_sugeridas.includes(a.id) ? edit.artes_sugeridas.filter((x) => x !== a.id) : [...edit.artes_sugeridas, a.id] })}
                  >
                    {a.nome}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-primario flex-1">Salvar</button>
              {edit.id && (
                <button
                  type="button"
                  className="btn-fantasma text-terracota"
                  onClick={async () => {
                    await db.remover('datas_comemorativas', edit.id)
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
