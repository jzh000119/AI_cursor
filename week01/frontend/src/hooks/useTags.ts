import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { fetchTags, createTag, deleteTag } from '@/api/tags'
import type { Tag } from '@/types'

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)

  const loadTags = useCallback(async (withCount?: boolean) => {
    setLoading(true)
    try {
      const res = await fetchTags(withCount)
      setTags(res)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load tags'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const addTag = useCallback(async (name: string) => {
    try {
      const tag = await createTag(name)
      setTags((prev) => [...prev, tag])
      toast.success('标签已创建')
      return tag
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create tag'
      toast.error(msg)
      throw err
    }
  }, [])

  const removeTag = useCallback(async (id: string) => {
    try {
      await deleteTag(id)
      setTags((prev) => prev.filter((t) => t.id !== id))
      toast.success('标签已删除')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete tag'
      toast.error(msg)
      throw err
    }
  }, [])

  return { tags, loading, loadTags, addTag, removeTag }
}
