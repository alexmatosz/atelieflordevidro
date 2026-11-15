import { useId } from 'react'
import { ALCAS, ALTURA, AREAS_PADRAO, CONTORNOS, ESTILOS_MATERIAL, LARGURA, PIRES, areaEmPixels, caminhoCurva, corFinal, textoFinal } from '../lib/pecas'

export function areaDoModelo(modelo) {
  return modelo?.area_pintavel || AREAS_PADRAO[modelo?.forma || 'caneca']
}

export function ObjetoDesenho({ obj, area, pers, corPadrao }) {
  const a = areaEmPixels(area)
  const cx = a.x + obj.x * a.w
  const cy = a.y + obj.y * a.h
  const cor = corFinal(obj.cor, pers, corPadrao)
  const transform = obj.rot ? `rotate(${obj.rot} ${cx} ${cy})` : undefined

  if (obj.tipo === 'texto') {
    const tamanho = (obj.t || 0.12) * a.w
    const texto = textoFinal(obj.texto, pers)
    const estilo = { fontFamily: `'${obj.fonte || 'Caveat'}', cursive`, fontSize: tamanho, fill: cor }
    if (obj.curva) {
      const idCaminho = `c-${obj.id}-${Math.round(cx)}-${Math.round(cy)}`
      return (
        <g transform={transform}>
          <path id={idCaminho} d={caminhoCurva(cx, cy + (obj.curva > 0 ? tamanho * 0.35 : -tamanho * 0.35), obj.curva)} fill="none" />
          <text style={estilo} textAnchor="middle">
            <textPath href={`#${idCaminho}`} startOffset="50%">
              {texto}
            </textPath>
          </text>
        </g>
      )
    }
    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" style={estilo} transform={transform}>
        {texto}
      </text>
    )
  }

  const w = (obj.s || 0.3) * a.w
  const h = obj.tipo === 'imagem' ? w * (obj.ar || 1) : w
  if (obj.tipo === 'imagem') {
    return <image href={obj.src} x={cx - w / 2} y={cy - h / 2} width={w} height={h} transform={transform} preserveAspectRatio="xMidYMid meet" />
  }
  return (
    <g transform={transform}>
      <svg x={cx - w / 2} y={cy - h / 2} width={w} height={h} viewBox="0 0 100 100" overflow="visible">
        <g dangerouslySetInnerHTML={{ __html: String(obj.svg || '').replaceAll('COR', cor) }} />
      </svg>
    </g>
  )
}

export default function Peca({ modelo, lado = 'frente', desenho, pers, mostrarArea = false, className = '', comSombra = true }) {
  const uid = useId().replace(/:/g, '')
  const forma = modelo?.forma || 'caneca'
  const area = areaDoModelo(modelo)
  const mat = ESTILOS_MATERIAL[modelo?.material] || ESTILOS_MATERIAL.ceramica
  const objetos = desenho?.[lado] || []
  const espelhar = lado === 'verso' && (forma === 'caneca' || forma === 'xicara')
  const fotoMockup = lado === 'verso' ? modelo?.mockup_verso || modelo?.mockup_frente : modelo?.mockup_frente
  const a = areaEmPixels(area)

  return (
    <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} className={className} role="img" aria-label={`${modelo?.nome || 'Peça'} — ${lado}`}>
      <defs>
        <linearGradient id={`g-${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor={mat.base} />
          <stop offset=".35" stopColor={mat.topo} />
          <stop offset=".7" stopColor={mat.topo} />
          <stop offset="1" stopColor={mat.base} />
        </linearGradient>
        <linearGradient id={`b-${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`clip-${uid}`}>
          {fotoMockup ? <rect x={a.x} y={a.y} width={a.w} height={a.h} /> : <path d={CONTORNOS[forma]} />}
        </clipPath>
      </defs>

      {comSombra && <ellipse cx="200" cy="476" rx="150" ry="14" fill="#6b3f2a" opacity=".08" />}

      {fotoMockup ? (
        <image href={fotoMockup} x="0" y="0" width={LARGURA} height={ALTURA} preserveAspectRatio="xMidYMid meet" />
      ) : (
        <g transform={espelhar ? `translate(${LARGURA} 0) scale(-1 1)` : undefined}>
          {forma === 'xicara' && <path d={PIRES} fill={`url(#g-${uid})`} stroke={mat.borda} strokeWidth="2" />}
          {ALCAS[forma] && <path d={ALCAS[forma]} fill={`url(#g-${uid})`} stroke={mat.borda} strokeWidth="2" opacity={mat.opacidade < 1 ? 0.8 : 1} />}
          <path d={CONTORNOS[forma]} fill={`url(#g-${uid})`} fillOpacity={mat.opacidade} stroke={mat.borda} strokeWidth="2.5" />
          {forma === 'garrafa' && <rect x="166" y="14" width="68" height="34" rx="8" fill={modelo?.material === 'inox' ? '#6d7276' : '#b4673f'} />}
          {(forma === 'caneca' || forma === 'copo' || forma === 'xicara') && (
            <ellipse cx="200" cy={forma === 'caneca' ? 92 : forma === 'copo' ? 66 : 168} rx={forma === 'xicara' ? 100 : forma === 'copo' ? 112 : 104} ry="10" fill={mat.base} opacity=".6" stroke={mat.borda} strokeWidth="2" />
          )}
          {forma === 'taca' && <ellipse cx="200" cy="40" rx="105" ry="9" fill={mat.base} opacity=".5" stroke={mat.borda} strokeWidth="2" />}
        </g>
      )}

      <g clipPath={`url(#clip-${uid})`}>
        {objetos.map((o) => (
          <ObjetoDesenho key={o.id} obj={o} area={area} pers={pers} corPadrao={desenho?.cor} />
        ))}
      </g>

      {!fotoMockup && (
        <path d={CONTORNOS[forma]} fill={`url(#b-${uid})`} opacity={modelo?.material === 'vidro' ? 0.5 : 0.28} pointerEvents="none" transform={espelhar ? `translate(${LARGURA} 0) scale(-1 1)` : undefined} />
      )}

      {mostrarArea && (
        <rect x={a.x} y={a.y} width={a.w} height={a.h} rx="6" fill="none" stroke="#b4673f" strokeWidth="2" strokeDasharray="7 6" opacity=".8" />
      )}
    </svg>
  )
}

export function MiniaturaArte({ arte, modelo, pers }) {
  const m = modelo || { forma: 'caneca', material: 'ceramica', area_pintavel: AREAS_PADRAO.caneca }
  return <Peca modelo={m} desenho={arte?.desenho} pers={pers} className="h-full w-full" comSombra={false} />
}
