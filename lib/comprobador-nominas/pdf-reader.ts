// Lectura de PDF en el navegador, vía pdf.js. Nunca sube el archivo a
// ningún sitio: FileReader + WebAssembly/worker locales, todo en el
// dispositivo del trabajador. pdf.js va self-hosted (public/vendor/pdfjs),
// nunca por CDN — ver PDFJS_BASE_PATH.

export const PDFJS_VERSION = '3.11.174'
export const PDFJS_BASE_PATH = `/vendor/pdfjs/${PDFJS_VERSION}`
export const PDFJS_SCRIPT_SRC = `${PDFJS_BASE_PATH}/pdf.min.js`
export const PDFJS_WORKER_SRC = `${PDFJS_BASE_PATH}/pdf.worker.min.js`

type PdfTextItem = { transform: number[]; str: string }
type PdfTextContent = { items: PdfTextItem[] }
type PdfPage = { getTextContent(): Promise<PdfTextContent> }
type PdfDocument = { numPages: number; getPage(n: number): Promise<PdfPage>; destroy(): void }
type PdfjsLib = {
  GlobalWorkerOptions: { workerSrc: string }
  getDocument(opts: { data: Uint8Array }): { promise: Promise<PdfDocument> }
}

declare global {
  interface Window {
    pdfjsLib?: PdfjsLib
  }
}

const Y_TOL = 2 // px: items a ≤2px de distancia vertical son la misma línea visual

export function ensureWorkerConfigured(): void {
  if (typeof window !== 'undefined' && window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC
  }
}

export function readPdf(f: File): Promise<string> {
  return new Promise((res, rej) => {
    if (typeof window === 'undefined' || !window.pdfjsLib) return rej(new Error('pdfjs-no-cargado'))
    const pdfjsLib = window.pdfjsLib
    const fr = new FileReader()
    fr.onload = () => {
      let doc: PdfDocument | null = null
      pdfjsLib
        .getDocument({ data: new Uint8Array(fr.result as ArrayBuffer) })
        .promise.then((pdf) => {
          doc = pdf
          const ps: number[] = []
          for (let i = 1; i <= pdf.numPages; i++) ps.push(i)
          return Promise.all(
            ps.map((n) =>
              pdf
                .getPage(n)
                .then((p) => p.getTextContent())
                .then((c) => {
                  // Reconstrucción del orden de lectura: cluster por Y con
                  // tolerancia (redondear a px exacto parte líneas cuando
                  // los items difieren ±1px).
                  const its = c.items
                    .map((it) => ({ x: it.transform[4], y: it.transform[5], s: it.str }))
                    .sort((a, b) => b.y - a.y || a.x - b.x)
                  const lines: { y: number; it: { x: number; s: string }[] }[] = []
                  let cur: { y: number; it: { x: number; s: string }[] } | null = null
                  its.forEach((it) => {
                    if (!cur || cur.y - it.y > Y_TOL) {
                      cur = { y: it.y, it: [] }
                      lines.push(cur)
                    }
                    cur.it.push(it)
                  })
                  return lines
                    .map((l) =>
                      l.it
                        .sort((a, b) => a.x - b.x)
                        .map((t) => t.s)
                        .join(' '),
                    )
                    .join('\n')
                }),
            ),
          )
        })
        .then((t) => {
          if (doc) doc.destroy() // liberar memoria: crítico con lotes grandes
          res(t.join('\n'))
        })
        .catch((e) => {
          if (doc) doc.destroy()
          rej(e)
        })
    }
    fr.onerror = () => rej(new Error('lectura-fichero'))
    fr.readAsArrayBuffer(f)
  })
}
