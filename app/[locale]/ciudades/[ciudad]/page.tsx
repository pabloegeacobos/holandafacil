import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const BASE = 'https://holandafacil.com'

const CITIES: Record<string, { name: string; slug: string }> = {
  amsterdam:  { name: 'Ámsterdam',  slug: 'amsterdam' },
  rotterdam:  { name: 'Róterdam',   slug: 'rotterdam' },
  eindhoven:  { name: 'Eindhoven',  slug: 'eindhoven' },
  'den-haag': { name: 'La Haya',    slug: 'den-haag'  },
}

export async function generateStaticParams() {
  const locales = ['es', 'en', 'pl']
  return locales.flatMap((locale) =>
    Object.keys(CITIES).map((ciudad) => ({ locale, ciudad }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; ciudad: string }>
}): Promise<Metadata> {
  const { locale, ciudad } = await params
  const city = CITIES[ciudad]
  if (!city) return {}
  return {
    title: `Trabajar en ${city.name} siendo hispanohablante`,
    description: `Guía para hispanohablantes en ${city.name}: ETTs, coste de vida, barrios y trámites esenciales.`,
    alternates: {
      canonical: `${BASE}/${locale}/ciudades/${ciudad}`,
    },
    openGraph: {
      title: `Trabajar en ${city.name} siendo hispanohablante`,
      description: `Guía para hispanohablantes en ${city.name}: ETTs, coste de vida, barrios y trámites esenciales.`,
      url: `${BASE}/${locale}/ciudades/${ciudad}`,
      type: 'article',
    },
  }
}

export default async function CiudadPage({
  params,
}: {
  params: Promise<{ locale: string; ciudad: string }>
}) {
  const { locale, ciudad } = await params
  const city = CITIES[ciudad]
  if (!city) notFound()

  const citySchema = {
    '@context': 'https://schema.org',
    '@type': 'City',
    name: city.name,
    containedInPlace: { '@type': 'Country', name: 'Países Bajos' },
  }

  const sections = [
    { id: 'ett',      title: `ETTs en ${city.name}`,          cta: { label: `Ver ETTs en ${city.name}`, href: `/${locale}/ett?ciudad=${ciudad}` } },
    { id: 'coste',    title: 'Coste de vida',                  cta: null },
    { id: 'barrios',  title: 'Barrios recomendados',           cta: null },
    { id: 'tramites', title: 'Trámites específicos',           cta: null },
  ]

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(citySchema) }} />

      {/* Hero */}
      <section style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: 'clamp(48px, 8vw, 80px) 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{ color: '#f97316', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
            Países Bajos
          </p>
          <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.8rem)', fontWeight: 900, color: 'var(--text)', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Vivir y trabajar en {city.name}
          </h1>
          <p style={{ color: 'var(--text-subtle)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 560, margin: 0 }}>
            Guía práctica para hispanohablantes en {city.name}: trabajo, vivienda, trámites y más.
          </p>
        </div>
      </section>

      {/* Secciones */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(40px, 6vw, 64px) 24px 80px' }}>
        {sections.map((s) => (
          <div key={s.id} style={{ marginBottom: 40 }}>
            <h2 style={{ color: 'var(--text)', fontSize: '1.05rem', fontWeight: 800, marginBottom: 14, borderLeft: '3px solid #f97316', paddingLeft: 14 }}>
              {s.title}
            </h2>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', color: 'var(--text-dim)', fontSize: '0.875rem', lineHeight: 1.7 }}>
              <p style={{ margin: 0, fontStyle: 'italic' }}>Contenido próximamente.</p>
              {s.cta && (
                <Link
                  href={s.cta.href}
                  style={{ display: 'inline-block', marginTop: 16, color: '#f97316', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}
                >
                  {s.cta.label} →
                </Link>
              )}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link href={`/${locale}/guias`} style={{ color: '#2dd4bf', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            ← Ver todas las guías
          </Link>
        </div>
      </div>
    </main>
  )
}
