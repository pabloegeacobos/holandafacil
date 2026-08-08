// Clasificación y cuadre: todo archivo acaba en exactamente un cajón. Nada
// desaparece en silencio (ver R.duplicados: es una resta de comprobación,
// no una categoría con datos propios).

import type { ClassifyResult, Contrato, Empresa, Periodo, Registro, Tramo } from './types'
import { edadEn, minAt } from './reference-data'

export function classify(records: Registro[]): ClassifyResult {
  const R: ClassifyResult = {
    total: records.length,
    semanas: [],
    vacaciones: [],
    parciales: [],
    stornos: [],
    conflictos: [],
    ilegibles: [],
    duplicados: 0,
  }
  const buckets: Record<string, Registro[]> = {}
  records.forEach((r) => {
    if (r.error) {
      R.ilegibles.push({ file: r.file, cause: 'lectura', why: 'el PDF no se pudo abrir — puede ser una foto o un escaneo, no un PDF con texto' })
      return
    }
    if (r.storno) {
      R.stornos.push(r)
      return
    }
    if (!r.sort) {
      R.ilegibles.push({ file: r.file, cause: 'sin_semana', why: 'no encontré la semana en este documento (busqué "Periode" y "Tijdvak")' })
      return
    }
    if (r.soloVacaciones) {
      R.vacaciones.push(r)
      return
    }
    if (!r.uurloon) {
      R.parciales.push(r) // semana identificada, pero no encontré la tarifa por hora en este documento
      return
    }
    ;(buckets[r.etiq as string] = buckets[r.etiq as string] || []).push(r)
  })
  Object.keys(buckets).forEach((k) => {
    const g = buckets[k]
    if (g.length === 1) {
      R.semanas.push(g[0])
      return
    }
    // Varias nóminas del mismo período con tarifas distintas: NO se decide
    // cuál vale. Se apartan las dos para revisión humana — decidir cuál es
    // la correcta no es un dato, es un juicio.
    const rates: Record<string, 1> = {}
    g.forEach((r) => {
      rates[(r.uurloon as number).toFixed(2)] = 1
    })
    if (Object.keys(rates).length > 1) {
      R.conflictos.push({ etiq: k, valores: g.map((r) => r.uurloon as number), n: g.length, files: g.map((r) => r.file), registros: g })
    } else {
      R.semanas.push(g[0]) // mismos valores repetidos = duplicado real, no conflicto
    }
  })
  R.semanas.sort((a, b) => (a.sort as number) - (b.sort as number))
  R.vacaciones.sort((a, b) => (a.sort || 0) - (b.sort || 0))
  R.parciales.sort((a, b) => (a.sort || 0) - (b.sort || 0))
  R.conflictos.sort((a, b) => (a.etiq < b.etiq ? -1 : a.etiq > b.etiq ? 1 : 0))
  const enConflicto = R.conflictos.reduce((s, c) => s + c.n, 0)
  // cuadre: cada archivo cuenta una vez
  R.duplicados = R.total - R.semanas.length - R.vacaciones.length - R.parciales.length - R.stornos.length - R.ilegibles.length - enConflicto
  return R
}

// Agrupa por empresa usuaria y muestra la progresión real de la tarifa en
// el tiempo: primero cobraste X, luego Y, luego Z. Eso es una carrera
// normal de subidas, no un error. Solo se marca en rojo cuando la tarifa
// BAJA de un tramo al siguiente — eso sí es un hecho, no una opinión.
export function porEmpresa(S: Registro[]): Empresa[] {
  const m: Record<string, { inlener: string; weeks: Registro[] }> = {}
  S.forEach((s) => {
    const k = s.inlener || '(empresa no identificada)'
    ;(m[k] = m[k] || { inlener: k, weeks: [] }).weeks.push(s)
  })
  return Object.keys(m)
    .map((k) => {
      const g = m[k]
      const weeks = g.weeks.slice().sort((a, b) => (a.sort as number) - (b.sort as number))
      const segs: { rate: number; from: string; to: string; n: number }[] = []
      weeks.forEach((s) => {
        const p = segs[segs.length - 1]
        if (p && Math.abs(p.rate - (s.uurloon as number)) < 0.005) {
          p.to = s.etiq as string
          p.n++
        } else {
          segs.push({ rate: s.uurloon as number, from: s.etiq as string, to: s.etiq as string, n: 1 })
        }
      })
      const bajadas: number[] = []
      for (let i = 1; i < segs.length; i++) {
        if (segs[i].rate < segs[i - 1].rate - 0.005) bajadas.push(i)
      }
      return {
        inlener: k,
        n: weeks.length,
        desde: weeks[0].etiq as string,
        hasta: weeks[weeks.length - 1].etiq as string,
        tarifaActual: weeks[weeks.length - 1].uurloon as number,
        segments: segs,
        bajadas,
      }
    })
    .sort((a, b) => (a.desde < b.desde ? -1 : a.desde > b.desde ? 1 : 0))
}

export function edadDe(s: Registro, fallback: string): number | string {
  return s.nacimiento ? (edadEn(s.nacimiento, s.fecha as string) as number) : fallback
}

// Corta el tramo si cambia: la tarifa, la empresa usuaria, o el mínimo
// legal vigente.
export function tramos(semanas: Registro[], edad: string): Tramo[] {
  const out: Tramo[] = []
  semanas.forEach((s) => {
    const m = minAt(s.fecha as string, String(edadDe(s, edad)))
    const p = out[out.length - 1]
    if (p && Math.abs(p.rate - (s.uurloon as number)) < 0.005 && p.inlener === (s.inlener || '?') && Math.abs((p.min || 0) - (m || 0)) < 0.005) {
      p.to = s.etiq as string
      p.n++
      p.hrs += s.uren || 0
      if (s.fj != null) p.fjset[s.fj] = 1
    } else {
      const fs: Record<number, 1> = {}
      if (s.fj != null) fs[s.fj] = 1
      out.push({ rate: s.uurloon as number, from: s.etiq as string, to: s.etiq as string, n: 1, hrs: s.uren || 0, inlener: s.inlener || '?', fjset: fs, fecha: s.fecha, min: m })
    }
  })
  return out
}

// Huecos entre la primera y la última nómina del período.
export function periodo(S: Registro[]): Periodo | null {
  if (!S.length) return null
  const a = new Date(S[0].fecha as string)
  const b = new Date(S[S.length - 1].fecha as string)
  const esperadas = Math.round((b.getTime() - a.getTime()) / (7 * 864e5)) + 1
  return { esperadas, faltan: Math.max(0, esperadas - S.length), meses: Math.round(esperadas / 4.345) }
}

export function contratoEn(cs: Contrato[], fecha: string): Contrato | null {
  for (const c of cs) {
    if (!Number.isNaN(c.importe) && c.desde && fecha >= c.desde && (!c.hasta || fecha <= c.hasta)) return c
  }
  return null
}
