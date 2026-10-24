# Uso de IA

O enunciado pede para dizer onde e como a IA foi usada. Usei um assistente de programação no Cursor (Claude) no backend e no frontend. A responsabilidade pelo resultado é minha.

A arquitetura, a identidade visual, os detalhes de UI/UX e os testes manuais foram definidos e validados por mim. A IA serviu de par para acelerar a codificação.

## O que eu defini e validei

- o recorte do produto a partir do PDF (obrigatório e opcional);
- a arquitetura: monólito modular, regras puras testáveis, outbox, SSE em vez de WebSockets, dinheiro em cêntimos, hash chain + Ed25519, alias HMAC;
- a stack (NestJS + Prisma + PostgreSQL; TanStack Start + React 19; Paraglide; Vitest / Playwright);
- a identidade visual (Arcano: tokens, tipografia, espaçamento) e o comportamento das ecrãs;
- o critério de “pronto”: typecheck, lint, testes e o fluxo do seed em dois browsers.

## O que a IA fez

Escreveu código sob essa direção: módulos da API, migrations, seed, cliente Scryfall, políticas de lance, worker de fecho, páginas do front, formulários, i18n, testes e o texto técnico dos READMEs.


## O que eu revi

Percorri o fluxo no browser — dois licitantes na mesma sala, depósito, cancelar com estorno, comprovante e auditoria — e li com mais cuidado o que mexe em dinheiro ou confiança: lances concorrentes, saldo comprometido, hash chain, os cinco recusos de lance, o seed e o CORS.
