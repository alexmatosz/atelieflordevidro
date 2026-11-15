import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { db } from '../../lib/db'
import { useApp, useDados } from '../../lib/app'
import { MATERIAIS } from '../../lib/format'
import { CartaoModelo, Carregando, Vazio } from '../../components/ui'

const CAPACIDADES = [
  { id: 'p', nome: 'Até 200 ml', teste: (c) => c <= 200 },
  { id: 'm', nome: '200 a 400 ml', teste: (c) => c > 200 && c <= 400 },
  { id: 'g', nome: 'Mais de 400 ml', teste: (c) => c > 400 },
]
const PRECOS = [
  { id: '1', nome: 'Até R$ 50', teste: (p) => p <= 50 },
  { id: '2', nome: 'R$ 50 a R$ 80', teste: (p) => p > 50 && p <= 80 },
  { id: '3', nome: 'Acima de R$ 80', teste: (p) => p > 80 },
]

function Grupo({ titulo, opcoes, valor, aoMudar }) {
  return (
    <div>
      <p className="rotulo">{titulo}</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => aoMudar('')} className={`chip ${!valor ? 'chip-ativo' : ''}`}>
          Todos
        </button>
        {opcoes.map((o) => (
          <button key={o.id} onClick={() => aoMudar(valor === o.id ? '' : o.id)} className={`chip ${valor === o.id ? 'chip-ativo' : ''}`}>
            {o.nome}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Catalogo() {
  const { categorias } = useApp()
  const [params, setParams] = useSearchParams()
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [modelos] = useDados(() => db.listar('modelos', { filtro: { disponivel: true }, ordem: 'nome' }))
  const f = { categoria: params.get('categoria') || '', capacidade: params.get('capacidade') || '', material: params.get('material') || '', preco: params.get('preco') || '' }
  const mudar = (campo) => (v) => {
    const p = new URLSearchParams(params)
    if (v) p.set(campo, v)
    else p.delete(campo)
    setParams(p, { replace: true })
  }

  const lista = (modelos || []).filter(
    (m) =>
      (!f.categoria || m.categoria === f.categoria) &&
      (!f.material || m.material === f.material) &&
      (!f.capacidade || CAPACIDADES.find((c) => c.id === f.capacidade).teste(Number(m.capacidade_ml))) &&
      (!f.preco || PRECOS.find((c) => c.id === f.preco).teste(Number(m.preco_base)))
  )
  const ativos = Object.values(f).filter(Boolean).length

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl">{f.categoria ? categorias.find((c) => c.id === f.categoria)?.nome : 'Todas as peças'}</h1>
      <p className="mt-1 text-cinza">Escolha a peça. Na próxima tela você escolhe a pintura ou cria a sua.</p>

      <div className="rolagem-fina mt-5 flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => mudar('categoria')('')} className={`chip shrink-0 ${!f.categoria ? 'chip-ativo' : ''}`}>
          Tudo
        </button>
        {categorias.map((c) => (
          <button key={c.id} onClick={() => mudar('categoria')(c.id)} className={`chip shrink-0 ${f.categoria === c.id ? 'chip-ativo' : ''}`}>
            {c.nome}
          </button>
        ))}
        <button onClick={() => setFiltrosAbertos((x) => !x)} className="chip ml-auto shrink-0" aria-expanded={filtrosAbertos}>
          <SlidersHorizontal className="size-4" /> Filtros {ativos > (f.categoria ? 1 : 0) && `(${ativos - (f.categoria ? 1 : 0)})`}
        </button>
      </div>

      {filtrosAbertos && (
        <div className="cartao mt-3 grid gap-4 p-4 md:grid-cols-3">
          <Grupo titulo="Capacidade" opcoes={CAPACIDADES} valor={f.capacidade} aoMudar={mudar('capacidade')} />
          <Grupo titulo="Material" opcoes={MATERIAIS} valor={f.material} aoMudar={mudar('material')} />
          <Grupo titulo="Preço base" opcoes={PRECOS} valor={f.preco} aoMudar={mudar('preco')} />
        </div>
      )}

      <div className="mt-6">
        {!modelos ? (
          <Carregando />
        ) : lista.length === 0 ? (
          <Vazio titulo="Nenhuma peça com esses filtros" acao={<button className="btn-secundario" onClick={() => setParams({})}>Limpar filtros</button>} />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {lista.map((m) => (
              <CartaoModelo key={m.id} modelo={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
