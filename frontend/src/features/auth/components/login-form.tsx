import { m } from '#/paraglide/messages'
import { Button } from '#/shared/ui/button'
import { Field } from '#/shared/ui/field'
import { Input } from '#/shared/ui/input'
import { useLoginForm } from '../view-models/use-login-form'

export function LoginForm({ redirect }: { redirect?: string }) {
  const { form, isSubmitting, onSubmit } = useLoginForm(redirect)
  const {
    register,
    formState: { errors },
  } = form

  return (
    <form className="grid gap-5" onSubmit={onSubmit} noValidate>
      <Field id="email" label={m.auth_email()} error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          autoFocus
          {...register('email')}
        />
      </Field>
      <Field
        id="password"
        label={m.auth_password()}
        error={errors.password?.message}
      >
        <Input
          type="password"
          autoComplete="current-password"
          {...register('password')}
        />
      </Field>
      <Button type="submit" loading={isSubmitting}>
        {m.auth_submit_login()}
      </Button>
    </form>
  )
}
