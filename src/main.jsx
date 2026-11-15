import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { ProvedorApp } from './lib/app'
import { LayoutLoja } from './components/Layout'
import { Carregando } from './components/ui'
import Inicio from './pages/loja/Inicio'
import Catalogo from './pages/loja/Catalogo'
import ModeloPagina from './pages/loja/Modelo'
import Carrinho from './pages/loja/Carrinho'
import Kit from './pages/loja/Kit'
import Presentes from './pages/loja/Presentes'
import Galeria from './pages/loja/Galeria'
import Corporativo from './pages/loja/Corporativo'
import Datas from './pages/loja/Datas'
import Sobre from './pages/loja/Sobre'
const Painel = lazy(() => import('./pages/admin/Painel'))
const Modelos = lazy(() => import('./pages/admin/Modelos'))
const ModeloForm = lazy(() => import('./pages/admin/ModeloForm'))
const Artes = lazy(() => import('./pages/admin/Artes'))
const ArteForm = lazy(() => import('./pages/admin/ArteForm'))
const Elementos = lazy(() => import('./pages/admin/Elementos'))
const Pedidos = lazy(() => import('./pages/admin/Pedidos'))
const Kits = lazy(() => import('./pages/admin/Kits'))
const GaleriaAdmin = lazy(() => import('./pages/admin/GaleriaAdmin'))
const CorporativoAdmin = lazy(() => import('./pages/admin/CorporativoAdmin'))
const DatasAdmin = lazy(() => import('./pages/admin/DatasAdmin'))
const Configuracoes = lazy(() => import('./pages/admin/Configuracoes'))

const LayoutAdmin = lazy(() => import('./components/Layout').then((m) => ({ default: m.LayoutAdmin })))
const CrieSuaArte = lazy(() => import('./pages/loja/CrieSuaArte'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProvedorApp>
      <HashRouter>
        <Suspense fallback={<Carregando />}>
          <Routes>
            <Route element={<LayoutLoja />}>
              <Route index element={<Inicio />} />
              <Route path="catalogo" element={<Catalogo />} />
              <Route path="modelo/:id" element={<ModeloPagina />} />
              <Route path="criar" element={<CrieSuaArte />} />
              <Route path="criar/:modeloId" element={<CrieSuaArte />} />
              <Route path="carrinho" element={<Carrinho />} />
              <Route path="kit" element={<Kit />} />
              <Route path="presentes" element={<Presentes />} />
              <Route path="presentes/:ocasiao" element={<Presentes />} />
              <Route path="feitos-por-clientes" element={<Galeria />} />
              <Route path="corporativo" element={<Corporativo />} />
              <Route path="datas" element={<Datas />} />
              <Route path="sobre" element={<Sobre />} />
              <Route path="*" element={<Inicio />} />
            </Route>
            <Route path="admin" element={<LayoutAdmin />}>
              <Route index element={<Painel />} />
              <Route path="modelos" element={<Modelos />} />
              <Route path="modelos/:id" element={<ModeloForm />} />
              <Route path="artes" element={<Artes />} />
              <Route path="artes/:id" element={<ArteForm />} />
              <Route path="elementos" element={<Elementos />} />
              <Route path="pedidos" element={<Pedidos />} />
              <Route path="kits" element={<Kits />} />
              <Route path="galeria" element={<GaleriaAdmin />} />
              <Route path="corporativo" element={<CorporativoAdmin />} />
              <Route path="datas" element={<DatasAdmin />} />
              <Route path="configuracoes" element={<Configuracoes />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </ProvedorApp>
  </StrictMode>
)
