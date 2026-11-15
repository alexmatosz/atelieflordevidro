import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Upload, X } from 'lucide-react'
import { db } from '../lib/db'
import { useApp } from '../lib/app'
import Peca from './Peca'
import { moeda } from '../lib/format'

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-grafite/40 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={titulo} className={`max-h-[92dvh] w-full ${largura} overflow-y-auto rounded-t-3xl bg-papel p-5 shadow-xl outline-none sm:rounded-3xl sm:p-6`}>
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

export function CartaoModelo({ modelo, para, arte, pers }) {
  return (
    <Link to={para || `/modelo/${modelo.id}`} className="group block">
      <div className="arco relative aspect-[4/5] overflow-hidden bg-petala">
        {modelo.fotos?.[0] ? (
          <img src={modelo.fotos[0]} alt={modelo.nome} className="size-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
        ) : (
          <Peca modelo={modelo} desenho={arte?.desenho} pers={pers} className="size-full px-4 pb-2 pt-8 transition duration-700 group-hover:scale-[1.04]" comSombra={false} ajustar />
        )}
        {modelo.mais_vendido && <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-3 py-0.5 font-mao text-lg text-rosa">mais pedida</span>}
      </div>
      <div className="px-1 pt-3 text-center">
        <p className="titulo text-lg leading-snug text-grafite group-hover:text-rosa">{modelo.nome}</p>
        <p className="mt-0.5 text-sm text-cinza">a partir de {moeda(modelo.preco_base)}</p>
      </div>
    </Link>
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
