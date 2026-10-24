import { Controller } from 'react-hook-form'
import { m } from '#/paraglide/messages'
import { fromDateTimeLocal } from '#/shared/lib/datetime'
import { Button } from '#/shared/ui/button'
import { DateTimeInput } from '#/shared/ui/date-time-input'
import { Field } from '#/shared/ui/field'
import { MoneyInput } from '#/shared/ui/money-input'
import { useCreateLotForm } from '../view-models/use-create-lot-form'

export function CreateLotForm({ itemId }: { itemId?: string }) {
  const create = useCreateLotForm(itemId)
  const {
    form: {
      control,
      watch,
      formState: { errors },
    },
  } = create
  const now = new Date()
  const startDate = fromDateTimeLocal(watch('startsAt') ?? '')
  const endMin =
    startDate && startDate.getTime() > now.getTime() ? startDate : now

  return (
    <form className="grid gap-4" onSubmit={create.onSubmit} noValidate>
      <Controller
        name="startingPriceCents"
        control={control}
        render={({ field }) => (
          <Field
            id="starting"
            label={m.seller_starting_price()}
            error={errors.startingPriceCents?.message}
          >
            <MoneyInput
              value={field.value}
              onChange={(cents) => field.onChange(cents ?? 0)}
              onBlur={field.onBlur}
            />
          </Field>
        )}
      />
      <Controller
        name="minIncrementCents"
        control={control}
        render={({ field }) => (
          <Field
            id="increment"
            label={m.seller_min_increment()}
            error={errors.minIncrementCents?.message}
          >
            <MoneyInput
              value={field.value}
              onChange={(cents) => field.onChange(cents ?? 0)}
              onBlur={field.onBlur}
            />
          </Field>
        )}
      />
      <Controller
        name="startsAt"
        control={control}
        render={({ field }) => (
          <Field
            id="startsAt"
            label={m.seller_starts_at()}
            description={m.seller_starts_at_hint()}
            error={errors.startsAt?.message}
          >
            <DateTimeInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              minDate={now}
              allowEmpty
              placeholder={m.datetime_pick()}
            />
          </Field>
        )}
      />
      <Controller
        name="endsAt"
        control={control}
        render={({ field }) => (
          <Field
            id="endsAt"
            label={m.seller_ends_at()}
            error={errors.endsAt?.message}
          >
            <DateTimeInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              minDate={endMin}
            />
          </Field>
        )}
      />
      {errors.itemId && (
        <p role="alert" className="text-sm font-medium text-danger">
          {errors.itemId.message}
        </p>
      )}
      <Button type="submit" loading={create.isSubmitting} disabled={!itemId}>
        {m.seller_create_submit()}
      </Button>
    </form>
  )
}
