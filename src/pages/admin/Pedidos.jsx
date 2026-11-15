import { useState } from 'react'
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados } from '../../lib/app'
import { ETAPAS, dataHora, diasUteis, moeda } from '../../lib/format'
import { urlSite } from '../../lib/regras'
import { TituloPagina } from '../../components/Layout'
import { Campo, Carregando, EnviarImagens, Modal } from '../../components/ui'
import AvisarCliente from '../../components/AvisarCliente'

const ORIGENS = { loja: 'Loja', analise: 'Arte própria', kit: 'Kit', corporativo: 'Empresa' }

function DetalhePedido({ pedido, aoMudar, aoFechar }) {
  const { notificar, config } = useApp()
  const [itens] = useDados(() => db.listar('itens_pedido', { filtro: { pedido_id: pedido.id } }), [pedido.id])
  const [rastreio, setRastreio] = useState(pedido.codigo_rastreio || '')
  const salvar = async (patch, aviso) => {
    try {
      await aoMudar(pedido.id, patch)
      if (aviso) notificar(aviso)
    } catch (err) {
      notificar(err.message, 'erro')
    }
  }
  const primeiro = pedido.cliente_nome.split(' ')[0]
  const linkPedido = urlSite(`/pedido/${pedido.id}`)
  const textoFoto = `Olá, ${primeiro}! Sua peça do pedido #${pedido.numero} ficou pronta. Veja a foto e confirme se está tudo certo antes de enviarmos: ${linkPedido}`
  const textoEnvio = `Olá, ${primeiro}! Seu pedido #${pedido.numero} foi enviado.${pedido.codigo_rastreio ? ` Código de rastreio: ${pedido.codigo_rastreio}.` : ''} Obrigado por escolher o ${config.loja?.nome}!`

  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <p>Cliente: <b>{pedido.cliente_nome}</b></p>
        <p>Feito em: {dataHora(pedido.criado_em)}</p>
        {pedido.cliente_whatsapp && <p>WhatsApp: {pedido.cliente_whatsapp}</p>}
        {pedido.cliente_email && <p>E-mail: {pedido.cliente_email}</p>}
        <p>Produção: {diasUteis(pedido.prazo_producao_dias)}</p>
        <p>Entrega: {diasUteis(pedido.prazo_entrega_dias)}</p>
      </div>
      {pedido.endereco && (
        <p className="rounded-xl bg-areia/60 p-3">
          {pedido.endereco.rua}, {pedido.endereco.numero} {pedido.endereco.complemento} — {pedido.endereco.bairro}, {pedido.endereco.cidade}/{pedido.endereco.uf} · CEP {pedido.cep}
        </p>
      )}
      <div className="divide-y divide-linho rounded-xl border border-linho bg-white">
        {(itens || []).map((i) => (
          <div key={i.id} className="flex gap-3 p-3">
            {i.mockup && <img src={i.mockup} alt="" className="aspect-[4/5] w-16 rounded-lg bg-areia object-cover" />}
            <div className="flex-1">
              <p className="font-semibold">{i.quantidade}× {i.descricao}</p>
              {Object.entries(i.personalizacao || {})
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <p key={k} className="text-xs text-cinza">
                    {k}: {k === 'cor' ? <span className="inline-block size-3 rounded-full align-middle" style={{ background: v }} /> : v}
                  </p>
                ))}
              <p className="mt-1 text-xs">
                Peça única nº {(i.numeros_serie || []).map((n) => String(n).padStart(5, '0')).join(', ')} <span className="text-cinza">— pintar na base</span>
              </p>
            </div>
            <p className="font-semibold">{moeda(i.preco_unitario * i.quantidade)}</p>
          </div>
        ))}
      </div>
      <div className="space-y-1 text-right">
        <p>Subtotal {moeda(pedido.subtotal)}</p>
        {Number(pedido.desconto) > 0 && <p className="text-salvia">Desconto −{moeda(pedido.desconto)}</p>}
        <p>Frete {moeda(pedido.frete)}</p>
        <p className="titulo text-xl">Total {moeda(pedido.total)}</p>
        <p className="text-xs text-cinza">
          {pedido.pagamento === 'pix' ? 'Pix' : 'Cartão'} · {pedido.pagamento_status === 'pago' ? 'pago' : 'aguardando pagamento'}
        </p>
      </div>
      {pedido.pagamento_status !== 'pago' && (
        <button className="btn-secundario w-full" onClick={() => salvar({ pagamento_status: 'pago' }, 'Pagamento confirmado.')}>
          Confirmar pagamento recebido
        </button>
      )}

      <section className="space-y-3 rounded-2xl bg-areia/50 p-4">
        <p className="flex items-center gap-2 font-semibold">
          <Camera className="size-4" /> Foto da peça pronta
        </p>
        <p className="text-xs text-cinza">Antes de embalar, mande a foto para o cliente aprovar. É o que mais dá confiança.</p>
        <EnviarImagens valor={pedido.foto_pronta ? [pedido.foto_pronta] : []} aoMudar={(v) => salvar({ foto_pronta: v[0] || null, foto_aprovada_cliente: null }, v[0] ? 'Foto salva.' : undefined)} pasta="prontas" maximo={1} rotulo="Foto pronta" />
        {pedido.foto_pronta && (
          <>
            <p className="text-xs">
              {pedido.foto_aprovada_cliente === true ? '✓ Cliente aprovou a foto.' : pedido.foto_aprovada_cliente === false ? 'Cliente pediu para conversar antes do envio.' : 'Aguardando o cliente ver a foto.'}
              {pedido.autoriza_galeria && ' Autorizou mostrar na galeria.'}
            </p>
            <AvisarCliente whatsapp={pedido.cliente_whatsapp} email={pedido.cliente_email} assunto={`Sua peça ficou pronta — pedido #${pedido.numero}`} texto={textoFoto} titulo="Mandar a foto para o cliente" />
          </>
        )}
      </section>

      <section className="space-y-2">
        <Campo rotulo="Código de rastreio">
          <div className="flex gap-2">
            <input className="campo" value={rastreio} onChange={(e) => setRastreio(e.target.value.toUpperCase())} />
            <button className="btn-secundario" onClick={() => salvar({ codigo_rastreio: rastreio }, 'Rastreio salvo.')}>
              Salvar
            </button>
          </div>
        </Campo>
        {pedido.etapa === 'enviado' && <AvisarCliente whatsapp={pedido.cliente_whatsapp} email={pedido.cliente_email} assunto={`Pedido #${pedido.numero} enviado`} texto={textoEnvio} titulo="Avisar que foi enviado" />}
      </section>
      <button className="btn-fantasma w-full" onClick={aoFechar}>
        Fechar
      </button>
    </div>
  )
}

export default function Pedidos() {
  const { notificar } = useApp()
  const [pedidos, recarregar] = useDados(() => db.listar('pedidos', { ordem: 'criado_em desc' }))
  const [aberto, setAberto] = useState(null)
  const [arrastando, setArrastando] = useState(null)

  const mudar = async (id, patch) => {
    await db.atualizar('pedidos', id, patch)
    recarregar()
  }
  const mover = async (p, dir) => {
    const i = ETAPAS.findIndex((e) => e.id === p.etapa) + dir
    if (i < 0 || i >= ETAPAS.length) return
    if (ETAPAS[i].id === 'enviado' && !p.foto_pronta && !window.confirm('Este pedido ainda não tem a foto da peça pronta. Enviar mesmo assim?')) return
    await mudar(p.id, { etapa: ETAPAS[i].id })
    notificar(`Pedido #${p.numero} → ${ETAPAS[i].nome}`)
  }

  if (!pedidos) return <Carregando />
  const pedidoAberto = pedidos.find((p) => p.id === aberto)

  return (
    <div>
      <TituloPagina titulo="Pedidos" sub="Arraste os cartões (ou use as setas) conforme a peça avança na produção." />
      <div className="rolagem-fina -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:px-0">
        {ETAPAS.map((etapa) => {
          const lista = pedidos.filter((p) => p.etapa === etapa.id)
          return (
            <div
              key={etapa.id}
              className="w-72 shrink-0 snap-start rounded-2xl bg-areia/60 p-2.5 lg:w-auto"
              onDragOver={(e) => e.preventDefault()}
              onDrop={async () => {
                const p = pedidos.find((x) => x.id === arrastando)
                if (p && p.etapa !== etapa.id) {
                  await mudar(p.id, { etapa: etapa.id })
                  notificar(`Pedido #${p.numero} → ${etapa.nome}`)
                }
                setArrastando(null)
              }}
            >
              <p className="mb-2 flex items-center justify-between px-1 text-sm font-bold text-argila">
                {etapa.nome} <span className="rounded-full bg-white px-2 text-xs">{lista.length}</span>
              </p>
              <div className="min-h-24 space-y-2">
                {lista.map((p) => (
                  <div key={p.id} draggable onDragStart={() => setArrastando(p.id)} className="cursor-grab rounded-xl bg-white p-3 text-sm shadow-sm ring-1 ring-linho/70 active:cursor-grabbing">
                    <button className="w-full text-left" onClick={() => setAberto(p.id)}>
                      <p className="flex items-center justify-between font-bold">
                        #{p.numero} <span className="text-xs font-semibold text-cinza">{ORIGENS[p.origem]}</span>
                      </p>
                      <p className="truncate">{p.cliente_nome}</p>
                      <p className="text-xs text-cinza">
                        {moeda(p.total)} · {p.pagamento_status === 'pago' ? 'pago' : 'aguardando pagamento'}
                      </p>
                      {p.foto_pronta && <p className="mt-1 text-xs text-salvia">{p.foto_aprovada_cliente ? 'Foto aprovada' : 'Foto enviada'}</p>}
                    </button>
                    <div className="mt-2 flex justify-between">
                      <button onClick={() => mover(p, -1)} disabled={etapa.id === 'novo'} className="rounded-lg p-1 text-cinza hover:bg-areia disabled:opacity-20" aria-label="Voltar etapa">
                        <ChevronLeft className="size-4" />
                      </button>
                      <button onClick={() => mover(p, 1)} disabled={etapa.id === 'enviado'} className="rounded-lg p-1 text-cinza hover:bg-areia disabled:opacity-20" aria-label="Avançar etapa">
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <Modal aberto={!!pedidoAberto} aoFechar={() => setAberto(null)} titulo={pedidoAberto ? `Pedido #${pedidoAberto.numero}` : ''} largura="max-w-2xl">
        {pedidoAberto && <DetalhePedido pedido={pedidoAberto} aoMudar={mudar} aoFechar={() => setAberto(null)} />}
      </Modal>
    </div>
  )
}
