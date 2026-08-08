import { describe, expect, it } from 'vitest'
import { parse } from './core'
import { pws } from '../__fixtures__/pws'

describe('parse() — PWS (People Work Service)', () => {
  it('extrae los campos validados contra el HITO', () => {
    const r = parse(pws(), 'w16.pdf')
    expect(r.uurloon).toBe(16.22)
    expect(r.uren).toBe(38)
    expect(r.bruto).toBe(642.1)
    expect(r.vivienda).toBe(147.1)
    expect(r.vak).toBe(8.33)
    expect(r.groep).toBe('A2')
    expect(r.fj).toBe(1)
    expect(r.origen).toBe('declaración')
    expect(r.uurloon).not.toBe(r.wmlImpreso) // no confunde WML impreso
    expect(r.inlener).toBe('WDP Draadbewerking')
    expect(r.etiq).toBe('2026-S16')
    expect(r.pension).toBe(true)
    expect(Math.abs((r.nettoBet as number) - (r.nettoMin as number))).toBeLessThan(0.01) // margen0 detectable
  })

  it('escapa HTML en inlener y en el nombre de archivo', () => {
    const rx = parse(pws({ inlener: '<img src=x onerror=1> Erp' }), '<b>mala</b>.pdf')
    expect(rx.inlener?.indexOf('<')).toBe(-1)
    expect(rx.file.indexOf('<')).toBe(-1)
  })
})

describe('parse() — T&S Flex Logistiek (NBBU)', () => {
  // Fixture real, semana 38/2022, texto anonimizado. Mismo motor de payroll
  // que PWS: valida la generalización del núcleo.
  const tsTxt = `De heer --------------
Hoeven 7
5688 GS OIRSCHOT
 Loonspecificatie
 Flexwerker
Personeelsnummer: --------  Tijdvak: Week 38 (2022)   Geboortedatum: 29-06-1999   Cao: NBBU Fase 1-2
Dossiernummer: 1394 Periode: 19-09-2022 t/m 25-09-2022 Tabel: Dag   Onbepaalde tijd: Nee
Burgerlijke staat: Onbekend Minimum loon: € 405,30   Loonheffing: Ja met korting   Schriftelijk / Oproep: Ja / Ja
Datum in dienst: 04-07-2022   Fiscaal woonland: Landenkring   Contracturen: 1:00 uur per week
 Werkgever   Mededeling
T & S Flex Logistiek B.V. Loonheffingennummer : 8570.47.577
Gompenstraat 45 Nummer loonspecificatie : 12
5145RM Waalwijk Datum verloning : 29-09-2022
Datum administratie : 25-09-2022
Declaratie 361725576 (19-09 / 25-09) T&S Eigen Werk (ORG) - Functie: Productiemedewerker (Inlenersbeloning - Loonschaal inlener)
Huisvesting   115,00 Inhouding reiskosten   15,30
Inhouding reiskosten   5,10 Inhouding zorg&zekerheid   28,35
Declaratie 361726431 (19-09 / 25-09) DocData/Micro CFS (Ingram) - Functie: Orderpicker (Inlenersbeloning - Loonschaal inlener)
Loon normale uren   31:40   11,36   359,73 Loon onregelmatige uren   0:07 à   125,00%   11,36   1,65
Declaratie 362278741 (19-09 / 25-09) T&S Eigen Werk (ORG) - Functie: Productiemedewerker (Inlenersbeloning - Loonschaal inlener)
Inhouding reiskosten   5,10
Mutatie   Totaal tijdvak   Verrekenen
Loon normale uren   4 T   359,73   359,73   359,73   359,73
Loon onregelmatige uren   4 T   1,65   1,65   1,65   1,65
Vakantiedagen   4 T   7,83   7,83   7,83   7,83
Vakantiegeld   4 B   33,33   33,33   33,33   33,33
Compensatie PAWW   4 *   0,2000%   402,54   0,81   0,81   402,54   0,81   0,81
Totaal bruto loon   403,35   403,35   403,35   403,35
Loonheffingen (Dag wit)   T   369,28   -44,92   369,28   -44,92
Netto loon   344,01   344,01
Huisvesting   4   -115,00   -115,00
Inhouding reiskosten   4   -25,50   -25,50
Correctie WAS Inhouding reiskosten   5,08   5,08
Inhouding zorg&zekerheid   4   -28,35   -28,35
Netto te betalen   180,24   180,24
Vakantiedagen   4 IB + IIB   10,87000%   31:18   3:27   34:45   0:41   34:04
Vakantiegeld   4 IB + IIB   8,33000%   0,00   33,33   33,33   33,33   0,00
Pensioen StiPP Basis   41,09 Te betalen € 180,24 per bank EU (IBAN): ----- ---- ---- ---- ----- -----`

  it('extrae los campos con el mismo motor genérico que PWS', () => {
    const rT = parse(tsTxt, 'ts-w38-2022.pdf')
    expect(rT.agencia).toBe('T &amp; S Flex Logistiek B.V.')
    expect(rT.fecha).toBe('2022-09-19')
    expect(rT.etiq).toBe('2022-S38')
    expect(rT.uurloon).toBe(11.36)
    expect(rT.origen).toBe('declaración')
    expect(Math.round((rT.uren as number) * 100) / 100).toBe(31.67) // horas con minutos
    expect(rT.bruto).toBe(403.35)
    expect(rT.vivienda).toBe(115.0) // vivienda sin Toelichting (fallback "Huisvesting -X")
    expect(rT.vak).toBe(8.33)
    expect(rT.pension).toBe(true)
    expect(!rT.storno).toBe(true)
    expect(rT.nettoBet).toBe(180.24)
    expect(rT.cao).toBe('NBBU')
    expect(rT.fase).toBe('1-2')
    expect(rT.inlener).toBe('DocData/Micro CFS (Ingram)') // declaratie con horas, no la propia agencia
    expect(rT.functie).toBe('Orderpicker')
    expect(!rT.wmlImpreso || Number.isNaN(rT.wmlImpreso)).toBe(true) // "Minimum loon" semanal no confundido con uurloon
  })

  it('no cambia el comportamiento de PWS tras la generalización', () => {
    const rP = parse(pws(), 'w16.pdf')
    expect(rP.inlener).toBe('WDP Draadbewerking')
    expect(rP.cao).toBe('ABU')
  })
})

describe('parse() — semana de solo festivo/vacaciones (PWS real, sin horas normales)', () => {
  // Antes esto caía en "ilegibles / formato no reconocido": es PWS de
  // verdad, solo que esa semana concreta no tiene horas normales.
  const pwsVac = `De heer XXXX
Calle Anónima 1
00000 CIUDAD
Spanje
Flexwerker
Personeelsnummer: 7180789 Tijdvak: Week 20 (2026) Geboortedatum: 08-04-1990 Cao: ABU Fase B
Dossiernummer: 000103025 Periode: 11-05-2026 t/m 17-05-2026 Tabel: Week Onbepaalde tijd: Nee
Burgerlijke staat: Gehuwd Minimumuurloon: € 14,71 Loonheffing: Ja met korting Schriftelijk / Oproep: Ja / Ja
Datum in dienst: 05-12-2024 Fiscaal woonland: Landenkring Contracturen: 112:00 uur per 4 weken
Loonspecificatie
Werkgever Mededeling
People Work Service B.V.
Ruijschenberghstraat 1
5421KR Gemert
Loonheffingennummer :8510.21.384
Omschrijving R T Percentage Grondslag Fiscaal Betalen Grondslag Fiscaal Betalen Fiscaal Betalen
Feestdagen 4 T 129,76 129,76 129,76 129,76
Vakantiedagen 4 T 519,04 519,04 519,04 519,04
Vakantiegeld 4 B 54,05 54,05 54,05 54,05
Totaal bruto loon 702,85 702,85 702,85 702,85
PAWW bijdrage: www.spaww.nl 4 * 0,1000% 702,85 -0,70 -0,70 702,85 -0,70 -0,70
StiPP Pensioen 4 * 7,5000% 332,55 -24,94 -24,94 332,55 -24,94 -24,94
Netto loon 581,28 581,28
Inhouding ET-uitruil huisvesting 3 147,10 -147,10 147,10 -147,10
Premie Zorg & Zekerheid 4 -38,02 -38,02
Netto te betalen 396,16 396,16
Vakantiedagen 4 IB + IIB 10,87000% 96:42 96:42 32:00 64:42
Vakantiegeld 4 IB + IIB 8,33000% 0,00 54,05 54,05 54,05 0,00
Toelichting
Er is geen bruto ruimte voor een netto vrije vergoeding voor huisvesting. De inhouding voor huisvesting is € 147,10 PKS toegepast vanaf 11-05-2026
t/m 17-05-2026. Het netto equivalent van het wettelijk minimumloon is € 516,31.`

  it('marca soloVacaciones y conserva lo que sí se pudo leer', () => {
    const rV = parse(pwsVac, 'vac.pdf')
    expect(rV.fecha).toBe('2026-05-11')
    expect(rV.etiq).toBe('2026-S20')
    expect(rV.uurloon).toBeUndefined() // sin horas normales, no hay tarifa que leer
    expect(rV.soloVacaciones).toBe(true)
    expect(rV.bruto).toBe(702.85)
    expect(rV.vivienda).toBe(147.1) // te la siguen cobrando
    expect(rV.feestdagen).toBe(129.76)
    expect(rV.vakDagPagado).toBe(519.04)
    expect(rV.agencia).toBe('People Work Service B.V.') // NO "no reconocida"
  })
})
