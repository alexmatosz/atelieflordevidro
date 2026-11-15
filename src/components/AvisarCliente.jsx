import { Mail, MessageCircle } from 'lucide-react'
import { linkEmail, linkWhatsApp } from '../lib/regras'

export default function AvisarCliente({ whatsapp, email, assunto, texto, titulo = 'Avise o cliente' }) {
  if (!whatsapp && !email) return null
  return (
    <div className="rounded-2xl border border-salvia/40 bg-salvia-clara/50 p-4">
      <p className="text-sm font-semibold">{titulo}</p>
      <p className="mt-1 whitespace-pre-line text-xs text-cinza">{texto}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {whatsapp && (
          <a href={linkWhatsApp(whatsapp, texto)} target="_blank" rel="noreferrer" className="btn !bg-[#1f9d55] !py-2 text-white">
            <MessageCircle className="size-4" /> Enviar no WhatsApp
          </a>
        )}
        {email && (
          <a href={linkEmail(email, assunto, texto)} className="btn-secundario !py-2">
            <Mail className="size-4" /> Enviar e-mail
          </a>
        )}
      </div>
    </div>
  )
}
