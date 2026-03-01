import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchBar } from '@/components/SearchBar'
import { TagSidebar } from '@/components/TagSidebar'
import { TicketList } from '@/components/TicketList'
import { TicketForm } from '@/components/TicketForm'
import { useTickets } from '@/hooks/useTickets'
import { useTags } from '@/hooks/useTags'
import type { Ticket, TicketFilters, TicketCreatePayload, TicketUpdatePayload } from '@/types'

const PAGE_SIZE = 20

type CompletedFilter = 'all' | 'active' | 'done'

export default function App() {
  const { tickets, total, loading, loadTickets, addTicket, editTicket, removeTicket, toggleCompleted, setTickets } =
    useTickets()
  const { tags, loadTags } = useTags()

  const [filters, setFilters] = useState<TicketFilters>({ limit: PAGE_SIZE, offset: 0 })
  const [completedTab, setCompletedTab] = useState<CompletedFilter>('all')
  const [searchValue, setSearchValue] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [noTags, setNoTags] = useState(false)
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    loadTags(true)
  }, [loadTags])

  const buildFilters = useCallback(
    (
      search: string,
      tab: CompletedFilter,
      tagIds: string[],
      noTagsFlag: boolean,
      currentPage: number,
    ): TicketFilters => {
      const f: TicketFilters = { limit: PAGE_SIZE, offset: (currentPage - 1) * PAGE_SIZE }
      if (search.trim()) f.q = search.trim()
      if (tab === 'active') f.completed = false
      if (tab === 'done') f.completed = true
      if (tagIds.length) f.tag_ids = tagIds
      if (noTagsFlag) f.no_tags = true
      return f
    },
    [],
  )

  useEffect(() => {
    const f = buildFilters(searchValue, completedTab, selectedTagIds, noTags, page)
    loadTickets(f)
    queueMicrotask(() => setFilters(f))
  }, [searchValue, completedTab, selectedTagIds, noTags, page, buildFilters, loadTickets])

  function handleSearchChange(value: string) {
    setSearchValue(value)
    setPage(1)
  }

  function handleTabChange(value: string) {
    setCompletedTab(value as CompletedFilter)
    setPage(1)
  }

  function handleTagSelect(tagId: string) {
    setNoTags(false)
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    )
    setPage(1)
  }

  function handleNoTagsToggle() {
    setSelectedTagIds([])
    setNoTags((prev) => !prev)
    setPage(1)
  }

  function handleClearAll() {
    setSelectedTagIds([])
    setNoTags(false)
    setPage(1)
  }

  function handleOpenCreate() {
    setEditingTicket(null)
    setFormOpen(true)
  }

  function handleOpenEdit(ticket: Ticket) {
    setEditingTicket(ticket)
    setFormOpen(true)
  }

  async function handleFormSubmit(payload: TicketCreatePayload | TicketUpdatePayload) {
    if (editingTicket) {
      await editTicket(editingTicket.id, payload as TicketUpdatePayload)
    } else {
      await addTicket(payload as TicketCreatePayload, filters)
      loadTags(true)
    }
  }

  function handleTagUpdate(updated: Ticket) {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    loadTags(true)
  }

  async function handleDelete(id: string) {
    await removeTicket(id)
    loadTags(true)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-3 shadow-sm">
        <h1 className="text-lg font-bold tracking-tight">🎫 Ticket 管理</h1>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          新建 Ticket
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <TagSidebar
          tags={tags}
          selectedTagIds={selectedTagIds}
          noTags={noTags}
          onSelect={handleTagSelect}
          onNoTagsToggle={handleNoTagsToggle}
          onClearAll={handleClearAll}
        />

        <main className="flex flex-1 flex-col overflow-y-auto p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <SearchBar value={searchValue} onChange={handleSearchChange} />
            </div>
            <Tabs value={completedTab} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="active">未完成</TabsTrigger>
                <TabsTrigger value="done">已完成</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <TicketList
            tickets={tickets}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onToggleComplete={toggleCompleted}
            onTagUpdate={handleTagUpdate}
            loading={loading}
          />
        </main>
      </div>

      <TicketForm
        open={formOpen}
        onOpenChange={setFormOpen}
        ticket={editingTicket ?? undefined}
        onSubmit={handleFormSubmit}
        tags={tags}
      />
    </div>
  )
}
