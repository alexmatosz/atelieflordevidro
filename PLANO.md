# Atelier Flor de Vidro — o que fazer

Site de venda de copos, xícaras, taças e garrafas com pintura feita à mão.
O cliente escolhe um MODELO de peça e uma ARTE, ou cria a própria arte e envia para ANÁLISE do artesão.
Atendimento pelo WhatsApp.

Site publicado: https://alexmatosz.github.io/atelieflordevidro/
Código: https://github.com/alexmatosz/atelieflordevidro

## Ordem de construção

- [x] 1. Banco de dados (Supabase) — `supabase/schema.sql`
- [x] 2. Painel do vendedor (admin)
- [x] 3. Vitrine do cliente
- [x] 4. Editor "Crie sua arte"
- [ ] 5. Ligar no Supabase real (criar projeto, rodar o SQL, colocar as chaves)
- [ ] 6. Pagamento e frete: por enquanto combinados no WhatsApp
- [ ] 7. Fila de análise de arte (código guardado no histórico do git, desligada por enquanto)
- [ ] 9. Fotos reais das peças no lugar das ilustrações

## Mudanças de 15/11/2026 (pedido da dona)

- [x] Visual novo a partir da logo e do Instagram: rosa antigo, verde-oliva, dourado, molduras em arco, fontes Gilda Display, Jost e Allura
- [x] Biblioteca de desenhos da moda: limão siciliano, fatia de limão, cerejas, morango, tulipas, cosmos, girassol, margarida, lavanda, florzinhas com pontinhos dourados, lacinho, corações, borboleta, poá, xadrez vichy, folhagens
- [x] Desenhos editáveis no painel (nome, grupo, cor padrão, ocultar, subir PNG novo)
- [x] Categorias editáveis no painel e formatos novos de peça: pires, jarra, pote com tampa
- [x] Pedido fechado pelo WhatsApp: a sacola monta a mensagem com tudo (peça, arte, nome, frase, data, cor, desenhos usados, observações, quantidade, valores) e um código AFV-XXXX
- [x] Botão para mandar as imagens das artes (compartilhar no celular ou baixar no computador)
- [x] "Crie sua arte" vai direto para a sacola, com valor "a partir de" e o final combinado no WhatsApp
- [x] Comprador não tem mais login. O painel fica escondido em /#/admin, com login próprio
- [x] No painel, "Registrar pedido": cola a mensagem do WhatsApp e o pedido entra no kanban
- [x] Pedidos de empresas também saem pelo WhatsApp

## Como o site funciona hoje

Sem as chaves do Supabase, o site roda em **modo demonstração**: tudo fica salvo só no navegador
de quem está olhando (localStorage), com um catálogo de exemplo. Serve para ver e testar o fluxo inteiro.
Com as chaves, passa a usar o banco, o login e o armazenamento de imagens do Supabase.

Painel do ateliê: abrir https://alexmatosz.github.io/atelieflordevidro/#/admin (não aparece para as clientes).

## ÁREA DO CLIENTE

1. Página inicial
   - [x] Banner destacando que a pintura é feita à mão, com fotos de peças prontas
   - [x] Categorias: Copos, Xícaras/Canecas, Taças, Garrafas
   - [x] Seções "Mais vendidos" e "Ideias para presente" (aniversário, casamento, padrinhos, corporativo)
2. Catálogo de modelos
   - [x] Só modelos marcados como disponíveis
   - [x] Filtros: categoria, capacidade, material, faixa de preço
   - [x] Fotos, medidas, capacidade, preço base, prazo médio
3. Escolha da pintura
   - [x] Galeria de artes prontas com filtro por tema
   - [x] Pré-visualização da arte no modelo, frente e verso
   - [x] Personalização: nome, frase, data, cor predominante
4. Editor "Crie sua arte"
   - [x] Texto (fontes artesanais, cor, tamanho, curvatura)
   - [x] Elementos da biblioteca do vendedor
   - [x] Upload de imagem de referência
   - [x] Observações para o artesão
   - [x] Área pintável visível no mockup
   - [x] "Enviar para análise" com mockup, referências, quantidade e data desejada
   - [x] Status: Em análise → Aprovado (preço e prazo) → Ajuste sugerido → Recusado (motivo)
   - [x] Aprovada vira pedido com um clique
   - [x] Aviso de variações da pintura à mão
5. WhatsApp
   - [x] Botão flutuante em todas as páginas
   - [x] Mensagem pré-preenchida com o contexto da página
   - [x] Número configurável no painel
6. Carrinho e checkout
   - [x] Quantidade com desconto progressivo
   - [x] Frete por CEP (regras do painel) — real fica para a etapa 7
   - [x] Pix e cartão — cobrança real fica para a etapa 6
   - [x] Prazo de produção e de entrega separados

## PAINEL DO VENDEDOR

1. Modelos
   - [x] CRUD completo
   - [x] Upload do mockup PNG transparente e marcação da área pintável
   - [x] Ativar/Desativar no site
   - [x] Estoque de peças em branco com alerta de estoque baixo
2. Artes
   - [x] CRUD com tema, fotos, acréscimo de preço e modelos que aceitam
   - [x] Biblioteca de elementos do editor
3. Fila de análise
   - [x] Mockup, referências e observações
   - [x] Aprovar (preço e prazo), Sugerir ajuste (comentário/imagem), Recusar (motivo)
   - [x] Aviso ao cliente: link de WhatsApp pronto; e-mail automático na etapa 8
4. Pedidos
   - [x] Kanban: Novo → Em pintura → Secagem/Cura → Embalagem → Enviado
   - [x] Foto da peça pronta enviada ao cliente antes do envio
5. Configurações
   - [x] WhatsApp, dados da loja, frete, descontos por quantidade, textos institucionais

## INOVAÇÕES

- [x] Monte um kit (mesma arte em peças diferentes, preço de kit)
- [x] Galeria "Feitos por clientes" (só com autorização)
- [x] Pedidos corporativos (logo + quantidade mínima)
- [x] Selo "Peça única" com número de série
- [x] Calendário de datas comemorativas com sugestões de arte

## Técnico

- React + Tailwind CSS (Vite), editor com Konva
- Supabase: auth, banco e storage (bucket `imagens`)
- Perfis: cliente e admin (`perfis.papel`)
- Publicação: GitHub Pages, automático a cada push na `main`

## Para ligar o Supabase (etapa 5)

1. Criar projeto em https://supabase.com
2. SQL Editor → colar e rodar `supabase/schema.sql`
3. No GitHub: Settings → Secrets and variables → Actions → criar
   `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
4. Criar sua conta no site e, no SQL Editor:
   `update perfis set papel = 'admin' where email = 'SEU_EMAIL';`
