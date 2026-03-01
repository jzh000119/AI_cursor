import { Badge } from '@/components/ui/badge'
import { cn, getTagColorBorderClass } from '@/lib/utils'
import type { Tag } from '@/types'

interface TagSidebarProps {
  tags: Tag[]
  selectedTagIds: string[]
  noTags: boolean
  onSelect: (tagId: string) => void
  onNoTagsToggle: () => void
  onClearAll: () => void
}

export function TagSidebar({
  tags,
  selectedTagIds,
  noTags,
  onSelect,
  onNoTagsToggle,
  onClearAll,
}: TagSidebarProps) {
  const isAllActive = selectedTagIds.length === 0 && !noTags

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r bg-background">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">标签筛选</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <button
          type="button"
          onClick={onClearAll}
          className={cn(
            'flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors',
            isAllActive ? 'bg-accent font-medium' : 'hover:bg-accent/50',
          )}
        >
          全部
        </button>
        <button
          type="button"
          onClick={onNoTagsToggle}
          className={cn(
            'flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors',
            noTags ? 'bg-accent font-medium' : 'hover:bg-accent/50',
          )}
        >
          无标签
        </button>

        {tags.length > 0 && (
          <div className="mt-1 border-t pt-1">
            {tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => onSelect(tag.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                    getTagColorBorderClass(tag.name),
                    isSelected ? 'bg-accent font-medium' : 'hover:bg-accent/50',
                  )}
                >
                  <span className="truncate">{tag.name}</span>
                  {tag.ticket_count !== undefined && (
                    <Badge variant="secondary" className="ml-1 shrink-0 text-xs">
                      {tag.ticket_count}
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </nav>
    </aside>
  )
}
