import { db } from '../../lib/db'
import { useDados } from '../../lib/app'
import { data, dataHora } from '../../lib/format'
import { linkWhatsApp } from '../../lib/regras'
import { TituloPagina } from '../../components/Layout'
import { Carregando, Vazio } from '../../components/ui'

const STATUS = [
  { id: 'novo', nome: 'Novo' },
  { id: 'orcamento_enviado', nome: 'Orçamento enviado' },
  { id: 'fechado', nome: 'Fechado' },
  { id: 'perdido', nome: 'Perdido' },
]

export default function CorporativoAdmin() {
  const [d, recarregar] = useDados(async () => ({ lista: await db.listar('pedidos_corporativos', { ordem: 'criado_em desc' }), modelos: await db.listar('modelos') }))
  if (!d) return <Carregando />
  return (
    <div>
      <TituloPagina titulo="Pedidos de empresas" sub="Pedidos com logo e quantidade mínima. Responda com um orçamento pelo WhatsApp." />
      {d.lista.length === 0 ? (
        <Vazio titulo="Nenhum pedido de empresa ainda" />
      ) : (
        <div className="space-y-3">
          {d.lista.map((c) => (
            <div key={c.id} className="cartao flex flex-col gap-4 p-4 sm:flex-row">
              {c.logo && <img src={c.logo} alt="Logo" className="size-24 shrink-0 rounded-xl bg-white object-contain ring-1 ring-linho" />}
              <div className="flex-1 text-sm">
                <p className="titulo text-lg">{c.empresa}</p>
                <p className="text-cinza">
                  {c.contato_nome} {c.cnpj && `· CNPJ ${c.cnpj}`} · {dataHora(c.criado_em)}
                </p>
                <p className="mt-1">
                  <b>{c.quantidade}</b> × {d.modelos.find((m) => m.id === c.modelo_id)?.nome || 'modelo a definir'}
                  {c.data_desejada && ` · para ${data(c.data_desejada)}`}
                </p>
                {c.observacoes && <p className="mt-1 whitespace-pre-line text-cinza">{c.observacoes}</p>}
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:w-52">
                <select
                  className="campo"
                  value={c.status}
                  onChange={async (e) => {
                    await db.atualizar('pedidos_corporativos', c.id, { status: e.target.value })
                    recarregar()
                  }}
                  aria-label="Situação"
                >
                  {STATUS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
                {c.contato_whatsapp && (
                  <a className="btn !bg-[#1f9d55] text-white" target="_blank" rel="noreferrer" href={linkWhatsApp(c.contato_whatsapp, `Olá, ${c.contato_nome.split(' ')[0]}! Recebemos o pedido da ${c.empresa} (${c.quantidade} peças). Vamos montar seu orçamento:`)}>
                    WhatsApp
                  </a>
                )}
                {c.contato_email && (
                  <a className="btn-secundario" href={`mailto:${c.contato_email}`}>
                    E-mail
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
