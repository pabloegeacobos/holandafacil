// Fixture PWS reconstruida de los datos validados del HITO. Compartida por
// los tests de parsers, classify y checks.

export type PwsOverrides = {
  periode?: string
  week?: number | string
  year?: number | string
  horas?: string
  uurloon?: string
  linea?: string
  fj?: number | string
  inlener?: string
  bruto?: string
  viv?: string
}

export function pws(over: PwsOverrides = {}): string {
  return `People Work Service B.V.
Loonheffingennummer :8510.21.384
Periode: ${over.periode || '13-04-2026'}
Tijdvak: Week ${over.week ?? 16} (${over.year ?? 2026})
Minimumuurloon: € 14,71
Loon normale uren ${over.horas || '38:00'} ${over.uurloon || '16,22'} ${over.linea || '616,36'}
Vakantiegeld 8 IB + IIB 8,33%
StiPP Pensioen
(Inlenersbeloning - A2 / Functiejaar ${over.fj ?? 1})
Cao: ABU Fase A
Declaratie 563558867 (13-04 / 19-04) ${over.inlener || 'WDP Draadbewerking Erp'}
Totaal bruto loon ${over.bruto || '642,10'}
De inhouding voor huisvesting is € ${over.viv || '147,10'}
Netto te betalen 430,56
inhoudingen bedraagt € 430,56`
}
