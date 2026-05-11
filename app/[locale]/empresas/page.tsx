import type { Metadata } from 'next'
import EmpresasForm from './EmpresasForm'

const BASE = 'https://holandafacil.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Para empresas',
    description: 'Llega a la comunidad hispanohablante en Países Bajos. Espacio publicitario en la plataforma de referencia en español.',
    alternates: {
      canonical: `${BASE}/${locale}/empresas`,
    },
    openGraph: {
      title: 'Para empresas',
      description: 'Llega a más de 100.000 hispanohablantes en Países Bajos.',
      url: `${BASE}/${locale}/empresas`,
    },
  }
}

const MARKET_STATS = [
  { value: '+100.000', label: 'hispanohablantes en Países Bajos' },
  { value: 'Miles', label: 'de visitas mensuales a guías en español sobre vivir y trabajar en NL' },
  { value: 'Activa', label: 'y en crecimiento — sin competidor directo en español' },
]

const OPTIONS = [
  {
    label: 'A',
    title: 'Publicidad en el directorio',
    price: '€149/mes',
    items: [
      'Logo y descripción de tu empresa visible',
      'Enlace directo a tu web',
      'Posición destacada en el listado',
      'Estadísticas: impresiones y clicks',
    ],
  },
  {
    label: 'B',
    title: 'Mención en guías',
    price: '€299/mes por guía',
    items: [
      'Mención contextual en guías con tráfico activo',
      'Enlace directo a tu web',
      'Activación según tráfico verificable',
    ],
  },
]

export default async function EmpresasPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await params

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Hero */}
      <section style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: 'clamp(48px, 8vw, 80px) 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{ color: '#f97316', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
            Para empresas
          </p>
          <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.8rem)', fontWeight: 900, color: 'var(--text)', lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.02em' }}>
            ¿Quieres llegar a los hispanohablantes en Países Bajos?
          </h1>
          <p style={{ color: 'var(--text-subtle)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 560 }}>
            El directorio de ETTs y guías más usado por hispanohablantes en NL. Publicidad contextual, audiencia activa, sin competidor directo en español.
          </p>
        </div>
      </section>

      {/* Contexto de mercado */}
      <section style={{ padding: 'clamp(48px, 6vw, 64px) 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ color: '#2dd4bf', fontSize: '1.1rem', fontWeight: 800, marginBottom: 24, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            El mercado
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {MARKET_STATS.map((s, i) => (
              <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
                <p style={{ color: '#f97316', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, margin: '0 0 8px', lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ color: 'var(--text-subtle)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Opciones disponibles */}
      <section style={{ padding: '0 24px clamp(48px, 6vw, 64px)', background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', paddingTop: 'clamp(40px, 5vw, 56px)' }}>
          <h2 style={{ color: '#2dd4bf', fontSize: '1.1rem', fontWeight: 800, marginBottom: 24, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Opciones disponibles
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {OPTIONS.map((opt) => (
              <div key={opt.label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 24px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#f97316', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, display: 'block' }}>
                  Opción {opt.label}
                </span>
                <h3 style={{ color: 'var(--text)', fontSize: '1rem', fontWeight: 800, margin: '0 0 4px' }}>
                  {opt.title}
                </h3>
                <p style={{ color: '#2dd4bf', fontWeight: 700, fontSize: '0.9rem', margin: '0 0 20px' }}>
                  {opt.price}
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  {opt.items.map((item, j) => (
                    <li key={j} style={{ color: 'var(--text-subtle)', fontSize: '0.82rem', lineHeight: 1.5, display: 'flex', gap: 8 }}>
                      <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario */}
      <section style={{ padding: 'clamp(48px, 6vw, 72px) 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ color: 'var(--text)', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 900, marginBottom: 8 }}>
            Solicitar información sin compromiso
          </h2>
          <p style={{ color: 'var(--text-subtle)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 32 }}>
            Cuéntanos qué opción te interesa y nos ponemos en contacto en 24–48 horas.
          </p>
          <EmpresasForm />
          <p style={{ color: 'var(--text-dim)', fontSize: '0.72rem', marginTop: 16 }}>
            O escríbenos directamente a{' '}
            <a href="mailto:hola@holandafacil.com" style={{ color: '#f97316' }}>hola@holandafacil.com</a>
          </p>
        </div>
      </section>
    </main>
  )
}
