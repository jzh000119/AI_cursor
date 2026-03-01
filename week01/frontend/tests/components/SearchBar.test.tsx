import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { SearchBar } from '@/components/SearchBar'

afterEach(() => {
  vi.useRealTimers()
})

describe('SearchBar', () => {
  it('输入文字后立即不触发 onChange（防抖）', () => {
    vi.useFakeTimers()
    const onChange = vi.fn()

    render(<SearchBar value="" onChange={onChange} />)
    const input = screen.getByPlaceholderText(/搜索 Ticket/i)

    fireEvent.change(input, { target: { value: 'hello' } })

    // 还未到 300ms，onChange 不应被调用
    expect(onChange).not.toHaveBeenCalled()
  })

  it('300ms 后 onChange 被调用，参数为输入值', () => {
    vi.useFakeTimers()
    const onChange = vi.fn()

    render(<SearchBar value="" onChange={onChange} />)
    const input = screen.getByPlaceholderText(/搜索 Ticket/i)

    fireEvent.change(input, { target: { value: 'world' } })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(onChange).toHaveBeenCalledWith('world')
  })

  it('渲染 input 输入框', () => {
    render(<SearchBar value="" onChange={vi.fn()} />)
    expect(screen.getByPlaceholderText(/搜索 Ticket/i)).toBeInTheDocument()
  })

  it('value prop 反映到 input 的当前值', () => {
    render(<SearchBar value="初始值" onChange={vi.fn()} />)
    const input = screen.getByPlaceholderText(/搜索 Ticket/i) as HTMLInputElement
    expect(input.value).toBe('初始值')
  })

  it('连续输入只在最后一次停止 300ms 后触发一次 onChange', () => {
    vi.useFakeTimers()
    const onChange = vi.fn()

    render(<SearchBar value="" onChange={onChange} />)
    const input = screen.getByPlaceholderText(/搜索 Ticket/i)

    fireEvent.change(input, { target: { value: 'a' } })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    fireEvent.change(input, { target: { value: 'ab' } })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    // 还未到第二次输入后的 300ms
    expect(onChange).not.toHaveBeenCalledWith('ab')

    act(() => {
      vi.advanceTimersByTime(300)
    })

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]
    expect(lastCall[0]).toBe('ab')
  })
})
