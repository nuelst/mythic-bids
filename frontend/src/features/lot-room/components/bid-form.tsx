import { Controller } from 'react-hook-form'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import { formatCents } from '#/shared/lib/money'
import { Button } from '#/shared/ui/button'
import { Field } from '#/shared/ui/field'
import { MoneyInput } from '#/shared/ui/money-input'
import { useBidForm } from '../view-models/use-bid-form'
import type { LotRoom } from '../api/room-api'

export function BidForm({ room }: { room: LotRoom }) {
  const bid = useBidForm(room)
  const {
    form: {
      control,
      formState: { errors },
    },
  } = bid

  return (
    <form className="grid gap-4" onSubmit={bid.onSubmit} noValidate>
      <Controller
        name="amountCents"
        control={control}
        render={({ field }) => (
          <Field
            id="amount"
            label={m.lot_room_bid_label()}
            description={m.lot_room_min_bid({
              amount: formatCents(bid.minimumCents, getLocale()),
            })}
            error={errors.amountCents?.message}
          >
            <MoneyInput
              value={field.value}
              onChange={(cents) => field.onChange(cents ?? 0)}
              onBlur={field.onBlur}
              autoFocus
            />
          </Field>
        )}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => bid.setAmount(bid.minimumCents)}
        >
          {m.lot_room_shortcut_min()}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => bid.setAmount(bid.plusOneCents)}
        >
          {m.lot_room_shortcut_plus_one()}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => bid.setAmount(bid.plusFiveCents)}
        >
          {m.lot_room_shortcut_plus_five()}
        </Button>
      </div>
      <Button type="submit" loading={bid.isSubmitting}>
        {m.lot_room_bid_submit()}
      </Button>
    </form>
  )
}
