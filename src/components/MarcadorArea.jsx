import { useRef } from 'react'
import Peca from './Peca'

const limitar = (v, min, max) => Math.min(max, Math.max(min, v))

export default function MarcadorArea({ modelo, area, aoMudar }) {
  const caixa = useRef(null)

  const iniciar = (modo) => (e) => {
    e.preventDefault()
    const r = caixa.current.getBoundingClientRect()
    const inicio = { x: e.clientX, y: e.clientY, area: { ...area } }
    const mover = (ev) => {
      const dx = (ev.clientX - inicio.x) / r.width
      const dy = (ev.clientY - inicio.y) / r.height
      const a = inicio.area
      if (modo === 'mover') {
        aoMudar({ ...a, x: limitar(a.x + dx, 0, 1 - a.w), y: limitar(a.y + dy, 0, 1 - a.h) })
      } else {
        aoMudar({ ...a, w: limitar(a.w + dx, 0.08, 1 - a.x), h: limitar(a.h + dy, 0.08, 1 - a.y) })
      }
    }
    const soltar = () => {
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', soltar)
    }
    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', soltar)
  }

  return (
    <div ref={caixa} className="relative aspect-[4/5] w-full touch-none select-none overflow-hidden rounded-2xl bg-petala/60">
      <Peca modelo={{ ...modelo, area_pintavel: area }} className="absolute inset-0 size-full" />
      <div
        onPointerDown={iniciar('mover')}
        className="absolute cursor-move rounded-md border-2 border-dashed border-rosa bg-rosa/10"
        style={{ left: `${area.x * 100}%`, top: `${area.y * 100}%`, width: `${area.w * 100}%`, height: `${area.h * 100}%` }}
      >
        <span className="absolute left-1 top-1 rounded bg-rosa px-1.5 py-0.5 text-[10px] font-bold text-white">Área pintável</span>
        <span onPointerDown={(e) => (e.stopPropagation(), iniciar('redimensionar')(e))} className="absolute -bottom-2 -right-2 size-5 cursor-se-resize rounded-full border-2 border-white bg-rosa shadow" aria-label="Redimensionar" />
      </div>
    </div>
  )
}
