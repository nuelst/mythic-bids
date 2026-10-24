import type { LotRoom, PlaceBidResult, RoomBid } from './room-api'

export type BidPlacedPayload = {
  currentPriceCents: number
  nextMinimumCents: number
  bidCount: number
  endsAt: string
  extended: boolean
  bid: RoomBid
}

export type LotClosedPayload = {
  sold: boolean
  winnerAlias?: string
  finalPriceCents?: number
}

function asRecord(value: unknown) {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null
}

function asNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function asString(value: unknown) {
  return typeof value === 'string' && value !== '' ? value : null
}

function asBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : null
}

export function parseBidPlaced(data: unknown): BidPlacedPayload | null {
  const payload = asRecord(data)
  const bid = asRecord(payload?.bid)
  if (!payload || !bid) return null
  const currentPriceCents = asNumber(payload.currentPriceCents)
  const nextMinimumCents = asNumber(payload.nextMinimumCents)
  const bidCount = asNumber(payload.bidCount)
  const endsAt = asString(payload.endsAt)
  const extended = asBoolean(payload.extended)
  const amountCents = asNumber(bid.amountCents)
  const seq = asNumber(bid.seq)
  const bidderAlias = asString(bid.bidderAlias)
  const createdAt = asString(bid.createdAt)
  if (
    currentPriceCents == null ||
    nextMinimumCents == null ||
    bidCount == null ||
    !endsAt ||
    extended == null ||
    amountCents == null ||
    seq == null ||
    !bidderAlias ||
    !createdAt
  ) {
    return null
  }
  return {
    currentPriceCents,
    nextMinimumCents,
    bidCount,
    endsAt,
    extended,
    bid: { amountCents, seq, bidderAlias, createdAt },
  }
}

export function parseLotClosed(data: unknown): LotClosedPayload | null {
  const payload = asRecord(data)
  if (!payload) return null
  const sold = asBoolean(payload.sold)
  if (sold == null) return null
  return {
    sold,
    winnerAlias: asString(payload.winnerAlias) ?? undefined,
    finalPriceCents: asNumber(payload.finalPriceCents) ?? undefined,
  }
}

function dropPending(bids: RoomBid[]) {
  return bids.filter((bid) => !bid.pending)
}

function viewerAfterBid(
  viewer: LotRoom['viewer'],
  bid: RoomBid,
): LotRoom['viewer'] {
  if (!viewer) return viewer
  const mine = bid.bidderAlias === viewer.alias
  return {
    ...viewer,
    myHighestCents: mine
      ? Math.max(viewer.myHighestCents ?? 0, bid.amountCents)
      : viewer.myHighestCents,
    isLeading: mine,
    position: mine ? 1 : viewer.position === 1 ? 2 : viewer.position,
  }
}

export function applyBidPlaced(
  room: LotRoom,
  payload: BidPlacedPayload,
): LotRoom {
  const confirmed = { ...payload.bid, pending: undefined }
  const withoutPending = dropPending(room.bids)
  const exists = withoutPending.some((bid) => bid.seq === confirmed.seq)
  const bids = exists
    ? withoutPending.map((bid) => (bid.seq === confirmed.seq ? confirmed : bid))
    : [confirmed, ...withoutPending]

  return {
    ...room,
    currentPriceCents: payload.currentPriceCents,
    nextMinimumCents: payload.nextMinimumCents,
    bidCount: payload.bidCount,
    endsAt: payload.endsAt,
    extended: payload.extended,
    leaderAlias: confirmed.bidderAlias,
    bids,
    viewer: viewerAfterBid(room.viewer, confirmed),
  }
}

export function applyPlaceResult(
  room: LotRoom,
  result: PlaceBidResult,
): LotRoom {
  return applyBidPlaced(room, {
    currentPriceCents: result.currentPriceCents,
    nextMinimumCents: result.nextMinimumCents,
    bidCount: result.bidCount,
    endsAt: result.endsAt,
    extended: result.extended,
    bid: {
      amountCents: result.bid.amountCents,
      seq: result.bid.seq,
      bidderAlias: result.bid.bidderAlias,
      createdAt: result.bid.createdAt,
    },
  })
}

export function applyOptimisticBid(
  room: LotRoom,
  amountCents: number,
  alias: string,
  now = new Date(),
): LotRoom {
  const pending: RoomBid = {
    amountCents,
    seq: 0,
    bidderAlias: alias,
    createdAt: now.toISOString(),
    pending: true,
  }
  return {
    ...room,
    currentPriceCents: amountCents,
    nextMinimumCents: amountCents + room.minIncrementCents,
    bidCount: room.bidCount + 1,
    leaderAlias: alias,
    bids: [pending, ...dropPending(room.bids)],
    viewer: room.viewer
      ? {
          ...room.viewer,
          myHighestCents: amountCents,
          isLeading: true,
          position: 1,
        }
      : room.viewer,
  }
}

export function applyLotClosed(
  room: LotRoom,
  payload: LotClosedPayload,
): LotRoom {
  return {
    ...room,
    phase: 'CLOSED',
    sold: payload.sold,
    finalPriceCents: payload.finalPriceCents ?? room.finalPriceCents,
    currentPriceCents: payload.finalPriceCents ?? room.currentPriceCents,
    leaderAlias: payload.winnerAlias ?? room.leaderAlias,
  }
}

export function applyLotCancelled(room: LotRoom): LotRoom {
  return { ...room, phase: 'CANCELLED' }
}

export function displayRoomPriceCents(room: LotRoom) {
  if (
    room.phase === 'CLOSED' ||
    room.phase === 'CLOSING' ||
    room.phase === 'CANCELLED'
  ) {
    return (
      room.finalPriceCents ?? room.currentPriceCents ?? room.startingPriceCents
    )
  }
  return room.currentPriceCents ?? room.startingPriceCents
}
