import type { Metadata } from 'next'
import ContactForm from '@/components/ContactForm'

const BASE = 'https://holandafacil.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Contacto — HolandaFácil',
    description: 'Escríbenos para sugerencias, incidencias o colaboraciones.',
    alternates: {
      canonical: `${BASE}/${locale}/contacto`,
    },
  }
}

export default async function ContactoPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await params

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <section style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: 'clamp(40px, 8vw, 72px) 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ color: '#f97316', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
            CONTACTO
          </p>
          <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 900, color: 'var(--text)', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.02em' }}>
            ¿Tienes algo que decirnos?
          </h1>
          <p style={{ color: 'var(--text-subtle)', fontSize: '1rem', lineHeight: 1.7 }}>
            Sugerencias, incidencias, colaboraciones o cualquier otra cosa. Te respondemos en 24–48 horas.
          </p>
        </div>
      </section>

      <section style={{ padding: 'clamp(40px, 6vw, 64px) 24px 80px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <ContactForm />
          <p style={{ color: 'var(--text-dim)', fontSize: '0.72rem', marginTop: 20 }}>
            O escríbenos directamente a{' '}
            <a href="mailto:holandafacil.info@gmail.com" style={{ color: '#f97316' }}>holandafacil.info@gmail.com</a>
          </p>
        </div>
      </section>
    </main>
  )
}
