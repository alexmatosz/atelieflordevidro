# Ateliê Flor de Vidro

Loja de copos, canecas, taças e garrafas pintados à mão, com editor “Crie sua arte” e painel do vendedor.

- Site: https://alexmatosz.github.io/atelieflordevidro/
- O que já foi feito e o que falta: [PLANO.md](PLANO.md)
- Banco de dados (Supabase): [supabase/schema.sql](supabase/schema.sql)

## Rodar no computador

```bash
npm install
npm run dev
```

Sem as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, o site roda em modo demonstração
(dados salvos só no navegador). Na tela “Entrar” há o botão “Entrar como vendedor” para ver o painel.

## Publicação

Cada push na branch `main` publica o site no GitHub Pages (`.github/workflows/deploy.yml`).
