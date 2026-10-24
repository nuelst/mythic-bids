import http from 'node:http'

const PORT = Number(process.env.E2E_API_PORT ?? 3999)
const LOT_ID = '11111111-1111-4111-8111-111111111111'
const RECEIPT_TOKEN = 'e2e-receipt'

const USERS = {
  'ana@demo.com': {
    token: 'ana-token',
    id: 'ana',
    name: 'Ana Souza',
    email: 'ana@demo.com',
    alias: 'B-ANA',
  },
  'bruno@demo.com': {
    token: 'bruno-token',
    id: 'bruno',
    name: 'Bruno Lima',
    email: 'bruno@demo.com',
    alias: 'B-BRUNO',
  },
}

const TOKEN_USER = Object.fromEntries(
  Object.values(USERS).map((user) => [user.token, user]),
)

function item() {
  return {
    id: 'item-1',
    locale: 'en',
    name: 'Sol Ring',
    typeLine: 'Artifact',
    rulesText: null,
    flavorText: null,
    lang: 'en',
    rarity: 'uncommon',
    setCode: 'cmm',
    setName: 'Commander Masters',
    collectorNumber: '1',
    manaCost: null,
    colors: [],
    artist: null,
    releasedAt: null,
    referencePrice: null,
    imageUrl: '/catalog/items/item-1/image',
  }
}

function createState() {
  const now = new Date()
  return {
    phase: 'LIVE',
    startingPriceCents: 1000,
    minIncrementCents: 100,
    currentPriceCents: 1000,
    nextMinimumCents: 1000,
    finalPriceCents: null,
    bidCount: 0,
    startsAt: new Date(now.getTime() - 60_000).toISOString(),
    endsAt: new Date(now.getTime() + 86_400_000).toISOString(),
    originalEndsAt: new Date(now.getTime() + 86_400_000).toISOString(),
    extended: false,
    sold: false,
    settledAt: null,
    cancelledAt: null,
    createdAt: now.toISOString(),
    leaderAlias: null,
    leaderId: null,
    bids: [],
    receiptToken: null,
  }
}

let state = createState()
const lotClients = new Set()
const userClients = new Map()

function json(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
  })
  res.end(JSON.stringify(body))
}

function text(res, status, body, type = 'text/plain') {
  res.writeHead(status, {
    'content-type': type,
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
  })
  res.end(body)
}

function userFrom(req) {
  const header = req.headers.authorization ?? ''
  const url = new URL(req.url, 'http://127.0.0.1')
  const token = header.startsWith('Bearer ')
    ? header.slice(7)
    : url.searchParams.get('token')
  return TOKEN_USER[token] ?? null
}

function lotDto() {
  return {
    id: LOT_ID,
    phase: state.phase,
    startingPriceCents: state.startingPriceCents,
    minIncrementCents: state.minIncrementCents,
    currentPriceCents: state.currentPriceCents,
    nextMinimumCents: state.nextMinimumCents,
    finalPriceCents: state.finalPriceCents,
    item: item(),
    bidCount: state.bidCount,
    startsAt: state.startsAt,
    endsAt: state.endsAt,
    originalEndsAt: state.originalEndsAt,
    extended: state.extended,
    sold: state.sold,
    settledAt: state.settledAt,
    cancelledAt: state.cancelledAt,
    createdAt: state.createdAt,
  }
}

function room(user) {
  const bids = state.bids.map((bid) => ({
    amountCents: bid.amountCents,
    seq: bid.seq,
    bidderAlias: bid.alias,
    createdAt: bid.createdAt,
  }))
  const mine = user ? state.bids.filter((bid) => bid.userId === user.id) : []
  const myHighest = mine.at(-1)?.amountCents ?? null
  const isLeading = Boolean(user && state.leaderId === user.id)
  const aliases = [...new Set(state.bids.map((bid) => bid.alias))]
  const position = user
    ? isLeading
      ? 1
      : myHighest
        ? aliases.length
        : null
    : null
  return {
    ...lotDto(),
    serverTime: new Date().toISOString(),
    leaderAlias: state.leaderAlias,
    bids: [...bids].reverse(),
    viewer: user
      ? {
          alias: user.alias,
          myHighestCents: myHighest,
          isLeading,
          position,
          bidders: Math.max(aliases.length, 1),
        }
      : null,
  }
}

function sendSse(res, type, data) {
  res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`)
}

function broadcastLot(type, data) {
  for (const res of lotClients) sendSse(res, type, { ...data, lotId: LOT_ID })
}

function sendUser(userId, type, data) {
  const res = userClients.get(userId)
  if (res) sendSse(res, type, { ...data, lotId: LOT_ID })
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}'))
      } catch {
        resolve({})
      }
    })
  })
}

async function handle(req, res) {
  const url = new URL(req.url, 'http://127.0.0.1')
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
    })
    res.end()
    return
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    text(res, 200, 'ok')
    return
  }

  if (req.method === 'POST' && url.pathname === '/e2e/reset') {
    state = createState()
    json(res, 200, { ok: true })
    return
  }

  if (req.method === 'POST' && url.pathname === '/e2e/close') {
    const winner = state.bids.at(-1)
    state.phase = 'CLOSED'
    state.sold = Boolean(winner)
    state.finalPriceCents = winner?.amountCents ?? null
    state.settledAt = new Date().toISOString()
    state.receiptToken = winner ? RECEIPT_TOKEN : null
    broadcastLot('lot.closed', {
      sold: state.sold,
      winnerAlias: state.leaderAlias,
      finalPriceCents: state.finalPriceCents,
    })
    if (winner) {
      sendUser(winner.userId, 'lot.won', {
        receiptToken: RECEIPT_TOKEN,
        amountCents: winner.amountCents,
      })
    }
    json(res, 200, { ok: true })
    return
  }

  if (req.method === 'POST' && url.pathname === '/auth/login') {
    const body = await readBody(req)
    const user = USERS[body.email]
    if (!user || body.password !== 'demo1234') {
      json(res, 401, { code: 'INVALID_CREDENTIALS', message: 'Invalid' })
      return
    }
    json(res, 200, {
      accessToken: user.token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'BIDDER',
        createdAt: '2026-10-24T00:00:00.000Z',
      },
    })
    return
  }

  if (req.method === 'GET' && url.pathname === '/me') {
    const user = userFrom(req)
    if (!user) {
      json(res, 401, { code: 'INVALID_CREDENTIALS', message: 'Unauthorized' })
      return
    }
    json(res, 200, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'BIDDER',
      createdAt: '2026-10-24T00:00:00.000Z',
    })
    return
  }

  if (req.method === 'GET' && url.pathname === '/wallet') {
    json(res, 200, {
      balanceCents: 1_000_000,
      committedCents: 0,
      availableCents: 1_000_000,
    })
    return
  }

  if (req.method === 'GET' && url.pathname === '/lots') {
    json(res, 200, {
      items: [lotDto()],
      page: 1,
      pageSize: 20,
      total: 1,
    })
    return
  }

  if (req.method === 'GET' && url.pathname.startsWith('/catalog/')) {
    const gif = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64',
    )
    res.writeHead(200, {
      'content-type': 'image/gif',
      'access-control-allow-origin': '*',
    })
    res.end(gif)
    return
  }

  if (req.method === 'GET' && url.pathname === `/lots/${LOT_ID}`) {
    json(res, 200, room(userFrom(req)))
    return
  }

  if (req.method === 'POST' && url.pathname === `/lots/${LOT_ID}/bids`) {
    const user = userFrom(req)
    if (!user) {
      json(res, 401, { code: 'INVALID_CREDENTIALS', message: 'Unauthorized' })
      return
    }
    const body = await readBody(req)
    const amount = Number(body.amountCents)
    if (state.leaderId === user.id) {
      json(res, 422, { code: 'ALREADY_WINNING', message: 'Already winning' })
      return
    }
    if (amount < state.nextMinimumCents) {
      json(res, 422, {
        code: 'BELOW_MINIMUM',
        message: 'Below',
        minimumCents: state.nextMinimumCents,
      })
      return
    }
    const previous = state.leaderId
    const bid = {
      userId: user.id,
      alias: user.alias,
      amountCents: amount,
      seq: state.bids.length + 1,
      createdAt: new Date().toISOString(),
      hash: `h${state.bids.length + 1}`,
    }
    state.bids.push(bid)
    state.bidCount = state.bids.length
    state.currentPriceCents = amount
    state.nextMinimumCents = amount + state.minIncrementCents
    state.leaderAlias = user.alias
    state.leaderId = user.id
    const payload = {
      currentPriceCents: state.currentPriceCents,
      nextMinimumCents: state.nextMinimumCents,
      bidCount: state.bidCount,
      endsAt: state.endsAt,
      extended: false,
      bid: {
        amountCents: bid.amountCents,
        seq: bid.seq,
        bidderAlias: bid.alias,
        createdAt: bid.createdAt,
        hash: bid.hash,
      },
    }
    broadcastLot('bid.placed', payload)
    if (previous) sendUser(previous, 'bid.outbid', { bid: payload.bid })
    json(res, 201, payload)
    return
  }

  if (req.method === 'GET' && url.pathname === `/lots/${LOT_ID}/events`) {
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
      'access-control-allow-origin': '*',
    })
    lotClients.add(res)
    res.write(': connected\n\n')
    req.on('close', () => lotClients.delete(res))
    return
  }

  if (req.method === 'GET' && url.pathname === '/me/events') {
    const user = userFrom(req)
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
      'access-control-allow-origin': '*',
    })
    if (user) userClients.set(user.id, res)
    res.write(': connected\n\n')
    req.on('close', () => {
      if (user) userClients.delete(user.id)
    })
    return
  }

  if (req.method === 'GET' && url.pathname === '/me/bids') {
    const user = userFrom(req)
    if (!user) {
      json(res, 401, { code: 'INVALID_CREDENTIALS', message: 'Unauthorized' })
      return
    }
    const mine = state.bids.filter((bid) => bid.userId === user.id)
    const outcome = state.sold
      ? state.leaderId === user.id
        ? 'WON'
        : 'LOST'
      : state.leaderId === user.id
        ? 'WINNING'
        : 'OUTBID'
    json(res, 200, {
      items: mine.length
        ? [
            {
              myHighestCents: mine.at(-1).amountCents,
              outcome,
              lot: lotDto(),
              receiptToken: outcome === 'WON' ? state.receiptToken : null,
            },
          ]
        : [],
      page: 1,
      pageSize: 20,
      total: mine.length ? 1 : 0,
    })
    return
  }

  if (req.method === 'GET' && url.pathname === `/receipts/${RECEIPT_TOKEN}`) {
    json(res, 200, {
      token: RECEIPT_TOKEN,
      lot: lotDto(),
      winnerAlias: state.leaderAlias,
      amountCents: state.finalPriceCents,
      bidCount: state.bidCount,
      finalHash: 'finalhash',
      sealSignature: 'seal',
      issuedAt: state.settledAt ?? new Date().toISOString(),
      sealValid: true,
    })
    return
  }

  if (req.method === 'GET' && url.pathname === '/audit/public-key') {
    text(
      res,
      200,
      '-----BEGIN PUBLIC KEY-----\nMIIB\n-----END PUBLIC KEY-----\n',
    )
    return
  }

  if (req.method === 'GET' && url.pathname.startsWith('/audit/lots/')) {
    json(res, 200, {
      lotId: LOT_ID,
      intact: true,
      issues: [],
      checkedAt: new Date().toISOString(),
      terms: {
        sellerId: 'seller',
        itemId: 'item-1',
        startingPriceCents: 1000,
        minIncrementCents: 100,
        startsAt: state.startsAt,
        originalEndsAt: state.originalEndsAt,
        genesisHash: 'genesis',
        genesisSignature: 'sig',
      },
      bids: state.bids.map((bid) => ({
        seq: bid.seq,
        bidderAlias: bid.alias,
        amountCents: bid.amountCents,
        createdAt: bid.createdAt,
        prevHash: 'prev',
        hash: bid.hash,
        signature: 'sig',
      })),
      seal: state.receiptToken
        ? {
            lotId: LOT_ID,
            bidCount: state.bidCount,
            finalHash: 'finalhash',
            amountCents: state.finalPriceCents,
            winnerAlias: state.leaderAlias,
            issuedAt: state.settledAt,
            signature: 'seal',
          }
        : null,
    })
    return
  }

  json(res, 404, { code: 'LOT_NOT_FOUND', message: 'Not found' })
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((error) => {
    json(res, 500, { message: String(error) })
  })
})

server.listen(PORT, '127.0.0.1', () => {
  process.stdout.write(`e2e mock API on ${PORT}\n`)
})
