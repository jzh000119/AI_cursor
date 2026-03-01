import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ColorPicker } from './ColorPicker'
import { cn } from '@/lib/utils'
import type { Ticket, Tag, TicketColor, TicketCreatePayload, TicketUpdatePayload } from '@/types'

interface TicketFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket?: Ticket
  onSubmit: (payload: TicketCreatePayload | TicketUpdatePayload) => Promise<void>
  tags: Tag[]
}

export function TicketForm({ open, onOpenChange, ticket, onSubmit, tags }: TicketFormProps) {
  const isEdit = !!ticket

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState<TicketColor>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [titleError, setTitleError] = useState('')

  useEffect(() => {
    if (open) {
      setTitle(ticket?.title ?? '')
      setDescription(ticket?.description ?? '')
      setColor(ticket?.color ?? null)
      setSelectedTagIds(ticket?.tags.map((t) => t.id) ?? [])
      setTitleError('')
    }
  }, [open, ticket])

  function validateTitle(value: string): string {
    const trimmed = value.trim()
    if (trimmed.length === 0) return '标题不能为空'
    if (trimmed.length > 200) return '标题不能超过 200 个字符'
    return ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validateTitle(title)
    if (err) {
      setTitleError(err)
      return
    }
    setSubmitting(true)
    try {
      if (isEdit) {
        const payload: TicketUpdatePayload = {
          title: title.trim(),
          description: description.trim() || null,
          color,
        }
        await onSubmit(payload)
      } else {
        const payload: TicketCreatePayload = {
          title: title.trim(),
          description: description.trim() || null,
          color,
          tag_ids: selectedTagIds,
        }
        await onSubmit(payload)
      }
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    )
  }

  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑 Ticket' : '新建 Ticket'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium" htmlFor="ticket-title">
              标题 <span className="text-destructive">*</span>
            </label>
            <Input
              id="ticket-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (titleError) setTitleError(validateTitle(e.target.value))
              }}
              placeholder="输入 Ticket 标题..."
              className="mt-1"
              maxLength={200}
            />
            {titleError && (
              <p className="mt-1 text-xs text-destructive">{titleError}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium" htmlFor="ticket-description">
              描述
            </label>
            <Textarea
              id="ticket-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入 Ticket 描述（可选）..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">颜色</label>
            <div className="mt-2">
              <ColorPicker value={color} onChange={setColor} />
            </div>
          </div>

          {!isEdit && (
            <div>
              <label className="text-sm font-medium">初始标签</label>
              <div className="mt-1">
                <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {selectedTags.length > 0
                        ? `已选 ${selectedTags.length} 个标签`
                        : '选择标签...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="搜索标签..." />
                      <CommandList>
                        <CommandEmpty>暂无标签</CommandEmpty>
                        <CommandGroup>
                          {tags.map((tag) => (
                            <CommandItem
                              key={tag.id}
                              value={tag.name}
                              onSelect={() => toggleTag(tag.id)}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedTagIds.includes(tag.id) ? 'opacity-100' : 'opacity-0',
                                )}
                              />
                              {tag.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedTags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="flex items-center gap-1 pr-1">
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          aria-label={`移除标签 ${tag.name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
