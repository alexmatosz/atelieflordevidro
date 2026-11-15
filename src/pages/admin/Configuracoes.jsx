import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { db, MODO_DEMO, reiniciarDemo } from '../../lib/db'
import { useApp } from '../../lib/app'
import { FORMAS, mascaraFone, slug, somenteDigitos } from '../../lib/format'
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
        <Secao titulo="Loja e WhatsApp" sub="Este número recebe os pedidos e as dúvidas do site." aoSalvar={salvar('loja')}>
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
            <Campo rotulo="Chave Pix" dica="Para você copiar e mandar na conversa.">
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
            <button type="button" className="text-sm font-semibold text-rosa" onClick={() => setC({ ...c, descontos: { faixas: [...c.descontos.faixas, { minimo: 100, percentual: 25 }] } })}>
              <Plus className="inline size-4" /> Adicionar faixa
            </button>
          </div>
        </Secao>

        <Secao titulo="Categorias da loja" sub="Os grupos que aparecem no site. Crie uma nova quando começar a pintar outro tipo de peça." aoSalvar={salvar('categorias')}>
          <div className="space-y-2">
            {(c.categorias?.lista || []).map((cat, i) => (
              <div key={cat.id} className="grid grid-cols-[1fr_150px_auto] items-center gap-2">
                <input className="campo" value={cat.nome} onChange={(e) => setC({ ...c, categorias: { lista: c.categorias.lista.map((x, j) => (j === i ? { ...x, nome: e.target.value } : x)) } })} aria-label="Nome da categoria" />
                <select className="campo" value={cat.forma} onChange={(e) => setC({ ...c, categorias: { lista: c.categorias.lista.map((x, j) => (j === i ? { ...x, forma: e.target.value } : x)) } })} aria-label="Desenho da categoria">
                  {FORMAS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => setC({ ...c, categorias: { lista: c.categorias.lista.filter((_, j) => j !== i) } })} className="p-1 text-cinza" aria-label={`Remover ${cat.nome}`}>
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-rosa"
              onClick={() => {
                const nome = 'Nova categoria'
                setC({ ...c, categorias: { lista: [...(c.categorias?.lista || []), { id: `${slug(nome)}-${Date.now().toString(36)}`, nome, forma: 'caneca' }] } })
              }}
            >
              <Plus className="inline size-4" /> Adicionar categoria
            </button>
            <p className="text-xs text-cinza">Peças de uma categoria removida continuam cadastradas; troque a categoria delas em Peças.</p>
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
