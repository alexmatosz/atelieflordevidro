import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { db, MODO_DEMO } from '../../lib/db'
import { useApp, useDados, useWhats } from '../../lib/app'
import { mascaraFone } from '../../lib/format'
import { exportarPng } from '../../lib/konva'
import EditorArte from '../../components/EditorArte'
import { AvisoArtesanal, CartaoModelo, Campo, Carregando, Contador, EnviarImagens } from '../../components/ui'

const VAZIO = { frente: [], verso: [], cor: '#b4673f' }
const chaveRascunho = (id) => `afv:rascunho:${id}`

function lerRascunho(id) {
  try {
    return JSON.parse(localStorage.getItem(chaveRascunho(id)))
  } catch {
    return null
  }
}

export default function CrieSuaArte() {
  const { modeloId } = useParams()
  const [busca] = useSearchParams()
  const reenviarId = busca.get('reenviar')
  const nav = useNavigate()
  const { usuario, entrarDemo, notificar } = useApp()
  const [desenho, setDesenho] = useState(null)
  const [f, setF] = useState({ referencias: [], observacoes: '', quantidade: 1, data_desejada: '', nome: '', email: '', whatsapp: '' })
  const [enviando, setEnviando] = useState(false)

  const [d] = useDados(async () => {
    const [modelos, elementos] = await Promise.all([db.listar('modelos', { filtro: { disponivel: true }, ordem: 'nome' }), db.listar('elementos_editor', { filtro: { ativo: true } })])
    const base = busca.get('arte') ? await db.obter('artes', busca.get('arte')) : null
    const anterior = reenviarId ? await db.obter('solicitacoes_analise', reenviarId) : null
    return { modelos, elementos, base, anterior }
  }, [reenviarId])

  const modelo = d?.modelos.find((m) => m.id === modeloId)
  useWhats(modelo ? `Olá! Estou criando uma arte para ${modelo.nome} no site e tenho uma dúvida.` : 'Olá! Quero criar uma arte personalizada e tenho uma dúvida.')

  useEffect(() => {
    if (!d || !modeloId) return
    if (d.anterior) {
      setDesenho(d.anterior.desenho || VAZIO)
      setF((x) => ({ ...x, observacoes: d.anterior.observacoes || '', quantidade: d.anterior.quantidade, referencias: d.anterior.referencias || [] }))
    } else if (d.base) setDesenho(structuredClone(d.base.desenho))
    else setDesenho(lerRascunho(modeloId)?.desenho || VAZIO)
  }, [d, modeloId])

  useEffect(() => {
    if (usuario) setF((x) => ({ ...x, nome: x.nome || usuario.nome || '', email: x.email || usuario.email || '', whatsapp: x.whatsapp || usuario.whatsapp || '' }))
  }, [usuario])

  useEffect(() => {
    if (!desenho || !modeloId || reenviarId) return
    const t = setTimeout(() => {
      try {
        localStorage.setItem(chaveRascunho(modeloId), JSON.stringify({ desenho }))
      } catch {
        return
      }
    }, 500)
    return () => clearTimeout(t)
  }, [desenho, modeloId, reenviarId])

  if (!d) return <Carregando />

  if (!modelo)
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="font-mao text-2xl text-terracota">crie sua arte</p>
        <h1 className="text-3xl sm:text-4xl">Em qual peça vamos pintar?</h1>
        <p className="mt-2 max-w-xl text-cinza">Escolha o modelo. No editor você monta o desenho, envia referências e o artesão responde com preço e prazo.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {d.modelos.map((m) => (
            <CartaoModelo key={m.id} modelo={m} para={`/criar/${m.id}`} />
          ))}
        </div>
      </div>
    )

  if (!desenho) return <Carregando />
  const vazio = !desenho.frente.length && !desenho.verso.length
  const set = (c, m) => (e) => setF({ ...f, [c]: m ? m(e.target.value) : e.target.value })

  const enviar = async (e) => {
    e.preventDefault()
    if (vazio && !f.referencias.length) return notificar('Monte o desenho ou envie pelo menos uma imagem de referência.', 'erro')
    if (!MODO_DEMO && !usuario) {
      notificar('Entre na sua conta para enviar. Seu desenho fica salvo.', 'erro')
      return nav(`/entrar?voltar=/criar/${modelo.id}`)
    }
    setEnviando(true)
    try {
      const u = usuario || entrarDemo({ nome: f.nome, email: f.email, whatsapp: f.whatsapp, papel: 'cliente' })
      const [pf, pv] = await Promise.all([exportarPng(modelo, desenho, 'frente', {}), exportarPng(modelo, desenho, 'verso', {})])
      const [mockup_frente, mockup_verso] = await Promise.all([db.enviarImagem(pf, 'clientes'), db.enviarImagem(pv, 'clientes')])
      if (reenviarId) {
        await db.reenviarSolicitacao(reenviarId, { desenho, mockup_frente, mockup_verso, observacoes: f.observacoes })
        notificar('Arte reenviada para análise.')
        return nav(`/solicitacao/${reenviarId}`)
      }
      const agora = new Date().toISOString()
      const s = await db.inserir('solicitacoes_analise', {
        cliente_id: u.id,
        cliente_nome: f.nome,
        cliente_email: f.email,
        cliente_whatsapp: f.whatsapp,
        modelo_id: modelo.id,
        mockup_frente,
        mockup_verso,
        desenho,
        referencias: f.referencias,
        observacoes: f.observacoes,
        quantidade: f.quantidade,
        data_desejada: f.data_desejada || null,
        status: 'em_analise',
        historico: [{ status: 'em_analise', em: agora, texto: 'Arte enviada' }],
        atualizado_em: agora,
      })
      try {
        localStorage.removeItem(chaveRascunho(modelo.id))
      } catch {
        void 0
      }
      nav(`/solicitacao/${s.id}?nova=1`)
    } catch (err) {
      notificar(err.message, 'erro')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link to="/criar" className="inline-flex items-center gap-1 text-sm font-semibold text-terracota">
        <ArrowLeft className="size-4" /> Trocar modelo
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-3xl sm:text-4xl">{reenviarId ? 'Ajustar e reenviar' : 'Crie sua arte'}</h1>
        <p className="text-sm text-cinza">{modelo.nome}</p>
      </div>
      {d.anterior?.comentario_artesao && reenviarId && (
        <div className="mt-4 rounded-2xl bg-rosa/30 p-4 text-sm">
          <p className="font-semibold">O que o artesão sugeriu:</p>
          <p className="mt-1 whitespace-pre-line">{d.anterior.comentario_artesao}</p>
          {d.anterior.imagem_ajuste && <img src={d.anterior.imagem_ajuste} alt="Exemplo do artesão" className="mt-3 max-h-48 rounded-xl" />}
        </div>
      )}

      <div className="mt-5">
        <EditorArte modelo={modelo} desenho={desenho} aoMudar={setDesenho} elementos={d.elementos} />
      </div>

      <form onSubmit={enviar} className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="cartao space-y-4 p-5">
            <h2 className="text-xl">Conte para o artesão</h2>
            <div>
              <span className="rotulo">Imagens de referência</span>
              <EnviarImagens valor={f.referencias} aoMudar={(v) => setF({ ...f, referencias: v })} rotulo="Foto, desenho ou logo" />
            </div>
            <Campo rotulo="Observações" dica="Cores exatas, estilo do traço, o que é mais importante para você.">
              <textarea className="campo min-h-28" value={f.observacoes} onChange={set('observacoes')} maxLength={1200} />
            </Campo>
            {!reenviarId && (
              <div className="flex flex-wrap gap-5">
                <div>
                  <span className="rotulo">Quantidade</span>
                  <Contador valor={f.quantidade} aoMudar={(q) => setF({ ...f, quantidade: q })} />
                </div>
                <Campo rotulo="Quero receber até">
                  <input className="campo" type="date" value={f.data_desejada} min={new Date().toISOString().slice(0, 10)} onChange={set('data_desejada')} />
                </Campo>
              </div>
            )}
          </section>
          {!reenviarId && (
            <section className="cartao grid gap-4 p-5 sm:grid-cols-3">
              <h2 className="text-xl sm:col-span-3">Para te responder</h2>
              <Campo rotulo="Nome">
                <input className="campo" required value={f.nome} onChange={set('nome')} autoComplete="name" />
              </Campo>
              <Campo rotulo="E-mail">
                <input className="campo" type="email" required value={f.email} onChange={set('email')} autoComplete="email" />
              </Campo>
              <Campo rotulo="WhatsApp">
                <input className="campo" required inputMode="tel" value={f.whatsapp} onChange={set('whatsapp', mascaraFone)} autoComplete="tel" />
              </Campo>
            </section>
          )}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <AvisoArtesanal />
          <div className="cartao space-y-3 p-5 text-sm">
            <p className="font-semibold">Como funciona a análise</p>
            <ol className="list-decimal space-y-1 pl-4 text-cinza">
              <li>O artesão olha seu desenho e as referências.</li>
              <li>Você recebe o preço e o prazo, ou uma sugestão de ajuste.</li>
              <li>Aprovou? Vira pedido com um clique.</li>
            </ol>
            <button className="btn-primario w-full !py-3 text-base" disabled={enviando}>
              <Send className="size-4" /> {enviando ? 'Enviando…' : reenviarId ? 'Reenviar para análise' : 'Enviar para análise'}
            </button>
            <p className="text-center text-xs text-cinza">Enviar não gera cobrança.</p>
          </div>
        </aside>
      </form>
    </div>
  )
}
