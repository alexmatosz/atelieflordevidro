import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Upload, X } from 'lucide-react'
import { db } from '../lib/db'
import { precoDoModelo, useApp } from '../lib/app'
import { Carrossel, Contagem, Preco, SeloPromo } from './vitrine'
import Peca from './Peca'

export function Carregando({ texto = 'Carregando…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-cinza">
      <Loader2 className="size-4 animate-spin" /> {texto}
    </div>
  )
}

export function Erro({ texto }) {
  return <div className="rounded-xl border border-blush bg-blush/20 px-4 py-3 text-sm text-rosa-escuro">{texto}</div>
}

export function Vazio({ titulo, texto, acao }) {
  return (
    <div className="cartao flex flex-col items-center gap-2 px-6 py-12 text-center">
      <p className="titulo text-xl">{titulo}</p>
      {texto && <p className="max-w-sm text-sm text-cinza">{texto}</p>}
      {acao && <div className="mt-3">{acao}</div>}
    </div>
  )
}

export function Modal({ aberto, aoFechar, titulo, children, largura = 'max-w-lg' }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!aberto) return
    const tecla = (e) => e.key === 'Escape' && aoFechar()
    document.addEventListener('keydown', tecla)
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    return () => {
      document.removeEventListener('keydown', tecla)
      document.body.style.overflow = ''
    }
  }, [aberto, aoFechar])
  if (!aberto) return null
  return (
    <div className="fixed inset-0 z-50 flex animate-esmaecer items-end justify-center bg-grafite/40 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={titulo} className={`max-h-[92dvh] w-full ${largura} animate-folha overflow-y-auto rounded-t-3xl bg-papel p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl outline-none sm:animate-subir sm:rounded-3xl sm:p-6`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl">{titulo}</h2>
          <button onClick={aoFechar} className="rounded-full p-1.5 text-cinza hover:bg-petala" aria-label="Fechar">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Campo({ rotulo, dica, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {rotulo && <span className="rotulo">{rotulo}</span>}
      {children}
      {dica && <span className="mt-1 block text-xs text-cinza">{dica}</span>}
    </label>
  )
}

export function EnviarImagens({ valor = [], aoMudar, pasta = 'clientes', maximo = 6, rotulo = 'Adicionar imagem', aceitar = 'image/*' }) {
  const { notificar } = useApp()
  const [enviando, setEnviando] = useState(false)
  const enviar = async (e) => {
    const arquivos = [...e.target.files].slice(0, maximo - valor.length)
    e.target.value = ''
    if (!arquivos.length) return
    setEnviando(true)
    try {
      const urls = []
      for (const a of arquivos) urls.push(await db.enviarImagem(a, pasta))
      aoMudar([...valor, ...urls])
    } catch (err) {
      notificar(err.message, 'erro')
    } finally {
      setEnviando(false)
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {valor.map((url, i) => (
        <div key={url + i} className="relative size-20 overflow-hidden rounded-xl border border-borda bg-white">
          <img src={url} alt="" className="size-full object-cover" />
          <button type="button" onClick={() => aoMudar(valor.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-grafite shadow" aria-label="Remover imagem">
            <X className="size-3.5" />
          </button>
        </div>
      ))}
      {valor.length < maximo && (
        <label className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-borda bg-white text-center text-[11px] leading-tight text-cinza hover:border-rosa hover:text-rosa">
          {enviando ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          <span className="px-1">{rotulo}</span>
          <input type="file" accept={aceitar} multiple={maximo > 1} className="hidden" onChange={enviar} />
        </label>
      )}
    </div>
  )
}

export function Selo({ children, className = '' }) {
  return <span className={`selo ${className}`}>{children}</span>
}

const PERS_VITRINE = { nome: 'Helena', frase: 'para brindar a vida', data: '2026-05-10' }

export function slidesDoModelo(modelo, artes = [], arte, limite = 4) {
  if (modelo.fotos?.length) return modelo.fotos.slice(0, limite).map((f) => ({ foto: f, arte }))
  const aceitas = artes.filter((a) => a.modelos_aceitos?.includes(modelo.id))
  const ordem = [arte, ...aceitas.filter((a) => a.mais_vendida), ...aceitas].filter(Boolean)
  const unicas = [...new Map(ordem.map((a) => [a.id, a])).values()].slice(0, limite)
  return unicas.length ? unicas.map((a) => ({ arte: a })) : [{ arte: null }]
}

export function CartaoModelo({ modelo, para, arte, artes = [], pers = PERS_VITRINE }) {
  const { promocoes } = useApp()
  const { preco, cheio, promo } = precoDoModelo(modelo, promocoes)
  const slides = slidesDoModelo(modelo, artes, arte)
  const destino = (a) => para || `/modelo/${modelo.id}${a ? `?arte=${a.id}` : ''}`
  return (
    <div className="group">
      <div className="moldura aspect-[4/5]">
        <Carrossel rotulo={`Fotos de ${modelo.nome}`} className="size-full" classeSlide="h-full">
          {slides.map((s, i) => (
            <Link key={i} to={destino(s.arte)} className="block size-full" tabIndex={i === 0 ? 0 : -1} aria-label={`${modelo.nome}${s.arte ? `, arte ${s.arte.nome}` : ''}`}>
              {s.foto ? <img src={s.foto} alt="" className="zoom-suave size-full object-cover" loading="lazy" /> : <Peca modelo={modelo} desenho={s.arte?.desenho} pers={pers} className="zoom-suave size-full px-5 pb-6 pt-9" comSombra={false} ajustar />}
            </Link>
          ))}
        </Carrossel>
        <div className="pointer-events-none absolute left-3 right-3 top-[18%] z-10 flex flex-col items-start gap-1">
          <SeloPromo promo={promo} />
        </div>
        {modelo.mais_vendido && !promo && <span className="pointer-events-none absolute left-1/2 top-[13%] z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-rosa shadow-sm">Mais pedida</span>}
      </div>
      <Link to={destino(slides[0]?.arte)} className="block px-1 pt-3 text-center">
        <p className="titulo text-[17px] leading-snug text-grafite transition-colors group-hover:text-rosa sm:text-lg">{modelo.nome}</p>
        <div className="mt-1">
          <Preco preco={preco} cheio={cheio} prefixo="a partir de" className="justify-center" />
        </div>
        {promo?.tipo === 'relampago' && promo.fim && <Contagem fim={promo.fim} compacto className="mt-1 text-xs font-semibold text-rosa" />}
      </Link>
    </div>
  )
}

export function Contador({ valor, aoMudar, minimo = 1, maximo = 999 }) {
  return (
    <div className="inline-flex items-center rounded-full border border-borda bg-white">
      <button type="button" className="px-3 py-1.5 text-lg leading-none text-ameixa disabled:opacity-30" onClick={() => aoMudar(Math.max(minimo, valor - 1))} disabled={valor <= minimo} aria-label="Diminuir">
        −
      </button>
      <input
        className="w-12 bg-transparent text-center text-sm font-semibold outline-none"
        inputMode="numeric"
        value={valor}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/\D/g, '') || '0', 10)
          aoMudar(Math.min(maximo, Math.max(minimo, n)))
        }}
        aria-label="Quantidade"
      />
      <button type="button" className="px-3 py-1.5 text-lg leading-none text-ameixa disabled:opacity-30" onClick={() => aoMudar(Math.min(maximo, valor + 1))} disabled={valor >= maximo} aria-label="Aumentar">
        +
      </button>
    </div>
  )
}

export function AvisoArtesanal() {
  const { config } = useApp()
  return (
    <p className="border-l-2 border-ouro py-1 pl-4 text-sm leading-relaxed text-ameixa">{config.textos?.aviso_artesanal}</p>
  )
}
