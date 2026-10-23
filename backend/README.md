# Auction API

Backend da Casa de Leilões (NestJS + Prisma + PostgreSQL).

## Requisitos

- Node.js 24 e pnpm 10
- Docker (para o PostgreSQL)

## Configuração

```bash
cp .env.example .env
pnpm secrets          # gera JWT_SECRET, ALIAS_SECRET e AUDIT_PRIVATE_KEY para colar no .env
pnpm install
docker compose up -d db
pnpm db:migrate
pnpm start:dev
```

- API: http://localhost:3000
- Swagger: http://localhost:3000/docs
- Health check: http://localhost:3000/health

## Docker

Na raiz do repositório:

```bash
docker compose up -d --build
```

O container da API aplica as migrations ao arrancar.
