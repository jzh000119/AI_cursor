import { apiFetch } from './client'
import type { Tag } from '@/types'

export function fetchTags(withCount?: boolean): Promise<Tag[]> {
  const qs = withCount ? '?with_count=true' : ''
  return apiFetch<Tag[]>(`/tags${qs}`)
}

export function createTag(name: string): Promise<Tag> {
  return apiFetch<Tag>('/tags', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export function deleteTag(id: string): Promise<void> {
  return apiFetch<void>(`/tags/${id}`, { method: 'DELETE' })
}
