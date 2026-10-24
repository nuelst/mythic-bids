import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { m } from '#/paraglide/messages'
import { Button } from './button'

interface CopyButtonProps {
  value: string
  label?: string
}

function CopyButton({ value, label = m.copy() }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={copied ? m.copied() : label}
      title={copied ? m.copied() : label}
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
      }}
    >
      {copied ? <Check className="text-success" /> : <Copy />}
    </Button>
  )
}

export { CopyButton }
