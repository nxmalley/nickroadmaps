import { describe, it, expect } from 'vitest'

describe('Test setup', () => {
  it('vitest runs correctly', () => {
    expect(true).toBe(true)
  })

  it('jest-dom matchers are available', () => {
    const div = document.createElement('div')
    div.textContent = 'hello'
    document.body.appendChild(div)
    expect(div).toBeInTheDocument()
    document.body.removeChild(div)
  })
})
