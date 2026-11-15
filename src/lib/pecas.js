export const LARGURA = 400
export const ALTURA = 500

export const AREAS_PADRAO = {
  taca: { x: 0.27, y: 0.13, w: 0.46, h: 0.36 },
  copo: { x: 0.29, y: 0.22, w: 0.42, h: 0.58 },
  caneca: { x: 0.25, y: 0.27, w: 0.47, h: 0.55 },
  xicara: { x: 0.29, y: 0.37, w: 0.42, h: 0.3 },
  garrafa: { x: 0.33, y: 0.42, w: 0.34, h: 0.46 },
}

export const CONTORNOS = {
  taca: 'M95 40 L305 40 C312 150 290 250 214 280 L210 286 L210 420 C210 428 260 432 280 440 C290 446 270 456 200 456 C130 456 110 446 120 440 C140 432 190 428 190 420 L190 286 L186 280 C110 250 88 150 95 40 Z',
  copo: 'M88 66 L312 66 L288 448 C287 458 278 462 268 462 L132 462 C122 462 113 458 112 448 Z',
  caneca: 'M92 92 L300 92 L300 432 C300 446 290 456 276 456 L116 456 C102 456 92 446 92 432 Z',
  xicara: 'M100 168 L300 168 C300 290 268 352 200 352 C132 352 100 290 100 168 Z',
  garrafa:
    'M172 30 L228 30 L228 120 C228 140 282 158 282 200 L282 444 C282 458 270 468 256 468 L144 468 C130 468 118 458 118 444 L118 200 C118 158 172 140 172 120 Z',
}

export const ALCAS = {
  caneca: 'M300 160 C376 160 380 330 300 350 L300 318 C344 306 344 196 300 192 Z',
  xicara: 'M296 200 C350 196 352 270 286 284 L290 262 C326 254 326 220 298 222 Z',
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

export const corFinal = (cor, pers, padrao) => (cor === 'principal' ? pers?.cor || padrao || '#b4673f' : cor)

export const novoId = () => Math.random().toString(36).slice(2, 10)
