// Utilidades puras compartidas por todo el comprobador. Sin estado, sin DOM.

export function nl(s: string | null | undefined): number {
  return s == null ? NaN : Number(String(s).replace(/\./g, '').replace(',', '.'))
}

export function eur(n: number): string {
  return '€' + Number(n).toFixed(2).replace('.', ',')
}

export function esc(s: unknown): string {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  )
}

// "1.234,56" → 1234.56 · "172.02" (con punto decimal) también se acepta.
export function num(v: string | number | null | undefined): number {
  if (v === '' || v == null) return NaN
  let s = String(v).trim()
  if (s.indexOf(',') > -1) s = s.replace(/\./g, '').replace(',', '.')
  return Number(s)
}
