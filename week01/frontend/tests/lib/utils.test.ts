import { describe, it, expect } from 'vitest'
import { getColorBorderClass } from '@/lib/utils'
import type { TicketColor } from '@/types'

describe('getColorBorderClass', () => {
  it('null 返回透明边框 class', () => {
    const cls = getColorBorderClass(null)
    expect(cls).toContain('border-l-transparent')
  })

  it('red 返回红色边框 class', () => {
    const cls = getColorBorderClass('red')
    expect(cls).toContain('border-l-red-500')
  })

  it('遍历全部 7 种颜色，确认均有对应 class', () => {
    const colors: NonNullable<TicketColor>[] = [
      'red',
      'orange',
      'yellow',
      'green',
      'blue',
      'purple',
      'gray',
    ]
    const expectedKeywords: Record<NonNullable<TicketColor>, string> = {
      red: 'red',
      orange: 'orange',
      yellow: 'yellow',
      green: 'green',
      blue: 'blue',
      purple: 'purple',
      gray: 'gray',
    }
    for (const color of colors) {
      const cls = getColorBorderClass(color)
      expect(cls).toContain(`border-l-${expectedKeywords[color]}-500`)
    }
  })

  it('所有颜色返回的 class 均包含 border-l-4', () => {
    const colors: TicketColor[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray', null]
    for (const color of colors) {
      const cls = getColorBorderClass(color)
      expect(cls).toContain('border-l-4')
    }
  })
})
