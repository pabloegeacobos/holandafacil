// Adaptador CASO: traduce el resultado de classify() + los contratos de
// alquiler al formato que espera la plantilla del informe. Función pura,
// sin DOM. Solo pasan aquí semanas y vacaciones/parciales/conflictos ya
// identificados — stornos e ilegibles NUNCA entran, a propósito (no son
// nóminas comprobables).

import type { Caso, ClassifyResult, Contrato, SemanaCaso } from './types'
import { PKS, VAK_MIN, WML } from './reference-data'

// Un día natural antes de una fecha ISO (para cerrar la vigencia de un
// tramo WML anterior).
export function diaAnterior(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function construirCASO(R: ClassifyResult, CT: Contrato[]): Caso {
  const caso: Caso = {
    demo: false,
    generadoEl: new Date().toISOString().slice(0, 10),
    empleador: { nombre: null, kvk: null },
    periodo: { desde: '', hasta: '' },
    convenioAsumido: null,
    documentosNoAportados: [],
    normas: [],
    normasPendientes: [],
    semanas: [],
  }
  const todas: SemanaCaso[] = []
  ;(R.semanas || []).forEach((s) => {
    todas.push({ semana: s.etiq as string, empresaUsuaria: s.inlener || null, horasNormales: s.uren || 0, horasFestivo: 0, tarifa: s.uurloon as number, vivienda: s.vivienda || null, doc: s.file })
  })
  ;(R.vacaciones || []).forEach((v) => {
    todas.push({ semana: v.etiq as string, empresaUsuaria: v.inlener || null, horasNormales: 0, horasFestivo: v.uren || 0, tarifa: null, vivienda: v.vivienda || null, doc: v.file })
  })
  ;(R.parciales || []).forEach((p) => {
    todas.push({ semana: p.etiq as string, empresaUsuaria: p.inlener || null, horasNormales: p.uren || 0, horasFestivo: 0, tarifa: null, vivienda: p.vivienda || null, doc: p.file })
  })
  ;(R.conflictos || []).forEach((cf) => {
    ;(cf.registros || []).forEach((r) => {
      todas.push({ semana: r.etiq as string, empresaUsuaria: r.inlener || null, horasNormales: r.uren || 0, horasFestivo: 0, tarifa: r.uurloon as number, vivienda: r.vivienda || null, doc: r.file })
    })
  })
  // R.stornos y R.ilegibles quedan fuera aquí, sin excepción.

  todas.sort((a, b) => (a.semana < b.semana ? -1 : a.semana > b.semana ? 1 : 0))
  caso.semanas = todas
  if (todas.length) {
    caso.periodo.desde = todas[0].semana
    caso.periodo.hasta = todas[todas.length - 1].semana
  }

  const conAgencia = (R.semanas || [])
    .concat(R.vacaciones || [])
    .concat(R.parciales || [])
    .filter((x) => x.agencia && x.agencia.indexOf('no identificada') === -1)
  if (conAgencia.length) caso.empleador.nombre = conAgencia[conAgencia.length - 1].agencia as string

  const ctReales = (CT || []).filter((c) => c.importe && !Number.isNaN(c.importe))
  if (!ctReales.length) caso.documentosNoAportados.push('Contrato o anexo de vivienda')
  caso.documentosNoAportados.push('Contrato de trabajo (uitzendovereenkomst)')
  caso.documentosNoAportados.push('Bevestiging van uitzending / confirmación de puesta a disposición')
  caso.documentosNoAportados.push('Comunicaciones escritas sobre la clasificación de la función')

  // Normas verificadas con artículo y vigencia exactos (13-07-2026). Ver
  // docs/verificacion.md para las fuentes.
  WML.forEach((w, i) => {
    const hasta = i + 1 < WML.length ? diaAnterior(WML[i + 1].d) : null
    caso.normas.push({ concepto: 'Salario mínimo por hora (21 años o más)', norma: 'Wet minimumloon en minimumvakantiebijslag', articulo: 'art. 8', desde: w.d, hasta, valor: w.t, unidad: '€/hora' })
  })
  caso.normas.push({ concepto: 'Vacaciones (vakantiegeld) — mínimo legal', norma: 'Wet minimumloon en minimumvakantiebijslag', articulo: 'art. 15', desde: '2024-01-01', hasta: null, valor: VAK_MIN, unidad: '%' })
  PKS.forEach((p) => {
    caso.normas.push({ concepto: 'Máximo de descuento por vivienda (PKS)', norma: 'CAO voor Uitzendkrachten 2026-2028', articulo: 'art. 49.4 + Anexo V', desde: p.d, hasta: p.h, valor: p.t, unidad: '€/semana' })
  })
  // El 25%×WML×40 está confirmado que sigue vigente (Rijksoverheid, nov-2025:
  // la reducción planeada se canceló), pero no tenemos el artículo exacto
  // del Besluit — se queda pendiente, no se imprime en "normas" sin esa
  // referencia.
  caso.normasPendientes.push(
    'Máximo general de descuento por vivienda (25% del salario mínimo bruto × 40): la cifra está confirmada por fuente oficial (Rijksoverheid, noviembre 2025) pero el artículo exacto del Besluit minimumloon en minimumvakantiebijslag no está verificado.',
  )

  return caso
}
