// Motor de extracción genérico. No conoce el nombre de ninguna agencia: solo
// conoce la ESTRUCTURA que comparten las nóminas de payroll validadas
// (Loonheffingennummer, bloques Declaratie, "Loon normale uren", vivienda
// vía Toelichting o vía línea Huisvesting). PWS y T&S Flex Logistiek ya
// pasan por aquí sin ninguna rama específica de agencia — es el mismo motor.
//
// Añadir un proveedor de payroll con una estructura genuinamente distinta
// (Loonheffingennummer en otra posición, bloques Declaratie con otra
// sintaxis) se hace en parsers/registry.ts, no aquí.

import type { Registro } from '../types'
import { nl, esc } from '../utils'

export function parse(text: string, name: string): Registro {
  const t = text.replace(/[ \t]+/g, ' ')
  const r: Registro = { file: esc(name), notes: [] }
  const g = (re: RegExp, i = 1): string | null => {
    const m = t.match(re)
    return m ? m[i] : null
  }

  // Agencia: SOLO si la nómina la etiqueta con su Loonheffingennummer. Sin
  // nombres hardcodeados. El nombre puede no estar en la misma línea (tablas
  // de dos columnas se leen en otro orden) — se busca en una ventana de
  // texto antes del número, no solo pegado a la etiqueta.
  let rAg: string | null = null
  const mNum = t.match(/Loonheffingennummer\s*:?\s*\n?\s*(\d{4}\.\d{2}\.\d{3})/)
  if (mNum && mNum.index != null) {
    const antes = t.slice(Math.max(0, mNum.index - 160), mNum.index)
    const mNom = antes.match(/([A-ZÀ-Ý][\wÀ-ÿ&.,' -]{2,45}\bB\.?V\.?)\s*(?:\n(?:[^\n]*\n){0,3})?\s*$/)
    if (mNom) rAg = mNom[1].trim()
  }
  r.agencia = rAg ? esc(rAg) : '(no identificada — falta esa línea en la nómina)'

  // El minimumuurloon impreso NUNCA es la tarifa del trabajador.
  const wmlImpreso = nl(g(/Minimumuurloon:\s*€\s*([\d.]+,\d{2})/i))
  if (!Number.isNaN(wmlImpreso)) r.wmlImpreso = wmlImpreso

  // CLAVE CANÓNICA: fecha de inicio del período. Una sola escala, siempre ordenable.
  const pm = t.match(/Periode:\s*(\d{2})-(\d{2})-(\d{4})/)
  if (pm) r.fecha = pm[3] + '-' + pm[2] + '-' + pm[1]
  const gb = t.match(/Geboortedatum:\s*(\d{2})-(\d{2})-(\d{4})/)
  if (gb) r.nacimiento = gb[3] + '-' + gb[2] + '-' + gb[1]
  const wk = t.match(/Tijdvak:\s*Week\s*(\d+)\s*\((\d{4})\)/)
  if (wk) r.etiq = wk[2] + '-S' + String(wk[1]).padStart(2, '0')
  if (!r.etiq && r.fecha) r.etiq = r.fecha
  r.sort = r.fecha ? +r.fecha.replace(/-/g, '') : null

  // Tarifa: línea de declaración → overwerk → derivada. Nunca el minimumuurloon.
  const d = t.match(/Loon normale uren\s+(-?\d{1,3}):(\d{2})\s+([\d.]+,\d{2})\s+(-?[\d.]+,\d{2})/)
  if (d) {
    r.uren = parseInt(d[1], 10) + parseInt(d[2], 10) / 60
    r.uurloon = nl(d[3])
    r.origen = 'declaración'
    if (d[1].indexOf('-') === 0 || nl(d[4]) < 0) r.storno = true
  }
  if (!r.uurloon) {
    const ov = t.match(/Loon overwerkuren\s+\d{1,3}:\d{2}\s*à?\s*[\d.,]+%\s*([\d.]+,\d{2})/)
    if (ov) {
      r.uurloon = nl(ov[1])
      r.origen = 'overwerk'
    }
  }
  const bruto = nl(g(/Totaal bruto loon\s+(-?[\d.]+,\d{2})/))
  if (!Number.isNaN(bruto)) r.bruto = bruto
  if ((r.bruto ?? NaN) < 0) r.storno = true
  if (!r.uurloon && (r.uren ?? 0) > 0 && (r.bruto ?? 0) > 0) {
    r.uurloon = Math.round(((r.bruto as number) / (r.uren as number)) * 100) / 100
    r.origen = 'derivada'
    if (r.wmlImpreso && Math.abs(r.uurloon - r.wmlImpreso) < 0.005) {
      r.notes.push('tarifa derivada coincide con el mínimo impreso — verificar')
    }
  }
  // Semana de solo festivo/vacaciones: no hay "Loon normale uren" porque no
  // se trabajaron horas normales. No es un formato desconocido — es un tipo
  // de semana real que no tiene tarifa por hora que comprobar.
  const zonaConceptos = t.split('Totaal bruto loon')[0] || ''
  if (!r.uurloon && /Feestdagen|Vakantiedagen/.test(zonaConceptos)) {
    r.soloVacaciones = true
    const fe = zonaConceptos.match(/Feestdagen\s+\d?\s?[TB]?\s*([\d.]+,\d{2})/)
    const va = zonaConceptos.match(/Vakantiedagen\s+\d?\s?[TB]?\s*([\d.]+,\d{2})/)
    if (fe) r.feestdagen = nl(fe[1])
    if (va) r.vakDagPagado = nl(va[1])
  }

  const vak = nl(g(/Vakantiegeld\s+\d?\s?IB \+ IIB\s+([\d.,]+)%/))
  if (!Number.isNaN(vak)) r.vak = vak
  r.pension = /StiPP|Pensioen/i.test(t)
  // Vivienda: la Toelichting manda (PWS). Si no existe, la línea de
  // inhouding negativa del bloque neto (T&S y otros).
  let vivienda = nl(g(/inhouding voor huisvesting is € ([\d.]+,\d{2})/i))
  if (!vivienda) vivienda = nl(g(/Huisvesting\s+\d?\s*-([\d.]+,\d{2})/))
  if (!Number.isNaN(vivienda)) r.vivienda = vivienda
  const nettoBet = nl(g(/Netto te betalen\s+([\d.]+,\d{2})/))
  if (!Number.isNaN(nettoBet)) r.nettoBet = nettoBet
  const nettoMin = nl(g(/inhoudingen bedraagt € ([\d.]+,\d{2})/))
  if (!Number.isNaN(nettoMin)) r.nettoMin = nettoMin

  const ib = t.match(/\(Inlenersbeloning\s*-\s*([A-Z0-9]+)\s*\/\s*Functiejaar\s*(\d+)\)/)
  if (ib) {
    r.groep = ib[1]
    r.fj = +ib[2]
  }
  const cao = t.match(/Cao:\s*(ABU|NBBU)\s*Fase\s*([\w-]+)/i)
  if (cao) {
    r.cao = cao[1].toUpperCase()
    r.fase = cao[2]
  }

  // Inlener: puede haber varias declaraties (agencia propia + cliente
  // real). La que vale es la que contiene las horas normales; si ninguna
  // las precede, la primera.
  const decls: { i: number; s: string }[] = []
  const reD = /Declaratie \d+ \([^)]+\)\s*([^\n]+)/g
  let mD: RegExpExecArray | null
  while ((mD = reD.exec(t))) decls.push({ i: mD.index, s: mD[1] })
  if (decls.length) {
    const iN = t.search(/Loon normale uren \d/)
    let pick = decls[0]
    decls.forEach((x) => {
      if (iN > -1 && x.i < iN) pick = x
    })
    let raw = pick.s
    const fx = raw.match(/- Functie:\s*([^(\n]+)/)
    if (fx) r.functie = esc(fx[1].trim())
    raw = raw.split(/ - Functie:/)[0]
    r.inlener = esc(raw.replace(/\s+B\.?V\.?\b/gi, '').replace(/\s+(Erp|Beek en Donk)\s*$/i, '').trim())
  }
  return r
}
