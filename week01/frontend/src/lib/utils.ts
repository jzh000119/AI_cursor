import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { TicketColor } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const COLOR_BORDER_CLASS: Record<NonNullable<TicketColor> | 'none', string> = {
  none: 'border-l-4 border-l-transparent',
  red: 'border-l-4 border-l-red-500',
  orange: 'border-l-4 border-l-orange-500',
  yellow: 'border-l-4 border-l-yellow-500',
  green: 'border-l-4 border-l-green-500',
  blue: 'border-l-4 border-l-blue-500',
  purple: 'border-l-4 border-l-purple-500',
  gray: 'border-l-4 border-l-gray-500',
}

/** 标签徽章用细色条（2px），与 getColorBorderClass 同套色值；无颜色时透明 */
const TAG_BADGE_BORDER_CLASS: Record<NonNullable<TicketColor> | 'none', string> = {
  none: 'border-l-2 border-l-transparent',
  red: 'border-l-2 border-l-red-500',
  orange: 'border-l-2 border-l-orange-500',
  yellow: 'border-l-2 border-l-yellow-500',
  green: 'border-l-2 border-l-green-500',
  blue: 'border-l-2 border-l-blue-500',
  purple: 'border-l-2 border-l-purple-500',
  gray: 'border-l-2 border-l-gray-500',
}

const TAG_COLORS: NonNullable<TicketColor>[] = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'gray',
]

/** Ticket 颜色对应的十六进制色值，用于内联 style，避免被全局 border-color 覆盖 */
export const COLOR_HEX: Record<NonNullable<TicketColor> | 'none', string> = {
  none: 'transparent',
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
  gray: '#6b7280',
}

/** 用于卡片/徽章左边框的内联 style（保证颜色不被全局样式覆盖） */
export function getColorBorderStyle(color: TicketColor): { borderLeftColor: string } {
  return { borderLeftColor: COLOR_HEX[color ?? 'none'] }
}

/** 根据标签名生成稳定颜色，用于侧栏和卡片上标签的视觉区分 */
export function getTagColorFromName(name: string): NonNullable<TicketColor> {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % TAG_COLORS.length
  return TAG_COLORS[index]
}

/** 标签用色条样式（左侧 4px 竖条），用于侧栏列表项 */
export function getTagColorBorderClass(tagName: string): string {
  return COLOR_BORDER_CLASS[getTagColorFromName(tagName)]
}

/** 标签徽章用细色条（左侧 2px），按标签名显示颜色，用于侧栏等 */
export function getTagBadgeBorderClass(tagName: string): string {
  return TAG_BADGE_BORDER_CLASS[getTagColorFromName(tagName)]
}

/** 卡片上标签徽章使用 Ticket 在编辑里选中的颜色 */
export function getColorBadgeBorderClass(color: TicketColor): string {
  return TAG_BADGE_BORDER_CLASS[color ?? 'none']
}

export function getColorBorderClass(color: TicketColor): string {
  return COLOR_BORDER_CLASS[color ?? 'none']
}
