import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp } from '../../lib/app'
import { FORMAS, MATERIAIS, slug } from '../../lib/format'
import { AREAS_PADRAO } from '../../lib/pecas'
import { TituloPagina } from '../../components/Layout'
import { Campo, Carregando, EnviarImagens } from '../../components/ui'
import MarcadorArea from '../../components/MarcadorArea'

const VAZIO = {
  nome: '',
  categoria: 'canecas',
  forma: 'caneca',
  material: 'ceramica',
  descricao: '',
  capacidade_ml: 300,
  altura_cm: '',
  diametro_cm: '',
  preco_base: '',
  prazo_producao_dias: 5,
  estoque: 0,
  estoque_minimo: 5,
  disponivel: true,
  mais_vendido: false,
  fotos: [],
  mockup_frente: null,
  mockup_verso: null,
  area_pintavel: AREAS_PADRAO.caneca,
}

export default function ModeloForm() {
  const { id } = useParams()
  const novo = id === 'novo'
  const nav = useNavigate()
  const { notificar, categorias } = useApp()
  const [m, setM] = useState(novo ? VAZIO : null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!novo) db.obter('modelos', id).then((d) => setM(d || VAZIO))
  }, [id, novo])

  if (!m) return <Carregando />
  const set = (campo) => (e) => setM({ ...m, [campo]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e })

  const salvar = async (e) => {
    e.preventDefault()
    setSalvando(true)
    try {
      const dados = {
        ...m,
        slug: m.slug || slug(m.nome),
        preco_base: Number(m.preco_base),
        capacidade_ml: Number(m.capacidade_ml) || null,
        altura_cm: Number(m.altura_cm) || null,
        diametro_cm: Number(m.diametro_cm) || null,
        prazo_producao_dias: Number(m.prazo_producao_dias),
        estoque: Number(m.estoque),
        estoque_minimo: Number(m.estoque_minimo),
      }
      delete dados.id
      delete dados.criado_em
      if (novo) await db.inserir('modelos', dados)
      else await db.atualizar('modelos', id, dados)
      notificar('Peça salva.')
      nav('/admin/modelos')
    } catch (err) {
      notificar(err.message, 'erro')
    } finally {
      setSalvando(false)
    }
  }

  const excluir = async () => {
    if (!window.confirm(`Excluir a peça "${m.nome}"? Pedidos antigos continuam guardados.`)) return
    await db.remover('modelos', id)
    notificar('Peça excluída.')
    nav('/admin/modelos')
  }

  return (
    <form onSubmit={salvar}>
      <TituloPagina
        titulo={novo ? 'Nova peça' : m.nome}
        acao={
          <div className="flex gap-2">
            {!novo && (
              <button type="button" onClick={excluir} className="btn-fantasma text-rosa">
                <Trash2 className="size-4" /> Excluir
              </button>
            )}
            <button className="btn-primario" disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="cartao grid gap-4 p-5 sm:grid-cols-2">
            <Campo rotulo="Nome" className="sm:col-span-2">
              <input className="campo" required value={m.nome} onChange={set('nome')} placeholder="Taça Bordeaux" />
            </Campo>
            <Campo rotulo="Categoria">
              <select className="campo" value={m.categoria} onChange={set('categoria')}>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Material">
              <select className="campo" value={m.material} onChange={set('material')}>
                {MATERIAIS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Descrição" className="sm:col-span-2">
              <textarea className="campo min-h-24" value={m.descricao || ''} onChange={set('descricao')} />
            </Campo>
            <Campo rotulo="Capacidade (ml)">
              <input className="campo" type="number" min="0" value={m.capacidade_ml ?? ''} onChange={set('capacidade_ml')} />
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo rotulo="Altura (cm)">
                <input className="campo" type="number" step="0.1" min="0" value={m.altura_cm ?? ''} onChange={set('altura_cm')} />
              </Campo>
              <Campo rotulo="Diâmetro (cm)">
                <input className="campo" type="number" step="0.1" min="0" value={m.diametro_cm ?? ''} onChange={set('diametro_cm')} />
              </Campo>
            </div>
            <Campo rotulo="Preço base (R$)" dica="Preço da peça pintada, sem a arte.">
              <input className="campo" required type="number" step="0.01" min="0" value={m.preco_base} onChange={set('preco_base')} />
            </Campo>
            <Campo rotulo="Prazo de produção (dias úteis)">
              <input className="campo" required type="number" min="1" value={m.prazo_producao_dias} onChange={set('prazo_producao_dias')} />
            </Campo>
          </section>

          <section className="cartao space-y-4 p-5">
            <h2 className="text-lg">Fotos reais da peça</h2>
            <EnviarImagens valor={m.fotos || []} aoMudar={set('fotos')} pasta="modelos" rotulo="Adicionar foto" />
          </section>

          <section className="cartao grid gap-4 p-5 sm:grid-cols-3">
            <h2 className="text-lg sm:col-span-3">Estoque e visibilidade</h2>
            <Campo rotulo="Peças em branco">
              <input className="campo" type="number" min="0" value={m.estoque} onChange={set('estoque')} />
            </Campo>
            <Campo rotulo="Avisar abaixo de">
              <input className="campo" type="number" min="0" value={m.estoque_minimo} onChange={set('estoque_minimo')} />
            </Campo>
            <div className="space-y-2 pt-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={m.disponivel} onChange={set('disponivel')} className="size-4 accent-rosa" /> Visível no site
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={m.mais_vendido} onChange={set('mais_vendido')} className="size-4 accent-rosa" /> Mostrar em “Mais vendidos”
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="cartao space-y-4 p-5">
            <h2 className="text-lg">Mockup e área pintável</h2>
            <Campo rotulo="Formato do desenho" dica="Usado enquanto você não sobe o PNG do mockup.">
              <select className="campo" value={m.forma} onChange={(e) => setM({ ...m, forma: e.target.value, area_pintavel: AREAS_PADRAO[e.target.value] })}>
                {FORMAS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </Campo>
            <MarcadorArea modelo={m} area={m.area_pintavel} aoMudar={set('area_pintavel')} />
            <p className="text-xs text-cinza">Arraste o retângulo para onde dá para pintar e puxe a bolinha do canto para ajustar o tamanho. O cliente só desenha dentro dele.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="rotulo">PNG frente</span>
                <EnviarImagens valor={m.mockup_frente ? [m.mockup_frente] : []} aoMudar={(v) => setM({ ...m, mockup_frente: v[0] || null })} pasta="mockups" maximo={1} rotulo="PNG transparente" aceitar="image/png" />
              </div>
              <div>
                <span className="rotulo">PNG verso</span>
                <EnviarImagens valor={m.mockup_verso ? [m.mockup_verso] : []} aoMudar={(v) => setM({ ...m, mockup_verso: v[0] || null })} pasta="mockups" maximo={1} rotulo="PNG transparente" aceitar="image/png" />
              </div>
            </div>
            <p className="text-xs text-cinza">Use imagem na proporção 4:5 (ex.: 800×1000) com fundo transparente.</p>
          </section>
        </aside>
      </div>
    </form>
  )
}
