import { useState } from 'react'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import { formatRelativeTime } from '#/shared/lib/datetime'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/shared/ui/accordion'
import { Alias } from '#/shared/ui/alias'
import { Pagination } from '#/shared/ui/pagination'
import { Price } from '#/shared/ui/price'
import type { LotRoom, RoomBid } from '../api/room-api'

const HISTORY_PAGE_SIZE = 8

function BidRow({ bid, you, now }: { bid: RoomBid; you?: string; now: Date }) {
  const mine = you != null && bid.bidderAlias === you
  return (
    <li
      className={bid.pending ? 'grid gap-1 py-3 opacity-60' : 'grid gap-1 py-3'}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Alias value={bid.bidderAlias} />
          {mine && (
            <span className="text-xs font-medium text-primary">
              {m.lot_room_you()}
            </span>
          )}
          {bid.pending && (
            <span className="text-xs text-muted-foreground">
              {m.lot_room_pending()}
            </span>
          )}
        </div>
        <Price cents={bid.amountCents} className="font-medium text-gold-text" />
      </div>
      <p className="text-xs text-muted-foreground">
        {formatRelativeTime(bid.createdAt, getLocale(), now)}
      </p>
    </li>
  )
}

export function BidHistory({ room, now }: { room: LotRoom; now: Date }) {
  const [page, setPage] = useState(1)
  const total = room.bids.length
  const current = Math.min(
    page,
    Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE)),
  )
  const items = room.bids.slice(
    (current - 1) * HISTORY_PAGE_SIZE,
    current * HISTORY_PAGE_SIZE,
  )

  return (
    <Accordion type="single" collapsible defaultValue="history">
      <AccordionItem value="history">
        <AccordionTrigger className="font-display text-xl font-semibold hover:no-underline">
          {m.lot_room_history()}
        </AccordionTrigger>
        <AccordionContent>
          {total === 0 ? (
            <p className="text-sm text-muted-foreground">
              {m.lot_room_history_empty()}
            </p>
          ) : (
            <div className="grid gap-4">
              <ol className="divide-y border-y">
                {items.map((bid) => (
                  <BidRow
                    key={bid.pending ? 'pending' : bid.seq}
                    bid={bid}
                    you={room.viewer?.alias}
                    now={now}
                  />
                ))}
              </ol>
              <Pagination
                page={current}
                pageSize={HISTORY_PAGE_SIZE}
                total={total}
                onPageChange={setPage}
              />
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
