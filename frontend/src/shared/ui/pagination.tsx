import { ChevronLeft, ChevronRight } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { Button } from './button'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null

  return (
    <nav
      aria-label={m.pagination_label()}
      className="flex items-center justify-between gap-4"
    >
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft aria-hidden />
        {m.pagination_previous()}
      </Button>
      <span className="tabular text-sm text-muted-foreground">
        {m.pagination_status({ page, pages })}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        {m.pagination_next()}
        <ChevronRight aria-hidden />
      </Button>
    </nav>
  )
}

export { Pagination }
