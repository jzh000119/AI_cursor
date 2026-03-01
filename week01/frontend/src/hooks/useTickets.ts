import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  fetchTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} from '@/api/tickets'
import type { Ticket, TicketFilters, TicketCreatePayload, TicketUpdatePayload } from '@/types'

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTickets = useCallback(async (filters: TicketFilters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchTickets(filters)
      setTickets(res.items)
      setTotal(res.total)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load tickets'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const addTicket = useCallback(
    async (payload: TicketCreatePayload, filters?: TicketFilters) => {
      try {
        await createTicket(payload)
        toast.success('Ticket 已创建')
        await loadTickets(filters)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create ticket'
        toast.error(msg)
        throw err
      }
    },
    [loadTickets],
  )

  const editTicket = useCallback(async (id: string, payload: TicketUpdatePayload) => {
    try {
      const updated = await updateTicket(id, payload)
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)))
      toast.success('Ticket 已更新')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update ticket'
      toast.error(msg)
      throw err
    }
  }, [])

  const removeTicket = useCallback(async (id: string) => {
    try {
      await deleteTicket(id)
      setTickets((prev) => prev.filter((t) => t.id !== id))
      setTotal((prev) => prev - 1)
      toast.success('Ticket 已删除')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete ticket'
      toast.error(msg)
      throw err
    }
  }, [])

  const toggleCompleted = useCallback(
    async (id: string, currentValue: boolean) => {
      try {
        const updated = await updateTicket(id, { completed: !currentValue })
        setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update ticket'
        toast.error(msg)
        throw err
      }
    },
    [],
  )

  return { tickets, total, loading, error, loadTickets, addTicket, editTicket, removeTicket, toggleCompleted, setTickets }
}
