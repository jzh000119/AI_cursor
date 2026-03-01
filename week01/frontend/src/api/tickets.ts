import { apiFetch } from './client'
import type {
  Ticket,
  TicketListResponse,
  TicketCreatePayload,
  TicketUpdatePayload,
  TicketFilters,
} from '@/types'

export function fetchTickets(filters: TicketFilters = {}): Promise<TicketListResponse> {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.completed !== undefined) params.set('completed', String(filters.completed))
  if (filters.tag_ids?.length) {
    filters.tag_ids.forEach((id) => params.append('tag_ids', id))
  }
  if (filters.no_tags) params.set('no_tags', 'true')
  if (filters.limit !== undefined) params.set('limit', String(filters.limit))
  if (filters.offset !== undefined) params.set('offset', String(filters.offset))

  const qs = params.toString()
  return apiFetch<TicketListResponse>(`/tickets${qs ? `?${qs}` : ''}`)
}

export function createTicket(payload: TicketCreatePayload): Promise<Ticket> {
  return apiFetch<Ticket>('/tickets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchTicket(id: string): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${id}`)
}

export function updateTicket(id: string, payload: TicketUpdatePayload): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteTicket(id: string): Promise<void> {
  return apiFetch<void>(`/tickets/${id}`, { method: 'DELETE' })
}

export function addTagToTicket(
  ticketId: string,
  tagId?: string,
  tagName?: string,
): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${ticketId}/tags`, {
    method: 'POST',
    body: JSON.stringify({ tag_id: tagId ?? null, tag_name: tagName ?? null }),
  })
}

export function removeTagFromTicket(ticketId: string, tagId: string): Promise<void> {
  return apiFetch<void>(`/tickets/${ticketId}/tags/${tagId}`, { method: 'DELETE' })
}
