import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildInformeHtml } from './build-informe'
import type { Caso } from '../types'

const TEMPLATE_PATH = join(__dirname, 'informe-plantilla.html')

const CASO_MINIMO: Caso = {
  demo: false,
  generadoEl: '2026-08-08',
  empleador: { nombre: 'People Work Service B.V.', kvk: null },
  periodo: { desde: '2026-S15', hasta: '2026-S16' },
  convenioAsumido: null,
  documentosNoAportados: ['Contrato de trabajo (uitzendovereenkomst)'],
  normas: [{ concepto: 'Salario mínimo por hora (21 años o más)', norma: 'Wet minimumloon en minimumvakantiebijslag', articulo: 'art. 8', desde: '2026-01-01', hasta: null, valor: 14.71, unidad: '€/hora' }],
  normasPendientes: [],
  semanas: [{ semana: '2026-S16', empresaUsuaria: 'WDP Draadbewerking', horasNormales: 38, horasFestivo: 0, tarifa: 16.22, vivienda: 147.1, doc: 'b.pdf' }],
}

describe('buildInformeHtml()', () => {
  it('la plantilla canónica conserva los marcadores CASO:START/CASO:END', () => {
    const template = readFileSync(TEMPLATE_PATH, 'utf8')
    expect(template).toContain('/* CASO:START */')
    expect(template).toContain('/* CASO:END */')
  })

  it('sustituye el CASO de demostración por el CASO real', () => {
    const template = readFileSync(TEMPLATE_PATH, 'utf8')
    const full = buildInformeHtml(template, CASO_MINIMO)
    expect(full.startsWith('<!DOCTYPE html>\n<html lang="es">\n')).toBe(true)
    expect(full).toContain(JSON.stringify(CASO_MINIMO))
    expect(full).not.toContain('demo: true') // el CASO de demostración desaparece
    expect(full).not.toContain('/* CASO:START */') // el marcador no llega al HTML final
    expect(full).not.toContain('/* CASO:END */')
    expect(full).toContain('function analizar(c)') // el resto de la plantilla se conserva intacto
  })

  it('lanza si faltan los marcadores (plantilla corrompida)', () => {
    expect(() => buildInformeHtml('<html>sin marcadores</html>', CASO_MINIMO)).toThrow()
  })
})
