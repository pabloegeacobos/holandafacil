import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Public_Sans, Source_Serif_4 } from 'next/font/google'
import ComprobadorNominasClient from './ComprobadorNominasClient'

const BASE = 'https://holandafacil.com'
const TITLE = 'Comprobador de nóminas — coteja tu loonstrook con el CAO'
const DESCRIPTION = 'Suelta tus nóminas en PDF y compáralas semana a semana con el salario mínimo, el vakantiegeld y el tope de vivienda del CAO. Todo se procesa en tu móvil, nunca se sube a ningún sitio.'

// Identidad visual propia del comprobador (papel + tinta índigo + acento
// ocre) — next/font las self-hostea en el build, igual que --font-syne en
// el layout general, así que no hay ninguna petición a Google Fonts en
// producción.
const sourceSerif = Source_Serif_4({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-cn-serif' })
const publicSans = Public_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-cn-sans' })

// Contenido en español, específico del CAO neerlandés: solo vive en /es por
// ahora. Si se añade neerlandés más adelante, será una carpeta de locale
// nueva, sin tocar esta página.
export async function generateStaticParams() {
  return [{ locale: 'es' }]
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (locale !== 'es') return {}
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: `${BASE}/es/recursos/comprobador-nominas` },
    openGraph: {
      title: `${TITLE} — HolandaFácil`,
      description: DESCRIPTION,
      url: `${BASE}/es/recursos/comprobador-nominas`,
      type: 'website',
    },
  }
}

export default async function ComprobadorNominasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (locale !== 'es') notFound()

  const informeTemplate = await readFile(path.join(process.cwd(), 'lib/comprobador-nominas/informe/informe-plantilla.html'), 'utf8')

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Comprobador de nóminas',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (navegador)',
    description: DESCRIPTION,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  }

  return (
    <div className={`${sourceSerif.variable} ${publicSans.variable}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ComprobadorNominasClient informeTemplate={informeTemplate} />
    </div>
  )
}
