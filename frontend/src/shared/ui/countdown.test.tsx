import { render, screen } from '@testing-library/react'
import { resetServerClock } from '#/shared/lib/server-clock'
import { Countdown } from './countdown'

describe('Countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-24T15:00:00.000Z'))
    resetServerClock()
  })

  afterEach(() => {
    vi.useRealTimers()
    resetServerClock()
  })

  it('shows the remaining time and warns in the last two minutes', () => {
    const { unmount } = render(<Countdown endsAt="2026-10-24T15:00:45.000Z" />)
    expect(screen.getByText('00:45')).toHaveClass('text-warning')
    unmount()
  })

  it('shows the ended label and hides the extension after close', () => {
    const { unmount } = render(
      <Countdown endsAt="2026-10-24T14:59:00.000Z" extended />,
    )
    expect(screen.getByText('Encerrado')).toBeInTheDocument()
    expect(screen.queryByText(/Prorrogado/)).not.toBeInTheDocument()
    unmount()
  })

  it('announces an anti-snipe extension while the lot is live', () => {
    const { unmount } = render(
      <Countdown endsAt="2026-10-24T16:00:00.000Z" extended />,
    )
    expect(screen.getByText(/Prorrogado/)).toBeInTheDocument()
    unmount()
  })
})
