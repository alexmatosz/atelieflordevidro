import { Children, useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { useAgora } from '../lib/app'
import { tempoRestante } from '../lib/promocoes'
import { moeda } from '../lib/format'

export function Revelar({ as: Tag = 'div', atraso = 0, className = '', children, ...resto }) {
  const ref = useRef(null)
  const [visivel, setVisivel] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) return setVisivel(true)
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisivel(true)
          obs.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <Tag ref={ref} className={`revelar ${visivel ? 'visivel' : ''} ${className}`} style={{ '--atraso': `${atraso}ms` }} {...resto}>
      {children}
    </Tag>
  )
}

export function Carrossel({ children, className = '', rotulo = 'Fotos', pontos = true, setas = true, automatico = 0, indice, aoMudar, classeSlide = '', pontosClaros = false, miniaturas }) {
  const trilho = useRef(null)
  const slides = Children.toArray(children)
  const total = slides.length
  const [atual, setAtual] = useState(0)
  const [pausado, setPausado] = useState(false)

  const irPara = useCallback((i, suave = true) => {
    const el = trilho.current
    if (!el) return
    const alvo = ((i % total) + total) % total
    el.scrollTo({ left: alvo * el.clientWidth, behavior: suave ? 'smooth' : 'auto' })
  }, [total])

  useEffect(() => {
    if (indice == null || indice === atual) return
    irPara(indice)
  }, [indice])

  useEffect(() => {
    const el = trilho.current
    if (!el) return
    let quadro
    const rolar = () => {
      cancelAnimationFrame(quadro)
      quadro = requestAnimationFrame(() => {
        const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth))
        setAtual((a) => {
          if (a !== i) aoMudar?.(i)
          return i
        })
      })
    }
    el.addEventListener('scroll', rolar, { passive: true })
    return () => {
      el.removeEventListener('scroll', rolar)
      cancelAnimationFrame(quadro)
    }
  }, [aoMudar])

  useEffect(() => {
    if (!automatico || pausado || total < 2) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const t = setTimeout(() => irPara(atual + 1), automatico)
    return () => clearTimeout(t)
  }, [automatico, pausado, atual, total, irPara])

  if (!total) return null

  return (
    <div
      className={`relative ${className}`}
      role="region"
      aria-roledescription="carrossel"
      aria-label={rotulo}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPausado(true)}
      onPointerLeave={() => setPausado(false)}
      onTouchStart={() => setPausado(true)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div ref={trilho} className="sem-barra flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain" style={{ scrollBehavior: 'smooth' }}>
        {slides.map((s, i) => (
          <div key={i} className={`w-full shrink-0 snap-center snap-always ${classeSlide}`} aria-roledescription="slide" aria-label={`${i + 1} de ${total}`} aria-hidden={i !== atual}>
            {s}
          </div>
        ))}
      </div>
      {setas && total > 1 && (
        <>
          <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); irPara(atual - 1) }} className="absolute left-2 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ameixa shadow-md transition hover:bg-white active:scale-90 [@media(pointer:fine)]:flex" aria-label="Foto anterior">
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); irPara(atual + 1) }} className="absolute right-2 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ameixa shadow-md transition hover:bg-white active:scale-90 [@media(pointer:fine)]:flex" aria-label="Próxima foto">
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
      {pontos && total > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); irPara(i) }}
              className={`pointer-events-auto h-1.5 rounded-full transition-all duration-300 ${i === atual ? `w-5 ${pontosClaros ? 'bg-white' : 'bg-rosa'}` : `w-1.5 ${pontosClaros ? 'bg-white/50' : 'bg-ameixa/25'}`}`}
              aria-label={`Ir para a foto ${i + 1}`}
            />
          ))}
        </div>
      )}
      {miniaturas && total > 1 && (
        <div className="sem-barra mt-3 flex justify-center gap-2 overflow-x-auto px-1 pb-1">
          {miniaturas.map((m, i) => (
            <button key={i} type="button" onClick={() => irPara(i)} className={`size-16 shrink-0 overflow-hidden rounded-2xl border bg-petala transition sm:size-[72px] ${i === atual ? 'border-rosa ring-2 ring-rosa/25' : 'border-borda opacity-70 hover:opacity-100'}`} aria-label={`Ver foto ${i + 1}`} aria-current={i === atual}>
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function Preco({ preco, cheio, tamanho = 'normal', prefixo, className = '' }) {
  const desconto = cheio > preco
  const grande = tamanho === 'grande'
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`}>
      {prefixo && <span className={grande ? 'text-sm text-cinza' : 'text-[13px] text-cinza'}>{prefixo}</span>}
      {desconto && <s className={`text-cinza/80 ${grande ? 'text-base' : 'text-[13px]'}`}>{moeda(cheio)}</s>}
      <span className={`${grande ? 'titulo text-[32px] leading-none' : 'text-base font-bold'} ${desconto ? 'text-rosa-escuro' : 'text-grafite'}`}>{moeda(preco)}</span>
    </span>
  )
}

const dois = (n) => String(n).padStart(2, '0')

export function Contagem({ fim, claro = false, compacto = false, className = '' }) {
  const agora = useAgora(1000, !!fim)
  const t = fim ? tempoRestante(fim, agora) : null
  if (!t) return null
  const blocos = t.dias > 0 ? [[t.dias, 'd'], [t.horas, 'h'], [t.minutos, 'min']] : [[t.horas, 'h'], [t.minutos, 'min'], [t.segundos, 's']]
  if (compacto)
    return (
      <span className={`inline-flex items-center gap-1 tabular-nums ${className}`}>
        <Zap className="size-3.5 fill-current" /> {blocos.map(([v, u]) => `${dois(v)}${u}`).join(' ')}
      </span>
    )
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} role="timer" aria-label={`Termina em ${blocos.map(([v, u]) => `${v}${u}`).join(' ')}`}>
      {blocos.map(([v, u]) => (
        <span key={u} className={`flex min-w-11 flex-col items-center rounded-xl px-2 py-1 leading-none ${claro ? 'bg-white/15 text-white' : 'bg-white text-grafite ring-1 ring-borda'}`}>
          <span className="text-lg font-bold tabular-nums">{dois(v)}</span>
          <span className="mt-0.5 text-[11px] opacity-75">{u}</span>
        </span>
      ))}
    </span>
  )
}

export function SeloPromo({ promo, className = '' }) {
  if (!promo) return null
  const cores = {
    black: 'bg-noite text-ouro',
    relampago: 'bg-rosa text-white',
    semana: 'bg-folha text-white',
    outra: 'bg-ameixa text-white',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold leading-none shadow-sm ${cores[promo.tipo] || cores.outra} ${className}`}>
      {promo.tipo === 'relampago' && <Zap className="size-3 fill-current" />}−{Number(promo.percentual)}%
    </span>
  )
}
