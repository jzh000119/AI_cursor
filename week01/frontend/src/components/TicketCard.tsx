import { Pencil, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { TagManager } from './TagManager'
import { getColorBorderClass, getColorBadgeBorderClass, getColorBorderStyle, cn } from '@/lib/utils'
import type { Ticket } from '@/types'

/** 将 API 返回的 ISO 时间格式化为本地可读（日期 + 时间） */
function formatCreatedAt(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

interface TicketCardProps {
  ticket: Ticket
  onEdit: (ticket: Ticket) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string, currentValue: boolean) => void
  onTagUpdate: (ticket: Ticket) => void
}

export function TicketCard({
  ticket,
  onEdit,
  onDelete,
  onToggleComplete,
  onTagUpdate,
}: TicketCardProps) {
  return (
    <div
      className={cn(
        'flex rounded-lg border bg-card shadow-sm overflow-hidden',
        getColorBorderClass(ticket.color),
      )}
      style={getColorBorderStyle(ticket.color)}
    >
      <div className="flex flex-1 gap-3 p-4">
        <Checkbox
          checked={ticket.completed}
          onCheckedChange={() => onToggleComplete(ticket.id, ticket.completed)}
          aria-label="切换完成状态"
          className="mt-0.5 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'font-medium leading-snug',
              ticket.completed && 'line-through text-muted-foreground',
            )}
          >
            {ticket.title}
          </p>
          {ticket.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {ticket.description}
            </p>
          )}
            {ticket.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {ticket.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className={cn('text-xs', getColorBadgeBorderClass(ticket.color))}
                  style={getColorBorderStyle(ticket.color)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            创建于 {formatCreatedAt(ticket.created_at)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center justify-center gap-1 border-l px-2 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(ticket)}
          title="编辑"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <TagManager ticket={ticket} onUpdate={onTagUpdate} />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" title="删除" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除 Ticket「{ticket.title}」吗？此操作不可撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => onDelete(ticket.id)}
              >
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
