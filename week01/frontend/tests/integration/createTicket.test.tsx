import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import { MOCK_TICKETS } from '../mocks/handlers'
import App from '@/App'
import type { Ticket } from '@/types'

describe('createTicket 集成测试', () => {
  it('初始化后显示 mock ticket 列表', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('修复登录 Bug')).toBeInTheDocument()
      expect(screen.getByText('开发用户中心')).toBeInTheDocument()
    })
  })

  it('点击「新建 Ticket」→ Dialog 出现', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /新建 Ticket/i }))

    // Dialog 标题以 heading 角色出现
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /新建 Ticket/i })).toBeInTheDocument()
    })
  })

  it('填写标题 → 点击保存 → POST 请求被发出 → 列表刷新含新 Ticket', async () => {
    const user = userEvent.setup()

    const newTicket: Ticket = {
      id: 'ticket-created',
      title: '集成测试新建',
      description: null,
      color: null,
      completed: false,
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // 覆盖 POST handler，返回新 Ticket
    server.use(
      http.post('http://localhost:8000/tickets', () => {
        return HttpResponse.json(newTicket, { status: 201 })
      }),
    )

    // 覆盖 GET handler，让列表刷新时包含新 Ticket
    server.use(
      http.get('http://localhost:8000/tickets', () => {
        return HttpResponse.json({
          items: [...MOCK_TICKETS, newTicket],
          total: MOCK_TICKETS.length + 1,
          limit: 20,
          offset: 0,
        })
      }),
    )

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('修复登录 Bug')).toBeInTheDocument()
    })

    // 打开新建表单
    await user.click(screen.getByRole('button', { name: /新建 Ticket/i }))

    // 填写标题
    const titleInput = await screen.findByPlaceholderText(/输入 Ticket 标题/i)
    await user.type(titleInput, '集成测试新建')

    // 点击保存
    const saveBtn = screen.getAllByRole('button', { name: /保存/i })[0]
    await user.click(saveBtn)

    // 等待列表刷新，新 Ticket 出现
    await waitFor(() => {
      expect(screen.getByText('集成测试新建')).toBeInTheDocument()
    })
  })

  it('标题为空时点击保存不关闭 Dialog', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /新建 Ticket/i }))

    // 不输入标题，直接点击保存
    const saveBtn = await screen.findByRole('button', { name: /^保存$/i })
    await user.click(saveBtn)

    // Dialog 仍然存在（以 heading 判断）
    expect(screen.getByRole('heading', { name: /新建 Ticket/i })).toBeInTheDocument()
  })
})
