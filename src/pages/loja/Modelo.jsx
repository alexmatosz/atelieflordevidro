import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Brush, Clock, Ruler, ShoppingBag } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados, useWhats } from '../../lib/app'
import { diasUteis, moeda, nomeMaterial } from '../../lib/format'
import { percentualDesconto, proximaFaixa } from '../../lib/regras'
import { CORES_TINTA } from '../../lib/elementos'
import Peca, { MiniaturaArte } from '../../components/Peca'
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
      {p.cor !== false && (
        <div className="sm:col-span-2">
          <span className="rotulo">Cor predominante</span>
          <div className="flex flex-wrap gap-2">
            {CORES_TINTA.filter((c) => c !== '#ffffff').map((c) => (
              <button key={c} type="button" onClick={() => aoMudar({ ...pers, cor: c })} className={`size-8 rounded-full border-2 shadow-sm ring-1 ring-linho ${(pers.cor || arte?.desenho?.cor) === c ? 'border-tinta' : 'border-white'}`} style={{ background: c }} aria-label={`Cor ${c}`} />
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
        <Vazio titulo="Este modelo não está disponível agora" texto="Pode ter acabado o estoque. Veja os outros modelos." acao={<Link to="/catalogo" className="btn-primario">Ver modelos</Link>} />
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
      const mockup = await exportarPng(modelo, arte.desenho, 'frente', pers, 360)
      adicionarAoCarrinho({
        tipo: 'arte',
        modelo_id: modelo.id,
        arte_id: arte.id,
        descricao: `${modelo.nome} · ${arte.nome}`,
        personalizacao: pers,
        mockup,
        quantidade: qtd,
        preco,
        prazo: modelo.prazo_producao_dias,
      })
      notificar('Peça adicionada ao carrinho.')
      nav('/carrinho')
    } catch (err) {
      notificar(err.message, 'erro')
    } finally {
      setAdicionando(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link to="/catalogo" className="inline-flex items-center gap-1 text-sm font-semibold text-terracota">
        <ArrowLeft className="size-4" /> Modelos
      </Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_1.05fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative overflow-hidden rounded-[2rem] bg-areia/70 textura">
            {foto ? <img src={foto} alt="" className="aspect-[4/5] w-full object-cover" /> : <Peca modelo={modelo} lado={lado} desenho={arte?.desenho} pers={pers} className="aspect-[4/5] w-full p-6" />}
            {!foto && (
              <div className="absolute left-1/2 top-4 inline-flex -translate-x-1/2 rounded-full bg-white/90 p-1 shadow-sm">
                {['frente', 'verso'].map((l) => (
                  <button key={l} onClick={() => setLado(l)} className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${lado === l ? 'bg-terracota text-white' : 'text-argila'}`}>
                    {l}
                  </button>
                ))}
              </div>
            )}
            <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-cinza">{foto ? 'Foto real de peça pintada' : 'Pré-visualização. A pintura real é feita à mão.'}</p>
          </div>
          {fotos.length > 0 && (
            <div className="rolagem-fina mt-3 flex gap-2 overflow-x-auto">
              <button onClick={() => setFoto(null)} className={`size-16 shrink-0 overflow-hidden rounded-xl bg-areia ring-2 ${!foto ? 'ring-terracota' : 'ring-transparent'}`} aria-label="Pré-visualização">
                <Peca modelo={modelo} desenho={arte?.desenho} pers={pers} className="size-full" comSombra={false} />
              </button>
              {fotos.map((f) => (
                <button key={f} onClick={() => setFoto(f)} className={`size-16 shrink-0 overflow-hidden rounded-xl ring-2 ${foto === f ? 'ring-terracota' : 'ring-transparent'}`} aria-label="Foto real">
                  <img src={f} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl">{modelo.nome}</h1>
            <p className="mt-2 text-2xl font-bold text-terracota-escuro">
              {moeda(preco)} <span className="text-sm font-normal text-cinza">por peça</span>
            </p>
            {modelo.descricao && <p className="mt-3 text-cinza">{modelo.descricao}</p>}
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="selo !py-1">
                <Ruler className="size-3.5" /> {modelo.altura_cm} × {modelo.diametro_cm} cm
              </span>
              <span className="selo !py-1">{modelo.capacidade_ml} ml</span>
              <span className="selo !py-1">{nomeMaterial(modelo.material)}</span>
              <span className="selo !py-1">
                <Clock className="size-3.5" /> Pintura em {diasUteis(modelo.prazo_producao_dias)}
              </span>
            </div>
          </div>

          <section>
            <div className="mb-3 flex items-end justify-between gap-2">
              <h2 className="text-xl">1. Escolha a pintura</h2>
              <Link to={`/criar/${modelo.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-terracota">
                <Brush className="size-4" /> ou crie a sua
              </Link>
            </div>
            {temas.length > 1 && (
              <div className="rolagem-fina mb-3 flex gap-2 overflow-x-auto pb-1">
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
              <p className="text-sm text-cinza">Ainda não há artes prontas para este modelo. <Link to={`/criar/${modelo.id}`} className="font-semibold text-terracota">Crie a sua</Link>.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {d.artes
                  .filter((a) => !tema || a.tema === tema)
                  .map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setArteId(a.id)
                        setFoto(null)
                      }}
                      className={`overflow-hidden rounded-2xl bg-white text-left ring-2 transition ${a.id === arteId ? 'ring-terracota' : 'ring-linho/60 hover:ring-linho'}`}
                    >
                      <div className="aspect-square bg-areia/50">
                        <MiniaturaArte arte={a} modelo={modelo} pers={pers} />
                      </div>
                      <p className="truncate px-2 pt-1.5 text-xs font-semibold">{a.nome}</p>
                      <p className="px-2 pb-2 text-[11px] text-cinza">+{moeda(a.acrescimo)}</p>
                    </button>
                  ))}
              </div>
            )}
          </section>

          {arte && (
            <section>
              <h2 className="mb-3 text-xl">2. Personalize</h2>
              <CamposPersonalizacao arte={arte} pers={pers} aoMudar={setPers} />
            </section>
          )}

          <section className="cartao space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="rotulo !mb-1">Quantidade</p>
                <Contador valor={qtd} aoMudar={setQtd} />
              </div>
              <div className="text-right">
                <p className="text-sm text-cinza">Total das peças</p>
                <p className="titulo text-2xl">{moeda(preco * qtd * (1 - pct / 100))}</p>
                {pct > 0 && <p className="text-xs font-semibold text-salvia">{pct}% de desconto por quantidade</p>}
              </div>
            </div>
            {prox && <p className="rounded-xl bg-areia/60 px-3 py-2 text-xs text-argila">A partir de {prox.minimo} peças no carrinho, {prox.percentual}% de desconto. Ótimo para lembrancinhas.</p>}
            <button className="btn-primario w-full !py-3 text-base" onClick={adicionar} disabled={!arte || adicionando}>
              <ShoppingBag className="size-5" /> {adicionando ? 'Preparando…' : 'Adicionar ao carrinho'}
            </button>
          </section>

          <AvisoArtesanal />
        </div>
      </div>
    </div>
  )
}
