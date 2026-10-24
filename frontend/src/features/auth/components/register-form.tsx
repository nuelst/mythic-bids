import { Controller } from 'react-hook-form'
import { m } from '#/paraglide/messages'
import { cn } from '#/shared/lib/cn'
import { Button } from '#/shared/ui/button'
import { Field } from '#/shared/ui/field'
import { Input } from '#/shared/ui/input'
import { useRegisterForm } from '../view-models/use-register-form'

const ROLES = [
  {
    value: 'BIDDER',
    title: m.auth_role_bidder,
    hint: m.auth_role_bidder_hint,
  },
  {
    value: 'AUCTIONEER',
    title: m.auth_role_auctioneer,
    hint: m.auth_role_auctioneer_hint,
  },
] as const

export function RegisterForm({ redirect }: { redirect?: string }) {
  const { form, isSubmitting, onSubmit } = useRegisterForm(redirect)
  const {
    register,
    control,
    formState: { errors },
  } = form

  return (
    <form className="grid gap-5" onSubmit={onSubmit} noValidate>
      <Field id="name" label={m.auth_name()} error={errors.name?.message}>
        <Input
          type="text"
          autoComplete="name"
          autoFocus
          {...register('name')}
        />
      </Field>
      <Field id="email" label={m.auth_email()} error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register('email')} />
      </Field>
      <Field
        id="password"
        label={m.auth_password()}
        error={errors.password?.message}
      >
        <Input
          type="password"
          autoComplete="new-password"
          {...register('password')}
        />
      </Field>
      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <Field id="role" label={m.auth_role()} error={errors.role?.message}>
            <div
              role="radiogroup"
              aria-label={m.auth_role()}
              className="grid grid-cols-2 gap-3"
            >
              {ROLES.map((role) => {
                const selected = field.value === role.value
                return (
                  <button
                    key={role.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => field.onChange(role.value)}
                    className={cn(
                      'rounded-md border px-3 py-3 text-left transition-colors',
                      selected
                        ? 'border-primary bg-primary-soft'
                        : 'border-border hover:bg-muted',
                    )}
                  >
                    <span className="block text-sm font-medium">
                      {role.title()}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {role.hint()}
                    </span>
                  </button>
                )
              })}
            </div>
          </Field>
        )}
      />
      <Button type="submit" loading={isSubmitting}>
        {m.auth_submit_register()}
      </Button>
    </form>
  )
}
