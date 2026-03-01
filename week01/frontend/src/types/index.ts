export type TicketColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray' | null

export interface Tag {
  id: string
  name: string
  ticket_count?: number
}

export interface Ticket {
  id: string
  title: string
  description: string | null
  color: TicketColor
  completed: boolean
  tags: Tag[]
  created_at: string
  updated_at: string
}

export interface TicketListResponse {
  items: Ticket[]
  total: number
  limit: number
  offset: number
}

export interface TicketCreatePayload {
  title: string
  description?: string | null
  color?: TicketColor
  tag_ids?: string[]
}

export interface TicketUpdatePayload {
  title?: string
  description?: string | null
  color?: TicketColor
  completed?: boolean
}

export interface TicketFilters {
  q?: string
  completed?: boolean
  tag_ids?: string[]
  no_tags?: boolean
  limit?: number
  offset?: number
}
