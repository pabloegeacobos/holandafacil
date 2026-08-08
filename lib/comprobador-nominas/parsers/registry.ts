// Punto de extensión: si en el futuro aparece una nómina con una estructura
// que el motor genérico (core.ts) no pueda leer — Loonheffingennummer en
// otra posición, bloques Declaratie con otra sintaxis — su parser específico
// se añade aquí, se registra en ESPECIALIZADOS, y se prueba solo. El core no
// se toca.
//
// Hoy no existe ninguno: PWS y T&S Flex Logistiek comparten la misma
// estructura y ambas pasan por el motor genérico sin distinción.

import type { Registro } from '../types'
import { parse as parseCore } from './core'

type Parser = { detect: (text: string) => boolean; parse: (text: string, name: string) => Registro }

const ESPECIALIZADOS: Parser[] = []

export function parse(text: string, name: string): Registro {
  const especial = ESPECIALIZADOS.find((p) => p.detect(text))
  return especial ? especial.parse(text, name) : parseCore(text, name)
}
