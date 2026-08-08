'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { PDFJS_SCRIPT_SRC } from '@/lib/comprobador-nominas/pdf-reader'
import { initComprobador } from './comprobador-controller'
import './comprobador.css'

export default function ComprobadorNominasClient({ informeTemplate }: { informeTemplate: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [pdfjsReady, setPdfjsReady] = useState(false)

  useEffect(() => {
    if (!pdfjsReady || !rootRef.current) return
    return initComprobador(rootRef.current, informeTemplate)
  }, [pdfjsReady, informeTemplate])

  return (
    <>
      {/* pdf.js self-hosted (public/vendor/pdfjs) — nunca por CDN. El PDF se
          lee entero en el navegador; no hay ninguna petición de red durante
          el análisis. */}
      <Script src={PDFJS_SCRIPT_SRC} strategy="afterInteractive" onReady={() => setPdfjsReady(true)} />
      <div className="cn" ref={rootRef}>
        <div className="wrap">
          <span className="tag">Se lee en tu móvil · no se sube nada</span>
          <h1>Comprobador de nóminas</h1>
          <p className="lede">Suelta tus loonstroken. Cuadro todos los archivos, ordeno tu tarifa semana a semana y genero un informe con lo que se puede confirmar.</p>
          <p className="privacy">
            <b>Apaga los datos y pruébalo:</b> sigue funcionando. Tu nómina se procesa aquí y nunca se sube.
          </p>

          <div className="drop" id="drop" role="button" tabIndex={0} aria-label="Suelta o selecciona tus nóminas en PDF">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#264C93" strokeWidth="1.8" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <h3>Suelta tus PDF aquí</h3>
            <p>todas las que tengas</p>
            <input id="file" type="file" accept="application/pdf" multiple className="hidden" />
          </div>
          <div className="status" id="status" aria-live="polite" />
          <div id="cfg" />
          <div id="out" />
          <p className="foot">
            <strong>Qué es y qué no es.</strong> Comprueba suelos legales y reglas del CAO ABU verificables con cifras. Lo que no puede confirmar lo aparta y lo declara — nunca lo adivina ni lo promedia. No es asesoría legal.
          </p>
        </div>
      </div>
    </>
  )
}
