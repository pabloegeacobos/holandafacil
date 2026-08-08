// Controlador imperativo del comprobador de nóminas. Mismo algoritmo que la
// versión original (soltar PDFs → leer → clasificar → comprobar → confirmar
// → informe), ahora sobre los módulos puros y testeados de
// lib/comprobador-nominas/ en vez de funciones inline. La UI sigue siendo
// imperativa (innerHTML sobre un contenedor propio) a propósito: es la
// forma más segura de trasladar ~700 líneas de lógica de pintado ya
// validada sin reescribirla en JSX y arriesgar una divergencia de
// comportamiento sutil.
//
// Se monta una sola vez por página (ver ComprobadorNominasClient.tsx) sobre
// un contenedor `root` que ya trae en su HTML estático: #drop, #file,
// #status, #cfg, #out.

import type { Card, Contrato, Registro, Respuestas } from '@/lib/comprobador-nominas/types'
import { esc, eur, num } from '@/lib/comprobador-nominas/utils'
import { ensureWorkerConfigured, readPdf } from '@/lib/comprobador-nominas/pdf-reader'
import { parse } from '@/lib/comprobador-nominas/parsers/registry'
import { classify, contratoEn, periodo, porEmpresa } from '@/lib/comprobador-nominas/classify'
import { checks } from '@/lib/comprobador-nominas/checks'
import { escanearContrato, parseContrato, veredictoPKS } from '@/lib/comprobador-nominas/contrato'
import { construirCASO } from '@/lib/comprobador-nominas/caso-adapter'
import { wmlAt, wmlExpira } from '@/lib/comprobador-nominas/reference-data'
import { buildInformeHtml } from '@/lib/comprobador-nominas/informe/build-informe'

const ICON: Record<Card['k'], string> = {
  pass: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>',
  flag: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  warn: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  info: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
}

const BATCH = 4 // concurrencia limitada: muchos PDF a la vez revientan la memoria de un móvil
const EDAD = '21' // fallback si una nómina no trae fecha de nacimiento

export function initComprobador(root: HTMLElement, informeTemplate: string): () => void {
  const $ = <T extends HTMLElement = HTMLElement>(id: string): T => root.querySelector('#' + id) as T

  // ═══════════ ESTADO ═══════════
  let RECS: Registro[] = []
  let CT: Contrato[] = [{ desde: '', hasta: '', importe: NaN }]
  const Q: Respuestas = { fee: null, contrato: null, snf: null, poder: null, extHous: null, transport: null, bici: null }
  let R = classify([])
  let ANA = checks(R, [], EDAD, Q)
  let CONFIRMED = false
  let CT_AVISOS = '' // avisos de lectura de contratos — sobreviven al repintado de #cfg

  function load(list: FileList) {
    const arr = Array.from(list).filter((f) => /pdf/i.test(f.type) || /\.pdf$/i.test(f.name))
    if (!arr.length) {
      $('status').textContent = 'Por ahora solo PDF.'
      return
    }
    if (typeof window === 'undefined' || !window.pdfjsLib) {
      $('status').textContent = 'No se pudo cargar el lector de PDF. Comprueba la conexión y recarga la página — tus nóminas no se han enviado a ningún sitio.'
      return
    }
    let res: Registro[] = []
    let i = 0
    $('status').textContent = 'Leyendo 0 / ' + arr.length + ' en tu dispositivo…'
    ;(function next() {
      if (i >= arr.length) {
        RECS = RECS.concat(res)
        const todoFallo = res.length > 1 && res.every((r) => r.error)
        $('status').textContent = todoFallo
          ? 'Ningún archivo se pudo leer. Si son fotos o escaneos, aún no puedo leerlos. Si son PDF normales, recarga la página y prueba de nuevo.'
          : '✓ ' + arr.length + ' archivo' + (arr.length === 1 ? '' : 's') + ' leído' + (arr.length === 1 ? '' : 's') + ' — ' + RECS.length + ' en total. Sigue añadiendo o confirma abajo.'
        $('cfg').classList.remove('hidden')
        CONFIRMED = false
        run()
        return
      }
      const lote = arr.slice(i, i + BATCH)
      i += lote.length
      Promise.all(
        lote.map((f) =>
          readPdf(f)
            .then((t) => parse(t, f.name))
            .catch(() => ({ file: esc(f.name), error: 1 as const, notes: [] })),
        ),
      ).then((r) => {
        res = res.concat(r)
        $('status').textContent = 'Leyendo ' + Math.min(i, arr.length) + ' / ' + arr.length + ' en tu dispositivo…'
        next()
      })
    })()
  }

  const drop = $('drop')
  const file = $<HTMLInputElement>('file')
  const onDragOver = (e: Event) => {
    e.preventDefault()
    drop.classList.add('over')
  }
  const onDragLeave = (e: Event) => {
    e.preventDefault()
    drop.classList.remove('over')
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    drop.classList.remove('over')
    if (e.dataTransfer) load(e.dataTransfer.files)
  }
  const onDropClick = () => file.click()
  const onDropKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      file.click()
    }
  }
  const onFileChange = () => {
    if (file.files) load(file.files)
    file.value = ''
  }
  drop.addEventListener('dragover', onDragOver)
  drop.addEventListener('dragenter', onDragOver)
  drop.addEventListener('dragleave', onDragLeave)
  drop.addEventListener('drop', onDrop)
  drop.addEventListener('click', onDropClick)
  drop.addEventListener('keydown', onDropKeydown)
  file.addEventListener('change', onFileChange)

  function loadContrato(list: FileList) {
    const arr = Array.from(list).filter((f) => /pdf/i.test(f.type) || /\.pdf$/i.test(f.name))
    if (!arr.length) return
    const st = $('statusct')
    st.textContent = 'Leyendo…'
    let i = 0
    const avisos: string[] = []
    ;(function next() {
      if (i >= arr.length) {
        CT_AVISOS = avisos.length ? avisos.join(' ') : ''
        CONFIRMED = false
        run()
        return
      }
      const f = arr[i++]
      readPdf(f)
        .then((txt) => {
          const c = parseContrato(txt)
          c.veredicto = veredictoPKS(c)
          c.alertas = escanearContrato(txt)
          c.file = f.name
          if (!c.desde && !c.importe) avisos.push('No pude leer el importe ni la fecha de ' + f.name + ' automáticamente — lo tienes abajo, en "Ajustar a mano", para rellenarlo tú.')
          CT.push(c)
          next()
        })
        .catch(() => {
          avisos.push('No se pudo abrir ' + f.name + '.')
          next()
        })
    })()
  }

  function run() {
    R = classify(RECS)
    ANA = checks(
      R,
      CT.filter((c) => c.desde && !Number.isNaN(c.importe)),
      EDAD,
      Q,
    )
    paint()
  }

  function paint() {
    const hoy = new Date().toISOString().slice(0, 10)
    const vg = wmlAt(hoy)
    let cfg = vg ? '' : '<div class="panel"><p class="ps" style="color:var(--flag);font-weight:700">⚠ Esta herramienta no tiene cargado el mínimo desde el ' + wmlExpira() + '. Esas semanas se apartan sin comprobar.</p></div>'

    cfg +=
      '<div class="panel"><h3>Tus contratos de alquiler</h3>' +
      '<div class="drop sm" id="dropct" role="button" tabindex="0" aria-label="Suelta tu contrato de alquiler en PDF">Suelta tu contrato de alquiler en PDF' +
      '<input type="file" id="filect" accept=".pdf,application/pdf" multiple hidden></div>' +
      '<div class="status" id="statusct" aria-live="polite">' +
      esc(CT_AVISOS) +
      '</div>' +
      CT.map((c, i) => {
        if (!c.importe) return ''
        const etiqueta = c.file || 'Contrato ' + (i + 1) + ' (añadido a mano)'
        if (!CONFIRMED) {
          return '<div class="f" style="border-left:4px solid var(--line);padding:8px 0 8px 12px;margin-top:10px">' + '<b style="font-size:12.5px;color:var(--faint)">' + etiqueta + '</b>' + '<p class="ps">Recibido. El resultado se muestra al confirmar.</p></div>'
        }
        const v = veredictoPKS(c)
        const veredictoHtml = !v
          ? '<p class="ps">Alquiler: ' + eur(c.importe) + '/semana — no tengo fecha fiable para saber qué tope aplicaba, así que no afirmo si lo respeta.</p>'
          : v.ok
            ? '<p class="pl" style="color:var(--pass)">✓ ' + eur(c.importe) + '/semana respeta el tope legal (' + v.tipo + ': máx. ' + eur(v.tope) + ')</p>'
            : '<p class="pl" style="color:var(--flag)">⚠ ' + eur(c.importe) + '/semana SUPERA el tope legal (' + v.tipo + ': máx. ' + eur(v.tope) + ') — ' + v.law + '</p>'
        const alertasHtml =
          c.alertas && c.alertas.length
            ? '<div style="margin-top:8px">' +
              c.alertas
                .map((a) => '<p class="pl" style="color:var(--warn);margin-top:4px">⚠ ' + a.t + (a.law ? ' <span style="color:var(--faint)">— ' + a.law + '</span>' : '') + '<br><span style="font-size:11.5px;color:var(--faint);font-style:italic">"' + a.snip + '"</span></p>')
                .join('') +
              '</div>'
            : c.file
              ? '<p class="pl" style="color:var(--faint);margin-top:6px">Sin cláusulas de las que suelo vigilar.</p>'
              : ''
        return '<div class="f" style="border-left:4px solid ' + (v && !v.ok ? 'var(--flag)' : 'var(--line)') + ';padding:8px 0 8px 12px;margin-top:10px">' + '<b style="font-size:12.5px;color:var(--faint)">' + etiqueta + '</b>' + veredictoHtml + alertasHtml + '</div>'
      }).join('') +
      (CT.length
        ? '<details' +
          (CT_AVISOS || CT.some((c) => c.file && !c.importe) ? ' open' : '') +
          ' style="margin-top:12px"><summary style="cursor:pointer;font-size:12.5px;color:var(--faint)">Ajustar fechas o importes a mano</summary>' +
          '<table class="ct" style="margin-top:8px"><tr><th>Desde</th><th>Hasta</th><th>€ / semana</th><th></th></tr>' +
          CT.map(
            (c, i) =>
              '<tr>' +
              '<td><input type="date" data-ci="' + i + '" data-cf="desde" value="' + (c.desde || '') + '"></td>' +
              '<td><input type="date" data-ci="' + i + '" data-cf="hasta" value="' + (c.hasta || '') + '"></td>' +
              '<td><input type="text" inputmode="decimal" data-ci="' + i + '" data-cf="importe" placeholder="172,02" value="' + (Number.isNaN(c.importe) ? '' : String(c.importe).replace('.', ',')) + '"></td>' +
              '<td><button class="rm" data-rm="' + i + '">×</button></td></tr>',
          ).join('') +
          '</table></details>'
        : '<button class="btn sm" id="addct" style="margin-top:8px">+ añadir a mano</button>') +
      '</div>'
    $('cfg').innerHTML = cfg
    const addct = root.querySelector<HTMLButtonElement>('#addct')
    if (addct)
      addct.addEventListener('click', () => {
        CT.push({ desde: '', hasta: '', importe: NaN })
        CONFIRMED = false
        run()
      })

    const dropct = $('dropct')
    const filect = $<HTMLInputElement>('filect')
    dropct.addEventListener('click', () => filect.click())
    dropct.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
        e.preventDefault()
        filect.click()
      }
    })
    ;['dragover', 'dragenter'].forEach((ev) =>
      dropct.addEventListener(ev, (e) => {
        e.preventDefault()
        dropct.classList.add('over')
      }),
    )
    ;['dragleave', 'drop'].forEach((ev) =>
      dropct.addEventListener(ev, (e) => {
        e.preventDefault()
        dropct.classList.remove('over')
      }),
    )
    dropct.addEventListener('drop', (e) => {
      const dt = (e as DragEvent).dataTransfer
      if (dt) loadContrato(dt.files)
    })
    filect.addEventListener('change', () => {
      if (filect.files) loadContrato(filect.files)
      filect.value = ''
    })
    root.querySelectorAll<HTMLButtonElement>('[data-rm]').forEach((b) => {
      b.addEventListener('click', () => {
        CT.splice(+(b.dataset.rm as string), 1)
        CONFIRMED = false
        run()
      })
    })
    root.querySelectorAll<HTMLInputElement>('[data-ci]').forEach((inp) => {
      inp.addEventListener('change', () => {
        const c = CT[+(inp.dataset.ci as string)]
        const f = inp.dataset.cf as 'desde' | 'hasta' | 'importe'
        if (f === 'importe') c.importe = num(inp.value)
        else c[f] = inp.value
        CONFIRMED = false
        run()
      })
    })

    const ctReales = CT.filter((c) => c.importe && !Number.isNaN(c.importe))
    const hayAlgo = (R && R.total > 0) || ctReales.length > 0
    if (!hayAlgo) {
      $('out').innerHTML = ''
      return
    }
    if (!CONFIRMED) {
      const partesPend: string[] = []
      if (R && R.total) partesPend.push(R.total + ' nómina' + (R.total === 1 ? '' : 's'))
      if (ctReales.length) partesPend.push(ctReales.length + ' contrato' + (ctReales.length === 1 ? '' : 's') + ' de alquiler')
      $('out').innerHTML =
        '<div class="panel" style="text-align:center;padding:26px 20px">' +
        '<h3 style="margin-bottom:6px">Documentos listos: ' +
        partesPend.join(' · ') +
        '</h3>' +
        '<p class="ps" style="margin-bottom:16px">Puedes seguir añadiendo más archivos — de otra carpeta, o el contrato si te falta. Nada se calcula hasta que confirmes.</p>' +
        '<button id="confirmarBtn" class="btn primary">Confirmar y ver resultados</button></div>'
      $('confirmarBtn').addEventListener('click', () => {
        CONFIRMED = true
        paint()
      })
      return
    }
    if (!R || !R.total) {
      $('out').innerHTML = ''
      return
    }

    /* --- HISTORIAL: perspectiva temporal. La traza contable queda en una línea. --- */
    const S = R.semanas
    const partes = [S.length + ' semanas']
    if (R.vacaciones.length) partes.push(R.vacaciones.length + ' de solo festivo/vacaciones')
    if (R.parciales.length) partes.push(R.parciales.length + ' sin tarifa por hora')
    if (R.duplicados) partes.push(R.duplicados + ' duplicadas')
    if (R.stornos.length) partes.push(R.stornos.length + ' reversiones')
    if (R.conflictos.length) partes.push(R.conflictos.reduce((s, c) => s + c.n, 0) + ' en conflicto')
    if (R.ilegibles.length) partes.push(R.ilegibles.length + ' ilegibles')
    const traza = R.total + ' archivos = ' + partes.join(' + ') + ' ✓'

    if (!S.length) {
      $('out').innerHTML = '<div class="panel"><h3>No hay semanas analizables</h3><p class="ps">' + traza + '</p></div>'
      return
    }
    const P = periodo(S)!
    const pri = S[0]
    const ult = S[S.length - 1]
    let H =
      '<div class="panel"><h3>Tu historial</h3><div class="recon">' +
      rb(S.length, 'semanas con nómina', 'ok') +
      rb('≈' + P.meses + ' meses', pri.etiq + ' → ' + ult.etiq, '') +
      rb(P.faltan, 'semanas sin nómina en el período', P.faltan ? 'x' : 'ok') +
      '</div><div class="eq">' + traza + '</div></div>'

    /* --- POR EMPRESA --- */
    const PE = porEmpresa(S)
    H += '<div class="hero"><div class="top"><h2>' + S.length + ' semanas</h2>' + '<span class="meta">' + PE.length + ' empresa' + (PE.length === 1 ? '' : 's') + '</span></div></div>'
    H += '<div class="evo"><h3>Empresas y tarifa</h3>'
    PE.forEach((e) => {
      const camino = e.segments.map((sg, i) => {
        const baja = e.bajadas.indexOf(i) > -1
        return '<span' + (baja ? ' style="color:var(--flag);font-weight:700"' : '') + '>' + eur(sg.rate) + '</span> (' + sg.n + ' sem)'
      }).join(' → ')
      H +=
        '<div class="f" style="border-left:4px solid ' + (e.bajadas.length ? 'var(--flag)' : 'var(--line)') + ';padding:8px 0 8px 12px;margin-bottom:8px">' +
        '<b>' + e.inlener + '</b> — ' + e.n + ' semana' + (e.n === 1 ? '' : 's') + ' (' + e.desde + ' → ' + e.hasta + ') · ahora ' + eur(e.tarifaActual) + '/hora' +
        (e.segments.length > 1 ? '<p class="pl">' + camino + '</p>' : '') +
        (e.bajadas.length ? '<p class="pl" style="color:var(--flag)">⚠ Aquí te bajaron la tarifa, no subió — pregunta por qué.</p>' : '') +
        '</div>'
    })
    H += '</div>'

    /* --- PREGUNTAS --- */
    H +=
      '<div class="quiz"><h3>Lo que la nómina no dice</h3><p class="sub">El dinero que pagas por fuera nunca sale en una loonstrook.</p>' +
      q('fee', '¿Te cobraron por conseguirte el trabajo?') +
      q('extHous', '¿Pagas vivienda por transferencia, aparte?') +
      q('transport', '¿Te cobran el transporte?') +
      q('bici', '¿Te cobran una bicicleta?') +
      q('contrato', '¿Tienes contrato de alquiler a TU nombre?') +
      q('snf', '¿Tu alojamiento tiene certificado SNF?') +
      q('poder', '¿Firmaste un poder autorizando el descuento?') +
      '</div>'

    if (ANA.OK.length) H += '<div class="sec">Confirmado con cifras</div>' + ANA.OK.map(card).join('')
    if (ANA.REV.length) H += '<div class="sec">Requiere revisión humana</div>' + ANA.REV.map(card).join('')
    H += '<div class="acts"><button class="btn primary" id="rep">Generar informe</button></div>'

    $('out').innerHTML = H
    root.querySelectorAll<HTMLButtonElement>('[data-q]').forEach((b) => {
      b.addEventListener('click', () => {
        const key = b.dataset.q as keyof Respuestas
        Q[key] = b.dataset.v as Respuestas[typeof key]
        run()
      })
    })
    $('rep').addEventListener('click', report)
  }

  /* ═══════════ INFORME ═══════════ */
  function report() {
    const caso = construirCASO(R, CT)
    const full = buildInformeHtml(informeTemplate, caso)

    let host = root.querySelector<HTMLDivElement>('#rview')
    if (!host) {
      host = document.createElement('div')
      host.id = 'rview'
      root.querySelector('.wrap')!.appendChild(host)
    }
    host.innerHTML =
      '<div style="display:flex;gap:9px;margin:24px 0 12px;flex-wrap:wrap">' +
      '<button class="btn primary" id="rprint">Imprimir / Guardar PDF</button>' +
      '<button class="btn" id="rdl">Descargar HTML</button>' +
      '<button class="btn" id="rclose">Cerrar</button></div>' +
      '<iframe id="rframe" title="Vista previa del informe" ' +
      'style="width:100%;min-height:70vh;border:1px solid var(--line);border-radius:14px;background:#fff"></iframe>'
    host.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // La plantilla trae su propio <script> que rellena el informe (render()).
    // innerHTML NUNCA ejecuta <script>, así que la vista previa tiene que ir
    // en un iframe con su propio documento.
    ;(root.querySelector('#rframe') as HTMLIFrameElement).srcdoc = full
    root.querySelector('#rclose')!.addEventListener('click', () => host!.remove())
    root.querySelector('#rdl')!.addEventListener('click', () => {
      const b = new Blob([full], { type: 'text/html' })
      const u = URL.createObjectURL(b)
      const el = document.createElement('a')
      el.href = u
      el.download = 'informe-nominas.html'
      document.body.appendChild(el)
      el.click()
      el.remove()
      setTimeout(() => URL.revokeObjectURL(u), 2000)
    })
    root.querySelector('#rprint')!.addEventListener('click', () => {
      const f = document.createElement('iframe')
      f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
      document.body.appendChild(f)
      f.contentDocument!.open()
      f.contentDocument!.write(full)
      f.contentDocument!.close()
      setTimeout(() => {
        try {
          f.contentWindow!.focus()
          f.contentWindow!.print()
        } catch {
          /* el navegador puede bloquear la impresión programática; el botón "Descargar HTML" sigue disponible */
        }
        setTimeout(() => f.remove(), 1000)
      }, 350)
    })
  }

  /* ═══════════ HELPERS DE RENDER ═══════════ */
  function rb(n: number | string, l: string, cls: string) {
    return '<div class="rb' + (cls ? ' ' + cls : '') + '"><div class="n">' + n + '</div><div class="l">' + l + '</div></div>'
  }
  function card(x: Card) {
    return (
      '<div class="rc ' + x.k + '"><div class="rc-head"><span class="rc-ic">' + ICON[x.k] + '</span><div><h4>' + x.t + '</h4>' +
      (x.p ? '<p>' + x.p + '</p>' : '') +
      (x.law ? '<span class="law">' + x.law + '</span>' : '') +
      '</div></div>' +
      (x.pills.length ? '<div class="rc-num">' + x.pills.map((p) => '<span class="pill">' + p + '</span>').join('') + '</div>' : '') +
      '</div>'
    )
  }
  function q(id: keyof Respuestas, t: string) {
    const b = (v: string, l: string) => '<button data-q="' + id + '" data-v="' + v + '" aria-pressed="' + (Q[id] === v) + '">' + l + '</button>'
    return '<div class="q"><p>' + t + '</p><div class="opts">' + b('si', 'Sí') + b('no', 'No') + b('ns', 'No lo sé') + '</div></div>'
  }

  ensureWorkerConfigured()
  paint() // pinta el panel de contratos desde el arranque — no depende de haber subido nóminas antes

  return function dispose() {
    drop.removeEventListener('dragover', onDragOver)
    drop.removeEventListener('dragenter', onDragOver)
    drop.removeEventListener('dragleave', onDragLeave)
    drop.removeEventListener('drop', onDrop)
    drop.removeEventListener('click', onDropClick)
    drop.removeEventListener('keydown', onDropKeydown)
    file.removeEventListener('change', onFileChange)
  }
}
