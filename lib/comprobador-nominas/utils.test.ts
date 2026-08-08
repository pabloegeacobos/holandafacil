import { describe, expect, it } from 'vitest'
import { num } from './utils'

describe('num() — decimales y miles', () => {
  it('acepta coma decimal, punto decimal y separador de miles', () => {
    expect(num('172,02')).toBe(172.02)
    expect(num('172.02')).toBe(172.02)
    expect(num('1.234,56')).toBe(1234.56)
  })
})
