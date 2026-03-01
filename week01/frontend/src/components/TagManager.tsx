import { useState, useEffect } from 'react'
import { X, Tags } from 'lucide-react'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { addTagToTicket, removeTagFromTicket } from '@/api/tickets'
import { fetchTags } from '@/api/tags'
import type { Ticket, Tag } from '@/types'

interface TagManagerProps {
  ticket: Ticket
  onUpdate: (ticket: Ticket) => void
}

export function TagManager({ ticket, onUpdate }: TagManagerProps) {
  const [open, setOpen] = useState(false)
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (open) {
      fetchTags().then(setAllTags).catch(() => {})
    }
  }, [open])

  const ticketTagIds = new Set(ticket.tags.map((t) => t.id))
  const availableTags = allTags.filter((t) => !ticketTagIds.has(t.id))

  async function handleRemoveTag(tagId: string) {
    try {
      await removeTagFromTicket(ticket.id, tagId)
      onUpdate({ ...ticket, tags: ticket.tags.filter((t) => t.id !== tagId) })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove tag')
    }
  }

  async function handleSelectTag(tagId: string) {
    try {
      const updated = await addTagToTicket(ticket.id, tagId)
      onUpdate(updated)
      setInputValue('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add tag')
    }
  }

  async function handleCreateTag(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    try {
      const updated = await addTagToTicket(ticket.id, undefined, trimmed)
      onUpdate(updated)
      setInputValue('')
      setAllTags([])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add tag')
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" title="管理标签">
          <Tags className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="mb-2 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">已关联标签</p>
          {ticket.tags.length === 0 ? (
            <p className="text-xs text-muted-foreground">暂无标签</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {ticket.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="flex items-center gap-1 pr-1">
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.id)}
                    className="ml-0.5 rounded-full hover:bg-destructive/20"
                    aria-label={`移除标签 ${tag.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        <Command>
          <CommandInput
            placeholder="搜索或新建标签..."
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                const exactMatch = allTags.find(
                  (t) => t.name.toLowerCase() === inputValue.trim().toLowerCase(),
                )
                if (exactMatch && !ticketTagIds.has(exactMatch.id)) {
                  handleSelectTag(exactMatch.id)
                } else if (!exactMatch) {
                  handleCreateTag(inputValue)
                }
              }
            }}
          />
          <CommandList>
            <CommandEmpty>
              {inputValue.trim() ? (
                <button
                  type="button"
                  className="w-full px-2 py-1 text-sm text-left hover:bg-accent rounded"
                  onClick={() => handleCreateTag(inputValue)}
                >
                  新建标签「{inputValue.trim()}」
                </button>
              ) : (
                '暂无可选标签'
              )}
            </CommandEmpty>
            {availableTags.length > 0 && (
              <CommandGroup heading="可选标签">
                {availableTags.map((tag) => (
                  <CommandItem key={tag.id} value={tag.name} onSelect={() => handleSelectTag(tag.id)}>
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
