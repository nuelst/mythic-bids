import { Controller } from 'react-hook-form'
import { m } from '#/paraglide/messages'
import { Button } from '#/shared/ui/button'
import { Field } from '#/shared/ui/field'
import { MoneyInput } from '#/shared/ui/money-input'
import { useDepositForm } from '../view-models/use-deposit-form'

export function DepositForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void
  onCancel?: () => void
}) {
  const deposit = useDepositForm({ onSuccess })
  const {
    form: {
      control,
      formState: { errors },
    },
  } = deposit

  return (
    <form className="grid gap-4" onSubmit={deposit.onSubmit} noValidate>
      <Controller
        name="amountCents"
        control={control}
        render={({ field }) => (
          <Field
            id="deposit"
            label={m.wallet_deposit_label()}
            error={errors.amountCents?.message}
          >
            <MoneyInput
              value={field.value}
              onChange={(cents) => field.onChange(cents ?? 0)}
              onBlur={field.onBlur}
            />
          </Field>
        )}
      />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {m.cancel()}
          </Button>
        )}
        <Button type="submit" loading={deposit.isSubmitting}>
          {m.wallet_deposit_submit()}
        </Button>
      </div>
    </form>
  )
}
