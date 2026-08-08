// Chequeos legales: WML, vakantiegeld, tope de vivienda (PKS y 25%×WML×40),
// reset de functiejaar. Módulo puro, sin DOM — solo produce tarjetas
// (Card) con norma citada y cifras; nunca decide nada por el trabajador.

import type { Agregados, Card, ChecksResult, ClassifyResult, Contrato, Registro, Respuestas } from './types'
import { eur } from './utils'
import { PKS, VAK_MIN, housAt, minAt, topeAt } from './reference-data'
import { contratoEn, edadDe, tramos } from './classify'

function card(k: Card['k'], t: string, p?: string, pills?: string[], law?: string): Card {
  return { k, t, p: p || '', pills: pills || [], law }
}

export function checks(R: ClassifyResult, contratos: Contrato[], edad: string, Q: Respuestas): ChecksResult {
  const OK: Card[] = []
  const REV: Card[] = []
  const S = R.semanas

  const ileLectura0 = R.ilegibles.filter((u) => u.cause === 'lectura')
  const ileSinSemana0 = R.ilegibles.filter((u) => u.cause === 'sin_semana')
  if (ileLectura0.length) {
    REV.push(
      card(
        'info',
        ileLectura0.length + ' archivo(s) no se pudieron abrir',
        'Puede ser una foto o un escaneo en vez de un PDF con texto. Pide a la agencia el PDF original, no una foto de la pantalla.',
        ileLectura0
          .slice(0, 6)
          .map((u) => u.file)
          .concat(ileLectura0.length > 6 ? ['+' + (ileLectura0.length - 6) + ' más'] : []),
      ),
    )
  }
  if (ileSinSemana0.length) {
    REV.push(
      card(
        'info',
        ileSinSemana0.length + ' archivo(s) sin semana identificable',
        'No encontré ninguna fecha ni número de semana en el texto de este documento.',
        ileSinSemana0
          .slice(0, 6)
          .map((u) => u.file)
          .concat(ileSinSemana0.length > 6 ? ['+' + (ileSinSemana0.length - 6) + ' más'] : []),
      ),
    )
  }
  if (R.parciales.length) {
    REV.push(
      card(
        'info',
        R.parciales.length + ' semana(s) sin tarifa por hora en el documento',
        'Sé de qué semana es, pero no encontré tu tarifa por hora en el texto — solo lo que sí aparece.',
        R.parciales.slice(0, 8).map((r) => {
          const partes: string[] = []
          if (r.bruto) partes.push('bruto ' + eur(r.bruto))
          if (r.vivienda) partes.push('vivienda ' + eur(r.vivienda))
          if (r.vak) partes.push('vak.geld ' + r.vak + '%')
          return r.etiq + (partes.length ? ': ' + partes.join(', ') : ' — sin más datos encontrados')
        }),
      ),
    )
  }
  if (R.conflictos.length) {
    REV.push(
      card(
        'warn',
        R.conflictos.length + ' semana(s) con dos nóminas distintas',
        'No se elige ninguna versión: hay dos nóminas para la misma semana con tarifas distintas.',
        R.conflictos.slice(0, 6).map((x) => x.etiq + ': ' + x.valores.map(eur).join(' vs. ') + ' (' + x.files.join(' / ') + ')'),
      ),
    )
  }
  if (R.vacaciones.length) {
    const vivEnVac = R.vacaciones.filter((v) => (v.vivienda || 0) > 0)
    REV.push(
      card(
        'info',
        R.vacaciones.length + ' semana(s) de solo festivo/vacaciones',
        'Sin horas normales trabajadas, no hay tarifa por hora que comprobar esa semana.' +
          (vivEnVac.length ? ' Pero sí te siguieron descontando la vivienda — revisa que sea correcto.' : ''),
        R.vacaciones.slice(0, 6).map((v) => v.etiq + (v.vivienda ? ': vivienda ' + eur(v.vivienda) : '')),
      ),
    )
  }

  if (!S.length) return { OK, REV, agg: {} }

  const last = S[S.length - 1]
  const first = S[0]
  const peak = Math.max(...S.map((s) => s.uurloon as number))
  const caida = peak - (last.uurloon as number)
  const minNow = minAt(last.fecha as string, String(edadDe(last, edad)))
  const enSuelo = !!(minNow && Math.abs((last.uurloon as number) - minNow) < 0.005)

  // -- agregados (sumas, nunca medias) --
  const agg: Agregados = {
    totHrs: 0,
    bajoMin: 0,
    vakBajo: 0,
    sinPension: 0,
    pksSem: 0,
    pksExc: 0,
    pksLista: [],
    housSem: 0,
    housLista: [],
    gapTot: 0,
    gapSem: 0,
    peak,
    caida,
    minNow,
    enSuelo,
    first,
    last,
  }
  S.forEach((s) => {
    if ((s.uren || 0) > 0) agg.totHrs += s.uren as number
    const m = minAt(s.fecha as string, String(edadDe(s, edad)))
    if (m && (s.uurloon as number) < m - 0.005) agg.bajoMin++
    if (s.vak && s.vak < VAK_MIN - 0.001) agg.vakBajo++
    if ((s.fecha as string) >= '2026-01-01' && s.pension === false) agg.sinPension++
    // brecha vivienda SEMANA A SEMANA contra el contrato vigente esa fecha
    const ct = contratoEn(contratos, s.fecha as string)
    if (ct) {
      const g = ct.importe - (s.vivienda || 0)
      if (g > 0.01) {
        agg.gapTot += g
        agg.gapSem++
      }
      // topes: solo si hay tope confirmado vigente en ESA fecha
      const pks = topeAt(PKS, s.fecha as string)
      if (pks && ct.importe > pks + 0.005) {
        agg.pksSem++
        agg.pksExc = Math.max(agg.pksExc, ct.importe - pks)
        agg.pksLista.push({ etiq: s.etiq as string, importe: ct.importe, tope: pks })
      } else {
        const hm = housAt(s.fecha as string)
        if (hm && ct.importe > hm + 0.005) {
          agg.housSem++
          agg.housLista.push({ etiq: s.etiq as string, importe: ct.importe, tope: hm })
        }
      }
    }
  })

  // -- CONFIRMADO --
  if (caida > 0.005) {
    OK.push(card('flag', 'Te bajaron la tarifa ' + eur(caida) + '/hora', 'De ' + eur(peak) + ' a ' + eur(last.uurloon as number) + '.', ['máximo ' + eur(peak), 'ahora ' + eur(last.uurloon as number)]))
  }
  const fjs = S.filter((s) => s.fj != null)
  for (let i = 1; i < fjs.length; i++) {
    if ((fjs[i].fj as number) < (fjs[i - 1].fj as number)) {
      OK.push(
        card(
          'flag',
          'Tu functiejaar bajó de FJ' + fjs[i - 1].fj + ' a FJ' + fjs[i].fj,
          'De ' + fjs[i - 1].inlener + ' a ' + fjs[i].inlener + '. La norma exige mantener la clasificación anterior si es la misma área CAO y prácticamente el mismo puesto — eso no lo puedo comprobar yo. Pregunta si tu caso cumple esa condición.',
          ['FJ' + fjs[i - 1].fj + ' → FJ' + fjs[i].fj],
          S[S.length - 1].cao === 'NBBU' ? 'CAO NBBU (regla armonizada con ABU art. 25.4)' : 'CAO ABU art. 25.4',
        ),
      )
    }
  }
  if (enSuelo) OK.push(card('flag', 'Te tienen exactamente en el mínimo legal', 'Tu tarifa coincide al céntimo con el suelo de la ley.', [eur(last.uurloon as number) + ' = mínimo ' + eur(minNow as number)]))
  if (agg.bajoMin) OK.push(card('flag', 'Semanas por debajo del mínimo legal', 'Cada semana se compara con el mínimo vigente en SU fecha.', [agg.bajoMin + ' semana(s)']))
  if (agg.vakBajo) OK.push(card('flag', 'Vakantiegeld por debajo del 8%', 'El 8% es un suelo de ley.', [agg.vakBajo + ' semana(s)']))
  if (agg.sinPension) OK.push(card('flag', 'Sin pensión en 2026', 'Desde 2026 se acumula desde el primer día.', [agg.sinPension + ' semana(s)'], 'CAO ABU'))
  if (agg.gapTot > 1) {
    OK.push(card('flag', 'Te cobran más de lo que la nómina descuenta', 'Comparado semana a semana con el contrato de alquiler vigente en cada fecha. Sin medias.', ['Fuera de nómina: <b>' + eur(agg.gapTot) + '</b>', 'en ' + agg.gapSem + ' semanas']))
  }
  if (agg.pksSem) {
    OK.push(
      card(
        'flag',
        'Alquiler por encima del tope del CAO ABU (PKS)',
        'Norma: máximo €' + PKS[0].t.toFixed(2).replace('.', ',') + '/semana por vivienda.',
        agg.pksLista.map((x) => x.etiq + ': te cobran ' + eur(x.importe) + ' (tope ' + eur(x.tope) + ')'),
        'CAO ABU art. 49.4 + Anexo V',
      ),
    )
  }
  if (agg.housSem) {
    OK.push(
      card(
        'flag',
        'Alquiler por encima del máximo legal deducible',
        'Norma: máximo 25% del salario mínimo bruto por hora × 40.',
        agg.housLista.map((x) => x.etiq + ': te cobran ' + eur(x.importe) + ' (tope ' + eur(x.tope) + ')'),
        'Tope legal (25% WML×40)',
      ),
    )
  }
  if (Q.fee === 'si') OK.unshift(card('flag', 'Cobrarte por conseguirte trabajo es ILEGAL', '', [], 'Ley Waadi'))
  const falta: string[] = []
  ;([['contrato', 'contrato de alquiler a tu nombre'], ['snf', 'certificado SNF'], ['poder', 'poder firmado']] as const).forEach((p) => {
    if (Q[p[0]] === 'no') falta.push(p[1])
  })
  if (falta.length) OK.unshift(card('flag', 'La deducción de vivienda podría ser ilegal', 'Falta: ' + falta.join(', ') + '. Sin eso no se puede descontar del mínimo, aunque respeten el tope.', []))

  // -- REVISIÓN HUMANA -- Solo lo que el trabajador puede hacer algo con ello. Nada de relleno.
  const T = tramos(S, edad)

  return { OK, REV, agg, T }
}
