import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { CreditCard, QrCode } from 'lucide-react'
import { db, MODO_DEMO } from '../../lib/db'
import { useApp } from '../../lib/app'
import { mascaraCep, mascaraFone, somenteDigitos } from '../../lib/format'
import { resumoCarrinho } from '../../lib/regras'
import { AvisoArtesanal, Campo } from '../../components/ui'
import { Resumo } from './Carrinho'

export default function Checkout() {
  const { carrinho, config, usuario, carregandoUsuario, entrarDemo, limparCarrinho, notificar } = useApp()
  const nav = useNavigate()
  const [f, setF] = useState(() => {
    let cep = ''
    try {
      cep = localStorage.getItem('afv:cep') || ''
    } catch {
      cep = ''
    }
    return { nome: '', email: '', whatsapp: '', cep, rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', pagamento: 'pix', autoriza_galeria: false }
  })
  const [enviando, setEnviando] = useState(false)
  const finalizado = useRef(false)

  useEffect(() => {
    if (usuario) setF((x) => ({ ...x, nome: x.nome || usuario.nome || '', email: x.email || usuario.email || '', whatsapp: x.whatsapp || usuario.whatsapp || '' }))
  }, [usuario])

  useEffect(() => {
    const cep = somenteDigitos(f.cep)
    if (cep.length !== 8) return
    let vivo = true
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then((r) => r.json())
      .then((d) => {
        if (vivo && !d.erro) setF((x) => ({ ...x, rua: x.rua || d.logradouro, bairro: x.bairro || d.bairro, cidade: d.localidade, uf: d.uf }))
      })
      .catch(() => {})
    return () => {
      vivo = false
    }
  }, [f.cep])

  if (!MODO_DEMO && !carregandoUsuario && !usuario) return <Navigate to="/entrar?voltar=/checkout" replace />
  if (!carrinho.length && !finalizado.current) return <Navigate to="/carrinho" replace />
  if (!carrinho.length) return null

  const r = resumoCarrinho(carrinho, config, f.cep)
  const set = (campo, mascara) => (e) => setF({ ...f, [campo]: e.target.type === 'checkbox' ? e.target.checked : mascara ? mascara(e.target.value) : e.target.value })

  const finalizar = async (e) => {
    e.preventDefault()
    if (!r.frete) return notificar('Informe um CEP válido.', 'erro')
    setEnviando(true)
    try {
      const u = usuario || entrarDemo({ nome: f.nome, email: f.email, whatsapp: f.whatsapp, papel: 'cliente' })
      const itens = carrinho.map((i) => ({
        modelo_id: i.modelo_id,
        arte_id: i.arte_id || null,
        solicitacao_id: i.solicitacao_id || null,
        kit_id: i.kit_id || null,
        descricao: i.descricao,
        personalizacao: i.personalizacao || {},
        mockup: i.mockup || null,
        quantidade: i.quantidade,
      }))
      const id = await db.criarPedido(
        itens,
        {
          nome: f.nome,
          email: f.email,
          whatsapp: f.whatsapp,
          cep: f.cep,
          endereco: { rua: f.rua, numero: f.numero, complemento: f.complemento, bairro: f.bairro, cidade: f.cidade, uf: f.uf },
          pagamento: f.pagamento,
          autoriza_galeria: f.autoriza_galeria,
        },
        u
      )
      finalizado.current = true
      nav(`/pedido/${id}?novo=1`)
      limparCarrinho()
    } catch (err) {
      notificar(err.message, 'erro')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={finalizar} className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/carrinho" className="text-sm font-semibold text-terracota">
        ← Carrinho
      </Link>
      <h1 className="mt-2 text-3xl sm:text-4xl">Finalizar pedido</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="cartao grid gap-4 p-5 sm:grid-cols-2">
            <h2 className="text-lg sm:col-span-2">Seus dados</h2>
            <Campo rotulo="Nome completo" className="sm:col-span-2">
              <input className="campo" required autoComplete="name" value={f.nome} onChange={set('nome')} />
            </Campo>
            <Campo rotulo="E-mail">
              <input className="campo" type="email" required autoComplete="email" value={f.email} onChange={set('email')} />
            </Campo>
            <Campo rotulo="WhatsApp" dica="Mandamos a foto da peça pronta por aqui.">
              <input className="campo" required inputMode="tel" autoComplete="tel" value={f.whatsapp} onChange={set('whatsapp', mascaraFone)} placeholder="(11) 99999-9999" />
            </Campo>
          </section>

          <section className="cartao grid gap-4 p-5 sm:grid-cols-6">
            <h2 className="text-lg sm:col-span-6">Entrega</h2>
            <Campo rotulo="CEP" className="sm:col-span-2">
              <input className="campo" required inputMode="numeric" autoComplete="postal-code" value={f.cep} onChange={set('cep', mascaraCep)} />
            </Campo>
            <Campo rotulo="Rua" className="sm:col-span-4">
              <input className="campo" required autoComplete="address-line1" value={f.rua} onChange={set('rua')} />
            </Campo>
            <Campo rotulo="Número" className="sm:col-span-2">
              <input className="campo" required value={f.numero} onChange={set('numero')} />
            </Campo>
            <Campo rotulo="Complemento" className="sm:col-span-4">
              <input className="campo" value={f.complemento} onChange={set('complemento')} />
            </Campo>
            <Campo rotulo="Bairro" className="sm:col-span-2">
              <input className="campo" required value={f.bairro} onChange={set('bairro')} />
            </Campo>
            <Campo rotulo="Cidade" className="sm:col-span-3">
              <input className="campo" required value={f.cidade} onChange={set('cidade')} />
            </Campo>
            <Campo rotulo="UF" className="sm:col-span-1">
              <input className="campo" required maxLength={2} value={f.uf} onChange={(e) => setF({ ...f, uf: e.target.value.toUpperCase() })} />
            </Campo>
          </section>

          <section className="cartao space-y-3 p-5">
            <h2 className="text-lg">Pagamento</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { id: 'pix', nome: 'Pix', texto: 'A pintura começa assim que o pagamento cai.', icone: QrCode },
                { id: 'cartao', nome: 'Cartão de crédito', texto: 'Enviamos o link de pagamento pelo WhatsApp.', icone: CreditCard },
              ].map((p) => (
                <label key={p.id} className={`flex cursor-pointer gap-3 rounded-2xl border-2 p-4 ${f.pagamento === p.id ? 'border-terracota bg-terracota/5' : 'border-linho bg-white'}`}>
                  <input type="radio" name="pagamento" value={p.id} checked={f.pagamento === p.id} onChange={set('pagamento')} className="sr-only" />
                  <p.icone className="size-6 shrink-0 text-terracota" />
                  <span>
                    <span className="block font-semibold">{p.nome}</span>
                    <span className="text-xs text-cinza">{p.texto}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={f.autoriza_galeria} onChange={set('autoriza_galeria')} className="mt-0.5 size-4 accent-terracota" />
            <span>Autorizo mostrar a foto da minha peça na galeria “Feitos por clientes” (sem dados pessoais além do primeiro nome).</span>
          </label>
          <AvisoArtesanal />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Resumo r={r}>
            <button className="btn-primario mt-3 w-full !py-3 text-base" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Confirmar pedido'}
            </button>
          </Resumo>
        </div>
      </div>
    </form>
  )
}
