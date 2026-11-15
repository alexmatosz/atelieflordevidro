import Konva from 'konva'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Peca, { areaDoModelo } from '../components/Peca'
import { dataUrlSvg, svgElemento } from './elementos'
import { ALTURA, LARGURA, areaEmPixels, caminhoCurva, corFinal, textoFinal } from './pecas'

const cache = new Map()

export function carregarImagem(src) {
  if (!src) return Promise.resolve(null)
  if (!cache.has(src)) {
    cache.set(
      src,
      new Promise((resolve) => {
        const img = new window.Image()
        if (!src.startsWith('data:')) img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
        img.src = src
      })
    )
  }
  return cache.get(src)
}

export function fundoSrc(modelo, lado) {
  const foto = lado === 'verso' ? modelo?.mockup_verso || modelo?.mockup_frente : modelo?.mockup_frente
  if (foto) return foto
  const svg = renderToStaticMarkup(createElement(Peca, { modelo, lado, desenho: null }))
  return dataUrlSvg(svg.replace('<svg', `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGURA}" height="${ALTURA}"`))
}

export function srcObjeto(obj, pers, corPadrao) {
  if (obj.tipo === 'imagem') return obj.src
  if (obj.tipo === 'elemento') return dataUrlSvg(svgElemento(obj.svg, corFinal(obj.cor, pers, corPadrao)))
  return null
}

export function atributos(obj, area, pers, corPadrao) {
  const a = areaEmPixels(area)
  const base = { x: a.x + obj.x * a.w, y: a.y + obj.y * a.h, rotation: obj.rot || 0 }
  if (obj.tipo === 'texto') {
    const fontSize = (obj.t || 0.12) * a.w
    const comum = {
      ...base,
      text: textoFinal(obj.texto, pers),
      fontFamily: obj.fonte || 'Caveat',
      fontSize,
      fill: corFinal(obj.cor, pers, corPadrao),
    }
    if (obj.curva) {
      return { ...comum, forma: 'textpath', data: caminhoCurva(0, obj.curva > 0 ? fontSize * 0.35 : -fontSize * 0.35, obj.curva), align: 'center', textBaseline: 'alphabetic' }
    }
    const largura = Math.max(a.w * 3, 600)
    return { ...comum, forma: 'texto', width: largura, align: 'center', offsetX: largura / 2, offsetY: fontSize * 0.55, lineHeight: 1.1 }
  }
  const w = (obj.s || 0.3) * a.w
  const h = obj.tipo === 'imagem' ? w * (obj.ar || 1) : w
  return { ...base, forma: 'imagem', width: w, height: h, offsetX: w / 2, offsetY: h / 2 }
}

export async function garantirFontes(objetos) {
  if (!document.fonts?.load) return
  const fontes = [...new Set(objetos.filter((o) => o.tipo === 'texto').map((o) => o.fonte || 'Caveat'))]
  await Promise.all(fontes.map((f) => document.fonts.load(`40px "${f}"`).catch(() => null)))
}

export async function exportarPng(modelo, desenho, lado, pers, largura = 640) {
  const area = areaDoModelo(modelo)
  const objetos = desenho?.[lado] || []
  await garantirFontes(objetos)
  const escala = largura / LARGURA
  const div = document.createElement('div')
  const stage = new Konva.Stage({ container: div, width: LARGURA * escala, height: ALTURA * escala, scaleX: escala, scaleY: escala })
  const camada = new Konva.Layer()
  stage.add(camada)
  camada.add(new Konva.Rect({ x: 0, y: 0, width: LARGURA, height: ALTURA, fill: '#f8f3ec' }))
  const fundo = await carregarImagem(fundoSrc(modelo, lado))
  if (fundo) camada.add(new Konva.Image({ image: fundo, x: 0, y: 0, width: LARGURA, height: ALTURA }))
  const a = areaEmPixels(area)
  const grupo = new Konva.Group({ clipX: a.x, clipY: a.y, clipWidth: a.w, clipHeight: a.h })
  camada.add(grupo)
  for (const obj of objetos) {
    const at = atributos(obj, area, pers, desenho?.cor)
    if (at.forma === 'texto') grupo.add(new Konva.Text(at))
    else if (at.forma === 'textpath') grupo.add(new Konva.TextPath(at))
    else {
      const img = await carregarImagem(srcObjeto(obj, pers, desenho?.cor))
      if (img) grupo.add(new Konva.Image({ ...at, image: img }))
    }
  }
  camada.draw()
  const url = stage.toDataURL({ mimeType: 'image/jpeg', quality: 0.86 })
  stage.destroy()
  return url
}
