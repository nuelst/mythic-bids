# Auction API

Backend da Casa de Leilões online: o leiloeiro cria lotes a partir de cartas de **Magic: The Gathering** (API pública [Scryfall](https://scryfall.com/docs/api)), os licitantes depositam saldo simulado e dão lances ao vivo, e qualquer pessoa pode auditar o histórico de um lote sem login.

**Stack:** NestJS 12 · Prisma 7 · PostgreSQL 17 · SSE · Vitest

---

## Como correr

### Com Docker

```bash
cp backend/.env.example backend/.env
cd backend && pnpm secrets   # cola o resultado no backend/.env
cd .. && docker compose up -d --build
docker compose exec api node dist/seed/main.js
```

### Local

Requisitos: Node.js 24, pnpm 10 e Docker (para o PostgreSQL).

```bash
cd backend
cp .env.example .env
pnpm secrets              # gera JWT_SECRET, ALIAS_SECRET e AUDIT_PRIVATE_KEY para colar no .env
pnpm install
docker compose -f ../docker-compose.yml up -d db   # PostgreSQL em localhost:5440
pnpm db:deploy
pnpm seed
pnpm start:dev
```

| | URL |
|---|---|
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/docs |
| Health check | http://localhost:3000/health |

### Dados de teste

`pnpm seed` (ou `node dist/seed/main.js` no container) **apaga a base de dados** e cria um cenário completo. Pode ser corrido de novo a qualquer momento.

| Utilizador | Papel | Password |
|---|---|---|
| `leiloeiro@demo.com` | Leiloeiro | `demo1234` |
| `ana@demo.com` | Licitante (R$ 10.000) | `demo1234` |
| `bruno@demo.com` | Licitante (R$ 10.000) | `demo1234` |

Lotes criados pelo seed:
- **8 ao vivo:**
  - um com 4 lances e fim em **30 dias**, para continuar ao vivo quando a aplicação for avaliada;
  - um que **termina 5 minutos** depois do seed, para ver a contagem, o anti-sniping e o fecho.
- **2 agendados.**
- **2 encerrados:** um vendido, com comprovante, e um sem lances.
- **1 cancelado**, que não aparece na vitrine.

Os lances do seed passam pelo mesmo fluxo da API. A hash chain, o ledger e os comprovantes são reais e a auditoria de todos os lotes dá `intact: true`.

### Testes

```bash
pnpm test        # unitários: regras de lance, fases, anti-sniping, hash chain, mapper Scryfall
pnpm test:e2e    # e2e contra PostgreSQL real (cria a base auction_test automaticamente)
```

Os testes e2e cobrem:
- o fluxo completo (lance, superação, anti-sniping, fecho, comprovante, auditoria);
- a deteção de adulteração direta na BD;
- o cancelamento com estorno;
- 40 lances concorrentes;
- os retries idempotentes.

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Ligação ao PostgreSQL |
| `DIRECT_DATABASE_URL` | Opcional: ligação direta usada pelas migrations (quando `DATABASE_URL` passa por um pooler) |
| `PUBLIC_URL` | URL pública da API |
| `CORS_ORIGIN` | Origens do frontend, separadas por vírgula |
| `JWT_SECRET`, `JWT_TTL_SECONDS` | Assinatura e validade do token de acesso |
| `ALIAS_SECRET` | Segredo HMAC dos pseudónimos dos licitantes |
| `AUDIT_PRIVATE_KEY` | Chave privada Ed25519 (PKCS8 DER em base64) que assina o histórico |
| `SCRYFALL_URL` | API de cartas (por omissão `https://api.scryfall.com`) |

### Deploy (Render + Neon)

1. **Neon:** cria um projeto PostgreSQL 17 em **AWS US East 1 (N. Virginia)**, a mesma região do serviço no Render (`virginia`). Cada lance faz várias queries numa transação, por isso a API e a BD devem estar lado a lado. Copia as duas connection strings:
   - **pooled** (host com `-pooler`), que será o `DATABASE_URL`;
   - **direct**, que será o `DIRECT_DATABASE_URL`, usado pelas migrations.
2. **Segredos:** gera-os uma única vez com `pnpm secrets`.
3. **Render:** cria um *Blueprint* a partir do repositório. O `render.yaml` da raiz define o serviço Docker com health check em `/health`. Preenche as variáveis:
   - as duas URLs do Neon;
   - os três segredos;
   - `PUBLIC_URL` (URL do serviço no Render);
   - `CORS_ORIGIN` (URL do frontend; aceita várias, separadas por vírgula).
4. **Migrations:** são aplicadas automaticamente quando o container arranca.
5. **Seed:** o plano free não tem shell, por isso corre da tua máquina com as **mesmas** variáveis do Render:
   ```bash
   DATABASE_URL="<neon direct>" JWT_SECRET=... ALIAS_SECRET=... AUDIT_PRIVATE_KEY=... pnpm seed
   ```
   Com segredos diferentes, a auditoria marcaria os lances do seed como adulterados, porque estariam assinados com outra chave.

No plano free, o Render adormece o serviço após 15 min sem pedidos, e o primeiro pedido seguinte demora ~1 min. Os lotes que terminarem enquanto o serviço dorme são liquidados logo que acorda.

---

## API

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/register`, `/auth/login` | público | Registo (papel `AUCTIONEER` ou `BIDDER`) e login → JWT |
| GET | `/me` | autenticado | Perfil |
| GET | `/catalog/search?q=&lang=` | leiloeiro | Pesquisa de cartas (Scryfall, com fallback local) |
| GET | `/catalog/items/:id/image` | público | Imagem do item (cópia própria ou redirect) |
| POST | `/lots` | leiloeiro | Cria um lote a partir de um item |
| DELETE | `/lots/:id` | leiloeiro | Cancela um lote (estorna o líder) |
| GET | `/seller/lots` | leiloeiro | Lotes do leiloeiro, resultado e total recebido |
| GET | `/lots?phase=&q=&rarity=` | público | Vitrine: ao vivo, agendados e encerrados |
| GET | `/lots/:id` | público | Sala do lote: lances, contagem e posição do licitante |
| POST | `/lots/:id/bids` | licitante | Dá um lance (`Idempotency-Key` obrigatório) |
| GET | `/lots/:id/events` | público | SSE do lote: `bid.placed`, `lot.closed`, `lot.cancelled` |
| GET | `/me/events?token=` | autenticado | SSE privado: `bid.outbid`, `lot.won`, `wallet.changed` |
| GET | `/me/bids` | licitante | Lotes em que deu lances, resultado e link do comprovante |
| GET | `/wallet`, `/wallet/ledger` | autenticado | Saldo total, comprometido e disponível; extrato |
| POST | `/wallet/deposits` | licitante | Depósito simulado (`Idempotency-Key` obrigatório) |
| GET | `/receipts/:token` | público | Comprovante partilhável, com o selo verificado |
| GET | `/audit/lots/:id` | público | Auditoria do histórico de lances |
| GET | `/audit/public-key` | público | Chave pública Ed25519 para verificação independente |

- **Valores:** todos em **cêntimos** (`amountCents: 10000` = R$ 100,00).
- **Erros de negócio:** saem como `{ statusCode, code, message }`, e o `code` é estável para o frontend traduzir.
- **Idioma:** os textos das cartas seguem `?locale=pt|en` ou o header `Accept-Language`, com fallback para inglês.

---

## Arquitetura e decisões

Monólito modular no padrão do NestJS: cada módulo tem controller, service e DTOs. As regras de negócio puras ficam em `*.rules.ts` e `*.policy.ts`, testadas sem base de dados.

```
src/
  auth, users     JWT, guards globais (@Public, @Roles), registo/login
  wallet          carteira e ledger
  catalog         cliente Scryfall, catálogo local, cópia de imagens e traduções
  lots            criação, cancelamento, vitrine, sala, regras de fase e anti-sniping
  bids            colocação de lances
  settlement      fecho dos lotes, liquidação e comprovantes
  audit           hash chain, assinaturas e verificação pública
  events          outbox transacional e SSE
  common          erros, idempotência, locale, paginação, dinheiro, relógio
  seed            cenário de demonstração
```

### Lances concorrentes

Cada lance corre numa transação:
1. Faz `SELECT … FOR UPDATE` à linha do lote. Lances no mesmo lote ficam em fila, e lotes diferentes não se bloqueiam.
2. Valida as regras (`bid.policy.ts`).
3. Bloqueia as carteiras envolvidas, **sempre por ordem de `user_id`**, para não haver deadlocks.
4. Move o dinheiro, acrescenta o lance à hash chain e atualiza o lote.

Os testes e2e disparam 40 lances em paralelo e confirmam:
- a sequência contínua de lances;
- o saldo comprometido só no líder;
- `carteira == soma do ledger`.

### Saldo comprometido

- **Ledger append-only:** todos os movimentos ficam em `ledger_entries` (`DEPOSIT`, `HOLD`, `RELEASE`, `CAPTURE`, `PAYOUT`, `REFUND`).
- **Projeção:** `wallets` guarda `balance` e `committed`, e o disponível é `balance − committed`.
- **Ao liderar:** o valor fica em `HOLD`.
- **Ao ser superado:** o valor volta ao disponível na mesma transação (`RELEASE`).
- **Na liquidação:** o vencedor sofre um `CAPTURE` e o leiloeiro recebe um `PAYOUT`.
- **Proteção na BD:** uma constraint `CHECK (0 <= committed <= balance)` e um trigger que impede `UPDATE`/`DELETE` no ledger.

### Idempotência

`POST /lots/:id/bids` e `POST /wallet/deposits` exigem o header `Idempotency-Key`:
- A mesma key com o mesmo pedido devolve a resposta original, sem repetir a operação.
- A mesma key com outro body dá `422`.
- Um pedido igual ainda em curso dá `409`.
- Se o pedido falhar, a key é libertada para o cliente tentar de novo.

### Anti-sniping

Um lance aceite a menos de 2 minutos do fim passa o fim para **2 minutos depois do lance** (`fim = agora + 2 min`).
- **Interpretação:** o enunciado ("estende o fim do lote para +2 minutos") admite duas leituras. Escolhemos garantir sempre uma janela completa para responder, sem acumular +2 min por lance.
- **Na API:** `originalEndsAt` mantém o fim original e `extended` indica se houve prorrogação.

### Encerramento e liquidação

Um worker (a cada 1s) seleciona os lotes vencidos com `FOR UPDATE SKIP LOCKED`:
- **Lances em curso:** um lote que está a receber um lance é deixado para o tick seguinte, que relê o fim (possivelmente prorrogado).
- **Várias instâncias:** o `SKIP LOCKED` permite que mais do que uma instância corra o worker.
- **Idempotência:** só lotes `OPEN` são liquidados, e há no máximo um comprovante por lote.
- **Lotes sem lances:** fecham sem vencedor.

### Histórico à prova de adulteração

Cada lote tem uma **hash chain assinada com Ed25519**:
- **Genesis:** `SHA-256` dos termos do lote (vendedor, item, lance inicial, incremento, início e fim original), assinado.
- **Cada lance:** `SHA-256(lote, seq, alias, valor, data, hash anterior)`, assinado.
- **Selo do comprovante:** assina o estado final (número de lances, último hash, valor e vencedor).

A chave privada vive **só na variável de ambiente**, nunca na base de dados. `GET /audit/lots/:id` recalcula tudo a partir da BD, e a chave pública está em `/audit/public-key`.

| Adulteração (incluindo direto na BD) | Deteção |
|---|---|
| Alterar valor, data ou alias de um lance | `HASH_MISMATCH` |
| Recalcular os hashes depois de alterar | `INVALID_SIGNATURE` (sem a chave não há assinatura válida) |
| Remover um lance do meio | `SEQUENCE_GAP` e `BROKEN_LINK` |
| Inserir um lance | `INVALID_SIGNATURE` |
| Alterar o lance inicial ou o incremento | `GENESIS_TAMPERED` |
| Remover os últimos lances de um lote encerrado | `SEAL_MISMATCH` |
| Lances que violam as regras (abaixo do mínimo, mesmo licitante seguido, fora do horário) | `RULE_VIOLATION` |

Além disso, os triggers impedem `UPDATE`/`DELETE` em `bids` e `ledger_entries`. É uma defesa extra; a deteção a sério é criptográfica.

### Privacidade

Os licitantes aparecem como `B-3FA9C1D2` = `HMAC(ALIAS_SECRET, lote:utilizador)`:
- O alias é estável dentro de um lote e diferente entre lotes, por isso não permite seguir alguém pelo site.
- Nem a auditoria nem o comprovante contêm nome, email ou id do licitante.

### API externa (Scryfall)

A Scryfall só é usada na **pesquisa do leiloeiro** e em tarefas de fundo:
- **Cliente:** timeout de 3s, 1 retry, circuit breaker (abre após 5 falhas e fica aberto 30s) e throttle de 10 req/s, como a Scryfall pede.
- **Cache:** as pesquisas ficam 10 minutos em cache.
- **Catálogo local:** cada resultado é gravado em `catalog_items`. Se a Scryfall falhar, a pesquisa responde com o catálogo local (`source: "cache"`, índice trigram).
- **Itens imutáveis:** são inseridos uma vez e nunca alterados, por isso funcionam como snapshot do lote. A vitrine, as salas, a auditoria e os comprovantes **nunca** chamam a Scryfall.
- **Fila de jobs:** ao criar um lote, copia a imagem para a base de dados (servida em `/catalog/items/:id/image`) e completa as traduções em falta. A fila usa leases com `SKIP LOCKED` e backoff exponencial, até 5 tentativas.

### Idiomas das cartas

Na Scryfall, cada idioma é uma impressão diferente: uma carta impressa em português é outro objeto, com outra imagem.
- **`lang`:** o idioma impresso do item leiloado. Faz parte do que se vende.
- **Traduções:** nome, tipo e texto (pt/en) mostrados no idioma de quem vê. Vêm do texto oficial (`ORACLE`), do texto impresso na carta (`PRINTED`) ou de outra impressão da mesma carta (`SIBLING`).

### Tempo real

Os eventos são gravados numa **outbox** na mesma transação da alteração, por isso não há dual write: o evento existe sse a alteração existe. Cada instância lê a outbox a cada 250ms e envia os eventos por SSE.
- **Cursor:** os ids de uma sequence não são atribuídos por ordem de commit. O cursor segue por isso o id da transação (`xid8`) e só lê transações mais antigas do que a mais antiga ainda em curso, o que garante que nenhum evento fica para trás.
- **Várias instâncias:** cada instância lê a outbox inteira, por isso funciona com várias réplicas sem Redis.

---

## Comportamentos a ter em conta

- **Fase `CLOSING`:** entre o fim de um lote e a liquidação (até ~1s) o lote aparece como `CLOSING` e já não aceita lances.
- **Cancelamento:** o leiloeiro pode cancelar lotes agendados ou ao vivo, mesmo com lances, e o líder é estornado. Lotes encerrados não podem ser cancelados.
- **Datas de início:** um `startsAt` no passado é tratado como "agora". A duração mínima de um lote é de 1 minuto.
- **Leiloeiro:** não pode dar lances nem depositar; a carteira dele só recebe os pagamentos dos lotes vendidos.
- **SSE autenticado:** o `EventSource` não envia headers, por isso o stream privado recebe o JWT em `?token=`.
- **Reconexão SSE:** os streams só enviam eventos novos. Ao (re)ligar, o cliente deve carregar o estado atual com `GET /lots/:id`.
- **Limite da auditoria:** durante um leilão ainda aberto, quem tenha acesso de escrita à base de dados e desative o trigger pode apagar o **último** lance e acertar `lots.head_hash`; a cadeia restante continua válida. Depois do fecho, o selo assinado do comprovante deteta-o. Uma mitigação mais forte seria publicar o head periodicamente fora da BD.
- **Preço de referência:** a Scryfall só dá preços para impressões em inglês. As cartas noutros idiomas não têm `referencePrice`.
- **Imagens:** o seed não descarrega imagens. A API copia-as em segundo plano quando arranca (precisa de rede) e, até lá, `/catalog/items/:id/image` redireciona para a Scryfall.
- **Fixture do seed:** foi gerada com `node scripts/build-seed-fixture.mjs`, por isso o seed não precisa de rede.

---

## Uso de IA

<!-- Preencher: onde e como a IA foi usada, o que foi revisto e ajustado. -->
