import { Plus } from 'lucide-react'
import { useState } from 'react'
import { m } from '#/paraglide/messages'
import { Button } from '#/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/shared/ui/dialog'
import { DepositForm } from './deposit-form'

export function DepositDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden />
          {m.wallet_deposit_title()}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.wallet_deposit_title()}</DialogTitle>
        </DialogHeader>
        <DepositForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
