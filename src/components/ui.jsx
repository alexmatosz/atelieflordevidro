import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Upload, X } from 'lucide-react'
import { db } from '../lib/db'
import { useApp } from '../lib/app'
import Peca from './Peca'
import { diasUteis, moeda, nomeMaterial } from '../lib/format'

export function Carregando({ texto = 'Carregando…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-cinza">
      <Loader2 className="size-4 animate-spin" /> {texto}
    </div>
  )
}

export function Erro({ texto }) {
  return <div className="rounded-xl border border-rosa bg-rosa/20 px-4 py-3 text-sm text-terracota-escuro">{texto}</div>
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-tinta/40 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={titulo} className={`max-h-[92dvh] w-full ${largura} overflow-y-auto rounded-t-3xl bg-creme p-5 shadow-xl outline-none sm:rounded-3xl sm:p-6`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl">{titulo}</h2>
          <button onClick={aoFechar} className="rounded-full p-1.5 text-cinza hover:bg-areia" aria-label="Fechar">
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
        <div key={url + i} className="relative size-20 overflow-hidden rounded-xl border border-linho bg-white">
          <img src={url} alt="" className="size-full object-cover" />
          <button type="button" onClick={() => aoMudar(valor.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-tinta shadow" aria-label="Remover imagem">
            <X className="size-3.5" />
          </button>
        </div>
      ))}
      {valor.length < maximo && (
        <label className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-linho bg-white text-center text-[11px] leading-tight text-cinza hover:border-terracota hover:text-terracota">
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

export function CartaoModelo({ modelo, para }) {
  return (
    <Link to={para || `/modelo/${modelo.id}`} className="group flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-linho/70 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-argila/5">
      <div className="relative aspect-[4/5] bg-areia/60 textura">
        {modelo.fotos?.[0] ? (
          <img src={modelo.fotos[0]} alt={modelo.nome} className="size-full object-cover" loading="lazy" />
        ) : (
          <Peca modelo={modelo} className="size-full p-4 transition duration-500 group-hover:scale-[1.03]" />
        )}
        {modelo.mais_vendido && <span className="selo absolute left-3 top-3 bg-white/90">Mais vendido</span>}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="titulo text-lg leading-tight">{modelo.nome}</p>
        <p className="text-xs text-cinza">
          {nomeMaterial(modelo.material)} · {modelo.capacidade_ml} ml · pintura em {diasUteis(modelo.prazo_producao_dias)}
        </p>
        <p className="mt-auto pt-2 text-sm">
          a partir de <span className="font-bold text-terracota-escuro">{moeda(modelo.preco_base)}</span>
        </p>
      </div>
    </Link>
  )
}

export function Contador({ valor, aoMudar, minimo = 1, maximo = 999 }) {
  return (
    <div className="inline-flex items-center rounded-full border border-linho bg-white">
      <button type="button" className="px-3 py-1.5 text-lg leading-none text-argila disabled:opacity-30" onClick={() => aoMudar(Math.max(minimo, valor - 1))} disabled={valor <= minimo} aria-label="Diminuir">
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
      <button type="button" className="px-3 py-1.5 text-lg leading-none text-argila disabled:opacity-30" onClick={() => aoMudar(Math.min(maximo, valor + 1))} disabled={valor >= maximo} aria-label="Aumentar">
        +
      </button>
    </div>
  )
}

export function AvisoArtesanal() {
  const { config } = useApp()
  return (
    <p className="flex gap-2 rounded-2xl bg-salvia-clara/60 px-4 py-3 text-sm text-tinta">
      <span className="font-mao text-xl leading-none text-salvia">♥</span>
      <span>{config.textos?.aviso_artesanal}</span>
    </p>
  )
}
