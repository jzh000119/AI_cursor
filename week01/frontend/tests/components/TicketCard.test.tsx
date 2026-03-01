import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TicketCard } from '@/components/TicketCard'
import { getColorBorderClass } from '@/lib/utils'
import type { Ticket } from '@/types'

const baseTicket: Ticket = {
  id: 'ticket-1',
  title: '修复登录 Bug',
  description: null,
  color: 'red',
  completed: false,
  tags: [{ id: 'tag-1', name: 'bug' }],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

function renderCard(
  ticket: Ticket = baseTicket,
  handlers: Partial<{
    onEdit: (t: Ticket) => void
    onDelete: (id: string) => void
    onToggleComplete: (id: string, val: boolean) => void
    onTagUpdate: (t: Ticket) => void
  }> = {},
) {
  const props = {
    ticket,
    onEdit: handlers.onEdit ?? vi.fn(),
    onDelete: handlers.onDelete ?? vi.fn(),
    onToggleComplete: handlers.onToggleComplete ?? vi.fn(),
    onTagUpdate: handlers.onTagUpdate ?? vi.fn(),
  }
  return render(<TicketCard {...props} />)
}

describe('TicketCard', () => {
  it('正确渲染标题', () => {
    renderCard()
    expect(screen.getByText('修复登录 Bug')).toBeInTheDocument()
  })

  it('正确渲染标签徽章', () => {
    renderCard()
    expect(screen.getByText('bug')).toBeInTheDocument()
  })

  it('无标签时不渲染标签区域', () => {
    renderCard({ ...baseTicket, tags: [] })
    expect(screen.queryByRole('generic', { name: /badge/i })).not.toBeInTheDocument()
  })

  it('color=red 时左边框包含红色 class', () => {
    const { container } = renderCard({ ...baseTicket, color: 'red' })
    const card = container.firstChild as HTMLElement
    const expectedClass = getColorBorderClass('red')
    // 拆分 class 字符串逐一检查
    for (const cls of expectedClass.split(' ')) {
      expect(card).toHaveClass(cls)
    }
  })

  it('color=null 时左边框为透明', () => {
    const { container } = renderCard({ ...baseTicket, color: null })
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('border-l-transparent')
  })

  it('已完成时标题有 line-through class', () => {
    renderCard({ ...baseTicket, completed: true })
    const title = screen.getByText('修复登录 Bug')
    expect(title).toHaveClass('line-through')
  })

  it('未完成时标题无 line-through class', () => {
    renderCard({ ...baseTicket, completed: false })
    const title = screen.getByText('修复登录 Bug')
    expect(title).not.toHaveClass('line-through')
  })

  it('已完成时复选框为 checked 状态', () => {
    renderCard({ ...baseTicket, completed: true })
    const checkbox = screen.getByRole('checkbox', { name: /切换完成状态/i })
    expect(checkbox).toBeChecked()
  })

  it('未完成时复选框不为 checked', () => {
    renderCard({ ...baseTicket, completed: false })
    const checkbox = screen.getByRole('checkbox', { name: /切换完成状态/i })
    expect(checkbox).not.toBeChecked()
  })

  it('点击删除 → AlertDialog 出现 → 点击取消 → onDelete 未调用', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    renderCard(baseTicket, { onDelete })

    const deleteBtn = screen.getByTitle('删除')
    await user.click(deleteBtn)

    // AlertDialog 出现
    const cancelBtn = await screen.findByRole('button', { name: /取消/i })
    expect(cancelBtn).toBeInTheDocument()

    await user.click(cancelBtn)
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('点击删除 → AlertDialog → 点击确认 → onDelete 被调用一次', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    renderCard(baseTicket, { onDelete })

    const deleteBtn = screen.getByTitle('删除')
    await user.click(deleteBtn)

    // 在 alertdialog 作用域内查找确认按钮，避免与触发器冲突
    const dialog = await screen.findByRole('alertdialog')
    const confirmAction = within(dialog).getByRole('button', { name: /删除/i })
    await user.click(confirmAction)

    expect(onDelete).toHaveBeenCalledOnce()
    expect(onDelete).toHaveBeenCalledWith('ticket-1')
  })

  it('点击编辑按钮调用 onEdit', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    renderCard(baseTicket, { onEdit })

    await user.click(screen.getByTitle('编辑'))
    expect(onEdit).toHaveBeenCalledWith(baseTicket)
  })
})
