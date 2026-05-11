'use client'
import { useState } from 'react'
import { useTranslations, useFormatter } from 'next-intl'
import Link from 'next/link'
import type { Classified } from './page'

const CATEGORIES = ['viajes', 'paquetes', 'compraventa', 'pisos', 'servicios'] as const
type CategorySlug = typeof CATEGORIES[number]
type CatTKey = 'cat_viajes' | 'cat_paquetes' | 'cat_compraventa' | 'cat_pisos' | 'cat_servicios'

const CATEGORY_ICONS: Record<CategorySlug, string> = {
  viajes: '🚗', paquetes: '📦', compraventa: '💰', pisos: '🏠', servicios: '🤝',
}

const DEMO_ADS = [
  { id: 'demo-1', title: 'Vuelvo a Valencia el 20 de mayo — sitio para 2 personas', category_slug: 'viajes', city: 'Rotterdam', direction: 'nl_to_es' },
  { id: 'demo-2', title: 'Vendo muebles de IKEA: mesa + 4 sillas, buen estado', category_slug: 'compraventa', city: 'Eindhoven', direction: null },
  { id: 'demo-3', title: 'Busco compañero/a de piso en Rotterdam, zona centro', category_slug: 'pisos', city: 'Rotterdam', direction: null },
  { id: 'demo-4', title: 'Envío paquetes España → NL cada 2 semanas', category_slug: 'paquetes', city: 'Amsterdam', direction: 'es_to_nl' },
]

export default function TablonClient({
  locale,
  classifieds,
  isLoggedIn,
}: {
  locale: string
  classifieds: Classified[]
  isLoggedIn: boolean
}) {
  const t = useTranslations('tablon')
  const format = useFormatter()
  const [filterCat, setFilterCat] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterDir, setFilterDir] = useState('')

  const cities = Array.from(new Set(classifieds.map((c) => c.city).filter(Boolean))) as string[]

  const filtered = classifieds.filter((c) => {
    if (filterCat && c.category_slug !== filterCat) return false
    if (filterCity && c.city !== filterCity) return false
    if (filterDir && c.direction !== filterDir) return false
    return true
  })

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-input)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 8,
    padding: '9px 14px',
    color: 'var(--text)',
    fontSize: '0.85rem',
    outline: 'none',
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'system-ui, sans-serif' }}>
      {/* Hero */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ color: '#f97316', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            HolandaFácil
          </p>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 800, color: '#2dd4bf', lineHeight: 1.15, marginBottom: 10 }}>
            {t('title')}
          </h1>
          <p style={{ color: 'var(--text-subtle)', fontSize: '0.85rem', marginBottom: 20 }}>
            {t('subtitle')}
          </p>
          <Link
            href={isLoggedIn ? `/${locale}/tablon/nuevo` : `/${locale}/login`}
            style={{ display: 'inline-block', background: '#f97316', color: '#0a0a0f', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}
          >
            + {t('post_btn')}
          </Link>
        </div>
      </div>

      <div className="layout-with-sidebar" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 60px' }}>
        {/* Main */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={inputStyle}>
              <option value="">{t('filter_all_cats')}</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_ICONS[c]} {t(`cat_${c}` as CatTKey)}</option>
              ))}
            </select>
            <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} style={inputStyle}>
              <option value="">{t('filter_all_cities')}</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterDir} onChange={(e) => setFilterDir(e.target.value)} style={inputStyle}>
              <option value="">{t('filter_direction_all')}</option>
              <option value="es_to_nl">{t('filter_es_to_nl')}</option>
              <option value="nl_to_es">{t('filter_nl_to_es')}</option>
            </select>
          </div>

          {filtered.length === 0 && classifieds.length === 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '32px 24px', textAlign: 'center', marginBottom: 20 }}>
                <p style={{ color: 'var(--text-subtle)', fontSize: '0.9rem', marginBottom: 16 }}>{t('no_ads')}</p>
                <Link
                  href={isLoggedIn ? `/${locale}/tablon/nuevo` : `/${locale}/login`}
                  style={{ display: 'inline-block', background: '#f97316', color: '#0a0a0f', borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}
                >
                  + {t('post_btn')}
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DEMO_ADS.map((ad) => (
                  <div key={ad.id} style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 12, padding: '16px 18px', opacity: 0.6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2dd4bf', background: '#0f2a2a', padding: '3px 8px', borderRadius: 99 }}>
                        {CATEGORY_ICONS[ad.category_slug as CategorySlug]} {t(`cat_${ad.category_slug}` as CatTKey)}
                      </span>
                      {ad.direction && (
                        <span style={{ fontSize: '0.6rem', color: '#f97316', background: '#1a1212', padding: '2px 7px', borderRadius: 99, border: '1px solid #f9731625' }}>
                          {ad.direction === 'es_to_nl' ? t('ad_direction_es_to_nl') : t('ad_direction_nl_to_es')}
                        </span>
                      )}
                      {ad.city && <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)' }}>📍 {ad.city}</span>}
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', background: 'var(--bg)', border: '1px solid var(--border-subtle)', padding: '2px 8px', borderRadius: 99, marginLeft: 'auto' }}>
                        {t('demo_label')}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{ad.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(filtered.length > 0 || classifieds.length > 0) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {filtered.map((ad, i) => (
                <div key={ad.id}>
                  <Link href={`/${locale}/tablon/${ad.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', marginBottom: 8, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2dd4bf', background: '#0f2a2a', padding: '3px 8px', borderRadius: 99 }}>
                              {CATEGORY_ICONS[ad.category_slug as CategorySlug]} {t(`cat_${ad.category_slug}` as CatTKey)}
                            </span>
                            {ad.direction && (
                              <span style={{ fontSize: '0.6rem', color: '#f97316', background: '#1a1212', padding: '2px 7px', borderRadius: 99, border: '1px solid #f9731625' }}>
                                {ad.direction === 'es_to_nl' ? t('ad_direction_es_to_nl') : t('ad_direction_nl_to_es')}
                              </span>
                            )}
                            {ad.city && (
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)' }}>📍 {ad.city}</span>
                            )}
                          </div>
                          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 6px', lineHeight: 1.3 }}>
                            {ad.title}
                          </h2>
                          {ad.description && (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {ad.description}
                            </p>
                          )}
                          {ad.date_available && (
                            <p style={{ color: 'var(--text-subtle)', fontSize: '0.72rem', marginTop: 6 }}>
                              {t('ad_date')}: {new Date(ad.date_available).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                        <div style={{ flexShrink: 0, textAlign: 'right' }}>
                          <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', margin: 0 }}>{format.relativeTime(new Date(ad.created_at))}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 16px' }}>
            <p style={{ color: '#2dd4bf', fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>
              {t('title')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCat(filterCat === c ? '' : c)}
                  style={{
                    background: filterCat === c ? '#0f2a2a' : 'none',
                    border: `1px solid ${filterCat === c ? '#2dd4bf' : 'var(--border-subtle)'}`,
                    color: filterCat === c ? '#2dd4bf' : 'var(--text-muted)',
                    borderRadius: 8,
                    padding: '7px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {CATEGORY_ICONS[c]} {t(`cat_${c}` as CatTKey)}
                </button>
              ))}
            </div>
            <Link
              href={isLoggedIn ? `/${locale}/tablon/nuevo` : `/${locale}/login`}
              style={{ display: 'block', textAlign: 'center', background: 'none', border: '1px solid #f97316', color: '#f97316', borderRadius: 8, padding: '8px 16px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}
            >
              + {t('post_btn')}
            </Link>
          </div>

          {classifieds.length >= 5 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 16px' }}>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Total
              </p>
              <p style={{ color: 'var(--text)', fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>
                {classifieds.length}
              </p>
              <p style={{ color: 'var(--text-subtle)', fontSize: '0.78rem' }}>
                {t('stats_active')}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
