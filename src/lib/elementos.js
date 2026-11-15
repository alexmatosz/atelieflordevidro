const petalas = (n, r, rx, ry) =>
  Array.from({ length: n }, (_, i) => {
    const a = (360 / n) * i
    return `<ellipse cx="50" cy="${50 - r}" rx="${rx}" ry="${ry}" transform="rotate(${a} 50 50)"/>`
  }).join('')

export const ELEMENTOS_PADRAO = [
  {
    id: 'el-flor',
    nome: 'Flor de cinco pétalas',
    grupo: 'flores',
    svg: `<g fill="COR" opacity=".92">${petalas(5, 20, 14, 20)}</g><circle cx="50" cy="50" r="10" fill="#e3b25a"/>`,
  },
  {
    id: 'el-margarida',
    nome: 'Margarida',
    grupo: 'flores',
    svg: `<g fill="COR">${petalas(12, 24, 6, 18)}</g><circle cx="50" cy="50" r="11" fill="#e3b25a"/>`,
  },
  {
    id: 'el-tulipa',
    nome: 'Tulipa',
    grupo: 'flores',
    svg: `<path d="M50 96 C50 80 50 66 50 54" stroke="#7f9273" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M50 78 C40 70 30 72 26 64 C38 62 46 68 50 74" fill="#7f9273"/><path d="M30 20 C30 46 38 56 50 56 C62 56 70 46 70 20 L60 32 L50 14 L40 32 Z" fill="COR"/>`,
  },
  {
    id: 'el-rosa',
    nome: 'Rosa',
    grupo: 'flores',
    svg: `<circle cx="50" cy="50" r="30" fill="COR"/><path d="M50 30 C64 30 70 42 64 52 C58 62 42 60 40 50 C38 40 48 36 54 42 C58 46 54 52 50 50" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3.5" stroke-linecap="round"/><path d="M26 62 C34 76 52 82 70 74" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>`,
  },
  {
    id: 'el-folha',
    nome: 'Folha',
    grupo: 'folhas',
    svg: `<path d="M50 8 C80 30 80 70 50 92 C20 70 20 30 50 8 Z" fill="COR"/><path d="M50 16 L50 88" stroke="#fff" stroke-opacity=".5" stroke-width="2.5"/>`,
  },
  {
    id: 'el-ramo',
    nome: 'Ramo',
    grupo: 'folhas',
    svg: `<path d="M14 86 C34 66 58 40 88 12" stroke="COR" stroke-width="3" fill="none" stroke-linecap="round"/>${[
      [30, 68, -50],
      [44, 54, -50],
      [58, 40, -50],
      [72, 27, -50],
      [38, 74, 40],
      [52, 60, 40],
      [66, 46, 40],
      [80, 32, 40],
    ]
      .map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="11" fill="COR" transform="rotate(${r} ${x} ${y})"/>`)
      .join('')}`,
  },
  {
    id: 'el-coracao',
    nome: 'Coração',
    grupo: 'coracoes',
    svg: `<path d="M50 88 C20 66 8 48 12 32 C16 16 38 12 50 30 C62 12 84 16 88 32 C92 48 80 66 50 88 Z" fill="COR"/>`,
  },
  {
    id: 'el-coracao-traco',
    nome: 'Coração em traço',
    grupo: 'coracoes',
    svg: `<path d="M50 84 C22 64 12 48 16 34 C20 20 40 16 50 32 C60 16 80 20 84 34 C88 48 78 64 50 84 Z" fill="none" stroke="COR" stroke-width="5" stroke-linejoin="round"/>`,
  },
  {
    id: 'el-estrela',
    nome: 'Estrela',
    grupo: 'icones',
    svg: `<path d="M50 8 L61 38 L93 39 L68 58 L77 90 L50 71 L23 90 L32 58 L7 39 L39 38 Z" fill="COR"/>`,
  },
  {
    id: 'el-lua',
    nome: 'Lua',
    grupo: 'icones',
    svg: `<path d="M62 10 C36 14 20 36 24 60 C28 84 54 96 78 86 C56 82 42 64 44 44 C46 28 52 18 62 10 Z" fill="COR"/>`,
  },
  {
    id: 'el-bolinhas',
    nome: 'Bolinhas',
    grupo: 'icones',
    svg: `<g fill="COR">${[
      [20, 20, 7],
      [55, 16, 5],
      [84, 28, 8],
      [34, 50, 6],
      [70, 56, 7],
      [18, 80, 5],
      [52, 84, 8],
      [88, 82, 5],
    ]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`)
      .join('')}</g>`,
  },
  {
    id: 'el-pincelada',
    nome: 'Pincelada',
    grupo: 'icones',
    svg: `<path d="M6 58 C20 40 40 36 58 42 C72 46 84 40 94 32 C90 50 76 62 58 62 C40 62 24 70 6 58 Z" fill="COR" opacity=".85"/>`,
  },
  {
    id: 'el-listras',
    nome: 'Listras',
    grupo: 'icones',
    svg: `<g fill="COR"><rect x="0" y="18" width="100" height="14" rx="3"/><rect x="0" y="43" width="100" height="14" rx="3"/><rect x="0" y="68" width="100" height="14" rx="3"/></g>`,
  },
  {
    id: 'el-pinheiro',
    nome: 'Pinheiro',
    grupo: 'icones',
    svg: `<path d="M50 6 L74 40 L62 40 L82 66 L66 66 L88 92 L12 92 L34 66 L18 66 L38 40 L26 40 Z" fill="COR"/><rect x="45" y="88" width="10" height="10" fill="#6b3f2a"/>`,
  },
  {
    id: 'el-alianca',
    nome: 'Alianças',
    grupo: 'coracoes',
    svg: `<circle cx="38" cy="54" r="22" fill="none" stroke="COR" stroke-width="6"/><circle cx="62" cy="54" r="22" fill="none" stroke="COR" stroke-width="6"/>`,
  },
]

export const GRUPOS_ELEMENTOS = [
  { id: 'flores', nome: 'Flores' },
  { id: 'folhas', nome: 'Folhas' },
  { id: 'coracoes', nome: 'Corações' },
  { id: 'icones', nome: 'Ícones' },
]

export function svgElemento(svg, cor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${String(svg || '').replaceAll('COR', cor || '#b4673f')}</svg>`
}

export const dataUrlSvg = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

export const FONTES = [
  { id: 'Caveat', nome: 'Caligrafia leve' },
  { id: 'Dancing Script', nome: 'Cursiva clássica' },
  { id: 'Satisfy', nome: 'Pincel' },
  { id: 'Pacifico', nome: 'Letreiro' },
  { id: 'Amatic SC', nome: 'Desenhada' },
  { id: 'Patrick Hand', nome: 'Manuscrita' },
  { id: 'Fraunces', nome: 'Serifada' },
]

export const CORES_TINTA = ['#b4673f', '#8f4c2b', '#d98c8c', '#c94f6d', '#7f9273', '#3f6b5a', '#4a6fa5', '#2f2622', '#e3b25a', '#ffffff']
