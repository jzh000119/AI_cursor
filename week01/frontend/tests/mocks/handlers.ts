import { http, HttpResponse } from 'msw'
import type { Ticket, Tag } from '@/types'

const BASE = 'http://localhost:8000'

export const MOCK_TAGS: Tag[] = [
  { id: 'tag-1', name: 'bug', ticket_count: 1 },
  { id: 'tag-2', name: 'feature', ticket_count: 2 },
  { id: 'tag-3', name: 'docs', ticket_count: 0 },
]

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 'ticket-1',
    title: '修复登录 Bug',
    description: null,
    color: 'red',
    completed: false,
    tags: [{ id: 'tag-1', name: 'bug' }],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ticket-2',
    title: '开发用户中心',
    description: '包含个人信息编辑',
    color: 'blue',
    completed: false,
    tags: [{ id: 'tag-2', name: 'feature' }],
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 'ticket-3',
    title: '更新 API 文档',
    description: null,
    color: null,
    completed: true,
    tags: [],
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
]

export const handlers = [
  http.get(`${BASE}/tickets`, () => {
    return HttpResponse.json({
      items: MOCK_TICKETS,
      total: MOCK_TICKETS.length,
      limit: 20,
      offset: 0,
    })
  }),

  http.post(`${BASE}/tickets`, async ({ request }) => {
    const body = (await request.json()) as { title: string; color?: string | null }
    const newTicket: Ticket = {
      id: 'ticket-new',
      title: body.title,
      description: null,
      color: (body.color as Ticket['color']) ?? null,
      completed: false,
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(newTicket, { status: 201 })
  }),

  http.patch(`${BASE}/tickets/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Partial<Ticket>
    const ticket = MOCK_TICKETS.find((t) => t.id === params.id) ?? MOCK_TICKETS[0]
    return HttpResponse.json({ ...ticket, ...body })
  }),

  http.delete(`${BASE}/tickets/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${BASE}/tags`, () => {
    return HttpResponse.json(MOCK_TAGS)
  }),

  http.post(`${BASE}/tags`, async ({ request }) => {
    const body = (await request.json()) as { name: string }
    const newTag: Tag = { id: 'tag-new', name: body.name, ticket_count: 0 }
    return HttpResponse.json(newTag, { status: 201 })
  }),

  http.post(`${BASE}/tickets/:id/tags`, async ({ params }) => {
    const ticket = MOCK_TICKETS.find((t) => t.id === params.id) ?? MOCK_TICKETS[0]
    return HttpResponse.json({
      ...ticket,
      tags: [...ticket.tags, { id: 'tag-new', name: '新标签' }],
    })
  }),

  http.delete(`${BASE}/tickets/:id/tags/:tagId`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
