import { describe, expect, it } from 'vitest'
import { escanearContrato, parseContrato, veredictoPKS } from './contrato'

describe('veredictoPKS() — confirma o niega el tope directamente', () => {
  it('dentro del tope (< PKS y < housAt)', () => {
    expect(veredictoPKS({ importe: 145, desde: '2026-04-13' })?.ok).toBe(true)
  })
  it('supera PKS y usa el tipo y la norma correctos', () => {
    const v = veredictoPKS({ importe: 165, desde: '2026-04-13' })
    expect(v?.ok).toBe(false)
    expect(v?.tipo).toBe('PKS')
    expect(v?.law).toBe('CAO ABU art. 49.4 + Anexo V')
  })
  it('supera el 25%×WML×40 pero no el PKS, y cita el tope legal', () => {
    const v = veredictoPKS({ importe: 150, desde: '2026-04-13' })
    expect(v?.ok).toBe(false)
    expect(v?.law).toBe('Tope legal')
  })
  it('sin fecha usa hoy, no null', () => {
    expect(veredictoPKS({ importe: 145, desde: '' })).not.toBeNull()
  })
  it('sin importe no afirma nada', () => {
    expect(veredictoPKS({ importe: NaN, desde: '2026-04-13' })).toBeNull()
  })
})

describe('escanearContrato() — cláusulas raras, sin decidir legalidad', () => {
  it('contrato limpio: sin alertas', () => {
    const limpio = 'Huurovereenkomst. Ingangsdatum: 01-01-2026. Huurprijs: € 145,00 per week. Normale voorwaarden.'
    expect(escanearContrato(limpio).length).toBe(0)
  })

  it('detecta cobro por conseguir trabajo y cita la ley Waadi', () => {
    const waadi = 'Huurovereenkomst. De werknemer betaalt bemiddelingskosten voor het vinden van werk.'
    const aw = escanearContrato(waadi)
    expect(aw.length).toBe(1)
    expect(aw[0].law?.indexOf('Waadi')).toBeGreaterThan(-1)
    expect(aw[0].snip.indexOf('bemiddelingskosten')).toBeGreaterThan(-1) // cita el texto literal
  })

  it('detecta fianza para revisar', () => {
    const borg = 'Huurovereenkomst. Waarborgsom: € 500,00 te betalen bij aanvang.'
    expect(escanearContrato(borg).length).toBe(1)
  })

  it('detecta varias cláusulas a la vez', () => {
    const multi = 'Bemiddelingskosten van toepassing. Waarborgsom: € 300,00. Mag geen klacht indienen bij vakbond.'
    expect(escanearContrato(multi).length).toBe(3)
  })
})

describe('parseContrato()', () => {
  it('importe sin decimales y "EUR" en letras', () => {
    const c1 = parseContrato('Artikel 1: De huur bedraagt EUR 145 per week, te voldoen bij vooruitbetaling.')
    expect(c1.importe).toBe(145)
  })
  it('importe con coma decimal y símbolo €', () => {
    const c2 = parseContrato('Huurprijs: € 172,02 per week.')
    expect(c2.importe).toBe(172.02)
  })
})
