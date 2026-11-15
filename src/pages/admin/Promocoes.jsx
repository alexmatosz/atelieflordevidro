import { useState } from 'react'
import { Plus, Trash2, Zap } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados } from '../../lib/app'
import { TIPOS_PROMO, nomeTipo, promoAtiva } from '../../lib/promocoes'
import { TituloPagina } from '../../components/Layout'
import { Campo, Carregando, Modal } from '../../components/ui'
import { FaixaPromo } from '../loja/Ofertas'

const local = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
const iso = (v) => (v ? new Date(v).toISOString() : null)
const daqui = (horas) => new Date(Date.now() + horas * 3600000).toISOString()

const MODELOS_TIPO = {
  black: { titulo: 'Black Flor de Vidro', percentual: 20, horas: 24 * 4, descricao: 'Descontos especiais de Black Friday em peças pintadas à mão.' },
  relampago: { titulo: 'Oferta relâmpago', percentual: 15, horas: 24, descricao: 'Só até o relógio zerar.' },
  semana: { titulo: 'Desconto da semana', percentual: 10, horas: 24 * 7, descricao: 'Vale até domingo.' },
  outra: { titulo: 'Promoção', percentual: 10, horas: 24 * 7, descricao: '' },
}

function nova(tipo = 'semana') {
  const m = MODELOS_TIPO[tipo]
  return { tipo, titulo: m.titulo, descricao: m.descricao, percentual: m.percentual, alvo: 'tudo', categorias: [], modelos: [], inicio: new Date().toISOString(), fim: daqui(m.horas), ativo: true, banner: true }
}

function situacao(p) {
  const agora = Date.now()
  if (!p.ativo) return ['Pausada', 'bg-borda text-cinza']
  if (p.inicio && new Date(p.inicio).getTime() > agora) return ['Agendada', 'bg-folha-clara text-folha']
  if (p.fim && new Date(p.fim).getTime() <= agora) return ['Encerrada', 'bg-borda text-cinza']
  return ['No ar', 'bg-rosa text-white']
}

export default function Promocoes() {
  const { notificar, categorias, recarregarPromocoes } = useApp()
  const [d, recarregar] = useDados(async () => ({ promos: await db.listar('promocoes'), modelos: await db.listar('modelos', { ordem: 'nome' }) }))
  const [edit, setEdit] = useState(null)
  if (!d) return <Carregando />

  const atualizarTudo = () => {
    recarregar()
    recarregarPromocoes()
  }

  const salvar = async (e) => {
    e.preventDefault()
    if (edit.fim && edit.inicio && new Date(edit.fim) <= new Date(edit.inicio)) return notificar('O fim precisa ser depois do início.', 'erro')
    if (edit.tipo === 'relampago' && !edit.fim) return notificar('Oferta relâmpago precisa de data e hora para acabar.', 'erro')
    const dados = {
      tipo: edit.tipo,
      titulo: edit.titulo.trim(),
      descricao: edit.descricao?.trim() || '',
      percentual: Math.min(90, Math.max(1, Number(edit.percentual) || 0)),
      alvo: edit.alvo,
      categorias: edit.alvo === 'categorias' ? edit.categorias : [],
      modelos: edit.alvo === 'modelos' ? edit.modelos : [],
      inicio: edit.inicio || null,
      fim: edit.fim || null,
      ativo: edit.ativo,
      banner: edit.banner,
    }
    try {
      if (edit.id) await db.atualizar('promocoes', edit.id, dados)
      else await db.inserir('promocoes', dados)
      setEdit(null)
      notificar('Promoção salva.')
      atualizarTudo()
    } catch (err) {
      notificar(err.message, 'erro')
    }
  }

  const remover = async () => {
    if (!window.confirm(`Apagar a promoção "${edit.titulo}"?`)) return
    await db.remover('promocoes', edit.id)
    setEdit(null)
    notificar('Promoção apagada.')
    atualizarTudo()
  }

  const alternar = (campo, id) => setEdit({ ...edit, [campo]: edit[campo].includes(id) ? edit[campo].filter((x) => x !== id) : [...edit[campo], id] })
  const ordenadas = [...d.promos].sort((a, b) => Number(promoAtiva(b)) - Number(promoAtiva(a)) || new Date(b.inicio || 0) - new Date(a.inicio || 0))

  return (
    <div>
      <TituloPagina
        titulo="Promoções"
        sub="Black Friday, oferta relâmpago e desconto da semana. O desconto aparece sozinho nas peças, na sacola e na mensagem do WhatsApp."
        acao={
          <div className="flex flex-wrap gap-2">
            {TIPOS_PROMO.filter((t) => t.id !== 'outra').map((t) => (
              <button key={t.id} className={t.id === 'semana' ? 'btn-primario' : 'btn-secundario'} onClick={() => setEdit(nova(t.id))}>
                <Plus className="size-4" /> {t.nome}
              </button>
            ))}
          </div>
        }
      />
      <p className="mb-5 max-w-3xl border-l-2 border-ouro py-1 pl-4 text-sm text-ameixa">
        O preço riscado é sempre o preço normal da peça. Não aumente o preço antes de uma promoção para depois “dar desconto”: isso é propaganda enganosa (Código de Defesa do Consumidor, art. 37). A contagem regressiva acaba de verdade na hora marcada.
      </p>
      {ordenadas.length === 0 ? (
        <p className="text-sm text-cinza">Nenhuma promoção cadastrada.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ordenadas.map((p) => {
            const [rotulo, cor] = situacao(p)
            const alvo = p.alvo === 'categorias' ? (p.categorias || []).map((c) => categorias.find((x) => x.id === c)?.nome || c).join(', ') : p.alvo === 'modelos' ? `${(p.modelos || []).length} peças escolhidas` : 'Toda a loja'
            return (
              <button key={p.id} onClick={() => setEdit({ ...structuredClone(p), categorias: p.categorias || [], modelos: p.modelos || [] })} className="cartao space-y-2 p-4 text-left transition hover:border-rosa">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 text-xs font-semibold text-rosa">
                    {p.tipo === 'relampago' && <Zap className="size-3.5 fill-current" />}
                    {nomeTipo(p.tipo)}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cor}`}>{rotulo}</span>
                </div>
                <p className="titulo text-lg leading-snug">
                  {p.titulo} <span className="text-rosa">−{p.percentual}%</span>
                </p>
                <p className="text-sm text-cinza">{alvo}</p>
                <p className="text-xs text-cinza">
                  {p.inicio ? new Date(p.inicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Já'} até {p.fim ? new Date(p.fim).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'eu encerrar'}
                </p>
              </button>
            )
          })}
        </div>
      )}

      <Modal aberto={!!edit} aoFechar={() => setEdit(null)} titulo={edit?.id ? 'Editar promoção' : `Nova: ${nomeTipo(edit?.tipo)}`} largura="max-w-2xl">
        {edit && (
          <form onSubmit={salvar} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
              <Campo rotulo="Tipo">
                <select className="campo" value={edit.tipo} onChange={(e) => setEdit({ ...edit, tipo: e.target.value })}>
                  {TIPOS_PROMO.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo rotulo="Desconto (%)">
                <input className="campo" type="number" min="1" max="90" required value={edit.percentual} onChange={(e) => setEdit({ ...edit, percentual: e.target.value })} />
              </Campo>
            </div>
            <Campo rotulo="Título" dica="Aparece no banner e na faixa do topo do site.">
              <input className="campo" required maxLength={60} value={edit.titulo} onChange={(e) => setEdit({ ...edit, titulo: e.target.value })} />
            </Campo>
            <Campo rotulo="Texto curto (opcional)">
              <input className="campo" maxLength={140} value={edit.descricao} onChange={(e) => setEdit({ ...edit, descricao: e.target.value })} />
            </Campo>
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo rotulo="Começa em">
                <input className="campo" type="datetime-local" value={local(edit.inicio)} onChange={(e) => setEdit({ ...edit, inicio: iso(e.target.value) })} />
              </Campo>
              <Campo rotulo="Termina em" dica={edit.tipo === 'relampago' ? 'Obrigatório: é o fim da contagem regressiva.' : 'Deixe vazio para encerrar manualmente.'}>
                <input className="campo" type="datetime-local" required={edit.tipo === 'relampago'} value={local(edit.fim)} onChange={(e) => setEdit({ ...edit, fim: iso(e.target.value) })} />
              </Campo>
            </div>
            <div>
              <span className="rotulo">Vale para</span>
              <div className="flex flex-wrap gap-2">
                {[
                  ['tudo', 'Toda a loja'],
                  ['categorias', 'Categorias'],
                  ['modelos', 'Peças escolhidas'],
                ].map(([id, nome]) => (
                  <button key={id} type="button" className={`chip ${edit.alvo === id ? 'chip-ativo' : ''}`} onClick={() => setEdit({ ...edit, alvo: id })}>
                    {nome}
                  </button>
                ))}
              </div>
              {edit.alvo === 'categorias' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {categorias.map((c) => (
                    <label key={c.id} className={`chip cursor-pointer ${edit.categorias.includes(c.id) ? '!border-rosa !bg-petala' : ''}`}>
                      <input type="checkbox" className="accent-rosa" checked={edit.categorias.includes(c.id)} onChange={() => alternar('categorias', c.id)} /> {c.nome}
                    </label>
                  ))}
                </div>
              )}
              {edit.alvo === 'modelos' && (
                <div className="mt-3 grid max-h-56 gap-1 overflow-y-auto rounded-xl border border-borda bg-white p-2 sm:grid-cols-2">
                  {d.modelos.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-petala">
                      <input type="checkbox" className="accent-rosa" checked={edit.modelos.includes(m.id)} onChange={() => alternar('modelos', m.id)} /> {m.nome}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-5 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="size-4 accent-rosa" checked={edit.ativo} onChange={(e) => setEdit({ ...edit, ativo: e.target.checked })} /> Ativa
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="size-4 accent-rosa" checked={edit.banner !== false} onChange={(e) => setEdit({ ...edit, banner: e.target.checked })} /> Mostrar no banner da página inicial
              </label>
            </div>
            <div>
              <span className="rotulo">Como fica no site</span>
              <FaixaPromo promo={{ ...edit, percentual: edit.percentual || 0 }} compacta />
            </div>
            <div className="flex flex-wrap justify-between gap-2 pt-2">
              {edit.id ? (
                <button type="button" className="btn-fantasma !text-rosa-escuro" onClick={remover}>
                  <Trash2 className="size-4" /> Apagar
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button type="button" className="btn-fantasma" onClick={() => setEdit(null)}>
                  Cancelar
                </button>
                <button className="btn-primario">Salvar promoção</button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
