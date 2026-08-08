// Lectura del contrato de alquiler: importe semanal, veredicto directo
// contra los topes legales, y detección de cláusulas que suelen ser
// problema. Nunca decide legalidad — cita el texto literal y la norma.

import type { ClausulaDetectada, Contrato, Veredicto } from './types'
import { nl } from './utils'
import { PKS, housAt, topeAt } from './reference-data'

// Contrato de alquiler: formatos muy variables entre caseros. Solo se
// rellena lo que aparece con una etiqueta reconocible; lo demás se deja en
// blanco para que el usuario lo confirme.
export function parseContrato(text: string): Contrato {
  const t = text.replace(/[ \t]+/g, ' ')
  const c: Contrato = { desde: '', hasta: '', importe: NaN }
  const d1 = t.match(/(?:ingangsdatum|aanvang(?:sdatum)?|vanaf)\D{0,15}(\d{1,2})[-/](\d{1,2})[-/](\d{4})/i)
  if (d1) c.desde = d1[3] + '-' + String(d1[2]).padStart(2, '0') + '-' + String(d1[1]).padStart(2, '0')
  const d2 = t.match(/(?:einddatum|tot en met|looptijd tot)\D{0,15}(\d{1,2})[-/](\d{1,2})[-/](\d{4})/i)
  if (d2) c.hasta = d2[3] + '-' + String(d2[2]).padStart(2, '0') + '-' + String(d2[1]).padStart(2, '0')
  const pw = t.match(/huur(?:prijs)?\D{0,25}(?:€|EUR)?\s*([\d.]+(?:,\d{2})?)\s*(?:per\s*week|\/\s*week|p\.?w\.?)/i)
  const pm = t.match(/huur(?:prijs)?\D{0,25}(?:€|EUR)?\s*([\d.]+(?:,\d{2})?)\s*(?:per\s*maand|\/\s*maand|p\.?m\.?)/i)
  if (pw) c.importe = nl(pw[1])
  else if (pm) {
    c.importe = Math.round((nl(pm[1]) / 4.348) * 100) / 100
    c.aprox = true
  }
  return c
}

// Veredicto directo: ¿lo que cobra este contrato respeta el tope legal, sí
// o no? Fecha de referencia: el inicio del contrato si se encontró; si no,
// hoy.
export function veredictoPKS(c: { importe: number; desde: string }): Veredicto | null {
  if (!c.importe) return null
  const f = c.desde || new Date().toISOString().slice(0, 10)
  const pks = topeAt(PKS, f)
  const hous = housAt(f)
  if (pks && c.importe > pks + 0.005) return { ok: false, tope: pks, tipo: 'PKS', law: 'CAO ABU art. 49.4 + Anexo V' }
  if (hous && c.importe > hous + 0.005) return { ok: false, tope: hous, tipo: '25% WML×40', law: 'Tope legal' }
  if (pks || hous) return { ok: true, tope: (pks || hous) as number, tipo: pks ? 'PKS' : '25% WML×40' }
  return null // sin fecha fiable para saber qué tope aplicaba, no se afirma nada
}

// Cláusulas que suelen ser problema en contratos de vivienda ligada al
// trabajo. Se afirma solo que el TEXTO existe y se cita literal — la
// valoración legal la hace el usuario o FNV.
const CLAUSULAS_RARAS: { re: RegExp; t: string; law?: string }[] = [
  {
    re: /bemiddelingskosten|kosten voor (het )?(vinden|zoeken) van werk|plaatsingskosten|inschrijfkosten/i,
    t: 'Cobro por conseguir o mantener el trabajo',
    law: 'Ley Waadi: esto es ilegal siempre, sin excepción.',
  },
  {
    re: /(huisvesting|kamer|woning)[^.]{0,90}(direct|onmiddellijk|meteen|dezelfde dag)[^.]{0,50}(einde|beëindig|opzeg)[^.]{0,40}(dienstverband|contract|arbeidsovereenkomst)/i,
    t: 'La vivienda podría terminar el mismo día que el contrato de trabajo',
    law: 'CAO ABU: tienes derecho a 4 semanas para dejarla al mismo precio tras acabar el contrato.',
  },
  {
    re: /waarborgsom|borgsom|\bborg\b[^.]{0,30}(€|EUR)\s*[\d.]+,\d{2}/i,
    t: 'Fianza (borg) — comprueba el importe y cuándo y cómo te la devuelven',
  },
  {
    re: /mag (niet|geen)[^.]{0,40}(klacht|klagen|vakbond|vereniging|FNV)/i,
    t: 'Podría limitar tu derecho a quejarte o afiliarte a un sindicato — eso no se puede prohibir por contrato',
  },
  {
    re: /geen recht op[^.]{0,40}(minimumloon|vakantiegeld|vakantiedagen)/i,
    t: 'Menciona renunciar a un derecho legal — un contrato no puede quitarte un mínimo de ley',
  },
]

export function escanearContrato(text: string): ClausulaDetectada[] {
  const t = text.replace(/\s+/g, ' ')
  const out: ClausulaDetectada[] = []
  CLAUSULAS_RARAS.forEach((p) => {
    const m = t.match(p.re)
    if (m) out.push({ t: p.t, law: p.law || '', snip: m[0].trim().slice(0, 200) })
  })
  return out
}
