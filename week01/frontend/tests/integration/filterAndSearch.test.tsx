import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import { MOCK_TICKETS } from '../mocks/handlers'
import App from '@/App'

afterEach(() => {
  vi.useRealTimers()
})

describe('filterAndSearch 集成测试', () => {
  it('初始渲染展示全部 mock tickets', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('修复登录 Bug')).toBeInTheDocument()
      expect(screen.getByText('开发用户中心')).toBeInTheDocument()
      expect(screen.getByText('更新 API 文档')).toBeInTheDocument()
    })
  })

  it('输入搜索关键词（等待防抖）→ GET 请求携带 q= 参数', async () => {
    vi.useFakeTimers()

    let capturedUrl = ''
    server.use(
      http.get('http://localhost:8000/tickets', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ items: [], total: 0, limit: 20, offset: 0 })
      }),
    )

    render(<App />)

    // getByPlaceholderText 是同步查询，不受 fake timers 影响
    const searchInput = screen.getByPlaceholderText(/搜索 Ticket/i)
    fireEvent.change(searchInput, { target: { value: '前端' } })

    // async act 推进计时器并 flush 所有 React 更新和副作用
    await act(async () => {
      vi.advanceTimersByTime(400)
    })

    vi.useRealTimers()

    await waitFor(() => {
      expect(capturedUrl).toContain('q=')
    })
  })

  it('点击「已完成」Tab → GET 请求携带 completed=true', async () => {
    const user = userEvent.setup()

    let capturedUrl = ''
    server.use(
      http.get('http://localhost:8000/tickets', ({ request }) => {
        capturedUrl = request.url
        const completedTickets = MOCK_TICKETS.filter((t) => t.completed)
        return HttpResponse.json({
          items: completedTickets,
          total: completedTickets.length,
          limit: 20,
          offset: 0,
        })
      }),
    )

    render(<App />)

    const doneTab = await screen.findByRole('tab', { name: /已完成/i })
    await user.click(doneTab)

    await waitFor(() => {
      expect(capturedUrl).toContain('completed=true')
    })
  })

  it('点击「未完成」Tab → GET 请求携带 completed=false', async () => {
    const user = userEvent.setup()

    let capturedUrl = ''
    server.use(
      http.get('http://localhost:8000/tickets', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ items: [], total: 0, limit: 20, offset: 0 })
      }),
    )

    render(<App />)

    const activeTab = await screen.findByRole('tab', { name: /未完成/i })
    await user.click(activeTab)

    await waitFor(() => {
      expect(capturedUrl).toContain('completed=false')
    })
  })

  it('点击侧边栏标签 → GET 请求携带 tag_ids= 参数', async () => {
    const user = userEvent.setup()

    let capturedUrl = ''
    server.use(
      http.get('http://localhost:8000/tickets', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ items: [], total: 0, limit: 20, offset: 0 })
      }),
    )

    render(<App />)

    // 等待侧边栏标签渲染（来自 GET /tags mock）
    const tagBtn = await screen.findByRole('button', { name: /bug/i })
    await user.click(tagBtn)

    await waitFor(() => {
      expect(capturedUrl).toContain('tag_ids=')
    })
  })

  it('点击「无标签」筛选 → GET 请求携带 no_tags=true', async () => {
    const user = userEvent.setup()

    let capturedUrl = ''
    server.use(
      http.get('http://localhost:8000/tickets', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ items: [], total: 0, limit: 20, offset: 0 })
      }),
    )

    render(<App />)

    const noTagsBtn = await screen.findByRole('button', { name: /无标签/i })
    await user.click(noTagsBtn)

    await waitFor(() => {
      expect(capturedUrl).toContain('no_tags=true')
    })
  })
})
