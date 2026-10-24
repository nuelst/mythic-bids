# Mythic Bids — Web

Frontend da casa de leilões. Cliente da [Auction API](../backend/README.md). Visão do projeto e contas de demo: [README da raiz](../README.md). Uso de IA: [USO-DE-IA.md](../USO-DE-IA.md).

**Em produção:** https://mythicbids.vercel.app/  
**API:** https://api-mythicbids.onrender.com

## Requisitos

- Node.js 24 e pnpm 10
- A API a correr (local em `http://localhost:3000` ou a de produção)

## Como correr

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:3000
pnpm install
pnpm dev               # http://localhost:5173
```

O `VITE_API_URL` é lido no **build**. Mudar o `.env` depois de `pnpm build` não altera o cliente.

| Script | O que faz |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento com SSR |
| `pnpm build` / `pnpm start` | Build de produção e servidor Node |
| `pnpm typecheck` | Compila o i18n, gera as rotas e corre `tsc --noEmit` |
| `pnpm lint` / `pnpm format` | ESLint e Prettier |
| `pnpm test` | Vitest + Testing Library |
| `pnpm test:e2e` | Playwright (API mock local na :3999, dois browsers) |
| `pnpm api:types` | Regenera `src/shared/api/schema.d.ts` a partir do `/docs-json` |

Com Docker, o serviço `web` do [compose da raiz](../docker-compose.yml) publica em http://localhost:5173 e aponta a API para `http://localhost:3000` (o contentor resolve `localhost` à máquina via `extra_hosts`).

## Stack e estrutura

TanStack Start (React 19, SSR por rota) · TanStack Query · openapi-fetch · Paraglide (pt/en) · Tailwind v4 + shadcn/ui · React Hook Form + Zod.

```
src/
  routes/     rotas finas (ligam a página da feature)
  app/        providers, layout, query client, SSE privado
  shared/     design system, cliente HTTP, i18n, auth, tema
  features/   uma pasta por ecrã: api/ → view-models/ → components/ → pages/
```

As features não importam umas das outras. As views não fazem fetch.

### Rotas

| Rota | Acesso | SSR |
|---|---|---|
| `/` | público — vitrine (`phase`, `q`, `rarity`, `page`) | sim |
| `/lots/$lotId` | público; mais detalhe se for licitante | não |
| `/login`, `/register` | público | não |
| `/wallet` | licitante | não |
| `/me/bids` | licitante | não |
| `/seller`, `/seller/new` | leiloeiro | não |
| `/receipts/$token` | público (meta OG) | sim |
| `/audit/$lotId` | público | sim |
| `/design` | só em desenvolvimento | — |

Idioma: cookie `PARAGLIDE_LOCALE`, depois `Accept-Language`, depois `pt`. Tema: claro ou escuro, cookie `theme`.

## Decisões

- **Cliente HTTP:** tipos gerados do OpenAPI; o middleware põe o Bearer, o `Accept-Language` e transforma erros em `ApiError { code }`.
- **Idempotência:** uma `Idempotency-Key` por submissão de lance ou depósito; a mesma key é reutilizada no retry.
- **Optimistic updates:** lance, depósito e cancelamento atualizam a cache já; o SSE confirma ou o `onError` faz rollback.
- **Tempo real:** `EventSource` no lote (`/lots/:id/events`) e no utilizador (`/me/events?token=`). Ao (re)ligar, o cliente volta a pedir o GET — o stream só manda eventos novos.
- **Formulários:** Zod alinhado com a API; `onTouched`; o botão só desativa enquanto submete. Erros de campo (`EMAIL_TAKEN`, `BELOW_MINIMUM`, `INVALID_SCHEDULE`, datas no passado) ficam no input; o resto vai a toast.
- **Design:** identidade Arcano (violeta, dourado, off-white — sem branco puro). Contraste AA. `cursor: pointer` nos controlos. `prefers-reduced-motion` desliga as animações.

## Testes

```bash
pnpm test        # regras de dinheiro, debounce, schemas, view-models
pnpm test:e2e    # login → lance → superado (dois contextos) → fecho → comprovante
```

O Playwright não bate na API real (CORS e cold start). Sobe um mock em `:3999`.

## Deploy (Vercel)

1. Projeto na Vercel com root `frontend`.
2. Variável `VITE_API_URL=https://api-mythicbids.onrender.com` — tem de existir **no build**.
3. A origem `https://mythicbids.vercel.app` (e previews, se quiseres) entra no `CORS_ORIGIN` do Render, separada por vírgula.

## Comportamentos a ter em conta

- **Cold start da API:** o primeiro pedido após o Render dormir pode levar ~1 min; a vitrine e a sala falham até a API responder.
- **Relógio:** a contagem usa o `serverTime` da sala, não o relógio do browser.
- **Extensões de tradução:** o Chrome Translate parte as strings (textos colados). Vale a pena testar com a extensão desligada.
- **Leiloeiro:** não vê depósito nem formulário de lance.
- **Start vazio:** o lote começa já; o fim tem de ser depois do início e não pode estar no passado.
