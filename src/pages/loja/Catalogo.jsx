import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { db } from '../../lib/db'
import { precoDoModelo, useApp, useDados } from '../../lib/app'
import { MATERIAIS } from '../../lib/format'
import { CartaoModelo, Carregando, Vazio } from '../../components/ui'
import { Revelar } from '../../components/vitrine'

const ORDENS = [
  { id: '', nome: 'Mais vendidas' },
  { id: 'menor', nome: 'Menor preço' },
  { id: 'maior', nome: 'Maior preço' },
  { id: 'nome', nome: 'Nome' },
]

const semAcento = (t) => String(t || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

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
  const { categorias, promocoes } = useApp()
  const [params, setParams] = useSearchParams()
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [d] = useDados(async () => {
    const [modelos, artes] = await Promise.all([db.listar('modelos', { filtro: { disponivel: true }, ordem: 'nome' }), db.listar('artes', { filtro: { ativo: true } })])
    return { modelos, artes }
  })
  const modelos = d?.modelos
  const q = params.get('q') || ''
  const ordem = params.get('ordem') || ''
  const f = { categoria: params.get('categoria') || '', capacidade: params.get('capacidade') || '', material: params.get('material') || '', preco: params.get('preco') || '' }
  const precoDe = (m) => precoDoModelo(m, promocoes).preco
  const termo = semAcento(q)
  const casaBusca = (m) => {
    if (!termo) return true
    const nomesArtes = (d?.artes || []).filter((a) => a.modelos_aceitos?.includes(m.id)).map((a) => `${a.nome} ${a.tema}`).join(' ')
    const cat = categorias.find((c) => c.id === m.categoria)?.nome
    return termo.split(/\s+/).every((t) => semAcento(`${m.nome} ${m.descricao} ${cat} ${nomesArtes}`).includes(t))
  }
  const mudar = (campo) => (v) => {
    const p = new URLSearchParams(params)
    if (v) p.set(campo, v)
    else p.delete(campo)
    setParams(p, { replace: true })
  }

  const lista = (modelos || [])
    .filter(
    (m) =>
      casaBusca(m) &&
      (!f.categoria || m.categoria === f.categoria) &&
      (!f.material || m.material === f.material) &&
      (!f.capacidade || CAPACIDADES.find((c) => c.id === f.capacidade).teste(Number(m.capacidade_ml))) &&
      (!f.preco || PRECOS.find((c) => c.id === f.preco).teste(precoDe(m)))
  )
    .sort((a, b) => (ordem === 'menor' ? precoDe(a) - precoDe(b) : ordem === 'maior' ? precoDe(b) - precoDe(a) : ordem === 'nome' ? a.nome.localeCompare(b.nome) : Number(!!b.mais_vendido) - Number(!!a.mais_vendido)))
  const ativos = [f.capacidade, f.material, f.preco].filter(Boolean).length

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <h1 className="text-[32px] sm:text-4xl">{q ? `Busca: ${q}` : f.categoria ? categorias.find((c) => c.id === f.categoria)?.nome : 'Todas as peças'}</h1>
      <p className="mt-1 text-cinza">Escolha a peça. Na próxima tela você escolhe a pintura ou cria a sua.</p>
      {q && (
        <button onClick={() => mudar('q')('')} className="chip mt-3 !border-rosa/40">
          “{q}” <X className="size-3.5" />
        </button>
      )}

      <div className="sem-barra -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <button onClick={() => mudar('categoria')('')} className={`chip shrink-0 ${!f.categoria ? 'chip-ativo' : ''}`}>
          Tudo
        </button>
        {categorias.map((c) => (
          <button key={c.id} onClick={() => mudar('categoria')(c.id)} className={`chip shrink-0 ${f.categoria === c.id ? 'chip-ativo' : ''}`}>
            {c.nome}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <button onClick={() => setFiltrosAbertos((x) => !x)} className={`chip shrink-0 ${ativos ? '!border-rosa' : ''}`} aria-expanded={filtrosAbertos}>
          <SlidersHorizontal className="size-4" /> Filtros{ativos > 0 && ` (${ativos})`}
        </button>
        <label className="flex items-center gap-2 text-sm text-cinza">
          <span className="hidden sm:inline">Ordenar por</span>
          <select className="campo !w-auto !rounded-full !py-1.5 !pr-8 !text-sm" value={ordem} onChange={(e) => mudar('ordem')(e.target.value)} aria-label="Ordenar">
            {ORDENS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtrosAbertos && (
        <div className="cartao mt-3 grid animate-subir gap-4 p-4 md:grid-cols-3">
          <Grupo titulo="Capacidade" opcoes={CAPACIDADES} valor={f.capacidade} aoMudar={mudar('capacidade')} />
          <Grupo titulo="Material" opcoes={MATERIAIS} valor={f.material} aoMudar={mudar('material')} />
          <Grupo titulo="Preço" opcoes={PRECOS} valor={f.preco} aoMudar={mudar('preco')} />
        </div>
      )}

      <div className="mt-6">
        {!modelos ? (
          <Carregando />
        ) : lista.length === 0 ? (
          <Vazio titulo={q ? `Nada encontrado para “${q}”` : 'Nenhuma peça com esses filtros'} texto="Tente outra palavra ou veja todas as peças." acao={<button className="btn-secundario" onClick={() => setParams({})}>Ver todas as peças</button>} />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {lista.map((m, i) => (
              <Revelar key={m.id} atraso={(i % 4) * 60}>
                <CartaoModelo modelo={m} artes={d.artes} arte={termo ? d.artes.find((x) => x.modelos_aceitos?.includes(m.id) && termo.split(/\s+/).every((t) => semAcento(`${x.nome} ${x.tema}`).includes(t))) : undefined} />
              </Revelar>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
