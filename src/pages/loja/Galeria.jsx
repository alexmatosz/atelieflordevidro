import { Link } from 'react-router-dom'
import { db } from '../../lib/db'
import { useDados } from '../../lib/app'
import { Carregando, Vazio } from '../../components/ui'

export default function Galeria() {
  const [fotos] = useDados(() => db.listar('galeria_clientes', { filtro: { publicado: true, autorizado: true }, ordem: 'criado_em desc' }))
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="sobretitulo">Pintadas para pessoas de verdade</p>
      <h1 className="text-3xl sm:text-4xl">Feitos por clientes</h1>
      <p className="mt-1 text-cinza">Fotos reais de pedidos entregues, publicadas com autorização.</p>
      <div className="mt-6">
        {!fotos ? (
          <Carregando />
        ) : fotos.length === 0 ? (
          <Vazio titulo="As primeiras fotos chegam em breve" texto="Cada cliente pode autorizar mostrar a sua peça aqui." acao={<Link to="/catalogo" className="btn-primario">Escolher minha peça</Link>} />
        ) : (
          <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
            {fotos.map((f) => (
              <figure key={f.id} className="mb-3 break-inside-avoid overflow-hidden rounded-3xl bg-white ring-1 ring-borda/70">
                <img src={f.foto} alt={f.legenda || 'Peça pintada à mão'} className="w-full" loading="lazy" />
                {(f.legenda || f.cliente_nome) && (
                  <figcaption className="p-3 text-sm">
                    {f.legenda} {f.cliente_nome && <span className="font-semibold text-rosa">{f.cliente_nome}</span>}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
