import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Brush, ChevronDown, ChevronRight, ShoppingBag } from 'lucide-react'
import { db } from '../../lib/db'
import { precoDoModelo, useApp, useDados, useWhats } from '../../lib/app'
import { nomeTipo } from '../../lib/promocoes'
import { diasUteis, moeda, nomeMaterial } from '../../lib/format'
import { linkWhatsApp, percentualDesconto, proximaFaixa } from '../../lib/regras'
import { CORES_TINTA } from '../../lib/elementos'
import Peca from '../../components/Peca'
import { CartaoModelo, Campo, Carregando, Contador, Vazio } from '../../components/ui'
import { Carrossel, Contagem, Preco, Revelar, SeloPromo } from '../../components/vitrine'
import { IconeWhats } from '../../components/Layout'

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
              <button key={cor} type="button" title={nome} onClick={() => aoMudar({ ...pers, cor })} className={`size-9 rounded-full border-2 ring-1 ring-borda transition active:scale-90 ${(pers.cor || arte?.desenho?.cor) === cor ? 'border-grafite' : 'border-white'}`} style={{ background: cor }} aria-label={`Cor ${nome}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Sanfona({ titulo, children, aberta = false }) {
  return (
    <details className="group border-b border-borda py-1" open={aberta}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 text-[16px] font-semibold text-grafite [&::-webkit-details-marker]:hidden">
        {titulo}
        <ChevronDown className="size-5 text-cinza transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <div className="animate-esmaecer pb-4 text-[15px] leading-relaxed text-cinza">{children}</div>
    </details>
  )
}

export default function ModeloPagina() {
  const { id } = useParams()
  const [busca] = useSearchParams()
  const { adicionarAoCarrinho, config, notificar, promocoes, categorias } = useApp()
  const [arteId, setArteId] = useState(busca.get('arte'))
  const [tema, setTema] = useState('')
  const [pers, setPers] = useState({})
  const [qtd, setQtd] = useState(1)
  const [adicionando, setAdicionando] = useState(false)
  const [slide, setSlide] = useState(0)
  const [d] = useDados(async () => {
    const [modelo, todas, modelos] = await Promise.all([db.obter('modelos', id), db.listar('artes', { filtro: { ativo: true }, ordem: 'nome' }), db.listar('modelos', { filtro: { disponivel: true } })])
    return { modelo, artes: todas.filter((a) => a.modelos_aceitos?.includes(id)), todas, modelos }
  }, [id])

  useEffect(() => {
    setArteId(busca.get('arte'))
    setQtd(1)
  }, [id])

  const arte = d?.artes.find((a) => a.id === arteId) || null
  useEffect(() => {
    if (d && !arte && d.artes[0]) setArteId(d.artes[0].id)
  }, [d, arte])

  useEffect(() => {
    setSlide(0)
  }, [arteId])

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

  const { preco, cheio, promo } = precoDoModelo(modelo, promocoes, arte?.acrescimo)
  const pct = percentualDesconto(qtd, config.descontos)
  const prox = proximaFaixa(qtd, config.descontos)
  const total = preco * qtd * (1 - pct / 100)
  const categoria = categorias.find((c) => c.id === modelo.categoria)
  const temVerso = arte?.desenho?.verso?.length > 0
  const slides = [
    { tipo: 'frente' },
    ...(temVerso ? [{ tipo: 'verso' }] : []),
    ...(arte?.fotos || []).map((f) => ({ tipo: 'foto', src: f })),
    ...(modelo.fotos || []).map((f) => ({ tipo: 'foto', src: f })),
  ]
  const relacionados = d.modelos
    .filter((m) => m.id !== modelo.id)
    .sort((a, b) => Number(b.categoria === modelo.categoria) - Number(a.categoria === modelo.categoria))
    .slice(0, 4)

  const adicionar = async () => {
    if (!arte) return
    setAdicionando(true)
    try {
      const { exportarPng } = await import('../../lib/konva')
      const [mockup, mockup_verso] = await Promise.all([exportarPng(modelo, arte.desenho, 'frente', pers, 480), temVerso ? exportarPng(modelo, arte.desenho, 'verso', pers, 480) : null])
      adicionarAoCarrinho({
        tipo: 'arte',
        modelo_id: modelo.id,
        arte_id: arte.id,
        categoria: modelo.categoria,
        descricao: `${modelo.nome}, arte ${arte.nome}`,
        mockup_verso,
        personalizacao: pers,
        mockup,
        quantidade: qtd,
        preco,
        preco_cheio: cheio,
        promocao: promo ? { id: promo.id, titulo: promo.titulo, tipo: promo.tipo, percentual: Number(promo.percentual) } : null,
        prazo: modelo.prazo_producao_dias,
      })
    } catch (err) {
      notificar(err.message, 'erro')
    } finally {
      setAdicionando(false)
    }
  }

  const visual = (s, mini = false) =>
    s.tipo === 'foto' ? (
      <img src={s.src} alt={mini ? '' : `Foto de ${modelo.nome}`} className="size-full object-cover" loading="lazy" />
    ) : (
      <Peca modelo={modelo} lado={s.tipo} desenho={arte?.desenho} pers={pers} className={mini ? 'size-full p-1' : 'size-full px-8 pb-12 pt-16 sm:px-10'} comSombra={false} ajustar />
    )

  const botao = (classe = '') => (
    <button className={`btn-primario !py-3.5 text-base ${classe}`} onClick={adicionar} disabled={!arte || adicionando}>
      <ShoppingBag className="size-5" strokeWidth={1.7} /> {adicionando ? 'Preparando…' : 'Colocar na sacola'}
    </button>
  )

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-4 lg:pb-10">
      <nav aria-label="Você está em" className="sem-barra flex items-center gap-1 overflow-x-auto whitespace-nowrap text-[13px] text-cinza">
        <Link to="/" className="hover:text-rosa">
          Início
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <Link to={categoria ? `/catalogo?categoria=${categoria.id}` : '/catalogo'} className="hover:text-rosa">
          {categoria?.nome || 'Peças'}
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="text-grafite">{modelo.nome}</span>
      </nav>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative mx-auto w-full max-w-md">
            <div className="moldura aspect-[4/5]">
              <Carrossel key={`${arte?.id}-${slides.length}`} rotulo={`Fotos de ${modelo.nome}`} className="size-full" classeSlide="h-full" indice={slide} aoMudar={setSlide}>
                {slides.map((s, i) => (
                  <div key={i} className="relative size-full">
                    {visual(s)}
                    {s.tipo !== 'foto' && <span className="absolute left-1/2 top-[9%] -translate-x-1/2 rounded-full bg-white/90 px-3 py-0.5 text-xs font-semibold capitalize text-ameixa">{s.tipo}</span>}
                  </div>
                ))}
              </Carrossel>
              <SeloPromo promo={promo} className="absolute bottom-9 left-6 z-10 !px-3 !py-1.5 !text-sm" />
            </div>
            {slides.length > 1 && (
              <div className="sem-barra mt-3 flex justify-center gap-2 overflow-x-auto pb-1">
                {slides.map((s, i) => (
                  <button key={i} type="button" onClick={() => setSlide(i)} className={`moldura aspect-[4/5] w-14 shrink-0 !shadow-none transition after:!inset-[3px] active:scale-95 sm:w-16 ${i === slide ? '!border-rosa ring-2 ring-rosa/25' : 'opacity-70 hover:opacity-100'}`} aria-label={`Ver imagem ${i + 1}`} aria-current={i === slide}>
                    {visual(s, true)}
                  </button>
                ))}
              </div>
            )}
            <p className="mt-2 text-center text-xs text-cinza">Arraste para o lado para ver {temVerso ? 'o verso e ' : ''}as fotos. A pré-visualização é uma ilustração: a peça é pintada à mão.</p>
          </div>
        </div>

        <div className="space-y-7">
          <div>
            {promo && (
              <p className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-rosa">{nomeTipo(promo.tipo)}</span>
                {promo.fim && promo.tipo === 'relampago' && <Contagem fim={promo.fim} />}
              </p>
            )}
            <h1 className="text-[30px] leading-tight sm:text-4xl">{modelo.nome}</h1>
            <div className="mt-3">
              <Preco preco={preco} cheio={cheio} tamanho="grande" />
              <span className="ml-2 text-sm text-cinza">por peça</span>
            </div>
            {promo && <p className="mt-1 text-sm font-semibold text-folha">Você economiza {moeda(cheio - preco)} em cada peça</p>}
            <p className="mt-1.5 text-sm text-cinza">Pix ou cartão, combinado no WhatsApp ao finalizar.</p>
            {modelo.descricao && <p className="mt-4 max-w-prose leading-relaxed text-cinza">{modelo.descricao}</p>}
          </div>

          <section>
            <div className="mb-4 flex items-end justify-between gap-2">
              <h2 className="text-2xl">Escolha a pintura</h2>
              <Link to={`/criar/${modelo.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-rosa">
                <Brush className="size-4" /> Criar a minha
              </Link>
            </div>
            {temas.length > 1 && (
              <div className="sem-barra -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
                <button onClick={() => setTema('')} className={`chip shrink-0 ${!tema ? 'chip-ativo' : ''}`}>
                  Todas
                </button>
                {temas.map((t) => (
                  <button key={t} onClick={() => setTema(t)} className={`chip shrink-0 ${tema === t ? 'chip-ativo' : ''}`}>
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
                  .map((a) => {
                    const ativo = a.id === arteId
                    return (
                      <button key={a.id} onClick={() => setArteId(a.id)} className="group self-start text-center transition active:scale-95" aria-pressed={ativo}>
                        <div className={`moldura aspect-[4/5] !shadow-none transition ${ativo ? '!border-rosa ring-2 ring-rosa/30' : ''}`}>
                          {a.fotos?.[0] ? <img src={a.fotos[0]} alt="" className="size-full object-cover" /> : <Peca modelo={modelo} desenho={a.desenho} pers={pers} className="zoom-suave size-full px-1.5 pt-4" comSombra={false} ajustar />}
                        </div>
                        <p className={`mt-1.5 truncate text-[13px] font-semibold ${ativo ? 'text-rosa' : 'text-grafite'}`}>{a.nome}</p>
                        <p className="text-xs text-cinza">{Number(a.acrescimo) > 0 ? `+${moeda(a.acrescimo)}` : 'sem acréscimo'}</p>
                      </button>
                    )
                  })}
              </div>
            )}
          </section>

          {arte && (
            <section>
              <h2 className="mb-4 text-2xl">Personalize</h2>
              <CamposPersonalizacao arte={arte} pers={pers} aoMudar={setPers} />
            </section>
          )}

          <section className="space-y-4 rounded-[20px] border border-borda bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="rotulo">Quantidade</p>
                <Contador valor={qtd} aoMudar={setQtd} />
              </div>
              <div className="text-right">
                <p className="text-xs text-cinza">Total</p>
                <p className="titulo text-3xl">{moeda(total)}</p>
                {pct > 0 && <p className="text-sm font-semibold text-folha">{pct}% off pela quantidade</p>}
              </div>
            </div>
            {prox && <p className="text-sm text-cinza">Levando {prox.minimo} peças ou mais, você ganha {prox.percentual}% de desconto em tudo.</p>}
            {botao('hidden w-full lg:flex')}
            <a href={linkWhatsApp(config.loja?.whatsapp, `Olá! Tenho uma dúvida sobre ${modelo.nome}${arte ? ` com a arte ${arte.nome}` : ''}.`)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-sm font-semibold text-folha">
              <IconeWhats className="size-4" /> Tirar uma dúvida no WhatsApp
            </a>
          </section>

          <div>
            <Sanfona titulo="Detalhes da peça" aberta>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5">
                {modelo.capacidade_ml && (
                  <>
                    <dt>Capacidade</dt>
                    <dd className="text-grafite">{modelo.capacidade_ml} ml</dd>
                  </>
                )}
                {modelo.altura_cm && (
                  <>
                    <dt>Medidas</dt>
                    <dd className="text-grafite">
                      {modelo.altura_cm} cm de altura{modelo.diametro_cm ? `, ${modelo.diametro_cm} cm de diâmetro` : ''}
                    </dd>
                  </>
                )}
                <dt>Material</dt>
                <dd className="text-grafite">{nomeMaterial(modelo.material)}</dd>
                <dt>Pintura</dt>
                <dd className="text-grafite">{diasUteis(modelo.prazo_producao_dias)}</dd>
              </dl>
            </Sanfona>
            <Sanfona titulo="Pintura à mão">{config.textos?.aviso_artesanal}</Sanfona>
            <Sanfona titulo="Cuidados">{config.textos?.cuidados}</Sanfona>
            <Sanfona titulo="Prazo e entrega">O prazo de pintura conta em dias úteis depois que combinamos a arte. Antes de enviar, mandamos a foto da peça pronta. O frete é calculado pelo seu CEP e combinado no WhatsApp.</Sanfona>
            <Sanfona titulo="Trocas e devoluções">
              Você pode desistir em até 7 dias do recebimento, e peça quebrada ou com defeito a gente pinta de novo.{' '}
              <Link to="/trocas" className="font-semibold text-rosa underline">
                Ler a política completa
              </Link>
            </Sanfona>
          </div>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="pt-16">
          <Revelar>
            <h2 className="mb-6 text-[26px] sm:text-3xl">Você também pode gostar</h2>
          </Revelar>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {relacionados.map((m, i) => (
              <Revelar key={m.id} atraso={i * 80}>
                <CartaoModelo modelo={m} artes={d.todas} />
              </Revelar>
            ))}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-borda bg-papel/95 px-4 pt-3 backdrop-blur pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 leading-tight">
            <p className="text-xs text-cinza">{qtd > 1 ? `${qtd} peças` : 'por peça'}</p>
            <p className="titulo truncate text-xl">{moeda(qtd > 1 ? total : preco)}</p>
          </div>
          {botao('flex-1')}
        </div>
      </div>
    </div>
  )
}
