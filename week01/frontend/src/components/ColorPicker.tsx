import { cn } from '@/lib/utils'
import type { TicketColor } from '@/types'

interface ColorOption {
  value: TicketColor
  bgClass: string
  label: string
}

const COLOR_OPTIONS: ColorOption[] = [
  { value: null, bgClass: 'bg-gray-200', label: '无颜色' },
  { value: 'red', bgClass: 'bg-red-500', label: '红色' },
  { value: 'orange', bgClass: 'bg-orange-500', label: '橙色' },
  { value: 'yellow', bgClass: 'bg-yellow-500', label: '黄色' },
  { value: 'green', bgClass: 'bg-green-500', label: '绿色' },
  { value: 'blue', bgClass: 'bg-blue-500', label: '蓝色' },
  { value: 'purple', bgClass: 'bg-purple-500', label: '紫色' },
  { value: 'gray', bgClass: 'bg-gray-500', label: '灰色' },
]

interface ColorPickerProps {
  value: TicketColor
  onChange: (color: TicketColor) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_OPTIONS.map((opt) => (
        <button
          key={opt.label}
          type="button"
          title={opt.label}
          onClick={() => onChange(opt.value)}
          className={cn(
            'h-6 w-6 rounded-full border border-gray-300 transition-all',
            opt.bgClass,
            value === opt.value && 'ring-2 ring-offset-2 ring-gray-400',
          )}
          aria-label={opt.label}
          aria-pressed={value === opt.value}
        />
      ))}
    </div>
  )
}
