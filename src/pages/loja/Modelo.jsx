import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Brush, ShoppingBag } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados, useWhats } from '../../lib/app'
import { diasUteis, moeda, nomeMaterial } from '../../lib/format'
import { percentualDesconto, proximaFaixa } from '../../lib/regras'
import { CORES_TINTA } from '../../lib/elementos'
import Peca from '../../components/Peca'
import { AvisoArtesanal, Campo, Carregando, Contador, Vazio } from '../../components/ui'

export function CamposPersonalizacao({ arte, pers, aoMudar }) {
  const p = arte?.personalizavel || {}
  const usa = (campo) => p[campo] !== false && JSON.stringify(arte?.desenho || {}).includes(`{${campo}}`)
  const set = (campo) => (e) => aoMudar({ ...pers, [campo]: e.target ? e.target.value : e })
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {usa('nome') && (
        <Campo rotulo="Nome">
          <input className="campo" maxLength={28} value={pers.nome || ''} onChange={set('nome')} placeholder="Ex.: Helena" />
        </Campo>
      )}
      {usa('data') && (
        <Campo rotulo="Data">
          <input className="campo" type="date" value={pers.data || ''} onChange={set('data')} />
        </Campo>
      )}
      {usa('frase') && (
        <Campo rotulo="Frase" className="sm:col-span-2">
          <input className="campo" maxLength={40} value={pers.frase || ''} onChange={set('frase')} placeholder="Ex.: Para brindar a vida" />
        </Campo>
      )}
      {p.cor !== false && JSON.stringify(arte?.desenho || {}).includes('principal') && (
        <div className="sm:col-span-2">
          <span className="rotulo">Cor predominante</span>
          <div className="flex flex-wrap gap-2">
            {CORES_TINTA.filter((c) => c.cor !== '#ffffff').map(({ cor, nome }) => (
              <button key={cor} type="button" title={nome} onClick={() => aoMudar({ ...pers, cor })} className={`size-8 rounded-full border-2 ring-1 ring-borda ${(pers.cor || arte?.desenho?.cor) === cor ? 'border-grafite' : 'border-white'}`} style={{ background: cor }} aria-label={`Cor ${nome}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ModeloPagina() {
  const { id } = useParams()
  const [busca] = useSearchParams()
  const nav = useNavigate()
  const { adicionarAoCarrinho, config, notificar } = useApp()
  const [lado, setLado] = useState('frente')
  const [arteId, setArteId] = useState(busca.get('arte'))
  const [tema, setTema] = useState('')
  const [pers, setPers] = useState({})
  const [qtd, setQtd] = useState(1)
  const [foto, setFoto] = useState(null)
  const [adicionando, setAdicionando] = useState(false)
  const [d] = useDados(async () => {
    const modelo = await db.obter('modelos', id)
    const artes = (await db.listar('artes', { filtro: { ativo: true }, ordem: 'nome' })).filter((a) => a.modelos_aceitos?.includes(id))
    return { modelo, artes }
  }, [id])

  const arte = d?.artes.find((a) => a.id === arteId) || null
  useEffect(() => {
    if (d && !arteId && d.artes[0]) setArteId(d.artes[0].id)
  }, [d, arteId])

  const temas = useMemo(() => [...new Set((d?.artes || []).map((a) => a.tema))], [d])
  useWhats(d?.modelo ? `Olá! Tenho uma dúvida sobre ${d.modelo.nome}${arte ? ` com a arte ${arte.nome}` : ''}.` : '')

  if (!d) return <Carregando />
  const { modelo } = d
  if (!modelo || !modelo.disponivel)
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Vazio titulo="Esta peça não está disponível agora" texto="Pode ter acabado o estoque. Veja as outras peças." acao={<Link to="/catalogo" className="btn-primario">Ver as peças</Link>} />
      </div>
    )

  const preco = Number(modelo.preco_base) + Number(arte?.acrescimo || 0)
  const pct = percentualDesconto(qtd, config.descontos)
  const prox = proximaFaixa(qtd, config.descontos)
  const fotos = [...(modelo.fotos || []), ...(arte?.fotos || [])]

  const adicionar = async () => {
    if (!arte) return
    setAdicionando(true)
    try {
      const { exportarPng } = await import('../../lib/konva')
      const [mockup, mockup_verso] = await Promise.all([exportarPng(modelo, arte.desenho, 'frente', pers, 480), arte.desenho?.verso?.length ? exportarPng(modelo, arte.desenho, 'verso', pers, 480) : null])
      adicionarAoCarrinho({
        tipo: 'arte',
        modelo_id: modelo.id,
        arte_id: arte.id,
        descricao: `${modelo.nome}, arte ${arte.nome}`,
        mockup_verso,
        personalizacao: pers,
        mockup,
        quantidade: qtd,
        preco,
        prazo: modelo.prazo_producao_dias,
      })
      notificar('Peça adicionada à sacola.')
      nav('/carrinho')
    } catch (err) {
      notificar(err.message, 'erro')
    } finally {
      setAdicionando(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link to="/catalogo" className="inline-flex items-center gap-1 text-sm text-rosa">
        <ArrowLeft className="size-4" /> Todas as peças
      </Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_1.05fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="arco relative mx-auto max-w-md overflow-hidden bg-petala">
            {foto ? <img src={foto} alt="" className="aspect-[4/5] w-full object-cover" /> : <Peca modelo={modelo} lado={lado} desenho={arte?.desenho} pers={pers} className="aspect-[4/5] w-full px-6 pb-8 pt-16" comSombra={false} ajustar />}
            {!foto && (
              <div className="absolute bottom-10 left-1/2 inline-flex -translate-x-1/2 rounded-full bg-white/90 p-1">
                {['frente', 'verso'].map((l) => (
                  <button key={l} onClick={() => setLado(l)} className={`rounded-full px-4 py-1 text-sm capitalize ${lado === l ? 'bg-rosa text-white' : 'text-ameixa'}`}>
                    {l}
                  </button>
                ))}
              </div>
            )}
            <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-cinza">{foto ? 'Foto real de peça pintada' : 'Pré-visualização. A pintura real é feita à mão.'}</p>
          </div>
          {fotos.length > 0 && (
            <div className="rolagem-fina mx-auto mt-3 flex max-w-md gap-2 overflow-x-auto">
              <button onClick={() => setFoto(null)} className={`size-16 shrink-0 overflow-hidden rounded-xl bg-petala ring-2 ${!foto ? 'ring-rosa' : 'ring-transparent'}`} aria-label="Pré-visualização">
                <Peca modelo={modelo} desenho={arte?.desenho} pers={pers} className="size-full" comSombra={false} ajustar />
              </button>
              {fotos.map((f) => (
                <button key={f} onClick={() => setFoto(f)} className={`size-16 shrink-0 overflow-hidden rounded-xl ring-2 ${foto === f ? 'ring-rosa' : 'ring-transparent'}`} aria-label="Foto real">
                  <img src={f} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl leading-tight">{modelo.nome}</h1>
            <p className="mt-2 text-2xl text-rosa-escuro">
              {moeda(preco)} <span className="text-base text-cinza">por peça</span>
            </p>
            {modelo.descricao && <p className="mt-3 max-w-prose leading-relaxed text-cinza">{modelo.descricao}</p>}
            <dl className="mt-4 grid max-w-md grid-cols-2 gap-y-1 text-sm">
              {modelo.capacidade_ml && (
                <>
                  <dt className="text-cinza">Capacidade</dt>
                  <dd>{modelo.capacidade_ml} ml</dd>
                </>
              )}
              {modelo.altura_cm && (
                <>
                  <dt className="text-cinza">Medidas</dt>
                  <dd>
                    {modelo.altura_cm} cm de altura, {modelo.diametro_cm} cm de diâmetro
                  </dd>
                </>
              )}
              <dt className="text-cinza">Material</dt>
              <dd>{nomeMaterial(modelo.material)}</dd>
              <dt className="text-cinza">Pintura</dt>
              <dd>{diasUteis(modelo.prazo_producao_dias)}</dd>
            </dl>
          </div>

          <section>
            <div className="mb-4 flex items-end justify-between gap-2">
              <h2 className="text-2xl">Escolha a pintura</h2>
              <Link to={`/criar/${modelo.id}`} className="inline-flex items-center gap-1 text-sm text-rosa underline decoration-ouro underline-offset-4">
                <Brush className="size-4" /> ou crie a sua
              </Link>
            </div>
            {temas.length > 1 && (
              <div className="rolagem-fina mb-4 flex gap-2 overflow-x-auto pb-1">
                <button onClick={() => setTema('')} className={`chip shrink-0 !py-1 ${!tema ? 'chip-ativo' : ''}`}>
                  Todas
                </button>
                {temas.map((t) => (
                  <button key={t} onClick={() => setTema(t)} className={`chip shrink-0 !py-1 ${tema === t ? 'chip-ativo' : ''}`}>
                    {t}
                  </button>
                ))}
              </div>
            )}
            {d.artes.length === 0 ? (
              <p className="text-sm text-cinza">
                Ainda não há artes prontas para esta peça.{' '}
                <Link to={`/criar/${modelo.id}`} className="text-rosa underline">
                  Crie a sua
                </Link>
                .
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {d.artes
                  .filter((a) => !tema || a.tema === tema)
                  .map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setArteId(a.id)
                        setFoto(null)
                      }}
                      className="group text-center"
                      aria-pressed={a.id === arteId}
                    >
                      <div className={`arco aspect-[4/5] overflow-hidden bg-petala ring-2 ring-offset-2 ring-offset-papel transition ${a.id === arteId ? 'ring-rosa' : 'ring-transparent group-hover:ring-borda'}`}>
                        {a.fotos?.[0] ? <img src={a.fotos[0]} alt="" className="size-full object-cover" /> : <Peca modelo={modelo} desenho={a.desenho} pers={pers} className="size-full px-1 pt-3" comSombra={false} ajustar />}
                      </div>
                      <p className={`mt-1.5 truncate text-sm ${a.id === arteId ? 'text-rosa' : 'text-grafite'}`}>{a.nome}</p>
                      <p className="text-xs text-cinza">+{moeda(a.acrescimo)}</p>
                    </button>
                  ))}
              </div>
            )}
          </section>

          {arte && (
            <section>
              <h2 className="mb-4 text-2xl">Personalize</h2>
              <CamposPersonalizacao arte={arte} pers={pers} aoMudar={setPers} />
            </section>
          )}

          <section className="space-y-4 border-t border-borda pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="rotulo">Quantidade</p>
                <Contador valor={qtd} aoMudar={setQtd} />
              </div>
              <div className="text-right">
                <p className="titulo text-3xl">{moeda(preco * qtd * (1 - pct / 100))}</p>
                {pct > 0 && <p className="text-sm text-folha">{pct}% de desconto por quantidade</p>}
              </div>
            </div>
            {prox && <p className="text-sm text-cinza">A partir de {prox.minimo} peças na sacola, {prox.percentual}% de desconto. Ótimo para lembrancinhas.</p>}
            <button className="btn-primario w-full !py-3.5 text-base" onClick={adicionar} disabled={!arte || adicionando}>
              <ShoppingBag className="size-5" strokeWidth={1.6} /> {adicionando ? 'Preparando…' : 'Colocar na sacola'}
            </button>
          </section>

          <AvisoArtesanal />
        </div>
      </div>
    </div>
  )
}
