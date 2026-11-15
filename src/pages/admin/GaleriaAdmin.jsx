import { useState } from 'react'
import { Plus } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados } from '../../lib/app'
import { TituloPagina } from '../../components/Layout'
import { Campo, Carregando, EnviarImagens, Modal, Vazio } from '../../components/ui'

export default function GaleriaAdmin() {
  const { notificar } = useApp()
  const [d, recarregar] = useDados(async () => ({
    fotos: await db.listar('galeria_clientes', { ordem: 'criado_em desc' }),
    pedidos: (await db.listar('pedidos', { ordem: 'criado_em desc' })).filter((p) => p.foto_pronta && p.autoriza_galeria),
  }))
  const [nova, setNova] = useState(null)
  if (!d) return <Carregando />
  const jaNaGaleria = new Set(d.fotos.map((f) => f.pedido_id))
  const sugestoes = d.pedidos.filter((p) => !jaNaGaleria.has(p.id))

  const adicionar = async (dados) => {
    await db.inserir('galeria_clientes', { autorizado: true, publicado: true, legenda: '', ...dados })
    notificar('Foto publicada na galeria.')
    recarregar()
  }

  return (
    <div>
      <TituloPagina
        titulo="Feitos por clientes"
        sub="Só publique fotos com autorização do cliente."
        acao={
          <button className="btn-primario" onClick={() => setNova({ foto: null, legenda: '', cliente_nome: '', autorizado: false })}>
            <Plus className="size-4" /> Adicionar foto
          </button>
        }
      />
      {sugestoes.length > 0 && (
        <section className="mb-6 rounded-2xl bg-folha-clara/50 p-4">
          <p className="mb-3 text-sm font-semibold">Clientes que autorizaram mostrar a peça</p>
          <div className="flex flex-wrap gap-3">
            {sugestoes.map((p) => (
              <div key={p.id} className="w-32 text-xs">
                <img src={p.foto_pronta} alt="" className="aspect-square w-full rounded-xl object-cover" />
                <p className="mt-1 truncate">#{p.numero} · {p.cliente_nome}</p>
                <button className="font-semibold text-rosa" onClick={() => adicionar({ foto: p.foto_pronta, pedido_id: p.id, cliente_nome: p.cliente_nome.split(' ')[0] })}>
                  Publicar
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      {d.fotos.length === 0 ? (
        <Vazio titulo="A galeria está vazia" texto="Quando o cliente aprovar a foto da peça pronta e autorizar, ela aparece aqui para você publicar." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {d.fotos.map((f) => (
            <div key={f.id} className={`cartao overflow-hidden ${f.publicado ? '' : 'opacity-60'}`}>
              <img src={f.foto} alt="" className="aspect-square w-full object-cover" />
              <div className="space-y-1 p-2.5 text-xs">
                <p className="truncate font-semibold">{f.legenda || f.cliente_nome || 'Sem legenda'}</p>
                <div className="flex justify-between">
                  <button
                    className="font-semibold text-rosa"
                    onClick={async () => {
                      await db.atualizar('galeria_clientes', f.id, { publicado: !f.publicado })
                      recarregar()
                    }}
                  >
                    {f.publicado ? 'Ocultar' : 'Publicar'}
                  </button>
                  <button
                    className="text-cinza"
                    onClick={async () => {
                      if (!window.confirm('Remover esta foto?')) return
                      await db.remover('galeria_clientes', f.id)
                      recarregar()
                    }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal aberto={!!nova} aoFechar={() => setNova(null)} titulo="Nova foto na galeria">
        {nova && (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              if (!nova.foto) return notificar('Envie a foto.', 'erro')
              await adicionar(nova)
              setNova(null)
            }}
          >
            <EnviarImagens valor={nova.foto ? [nova.foto] : []} aoMudar={(v) => setNova({ ...nova, foto: v[0] || null })} pasta="galeria" maximo={1} />
            <Campo rotulo="Primeiro nome do cliente">
              <input className="campo" value={nova.cliente_nome} onChange={(e) => setNova({ ...nova, cliente_nome: e.target.value })} />
            </Campo>
            <Campo rotulo="Legenda">
              <input className="campo" value={nova.legenda} onChange={(e) => setNova({ ...nova, legenda: e.target.value })} placeholder="Taças do casamento da Ana e do Léo" />
            </Campo>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" required className="mt-0.5 size-4 accent-rosa" checked={nova.autorizado} onChange={(e) => setNova({ ...nova, autorizado: e.target.checked })} /> O cliente autorizou mostrar esta foto no site.
            </label>
            <button className="btn-primario w-full">Publicar</button>
          </form>
        )}
      </Modal>
    </div>
  )
}
