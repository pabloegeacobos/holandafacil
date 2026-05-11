import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

const BASE = 'https://holandafacil.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params
  if (!UUID_RE.test(id)) return { title: 'Anuncio — HolandaFácil', robots: { index: false } }
  const supabase = await createClient()
  const { data: ad } = await supabase
    .from('classifieds')
    .select('title, description, category_slug')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle()

  if (!ad) return { title: 'Anuncio — HolandaFácil', robots: { index: false } }

  return {
    title: ad.title,
    description: ad.description ?? undefined,
    alternates: { canonical: `${BASE}/${locale}/tablon/${id}` },
    openGraph: {
      title: `${ad.title} — HolandaFácil`,
      description: ad.description ?? undefined,
      url: `${BASE}/${locale}/tablon/${id}`,
      type: 'article',
    },
    robots: { index: true, follow: false },
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const CATEGORY_ICONS: Record<string, string> = {
  viajes: '🚗',
  paquetes: '📦',
  compraventa: '💰',
  pisos: '🏠',
  servicios: '🤝',
}

export default async function AnuncioDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  if (!UUID_RE.test(id)) notFound()

  const supabase = await createClient()
  const t = await getTranslations('tablon')

  const { data: ad } = await supabase
    .from('classifieds')
    .select('id, category_slug, title, description, city, contact, direction, date_available, created_at, expires_at')
    .eq('id', id)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (!ad) notFound()

  const catKey = `cat_${ad.category_slug}` as Parameters<typeof t>[0]

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 60px' }}>
        <Link
          href={`/${locale}/tablon`}
          style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-block', marginBottom: 28 }}
        >
          {t('back')}
        </Link>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 24px' }}>
          {/* Category + badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2dd4bf', background: '#0f2a2a', padding: '4px 10px', borderRadius: 99 }}>
              {CATEGORY_ICONS[ad.category_slug]} {t(catKey)}
            </span>
            {ad.direction && (
              <span style={{ fontSize: '0.65rem', color: '#f97316', background: '#1a1212', padding: '3px 9px', borderRadius: 99, border: '1px solid #f9731625' }}>
                {ad.direction === 'es_to_nl' ? t('ad_direction_es_to_nl') : t('ad_direction_nl_to_es')}
              </span>
            )}
            {ad.city && (
              <span style={{ fontSize: '0.68rem', color: '#475569' }}>📍 {ad.city}</span>
            )}
          </div>

          <h1 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.3, marginBottom: 16, marginTop: 0 }}>
            {ad.title}
          </h1>

          {ad.description && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 20 }}>
              {ad.description}
            </p>
          )}

          {/* Metadata */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
            {ad.date_available && (
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', minWidth: 120 }}>{t('ad_date')}</span>
                <span style={{ color: 'var(--text)', fontSize: '0.78rem', fontWeight: 600 }}>
                  {new Date(ad.date_available).toLocaleDateString(locale, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', minWidth: 120 }}>{t('ad_published')}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                {new Date(ad.created_at).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', minWidth: 120 }}>{t('ad_expires')}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                {new Date(ad.expires_at).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Contact CTA */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 18px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 10, fontWeight: 600 }}>
              {t('ad_contact')}
            </p>
            <p style={{ color: '#2dd4bf', fontSize: '1.05rem', fontWeight: 700, wordBreak: 'break-all', margin: 0 }}>
              {ad.contact}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
