import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ImageDown, Trash2 } from 'lucide-react'
import { useApp } from '../../lib/app'
import { mascaraCep, moeda } from '../../lib/format'
import { proximaFaixa } from '../../lib/regras'
import { nomeCor } from '../../lib/elementos'
import { codigoPedido, enviarImagens, imagensDoPedido, linkWhats, montarMensagem, resumoValores } from '../../lib/whatsapp'
import { AvisoArtesanal, Campo, Contador, Vazio } from '../../components/ui'
import { IconeWhats } from '../../components/Layout'

const lerDados = () => {
  try {
    return JSON.parse(localStorage.getItem('afv:dados')) || {}
  } catch {
    return {}
  }
}

export default function Carrinho() {
  const { carrinho, alterarItem, removerItem, limparCarrinho, config, notificar } = useApp()
  const [dados, setDados] = useState(() => ({ nome: '', cidade: '', cep: '', dataDesejada: '', observacoes: '', ...lerDados() }))
  const [enviado, setEnviado] = useState(null)
  const [preparando, setPreparando] = useState(false)
  const v = resumoValores(carrinho, config)
  const prox = proximaFaixa(v.qtd, config.descontos)

  const set = (campo, mascara) => (e) => {
    const novo = { ...dados, [campo]: mascara ? mascara(e.target.value) : e.target.value }
    setDados(novo)
    try {
      localStorage.setItem('afv:dados', JSON.stringify({ nome: novo.nome, cidade: novo.cidade, cep: novo.cep }))
    } catch {
      return
    }
  }

  const finalizar = (e) => {
    e.preventDefault()
    const codigo = codigoPedido()
    const texto = montarMensagem(carrinho, dados, config, codigo)
    window.open(linkWhats(config.loja?.whatsapp, texto), '_blank', 'noopener')
    setEnviado({ codigo, itens: carrinho })
  }

  const mandarImagens = async () => {
    setPreparando(true)
    try {
      const arquivos = await imagensDoPedido(enviado.itens, enviado.codigo)
      const r = await enviarImagens(arquivos, enviado.codigo)
      if (r === 'baixado') notificar('Imagens salvas. Anexe na conversa do WhatsApp.')
    } catch (err) {
      if (err?.name !== 'AbortError') notificar('Não foi possível preparar as imagens.', 'erro')
    } finally {
      setPreparando(false)
    }
  }

  if (enviado)
    return (
      <div className="mx-auto max-w-xl px-4 py-14 text-center">
        <p className="font-mao text-4xl text-rosa">quase lá ♡</p>
        <h1 className="mt-2 text-3xl">Seu pedido {enviado.codigo} foi para o WhatsApp</h1>
        <p className="mt-3 text-cinza">Confira a mensagem na conversa com o ateliê e toque em enviar. Depois mande as imagens das artes para a pintora ver exatamente o que você escolheu.</p>
        <div className="mx-auto mt-8 flex max-w-xs flex-col gap-3">
          <button className="btn-primario !py-3" onClick={mandarImagens} disabled={preparando}>
            <ImageDown className="size-5" /> {preparando ? 'Preparando…' : 'Enviar as imagens das artes'}
          </button>
          <a className="btn-whats !py-3" href={linkWhats(config.loja?.whatsapp, montarMensagem(enviado.itens, dados, config, enviado.codigo))} target="_blank" rel="noreferrer">
            <IconeWhats /> Abrir o WhatsApp de novo
          </a>
          <button
            className="btn-fantasma"
            onClick={() => {
              limparCarrinho()
              setEnviado(null)
            }}
          >
            Esvaziar a sacola e continuar
          </button>
        </div>
        <div className="mt-10 flex justify-center gap-3">
          {enviado.itens.slice(0, 4).map((i) => i.mockup && <img key={i.chave} src={i.mockup} alt="" className="arco aspect-[4/5] w-20 bg-petala object-contain" />)}
        </div>
      </div>
    )

  if (!carrinho.length)
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Vazio titulo="Sua sacola está vazia" texto="Escolha uma peça e a pintura, ou crie a sua arte." acao={<Link to="/catalogo" className="btn-primario">Ver as peças</Link>} />
      </div>
    )

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl">Sua sacola</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          {carrinho.map((i) => (
            <article key={i.chave} className="flex gap-4 border-b border-borda pb-4">
              {i.mockup ? <img src={i.mockup} alt="" className="arco aspect-[4/5] w-24 shrink-0 bg-petala object-contain sm:w-28" /> : <div className="arco aspect-[4/5] w-24 shrink-0 bg-petala" />}
              <div className="flex min-w-0 flex-1 flex-col">
                <h2 className="text-lg leading-snug">{i.descricao}</h2>
                {i.kit_nome && <p className="text-sm text-folha">Parte do {i.kit_nome}</p>}
                <div className="mt-1 space-y-0.5 text-sm text-cinza">
                  {i.personalizacao?.nome && <p>Nome: {i.personalizacao.nome}</p>}
                  {i.personalizacao?.frase && <p>Frase: {i.personalizacao.frase}</p>}
                  {i.personalizacao?.data && <p>Data: {i.personalizacao.data.split('-').reverse().join('/')}</p>}
                  {i.personalizacao?.cor && <p>Cor: {nomeCor(i.personalizacao.cor)}</p>}
                  {i.detalhes?.length > 0 && <p>Na arte: {i.detalhes.join(', ')}</p>}
                  {i.observacoes && <p>Observações: {i.observacoes}</p>}
                </div>
                <p className="mt-1 text-sm">{i.tipo === 'personalizada' ? `a partir de ${moeda(i.preco)} cada, valor final a combinar` : `${moeda(i.preco)} cada`}</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <Contador valor={i.quantidade} aoMudar={(q) => alterarItem(i.chave, { quantidade: q })} />
                  <button onClick={() => removerItem(i.chave)} className="rounded-full p-2 text-cinza hover:bg-blush/40 hover:text-rosa" aria-label="Tirar da sacola">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
          {prox && (
            <p className="rounded-2xl bg-folha-clara px-4 py-3 text-sm text-grafite">
              Com mais {prox.minimo - v.qtd} {prox.minimo - v.qtd === 1 ? 'peça' : 'peças'} na sacola, você ganha {prox.percentual}% de desconto em tudo.
            </p>
          )}
          <AvisoArtesanal />
        </div>

        <form onSubmit={finalizar} className="cartao h-fit space-y-4 p-5 lg:sticky lg:top-24">
          <div className="space-y-1.5 text-[15px]">
            {v.subtotal > 0 && (
              <p className="flex justify-between">
                <span>Peças</span>
                <span>{moeda(v.subtotal)}</span>
              </p>
            )}
            {v.desconto > 0 && (
              <p className="flex justify-between text-folha">
                <span>Desconto de {v.pct}%</span>
                <span>−{moeda(v.desconto)}</span>
              </p>
            )}
            <p className="flex justify-between text-cinza">
              <span>Frete</span>
              <span>a combinar</span>
            </p>
            <p className="flex items-baseline justify-between border-t border-borda pt-3">
              <span className="titulo text-xl">Total estimado</span>
              <span className="titulo text-2xl">{moeda(v.total)}</span>
            </p>
            {v.aCombinar && <p className="text-sm text-cinza">Mais a arte personalizada, que a pintora orça pelo WhatsApp.</p>}
          </div>
          <Campo rotulo="Seu nome">
            <input className="campo" required autoComplete="name" value={dados.nome} onChange={set('nome')} />
          </Campo>
          <div className="grid grid-cols-[1fr_130px] gap-3">
            <Campo rotulo="Cidade">
              <input className="campo" autoComplete="address-level2" value={dados.cidade} onChange={set('cidade')} placeholder="Sombrio, SC" />
            </Campo>
            <Campo rotulo="CEP">
              <input className="campo" inputMode="numeric" autoComplete="postal-code" value={dados.cep} onChange={set('cep', mascaraCep)} />
            </Campo>
          </div>
          <Campo rotulo="Preciso receber até (opcional)">
            <input className="campo" type="date" value={dados.dataDesejada} min={new Date().toISOString().slice(0, 10)} onChange={set('dataDesejada')} />
          </Campo>
          <Campo rotulo="Recado para a pintora (opcional)">
            <textarea className="campo min-h-20" value={dados.observacoes} onChange={set('observacoes')} maxLength={500} />
          </Campo>
          <button className="btn-whats w-full !py-3.5 text-base">
            <IconeWhats className="size-6" /> Finalizar pedido pelo WhatsApp
          </button>
          <p className="text-center text-xs text-cinza">A mensagem já vai pronta com tudo o que você escolheu. O pagamento e o frete são combinados na conversa.</p>
        </form>
      </div>
    </div>
  )
}
