import { Link } from '@tanstack/react-router'
import { m } from '#/paraglide/messages'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/shared/ui/card'
import { LoginForm } from '../components/login-form'

export function LoginPage({ redirect }: { redirect?: string }) {
  return (
    <main className="container-page grid min-h-[calc(100dvh-4rem)] place-items-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            {m.auth_login_title()}
          </CardTitle>
          <CardDescription>{m.auth_login_description()}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <LoginForm redirect={redirect} />
          <p className="text-sm text-muted-foreground">
            {m.auth_to_register()}{' '}
            <Link
              to="/register"
              search={{ redirect }}
              className="font-medium text-primary hover:underline"
            >
              {m.auth_to_register_link()}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
