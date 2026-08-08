import { describe, expect, it } from 'vitest'
import { construirCASO, diaAnterior } from './caso-adapter'
import { classify } from './classify'
import { parse } from './parsers/core'
import { pws } from './__fixtures__/pws'
import type { Contrato } from './types'

describe('construirCASO() — traduce classify()/CT al formato de la plantilla', () => {
  const casoRecs = [
    parse(pws({ week: 15, periode: '06-04-2026' }), 'a.pdf'),
    parse(pws({ week: 16 }), 'b.pdf'), // S16, la fixture base
    parse(pws({ week: 17, periode: '20-04-2026', horas: '-38:00', linea: '-616,36', bruto: '-642,10' }), 'storno.pdf'),
  ]
  const Rcaso = classify(casoRecs)
  const CTcaso: Contrato[] = [{ desde: '2026-01-01', hasta: '', importe: 150 }]
  const caso = construirCASO(Rcaso, CTcaso)

  it('demo=false y el storno nunca aparece', () => {
    expect(caso.demo).toBe(false)
    expect(caso.semanas.length).toBe(2) // storno excluido
    expect(caso.semanas.some((s) => s.semana === '2026-S17')).toBe(false)
  })

  it('periodo, empleador y datos de la semana', () => {
    expect(caso.periodo.desde + '|' + caso.periodo.hasta).toBe('2026-S15|2026-S16')
    expect(caso.empleador.nombre).toBe('People Work Service B.V.')
    expect(caso.semanas[1].tarifa === 16.22 && caso.semanas[1].vivienda === 147.1).toBe(true)
  })

  it('normas con artículo y vigencia verificados', () => {
    expect(caso.normas.some((n) => n.articulo === 'art. 8' && n.valor === 14.71)).toBe(true)
    expect(caso.normas.some((n) => n.articulo === 'art. 15' && n.valor === 8)).toBe(true)
    expect(caso.normas.some((n) => /Anexo V/.test(n.articulo) && n.valor === 159.85)).toBe(true)
    expect(caso.normas.some((n) => /25%/.test(n.concepto))).toBe(false) // el 25% de vivienda no se imprime sin artículo verificado
    expect(caso.normasPendientes.some((p) => /25%/.test(p))).toBe(true)
  })

  it('documentosNoAportados refleja si hay contrato de vivienda', () => {
    expect(construirCASO(Rcaso, []).documentosNoAportados.indexOf('Contrato o anexo de vivienda')).toBeGreaterThan(-1)
    expect(caso.documentosNoAportados.indexOf('Contrato o anexo de vivienda')).toBe(-1) // con contrato subido, no lo pide
  })

  it('convenioAsumido siempre null: la herramienta no decide el convenio', () => {
    expect(caso.convenioAsumido).toBeNull()
  })
})

describe('construirCASO() — conflictos aportan las dos versiones', () => {
  it('ninguna versión se descarta', () => {
    const conf = [parse(pws({ week: 20 }), 'c1.pdf'), parse(pws({ week: 20, uurloon: '15,80' }), 'c2.pdf')]
    const Rconf = classify(conf)
    const casoConf = construirCASO(Rconf, [])
    expect(casoConf.semanas.filter((s) => s.semana === '2026-S20').length).toBe(2)
    expect(
      casoConf.semanas
        .filter((s) => s.semana === '2026-S20')
        .map((s) => s.tarifa)
        .sort()
        .join(','),
    ).toBe('15.8,16.22')
  })
})

describe('construirCASO() — vacaciones/festivo entran con horasFestivo, no con tarifa', () => {
  it('conserva la vivienda aunque no haya tarifa', () => {
    const vacRec = parse(
      `People Work Service B.V.
Ruijschenberghstraat 1
5421KR Gemert
Loonheffingennummer :8510.21.384
Periode: 11-05-2026
Tijdvak: Week 20 (2026)
Minimumuurloon: € 14,71
Feestdagen 4 T 129,76 129,76
Vakantiedagen 4 T 519,04 519,04
Totaal bruto loon 702,85
De inhouding voor huisvesting is € 147,10
Netto te betalen 396,16`,
      'vac.pdf',
    )
    const Rvac2 = classify([vacRec])
    const casoVac = construirCASO(Rvac2, [])
    expect(casoVac.semanas[0].tarifa).toBeNull()
    expect(casoVac.semanas[0].vivienda).toBe(147.1)
  })
})

describe('diaAnterior() — cierra correctamente la vigencia del tramo WML anterior', () => {
  it('caso normal y cruce de año', () => {
    expect(diaAnterior('2026-07-01')).toBe('2026-06-30')
    expect(diaAnterior('2026-01-01')).toBe('2025-12-31')
  })
})
