import { describe, expect, it } from 'vitest'
import { classify, edadDe, periodo, porEmpresa, tramos } from './classify'
import { parse } from './parsers/core'
import { pws } from './__fixtures__/pws'
import type { Registro } from './types'

describe('classify() — cuadre: todo archivo acaba en exactamente un cajón', () => {
  const recs: Registro[] = [
    parse(pws({ week: 10, periode: '09-03-2026' }), 'limpia.pdf'), // semana sin problemas
    parse(pws({ week: 12, periode: '23-03-2026' }), 'dup1.pdf'),
    parse(pws({ week: 12, periode: '23-03-2026' }), 'dup2.pdf'), // duplicado exacto (mismo valor)
    parse(pws({ week: 16 }), 'conf1.pdf'),
    parse(pws({ week: 16, uurloon: '15,80' }), 'conf2.pdf'), // conflicto: mismo período, valor distinto
    parse(pws({ week: 17, periode: '20-04-2026', horas: '-38:00', linea: '-616,36', bruto: '-642,10' }), 'storno.pdf'),
    { file: 'rota.pdf', error: 1 as const, notes: [] },
  ]
  const R = classify(recs)

  it('cuadra el total en las categorías esperadas', () => {
    expect(R.total).toBe(7)
    expect(R.semanas.length).toBe(2) // S10 y S12 (el representante del duplicado)
    expect(R.stornos.length).toBe(1)
    expect(R.ilegibles.length).toBe(1)
    expect(R.duplicados).toBe(1) // dup1+dup2, mismo valor
    expect(R.conflictos.length).toBe(1)
  })

  it('un conflicto no decide ninguna versión', () => {
    expect(R.semanas.some((s) => s.file === 'conf1.pdf' || s.file === 'conf2.pdf')).toBe(false)
    const enConflicto = R.conflictos.reduce((s, c) => s + c.n, 0)
    expect(enConflicto).toBe(2)
    expect(R.semanas.length + R.duplicados + R.stornos.length + R.ilegibles.length + enConflicto).toBe(R.total)
  })
})

describe('classify() — orden cronológico', () => {
  it('conflictos/vacaciones/parciales salen ordenados, no en orden de subida', () => {
    const desordenado = [
      parse(pws({ week: 20, periode: '11-05-2026' }), 'c.pdf'), // conflicto tardío subido primero
      parse(pws({ week: 20, periode: '11-05-2026', uurloon: '15,80' }), 'd.pdf'),
      parse(pws({ week: 10, periode: '09-03-2026' }), 'a.pdf'), // conflicto temprano subido después
      parse(pws({ week: 10, periode: '09-03-2026', uurloon: '14,00' }), 'b.pdf'),
    ]
    const Rord = classify(desordenado)
    expect(Rord.conflictos.map((c) => c.etiq).join(',')).toBe('2026-S10,2026-S20')
  })
})

describe('classify() — "ilegible" distingue causa real', () => {
  it('archivo roto (foto/escaneo) vs sin semana identificable', () => {
    const otroFormato = 'Loonstrook\nMedewerker: XX\nSalaris deze periode: 450,00\n' // sin Periode/Tijdvak/Loon normale uren
    const rOtro = parse(otroFormato, 'sin-fecha.pdf')
    const Rf = classify([rOtro, { file: 'foto.pdf', error: 1, notes: [] }])
    expect(Rf.ilegibles.length).toBe(2)
    expect(Rf.ilegibles.find((u) => u.file === 'sin-fecha.pdf')?.cause).toBe('sin_semana')
    expect(Rf.ilegibles.find((u) => u.file === 'foto.pdf')?.cause).toBe('lectura')
  })
})

describe('classify() — parciales: semana identificada pero sin tarifa por hora', () => {
  it('no se descarta como ilegible; se guarda con lo que sí se pudo leer', () => {
    const parcialTxt = 'Periode: 08-06-2026 t/m 14-06-2026\nTijdvak: Week 24 (2026)\nTotaal bruto loon 500,00\nDe inhouding voor huisvesting is € 147,10\nVakantiegeld 4 IB + IIB 8,33%\n'
    const rParcial = parse(parcialTxt, 'parcial.pdf')
    const Rp = classify([rParcial])
    expect(Rp.ilegibles.length).toBe(0)
    expect(Rp.parciales.length).toBe(1)
    expect(Rp.semanas.length).toBe(0) // no cuenta como semana con tarifa
    expect(Rp.semanas.length + Rp.vacaciones.length + Rp.parciales.length + Rp.duplicados + Rp.stornos.length + Rp.ilegibles.length).toBe(Rp.total)
  })
})

describe('porEmpresa()', () => {
  it('una progresión de subidas NO se marca como anomalía (bug real, capturas de Pablo)', () => {
    const prog = [
      parse(pws({ week: 49, periode: '02-12-2024', inlener: 'WDP Draadbewerking Erp', uurloon: '14,68', linea: '557,84', bruto: '557,84' }), 'a.pdf'),
      parse(pws({ week: 50, periode: '09-12-2024', inlener: 'WDP Draadbewerking Erp', uurloon: '14,68', linea: '557,84', bruto: '557,84' }), 'b.pdf'),
      parse(pws({ week: 41, periode: '06-10-2025', inlener: 'WDP Draadbewerking Erp', uurloon: '15,74', linea: '598,12', bruto: '598,12' }), 'c.pdf'),
      parse(pws({ week: 42, periode: '13-10-2025', inlener: 'WDP Draadbewerking Erp', uurloon: '15,74', linea: '598,12', bruto: '598,12' }), 'd.pdf'),
      parse(pws({ week: 13, periode: '23-03-2026', inlener: 'WDP Draadbewerking Erp', uurloon: '16,22', linea: '616,36', bruto: '642,10' }), 'e.pdf'),
    ]
    const RP = classify(prog)
    const PE = porEmpresa(RP.semanas)
    expect(PE.length).toBe(1)
    expect(PE[0].n).toBe(5)
    expect(PE[0].segments.length).toBe(3) // 3 tramos: subida, no anomalía
    expect(PE[0].bajadas.length).toBe(0) // sin bajadas: todo son subidas
    expect(PE[0].tarifaActual).toBe(16.22)
    expect(PE[0].segments[0].n).toBe(2)
    expect(PE[0].segments[1].rate).toBe(15.74)
  })

  it('una bajada real SÍ se marca', () => {
    const baj = [
      parse(pws({ week: 1, periode: '05-01-2026', inlener: 'Test Erp', uurloon: '16,22', linea: '616,36' }), 'x.pdf'),
      parse(pws({ week: 2, periode: '12-01-2026', inlener: 'Test Erp', uurloon: '14,71', linea: '558,98' }), 'y.pdf'),
    ]
    const RB = classify(baj)
    const PB = porEmpresa(RB.semanas)
    expect(PB[0].bajadas.length).toBe(1)
    expect(PB[0].bajadas[0]).toBe(1) // el tramo marcado es el segundo (índice 1)
  })
})

describe('tramos()', () => {
  it('corta al cambiar tarifa/empresa/mínimo', () => {
    const s16 = parse(pws(), 'w16.pdf')
    const s17 = parse(pws({ week: 17, periode: '20-04-2026', uurloon: '14,71', linea: '558,98', bruto: '558,98', fj: 1, inlener: 'Otra Empresa Erp' }), 'w17.pdf')
    const R2 = classify([s16, s17])
    const T = tramos(R2.semanas, '21')
    expect(T.length).toBe(2) // s16 y s17 son tramos distintos
  })
})

describe('periodo()', () => {
  it('cuenta huecos entre la primera y la última nómina', () => {
    const g1 = parse(pws(), 'w16.pdf') // 13-04-2026
    const g2 = parse(pws({ week: 19, periode: '04-05-2026' }), 'w19.pdf') // 3 semanas después
    const Rg = classify([g1, g2])
    const per = periodo(Rg.semanas)
    expect(per?.esperadas).toBe(4)
    expect(per?.faltan).toBe(2)
    const per1 = periodo(classify([g1]).semanas)
    expect(per1?.faltan).toBe(0)
  })
})

describe('edadDe()', () => {
  it('usa la fecha de nacimiento de la nómina si existe, si no el fallback', () => {
    const conNacimiento: Registro = { file: 'a', notes: [], nacimiento: '1990-04-08', fecha: '2026-05-11' }
    expect(edadDe(conNacimiento, '21')).toBe(36)
    const sinNacimiento: Registro = { file: 'b', notes: [], fecha: '2026-05-11' }
    expect(edadDe(sinNacimiento, '21')).toBe('21')
  })
})
