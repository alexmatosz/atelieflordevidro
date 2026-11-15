import { useState } from 'react'
import { Building2, Check } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados, useWhats } from '../../lib/app'
import { data as dataBr, mascaraFone } from '../../lib/format'
import { linkWhatsApp } from '../../lib/regras'
import { Campo, Carregando, EnviarImagens } from '../../components/ui'

export default function Corporativo() {
  const { config, notificar } = useApp()
  const minimo = Number(config.corporativo?.quantidade_minima || 20)
  const [modelos] = useDados(() => db.listar('modelos', { filtro: { disponivel: true }, ordem: 'nome' }))
  const [f, setF] = useState({ empresa: '', cnpj: '', contato_nome: '', contato_email: '', contato_whatsapp: '', modelo_id: '', quantidade: '', logo: null, data_desejada: '', observacoes: '' })
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  useWhats('Olá! Quero um orçamento de peças pintadas para a minha empresa.')
  if (!modelos) return <Carregando />

  const set = (c, m) => (e) => setF({ ...f, [c]: m ? m(e.target.value) : e.target.value })
  const enviar = async (e) => {
    e.preventDefault()
    if (Number(f.quantidade) < minimo) return notificar(`O mínimo para empresas é de ${minimo} peças.`, 'erro')
    setEnviando(true)
    try {
      const peca = modelos.find((m) => m.id === f.modelo_id)?.nome || 'ainda não escolhi a peça'
      const linhas = [
        `*Empresa:* ${f.empresa}${f.cnpj ? ` (CNPJ ${f.cnpj})` : ''}`,
        `*Contato:* ${f.contato_nome}${f.contato_email ? `, ${f.contato_email}` : ''}`,
        `*Peça:* ${peca}`,
        `*Quantidade:* ${f.quantidade}`,
        f.data_desejada && `*Para:* ${dataBr(f.data_desejada)}`,
        f.observacoes && `*Detalhes:* ${f.observacoes}`,
        f.logo && 'Vou mandar o logo em seguida.',
      ].filter(Boolean)
      const texto = ['Olá! Quero um orçamento para a minha empresa ♡', '', ...linhas].join('\n')
      window.open(linkWhatsApp(config.loja?.whatsapp, texto), '_blank', 'noopener')
      db.inserir('pedidos_corporativos', { ...f, modelo_id: f.modelo_id || null, quantidade: Number(f.quantidade), data_desejada: f.data_desejada || null, status: 'novo' }).catch(() => {})
      setEnviado(true)
    } catch (err) {
      notificar(err.message, 'erro')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-[1fr_1.3fr]">
        <div>
          <Building2 className="size-8 text-rosa" />
          <h1 className="mt-2 text-3xl sm:text-4xl">Para empresas</h1>
          <p className="mt-3 text-cinza">Brindes de fim de ano, kits de boas-vindas, eventos. Pintamos o logo ou uma arte da sua marca à mão, peça por peça.</p>
          <ul className="mt-5 space-y-2 text-sm">
            {[`A partir de ${minimo} peças`, 'Orçamento em até 2 dias úteis', 'Mockup para aprovação antes de pintar', 'Nota fiscal'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="size-4 text-folha" /> {t}
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-2xl bg-petala/70 p-4 text-sm text-cinza">Logos com detalhes muito finos podem ser simplificados para a pintura à mão. O artesão avisa no orçamento.</p>
        </div>
        {enviado ? (
          <div className="cartao flex flex-col items-center justify-center p-8 text-center">
            <p className="sobretitulo !text-folha">Recebido</p>
            <p className="titulo text-2xl">Vamos preparar seu orçamento</p>
            <p className="mt-2 text-sm text-cinza">Confira a mensagem no WhatsApp e toque em enviar. Se tiver o logo, mande na mesma conversa.</p>
          </div>
        ) : (
          <form onSubmit={enviar} className="cartao grid gap-4 p-5 sm:grid-cols-2">
            <Campo rotulo="Empresa">
              <input className="campo" required value={f.empresa} onChange={set('empresa')} />
            </Campo>
            <Campo rotulo="CNPJ (opcional)">
              <input className="campo" value={f.cnpj} onChange={set('cnpj')} />
            </Campo>
            <Campo rotulo="Seu nome">
              <input className="campo" required value={f.contato_nome} onChange={set('contato_nome')} />
            </Campo>
            <Campo rotulo="WhatsApp">
              <input className="campo" required inputMode="tel" value={f.contato_whatsapp} onChange={set('contato_whatsapp', mascaraFone)} />
            </Campo>
            <Campo rotulo="E-mail" className="sm:col-span-2">
              <input className="campo" type="email" required value={f.contato_email} onChange={set('contato_email')} />
            </Campo>
            <Campo rotulo="Peça">
              <select className="campo" value={f.modelo_id} onChange={set('modelo_id')}>
                <option value="">Ainda não sei</option>
                {modelos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo={`Quantidade (mín. ${minimo})`}>
              <input className="campo" type="number" required min={minimo} value={f.quantidade} onChange={set('quantidade')} />
            </Campo>
            <Campo rotulo="Data do evento ou entrega">
              <input className="campo" type="date" value={f.data_desejada} onChange={set('data_desejada')} />
            </Campo>
            <div>
              <span className="rotulo">Logo</span>
              <EnviarImagens valor={f.logo ? [f.logo] : []} aoMudar={(v) => setF({ ...f, logo: v[0] || null })} pasta="corporativo" maximo={1} rotulo="Enviar logo" />
            </div>
            <Campo rotulo="Detalhes" className="sm:col-span-2">
              <textarea className="campo min-h-24" value={f.observacoes} onChange={set('observacoes')} placeholder="Cores da marca, frase, se cada peça leva um nome diferente…" />
            </Campo>
            <button className="btn-primario sm:col-span-2" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Pedir orçamento pelo WhatsApp'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
