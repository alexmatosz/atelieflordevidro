import { ELEMENTOS_PADRAO } from './elementos'
import { AREAS_PADRAO } from './pecas'

const svgDe = (id) => ELEMENTOS_PADRAO.find((e) => e.id === id).svg
const el = (id, x, y, s, cor = 'principal', rot = 0) => ({ id: `${id}-${x}-${y}`, tipo: 'elemento', svg: svgDe(id), x, y, s, cor, rot })
const tx = (texto, x, y, t, fonte, cor = '#2f2622', curva = 0) => ({ id: `t-${texto}-${y}`, tipo: 'texto', texto, x, y, t, fonte, cor, curva, rot: 0 })

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
  desenho: { frente, verso, cor: extra.cor || '#c94f6d' },
  fotos: [],
  modelos_aceitos: extra.modelos || todos,
  ocasioes: extra.ocasioes || [],
  personalizavel: { nome: true, frase: true, data: true, cor: true, ...(extra.campos || {}) },
  ativo: true,
  mais_vendida: !!extra.mais,
  descricao: extra.descricao || '',
  criado_em: new Date().toISOString(),
})

export const ARTES = [
  arte(
    'floral-aquarela',
    'Floral Aquarela',
    'Floral',
    15,
    [
      el('el-flor', 0.22, 0.24, 0.3),
      el('el-rosa', 0.78, 0.2, 0.26, '#d98c8c'),
      el('el-folha', 0.4, 0.12, 0.16, '#7f9273', -30),
      el('el-folha', 0.62, 0.1, 0.14, '#7f9273', 40),
      el('el-margarida', 0.8, 0.82, 0.22, '#ffffff'),
      el('el-folha', 0.16, 0.82, 0.16, '#7f9273', -60),
      tx('{nome}', 0.5, 0.55, 0.2, 'Dancing Script'),
    ],
    [el('el-ramo', 0.5, 0.5, 0.7, '#7f9273')],
    { mais: true, ocasioes: ['aniversario', 'casamento'], descricao: 'Flores soltas em tons de aquarela, com o nome no centro.' }
  ),
  arte(
    'nome-caligrafia',
    'Nome em Caligrafia',
    'Nomes',
    10,
    [tx('{nome}', 0.5, 0.42, 0.26, 'Satisfy', 'principal', 30), tx('{frase}', 0.5, 0.68, 0.1, 'Patrick Hand', '#6b3f2a')],
    [el('el-coracao', 0.5, 0.5, 0.2)],
    { mais: true, cor: '#8f4c2b', ocasioes: ['aniversario', 'padrinhos'], descricao: 'O nome em letra cursiva, com uma frase curta embaixo.' }
  ),
  arte(
    'data-especial',
    'Data Especial',
    'Datas',
    12,
    [el('el-coracao-traco', 0.5, 0.22, 0.24), tx('{data}', 0.5, 0.52, 0.18, 'Amatic SC', '#2f2622'), tx('{frase}', 0.5, 0.74, 0.11, 'Caveat', 'principal')],
    [tx('{nome}', 0.5, 0.5, 0.16, 'Caveat', 'principal')],
    { ocasioes: ['casamento', 'aniversario'], descricao: 'Para eternizar um dia: casamento, nascimento, formatura.' }
  ),
  arte(
    'listras-time',
    'Listras do Seu Time',
    'Times',
    12,
    [el('el-listras', 0.5, 0.3, 0.9), tx('{nome}', 0.5, 0.72, 0.18, 'Pacifico', '#2f2622')],
    [tx('{frase}', 0.5, 0.5, 0.14, 'Amatic SC', 'principal')],
    { cor: '#3f6b5a', descricao: 'Listras nas cores do seu time e o seu nome. Sem escudos ou marcas registradas.' }
  ),
  arte(
    'ramo-minimalista',
    'Ramo Minimalista',
    'Minimalista',
    8,
    [el('el-ramo', 0.5, 0.42, 0.62, '#3f6b5a', 10), tx('{nome}', 0.5, 0.86, 0.11, 'Fraunces', '#2f2622')],
    [],
    { cor: '#3f6b5a', modelos: todos, ocasioes: ['corporativo', 'padrinhos'], mais: true, descricao: 'Traço fino e delicado, combina com qualquer peça.' }
  ),
  arte(
    'ceu-estrelado',
    'Céu Estrelado',
    'Infantil',
    12,
    [
      el('el-lua', 0.24, 0.22, 0.26, '#e3b25a'),
      el('el-estrela', 0.66, 0.14, 0.12, '#e3b25a'),
      el('el-estrela', 0.84, 0.36, 0.08, '#e3b25a'),
      el('el-estrela', 0.12, 0.56, 0.08, '#e3b25a'),
      tx('{nome}', 0.5, 0.66, 0.2, 'Pacifico', 'principal'),
    ],
    [el('el-bolinhas', 0.5, 0.5, 0.7, 'principal')],
    { cor: '#4a6fa5', ocasioes: ['aniversario'], descricao: 'Lua e estrelas para os pequenos.' }
  ),
  arte(
    'casamento-aliancas',
    'Alianças e Ramo',
    'Casamento',
    18,
    [el('el-alianca', 0.5, 0.2, 0.28, '#e3b25a'), tx('{nome}', 0.5, 0.5, 0.16, 'Dancing Script', '#2f2622'), tx('{data}', 0.5, 0.72, 0.1, 'Fraunces', '#6b3f2a')],
    [el('el-ramo', 0.5, 0.5, 0.6, '#7f9273')],
    {
      cor: '#e3b25a',
      modelos: vidro,
      ocasioes: ['casamento', 'padrinhos'],
      mais: true,
      descricao: 'Para noivos e padrinhos: os nomes do casal e a data.',
    }
  ),
  arte(
    'natal-pinheiro',
    'Natal no Pinheiro',
    'Natal',
    12,
    [
      el('el-pinheiro', 0.5, 0.3, 0.34, '#3f6b5a'),
      el('el-estrela', 0.5, 0.06, 0.1, '#e3b25a'),
      tx('Feliz Natal', 0.5, 0.66, 0.16, 'Dancing Script', '#c94f6d'),
      tx('{nome}', 0.5, 0.86, 0.1, 'Patrick Hand', '#2f2622'),
    ],
    [el('el-bolinhas', 0.5, 0.5, 0.7, '#c94f6d')],
    { cor: '#c94f6d', ocasioes: ['corporativo'], campos: { frase: false }, descricao: 'Clima de Natal para presentear família e equipe.' }
  ),
  arte(
    'margaridas',
    'Campo de Margaridas',
    'Floral',
    15,
    [
      el('el-margarida', 0.2, 0.7, 0.28, '#ffffff'),
      el('el-margarida', 0.48, 0.82, 0.22, '#ffffff'),
      el('el-margarida', 0.8, 0.68, 0.3, '#ffffff'),
      el('el-folha', 0.34, 0.9, 0.12, '#7f9273', 30),
      tx('{frase}', 0.5, 0.26, 0.13, 'Caveat', 'principal'),
    ],
    [el('el-margarida', 0.5, 0.5, 0.3, '#ffffff')],
    { cor: '#e3b25a', modelos: todos, ocasioes: ['aniversario'], descricao: 'Margaridas brancas com a sua frase.' }
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
  { id: 'd-maes', nome: 'Dia das Mães', dia: 10, mes: 5, descricao: 'Segundo domingo de maio. Peça com antecedência: a fila de pintura enche.', artes_sugeridas: ['floral-aquarela', 'margaridas', 'nome-caligrafia'] },
  { id: 'd-namorados', nome: 'Dia dos Namorados', dia: 12, mes: 6, descricao: 'Taças com os nomes do casal e a data em que tudo começou.', artes_sugeridas: ['data-especial', 'casamento-aliancas'] },
  { id: 'd-pais', nome: 'Dia dos Pais', dia: 9, mes: 8, descricao: 'Segundo domingo de agosto. Copos e canecas com o time do coração.', artes_sugeridas: ['listras-time', 'ramo-minimalista'] },
  { id: 'd-criancas', nome: 'Dia das Crianças', dia: 12, mes: 10, descricao: 'Copos com o nome e desenhos que eles amam.', artes_sugeridas: ['ceu-estrelado'] },
  { id: 'd-professores', nome: 'Dia dos Professores', dia: 15, mes: 10, descricao: 'Lembrancinha da turma com o nome de cada professor.', artes_sugeridas: ['nome-caligrafia', 'ramo-minimalista'] },
  { id: 'd-formatura', nome: 'Formaturas', dia: 15, mes: 12, descricao: 'Taças de brinde com nome e ano de formatura.', artes_sugeridas: ['data-especial', 'nome-caligrafia'] },
  { id: 'd-natal', nome: 'Natal', dia: 25, mes: 12, descricao: 'Presentes de família e de fim de ano para equipes.', artes_sugeridas: ['natal-pinheiro'] },
]

export const CONFIG_PADRAO = {
  loja: {
    nome: 'Ateliê Flor de Vidro',
    whatsapp: '5511999999999',
    email: 'contato@exemplo.com',
    instagram: '',
    cidade: 'São Paulo, SP',
    pix_chave: '',
    pix_nome: '',
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
      'Cada peça sai do nosso ateliê pintada à mão, uma de cada vez. Nada de adesivo ou impressão: é tinta, pincel e paciência. Por isso nenhuma peça é igual à outra.',
    aviso_artesanal: 'Por ser pintura à mão, podem existir pequenas variações. Isso torna sua peça única.',
    trocas:
      'Se a peça chegar danificada, mande uma foto pelo WhatsApp em até 7 dias que pintamos outra. Peças personalizadas não têm troca por arrependimento.',
    cuidados: 'Lavar à mão, com esponja macia. Não usar no micro-ondas nem na lava-louças.',
  },
  corporativo: { quantidade_minima: 20 },
}
