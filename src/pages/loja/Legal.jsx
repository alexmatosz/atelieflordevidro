import { Link } from 'react-router-dom'
import { useApp } from '../../lib/app'
import { mascaraFone } from '../../lib/format'
import { linkWhatsApp } from '../../lib/regras'

const ATUALIZADO = '15 de novembro de 2026'

function Pagina({ titulo, sub, children }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-[32px] sm:text-4xl">{titulo}</h1>
      {sub && <p className="mt-2 text-cinza">{sub}</p>}
      <div className="mt-8 space-y-8 text-[16px] leading-relaxed text-grafite [&_h2]:mb-2 [&_h2]:text-[22px] [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_p+p]:mt-3 [&_ul]:mt-2 [&_ul]:space-y-1.5">{children}</div>
      <p className="mt-10 border-t border-borda pt-4 text-sm text-cinza">Última atualização: {ATUALIZADO}.</p>
    </div>
  )
}

function useContato() {
  const { config } = useApp()
  const l = config.loja || {}
  const fone = mascaraFone(String(l.whatsapp || '').replace(/^55/, ''))
  const whats = (
    <a className="text-rosa underline decoration-ouro underline-offset-4" href={linkWhatsApp(l.whatsapp, 'Olá! Quero falar sobre meus dados / minha compra.')} target="_blank" rel="noreferrer">
      WhatsApp {fone}
    </a>
  )
  const quem = [l.razao_social || l.nome, l.cnpj && `CNPJ ${l.cnpj}`, l.endereco || l.cidade].filter(Boolean).join(', ')
  return { l, whats, quem }
}

export function Trocas() {
  const { whats, quem } = useContato()
  return (
    <Pagina titulo="Trocas e devoluções" sub="Cada peça é pintada à mão e embalada com cuidado. Se algo não sair como você esperava, a gente resolve.">
      <section>
        <h2>Desistir da compra</h2>
        <p>Como a compra é feita pela internet, você pode desistir em até 7 dias, contados do dia em que recebeu a peça (Código de Defesa do Consumidor, art. 49).</p>
        <p>Avise pelo {whats}. Devolvemos todo o valor pago, frete incluído, pelo mesmo meio do pagamento, assim que a peça voltar para o ateliê.</p>
      </section>
      <section>
        <h2>Peça quebrada ou com defeito</h2>
        <p>Se a peça chegar quebrada, trincada ou com a pintura diferente do que combinamos, mande uma foto pelo WhatsApp em até 90 dias do recebimento (CDC, art. 26). Você escolhe: pintamos outra igual, sem custo, ou devolvemos o dinheiro.</p>
      </section>
      <section>
        <h2>O que não é defeito</h2>
        <p>Pequenas diferenças de traço, tom ou posição dos desenhos fazem parte da pintura à mão e deixam cada peça única. A pré-visualização do site é uma ilustração: ela mostra a ideia da arte, e a peça real é pintada a partir dela.</p>
      </section>
      <section>
        <h2>Antes de pintar e antes de enviar</h2>
        <ul>
          <li>Conferimos com você pelo WhatsApp a peça, a arte, os nomes, as datas e as cores.</li>
          <li>Mandamos uma foto da peça pronta antes de despachar.</li>
          <li>O prazo de pintura aparece em cada peça e conta em dias úteis. O prazo do frete começa depois que a peça fica pronta.</li>
        </ul>
      </section>
      <section>
        <h2>Quem vende</h2>
        <p>{quem}. Atendimento pelo {whats}.</p>
      </section>
    </Pagina>
  )
}

export function Privacidade() {
  const { l, whats, quem } = useContato()
  return (
    <Pagina titulo="Privacidade" sub="Como o ateliê usa os seus dados, de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).">
      <section>
        <h2>Quem cuida dos seus dados</h2>
        <p>
          {quem}. Para qualquer assunto sobre seus dados, fale pelo {whats}
          {l.email && (
            <>
              {' '}ou pelo e-mail{' '}
              <a className="text-rosa underline decoration-ouro underline-offset-4" href={`mailto:${l.email}`}>
                {l.email}
              </a>
            </>
          )}
          .
        </p>
      </section>
      <section>
        <h2>O que coletamos e para quê</h2>
        <p>O site não tem cadastro nem senha para quem compra. Pedimos apenas o necessário para pintar e entregar a sua peça:</p>
        <ul>
          <li>nome, cidade, CEP e a data em que você precisa receber, para combinar o pedido e o frete;</li>
          <li>nomes, frases, datas e imagens de referência que você coloca na arte, para pintar a peça;</li>
          <li>o recado que você deixa para a pintora.</li>
        </ul>
        <p>Usamos esses dados para fazer o seu pedido, o que a lei chama de execução de contrato (LGPD, art. 7º, V). Os dados do pedido ficam guardados pelo tempo exigido pelas regras fiscais e de defesa do consumidor (art. 7º, II).</p>
      </section>
      <section>
        <h2>Onde ficam guardados</h2>
        <p>Enquanto você monta a sacola, os dados ficam só no seu navegador, para você não precisar digitar de novo. Eles só chegam ao ateliê quando você toca em “Finalizar pedido pelo WhatsApp” e envia a mensagem.</p>
        <p>O site não usa cookies de propaganda nem ferramentas de rastreamento.</p>
      </section>
      <section>
        <h2>Com quem compartilhamos</h2>
        <ul>
          <li>WhatsApp (Meta), por onde a conversa e o pedido acontecem. A Meta pode guardar dados fora do Brasil (LGPD, art. 33).</li>
          <li>Correios ou transportadora, com nome e endereço, só para a entrega.</li>
          <li>GitHub, que hospeda o site, e Google Fonts, que entrega as letras do site. Esses serviços recebem dados técnicos de acesso, como o endereço IP.</li>
        </ul>
        <p>Não vendemos nem emprestamos seus dados para ninguém.</p>
      </section>
      <section>
        <h2>Fotos na galeria de clientes</h2>
        <p>Só publicamos a foto da sua peça ou o seu nome com a sua autorização (art. 7º, I). Você pode pedir para tirar a qualquer momento.</p>
      </section>
      <section>
        <h2>Seus direitos</h2>
        <p>Você pode pedir para saber quais dados temos, corrigir, apagar o que não for obrigatório guardar, receber uma cópia ou retirar uma autorização (LGPD, art. 18). Respondemos em até 15 dias. Para apagar o que ficou no seu navegador, basta limpar os dados do site nas configurações do navegador.</p>
      </section>
      <p className="text-sm text-cinza">
        Veja também <Link to="/trocas" className="text-rosa underline">trocas e devoluções</Link>.
      </p>
    </Pagina>
  )
}
