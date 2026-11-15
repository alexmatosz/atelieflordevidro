import { ELEMENTOS_PADRAO } from './elementos'
import { AREAS_PADRAO } from './pecas'

const svgDe = (id) => ELEMENTOS_PADRAO.find((e) => e.id === id).svg
const el = (id, x, y, s, cor = 'principal', rot = 0) => ({ id: `${id}-${x}-${y}`, tipo: 'elemento', nome: ELEMENTOS_PADRAO.find((e) => e.id === id).nome, svg: svgDe(id), x, y, s: Math.min(1.05, s * 1.3), cor, rot })
const tx = (texto, x, y, t, fonte, cor = '#3b3436', curva = 0) => ({ id: `t-${texto}-${y}`, tipo: 'texto', texto, x, y, t: t * 1.12, fonte, cor, curva, rot: 0 })

const modelo = (id, nome, categoria, forma, material, cap, alt, diam, preco, prazo, estoque, extra = {}) => ({
  id,
  nome,
  slug: id,
  categoria,
  forma,
  material,
  capacidade_ml: cap,
  altura_cm: alt,
  diametro_cm: diam,
  preco_base: preco,
  prazo_producao_dias: prazo,
  estoque,
  estoque_minimo: 5,
  disponivel: true,
  mais_vendido: false,
  fotos: [],
  mockup_frente: null,
  mockup_verso: null,
  area_pintavel: AREAS_PADRAO[forma],
  descricao: '',
  ordem: 0,
  criado_em: new Date().toISOString(),
  ...extra,
})

export const MODELOS = [
  modelo('taca-bordeaux', 'Taça Bordeaux', 'tacas', 'taca', 'vidro', 450, 22, 9.5, 69.9, 7, 24, {
    mais_vendido: true,
    descricao: 'Taça de cristal com bojo amplo, ideal para vinhos tintos. A pintura fica no bojo, longe da borda.',
  }),
  modelo('taca-espumante', 'Taça de Espumante', 'tacas', 'taca', 'vidro', 220, 23, 7, 59.9, 7, 40, {
    mais_vendido: true,
    descricao: 'Taça para brindes de casamento, formaturas e réveillon.',
  }),
  modelo('copo-long-drink', 'Copo Long Drink', 'copos', 'copo', 'vidro', 350, 15, 7.5, 39.9, 5, 3, {
    descricao: 'Copo alto e reto, ótimo para nomes e frases na vertical.',
  }),
  modelo('copo-tulipa', 'Copo de Vidro Clássico', 'copos', 'copo', 'vidro', 300, 12, 8, 34.9, 5, 60, {
    descricao: 'O copo do dia a dia, pintado para durar.',
  }),
  modelo('caneca-300', 'Caneca de Cerâmica 300 ml', 'canecas', 'caneca', 'ceramica', 300, 9.5, 8, 54.9, 6, 35, {
    mais_vendido: true,
    descricao: 'Caneca de cerâmica branca com pintura queimada em forno, resistente ao uso diário.',
  }),
  modelo('xicara-cafe', 'Xícara de Café com Pires', 'canecas', 'xicara', 'ceramica', 90, 6, 6.5, 44.9, 6, 18, {
    descricao: 'Xícara pequena com pires, para o cafezinho especial.',
  }),
  modelo('garrafa-vidro', 'Garrafa de Vidro 500 ml', 'garrafas', 'garrafa', 'vidro', 500, 24, 7, 64.9, 7, 12, {
    mais_vendido: true,
    descricao: 'Garrafa com tampa de rosca, para água ou licor caseiro.',
  }),
  modelo('pires-ceramica', 'Pires de Cerâmica', 'pires', 'pires', 'ceramica', null, 2, 15, 39.9, 5, 20, {
    descricao: 'Pires avulso para combinar com a xícara ou servir docinhos.',
  }),
  modelo('garrafa-termica', 'Garrafa Térmica Inox 500 ml', 'garrafas', 'garrafa', 'inox', 500, 25, 7, 99.9, 8, 0, {
    disponivel: false,
    descricao: 'Mantém a temperatura por até 12 horas. Pintura com tinta epóxi.',
  }),
]

const todos = MODELOS.map((m) => m.id)
const vidro = ['taca-bordeaux', 'taca-espumante', 'copo-long-drink', 'copo-tulipa', 'garrafa-vidro']

const arte = (id, nome, tema, acrescimo, frente, verso, extra = {}) => ({
  id,
  nome,
  tema,
  acrescimo,
  desenho: { frente, verso, cor: extra.cor || '#d9708b' },
  fotos: [],
  modelos_aceitos: extra.modelos || todos,
  ocasioes: extra.ocasioes || [],
  personalizavel: { nome: true, frase: true, data: true, cor: true, ...(extra.campos || {}) },
  ativo: true,
  mais_vendida: !!extra.mais,
  descricao: extra.descricao || '',
  criado_em: new Date().toISOString(),
})

const OURO = '#c9a35b'
const TINTA = '#3b3436'

export const ARTES = [
  arte(
    'tulipas-rose',
    'Tulipas Rosé',
    'Floral',
    15,
    [el('el-tulipas-buque', 0.5, 0.32, 0.62), el('el-pontinhos', 0.5, 0.36, 0.95, OURO), tx('{nome}', 0.5, 0.8, 0.22, 'Allura', TINTA)],
    [el('el-florzinhas', 0.5, 0.5, 0.7)],
    { mais: true, cor: '#e79aae', ocasioes: ['aniversario', 'maes'], descricao: 'Buquê de tulipas com pontinhos dourados e o nome em caligrafia.' }
  ),
  arte(
    'limao-siciliano',
    'Limão Siciliano',
    'Frutas',
    15,
    [
      el('el-limao', 0.28, 0.3, 0.42, '#f2d24b', -18),
      el('el-limao', 0.72, 0.56, 0.38, '#f2d24b', 22),
      el('el-folhagem', 0.74, 0.18, 0.3, '#5f7146'),
      el('el-limao-fatia', 0.26, 0.76, 0.24, '#f2d24b'),
      tx('{frase}', 0.62, 0.86, 0.12, 'Sacramento', '#5f7146'),
    ],
    [el('el-limao-fatia', 0.5, 0.5, 0.34, '#f2d24b')],
    { mais: true, cor: '#f2d24b', campos: { cor: false }, descricao: 'Limões sicilianos com folhagem, a pintura que mais sai no verão.' }
  ),
  arte(
    'girassois',
    'Girassóis',
    'Floral',
    18,
    [
      el('el-girassol', 0.32, 0.3, 0.42, '#f2c230'),
      el('el-girassol', 0.7, 0.56, 0.36, '#f2c230'),
      el('el-girassol', 0.3, 0.8, 0.26, '#f2c230'),
      el('el-folhagem', 0.72, 0.18, 0.3, '#5f7146'),
      el('el-folhagem', 0.6, 0.86, 0.26, '#5f7146'),
    ],
    [el('el-florzinhas', 0.5, 0.5, 0.6, '#ee9a4d')],
    { mais: true, cor: '#f2c230', campos: { nome: false, frase: false, data: false, cor: false }, descricao: 'Girassóis grandes e amarelinhos, para alegrar a mesa.' }
  ),
  arte(
    'cosmos',
    'Campo de Cosmos',
    'Floral',
    15,
    [el('el-cosmos', 0.28, 0.26, 0.36), el('el-cosmos', 0.7, 0.42, 0.3), el('el-cosmos', 0.36, 0.7, 0.28), el('el-folhagem', 0.7, 0.8, 0.3, '#5f7146'), el('el-pontinhos', 0.5, 0.5, 0.9, OURO)],
    [el('el-cosmos', 0.5, 0.5, 0.36)],
    { cor: '#e08aa6', ocasioes: ['aniversario', 'maes'], descricao: 'Cosmos cor-de-blush soltinhos, como um jardim pintado.' }
  ),
  arte(
    'lacinhos',
    'Lacinhos',
    'Delicado',
    12,
    [el('el-laco', 0.24, 0.2, 0.26), el('el-laco', 0.76, 0.42, 0.22), el('el-laco', 0.3, 0.72, 0.2), el('el-coracoes', 0.66, 0.84, 0.3), tx('{nome}', 0.5, 0.52, 0.16, 'Great Vibes', TINTA)],
    [el('el-laco', 0.5, 0.5, 0.36)],
    { mais: true, cor: '#f0a7b8', ocasioes: ['aniversario', 'padrinhos'], descricao: 'Lacinhos e coraçõezinhos, a moda que todo mundo ama.' }
  ),
  arte(
    'cerejinhas',
    'Cerejinhas',
    'Frutas',
    12,
    [
      el('el-cereja', 0.26, 0.24, 0.28),
      el('el-cereja', 0.74, 0.3, 0.24, 'principal', 18),
      el('el-cereja', 0.34, 0.66, 0.22, 'principal', -14),
      el('el-cereja', 0.76, 0.76, 0.26),
      tx('{nome}', 0.52, 0.48, 0.15, 'Dancing Script', TINTA),
    ],
    [el('el-poa', 0.5, 0.5, 1, '#f0b8c4')],
    { cor: '#c7344a', descricao: 'Cerejinhas espalhadas com poá no verso.' }
  ),
  arte(
    'nome-dourado',
    'Nome em Dourado',
    'Nomes',
    10,
    [el('el-florzinhas', 0.5, 0.18, 0.5), tx('{nome}', 0.5, 0.52, 0.28, 'Great Vibes', OURO), tx('{frase}', 0.5, 0.8, 0.1, 'Gilda Display', TINTA)],
    [el('el-estrela', 0.5, 0.5, 0.16, OURO)],
    { cor: '#f0b8c4', ocasioes: ['aniversario', 'padrinhos', 'casamento'], descricao: 'O nome em letra dourada, com florzinhas por cima.' }
  ),
  arte(
    'margaridas',
    'Margaridas',
    'Floral',
    15,
    [
      el('el-margarida', 0.22, 0.72, 0.3, '#ffffff'),
      el('el-margarida', 0.5, 0.84, 0.24, '#ffffff'),
      el('el-margarida', 0.8, 0.7, 0.32, '#ffffff'),
      el('el-folhagem', 0.36, 0.92, 0.2, '#5f7146'),
      tx('{frase}', 0.5, 0.28, 0.13, 'Sacramento', 'principal'),
    ],
    [el('el-margarida', 0.5, 0.5, 0.32, '#ffffff')],
    { cor: '#a45c74', ocasioes: ['aniversario', 'maes'], descricao: 'Margaridas brancas com a sua frase.' }
  ),
  arte(
    'casamento-oliveira',
    'Casamento com Oliveira',
    'Casamento',
    18,
    [el('el-ramo-oliva', 0.5, 0.24, 0.5, '#7d8a5a', -30), tx('{nome}', 0.5, 0.56, 0.18, 'Great Vibes', TINTA), tx('{data}', 0.5, 0.8, 0.09, 'Gilda Display', OURO)],
    [el('el-ramo-oliva', 0.5, 0.5, 0.6, '#7d8a5a')],
    { cor: '#7d8a5a', modelos: vidro, ocasioes: ['casamento', 'padrinhos'], campos: { cor: false }, descricao: 'Os nomes do casal e a data, com um ramo de oliveira.' }
  ),
]

export const KITS = [
  {
    id: 'kit-brinde',
    nome: 'Kit Brinde a Dois',
    descricao: 'Duas taças de espumante com a mesma arte. Presente clássico de casamento e bodas.',
    composicao: [{ modelo_id: 'taca-espumante', quantidade: 2 }],
    desconto_percentual: 10,
    ativo: true,
  },
  {
    id: 'kit-padrinhos',
    nome: 'Kit Padrinhos',
    descricao: 'Duas taças Bordeaux e uma garrafa de vidro, tudo com a mesma pintura.',
    composicao: [
      { modelo_id: 'taca-bordeaux', quantidade: 2 },
      { modelo_id: 'garrafa-vidro', quantidade: 1 },
    ],
    desconto_percentual: 12,
    ativo: true,
  },
  {
    id: 'kit-cafe',
    nome: 'Kit Café da Manhã',
    descricao: 'Duas canecas e duas xícaras com pires, combinando.',
    composicao: [
      { modelo_id: 'caneca-300', quantidade: 2 },
      { modelo_id: 'xicara-cafe', quantidade: 2 },
    ],
    desconto_percentual: 10,
    ativo: true,
  },
]

export const DATAS = [
  { id: 'd-maes', nome: 'Dia das Mães', dia: 10, mes: 5, descricao: 'Segundo domingo de maio. Encomende com antecedência, a agenda de pintura enche rápido.', artes_sugeridas: ['tulipas-rose', 'margaridas', 'cosmos'] },
  { id: 'd-namorados', nome: 'Dia dos Namorados', dia: 12, mes: 6, descricao: 'Taças com os nomes do casal e a data em que tudo começou.', artes_sugeridas: ['casamento-oliveira', 'lacinhos'] },
  { id: 'd-pais', nome: 'Dia dos Pais', dia: 9, mes: 8, descricao: 'Segundo domingo de agosto. Canecas e copos com o nome do paizão.', artes_sugeridas: ['nome-dourado', 'limao-siciliano'] },
  { id: 'd-professores', nome: 'Dia dos Professores', dia: 15, mes: 10, descricao: 'Lembrancinha da turma com o nome de cada professora.', artes_sugeridas: ['nome-dourado', 'margaridas'] },
  { id: 'd-formatura', nome: 'Formaturas', dia: 15, mes: 12, descricao: 'Taças de brinde com nome e ano de formatura.', artes_sugeridas: ['nome-dourado'] },
  { id: 'd-natal', nome: 'Natal', dia: 25, mes: 12, descricao: 'Presentes para a família e para a equipe no fim do ano.', artes_sugeridas: ['cerejinhas', 'nome-dourado'] },
]

export const CONFIG_PADRAO = {
  loja: {
    nome: 'Atelier Flor de Vidro',
    whatsapp: '554896273495',
    email: '',
    instagram: 'atelieflordevidro',
    cidade: 'Sombrio, SC',
    pix_chave: '',
    pix_nome: '',
    razao_social: '',
    cnpj: '',
    endereco: '',
  },
  frete: {
    gratis_acima: 350,
    faixas: [
      { regiao: 'Sudeste', prefixos: ['0', '1', '2', '3'], valor: 25, dias: 5 },
      { regiao: 'Sul', prefixos: ['8', '9'], valor: 32, dias: 7 },
      { regiao: 'Centro-Oeste', prefixos: ['7'], valor: 38, dias: 8 },
      { regiao: 'Nordeste', prefixos: ['4', '5', '6'], valor: 42, dias: 10 },
    ],
  },
  descontos: {
    faixas: [
      { minimo: 6, percentual: 5 },
      { minimo: 12, percentual: 10 },
      { minimo: 30, percentual: 15 },
      { minimo: 50, percentual: 20 },
    ],
  },
  textos: {
    sobre:
      'Cada peça sai do ateliê pintada à mão, uma de cada vez. Nada de adesivo ou impressão: é tinta, pincel e muito carinho. Por isso nenhuma peça é igual à outra.',
    aviso_artesanal: 'Por ser pintura à mão, podem existir pequenas variações. Isso torna sua peça única.',
    trocas:
      'Você pode desistir em até 7 dias do recebimento. Se a peça chegar quebrada ou com defeito, mande uma foto pelo WhatsApp que pintamos outra ou devolvemos o valor.',
    cuidados: 'Lavar à mão, com esponja macia. Não usar no micro-ondas nem na lava-louças.',
  },
  corporativo: { quantidade_minima: 20 },
  categorias: {
    lista: [
      { id: 'tacas', nome: 'Taças', forma: 'taca' },
      { id: 'canecas', nome: 'Xícaras e canecas', forma: 'caneca' },
      { id: 'copos', nome: 'Copos', forma: 'copo' },
      { id: 'garrafas', nome: 'Garrafas', forma: 'garrafa' },
      { id: 'pires', nome: 'Pires e pratos', forma: 'pires' },
    ],
  },
}
