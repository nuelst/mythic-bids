import {
  CircleCheck,
  Info,
  Loader2,
  OctagonX,
  TriangleAlert,
} from 'lucide-react'
import { Toaster as Sonner } from 'sonner'
import type { ToasterProps } from 'sonner'
import { useTheme } from '#/shared/theme/theme-provider'

function Toaster(props: ToasterProps) {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme}
      position="top-center"
      closeButton
      icons={{
        success: <CircleCheck className="size-4 text-success" />,
        info: <Info className="size-4 text-info" />,
        warning: <TriangleAlert className="size-4 text-warning" />,
        error: <OctagonX className="size-4 text-danger" />,
        loading: <Loader2 className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            '!rounded-lg !border !border-border !bg-surface-raised !text-foreground !shadow-lg',
          description: '!text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
