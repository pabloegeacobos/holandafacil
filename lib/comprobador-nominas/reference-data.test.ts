import { describe, expect, it } from 'vitest'
import { housAt, minAt, topeAt, wmlAt, wmlExpira } from './reference-data'

describe('minAt() — mínimo por edad y fecha', () => {
  it('adultos (21+)', () => {
    expect(minAt('2026-04-13', '21')).toBe(14.71)
    expect(minAt('2026-07-12', '21')).toBe(14.99)
  })
  it('jeugdloon a 18 años', () => {
    expect(minAt('2026-04-13', '18')).toBe(7.36) // 14,71 × 0,50 redondeado
  })
  it('tabla jeugdloon completa contra julio 2026 (Rijksoverheid)', () => {
    expect(minAt('2026-07-06', '20')).toBe(11.99)
    expect(minAt('2026-07-06', '19')).toBe(8.99)
    expect(minAt('2026-07-06', '18')).toBe(7.5)
    expect(minAt('2026-07-06', '17')).toBe(5.92)
    expect(minAt('2026-07-06', '16')).toBe(5.17)
    expect(minAt('2026-07-06', '15')).toBe(4.5)
  })
})

describe('wmlAt() / wmlExpira() — caducidad de la tabla', () => {
  it('el motor deja de afirmar pasada la vigencia conocida', () => {
    expect(wmlExpira()).toBe('2027-01-01')
    expect(wmlAt('2026-12-28')?.t).toBe(14.99)
    expect(wmlAt('2027-01-05')).toBeNull()
    expect(minAt('2027-01-05', '21')).toBeNull()
  })
  it('sin tabla para fechas anteriores a 2024: no se afirma nada', () => {
    expect(wmlAt('2022-09-19')).toBeNull()
  })
})

describe('topeAt() / housAt() — topes de vivienda con vigencia', () => {
  it('topeAt respeta el rango de vigencia de la tabla', () => {
    expect(topeAt([{ d: '2026-01-01', h: '2027-12-31', t: 159.85 }], '2026-07-06')).toBe(159.85)
    expect(topeAt([{ d: '2026-01-01', h: '2026-06-30', t: 134.64 }], '2026-07-06')).toBeNull()
  })
  it('housAt(): fórmula 25% × WML × 40, confirmada contra fuente (ABU/FlexExpert, 13-07-2026)', () => {
    expect(housAt('2026-04-13')).toBe(147.1) // 25%×14,71×40
    expect(housAt('2026-07-06')).toBe(149.9) // 25%×14,99×40
    expect(housAt('2027-01-05')).toBeNull() // caducado
  })
})
