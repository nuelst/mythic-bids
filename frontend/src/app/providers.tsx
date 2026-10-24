import type { ReactNode } from 'react'
import { ThemeProvider } from '#/shared/theme/theme-provider'
import { Toaster } from '#/shared/ui/sonner'
import { TooltipProvider } from '#/shared/ui/tooltip'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={300}>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}
