export const LARGURA = 400
export const ALTURA = 500

export const AREAS_PADRAO = {
  taca: { x: 0.27, y: 0.13, w: 0.46, h: 0.36 },
  copo: { x: 0.29, y: 0.22, w: 0.42, h: 0.58 },
  caneca: { x: 0.25, y: 0.27, w: 0.47, h: 0.55 },
  xicara: { x: 0.29, y: 0.37, w: 0.42, h: 0.3 },
  garrafa: { x: 0.31, y: 0.4, w: 0.38, h: 0.5 },
  pires: { x: 0.2, y: 0.5, w: 0.6, h: 0.22 },
  jarra: { x: 0.3, y: 0.3, w: 0.42, h: 0.5 },
  pote: { x: 0.3, y: 0.34, w: 0.4, h: 0.5 },
}

export const CONTORNOS = {
  taca: 'M95 40 L305 40 C312 150 290 250 214 280 L210 286 L210 420 C210 428 260 432 280 440 C290 446 270 456 200 456 C130 456 110 446 120 440 C140 432 190 428 190 420 L190 286 L186 280 C110 250 88 150 95 40 Z',
  copo: 'M88 66 L312 66 L288 448 C287 458 278 462 268 462 L132 462 C122 462 113 458 112 448 Z',
  caneca: 'M92 92 L300 92 L300 432 C300 446 290 456 276 456 L116 456 C102 456 92 446 92 432 Z',
  xicara: 'M100 168 L300 168 C300 290 268 352 200 352 C132 352 100 290 100 168 Z',
  garrafa:
    'M172 30 L228 30 L228 120 C228 140 282 158 282 200 L282 444 C282 458 270 468 256 468 L144 468 C130 468 118 458 118 444 L118 200 C118 158 172 140 172 120 Z',
  pires: 'M30 330 C30 280 370 280 370 330 C370 380 290 410 200 410 C110 410 30 380 30 330 Z',
  jarra: 'M96 72 L132 96 L268 96 C274 180 300 300 292 420 C290 446 272 462 246 462 L154 462 C128 462 110 446 108 420 C100 300 126 180 132 120 Z',
  pote: 'M118 128 C112 140 110 150 110 170 L110 436 C110 452 122 462 138 462 L262 462 C278 462 290 452 290 436 L290 170 C290 150 288 140 282 128 Z',
}

export const RECORTES = {
  taca: [80, 30, 240, 432],
  caneca: [84, 82, 300, 380],
  copo: [80, 58, 240, 410],
  xicara: [52, 158, 300, 252],
  garrafa: [108, 10, 184, 464],
  pires: [24, 276, 352, 140],
  jarra: [88, 62, 290, 406],
  pote: [104, 74, 192, 394],
}

export function viewBoxAjustado(forma) {
  const [x, y, w, h] = RECORTES[forma] || [0, 0, LARGURA, ALTURA]
  const m = 14
  return `${x - m} ${y - m} ${w + 2 * m} ${h + 2 * m}`
}

export const DETALHES = {
  pires: '<ellipse cx="200" cy="322" rx="92" ry="26" fill="none" stroke="BORDA" stroke-width="2" opacity=".7"/>',
  pote: '<rect x="114" y="80" width="172" height="52" rx="10" fill="TAMPA" stroke="BORDA" stroke-width="2"/><rect x="122" y="94" width="156" height="6" rx="3" fill="#fff" opacity=".35"/>',
}

export const ALCAS = {
  caneca: 'M300 160 C376 160 380 330 300 350 L300 318 C344 306 344 196 300 192 Z',
  xicara: 'M296 200 C350 196 352 270 286 284 L290 262 C326 254 326 220 298 222 Z',
  jarra: 'M282 150 C360 150 370 330 296 360 L294 330 C334 312 330 186 280 182 Z',
}

export const PIRES = 'M60 368 C60 352 340 352 340 368 C340 392 270 404 200 404 C130 404 60 392 60 368 Z'

export const ESTILOS_MATERIAL = {
  vidro: { topo: '#eef6f7', base: '#cfe2e5', opacidade: 0.55, borda: '#9bbcc2' },
  ceramica: { topo: '#fffdf9', base: '#ece2d5', opacidade: 1, borda: '#d9c9b6' },
  inox: { topo: '#f1f1f0', base: '#a9adb0', opacidade: 1, borda: '#8d9295' },
}

export const areaEmPixels = (area) => ({
  x: area.x * LARGURA,
  y: area.y * ALTURA,
  w: area.w * LARGURA,
  h: area.h * ALTURA,
})

export const raioCurva = (curva) => Math.max(70, 6000 / Math.abs(curva || 1))

export function caminhoCurva(x, y, curva) {
  const r = raioCurva(curva)
  if (curva > 0) return `M ${x - r} ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y + r}`
  return `M ${x - r} ${y - r} A ${r} ${r} 0 0 0 ${x + r} ${y - r}`
}

export const ROTULOS_CAMPOS = { nome: 'Seu nome', frase: 'Sua frase', data: '00.00.0000' }

export function textoFinal(texto, pers) {
  return String(texto || '').replace(/\{(nome|frase|data)\}/g, (_, c) => {
    const v = pers?.[c]
    if (!v) return ROTULOS_CAMPOS[c]
    if (c === 'data' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v.split('-').reverse().join('.')
    return v
  })
}

export const corFinal = (cor, pers, padrao) => (cor === 'principal' ? pers?.cor || padrao || '#a45c74' : cor)

export const novoId = () => Math.random().toString(36).slice(2, 10)
