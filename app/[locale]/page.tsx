import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { guides } from '@/content/guias'

const BASE = 'https://holandafacil.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'landing' })
  return {
    title: t('hero_title'),
    description: t('hero_subtitle'),
    alternates: {
      canonical: `${BASE}/${locale}`,
      languages: { es: `${BASE}/es`, en: `${BASE}/en`, pl: `${BASE}/pl` },
    },
    openGraph: {
      title: `${t('hero_title')} — HolandaFácil`,
      description: t('hero_subtitle'),
      url: `${BASE}/${locale}`,
      type: 'website',
    },
  }
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('landing')
  const supabase = await createClient()

  const [
    { data: latestAds },
    { count: reviewCount },
  ] = await Promise.all([
    supabase
      .from('classifieds')
      .select('id, category_slug, title, city, created_at')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true }),
  ])

  const CAT_ICONS: Record<string, string> = {
    viajes: '🚗', paquetes: '📦', compraventa: '💰', pisos: '🏠', servicios: '🤝',
  }
  const CAT_LABELS: Record<string, string> = {
    viajes: locale === 'en' ? 'Travel' : locale === 'pl' ? 'Podróże' : 'Viajes',
    paquetes: locale === 'en' ? 'Parcels' : locale === 'pl' ? 'Paczki' : 'Paquetes',
    compraventa: locale === 'en' ? 'Buy & Sell' : locale === 'pl' ? 'Kupno/sprzedaż' : 'Compraventa',
    pisos: locale === 'en' ? 'Housing' : locale === 'pl' ? 'Mieszkania' : 'Pisos',
    servicios: locale === 'en' ? 'Services' : locale === 'pl' ? 'Usługi' : 'Servicios',
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${BASE}/#website`,
        url: BASE,
        name: 'HolandaFácil',
        description: 'Guías prácticas, directorio de ETTs con reviews reales y comunidad para hispanos en los Países Bajos.',
        inLanguage: ['es', 'en', 'pl'],
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/es/ett?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${BASE}/#organization`,
        name: 'HolandaFácil',
        url: BASE,
        email: 'holandafacil.info@gmail.com',
        description: 'Plataforma para hispanos que viven o quieren vivir en los Países Bajos.',
        logo: { '@type': 'ImageObject', url: `${BASE}/logo.png` },
        sameAs: [],
      },
    ],
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <section style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: 'clamp(48px, 10vw, 100px) 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#f97316', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
            {t('badge')}
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 900, color: 'var(--text)', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' }}>
            {t('hero_title')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 12px' }}>
            {t('hero_subtitle')}
          </p>
<div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Link
                href={`/${locale}/registro`}
                style={{ background: '#f97316', color: '#0a0a0f', fontWeight: 800, padding: '14px 32px', borderRadius: 12, textDecoration: 'none', fontSize: '0.95rem' }}
              >
                {t('cta_registro')} →
              </Link>
            </div>
            <Link
              href={`/${locale}/guias`}
              style={{ border: '1px solid #2dd4bf', color: '#2dd4bf', fontWeight: 700, padding: '14px 32px', borderRadius: 12, textDecoration: 'none', fontSize: '0.95rem' }}
            >
              {t('cta_guias')}
            </Link>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '18px 24px', display: 'flex', justifyContent: 'center', gap: 'clamp(20px, 6vw, 56px)', flexWrap: 'wrap' }}>
          {(reviewCount ?? 0) > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#2dd4bf', fontWeight: 900, fontSize: '1.1rem' }}>{reviewCount}</span>
              <span style={{ color: 'var(--text-subtle)', fontSize: '0.78rem' }}>valoraciones de ETTs</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#2dd4bf', fontWeight: 900, fontSize: '1.1rem' }}>{guides.length}</span>
            <span style={{ color: 'var(--text-subtle)', fontSize: '0.78rem' }}>guías prácticas</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#22c55e', fontWeight: 900, fontSize: '1rem' }}>✓</span>
            <span style={{ color: 'var(--text-subtle)', fontSize: '0.78rem' }}>En español · Para hispanos en NL</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px 28px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>⭐</div>
            <h2 style={{ color: '#2dd4bf', fontSize: '1.15rem', fontWeight: 800, marginBottom: 12 }}>{t('section_ett_title')}</h2>
            <p style={{ color: 'var(--text-subtle)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 20 }}>{t('section_ett_desc')}</p>
            <Link href={`/${locale}/ett`} style={{ color: '#f97316', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none' }}>
              {t('cta_ett')} →
            </Link>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px 28px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📖</div>
            <h2 style={{ color: '#2dd4bf', fontSize: '1.15rem', fontWeight: 800, marginBottom: 12 }}>{t('section_guias_title')}</h2>
            <p style={{ color: 'var(--text-subtle)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 20 }}>{t('section_guias_desc')}</p>
            <Link href={`/${locale}/guias`} style={{ color: '#f97316', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none' }}>
              {t('cta_guias')} →
            </Link>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px 28px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🤝</div>
            <h2 style={{ color: '#2dd4bf', fontSize: '1.15rem', fontWeight: 800, marginBottom: 8 }}>{t('comunidad_capture_title')}</h2>
            <p style={{ color: 'var(--text-subtle)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 20 }}>{t('comunidad_capture_subtitle')}</p>
            <Link
              href={`/${locale}/registro`}
              style={{ color: '#f97316', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none' }}
            >
              {t('cta_registro')} →
            </Link>
          </div>
        </div>
      </section>

      {/* Últimos anuncios del tablón */}
      {latestAds && latestAds.length > 0 && (
        <section style={{ padding: '0 24px 60px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ color: 'var(--text)', fontSize: '1rem', fontWeight: 700 }}>
                Últimos anuncios de la comunidad
              </h2>
              <Link href={`/${locale}/tablon`} style={{ color: '#f97316', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>
                Ver todos →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              {latestAds.map((ad) => (
                <Link
                  key={ad.id}
                  href={`/${locale}/tablon/${ad.id}`}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', textDecoration: 'none', display: 'block' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '1.1rem' }}>{CAT_ICONS[ad.category_slug] ?? '📋'}</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2dd4bf', background: '#0f2a2a', padding: '2px 7px', borderRadius: 99 }}>
                      {CAT_LABELS[ad.category_slug] ?? ad.category_slug}
                    </span>
                    {ad.city && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>📍 {ad.city}</span>}
                  </div>
                  <p style={{ color: 'var(--text)', fontSize: '0.88rem', fontWeight: 600, margin: 0, lineHeight: 1.3 }}>
                    {ad.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empieza aquí */}
      <section style={{ padding: '0 24px 32px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ color: '#f97316', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Empieza aquí
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 14 }}>
            Las primeras gestiones si acabas de llegar
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { slug: 'bsn', icon: '🪪', title: 'BSN: tu número de identificación en Países Bajos' },
              { slug: 'inschrijving', icon: '🏛️', title: 'Registro municipal (Inschrijving gemeente)' },
              { slug: 'vivienda', icon: '🏠', title: 'Encontrar vivienda en Países Bajos' },
              { slug: 'bancos', icon: '🏦', title: 'Abrir una cuenta bancaria en Países Bajos' },
            ].map((g) => (
              <Link
                key={g.slug}
                href={`/${locale}/guias/${g.slug}`}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{g.icon}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.4 }}>{g.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Guides preview */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ color: '#2dd4bf', fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
            {t('guides_now')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {guides.map((g) => (
              <Link
                key={g.slug}
                href={`/${locale}/guias/${g.slug}`}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{g.icon}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.4 }}>{g.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA registro */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: 'clamp(48px, 8vw, 72px) 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 900, color: 'var(--text)', marginBottom: 12 }}>
            {t('cta_free_title')}
          </h2>
          <p style={{ color: 'var(--text-subtle)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 28 }}>
            {t('cta_free_desc')}
          </p>
          <Link
            href={`/${locale}/registro`}
            style={{ background: '#f97316', color: '#0a0a0f', fontWeight: 800, padding: '16px 40px', borderRadius: 12, textDecoration: 'none', fontSize: '1rem', display: 'inline-block' }}
          >
            {t('cta_registro')} →
          </Link>
        </div>
      </section>

      {/* Empresas */}
      <section style={{ padding: 'clamp(0px, 2vw, 24px) 24px clamp(48px, 8vw, 72px)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 'clamp(32px, 5vw, 48px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <p style={{ color: '#f97316', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                Para empresas
              </p>
              <h3 style={{ color: 'var(--text)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>¿Representas a una empresa?</h3>
              <p style={{ color: 'var(--text-subtle)', fontSize: '0.875rem', lineHeight: 1.6 }}>Llega a los trabajadores hispanohablantes en Países Bajos.</p>
            </div>
            <Link
              href={`/${locale}/empresas`}
              style={{ background: 'none', border: '1px solid #f97316', color: '#f97316', fontWeight: 700, padding: '12px 28px', borderRadius: 12, textDecoration: 'none', fontSize: '0.9rem', flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              Solicitar información →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--border-subtle)', fontSize: '0.8rem' }}>
          © 2026 HolandaFácil — Hecho con 🧡 para la comunidad hispana en Países Bajos
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
          <Link href={`/${locale}/guias`} style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'none' }}>Guías</Link>
          <Link href={`/${locale}/ett`} style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'none' }}>ETTs</Link>
          <Link href={`/${locale}/empresas`} style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'none' }}>Para empresas</Link>
          <Link href={`/${locale}/contacto`} style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'none' }}>Contacto</Link>
          <a href="mailto:holandafacil.info@gmail.com" style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'none' }}>Política de privacidad</a>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8, flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-faint)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ciudades</span>
          <Link href={`/${locale}/ciudades/amsterdam`} style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'none' }}>Ámsterdam</Link>
          <Link href={`/${locale}/ciudades/rotterdam`} style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'none' }}>Róterdam</Link>
          <Link href={`/${locale}/ciudades/eindhoven`} style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'none' }}>Eindhoven</Link>
          <Link href={`/${locale}/ciudades/den-haag`} style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'none' }}>La Haya</Link>
        </div>
        <p style={{ color: 'var(--text-faint)', fontSize: '0.7rem', marginTop: 10 }}>
          Cumplimiento RGPD · Tus datos nunca se venden ni comparten con terceros.
        </p>
      </footer>
    </main>
  )
}
