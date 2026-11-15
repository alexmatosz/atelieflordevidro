import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { db, MODO_DEMO, reiniciarDemo } from '../../lib/db'
import { useApp } from '../../lib/app'
import { mascaraFone, somenteDigitos } from '../../lib/format'
import { TituloPagina } from '../../components/Layout'
import { Campo } from '../../components/ui'

function Secao({ titulo, sub, children, aoSalvar }) {
  return (
    <form
      className="cartao space-y-4 p-5"
      onSubmit={(e) => {
        e.preventDefault()
        aoSalvar()
      }}
    >
      <div>
        <h2 className="text-lg">{titulo}</h2>
        {sub && <p className="text-sm text-cinza">{sub}</p>}
      </div>
      {children}
      <button className="btn-primario">Salvar</button>
    </form>
  )
}

export default function Configuracoes() {
  const { config, recarregarConfig, notificar } = useApp()
  const [c, setC] = useState(config)
  useEffect(() => setC(config), [config])

  const salvar = (chave) => async () => {
    try {
      await db.salvarConfig(chave, c[chave])
      await recarregarConfig()
      notificar('Configurações salvas.')
    } catch (err) {
      notificar(err.message, 'erro')
    }
  }
  const set = (chave, campo) => (e) => setC({ ...c, [chave]: { ...c[chave], [campo]: e.target.value } })
  const setFaixa = (chave, i, campo, valor) => setC({ ...c, [chave]: { ...c[chave], faixas: c[chave].faixas.map((f, j) => (j === i ? { ...f, [campo]: valor } : f)) } })
  const removerFaixa = (chave, i) => setC({ ...c, [chave]: { ...c[chave], faixas: c[chave].faixas.filter((_, j) => j !== i) } })

  return (
    <div>
      <TituloPagina titulo="Configurações" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Secao titulo="Loja e WhatsApp" sub="O número recebe as mensagens do botão flutuante." aoSalvar={salvar('loja')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Nome da loja">
              <input className="campo" value={c.loja.nome} onChange={set('loja', 'nome')} />
            </Campo>
            <Campo rotulo="WhatsApp (com DDD)" dica="Ex.: (11) 99999-9999">
              <input
                className="campo"
                inputMode="tel"
                value={mascaraFone(String(c.loja.whatsapp || '').replace(/^55/, ''))}
                onChange={(e) => setC({ ...c, loja: { ...c.loja, whatsapp: `55${somenteDigitos(e.target.value)}` } })}
              />
            </Campo>
            <Campo rotulo="E-mail">
              <input className="campo" type="email" value={c.loja.email} onChange={set('loja', 'email')} />
            </Campo>
            <Campo rotulo="Instagram">
              <input className="campo" value={c.loja.instagram} onChange={set('loja', 'instagram')} placeholder="@seuatelie" />
            </Campo>
            <Campo rotulo="Cidade">
              <input className="campo" value={c.loja.cidade} onChange={set('loja', 'cidade')} />
            </Campo>
            <Campo rotulo="Chave Pix" dica="Aparece para o cliente ao escolher Pix.">
              <input className="campo" value={c.loja.pix_chave || ''} onChange={set('loja', 'pix_chave')} />
            </Campo>
            <Campo rotulo="Nome do recebedor do Pix">
              <input className="campo" value={c.loja.pix_nome || ''} onChange={set('loja', 'pix_nome')} />
            </Campo>
          </div>
        </Secao>

        <Secao titulo="Descontos por quantidade" sub="Somam todas as peças do carrinho. Ótimo para lembrancinhas." aoSalvar={salvar('descontos')}>
          <div className="space-y-2">
            {c.descontos.faixas.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                A partir de
                <input className="campo !w-20" type="number" min="1" value={f.minimo} onChange={(e) => setFaixa('descontos', i, 'minimo', Number(e.target.value))} aria-label="Quantidade mínima" />
                peças,
                <input className="campo !w-20" type="number" min="0" max="80" value={f.percentual} onChange={(e) => setFaixa('descontos', i, 'percentual', Number(e.target.value))} aria-label="Percentual" />% off
                <button type="button" onClick={() => removerFaixa('descontos', i)} className="p-1 text-cinza" aria-label="Remover faixa">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <button type="button" className="text-sm font-semibold text-terracota" onClick={() => setC({ ...c, descontos: { faixas: [...c.descontos.faixas, { minimo: 100, percentual: 25 }] } })}>
              <Plus className="inline size-4" /> Adicionar faixa
            </button>
          </div>
        </Secao>

        <Secao titulo="Frete" sub="Por região, pelo primeiro dígito do CEP. Enquanto não houver integração com transportadora." aoSalvar={salvar('frete')}>
          <Campo rotulo="Frete grátis acima de (R$)">
            <input className="campo !w-40" type="number" min="0" value={c.frete.gratis_acima ?? ''} onChange={(e) => setC({ ...c, frete: { ...c.frete, gratis_acima: e.target.value === '' ? null : Number(e.target.value) } })} />
          </Campo>
          <div className="space-y-2">
            {c.frete.faixas.map((f, i) => (
              <div key={i} className="grid grid-cols-[1fr_90px_80px_70px_auto] items-end gap-2 text-sm">
                <Campo rotulo={i === 0 ? 'Região' : undefined}>
                  <input className="campo" value={f.regiao} onChange={(e) => setFaixa('frete', i, 'regiao', e.target.value)} />
                </Campo>
                <Campo rotulo={i === 0 ? 'CEPs' : undefined}>
                  <input className="campo" value={(f.prefixos || []).join(',')} onChange={(e) => setFaixa('frete', i, 'prefixos', e.target.value.split(',').map((x) => x.trim()))} title="Começo do CEP, separado por vírgula" />
                </Campo>
                <Campo rotulo={i === 0 ? 'R$' : undefined}>
                  <input className="campo" type="number" min="0" value={f.valor} onChange={(e) => setFaixa('frete', i, 'valor', Number(e.target.value))} />
                </Campo>
                <Campo rotulo={i === 0 ? 'Dias' : undefined}>
                  <input className="campo" type="number" min="1" value={f.dias} onChange={(e) => setFaixa('frete', i, 'dias', Number(e.target.value))} />
                </Campo>
                <button type="button" onClick={() => removerFaixa('frete', i)} className="pb-3 text-cinza" aria-label="Remover região">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <button type="button" className="text-sm font-semibold text-terracota" onClick={() => setC({ ...c, frete: { ...c.frete, faixas: [...c.frete.faixas, { regiao: 'Nova região', prefixos: [], valor: 30, dias: 7 }] } })}>
              <Plus className="inline size-4" /> Adicionar região
            </button>
            <p className="text-xs text-cinza">CEP que não se encaixar em nenhuma região paga R$ 55 com 12 dias úteis.</p>
          </div>
        </Secao>

        <Secao titulo="Textos da loja" aoSalvar={salvar('textos')}>
          {[
            ['sobre', 'Sobre o ateliê'],
            ['aviso_artesanal', 'Aviso de pintura à mão'],
            ['cuidados', 'Cuidados com a peça'],
            ['trocas', 'Trocas e devoluções'],
          ].map(([k, n]) => (
            <Campo key={k} rotulo={n}>
              <textarea className="campo min-h-20" value={c.textos[k] || ''} onChange={set('textos', k)} />
            </Campo>
          ))}
        </Secao>

        <Secao titulo="Pedidos de empresas" aoSalvar={salvar('corporativo')}>
          <Campo rotulo="Quantidade mínima">
            <input className="campo !w-32" type="number" min="1" value={c.corporativo.quantidade_minima} onChange={(e) => setC({ ...c, corporativo: { quantidade_minima: Number(e.target.value) } })} />
          </Campo>
        </Secao>

        {MODO_DEMO && (
          <div className="cartao space-y-3 p-5">
            <h2 className="text-lg">Demonstração</h2>
            <p className="text-sm text-cinza">Apaga tudo o que foi criado neste navegador e volta ao catálogo de exemplo.</p>
            <button
              className="btn-secundario"
              onClick={() => {
                if (!window.confirm('Apagar os dados de demonstração deste navegador?')) return
                reiniciarDemo()
                window.location.reload()
              }}
            >
              Recomeçar demonstração
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
