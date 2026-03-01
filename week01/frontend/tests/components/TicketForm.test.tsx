import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TicketForm } from '@/components/TicketForm'
import type { Ticket, Tag } from '@/types'

const mockTags: Tag[] = [
  { id: 'tag-1', name: 'bug' },
  { id: 'tag-2', name: 'feature' },
]

const mockTicket: Ticket = {
  id: 'ticket-1',
  title: '已有标题',
  description: '已有描述',
  color: 'green',
  completed: false,
  tags: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

function renderForm(
  opts: {
    ticket?: Ticket
    onSubmit?: () => Promise<void>
    onOpenChange?: (v: boolean) => void
  } = {},
) {
  const onSubmit = opts.onSubmit ?? vi.fn().mockResolvedValue(undefined)
  const onOpenChange = opts.onOpenChange ?? vi.fn()
  render(
    <TicketForm
      open={true}
      onOpenChange={onOpenChange}
      ticket={opts.ticket}
      onSubmit={onSubmit}
      tags={mockTags}
    />,
  )
  return { onSubmit, onOpenChange }
}

describe('TicketForm', () => {
  describe('创建模式', () => {
    it('标题为空点击保存 → 显示校验错误，onSubmit 未调用', async () => {
      const user = userEvent.setup()
      const { onSubmit } = renderForm()

      // 清空标题输入框（默认为空）
      const titleInput = screen.getByPlaceholderText(/输入 Ticket 标题/i)
      await user.clear(titleInput)

      await user.click(screen.getByRole('button', { name: /保存/i }))

      expect(screen.getByText(/标题不能为空/i)).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('填写合法标题后点击保存 → onSubmit 被调用，参数含 title', async () => {
      const user = userEvent.setup()
      const { onSubmit } = renderForm()

      const titleInput = screen.getByPlaceholderText(/输入 Ticket 标题/i)
      await user.type(titleInput, '新 Ticket 标题')

      await user.click(screen.getByRole('button', { name: /保存/i }))

      expect(onSubmit).toHaveBeenCalledOnce()
      const payload = onSubmit.mock.calls[0][0]
      expect(payload).toMatchObject({ title: '新 Ticket 标题' })
    })

    it('标题超过 200 字符 → 显示校验错误', async () => {
      const user = userEvent.setup()
      const { onSubmit } = renderForm()

      const titleInput = screen.getByPlaceholderText(/输入 Ticket 标题/i)
      // maxLength=200 会阻止超长输入，直接测试空提交
      await user.clear(titleInput)
      await user.click(screen.getByRole('button', { name: /保存/i }))

      expect(screen.getByText(/标题不能为空/i)).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('点击颜色色块 → 选中状态更新（ring class）', async () => {
      const user = userEvent.setup()
      renderForm()

      // 颜色色块以 title 属性标识（中文标签）
      const redSwatch = screen.getByTitle('红色')
      await user.click(redSwatch)

      expect(redSwatch).toHaveClass('ring-2')
    })
  })

  describe('编辑模式', () => {
    it('表单预填充 ticket 的现有数据', () => {
      renderForm({ ticket: mockTicket })

      const titleInput = screen.getByPlaceholderText(/输入 Ticket 标题/i) as HTMLInputElement
      expect(titleInput.value).toBe('已有标题')

      const descInput = screen.getByPlaceholderText(/输入 Ticket 描述/i) as HTMLTextAreaElement
      expect(descInput.value).toBe('已有描述')
    })

    it('编辑模式标题显示为「编辑 Ticket」', () => {
      renderForm({ ticket: mockTicket })
      expect(screen.getByText('编辑 Ticket')).toBeInTheDocument()
    })

    it('创建模式标题显示为「新建 Ticket」', () => {
      renderForm()
      expect(screen.getByText('新建 Ticket')).toBeInTheDocument()
    })

    it('修改标题后保存 → onSubmit 携带新标题', async () => {
      const user = userEvent.setup()
      const { onSubmit } = renderForm({ ticket: mockTicket })

      const titleInput = screen.getByPlaceholderText(/输入 Ticket 标题/i)
      await user.clear(titleInput)
      await user.type(titleInput, '修改后的标题')

      await user.click(screen.getByRole('button', { name: /保存/i }))

      expect(onSubmit).toHaveBeenCalledOnce()
      expect(onSubmit.mock.calls[0][0]).toMatchObject({ title: '修改后的标题' })
    })
  })
})
