import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Check, Copy } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados, useWhats } from '../../lib/app'
import { ETAPAS, dataHora, diasUteis, moeda } from '../../lib/format'
import { linkWhatsApp } from '../../lib/regras'
import { Carregando, Vazio } from '../../components/ui'

export default function PedidoPagina() {
  const { id } = useParams()
  const [busca] = useSearchParams()
  const { config, notificar } = useApp()
  const [autoriza, setAutoriza] = useState(false)
  const [d, recarregar] = useDados(async () => {
    const pedido = await db.obter('pedidos', id)
    const itens = pedido ? await db.listar('itens_pedido', { filtro: { pedido_id: id } }) : []
    return { pedido, itens }
  }, [id])
  useWhats(d?.pedido ? `Olá! Tenho uma dúvida sobre o meu pedido #${d.pedido.numero}.` : '')

  if (!d) return <Carregando />
  const { pedido, itens } = d
  if (!pedido)
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Vazio titulo="Pedido não encontrado" texto="Entre na sua conta para ver seus pedidos." acao={<Link to="/minha-conta" className="btn-primario">Minha conta</Link>} />
      </div>
    )

  const etapaAtual = ETAPAS.findIndex((e) => e.id === pedido.etapa)
  const responder = async (aprovada) => {
    try {
      await db.responderFoto(pedido.id, aprovada, autoriza || pedido.autoriza_galeria)
      notificar(aprovada ? 'Obrigado! Vamos embalar com carinho.' : 'Certo, vamos conversar pelo WhatsApp.')
      recarregar()
    } catch (err) {
      notificar(err.message, 'erro')
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {busca.get('novo') && (
        <div className="mb-6 rounded-3xl bg-salvia-clara p-6 text-center">
          <p className="font-mao text-2xl text-salvia">obrigado!</p>
          <h1 className="text-3xl">Pedido #{pedido.numero} recebido</h1>
          <p className="mt-1 text-sm text-cinza">Guarde este link para acompanhar a pintura.</p>
        </div>
      )}
      {!busca.get('novo') && <h1 className="text-3xl">Pedido #{pedido.numero}</h1>}

      {pedido.pagamento_status !== 'pago' && (
        <section className="cartao mt-6 space-y-3 p-5">
          <h2 className="text-lg">Pagamento</h2>
          {pedido.pagamento === 'pix' ? (
            config.loja?.pix_chave ? (
              <>
                <p className="text-sm">
                  Faça um Pix de <b>{moeda(pedido.total)}</b> para a chave abaixo{config.loja.pix_nome && ` (${config.loja.pix_nome})`} e mande o comprovante pelo WhatsApp.
                </p>
                <div className="flex gap-2">
                  <input className="campo font-mono" readOnly value={config.loja.pix_chave} aria-label="Chave Pix" />
                  <button
                    className="btn-secundario"
                    onClick={() => {
                      navigator.clipboard?.writeText(config.loja.pix_chave)
                      notificar('Chave copiada.')
                    }}
                  >
                    <Copy className="size-4" /> Copiar
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm">Vamos mandar os dados do Pix de {moeda(pedido.total)} pelo WhatsApp.</p>
            )
          ) : (
            <p className="text-sm">Vamos mandar o link de pagamento no cartão de {moeda(pedido.total)} pelo WhatsApp.</p>
          )}
          <a className="btn !bg-[#1f9d55] text-white" target="_blank" rel="noreferrer" href={linkWhatsApp(config.loja?.whatsapp, `Olá! Acabei de fazer o pedido #${pedido.numero} (${moeda(pedido.total)}) e vou pagar no ${pedido.pagamento === 'pix' ? 'Pix' : 'cartão'}.`)}>
            Falar no WhatsApp
          </a>
        </section>
      )}

      <section className="cartao mt-6 p-5">
        <h2 className="mb-4 text-lg">Acompanhe a pintura</h2>
        <ol className="grid grid-cols-5 gap-1">
          {ETAPAS.map((e, i) => (
            <li key={e.id} className="text-center">
              <span className={`mx-auto flex size-8 items-center justify-center rounded-full text-sm font-bold ${i <= etapaAtual ? 'bg-terracota text-white' : 'bg-areia text-cinza'}`}>{i < etapaAtual ? <Check className="size-4" /> : i + 1}</span>
              <span className={`mt-1 block text-[11px] leading-tight ${i === etapaAtual ? 'font-bold text-terracota-escuro' : 'text-cinza'}`}>{e.nome}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm">
          <p className="rounded-xl bg-areia/60 p-2">Pintura: {diasUteis(pedido.prazo_producao_dias)}</p>
          <p className="rounded-xl bg-areia/60 p-2">Entrega: {diasUteis(pedido.prazo_entrega_dias)}</p>
        </div>
        {pedido.codigo_rastreio && <p className="mt-3 text-sm">Código de rastreio: <b>{pedido.codigo_rastreio}</b></p>}
      </section>

      {pedido.foto_pronta && (
        <section className="cartao mt-6 space-y-3 p-5">
          <h2 className="text-lg">Sua peça ficou pronta</h2>
          <img src={pedido.foto_pronta} alt="Foto da peça pronta" className="w-full rounded-2xl" />
          {pedido.foto_aprovada_cliente == null ? (
            <>
              <p className="text-sm text-cinza">Confira a foto antes de embalarmos.</p>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-0.5 size-4 accent-terracota" checked={autoriza || pedido.autoriza_galeria} onChange={(e) => setAutoriza(e.target.checked)} /> Pode mostrar esta foto na galeria “Feitos por clientes”.
              </label>
              <div className="flex flex-wrap gap-2">
                <button className="btn-primario" onClick={() => responder(true)}>
                  <Check className="size-4" /> Amei, pode enviar
                </button>
                <button className="btn-secundario" onClick={() => responder(false)}>
                  Quero conversar antes
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm font-semibold text-salvia">{pedido.foto_aprovada_cliente ? 'Você aprovou a foto. Obrigado!' : 'Vamos falar com você pelo WhatsApp antes do envio.'}</p>
          )}
        </section>
      )}

      <section className="cartao mt-6 divide-y divide-linho/70">
        {itens.map((i) => (
          <div key={i.id} className="flex gap-3 p-4">
            {i.mockup && <img src={i.mockup} alt="" className="aspect-[4/5] w-20 rounded-xl bg-areia object-cover" />}
            <div className="flex-1 text-sm">
              <p className="font-semibold">
                {i.quantidade}× {i.descricao}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-mel/20 px-2 py-0.5 text-xs font-semibold text-argila">
                Peça única nº {(i.numeros_serie || []).map((n) => String(n).padStart(5, '0')).join(', ')}
              </p>
              <p className="mt-1 text-xs text-cinza">O número é pintado à mão na base da peça.</p>
            </div>
            <p className="text-sm font-semibold">{moeda(i.preco_unitario * i.quantidade)}</p>
          </div>
        ))}
        <div className="space-y-1 p-4 text-right text-sm">
          {Number(pedido.desconto) > 0 && <p className="text-salvia">Desconto −{moeda(pedido.desconto)}</p>}
          <p>Frete {Number(pedido.frete) === 0 ? 'grátis' : moeda(pedido.frete)}</p>
          <p className="titulo text-xl">Total {moeda(pedido.total)}</p>
          <p className="text-xs text-cinza">Feito em {dataHora(pedido.criado_em)}</p>
        </div>
      </section>
    </div>
  )
}
