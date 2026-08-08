// Datos de referencia del comprobador: salario mínimo legal (WML), tarifas
// jeugdloon, tope de vivienda del CAO (PKS) y el mínimo legal de vakantiegeld.
//
// Cada tabla lleva su fuente y fecha de verificación en el comentario. Una
// cifra que no está aquí, verificada contra el PDF del convenio o fuente
// oficial, no se afirma en ningún sitio del comprobador ni del informe.

export type PuntoWml = { d: string; t: number }
export type TopeVigente = { d: string; h: string; t: number }

// Wet minimumloon en minimumvakantiebijslag, art. 8. Historial de importes
// por hora para mayores de 21 años. Se actualiza cada 1-ene y 1-jul.
export const WML: PuntoWml[] = [
  { d: '2024-01-01', t: 13.27 },
  { d: '2024-07-01', t: 13.68 },
  { d: '2025-01-01', t: 14.06 },
  { d: '2025-07-01', t: 14.4 },
  { d: '2026-01-01', t: 14.71 },
  { d: '2026-07-01', t: 14.99 },
]

// Jeugdloon: porcentaje del WML adulto según edad (Rijksoverheid, jul-2026).
export const JEUGD: Record<string, number> = {
  '20': 0.8,
  '19': 0.6,
  '18': 0.5,
  '17': 0.395,
  '16': 0.345,
  '15': 0.3,
}

export const VAK_MIN = 8 // % legal mínimo de vakantiegeld

// Tope semanal de descuento por vivienda. CAO ABU art. 49.4 + Anexo V.
export const PKS: TopeVigente[] = [{ d: '2026-01-01', h: '2027-12-31', t: 159.85 }]

// El WML cambia cada 1-ene y 1-jul. Más allá del último cambio conocido de
// la tabla, la herramienta no afirma nada (ver wmlAt).
export function wmlExpira(): string {
  const u = WML[WML.length - 1].d
  const y = +u.slice(0, 4)
  return u.slice(5, 7) === '01' ? y + '-07-01' : y + 1 + '-01-01'
}

export function wmlAt(f: string): PuntoWml | null {
  if (f >= wmlExpira()) return null // tabla caducada para esa fecha: no se afirma
  let a: PuntoWml | null = null
  for (const p of WML) if (f >= p.d) a = p
  return a
}

export function minAt(f: string, edad: string): number | null {
  const b = wmlAt(f)
  if (!b) return null
  return Math.round(b.t * (edad === '21' ? 1 : JEUGD[edad] || 1) * 100) / 100
}

export function topeAt(tab: TopeVigente[], f: string): number | null {
  for (const t of tab) if (f >= t.d && f <= t.h) return t.t
  return null
}

// Máximo legal general de vivienda: 25% del salario mínimo bruto por hora ×
// 40, tope legal duro (no CAO, ley). Verificado 13-07-2026 contra
// ABU/FlexExpert/SalarisVanmorgen: "25% van het wettelijk minimumuurloon x
// 40". Se deriva del WML ya confirmado, así que hereda su misma ventana de
// vigencia (housAt → null si wmlAt → null).
export function housAt(f: string): number | null {
  const w = wmlAt(f)
  return w ? Math.round(w.t * 40 * 0.25 * 100) / 100 : null
}

export function edadEn(nacimiento: string | undefined | null, fecha: string): number | null {
  if (!nacimiento) return null
  const n = nacimiento.split('-').map(Number)
  const f = fecha.split('-').map(Number)
  let e = f[0] - n[0]
  if (f[1] < n[1] || (f[1] === n[1] && f[2] < n[2])) e--
  return e
}
