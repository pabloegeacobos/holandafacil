import { describe, expect, it } from 'vitest'
import { checks } from './checks'
import { classify } from './classify'
import { parse } from './parsers/core'
import { pws } from './__fixtures__/pws'
import type { Contrato, Respuestas } from './types'

const NADA: Respuestas = { fee: null, contrato: null, snf: null, poder: null, extHous: null, transport: null, bici: null }

describe('checks() — bajada de tarifa, reset FJ, brecha de vivienda', () => {
  const s16 = parse(pws(), 'w16.pdf')
  const s17 = parse(pws({ week: 17, periode: '20-04-2026', uurloon: '14,71', linea: '558,98', bruto: '558,98', fj: 1, inlener: 'Otra Empresa Erp' }), 'w17.pdf')
  s17.fj = 0 // reset simulado
  const R2 = classify([s16, s17])
  const contratos: Contrato[] = [{ desde: '2026-04-01', hasta: '', importe: 172.02 }]
  const A = checks(R2, contratos, '21', { fee: 'si', contrato: 'no', snf: null, poder: null, extHous: null, transport: null, bici: null })
  const titles = A.OK.map((x) => x.t).join(' | ')

  it('detecta bajada de tarifa y reset de functiejaar', () => {
    expect(/bajaron la tarifa/.test(titles)).toBe(true)
    expect(/functiejaar bajó/.test(titles)).toBe(true)
    const cardFj = A.OK.find((x) => /functiejaar bajó/.test(x.t))
    expect(cardFj?.p.indexOf('eso no lo puedo comprobar yo')).toBeGreaterThan(-1) // no afirma violación sin verificar sector/puesto
  })

  it('detecta suelo exacto, Waadi y deducción sin papeles', () => {
    expect(/exactamente en el mínimo/.test(titles)).toBe(true)
    expect(/ILEGAL/.test(titles)).toBe(true)
    expect(/tope del CAO/.test(titles)).toBe(true)
    expect(/podría ser ilegal/.test(titles)).toBe(true)
  })

  it('calcula la brecha de vivienda semana a semana, sin medias', () => {
    // 2 semanas × (172,02 − 147,10) = 49,84
    expect(Math.round((A.agg as { gapTot: number }).gapTot * 100) / 100).toBe(49.84)
    expect((A.agg as { gapSem: number }).gapSem).toBe(2)
  })
})

describe('checks() — caducidad del mínimo legal', () => {
  it('nómina de julio con mínimo impreso desfasado: chequeo retirado a propósito', () => {
    // "mínimo impreso desfasado" se retiró (13-07-2026): lo que la nómina
    // imprime como referencia es irrelevante; solo importa lo cobrado.
    const jul = parse(pws({ week: 28, periode: '06-07-2026' }), 'w28.pdf') // fixture imprime 14,71
    const Rj = classify([jul])
    const Aj = checks(Rj, [], '21', NADA)
    expect((Aj.agg as Record<string, unknown>).wmlDesfasado).toBeUndefined()
    expect(/mínimo legal desactualizado/.test(Aj.OK.map((x) => x.t).join('|'))).toBe(false)
  })
})

describe('checks() — topes de vivienda (PKS y 25%×WML×40)', () => {
  it('un contrato de 150/sem supera housAt pero no el PKS', () => {
    const A1 = checks(classify([parse(pws(), 'w16.pdf')]), [{ desde: '2026-01-01', hasta: '', importe: 150 }], '21', NADA)
    expect((A1.agg as { housSem: number }).housSem).toBe(1)
    expect((A1.agg as { pksSem: number }).pksSem).toBe(0)
  })

  it('en el segundo semestre también supera housAt (fórmula, no tabla con vigencia)', () => {
    const jul = parse(pws({ week: 28, periode: '06-07-2026' }), 'w28.pdf')
    const A2 = checks(classify([jul]), [{ desde: '2026-01-01', hasta: '', importe: 150 }], '21', NADA)
    expect((A2.agg as { housSem: number }).housSem).toBe(1)
  })

  it('tarjeta PKS: norma en una frase, semana y valores citados', () => {
    const c165: Contrato[] = [{ desde: '2026-01-01', hasta: '', importe: 165 }] // supera PKS (159,85)
    const A165 = checks(classify([parse(pws(), 'w16.pdf')]), c165, '21', NADA)
    const pksCard = A165.OK.find((x) => /tope del CAO ABU/.test(x.t))
    expect(!!pksCard).toBe(true)
    expect(/máximo €159,85/.test(pksCard!.p)).toBe(true)
    expect(/2026-S16: te cobran €165,00 \(tope €159,85\)/.test(pksCard!.pills.join('|'))).toBe(true)
    expect(A165.OK.some((x) => /toca el tope exacto/.test(x.t))).toBe(false) // tarjeta de margen0 retirada
  })
})

describe('checks() — sin instrucciones de a dónde acudir en los mensajes', () => {
  it('no menciona FNV ni SNCU', () => {
    const Rc = classify([parse(pws(), 'w16.pdf'), parse(pws({ uurloon: '15,80' }), 'w16b.pdf')])
    const Ac = checks(Rc, [], '21', NADA)
    const conflictoCard = Ac.REV.find((x) => /dos nóminas distintas/.test(x.t))
    expect(/FNV/.test(conflictoCard!.p)).toBe(false)
    expect(/SNCU/.test(conflictoCard!.p)).toBe(false)
  })
})

describe('checks() — tarjetas honestas para lo no identificable', () => {
  it('nunca se juzga si la agencia es "reconocida"', () => {
    const otroFormato = 'Loonstrook\nMedewerker: XX\nSalaris deze periode: 450,00\n'
    const rOtro = parse(otroFormato, 'sin-fecha.pdf')
    const Rf = classify([rOtro, { file: 'foto.pdf', error: 1, notes: [] }])
    const Af = checks(Rf, [], '21', NADA)
    const titlesF = Af.REV.map((x) => x.t).join('|')
    expect(/sin semana identificable/.test(titlesF)).toBe(true)
    expect(/no se pudieron abrir/.test(titlesF)).toBe(true)
    expect(/reconozco|no reconocid/i.test(Af.REV.map((x) => x.t + x.p).join(' '))).toBe(false)
  })

  it('tarjeta de parcial muestra lo que sí se encontró, sin culpar a ninguna agencia', () => {
    const parcialTxt = 'Periode: 08-06-2026 t/m 14-06-2026\nTijdvak: Week 24 (2026)\nTotaal bruto loon 500,00\nDe inhouding voor huisvesting is € 147,10\nVakantiegeld 4 IB + IIB 8,33%\n'
    const rParcial = parse(parcialTxt, 'parcial.pdf')
    const Rp = classify([rParcial])
    const Ap = checks(Rp, [], '21', NADA)
    const parcialCard = Ap.REV.find((x) => /sin tarifa por hora/.test(x.t))
    expect(!!parcialCard).toBe(true)
    expect(/bruto €500,00/.test(parcialCard!.pills.join('|'))).toBe(true)
    expect(/vivienda €147,10/.test(parcialCard!.pills.join('|'))).toBe(true)
    expect(/agencia/i.test(parcialCard!.t + parcialCard!.p)).toBe(false)
  })

  it('semana de solo vacaciones: tarjeta honesta, no "agencia no reconocida"', () => {
    const pwsVac = `Loonheffingennummer :8510.21.384
Periode: 11-05-2026
Tijdvak: Week 20 (2026)
Feestdagen 4 T 129,76 129,76
Vakantiedagen 4 T 519,04 519,04
Totaal bruto loon 702,85
De inhouding voor huisvesting is € 147,10
Netto te betalen 396,16`
    const rV = parse(pwsVac, 'vac.pdf')
    const Rvac = classify([rV])
    const Avac = checks(Rvac, [], '21', NADA)
    const titlesVac = Avac.REV.map((x) => x.t).join('|')
    expect(/festivo\/vacaciones/.test(titlesVac)).toBe(true)
    expect(/agencia/i.test(titlesVac)).toBe(false)
    const cardVac = Avac.REV.find((x) => /festivo\/vacaciones/.test(x.t))
    expect(/te siguieron descontando la vivienda/.test(cardVac!.p)).toBe(true)
  })
})
