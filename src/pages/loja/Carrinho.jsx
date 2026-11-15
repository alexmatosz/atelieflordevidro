import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Truck } from 'lucide-react'
import { useApp } from '../../lib/app'
import { diasUteis, mascaraCep, moeda } from '../../lib/format'
import { resumoCarrinho } from '../../lib/regras'
import { Contador, Vazio } from '../../components/ui'

export function Resumo({ r, children }) {
  return (
    <div className="cartao space-y-2 p-5 text-sm">
      <div className="flex justify-between">
        <span>Peças ({r.qtd})</span>
        <span>{moeda(r.subtotal)}</span>
      </div>
      {r.desconto > 0 && (
        <div className="flex justify-between font-semibold text-salvia">
          <span>Desconto por quantidade ({r.pct}%)</span>
          <span>−{moeda(r.desconto)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span>Frete{r.frete ? ` · ${r.frete.regiao}` : ''}</span>
        <span>{r.frete ? (r.frete.valor === 0 ? 'Grátis' : moeda(r.frete.valor)) : 'informe o CEP'}</span>
      </div>
      <div className="flex justify-between border-t border-linho pt-3">
        <span className="titulo text-lg">Total</span>
        <span className="titulo text-xl">{moeda(r.total)}</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-areia/60 p-2.5">
          <p className="text-[11px] uppercase tracking-wide text-cinza">Pintura</p>
          <p className="font-semibold">{diasUteis(r.prazoProducao)}</p>
        </div>
        <div className="rounded-xl bg-areia/60 p-2.5">
          <p className="text-[11px] uppercase tracking-wide text-cinza">Entrega</p>
          <p className="font-semibold">{r.frete ? diasUteis(r.frete.dias) : '—'}</p>
        </div>
      </div>
      <p className="text-center text-xs text-cinza">A entrega começa a contar depois que a pintura fica pronta.</p>
      {children}
    </div>
  )
}

export default function Carrinho() {
  const { carrinho, alterarItem, removerItem, config } = useApp()
  const [cep, setCep] = useState(() => {
    try {
      return localStorage.getItem('afv:cep') || ''
    } catch {
      return ''
    }
  })
  const r = resumoCarrinho(carrinho, config, cep)
  const mudarCep = (v) => {
    const c = mascaraCep(v)
    setCep(c)
    try {
      localStorage.setItem('afv:cep', c)
    } catch {
      return
    }
  }

  if (!carrinho.length)
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Vazio titulo="Seu carrinho está vazio" texto="Escolha um modelo e uma pintura para começar." acao={<Link to="/catalogo" className="btn-primario">Ver modelos</Link>} />
      </div>
    )

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl">Carrinho</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {carrinho.map((i) => (
            <div key={i.chave} className="cartao flex gap-4 p-3">
              {i.mockup ? <img src={i.mockup} alt="" className="aspect-[4/5] w-24 shrink-0 rounded-xl bg-areia object-cover sm:w-28" /> : <div className="aspect-[4/5] w-24 shrink-0 rounded-xl bg-areia" />}
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="titulo text-lg leading-tight">{i.descricao}</p>
                {i.tipo === 'analise' && <p className="text-xs font-semibold text-salvia">Arte própria aprovada pelo artesão</p>}
                {i.tipo === 'kit' && <p className="text-xs font-semibold text-salvia">Parte do {i.kit_nome}</p>}
                <p className="text-xs text-cinza">
                  {Object.entries(i.personalizacao || {})
                    .filter(([k, v]) => v && k !== 'cor')
                    .map(([, v]) => v)
                    .join(' · ')}
                </p>
                <p className="mt-1 text-sm">{moeda(i.preco)} cada</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  {i.tipo === 'analise' ? <span className="text-sm">{i.quantidade} un.</span> : <Contador valor={i.quantidade} aoMudar={(q) => alterarItem(i.chave, { quantidade: q })} />}
                  <button onClick={() => removerItem(i.chave)} className="rounded-full p-2 text-cinza hover:bg-rosa/30 hover:text-terracota" aria-label="Remover">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {r.proxima && (
            <p className="rounded-2xl bg-salvia-clara/60 px-4 py-3 text-sm">
              Faltam <b>{r.proxima.minimo - r.qtd} peças</b> para ganhar <b>{r.proxima.percentual}% de desconto</b> no carrinho todo.
            </p>
          )}
        </div>
        <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <label className="cartao flex items-center gap-3 p-4">
            <Truck className="size-5 text-terracota" />
            <span className="flex-1 text-sm font-semibold">Calcular frete</span>
            <input className="campo !w-32" inputMode="numeric" placeholder="00000-000" value={cep} onChange={(e) => mudarCep(e.target.value)} aria-label="CEP" />
          </label>
          <Resumo r={r}>
            <Link to="/checkout" className="btn-primario mt-3 w-full !py-3 text-base">
              Finalizar pedido
            </Link>
          </Resumo>
        </div>
      </div>
    </div>
  )
}
