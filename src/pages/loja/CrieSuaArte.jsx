import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados, useWhats } from '../../lib/app'
import { moeda } from '../../lib/format'
import { exportarPng } from '../../lib/konva'
import EditorArte from '../../components/EditorArte'
import { AvisoArtesanal, CartaoModelo, Campo, Carregando, Contador, EnviarImagens } from '../../components/ui'

const VAZIO = { frente: [], verso: [], cor: '#d9708b' }
const chaveRascunho = (id) => `afv:rascunho:${id}`

function lerRascunho(id) {
  try {
    return JSON.parse(localStorage.getItem(chaveRascunho(id)))
  } catch {
    return null
  }
}

function descreverDesenho(desenho) {
  const itens = []
  for (const lado of ['frente', 'verso']) {
    for (const o of desenho[lado] || []) {
      const nome = o.tipo === 'texto' ? `texto “${o.texto}”` : o.nome || (o.tipo === 'imagem' ? 'imagem enviada' : 'desenho')
      itens.push(lado === 'verso' ? `${nome} (verso)` : nome)
    }
  }
  return [...new Set(itens)]
}

export default function CrieSuaArte() {
  const { modeloId } = useParams()
  const [busca] = useSearchParams()
  const nav = useNavigate()
  const { adicionarAoCarrinho, notificar } = useApp()
  const [desenho, setDesenho] = useState(null)
  const [f, setF] = useState({ referencias: [], observacoes: '', quantidade: 1 })
  const [adicionando, setAdicionando] = useState(false)

  const [d] = useDados(async () => {
    const [modelos, elementos] = await Promise.all([db.listar('modelos', { filtro: { disponivel: true }, ordem: 'nome' }), db.listar('elementos_editor', { filtro: { ativo: true } })])
    const base = busca.get('arte') ? await db.obter('artes', busca.get('arte')) : null
    return { modelos, elementos, base }
  })

  const modelo = d?.modelos.find((m) => m.id === modeloId)
  useWhats(modelo ? `Olá! Estou criando uma arte para ${modelo.nome} no site e tenho uma dúvida.` : 'Olá! Quero criar uma arte personalizada e tenho uma dúvida.')

  useEffect(() => {
    if (!d || !modeloId) return
    if (d.base) setDesenho(structuredClone(d.base.desenho))
    else setDesenho(lerRascunho(modeloId)?.desenho || VAZIO)
  }, [d, modeloId])

  useEffect(() => {
    if (!desenho || !modeloId) return
    const t = setTimeout(() => {
      try {
        localStorage.setItem(chaveRascunho(modeloId), JSON.stringify({ desenho }))
      } catch {
        return
      }
    }, 500)
    return () => clearTimeout(t)
  }, [desenho, modeloId])

  if (!d) return <Carregando />

  if (!modelo)
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="font-mao text-3xl text-rosa">crie a sua arte</p>
        <h1 className="text-4xl">Em qual peça vamos pintar?</h1>
        <p className="mt-2 max-w-xl text-cinza">Escolha a peça. No editor você monta o desenho com flores, frutinhas, lacinhos e o nome que quiser.</p>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {d.modelos.map((m) => (
            <CartaoModelo key={m.id} modelo={m} para={`/criar/${m.id}`} />
          ))}
        </div>
      </div>
    )

  if (!desenho) return <Carregando />
  const vazio = !desenho.frente.length && !desenho.verso.length

  const colocarNaSacola = async () => {
    if (vazio && !f.referencias.length) return notificar('Monte o desenho ou envie uma imagem de referência.', 'erro')
    setAdicionando(true)
    try {
      const [mockup, mockup_verso] = await Promise.all([exportarPng(modelo, desenho, 'frente', {}, 480), desenho.verso.length ? exportarPng(modelo, desenho, 'verso', {}, 480) : null])
      adicionarAoCarrinho({
        tipo: 'personalizada',
        modelo_id: modelo.id,
        descricao: `${modelo.nome}, arte criada por mim`,
        detalhes: descreverDesenho(desenho),
        observacoes: f.observacoes,
        referencias: f.referencias,
        mockup,
        mockup_verso,
        quantidade: f.quantidade,
        preco: Number(modelo.preco_base),
        prazo: modelo.prazo_producao_dias,
      })
      try {
        localStorage.removeItem(chaveRascunho(modelo.id))
      } catch {
        void 0
      }
      notificar('Sua arte foi para a sacola.')
      nav('/carrinho')
    } catch (err) {
      notificar(err.message, 'erro')
    } finally {
      setAdicionando(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link to="/criar" className="inline-flex items-center gap-1 text-sm text-rosa">
        <ArrowLeft className="size-4" /> Trocar a peça
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-4xl">Crie a sua arte</h1>
        <p className="text-cinza">{modelo.nome}</p>
      </div>

      <div className="mt-6">
        <EditorArte modelo={modelo} desenho={desenho} aoMudar={setDesenho} elementos={d.elementos} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <h2 className="text-2xl">Conte para a pintora</h2>
          <div>
            <span className="rotulo">Imagens de referência (foto, desenho ou logo)</span>
            <EnviarImagens valor={f.referencias} aoMudar={(v) => setF({ ...f, referencias: v })} rotulo="Adicionar" />
          </div>
          <Campo rotulo="Observações" dica="Cores, estilo do traço, o que é mais importante para você.">
            <textarea className="campo min-h-28" value={f.observacoes} onChange={(e) => setF({ ...f, observacoes: e.target.value })} maxLength={800} />
          </Campo>
          <div>
            <span className="rotulo">Quantidade</span>
            <Contador valor={f.quantidade} aoMudar={(q) => setF({ ...f, quantidade: q })} />
          </div>
        </section>
        <aside className="cartao h-fit space-y-4 p-5 lg:sticky lg:top-24">
          <p className="text-[15px] leading-relaxed">
            A peça sai a partir de <b>{moeda(modelo.preco_base)}</b>. O valor final depende do desenho e a pintora confirma pelo WhatsApp quando você finalizar.
          </p>
          <button className="btn-primario w-full !py-3.5 text-base" onClick={colocarNaSacola} disabled={adicionando}>
            <ShoppingBag className="size-5" strokeWidth={1.6} /> {adicionando ? 'Preparando…' : 'Colocar na sacola'}
          </button>
          <AvisoArtesanal />
        </aside>
      </div>
    </div>
  )
}
