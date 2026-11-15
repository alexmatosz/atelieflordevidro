import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { db } from '../../lib/db'
import { useApp, useDados, useWhats } from '../../lib/app'
import { moeda } from '../../lib/format'
import { precoUnitario } from '../../lib/regras'
import Peca, { MiniaturaArte } from '../../components/Peca'
import { AvisoArtesanal, Carregando, Vazio } from '../../components/ui'
import { CamposPersonalizacao } from './Modelo'

export default function Kit() {
  const nav = useNavigate()
  const { adicionarAoCarrinho, notificar } = useApp()
  const [kitId, setKitId] = useState(null)
  const [arteId, setArteId] = useState(null)
  const [pers, setPers] = useState({})
  const [adicionando, setAdicionando] = useState(false)
  const [d] = useDados(async () => {
    const [kits, modelos, artes] = await Promise.all([db.listar('kits', { filtro: { ativo: true } }), db.listar('modelos', { filtro: { disponivel: true } }), db.listar('artes', { filtro: { ativo: true }, ordem: 'nome' })])
    const validos = kits.filter((k) => k.composicao.every((c) => modelos.some((m) => m.id === c.modelo_id)))
    return { kits: validos, modelos, artes }
  })
  const kit = d?.kits.find((k) => k.id === kitId)
  const modelo = (id) => d.modelos.find((m) => m.id === id)
  const artes = kit ? d.artes.filter((a) => kit.composicao.every((c) => a.modelos_aceitos.includes(c.modelo_id))) : []
  const arte = artes.find((a) => a.id === arteId)
  useWhats(kit ? `Olá! Tenho uma dúvida sobre o ${kit.nome}${arte ? ` com a arte ${arte.nome}` : ''}.` : '')

  useEffect(() => {
    if (d && !kitId && d.kits[0]) setKitId(d.kits[0].id)
  }, [d, kitId])
  useEffect(() => {
    if (kit && !artes.some((a) => a.id === arteId)) setArteId(artes[0]?.id || null)
  }, [kit, artes, arteId])

  if (!d) return <Carregando />
  if (!d.kits.length) return <div className="mx-auto max-w-xl px-4 py-16"><Vazio titulo="Nenhum kit disponível agora" /></div>

  const linhas = kit ? kit.composicao.map((c) => ({ ...c, modelo: modelo(c.modelo_id), preco: precoUnitario({ modelo: modelo(c.modelo_id), arte, kit }), cheio: precoUnitario({ modelo: modelo(c.modelo_id), arte }) })) : []
  const total = linhas.reduce((s, l) => s + l.preco * l.quantidade, 0)
  const cheio = linhas.reduce((s, l) => s + l.cheio * l.quantidade, 0)

  const adicionar = async () => {
    setAdicionando(true)
    try {
      const { exportarPng } = await import('../../lib/konva')
      for (const l of linhas) {
        const mockup = await exportarPng(l.modelo, arte.desenho, 'frente', pers, 480)
        adicionarAoCarrinho({
          tipo: 'kit',
          kit_id: kit.id,
          kit_nome: kit.nome,
          modelo_id: l.modelo.id,
          arte_id: arte.id,
          descricao: `${l.modelo.nome}, arte ${arte.nome}`,
          personalizacao: pers,
          mockup,
          quantidade: l.quantidade,
          preco: l.preco,
          prazo: l.modelo.prazo_producao_dias,
        })
      }
      notificar('Kit na sacola.')
      nav('/carrinho')
    } catch (err) {
      notificar(err.message, 'erro')
    } finally {
      setAdicionando(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="font-mao text-2xl text-rosa">tudo combinando</p>
      <h1 className="text-3xl sm:text-4xl">Monte um kit</h1>
      <p className="mt-1 text-cinza">Peças diferentes com a mesma arte, com desconto de kit.</p>

      <div className="rolagem-fina mt-6 flex gap-3 overflow-x-auto pb-2">
        {d.kits.map((k) => (
          <button key={k.id} onClick={() => setKitId(k.id)} className={`w-60 shrink-0 rounded-2xl border-2 p-4 text-left transition ${k.id === kitId ? 'border-rosa bg-white' : 'border-borda bg-white/60'}`}>
            <p className="titulo text-lg">{k.nome}</p>
            <p className="text-xs text-cinza">{k.composicao.map((c) => `${c.quantidade}× ${modelo(c.modelo_id)?.nome}`).join(' + ')}</p>
            <span className="selo mt-2 bg-folha-clara text-folha">{k.desconto_percentual}% off</span>
          </button>
        ))}
      </div>

      {kit && (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex items-end justify-center gap-1 rounded-[2rem] bg-petala/70 p-6">
            {linhas.flatMap((l) => Array.from({ length: Math.min(l.quantidade, 3) }, (_, i) => <Peca key={`${l.modelo_id}-${i}`} modelo={l.modelo} desenho={arte?.desenho} pers={pers} className="w-1/4 max-w-40" />))}
          </div>
          <div className="space-y-6">
            <p className="text-cinza">{kit.descricao}</p>
            <section>
              <h2 className="mb-3 text-xl">Arte do kit</h2>
              {artes.length === 0 ? (
                <p className="text-sm text-cinza">Nenhuma arte serve para todas as peças deste kit.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {artes.map((a) => (
                    <button key={a.id} onClick={() => setArteId(a.id)} className={`overflow-hidden rounded-2xl bg-white ring-2 ${a.id === arteId ? 'ring-rosa' : 'ring-borda/60'}`} title={a.nome}>
                      <div className="aspect-square bg-petala/50">
                        <MiniaturaArte arte={a} modelo={linhas[0]?.modelo} pers={pers} />
                      </div>
                      <p className="truncate px-1.5 py-1 text-[11px] font-semibold">{a.nome}</p>
                    </button>
                  ))}
                </div>
              )}
            </section>
            {arte && (
              <section>
                <h2 className="mb-3 text-xl">Personalize</h2>
                <CamposPersonalizacao arte={arte} pers={pers} aoMudar={setPers} />
              </section>
            )}
            <div className="cartao space-y-3 p-5">
              {linhas.map((l) => (
                <p key={l.modelo_id} className="flex justify-between text-sm">
                  <span>
                    {l.quantidade}× {l.modelo.nome}
                  </span>
                  <span>{moeda(l.preco * l.quantidade)}</span>
                </p>
              ))}
              <div className="flex items-end justify-between border-t border-borda pt-3">
                <span className="text-sm text-cinza line-through">{moeda(cheio)}</span>
                <span className="titulo text-2xl">{moeda(total)}</span>
              </div>
              <button className="btn-primario w-full !py-3 text-base" disabled={!arte || adicionando} onClick={adicionar}>
                <ShoppingBag className="size-5" /> {adicionando ? 'Preparando…' : 'Colocar o kit na sacola'}
              </button>
            </div>
            <AvisoArtesanal />
          </div>
        </div>
      )}
    </div>
  )
}
