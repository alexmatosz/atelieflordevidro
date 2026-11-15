import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MODO_DEMO } from '../../lib/db'
import { useApp } from '../../lib/app'
import { mascaraFone } from '../../lib/format'
import { Campo } from '../../components/ui'

export default function Entrar() {
  const [busca] = useSearchParams()
  const voltar = busca.get('voltar') || '/minha-conta'
  const nav = useNavigate()
  const { usuario, entrar, cadastrar, entrarDemo, notificar } = useApp()
  const [modo, setModo] = useState('entrar')
  const [f, setF] = useState({ nome: '', email: '', senha: '', whatsapp: '' })
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (usuario) nav(usuario.papel === 'admin' && voltar === '/minha-conta' ? '/admin' : voltar, { replace: true })
  }, [usuario, voltar, nav])

  const set = (c, m) => (e) => setF({ ...f, [c]: m ? m(e.target.value) : e.target.value })

  const enviar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    try {
      if (MODO_DEMO) entrarDemo({ nome: f.nome, email: f.email, whatsapp: f.whatsapp, papel: 'cliente' })
      else if (modo === 'entrar') await entrar(f.email, f.senha)
      else {
        const r = await cadastrar(f)
        if (r === 'confirmar') notificar('Enviamos um e-mail para confirmar sua conta.')
      }
    } catch (err) {
      notificar(err.message, 'erro')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-center text-3xl">{MODO_DEMO ? 'Entrar' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}</h1>
      <p className="mt-2 text-center text-sm text-cinza">Para acompanhar pedidos e as artes que você mandou para análise.</p>
      {!MODO_DEMO && (
        <div className="mx-auto mt-6 flex w-fit rounded-full bg-areia p-1">
          {[
            ['entrar', 'Já tenho conta'],
            ['cadastrar', 'Criar conta'],
          ].map(([m, n]) => (
            <button key={m} onClick={() => setModo(m)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${modo === m ? 'bg-white text-terracota shadow-sm' : 'text-argila'}`}>
              {n}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={enviar} className="cartao mt-6 space-y-4 p-6">
        {(MODO_DEMO || modo === 'cadastrar') && (
          <Campo rotulo="Nome">
            <input className="campo" required autoComplete="name" value={f.nome} onChange={set('nome')} />
          </Campo>
        )}
        <Campo rotulo="E-mail">
          <input className="campo" type="email" required autoComplete="email" value={f.email} onChange={set('email')} />
        </Campo>
        {(MODO_DEMO || modo === 'cadastrar') && (
          <Campo rotulo="WhatsApp">
            <input className="campo" inputMode="tel" autoComplete="tel" value={f.whatsapp} onChange={set('whatsapp', mascaraFone)} placeholder="(11) 99999-9999" />
          </Campo>
        )}
        {!MODO_DEMO && (
          <Campo rotulo="Senha">
            <input className="campo" type="password" required minLength={6} autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'} value={f.senha} onChange={set('senha')} />
          </Campo>
        )}
        <button className="btn-primario w-full" disabled={enviando}>
          {enviando ? 'Aguarde…' : modo === 'entrar' || MODO_DEMO ? 'Entrar' : 'Criar conta'}
        </button>
      </form>
      {MODO_DEMO && (
        <div className="mt-6 rounded-2xl border border-dashed border-linho p-4 text-center text-sm">
          <p className="text-cinza">Demonstração: veja o painel do ateliê.</p>
          <button className="btn-secundario mt-3" onClick={() => entrarDemo({ nome: 'Ateliê', email: 'vendedor@demo', papel: 'admin' })}>
            Entrar como vendedor
          </button>
        </div>
      )}
    </div>
  )
}
