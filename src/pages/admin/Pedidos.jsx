import { useState } from 'react'
import { ChevronLeft, ChevronRight, Camera, Plus } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados } from '../../lib/app'
import { ETAPAS, dataHora, diasUteis, mascaraFone, moeda } from '../../lib/format'
import { TituloPagina } from '../../components/Layout'
import { Campo, Carregando, EnviarImagens, Modal } from '../../components/ui'
import AvisarCliente from '../../components/AvisarCliente'

const ORIGENS = { loja: 'Loja', whatsapp: 'WhatsApp', analise: 'Arte própria', kit: 'Kit', corporativo: 'Empresa' }

export const rotuloPedido = (p) => p.codigo || `#${p.numero}`

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
  const textoFoto = `Olá, ${primeiro}! Sua peça do pedido ${rotuloPedido(pedido)} ficou pronta ♡ Vou te mandar a foto aqui para você conferir antes de embalarmos.`
  const textoEnvio = `Olá, ${primeiro}! Seu pedido ${rotuloPedido(pedido)} foi enviado.${pedido.codigo_rastreio ? ` Código de rastreio: ${pedido.codigo_rastreio}.` : ''} Obrigado por escolher o ${config.loja?.nome}!`

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
        <p className="rounded-xl bg-petala/60 p-3">
          {pedido.endereco.rua}, {pedido.endereco.numero} {pedido.endereco.complemento} — {pedido.endereco.bairro}, {pedido.endereco.cidade}/{pedido.endereco.uf} · CEP {pedido.cep}
        </p>
      )}
      {pedido.resumo && <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-petala/60 p-3 font-sans text-[13px]">{pedido.resumo}</pre>}
      <div className="divide-y divide-borda rounded-xl border border-borda bg-white empty:hidden">
        {(itens || []).map((i) => (
          <div key={i.id} className="flex gap-3 p-3">
            {i.mockup && <img src={i.mockup} alt="" className="aspect-[4/5] w-16 rounded-lg bg-petala object-cover" />}
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
        {Number(pedido.desconto) > 0 && <p className="text-folha">Desconto −{moeda(pedido.desconto)}</p>}
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

      <section className="space-y-3 rounded-2xl bg-petala/50 p-4">
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
            <AvisarCliente whatsapp={pedido.cliente_whatsapp} email={pedido.cliente_email} assunto={`Sua peça ficou pronta, pedido ${rotuloPedido(pedido)}`} texto={textoFoto} titulo="Mandar a foto para o cliente" />
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
        {pedido.etapa === 'enviado' && <AvisarCliente whatsapp={pedido.cliente_whatsapp} email={pedido.cliente_email} assunto={`Pedido ${rotuloPedido(pedido)} enviado`} texto={textoEnvio} titulo="Avisar que foi enviado" />}
      </section>
      <button className="btn-fantasma w-full" onClick={aoFechar}>
        Fechar
      </button>
    </div>
  )
}

function RegistrarPedido({ aoSalvar }) {
  const { notificar } = useApp()
  const [f, setF] = useState({ codigo: '', cliente_nome: '', cliente_whatsapp: '', resumo: '', total: '', prazo_producao_dias: 7, pago: false })
  const set = (c, m) => (e) => setF({ ...f, [c]: e.target.type === 'checkbox' ? e.target.checked : m ? m(e.target.value) : e.target.value })
  const salvar = async (e) => {
    e.preventDefault()
    const codigo = f.codigo.trim() || (f.resumo.match(/AFV-[A-Z0-9]{4}/) || [])[0] || ''
    await aoSalvar({
      codigo,
      cliente_nome: f.cliente_nome,
      cliente_whatsapp: f.cliente_whatsapp,
      resumo: f.resumo,
      subtotal: Number(f.total) || 0,
      desconto: 0,
      frete: 0,
      total: Number(f.total) || 0,
      pagamento: 'pix',
      pagamento_status: f.pago ? 'pago' : 'pendente',
      prazo_producao_dias: Number(f.prazo_producao_dias),
      prazo_entrega_dias: null,
      etapa: 'novo',
      origem: 'whatsapp',
      autoriza_galeria: false,
      foto_pronta: null,
    })
    notificar('Pedido registrado.')
  }
  return (
    <form onSubmit={salvar} className="space-y-3">
      <Campo rotulo="Mensagem do pedido" dica="Cole aqui a mensagem que chegou no WhatsApp. O código AFV é lido sozinho.">
        <textarea className="campo min-h-36 font-mono text-xs" required value={f.resumo} onChange={set('resumo')} />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Nome da cliente">
          <input className="campo" required value={f.cliente_nome} onChange={set('cliente_nome')} />
        </Campo>
        <Campo rotulo="WhatsApp">
          <input className="campo" inputMode="tel" value={f.cliente_whatsapp} onChange={set('cliente_whatsapp', mascaraFone)} />
        </Campo>
        <Campo rotulo="Valor fechado (R$)">
          <input className="campo" type="number" min="0" step="0.01" value={f.total} onChange={set('total')} />
        </Campo>
        <Campo rotulo="Prazo de pintura (dias)">
          <input className="campo" type="number" min="1" value={f.prazo_producao_dias} onChange={set('prazo_producao_dias')} />
        </Campo>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-rosa" checked={f.pago} onChange={set('pago')} /> Já está pago
      </label>
      <button className="btn-primario w-full">Registrar pedido</button>
    </form>
  )
}

export default function Pedidos() {
  const { notificar } = useApp()
  const [pedidos, recarregar] = useDados(() => db.listar('pedidos', { ordem: 'criado_em desc' }))
  const [aberto, setAberto] = useState(null)
  const [arrastando, setArrastando] = useState(null)
  const [novo, setNovo] = useState(false)

  const mudar = async (id, patch) => {
    await db.atualizar('pedidos', id, patch)
    recarregar()
  }
  const mover = async (p, dir) => {
    const i = ETAPAS.findIndex((e) => e.id === p.etapa) + dir
    if (i < 0 || i >= ETAPAS.length) return
    if (ETAPAS[i].id === 'enviado' && !p.foto_pronta && !window.confirm('Este pedido ainda não tem a foto da peça pronta. Enviar mesmo assim?')) return
    await mudar(p.id, { etapa: ETAPAS[i].id })
    notificar(`Pedido ${rotuloPedido(p)} → ${ETAPAS[i].nome}`)
  }

  if (!pedidos) return <Carregando />
  const pedidoAberto = pedidos.find((p) => p.id === aberto)

  return (
    <div>
      <TituloPagina
        titulo="Pedidos"
        sub="Registre aqui os pedidos fechados no WhatsApp e arraste os cartões conforme a pintura avança."
        acao={
          <button className="btn-primario" onClick={() => setNovo(true)}>
            <Plus className="size-4" /> Registrar pedido
          </button>
        }
      />
      <div className="rolagem-fina -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:px-0">
        {ETAPAS.map((etapa) => {
          const lista = pedidos.filter((p) => p.etapa === etapa.id)
          return (
            <div
              key={etapa.id}
              className="w-72 shrink-0 snap-start rounded-2xl bg-petala/60 p-2.5 lg:w-auto"
              onDragOver={(e) => e.preventDefault()}
              onDrop={async () => {
                const p = pedidos.find((x) => x.id === arrastando)
                if (p && p.etapa !== etapa.id) {
                  await mudar(p.id, { etapa: etapa.id })
                  notificar(`Pedido ${rotuloPedido(p)} → ${etapa.nome}`)
                }
                setArrastando(null)
              }}
            >
              <p className="mb-2 flex items-center justify-between px-1 text-sm font-bold text-ameixa">
                {etapa.nome} <span className="rounded-full bg-white px-2 text-xs">{lista.length}</span>
              </p>
              <div className="min-h-24 space-y-2">
                {lista.map((p) => (
                  <div key={p.id} draggable onDragStart={() => setArrastando(p.id)} className="cursor-grab rounded-xl bg-white p-3 text-sm shadow-sm ring-1 ring-borda/70 active:cursor-grabbing">
                    <button className="w-full text-left" onClick={() => setAberto(p.id)}>
                      <p className="flex items-center justify-between font-bold">
                        {rotuloPedido(p)} <span className="text-xs font-semibold text-cinza">{ORIGENS[p.origem]}</span>
                      </p>
                      <p className="truncate">{p.cliente_nome}</p>
                      <p className="text-xs text-cinza">
                        {moeda(p.total)} · {p.pagamento_status === 'pago' ? 'pago' : 'aguardando pagamento'}
                      </p>
                      {p.foto_pronta && <p className="mt-1 text-xs text-folha">{p.foto_aprovada_cliente ? 'Foto aprovada' : 'Foto enviada'}</p>}
                    </button>
                    <div className="mt-2 flex justify-between">
                      <button onClick={() => mover(p, -1)} disabled={etapa.id === 'novo'} className="rounded-lg p-1 text-cinza hover:bg-petala disabled:opacity-20" aria-label="Voltar etapa">
                        <ChevronLeft className="size-4" />
                      </button>
                      <button onClick={() => mover(p, 1)} disabled={etapa.id === 'enviado'} className="rounded-lg p-1 text-cinza hover:bg-petala disabled:opacity-20" aria-label="Avançar etapa">
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
      <Modal aberto={novo} aoFechar={() => setNovo(false)} titulo="Registrar pedido do WhatsApp">
        {novo && (
          <RegistrarPedido
            aoSalvar={async (dados) => {
              await db.inserir('pedidos', dados)
              setNovo(false)
              recarregar()
            }}
          />
        )}
      </Modal>
      <Modal aberto={!!pedidoAberto} aoFechar={() => setAberto(null)} titulo={pedidoAberto ? `Pedido ${rotuloPedido(pedidoAberto)}` : ''} largura="max-w-2xl">
        {pedidoAberto && <DetalhePedido pedido={pedidoAberto} aoMudar={mudar} aoFechar={() => setAberto(null)} />}
      </Modal>
    </div>
  )
}
