const F = { verde: '#5f7146', verdeClaro: '#8fa36b', limao: '#f2d24b', limaoEscuro: '#d9b234', miolo: '#e8b64a', ouro: '#c9a35b', marrom: '#6b4a32', cereja: '#c7344a' }

const folha = (x, y, r, esc = 1, cor = F.verde) =>
  `<g transform="translate(${x} ${y}) rotate(${r}) scale(${esc})"><path d="M0 0 C6 -6 16 -6 22 0 C16 6 6 6 0 0Z" fill="${cor}"/><path d="M1 0 L20 0" stroke="#fff" stroke-opacity=".35" stroke-width=".8"/></g>`

const petalas = (n, raio, rx, ry, cor, cx = 50, cy = 50) =>
  Array.from({ length: n }, (_, i) => `<ellipse cx="${cx}" cy="${cy - raio}" rx="${rx}" ry="${ry}" fill="${cor}" transform="rotate(${(360 / n) * i} ${cx} ${cy})"/>`).join('')

const pontos = (lista, cor = F.ouro) => lista.map(([x, y, r = 1.6]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${cor}"/>`).join('')

const tulipa = (x, y, esc, rot = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${esc})"><path d="M0 0 C-1 14 0 28 1 40" stroke="${F.verde}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M1 30 C-8 22 -14 24 -17 14 C-8 14 -2 20 1 26Z" fill="${F.verde}"/><path d="M-10 -16 C-12 -2 -6 4 0 4 C6 4 12 -2 10 -16 C6 -10 4 -10 3 -18 C1 -12 -1 -12 -3 -18 C-4 -10 -6 -10 -10 -16Z" fill="COR"/><path d="M-3 -16 C-2 -6 -1 0 0 3" stroke="#fff" stroke-opacity=".35" stroke-width="1.2" fill="none"/></g>`

export const ELEMENTOS_PADRAO = [
  {
    id: 'el-limao',
    nome: 'Limão siciliano',
    grupo: 'frutas',
    cor: F.limao,
    svg: `${folha(52, 26, -70, 1.25)}${folha(54, 26, -20, 1.1, F.verdeClaro)}<path d="M50 30 L53 26" stroke="${F.marrom}" stroke-width="2" stroke-linecap="round"/><path d="M18 60 C14 58 13 55 16 53 C18 40 32 30 50 31 C68 32 82 42 84 55 C87 56 88 60 84 62 C80 74 66 80 50 79 C34 78 22 72 18 60Z" fill="${F.limao}"/><path d="M26 64 C34 74 52 76 66 70" stroke="${F.limaoEscuro}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/><ellipse cx="40" cy="44" rx="8" ry="3.5" fill="#fff" opacity=".45" transform="rotate(-18 40 44)"/>${pontos([[60, 52, 0.9], [66, 58, 0.9], [56, 62, 0.9], [44, 58, 0.9]], F.limaoEscuro)}`,
  },
  {
    id: 'el-limao-fatia',
    nome: 'Fatia de limão',
    grupo: 'frutas',
    cor: F.limao,
    svg: `<circle cx="50" cy="50" r="38" fill="${F.limaoEscuro}"/><circle cx="50" cy="50" r="33" fill="#fff8d6"/><circle cx="50" cy="50" r="30" fill="${F.limao}" opacity=".85"/>${Array.from({ length: 8 }, (_, i) => `<path d="M50 50 L${50 + 30 * Math.cos((i * Math.PI) / 4)} ${50 + 30 * Math.sin((i * Math.PI) / 4)}" stroke="#fff8d6" stroke-width="2.4"/>`).join('')}<circle cx="50" cy="50" r="4" fill="#fff8d6"/>`,
  },
  {
    id: 'el-cereja',
    nome: 'Cerejas',
    grupo: 'frutas',
    cor: F.cereja,
    svg: `<path d="M34 66 C38 44 48 26 62 14 M66 62 C64 42 62 28 62 14" stroke="${F.verde}" stroke-width="2.4" fill="none" stroke-linecap="round"/>${folha(62, 15, -20, 1.3)}<circle cx="32" cy="72" r="15" fill="COR"/><circle cx="68" cy="68" r="15" fill="COR"/><ellipse cx="27" cy="66" rx="4" ry="2.5" fill="#fff" opacity=".55"/><ellipse cx="63" cy="62" rx="4" ry="2.5" fill="#fff" opacity=".55"/>`,
  },
  {
    id: 'el-morango',
    nome: 'Morango',
    grupo: 'frutas',
    cor: '#e0485c',
    svg: `<path d="M50 90 C30 80 18 60 22 44 C26 32 40 30 50 34 C60 30 74 32 78 44 C82 60 70 80 50 90Z" fill="COR"/><path d="M30 34 L40 26 L46 32 L50 22 L54 32 L60 26 L70 34 C62 38 56 36 50 40 C44 36 38 38 30 34Z" fill="${F.verde}"/>${pontos([[38, 50], [50, 48], [62, 50], [44, 62], [56, 62], [50, 74], [34, 60], [66, 60]].map(([x, y]) => [x, y, 1.4]), '#fde8a8')}`,
  },
  {
    id: 'el-tulipa',
    nome: 'Tulipa',
    grupo: 'flores',
    cor: '#e79aae',
    svg: tulipa(50, 42, 1.9),
  },
  {
    id: 'el-tulipas-buque',
    nome: 'Buquê de tulipas',
    grupo: 'flores',
    cor: '#e79aae',
    svg: `${tulipa(34, 44, 1.2, -16)}${tulipa(66, 44, 1.2, 16)}${tulipa(50, 34, 1.35)}`,
  },
  {
    id: 'el-cosmos',
    nome: 'Cosmos',
    grupo: 'flores',
    cor: '#e08aa6',
    svg: `${Array.from({ length: 8 }, (_, i) => `<path d="M50 50 C42 34 42 18 46 12 L50 16 L54 12 C58 18 58 34 50 50Z" fill="COR" transform="rotate(${i * 45} 50 50)"/>`).join('')}<circle cx="50" cy="50" r="8" fill="${F.miolo}"/>${pontos([[47, 47, 1.2], [53, 48, 1.2], [50, 53, 1.2]], F.marrom)}`,
  },
  {
    id: 'el-girassol',
    nome: 'Girassol',
    grupo: 'flores',
    cor: '#f2c230',
    svg: `${petalas(14, 26, 6, 15, 'COR')}${petalas(14, 22, 5, 12, '#f6d65e').replace(/rotate\((\d+(\.\d+)?)/g, (_, a) => `rotate(${Number(a) + 12.8}`)}<circle cx="50" cy="50" r="15" fill="${F.marrom}"/>${pontos([[44, 46], [50, 43], [56, 46], [46, 54], [54, 54], [50, 50]], '#3e2a1c')}`,
  },
  {
    id: 'el-margarida',
    nome: 'Margarida',
    grupo: 'flores',
    cor: '#ffffff',
    svg: `${Array.from({ length: 14 }, (_, i) => `<ellipse cx="50" cy="28" rx="5.5" ry="16" fill="COR" stroke="#d8cfc7" stroke-width=".8" transform="rotate(${(360 / 14) * i} 50 50)"/>`).join('')}<circle cx="50" cy="50" r="10" fill="${F.miolo}"/>`,
  },
  {
    id: 'el-florzinhas',
    nome: 'Florzinhas com pontinhos',
    grupo: 'flores',
    cor: '#f0b8c4',
    svg: `<g>${petalas(5, 7, 5, 7, 'COR', 30, 38)}<circle cx="30" cy="38" r="3" fill="${F.ouro}"/></g><g>${petalas(5, 6, 4.2, 6, 'COR', 66, 30)}<circle cx="66" cy="30" r="2.6" fill="${F.ouro}"/></g><g>${petalas(5, 8, 5.5, 8, 'COR', 58, 68)}<circle cx="58" cy="68" r="3.2" fill="${F.ouro}"/></g>${folha(38, 60, 120, 0.8)}${folha(74, 46, 40, 0.7)}${pontos([[18, 20], [46, 18], [84, 18], [86, 56], [22, 70], [40, 86], [80, 84], [48, 46]])}`,
  },
  {
    id: 'el-lavanda',
    nome: 'Lavanda',
    grupo: 'flores',
    cor: '#9d86c4',
    svg: [36, 50, 64]
      .map((x, k) => {
        const inc = (k - 1) * 8
        return `<path d="M50 92 C${50 + inc / 2} 70 ${x} 50 ${x} 20" stroke="${F.verde}" stroke-width="2" fill="none"/>${Array.from({ length: 6 }, (_, i) => `<ellipse cx="${x + (i % 2 ? 3 : -3)}" cy="${22 + i * 6}" rx="3" ry="4.5" fill="COR"/>`).join('')}`
      })
      .join(''),
  },
  {
    id: 'el-ramo',
    nome: 'Ramo de folhas',
    grupo: 'folhagens',
    cor: F.verde,
    svg: `<path d="M16 88 C34 66 56 40 86 14" stroke="COR" stroke-width="2.4" fill="none" stroke-linecap="round"/>${[
      [30, 71, -100],
      [42, 57, -100],
      [55, 43, -100],
      [68, 29, -100],
      [34, 74, 10],
      [47, 59, 10],
      [60, 45, 10],
      [73, 31, 10],
    ]
      .map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 0 C5 -5 13 -5 18 0 C13 5 5 5 0 0Z" fill="COR"/></g>`)
      .join('')}`,
  },
  {
    id: 'el-ramo-oliva',
    nome: 'Ramo de oliveira',
    grupo: 'folhagens',
    cor: '#7d8a5a',
    svg: `<path d="M20 84 C40 70 60 46 80 16" stroke="${F.marrom}" stroke-width="1.6" fill="none"/>${[
      [32, 74, -150],
      [44, 64, -140],
      [56, 50, -130],
      [68, 34, -120],
      [36, 72, 0],
      [50, 58, 10],
      [62, 42, 20],
    ]
      .map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 0 C6 -3 16 -3 22 0 C16 3 6 3 0 0Z" fill="COR"/></g>`)
      .join('')}<circle cx="46" cy="72" r="3.4" fill="#4a5232"/><circle cx="64" cy="54" r="3" fill="#4a5232"/>`,
  },
  {
    id: 'el-folhagem',
    nome: 'Folhagem solta',
    grupo: 'folhagens',
    cor: F.verde,
    svg: `${folha(20, 70, -40, 2.2, 'COR')}${folha(46, 60, -70, 1.8, F.verdeClaro)}${folha(54, 66, -20, 2, 'COR')}`,
  },
  {
    id: 'el-laco',
    nome: 'Lacinho',
    grupo: 'lacos',
    cor: '#f0a7b8',
    svg: `<path d="M50 46 C38 30 18 26 14 36 C10 48 30 56 50 50Z" fill="COR"/><path d="M50 46 C62 30 82 26 86 36 C90 48 70 56 50 50Z" fill="COR"/><path d="M47 52 C42 64 34 76 28 86 L36 84 L40 90 C44 78 48 64 50 54Z" fill="COR"/><path d="M53 52 C58 64 66 76 72 86 L64 84 L60 90 C56 78 52 64 50 54Z" fill="COR"/><ellipse cx="50" cy="48" rx="7" ry="6" fill="COR"/><ellipse cx="50" cy="48" rx="7" ry="6" fill="#000" opacity=".08"/><path d="M22 36 C28 34 36 38 42 44 M78 36 C72 34 64 38 58 44" stroke="#fff" stroke-opacity=".4" stroke-width="1.6" fill="none"/>`,
  },
  {
    id: 'el-coracao',
    nome: 'Coração',
    grupo: 'lacos',
    cor: '#d9708b',
    svg: `<path d="M50 86 C22 66 10 50 14 34 C18 18 40 14 50 32 C60 14 82 18 86 34 C90 50 78 66 50 86Z" fill="COR"/><ellipse cx="30" cy="32" rx="6" ry="3.5" fill="#fff" opacity=".4" transform="rotate(-30 30 32)"/>`,
  },
  {
    id: 'el-coracoes',
    nome: 'Coraçõezinhos',
    grupo: 'lacos',
    cor: '#d9708b',
    svg: [
      [26, 30, 0.34, -12],
      [70, 24, 0.26, 14],
      [52, 62, 0.42, 0],
      [20, 76, 0.22, -20],
      [82, 70, 0.24, 18],
    ]
      .map(([x, y, s, r]) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s}) translate(-50 -50)"><path d="M50 86 C22 66 10 50 14 34 C18 18 40 14 50 32 C60 14 82 18 86 34 C90 50 78 66 50 86Z" fill="COR"/></g>`)
      .join(''),
  },
  {
    id: 'el-borboleta',
    nome: 'Borboleta',
    grupo: 'detalhes',
    cor: '#e9a3b8',
    svg: `<path d="M50 46 C40 24 16 18 14 34 C12 48 32 52 50 50Z" fill="COR"/><path d="M50 46 C60 24 84 18 86 34 C88 48 68 52 50 50Z" fill="COR"/><path d="M50 52 C38 56 24 66 30 76 C36 84 46 70 50 56Z" fill="COR" opacity=".85"/><path d="M50 52 C62 56 76 66 70 76 C64 84 54 70 50 56Z" fill="COR" opacity=".85"/><ellipse cx="50" cy="52" rx="2.6" ry="14" fill="${F.marrom}"/><path d="M49 39 C46 32 42 28 38 26 M51 39 C54 32 58 28 62 26" stroke="${F.marrom}" stroke-width="1.2" fill="none"/>${pontos([[26, 34], [74, 34], [34, 70], [66, 70]], '#fff')}`,
  },
  {
    id: 'el-pontinhos',
    nome: 'Pontinhos dourados',
    grupo: 'detalhes',
    cor: F.ouro,
    svg: `<g fill="COR">${[
      [14, 20, 2.4],
      [36, 12, 1.6],
      [58, 22, 2.8],
      [84, 14, 1.8],
      [24, 44, 1.8],
      [48, 40, 1.4],
      [74, 46, 2.4],
      [12, 70, 2],
      [40, 66, 2.6],
      [64, 72, 1.6],
      [88, 74, 2.2],
      [30, 88, 1.6],
      [56, 90, 2],
      [80, 92, 1.4],
    ]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`)
      .join('')}</g>`,
  },
  {
    id: 'el-estrela',
    nome: 'Estrelinha',
    grupo: 'detalhes',
    cor: F.ouro,
    svg: `<path d="M50 10 C52 34 56 46 90 50 C56 54 52 66 50 90 C48 66 44 54 10 50 C44 46 48 34 50 10Z" fill="COR"/>`,
  },
  {
    id: 'el-poa',
    nome: 'Poá',
    grupo: 'detalhes',
    cor: '#f0b8c4',
    svg: `<g fill="COR">${Array.from({ length: 5 }, (_, l) => Array.from({ length: 5 }, (_, c) => `<circle cx="${10 + c * 20 + (l % 2) * 10}" cy="${10 + l * 20}" r="4"/>`).join('')).join('')}</g>`,
  },
  {
    id: 'el-xadrez',
    nome: 'Xadrez vichy',
    grupo: 'detalhes',
    cor: '#e79aae',
    svg: `<rect width="100" height="100" fill="#fff"/><g fill="COR" fill-opacity=".38">${[0, 25, 50, 75].map((p) => `<rect x="${p}" y="0" width="12.5" height="100"/><rect x="0" y="${p}" width="100" height="12.5"/>`).join('')}</g>`,
  },
]

export const GRUPOS_ELEMENTOS = [
  { id: 'flores', nome: 'Flores' },
  { id: 'frutas', nome: 'Frutas' },
  { id: 'folhagens', nome: 'Folhagens' },
  { id: 'lacos', nome: 'Laços e corações' },
  { id: 'detalhes', nome: 'Detalhes' },
]

export const temCor = (svg) => String(svg || '').includes('COR')

export function svgElemento(svg, cor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${String(svg || '').replaceAll('COR', cor || '#d9708b')}</svg>`
}

export const dataUrlSvg = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

export const FONTES = [
  { id: 'Allura', nome: 'Caligrafia fina' },
  { id: 'Great Vibes', nome: 'Caligrafia clássica' },
  { id: 'Dancing Script', nome: 'Cursiva' },
  { id: 'Sacramento', nome: 'Traço de pincel' },
  { id: 'Caveat', nome: 'Letra de mão' },
  { id: 'Amatic SC', nome: 'Desenhada' },
  { id: 'Gilda Display', nome: 'Elegante' },
]

export const CORES_TINTA = [
  { cor: '#d9708b', nome: 'rosa' },
  { cor: '#f0b8c4', nome: 'rosa-claro' },
  { cor: '#a45c74', nome: 'rosa antigo' },
  { cor: '#c7344a', nome: 'vermelho' },
  { cor: '#ee9a4d', nome: 'laranja' },
  { cor: '#f2d24b', nome: 'amarelo' },
  { cor: '#5f7146', nome: 'verde-oliva' },
  { cor: '#8fa36b', nome: 'verde-claro' },
  { cor: '#7aa5c9', nome: 'azul' },
  { cor: '#9d86c4', nome: 'lilás' },
  { cor: '#c9a35b', nome: 'dourado' },
  { cor: '#3b3436', nome: 'preto' },
  { cor: '#ffffff', nome: 'branco' },
]

export const nomeCor = (hex) => CORES_TINTA.find((c) => c.cor.toLowerCase() === String(hex || '').toLowerCase())?.nome || hex
