import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { db } from '../../lib/db'
import { useDados } from '../../lib/app'
import { TEMAS, moeda } from '../../lib/format'
import { TituloPagina } from '../../components/Layout'
import { Carregando, Vazio } from '../../components/ui'
import { MiniaturaArte } from '../../components/Peca'

export default function Artes() {
  const [tema, setTema] = useState('')
  const [artes] = useDados(() => db.listar('artes', { ordem: 'nome' }))
  const lista = (artes || []).filter((a) => !tema || a.tema === tema)

  return (
    <div>
      <TituloPagina
        titulo="Artes prontas"
        sub="As pinturas que o cliente escolhe na vitrine."
        acao={
          <Link to="/admin/artes/nova" className="btn-primario">
            <Plus className="size-4" /> Nova arte
          </Link>
        }
      />
      <div className="rolagem-fina mb-4 flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setTema('')} className={`chip shrink-0 ${!tema ? 'chip-ativo' : ''}`}>
          Todas
        </button>
        {TEMAS.map((t) => (
          <button key={t} onClick={() => setTema(t)} className={`chip shrink-0 ${tema === t ? 'chip-ativo' : ''}`}>
            {t}
          </button>
        ))}
      </div>
      {!artes ? (
        <Carregando />
      ) : lista.length === 0 ? (
        <Vazio titulo="Nenhuma arte aqui" texto="Crie uma arte no editor e escolha em quais modelos ela pode ser pintada." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {lista.map((a) => (
            <Link key={a.id} to={`/admin/artes/${a.id}`} className={`cartao overflow-hidden transition hover:border-terracota ${a.ativo ? '' : 'opacity-60'}`}>
              <div className="aspect-[4/5] bg-areia/60 p-2">{a.fotos?.[0] ? <img src={a.fotos[0]} alt="" className="size-full rounded-xl object-cover" /> : <MiniaturaArte arte={a} />}</div>
              <div className="p-3">
                <p className="truncate font-semibold">{a.nome}</p>
                <p className="text-xs text-cinza">
                  {a.tema} · +{moeda(a.acrescimo)} {!a.ativo && '· inativa'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
