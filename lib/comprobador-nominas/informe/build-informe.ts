// Construye el HTML final del informe a partir de la plantilla canónica
// (informe-plantilla.html) y el CASO real. Función pura: recibe el texto
// de la plantilla ya leído (por el Server Component, sin red — es un
// archivo estático del propio repo) y el CASO, y devuelve el documento
// completo listo para un iframe con srcdoc, descarga o impresión.
//
// La plantilla es la ÚNICA fuente de verdad: no se duplica a mano en
// ningún otro sitio. Este módulo solo sustituye el bloque marcado con
// CASO:START/CASO:END por los datos reales.

import type { Caso } from '../types'

const START = '/* CASO:START */'
const END = '/* CASO:END */'

export function buildInformeHtml(template: string, caso: Caso): string {
  const i = template.indexOf(START)
  const j = template.indexOf(END)
  if (i === -1 || j === -1 || j < i) {
    throw new Error('informe-plantilla.html: no se encontraron los marcadores CASO:START/CASO:END — la plantilla se ha modificado sin actualizar este adaptador')
  }
  const before = template.slice(0, i)
  const after = template.slice(j + END.length)
  const bloqueCaso = `const CASO = ${JSON.stringify(caso)};`
  return '<!DOCTYPE html>\n<html lang="es">\n' + before + bloqueCaso + after + '\n</html>'
}
