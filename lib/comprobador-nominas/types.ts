// Tipos compartidos del comprobador de nóminas. Ningún módulo decide nada
// aquí — solo describen la forma de los datos que se pasan entre módulos.

export type Registro = {
  file: string
  notes: string[]
  error?: 1
  agencia?: string
  wmlImpreso?: number
  fecha?: string // ISO yyyy-mm-dd — clave canónica, siempre ordenable
  nacimiento?: string // ISO
  etiq?: string // "2026-S16"
  sort?: number | null
  uren?: number
  uurloon?: number
  origen?: 'declaración' | 'overwerk' | 'derivada'
  storno?: boolean
  bruto?: number
  soloVacaciones?: boolean
  feestdagen?: number
  vakDagPagado?: number
  vak?: number
  pension?: boolean
  vivienda?: number
  nettoBet?: number
  nettoMin?: number
  groep?: string
  fj?: number
  cao?: string
  fase?: string
  functie?: string
  inlener?: string
}

export type Ilegible = { file: string; cause: 'lectura' | 'sin_semana'; why: string }

export type Conflicto = {
  etiq: string
  valores: number[]
  n: number
  files: string[]
  registros: Registro[]
}

export type ClassifyResult = {
  total: number
  semanas: Registro[]
  vacaciones: Registro[]
  parciales: Registro[]
  stornos: Registro[]
  conflictos: Conflicto[]
  ilegibles: Ilegible[]
  duplicados: number
}

export type Tramo = {
  rate: number
  from: string
  to: string
  n: number
  hrs: number
  inlener: string
  fjset: Record<number, 1>
  fecha?: string
  min: number | null
}

export type SegmentoEmpresa = { rate: number; from: string; to: string; n: number }

export type Empresa = {
  inlener: string
  n: number
  desde: string
  hasta: string
  tarifaActual: number
  segments: SegmentoEmpresa[]
  bajadas: number[]
}

export type Contrato = {
  desde: string
  hasta: string
  importe: number
  aprox?: boolean
  file?: string
  veredicto?: Veredicto | null
  alertas?: ClausulaDetectada[]
}

export type Veredicto = { ok: boolean; tope: number; tipo: 'PKS' | '25% WML×40'; law?: string }

export type ClausulaDetectada = { t: string; law?: string; snip: string }

// Respuestas del cuestionario "lo que la nómina no dice". Solo fee,
// contrato, snf y poder alimentan checks() hoy — extHous, transport y bici
// se capturan y se muestran (el botón cambia a "pulsado") pero todavía no
// entran en ningún chequeo legal. Igual que en la versión original: es
// deliberado, no un olvido de este puerto.
export type Respuestas = {
  fee: 'si' | 'no' | 'ns' | null
  contrato: 'si' | 'no' | 'ns' | null
  snf: 'si' | 'no' | 'ns' | null
  poder: 'si' | 'no' | 'ns' | null
  extHous: 'si' | 'no' | 'ns' | null
  transport: 'si' | 'no' | 'ns' | null
  bici: 'si' | 'no' | 'ns' | null
}

export type Card = { k: 'pass' | 'flag' | 'warn' | 'info'; t: string; p: string; pills: string[]; law?: string }

export type Agregados = {
  totHrs: number
  bajoMin: number
  vakBajo: number
  sinPension: number
  pksSem: number
  pksExc: number
  pksLista: { etiq: string; importe: number; tope: number }[]
  housSem: number
  housLista: { etiq: string; importe: number; tope: number }[]
  gapTot: number
  gapSem: number
  peak: number
  caida: number
  minNow: number | null
  enSuelo: boolean
  first: Registro
  last: Registro
}

export type ChecksResult = {
  OK: Card[]
  REV: Card[]
  agg: Agregados | Record<string, never>
  T?: Tramo[]
}

export type Periodo = { esperadas: number; faltan: number; meses: number }

export type Norma = {
  concepto: string
  norma: string
  articulo: string
  desde: string
  hasta: string | null
  valor: number
  unidad: string
}

export type SemanaCaso = {
  semana: string
  empresaUsuaria: string | null
  horasNormales: number
  horasFestivo: number
  tarifa: number | null
  vivienda: number | null
  doc: string
}

export type Caso = {
  demo: boolean
  generadoEl: string
  empleador: { nombre: string | null; kvk: string | null }
  periodo: { desde: string; hasta: string }
  convenioAsumido: string | null
  documentosNoAportados: string[]
  normas: Norma[]
  normasPendientes: string[]
  semanas: SemanaCaso[]
}
