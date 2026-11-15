import { useApp } from '../../lib/app'

export default function Sobre() {
  const { config } = useApp()
  const t = config.textos || {}
  const blocos = [
    ['Sobre o ateliê', t.sobre],
    ['Pintura à mão', t.aviso_artesanal],
    ['Cuidados com a peça', t.cuidados],
    ['Trocas e devoluções', t.trocas],
    ['Prazos', 'O prazo de pintura aparece em cada modelo e conta em dias úteis. O prazo de entrega começa a contar depois que a peça fica pronta e é calculado pelo seu CEP no carrinho.'],
  ].filter(([, v]) => v)
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl sm:text-4xl">Cuidados, trocas e envio</h1>
      <div className="mt-6 space-y-6">
        {blocos.map(([titulo, texto]) => (
          <section key={titulo}>
            <h2 className="text-xl">{titulo}</h2>
            <p className="mt-1 whitespace-pre-line text-cinza">{texto}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
