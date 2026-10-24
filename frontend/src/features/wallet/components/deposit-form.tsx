import { Controller } from 'react-hook-form'
import { m } from '#/paraglide/messages'
import { Button } from '#/shared/ui/button'
import { Field } from '#/shared/ui/field'
import { MoneyInput } from '#/shared/ui/money-input'
import { useDepositForm } from '../view-models/use-deposit-form'

export function DepositForm() {
  const deposit = useDepositForm()
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
      <Button type="submit" loading={deposit.isSubmitting}>
        {m.wallet_deposit_submit()}
      </Button>
    </form>
  )
}
