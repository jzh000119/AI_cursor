import { TicketCard } from './TicketCard'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import type { Ticket } from '@/types'

interface TicketListProps {
  tickets: Ticket[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onEdit: (ticket: Ticket) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string, currentValue: boolean) => void
  onTagUpdate: (ticket: Ticket) => void
  loading?: boolean
}

export function TicketList({
  tickets,
  total,
  page,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  onToggleComplete,
  onTagUpdate,
  loading,
}: TicketListProps) {
  const totalPages = Math.ceil(total / pageSize)

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        加载中...
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="text-sm">暂无 Ticket</p>
        <p className="text-xs">点击右上角「新建 Ticket」开始添加</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-3">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
            onTagUpdate={onTagUpdate}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-2">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page > 1) onPageChange(page - 1)
                }}
                className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={(e) => {
                    e.preventDefault()
                    onPageChange(p)
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page < totalPages) onPageChange(page + 1)
                }}
                className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
