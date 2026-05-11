'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

const CATEGORIES = ['viajes', 'paquetes', 'compraventa', 'pisos', 'servicios'] as const
type CatTKey = 'cat_viajes' | 'cat_paquetes' | 'cat_compraventa' | 'cat_pisos' | 'cat_servicios'

const TRAVEL_CATEGORIES = new Set(['viajes', 'paquetes'])

export default function NuevoAnuncioClient({ locale }: { locale: string }) {
  const t = useTranslations('tablon')

  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [contact, setContact] = useState('')
  const [direction, setDirection] = useState('')
  const [dateAvailable, setDateAvailable] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const showDirection = TRAVEL_CATEGORIES.has(category)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!category || !title.trim() || !contact.trim()) {
      setError(t('form_required'))
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/classifieds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_slug: category,
          title: title.trim(),
          description: description.trim() || null,
          city: city.trim() || null,
          contact: contact.trim(),
          direction: (showDirection && direction) ? direction : null,
          date_available: dateAvailable || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'error')
      }
      setSubmitted(true)
    } catch {
      setError(t('form_error'))
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 8,
    padding: '10px 14px',
    color: 'var(--text)',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    fontWeight: 600,
    display: 'block',
    marginBottom: 6,
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 60px' }}>
        <Link href={`/${locale}/tablon`} style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>
          {t('back')}
        </Link>

        {submitted ? (
          <div style={{ background: '#0d2d1a', border: '1px solid #22c55e30', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: 12 }}>✓</p>
            <p style={{ color: '#22c55e', fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>
              {t('form_success')}
            </p>
            <Link
              href={`/${locale}/tablon`}
              style={{ display: 'inline-block', background: '#f97316', color: '#0a0a0f', borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', marginTop: 8 }}
            >
              {t('back')}
            </Link>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '32px 24px' }}>
            <h1 style={{ color: '#2dd4bf', fontSize: '1.25rem', fontWeight: 800, marginBottom: 28, marginTop: 0 }}>
              {t('form_title')}
            </h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={labelStyle}>{t('form_category')} *</label>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setDirection('') }}
                  style={{ ...inputStyle, color: category ? 'var(--text)' : 'var(--text-subtle)' }}
                >
                  <option value="">—</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{t(`cat_${c}` as CatTKey)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>{t('form_ad_title')} *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 150))} placeholder={t('form_ad_title_placeholder')} style={inputStyle} />
                <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', marginTop: 4, textAlign: 'right' }}>{title.length}/150</p>
              </div>

              <div>
                <label style={labelStyle}>{t('form_description')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 800))}
                  placeholder={t('form_description_placeholder')}
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.55 }}
                />
                <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', marginTop: 4, textAlign: 'right' }}>{description.length}/800</p>
              </div>

              <div className="form-grid-2col">
                <div>
                  <label style={labelStyle}>{t('form_city')}</label>
                  <input value={city} onChange={(e) => setCity(e.target.value.slice(0, 80))} placeholder={t('form_city_placeholder')} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('form_contact')} *</label>
                  <input value={contact} onChange={(e) => setContact(e.target.value.slice(0, 200))} placeholder={t('form_contact_placeholder')} style={inputStyle} />
                </div>
              </div>

              {showDirection && (
                <div className="form-grid-2col">
                  <div>
                    <label style={labelStyle}>{t('form_direction')}</label>
                    <select value={direction} onChange={(e) => setDirection(e.target.value)} style={{ ...inputStyle, color: direction ? 'var(--text)' : 'var(--text-subtle)' }}>
                      <option value="">{t('form_direction_none')}</option>
                      <option value="es_to_nl">{t('filter_es_to_nl')}</option>
                      <option value="nl_to_es">{t('filter_nl_to_es')}</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>{t('form_date')}</label>
                    <input type="date" value={dateAvailable} onChange={(e) => setDateAvailable(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
                  </div>
                </div>
              )}

              {error && <p style={{ color: '#ef4444', fontSize: '0.82rem', margin: 0 }}>{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: submitting ? 'var(--border-subtle)' : '#f97316',
                  color: submitting ? 'var(--text-subtle)' : '#0a0a0f',
                  border: 'none',
                  borderRadius: 10,
                  padding: '13px 24px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? t('form_submitting') : t('form_submit')}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', margin: 0 }}>⏱ {t('expires_note')}</p>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', margin: 0 }}>👁 {t('public_note')}</p>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
