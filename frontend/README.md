# Mythic Bids — Web

Frontend da Casa de Leilões (TanStack Start + React 19), cliente da [Auction API](../backend/README.md).

## Requisitos

- Node.js 24 e pnpm 10
- A API a correr (local em `http://localhost:3000` ou a de produção)

## Como correr

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:3000
pnpm install
pnpm dev               # http://localhost:5173
```

| Script                      | O que faz                                                       |
| --------------------------- | --------------------------------------------------------------- |
| `pnpm dev`                  | Servidor de desenvolvimento com SSR                             |
| `pnpm build` / `pnpm start` | Build de produção e servidor Node                               |
| `pnpm typecheck`            | Compila as mensagens i18n, gera as rotas e corre `tsc --noEmit` |
| `pnpm lint` / `pnpm format` | ESLint e Prettier                                               |
| `pnpm test`                 | Testes (Vitest + Testing Library)                               |

## Estrutura

```
src/
  routes/     rotas (finas: ligam a página da feature)
  app/        providers, layout, query client
  shared/     design system (ui), api, i18n, auth, theme, utilitários
  features/   uma pasta por feature: api/ (Model), view-models/, components/ (View), pages/
```
