import { useEffect, useMemo, useRef, useState } from 'react'
import { Group, Image as KImage, Layer, Rect, Stage, Text, TextPath, Transformer } from 'react-konva'
import { ArrowDown, ArrowUp, Copy, ImagePlus, RotateCcw, Trash2, Type } from 'lucide-react'
import { areaDoModelo } from './Peca'
import { atributos, carregarImagem, fundoSrc, garantirFontes, srcObjeto } from '../lib/konva'
import { CORES_TINTA, FONTES, GRUPOS_ELEMENTOS, dataUrlSvg, svgElemento } from '../lib/elementos'
import { ALTURA, LARGURA, areaEmPixels, novoId } from '../lib/pecas'
import { db } from '../lib/db'
import { useApp } from '../lib/app'

function useImagem(src) {
  const [img, setImg] = useState(null)
  useEffect(() => {
    let vivo = true
    carregarImagem(src).then((i) => vivo && setImg(i))
    return () => {
      vivo = false
    }
  }, [src])
  return img
}

function No({ obj, area, pers, corPadrao, selecionado, aoSelecionar, aoMudar, registrar }) {
  const at = atributos(obj, area, pers, corPadrao)
  const img = useImagem(at.forma === 'imagem' ? srcObjeto(obj, pers, corPadrao) : null)
  const a = areaEmPixels(area)
  const ref = useRef(null)

  useEffect(() => {
    registrar(obj.id, ref.current)
    return () => registrar(obj.id, null)
  }, [obj.id, registrar, img])

  const comum = {
    ref,
    draggable: true,
    onMouseDown: () => aoSelecionar(obj.id),
    onTap: () => aoSelecionar(obj.id),
    onDragEnd: (e) => aoMudar({ x: (e.target.x() - a.x) / a.w, y: (e.target.y() - a.y) / a.h }),
    onTransformEnd: () => {
      const n = ref.current
      const fator = n.scaleX()
      n.scaleX(1)
      n.scaleY(1)
      const patch = { x: (n.x() - a.x) / a.w, y: (n.y() - a.y) / a.h, rot: Math.round(n.rotation()) }
      if (obj.tipo === 'texto') patch.t = Math.max(0.03, (obj.t || 0.12) * fator)
      else patch.s = Math.max(0.04, (obj.s || 0.3) * fator)
      aoMudar(patch)
    },
    shadowColor: selecionado ? '#b4673f' : undefined,
  }

  if (at.forma === 'texto') return <Text {...at} {...comum} />
  if (at.forma === 'textpath') return <TextPath {...at} {...comum} />
  if (!img) return null
  return <KImage {...at} image={img} {...comum} />
}

export default function EditorArte({ modelo, desenho, aoMudar, elementos = [], pers, modoAdmin = false, ladoInicial = 'frente', aoMudarLado }) {
  const { notificar } = useApp()
  const [lado, setLadoInterno] = useState(ladoInicial)
  const [sel, setSel] = useState(null)
  const [largura, setLargura] = useState(360)
  const [grupoEl, setGrupoEl] = useState('flores')
  const [, forcar] = useState(0)
  const caixa = useRef(null)
  const trRef = useRef(null)
  const nos = useRef(new Map())
  const area = areaDoModelo(modelo)
  const a = areaEmPixels(area)
  const objetos = desenho?.[lado] || []
  const atual = objetos.find((o) => o.id === sel)
  const fundo = useImagem(useMemo(() => fundoSrc(modelo, lado), [modelo, lado]))
  const escala = largura / LARGURA

  const setLado = (l) => {
    setLadoInterno(l)
    setSel(null)
    aoMudarLado?.(l)
  }

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setLargura(Math.min(460, Math.floor(e.contentRect.width))))
    ro.observe(caixa.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    garantirFontes([...(desenho?.frente || []), ...(desenho?.verso || [])]).then(() => forcar((n) => n + 1))
  }, [desenho])

  useEffect(() => {
    const tr = trRef.current
    if (!tr) return
    const no = sel ? nos.current.get(sel) : null
    tr.nodes(no ? [no] : [])
    tr.getLayer()?.batchDraw()
  })

  const registrar = useMemo(
    () => (id, no) => {
      if (no) nos.current.set(id, no)
      else nos.current.delete(id)
    },
    []
  )

  const gravar = (lista) => aoMudar({ ...desenho, [lado]: lista })
  const mudarObj = (id, patch) => gravar(objetos.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  const adicionar = (obj) => {
    const novo = { id: novoId(), x: 0.5, y: 0.5, rot: 0, ...obj }
    gravar([...objetos, novo])
    setSel(novo.id)
  }
  const remover = () => {
    gravar(objetos.filter((o) => o.id !== sel))
    setSel(null)
  }
  const duplicar = () => {
    const novo = { ...atual, id: novoId(), x: Math.min(0.9, atual.x + 0.08), y: Math.min(0.9, atual.y + 0.08) }
    gravar([...objetos, novo])
    setSel(novo.id)
  }
  const mover = (dir) => {
    const i = objetos.findIndex((o) => o.id === sel)
    const j = i + dir
    if (j < 0 || j >= objetos.length) return
    const lista = [...objetos]
    ;[lista[i], lista[j]] = [lista[j], lista[i]]
    gravar(lista)
  }

  const adicionarImagem = async (e) => {
    const arq = e.target.files?.[0]
    e.target.value = ''
    if (!arq) return
    try {
      const src = await db.enviarImagem(arq, modoAdmin ? 'artes' : 'clientes')
      const img = await carregarImagem(src)
      adicionar({ tipo: 'imagem', src, s: 0.5, ar: img ? img.height / img.width : 1 })
    } catch (err) {
      notificar(err.message, 'erro')
    }
  }

  const cores = modoAdmin ? ['principal', ...CORES_TINTA] : CORES_TINTA
  const corVisivel = (c) => (c === 'principal' ? desenho?.cor || '#c94f6d' : c)

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="inline-flex rounded-full bg-areia p-1">
            {['frente', 'verso'].map((l) => (
              <button key={l} type="button" onClick={() => setLado(l)} className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${lado === l ? 'bg-white text-terracota shadow-sm' : 'text-argila'}`}>
                {l}
              </button>
            ))}
          </div>
          <span className="text-xs text-cinza">Arraste, gire e redimensione</span>
        </div>
        <div ref={caixa} className="mx-auto w-full max-w-[460px] overflow-hidden rounded-3xl bg-areia/60 textura">
          <Stage
            width={largura}
            height={(largura * ALTURA) / LARGURA}
            scaleX={escala}
            scaleY={escala}
            onMouseDown={(e) => e.target === e.target.getStage() && setSel(null)}
            onTouchStart={(e) => e.target === e.target.getStage() && setSel(null)}
          >
            <Layer>
              {fundo && <KImage image={fundo} x={0} y={0} width={LARGURA} height={ALTURA} listening={false} />}
              <Rect x={a.x} y={a.y} width={a.w} height={a.h} stroke="#b4673f" strokeWidth={1.5} dash={[7, 6]} cornerRadius={6} opacity={0.75} onMouseDown={() => setSel(null)} onTap={() => setSel(null)} fill="rgba(180,103,63,0.03)" />
              <Group clipX={a.x} clipY={a.y} clipWidth={a.w} clipHeight={a.h}>
                {objetos.map((o) => (
                  <No key={o.id} obj={o} area={area} pers={pers} corPadrao={desenho?.cor} selecionado={o.id === sel} aoSelecionar={setSel} aoMudar={(p) => mudarObj(o.id, p)} registrar={registrar} />
                ))}
              </Group>
              <Transformer ref={trRef} rotationSnaps={[0, 90, 180, 270]} keepRatio enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']} anchorStroke="#b4673f" borderStroke="#b4673f" anchorSize={12} anchorCornerRadius={6} />
            </Layer>
          </Stage>
        </div>
        <p className="mt-2 text-center text-xs text-cinza">A linha tracejada é a área que o artesão consegue pintar.</p>
      </div>

      <div className="space-y-4">
        <section className="cartao space-y-3 p-4">
          <p className="rotulo !mb-0">Adicionar</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn-secundario !px-3" onClick={() => adicionar({ tipo: 'texto', texto: modoAdmin ? '{nome}' : 'Seu texto', fonte: 'Dancing Script', cor: modoAdmin ? 'principal' : '#2f2622', t: 0.16, curva: 0 })}>
              <Type className="size-4" /> Texto
            </button>
            <label className="btn-secundario cursor-pointer !px-3">
              <ImagePlus className="size-4" /> Imagem
              <input type="file" accept="image/*" className="hidden" onChange={adicionarImagem} />
            </label>
          </div>
          {elementos.length > 0 && (
            <div>
              <div className="rolagem-fina -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
                {GRUPOS_ELEMENTOS.filter((g) => elementos.some((e) => e.grupo === g.id)).map((g) => (
                  <button key={g.id} type="button" onClick={() => setGrupoEl(g.id)} className={`chip shrink-0 !px-3 !py-1 !text-xs ${grupoEl === g.id ? 'chip-ativo' : ''}`}>
                    {g.nome}
                  </button>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-5 gap-1.5">
                {elementos
                  .filter((e) => e.grupo === grupoEl)
                  .map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      title={e.nome}
                      onClick={() => adicionar(e.imagem ? { tipo: 'imagem', src: e.imagem, s: 0.3, ar: 1 } : { tipo: 'elemento', svg: e.svg, cor: modoAdmin ? 'principal' : '#b4673f', s: 0.3 })}
                      className="aspect-square rounded-xl border border-linho bg-white p-1.5 hover:border-terracota"
                    >
                      <img src={e.imagem || dataUrlSvg(svgElemento(e.svg, '#b4673f'))} alt={e.nome} className="size-full object-contain" />
                    </button>
                  ))}
              </div>
            </div>
          )}
          {modoAdmin && (
            <p className="text-xs text-cinza">
              No texto, use <code>{'{nome}'}</code>, <code>{'{frase}'}</code> e <code>{'{data}'}</code> para o cliente preencher. A cor “principal” é a que o cliente escolhe.
            </p>
          )}
        </section>

        {atual ? (
          <section className="cartao space-y-3 p-4">
            <div className="flex items-center justify-between">
              <p className="rotulo !mb-0">{atual.tipo === 'texto' ? 'Texto selecionado' : atual.tipo === 'imagem' ? 'Imagem selecionada' : 'Elemento selecionado'}</p>
              <div className="flex gap-0.5">
                <button type="button" onClick={() => mover(1)} className="rounded-lg p-1.5 hover:bg-areia" title="Trazer para frente" aria-label="Trazer para frente">
                  <ArrowUp className="size-4" />
                </button>
                <button type="button" onClick={() => mover(-1)} className="rounded-lg p-1.5 hover:bg-areia" title="Mandar para trás" aria-label="Mandar para trás">
                  <ArrowDown className="size-4" />
                </button>
                <button type="button" onClick={duplicar} className="rounded-lg p-1.5 hover:bg-areia" title="Duplicar" aria-label="Duplicar">
                  <Copy className="size-4" />
                </button>
                <button type="button" onClick={() => mudarObj(atual.id, { rot: 0 })} className="rounded-lg p-1.5 hover:bg-areia" title="Endireitar" aria-label="Endireitar">
                  <RotateCcw className="size-4" />
                </button>
                <button type="button" onClick={remover} className="rounded-lg p-1.5 text-terracota hover:bg-rosa/30" title="Excluir" aria-label="Excluir">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            {atual.tipo === 'texto' && (
              <>
                <input className="campo" value={atual.texto} onChange={(e) => mudarObj(atual.id, { texto: e.target.value })} maxLength={60} aria-label="Texto" />
                <select className="campo" value={atual.fonte} onChange={(e) => mudarObj(atual.id, { fonte: e.target.value })} style={{ fontFamily: atual.fonte }} aria-label="Fonte">
                  {FONTES.map((f) => (
                    <option key={f.id} value={f.id} style={{ fontFamily: f.id }}>
                      {f.nome}
                    </option>
                  ))}
                </select>
                <label className="block text-xs text-cinza">
                  Tamanho
                  <input type="range" min="0.04" max="0.4" step="0.01" value={atual.t || 0.12} onChange={(e) => mudarObj(atual.id, { t: Number(e.target.value) })} className="w-full accent-terracota" />
                </label>
                <label className="block text-xs text-cinza">
                  Curvatura {atual.curva ? `(${atual.curva > 0 ? 'arco' : 'sorriso'})` : '(reto)'}
                  <input type="range" min="-100" max="100" step="5" value={atual.curva || 0} onChange={(e) => mudarObj(atual.id, { curva: Number(e.target.value) })} className="w-full accent-terracota" />
                </label>
              </>
            )}

            {atual.tipo !== 'imagem' && (
              <div>
                <p className="mb-1.5 text-xs text-cinza">Cor da tinta</p>
                <div className="flex flex-wrap gap-1.5">
                  {cores.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => mudarObj(atual.id, { cor: c })}
                      className={`size-7 rounded-full border-2 ${atual.cor === c ? 'border-tinta' : 'border-white'} shadow-sm ring-1 ring-linho`}
                      style={{ background: corVisivel(c) }}
                      title={c === 'principal' ? 'Cor principal (escolhida pelo cliente)' : c}
                      aria-label={c === 'principal' ? 'Cor principal' : `Cor ${c}`}
                    >
                      {c === 'principal' && <span className="text-[10px] font-bold text-white">P</span>}
                    </button>
                  ))}
                  <input type="color" value={atual.cor?.startsWith('#') ? atual.cor : '#b4673f'} onChange={(e) => mudarObj(atual.id, { cor: e.target.value })} className="size-7 cursor-pointer rounded-full border-0 bg-transparent p-0" aria-label="Outra cor" />
                </div>
              </div>
            )}

            {atual.tipo !== 'texto' && (
              <label className="block text-xs text-cinza">
                Tamanho
                <input type="range" min="0.06" max="1" step="0.01" value={atual.s || 0.3} onChange={(e) => mudarObj(atual.id, { s: Number(e.target.value) })} className="w-full accent-terracota" />
              </label>
            )}
            <label className="block text-xs text-cinza">
              Giro
              <input type="range" min="-180" max="180" step="1" value={atual.rot || 0} onChange={(e) => mudarObj(atual.id, { rot: Number(e.target.value) })} className="w-full accent-terracota" />
            </label>
          </section>
        ) : (
          <p className="rounded-2xl border border-dashed border-linho px-4 py-5 text-center text-sm text-cinza">Toque em um item do desenho para editar cor, tamanho e posição.</p>
        )}
      </div>
    </div>
  )
}
