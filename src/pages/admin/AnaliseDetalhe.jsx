import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Pencil, X } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados } from '../../lib/app'
import { STATUS_ANALISE, data, dataHora, diasUteis, moeda } from '../../lib/format'
import { urlSite } from '../../lib/regras'
import { Campo, Carregando, EnviarImagens } from '../../components/ui'
import AvisarCliente from '../../components/AvisarCliente'

function mensagem(s, cfg) {
  const link = urlSite(`/solicitacao/${s.id}`)
  const ola = `Olá, ${s.cliente_nome.split(' ')[0]}! Aqui é do ${cfg.loja?.nome}.`
  if (s.status === 'aprovado')
    return `${ola}\nSua arte #${s.codigo} foi aprovada!\nValor: ${moeda(s.preco_unitario)} por peça\nPrazo de pintura: ${diasUteis(s.prazo_dias)}\n${s.comentario_artesao ? `\n${s.comentario_artesao}\n` : ''}\nPara transformar em pedido é só um clique: ${link}`
  if (s.status === 'ajuste_sugerido') return `${ola}\nOlhei sua arte #${s.codigo} e sugiro um ajuste:\n${s.comentario_artesao}\n\nVeja e reenvie por aqui: ${link}`
  if (s.status === 'recusado') return `${ola}\nInfelizmente não consigo pintar a arte #${s.codigo} do jeito que foi pedida.\nMotivo: ${s.motivo_recusa}\n\nSe quiser, podemos pensar juntos em outra ideia. Detalhes: ${link}`
  return ''
}

export default function AnaliseDetalhe() {
  const { id } = useParams()
  const { notificar, config } = useApp()
  const [acao, setAcao] = useState(null)
  const [form, setForm] = useState({})
  const [dados, recarregar] = useDados(async () => {
    const s = await db.obter('solicitacoes_analise', id)
    const modelo = s?.modelo_id ? await db.obter('modelos', s.modelo_id) : null
    return { s, modelo }
  }, [id])

  if (!dados) return <Carregando />
  const { s, modelo } = dados
  if (!s) return <p>Solicitação não encontrada.</p>

  const abrir = (tipo) => {
    setAcao(tipo)
    setForm({
      preco_unitario: s.preco_unitario || (modelo ? Number(modelo.preco_base) + 15 : ''),
      prazo_dias: s.prazo_dias || modelo?.prazo_producao_dias || 7,
      comentario_artesao: s.comentario_artesao || '',
      motivo_recusa: '',
      imagem_ajuste: s.imagem_ajuste || null,
    })
  }

  const confirmar = async (e) => {
    e.preventDefault()
    const patch = { status: acao, atualizado_em: new Date().toISOString() }
    let texto = ''
    if (acao === 'aprovado') {
      Object.assign(patch, { preco_unitario: Number(form.preco_unitario), prazo_dias: Number(form.prazo_dias), comentario_artesao: form.comentario_artesao })
      texto = `Aprovado: ${moeda(form.preco_unitario)} por peça, ${diasUteis(form.prazo_dias)}`
    } else if (acao === 'ajuste_sugerido') {
      Object.assign(patch, { comentario_artesao: form.comentario_artesao, imagem_ajuste: form.imagem_ajuste })
      texto = form.comentario_artesao
    } else {
      Object.assign(patch, { motivo_recusa: form.motivo_recusa })
      texto = form.motivo_recusa
    }
    patch.historico = [...(s.historico || []), { status: acao, em: patch.atualizado_em, texto }]
    try {
      await db.atualizar('solicitacoes_analise', s.id, patch)
      notificar('Resposta salva. Agora avise o cliente.')
      setAcao(null)
      recarregar()
    } catch (err) {
      notificar(err.message, 'erro')
    }
  }

  const st = STATUS_ANALISE[s.status]
  const msg = mensagem(s, config)

  return (
    <div className="space-y-6">
      <Link to="/admin/analise" className="inline-flex items-center gap-1 text-sm font-semibold text-terracota">
        <ArrowLeft className="size-4" /> Fila de análise
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl sm:text-3xl">Solicitação #{s.codigo}</h1>
        <span className={`selo ${st.cor}`}>{st.nome}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="cartao p-4">
            <div className="grid grid-cols-2 gap-3">
              {[s.mockup_frente, s.mockup_verso].map((src, i) => (
                <figure key={i}>
                  {src ? <a href={src} target="_blank" rel="noreferrer"><img src={src} alt={i ? 'Verso' : 'Frente'} className="w-full rounded-2xl bg-areia" /></a> : <div className="aspect-[4/5] rounded-2xl bg-areia" />}
                  <figcaption className="mt-1 text-center text-xs text-cinza">{i ? 'Verso' : 'Frente'}</figcaption>
                </figure>
              ))}
            </div>
          </section>
          {s.referencias?.length > 0 && (
            <section className="cartao p-4">
              <h2 className="mb-3 text-lg">Referências do cliente</h2>
              <div className="flex flex-wrap gap-2">
                {s.referencias.map((r) => (
                  <a key={r} href={r} target="_blank" rel="noreferrer">
                    <img src={r} alt="Referência" className="size-28 rounded-xl object-cover ring-1 ring-linho" />
                  </a>
                ))}
              </div>
            </section>
          )}
          <section className="cartao p-4">
            <h2 className="mb-2 text-lg">Observações do cliente</h2>
            <p className="whitespace-pre-line text-sm">{s.observacoes || 'Sem observações.'}</p>
          </section>
          {s.historico?.length > 0 && (
            <section className="cartao p-4">
              <h2 className="mb-2 text-lg">Histórico</h2>
              <ol className="space-y-2 text-sm">
                {s.historico.map((h, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-xs text-cinza">{dataHora(h.em)}</span>
                    <span>
                      <b>{STATUS_ANALISE[h.status]?.nome}</b> {h.texto && `— ${h.texto}`}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <section className="cartao space-y-1.5 p-4 text-sm">
            <p className="titulo text-lg">{s.cliente_nome}</p>
            {s.cliente_whatsapp && <p>WhatsApp: {s.cliente_whatsapp}</p>}
            {s.cliente_email && <p>E-mail: {s.cliente_email}</p>}
            <hr className="my-2 border-linho" />
            <p>Modelo: <b>{modelo?.nome || '—'}</b></p>
            <p>Quantidade: <b>{s.quantidade}</b></p>
            {s.data_desejada && <p>Quer receber até: <b>{data(s.data_desejada)}</b></p>}
            {s.preco_unitario && <p>Preço aprovado: <b>{moeda(s.preco_unitario)}</b> · {diasUteis(s.prazo_dias)}</p>}
            {s.pedido_id && <p className="text-salvia">Virou pedido.</p>}
          </section>

          {['em_analise', 'ajuste_sugerido', 'aprovado'].includes(s.status) && !acao && (
            <div className="grid gap-2">
              <button className="btn-primario" onClick={() => abrir('aprovado')}>
                <Check className="size-4" /> Aprovar com preço e prazo
              </button>
              <button className="btn-secundario" onClick={() => abrir('ajuste_sugerido')}>
                <Pencil className="size-4" /> Sugerir ajuste
              </button>
              <button className="btn-fantasma text-terracota" onClick={() => abrir('recusado')}>
                <X className="size-4" /> Recusar
              </button>
            </div>
          )}

          {acao && (
            <form onSubmit={confirmar} className="cartao space-y-3 p-4">
              <p className="font-semibold">{acao === 'aprovado' ? 'Aprovar' : acao === 'ajuste_sugerido' ? 'Sugerir ajuste' : 'Recusar'}</p>
              {acao === 'aprovado' && (
                <div className="grid grid-cols-2 gap-3">
                  <Campo rotulo="Preço por peça">
                    <input className="campo" type="number" step="0.01" min="0" required value={form.preco_unitario} onChange={(e) => setForm({ ...form, preco_unitario: e.target.value })} />
                  </Campo>
                  <Campo rotulo="Prazo (dias úteis)">
                    <input className="campo" type="number" min="1" required value={form.prazo_dias} onChange={(e) => setForm({ ...form, prazo_dias: e.target.value })} />
                  </Campo>
                </div>
              )}
              {acao !== 'recusado' ? (
                <Campo rotulo={acao === 'aprovado' ? 'Recado (opcional)' : 'O que ajustar'}>
                  <textarea className="campo min-h-24" required={acao === 'ajuste_sugerido'} value={form.comentario_artesao} onChange={(e) => setForm({ ...form, comentario_artesao: e.target.value })} />
                </Campo>
              ) : (
                <Campo rotulo="Motivo">
                  <textarea className="campo min-h-24" required value={form.motivo_recusa} onChange={(e) => setForm({ ...form, motivo_recusa: e.target.value })} placeholder="Ex.: o logo tem detalhes muito finos para pintar à mão nesse tamanho." />
                </Campo>
              )}
              {acao === 'ajuste_sugerido' && (
                <div>
                  <span className="rotulo">Imagem de exemplo (opcional)</span>
                  <EnviarImagens valor={form.imagem_ajuste ? [form.imagem_ajuste] : []} aoMudar={(v) => setForm({ ...form, imagem_ajuste: v[0] || null })} pasta="ajustes" maximo={1} />
                </div>
              )}
              <div className="flex gap-2">
                <button className="btn-primario flex-1">Confirmar</button>
                <button type="button" className="btn-fantasma" onClick={() => setAcao(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {msg && <AvisarCliente whatsapp={s.cliente_whatsapp} email={s.cliente_email} assunto={`Sua arte #${s.codigo} — ${st.nome}`} texto={msg} />}
        </aside>
      </div>
    </div>
  )
}
