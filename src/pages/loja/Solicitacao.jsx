import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Check, ShoppingBag } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados, useWhats } from '../../lib/app'
import { STATUS_ANALISE, data, dataHora, diasUteis, moeda } from '../../lib/format'
import { urlSite } from '../../lib/regras'
import { AvisoArtesanal, Carregando, Vazio } from '../../components/ui'

const PASSOS = ['em_analise', 'aprovado', 'convertido']

export default function SolicitacaoPagina() {
  const { id } = useParams()
  const [busca] = useSearchParams()
  const nav = useNavigate()
  const { adicionarAoCarrinho, carrinho } = useApp()
  const [lado, setLado] = useState('frente')
  const [d] = useDados(async () => {
    const s = await db.obter('solicitacoes_analise', id)
    const modelo = s?.modelo_id ? await db.obter('modelos', s.modelo_id) : null
    return { s, modelo }
  }, [id])
  useWhats(d?.s ? `Olá! Tenho uma dúvida sobre a minha arte enviada para análise (#${d.s.codigo}): ${urlSite(`/solicitacao/${d.s.id}`)}` : '')

  if (!d) return <Carregando />
  const { s, modelo } = d
  if (!s)
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Vazio titulo="Solicitação não encontrada" texto="Entre na conta que você usou para enviar a arte." acao={<Link to="/entrar" className="btn-primario">Entrar</Link>} />
      </div>
    )

  const st = STATUS_ANALISE[s.status]
  const noCarrinho = carrinho.some((i) => i.solicitacao_id === s.id)
  const virarPedido = () => {
    if (!noCarrinho)
      adicionarAoCarrinho({
        tipo: 'analise',
        modelo_id: s.modelo_id,
        solicitacao_id: s.id,
        descricao: `${modelo?.nome || 'Peça'} · arte própria #${s.codigo}`,
        personalizacao: {},
        mockup: s.mockup_frente,
        quantidade: s.quantidade,
        preco: Number(s.preco_unitario),
        prazo: s.prazo_dias,
      })
    nav('/checkout')
  }
  const passo = s.status === 'ajuste_sugerido' ? 0 : PASSOS.indexOf(s.status)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {busca.get('nova') && (
        <div className="mb-6 rounded-3xl bg-salvia-clara p-6 text-center">
          <p className="font-mao text-2xl text-salvia">recebemos sua arte!</p>
          <p className="text-sm text-cinza">O artesão responde em até 2 dias úteis. Você pode acompanhar por este link.</p>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">Arte #{s.codigo}</h1>
        <span className={`selo !py-1 ${st.cor}`}>{st.nome}</span>
      </div>
      <p className="mt-1 text-sm text-cinza">
        {modelo?.nome} · {s.quantidade} un.{s.data_desejada && ` · para ${data(s.data_desejada)}`}
      </p>

      {s.status !== 'recusado' && (
        <ol className="mt-6 flex items-center gap-2 text-xs sm:text-sm">
          {['Em análise', 'Aprovado', 'Pedido'].map((n, i) => (
            <li key={n} className="flex flex-1 items-center gap-2">
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-full font-bold ${i <= passo ? 'bg-terracota text-white' : 'bg-areia text-cinza'}`}>{i < passo ? <Check className="size-4" /> : i + 1}</span>
              <span className={i === passo ? 'font-bold' : 'text-cinza'}>{n}</span>
              {i < 2 && <span className="h-px flex-1 bg-linho" />}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.1fr]">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-areia p-1">
            {['frente', 'verso'].map((l) => (
              <button key={l} onClick={() => setLado(l)} className={`rounded-full px-4 py-1 text-sm font-semibold capitalize ${lado === l ? 'bg-white text-terracota shadow-sm' : 'text-argila'}`}>
                {l}
              </button>
            ))}
          </div>
          <img src={lado === 'frente' ? s.mockup_frente : s.mockup_verso} alt={`Mockup ${lado}`} className="w-full rounded-3xl bg-areia" />
        </div>

        <div className="space-y-4">
          {s.status === 'em_analise' && (
            <div className="cartao p-5">
              <p className="titulo text-xl">O artesão está olhando sua arte</p>
              <p className="mt-1 text-sm text-cinza">Você recebe a resposta por e-mail e WhatsApp.</p>
            </div>
          )}
          {s.status === 'aprovado' && (
            <div className="cartao space-y-3 border-salvia/50 p-5">
              <p className="titulo text-2xl">Aprovada! ✓</p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-areia/60 p-3">
                  <p className="text-xs uppercase text-cinza">Por peça</p>
                  <p className="titulo text-xl">{moeda(s.preco_unitario)}</p>
                </div>
                <div className="rounded-xl bg-areia/60 p-3">
                  <p className="text-xs uppercase text-cinza">Pintura</p>
                  <p className="titulo text-xl">{diasUteis(s.prazo_dias)}</p>
                </div>
              </div>
              {s.comentario_artesao && <p className="rounded-xl bg-salvia-clara/60 p-3 text-sm">{s.comentario_artesao}</p>}
              <p className="text-sm">
                Total de {s.quantidade} peças: <b>{moeda(s.preco_unitario * s.quantidade)}</b> + frete
              </p>
              <button className="btn-primario w-full !py-3 text-base" onClick={virarPedido}>
                <ShoppingBag className="size-5" /> Fazer o pedido
              </button>
            </div>
          )}
          {s.status === 'ajuste_sugerido' && (
            <div className="cartao space-y-3 p-5">
              <p className="titulo text-xl">O artesão sugeriu um ajuste</p>
              <p className="whitespace-pre-line text-sm">{s.comentario_artesao}</p>
              {s.imagem_ajuste && <img src={s.imagem_ajuste} alt="Exemplo enviado pelo artesão" className="rounded-xl" />}
              <Link to={`/criar/${s.modelo_id}?reenviar=${s.id}`} className="btn-primario w-full">
                Ajustar e reenviar
              </Link>
            </div>
          )}
          {s.status === 'recusado' && (
            <div className="cartao space-y-2 p-5">
              <p className="titulo text-xl">Não conseguimos pintar esta arte</p>
              <p className="text-sm">
                <b>Motivo:</b> {s.motivo_recusa}
              </p>
              <p className="text-sm text-cinza">Chame no WhatsApp: muitas vezes dá para adaptar a ideia.</p>
              <Link to={`/criar/${s.modelo_id}`} className="btn-secundario w-full">
                Criar outra arte
              </Link>
            </div>
          )}
          {s.status === 'convertido' && (
            <div className="cartao p-5">
              <p className="titulo text-xl">Esta arte já virou pedido</p>
              {s.pedido_id && (
                <Link to={`/pedido/${s.pedido_id}`} className="btn-secundario mt-3">
                  Ver pedido
                </Link>
              )}
            </div>
          )}
          {s.observacoes && (
            <div className="text-sm">
              <p className="rotulo">Suas observações</p>
              <p className="whitespace-pre-line">{s.observacoes}</p>
            </div>
          )}
          {s.referencias?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {s.referencias.map((r) => (
                <img key={r} src={r} alt="Referência" className="size-20 rounded-xl object-cover" />
              ))}
            </div>
          )}
          <ol className="space-y-1 border-t border-linho pt-3 text-xs text-cinza">
            {(s.historico || []).map((h, i) => (
              <li key={i}>
                {dataHora(h.em)} — {STATUS_ANALISE[h.status]?.nome}
              </li>
            ))}
          </ol>
          <AvisoArtesanal />
        </div>
      </div>
    </div>
  )
}
