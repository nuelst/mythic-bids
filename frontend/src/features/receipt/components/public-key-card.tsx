import { m } from '#/paraglide/messages'
import { Card, CardContent, CardHeader, CardTitle } from '#/shared/ui/card'
import { CopyButton } from '#/shared/ui/copy-button'
import { Skeleton } from '#/shared/ui/skeleton'

export function PublicKeyCard({ pem }: { pem?: string }) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="grid gap-1">
          <CardTitle>{m.audit_public_key()}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {m.audit_public_key_hint()}
          </p>
        </div>
        {pem && <CopyButton value={pem} label={m.audit_copy_key()} />}
      </CardHeader>
      <CardContent>
        {pem ? (
          <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs text-muted-foreground">
            {pem}
          </pre>
        ) : (
          <Skeleton className="h-32 w-full" />
        )}
      </CardContent>
    </Card>
  )
}
