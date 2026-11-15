import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados } from '../../lib/app'
import { OCASIOES, TEMAS } from '../../lib/format'
import { TituloPagina } from '../../components/Layout'
import { Campo, Carregando, EnviarImagens } from '../../components/ui'
import EditorArte from '../../components/EditorArte'

const VAZIA = {
  nome: '',
  tema: 'Floral',
  descricao: '',
  acrescimo: 10,
  fotos: [],
  desenho: { frente: [], verso: [], cor: '#c94f6d' },
  modelos_aceitos: [],
  ocasioes: [],
  personalizavel: { nome: true, frase: true, data: true, cor: true },
  ativo: true,
  mais_vendida: false,
}

export default function ArteForm() {
  const { id } = useParams()
  const nova = id === 'nova'
  const nav = useNavigate()
  const { notificar } = useApp()
  const [a, setA] = useState(null)
  const [modeloPrevia, setModeloPrevia] = useState(null)
  const [extras] = useDados(async () => ({
    modelos: await db.listar('modelos', { ordem: 'nome' }),
    elementos: await db.listar('elementos_editor', { filtro: { ativo: true } }),
  }))

  useEffect(() => {
    if (nova) setA(VAZIA)
    else db.obter('artes', id).then((d) => setA(d || VAZIA))
  }, [id, nova])

  useEffect(() => {
    if (extras && !modeloPrevia) setModeloPrevia(extras.modelos[0]?.id)
  }, [extras, modeloPrevia])

  if (!a || !extras) return <Carregando />
  const set = (campo) => (e) => setA({ ...a, [campo]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e })
  const alternarLista = (campo, valor) => setA({ ...a, [campo]: a[campo].includes(valor) ? a[campo].filter((v) => v !== valor) : [...a[campo], valor] })
  const modelo = extras.modelos.find((m) => m.id === modeloPrevia)

  const salvar = async (e) => {
    e.preventDefault()
    if (!a.modelos_aceitos.length) return notificar('Marque pelo menos um modelo que aceita esta arte.', 'erro')
    try {
      const dados = { ...a, acrescimo: Number(a.acrescimo) }
      delete dados.id
      delete dados.criado_em
      if (nova) await db.inserir('artes', dados)
      else await db.atualizar('artes', id, dados)
      notificar('Arte salva.')
      nav('/admin/artes')
    } catch (err) {
      notificar(err.message, 'erro')
    }
  }

  const excluir = async () => {
    if (!window.confirm(`Excluir a arte "${a.nome}"?`)) return
    await db.remover('artes', id)
    nav('/admin/artes')
  }

  return (
    <form onSubmit={salvar} className="space-y-6">
      <TituloPagina
        titulo={nova ? 'Nova arte' : a.nome}
        acao={
          <div className="flex gap-2">
            {!nova && (
              <button type="button" onClick={excluir} className="btn-fantasma text-rosa">
                <Trash2 className="size-4" /> Excluir
              </button>
            )}
            <button className="btn-primario">Salvar</button>
          </div>
        }
      />

      <section className="cartao grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Campo rotulo="Nome da arte" className="sm:col-span-2">
          <input className="campo" required value={a.nome} onChange={set('nome')} placeholder="Floral Aquarela" />
        </Campo>
        <Campo rotulo="Tema">
          <select className="campo" value={a.tema} onChange={set('tema')}>
            {TEMAS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Campo>
        <Campo rotulo="Acréscimo no preço (R$)">
          <input className="campo" type="number" min="0" step="0.01" value={a.acrescimo} onChange={set('acrescimo')} />
        </Campo>
        <Campo rotulo="Descrição" className="sm:col-span-2 lg:col-span-4">
          <input className="campo" value={a.descricao || ''} onChange={set('descricao')} />
        </Campo>
        <div className="flex flex-wrap gap-4 sm:col-span-2 lg:col-span-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={a.ativo} onChange={set('ativo')} className="size-4 accent-rosa" /> Visível no site
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={a.mais_vendida} onChange={set('mais_vendida')} className="size-4 accent-rosa" /> Destaque
          </label>
          <label className="flex items-center gap-2 text-sm">
            Cor principal padrão
            <input type="color" value={a.desenho.cor || '#c94f6d'} onChange={(e) => setA({ ...a, desenho: { ...a.desenho, cor: e.target.value } })} className="h-7 w-10 cursor-pointer rounded" />
          </label>
        </div>
      </section>

      <section className="cartao space-y-4 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg">Desenho</h2>
            <p className="text-sm text-cinza">Monte a arte como ela será pintada. Ela se ajusta à área pintável de cada modelo.</p>
          </div>
          <Campo rotulo="Ver no modelo">
            <select className="campo" value={modeloPrevia || ''} onChange={(e) => setModeloPrevia(e.target.value)}>
              {extras.modelos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
          </Campo>
        </div>
        {modelo && <EditorArte key={modelo.id} modelo={modelo} desenho={a.desenho} aoMudar={set('desenho')} elementos={extras.elementos} modoAdmin />}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="cartao space-y-3 p-5">
          <h2 className="text-lg">Modelos que aceitam esta arte</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="chip" onClick={() => setA({ ...a, modelos_aceitos: extras.modelos.map((m) => m.id) })}>
              Marcar todos
            </button>
            {extras.modelos.map((m) => (
              <button type="button" key={m.id} onClick={() => alternarLista('modelos_aceitos', m.id)} className={`chip ${a.modelos_aceitos.includes(m.id) ? 'chip-ativo' : ''}`}>
                {m.nome}
              </button>
            ))}
          </div>
          <h3 className="pt-2 text-base">Ideal para</h3>
          <div className="flex flex-wrap gap-2">
            {OCASIOES.map((o) => (
              <button type="button" key={o.id} onClick={() => alternarLista('ocasioes', o.id)} className={`chip ${a.ocasioes.includes(o.id) ? 'chip-ativo' : ''}`}>
                {o.nome}
              </button>
            ))}
          </div>
          <h3 className="pt-2 text-base">O cliente pode personalizar</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            {[
              ['nome', 'Nome'],
              ['frase', 'Frase'],
              ['data', 'Data'],
              ['cor', 'Cor predominante'],
            ].map(([k, n]) => (
              <label key={k} className="flex items-center gap-2">
                <input type="checkbox" className="size-4 accent-rosa" checked={a.personalizavel?.[k] !== false} onChange={(e) => setA({ ...a, personalizavel: { ...a.personalizavel, [k]: e.target.checked } })} /> {n}
              </label>
            ))}
          </div>
        </section>
        <section className="cartao space-y-3 p-5">
          <h2 className="text-lg">Fotos reais de peças pintadas</h2>
          <p className="text-sm text-cinza">Aparecem na vitrine junto com a pré-visualização. Foto real vende mais.</p>
          <EnviarImagens valor={a.fotos || []} aoMudar={set('fotos')} pasta="artes" />
        </section>
      </div>
    </form>
  )
}
