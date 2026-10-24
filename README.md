# Mythic Bids

Teste técnico **Elite Dev na Verzel** (2026-2): uma casa de leilões online, do jeito que faria no dia a dia de um time.

O leiloeiro publica lotes a partir de cartas de **Magic: The Gathering** ([Scryfall](https://scryfall.com/docs/api)). Os licitantes depositam saldo simulado e dão lances ao vivo. Qualquer pessoa, sem login, pode abrir o comprovante e auditar o histórico — e ver se alguém mexeu nos dados.

Um só repositório, dois processos: [Auction API](./backend/README.md) e [Web](./frontend/README.md).

## Autor

Manuel · [GitHub](https://github.com/nuelst) · [LinkedIn](https://www.linkedin.com/in/nuelst/) · [manuelds@outlook.pt](mailto:manuelds@outlook.pt)

## Em produção

| | URL |
|---|---|
| Aplicação | https://mythicbids.vercel.app/ |
| API | https://api-mythicbids.onrender.com |
| Swagger | https://api-mythicbids.onrender.com/docs |
| Health | https://api-mythicbids.onrender.com/health |
| Repositório | https://github.com/nuelst/mythic-bids |

No plano gratuito o Render adormece a API após ~15 min sem pedidos. O primeiro acesso seguinte pode demorar cerca de um minuto; os lotes que tenham terminado entretanto são liquidados quando o serviço acorda.

## Contas de demonstração

Password de todos: `demo1234`.

| E-mail | Papel |
|---|---|
| `leiloeiro@demo.com` | Leiloeiro |
| `ana@demo.com` | Licitante (R$ 10.000) |
| `bruno@demo.com` | Licitante (R$ 10.000) |

O seed deixa lotes ao vivo (um de 30 dias, um que fecha em 5 minutos), agendados, encerrados com comprovante e um cancelado. Como percorrer: entra com a Ana e o Bruno em dois browsers, na mesma sala; os lances atualizam sem recarregar; o superado recebe um toast; no fecho há vencedor, comprovante e auditoria. No painel do leiloeiro pesquisa uma carta, publica um lote e cancela — se houver líder, o valor volta à carteira.

## O que o enunciado pede

**Obrigatório:** vitrine, painel do leiloeiro, sala ao vivo, carteira, meus arremates, comprovante partilhável, auditoria pública, mensagens para cada lance recusado, regras de lance, saldo comprometido, anti-sniping, liquidação, histórico à prova de adulteração, privacidade (alias, sem dados pessoais), a aplicação continua a funcionar se a API externa cair, deploy, README e dados de teste.

**Opcional (feito):** busca e filtro, cancelamento com estorno, Docker Compose, testes automatizados, dark mode.

Não faz parte do desafio — e não está no projeto — nota fiscal, revenda entre utilizadores, aplicação nativa nem recuperação de senha.

## Stack

| | |
|---|---|
| Web | TanStack Start (React 19), Tailwind v4, shadcn/ui, Paraglide (pt/en) |
| API | NestJS 12, Prisma 7, PostgreSQL 17, SSE |
| Tempo real | SSE + outbox transacional (sem WebSockets, sem Redis) |
| Dinheiro | inteiros em cêntimos |
| Auditoria | hash chain SHA-256 + Ed25519; alias HMAC por lote |

## Como correr localmente

Requisitos: Node.js 24, pnpm 10, Docker.

```bash
cp backend/.env.example backend/.env
cd backend && pnpm secrets    # cola JWT_SECRET, ALIAS_SECRET e AUDIT_PRIVATE_KEY no .env
cd ..
docker compose up -d --build
docker compose exec api node dist/seed/main.js
```

| Serviço | URL |
|---|---|
| Web | http://localhost:5173 |
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/docs |
| PostgreSQL | localhost:5440 |

O `VITE_API_URL` do contentor `web` fica gravado no build (`http://localhost:3000`). Para desenvolver o front à parte: `cd frontend && cp .env.example .env && pnpm install && pnpm dev`.

Passo a passo da API, do seed e das decisões: [backend/README.md](./backend/README.md).  
Passo a passo do front, rotas e design: [frontend/README.md](./frontend/README.md).

## Documentação

| Documento | Conteúdo |
|---|---|
| [backend/README.md](./backend/README.md) | API, seed, concorrência, auditoria, comportamentos inesperados |
| [frontend/README.md](./frontend/README.md) | Web, rotas, i18n, testes, deploy na Vercel |
| [USO-DE-IA.md](./USO-DE-IA.md) | Onde e como a IA entrou, o que foi revisto e o que foi ajustado |

O enunciado pede para contar o uso de IA no envio. Está no ficheiro acima, não escondido num comentário.
