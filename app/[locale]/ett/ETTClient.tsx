'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

type Agency = {
  id: string
  name: string
  city: string | null
  avg_rating: number
  total_reviews: number
  kvk: string | null
  certifications: string[]
}

type Review = {
  id: string
  agency_id: string
  rating: number
  flags: string[]
  comment: string | null
  nationality: string | null
  sector: string | null
  created_at: string
}

const FLAG_KEYS = ['whatsapp', 'salary_diff', 'housing', 'overtime', 'fake_contract'] as const
const SECTORS = ['logistics', 'food', 'cleaning', 'construction', 'other'] as const
const NATIONALITIES = ['ES', 'MX', 'CO', 'VE', 'AR', 'PE', 'EC', 'CU', 'DO', 'CL', 'GT', 'BO', 'HN', 'SV', 'NI', 'PY', 'UY', 'CR', 'PA', 'PL', 'other'] as const

type FlagTKey = 'flag_whatsapp' | 'flag_salary_diff' | 'flag_housing' | 'flag_overtime' | 'flag_fake_contract'
type ReviewsTKey = 'form_flags' | 'form_flags_hint' | 'form_sector_detail' | 'form_sector_detail_placeholder' | 'form_improvement' | 'form_improvement_placeholder' | 'form_duration_less_6m' | 'form_duration_6m_2y' | 'form_duration_more_2y'
type SectorTKey = 'sector_logistics' | 'sector_food' | 'sector_cleaning' | 'sector_construction' | 'sector_other'
type NatTKey = 'nat_ES' | 'nat_MX' | 'nat_CO' | 'nat_VE' | 'nat_AR' | 'nat_PE' | 'nat_EC' | 'nat_CU' | 'nat_DO' | 'nat_CL' | 'nat_GT' | 'nat_BO' | 'nat_HN' | 'nat_SV' | 'nat_NI' | 'nat_PY' | 'nat_UY' | 'nat_CR' | 'nat_PA' | 'nat_PL' | 'nat_other'

const CERT_CONFIG: Record<string, { label: string; color: string; bg: string; title: string }> = {
  SNA: { label: 'SNA', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', title: 'Certificado SNAkeurmerk — normeringarbeid.nl' },
  ABU: { label: 'ABU', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', title: 'Miembro ABU (Algemene Bond Uitzendondernemingen)' },
  NBBU: { label: 'NBBU', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', title: 'Miembro NBBU (Nederlandse Bond van Bemiddelings- en Uitzendondernemingen)' },
}

function CertBadges({ certifications, size = 'sm' }: { certifications: string[]; size?: 'sm' | 'md' }) {
  if (!certifications?.length) return null
  const fontSize = size === 'md' ? '0.68rem' : '0.58rem'
  const padding = size === 'md' ? '3px 9px' : '2px 7px'
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {certifications.map((cert) => {
        const cfg = CERT_CONFIG[cert]
        if (!cfg) return null
        return (
          <span
            key={cert}
            title={cfg.title}
            style={{
              fontSize,
              fontWeight: 700,
              padding,
              borderRadius: 99,
              background: cfg.bg,
              color: cfg.color,
              border: `1px solid ${cfg.color}30`,
              letterSpacing: '0.02em',
            }}
          >
            ✓ {cfg.label}
          </span>
        )
      })}
    </div>
  )
}

function Stars({ value }: { value: number }) {
  const filled = Math.round(value)
  return (
    <span>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= filled ? '#f97316' : 'var(--border-subtle)', fontSize: '0.95rem' }}>★</span>
      ))}
    </span>
  )
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          style={{ fontSize: '2rem', color: n <= (hover || value) ? '#f97316' : 'var(--border-subtle)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function ratingColor(r: number) {
  if (r < 2) return '#ef4444'
  if (r < 3.5) return '#f97316'
  return '#22c55e'
}

function topFlags(reviews: Review[]): string[] {
  const count: Record<string, number> = {}
  for (const r of reviews) {
    for (const f of (r.flags ?? [])) count[f] = (count[f] ?? 0) + 1
  }
  return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f]) => f)
}

export default function ETTClient({
  locale,
  agencies,
  reviews,
  weeklyReviews,
  incidentCount,
  isLoggedIn,
  initialCity = '',
}: {
  locale: string
  agencies: Agency[]
  reviews: Review[]
  weeklyReviews: number
  incidentCount: number
  isLoggedIn: boolean
  initialCity?: string
}) {
  const t = useTranslations('reviews')
  const formRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [cityInput, setCityInput] = useState(initialCity)
  const [filterCity, setFilterCity] = useState(initialCity)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [ettSearch, setEttSearch] = useState('')
  const [ettSelected, setEttSelected] = useState('')
  const [ettDropdownOpen, setEttDropdownOpen] = useState(false)
  const [isNewEtt, setIsNewEtt] = useState(false)
  const [rating, setRating] = useState(0)
  const [selectedFlags, setSelectedFlags] = useState<string[]>([])
  const [sector, setSector] = useState('')
  const [sectorDetail, setSectorDetail] = useState('')
  const [nationality, setNationality] = useState('')
  const [comment, setComment] = useState('')
  const [wouldWorkAgain, setWouldWorkAgain] = useState('')
  const [duration, setDuration] = useState('')
  const [improvement, setImprovement] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const reviewsByAgency = new Map<string, Review[]>()
  for (const r of reviews) {
    const arr = reviewsByAgency.get(r.agency_id) ?? []
    arr.push(r)
    reviewsByAgency.set(r.agency_id, arr)
  }

  const cities = Array.from(new Set(agencies.map((a) => a.city).filter(Boolean))).sort() as string[]

  // Top 6: agencies already sorted by total_reviews desc from the server
  const top6 = agencies.slice(0, 6)

  // City search suggestions (while typing)
  const suggestions = cityInput.length >= 1
    ? cities.filter(c => c.toLowerCase().includes(cityInput.toLowerCase())).slice(0, 8)
    : []

  // Results when a city is confirmed
  const cityResults = filterCity
    ? agencies.filter(a => a.city?.toLowerCase() === filterCity.toLowerCase())
    : []

  function selectCity(city: string) {
    setFilterCity(city)
    setCityInput(city)
    setShowSuggestions(false)
  }

  function clearCity() {
    setFilterCity('')
    setCityInput('')
    setShowSuggestions(false)
  }

  function toggleFlag(f: string) {
    setSelectedFlags((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f])
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const ettMatches = ettSearch.trim().length >= 1
    ? agencies.filter(a => a.name.toLowerCase().includes(ettSearch.toLowerCase().trim())).slice(0, 10)
    : []
  const showAddOption = ettSearch.trim().length >= 2 &&
    !agencies.some(a => a.name.toLowerCase() === ettSearch.toLowerCase().trim())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')
    const resolvedAgencyName = ettSelected.trim()
    if (!resolvedAgencyName || !rating) {
      setSubmitError(t('form_required'))
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agency_name: resolvedAgencyName,
          rating,
          flags: selectedFlags,
          comment: comment || null,
          nationality: nationality || null,
          sector: sector || null,
          sector_detail: sector === 'other' && sectorDetail.trim() ? sectorDetail.trim() : null,
          would_work_again: wouldWorkAgain || null,
          duration: duration || null,
          improvement: improvement.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Error ${res.status}`)
      }
      setSubmitted(true)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : t('form_error'))
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

          {/* Counters */}
          {(weeklyReviews > 0 || incidentCount > 0) && (
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
              {weeklyReviews > 0 && (
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px' }}>
                  <span style={{ color: '#2dd4bf', fontWeight: 800, fontSize: '1.1rem' }}>{weeklyReviews}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 6 }}>valoraciones esta semana</span>
                </div>
              )}
              {incidentCount > 0 && (
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px' }}>
                  <span style={{ color: '#f97316', fontWeight: 800, fontSize: '1.1rem' }}>{incidentCount}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 6 }}>incidencias detectadas</span>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={scrollToForm}
              style={{ background: '#f97316', color: '#0a0a0f', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              + {t('add_review')}
            </button>
          </div>
        </div>
      </div>

      <div className="layout-with-sidebar" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 60px' }}>
        {/* Main content */}
        <div style={{ minWidth: 0 }}>

          {/* Leyenda de certificaciones */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', marginBottom: 24 }}>
            {([
              { cert: 'SNA', label: 'Certificado de calidad laboral (normeringarbeid.nl)' },
              { cert: 'ABU', label: 'Miembro Algemene Bond Uitzendondernemingen' },
              { cert: 'NBBU', label: 'Miembro Nederlandse Bond van Uitzendondernemingen' },
            ] as const).map(({ cert, label }) => {
              const cfg = CERT_CONFIG[cert]
              return (
                <span key={cert} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                  <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                    ✓ {cfg.label}
                  </span>
                  {label}
                </span>
              )
            })}
          </div>

          {/* Top 6 más valoradas */}
          <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            Más valoradas
          </p>
          <div className="ett-grid" style={{ marginBottom: 32 }}>
            {top6.map((agency) => {
                const agencyReviews = reviewsByAgency.get(agency.id) ?? []
                const flags = topFlags(agencyReviews)
                const isExpanded = expanded === agency.id

                return (
                  <div key={agency.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 18px', flex: 1 }}>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link
                            href={`/${locale}/ett/${agency.id}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', margin: 0, wordBreak: 'break-word', lineHeight: 1.3 }}>
                              {agency.name}
                            </h2>
                          </Link>
                          {agency.city && (
                            <p style={{ color: 'var(--text-subtle)', fontSize: '0.68rem', marginTop: 2 }}>{agency.city}</p>
                          )}
                          {(agency.certifications ?? []).length > 0 && (
                            <div style={{ marginTop: 6 }}>
                              <CertBadges certifications={agency.certifications} />
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ color: ratingColor(agency.avg_rating), fontSize: '1.25rem', fontWeight: 800, lineHeight: 1 }}>
                            {agency.total_reviews >= 3 ? agency.avg_rating.toFixed(1) : '—'}
                          </div>
                          {agency.total_reviews >= 3 && <Stars value={agency.avg_rating} />}
                          {agency.total_reviews >= 1 && (
                            <div style={{ color: 'var(--text-subtle)', fontSize: '0.62rem', marginTop: 2 }}>
                              {t('reviews_count', { n: agency.total_reviews })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Flags */}
                      {flags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                          {flags.map((f) => (
                            <span key={f} style={{ background: 'var(--bg)', color: 'var(--text-dim)', fontSize: '0.58rem', fontWeight: 500, padding: '2px 7px', borderRadius: 99, border: '1px solid var(--border)' }}>
                              {t(`flag_${f}` as FlagTKey)}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        {agencyReviews.length > 0 && (
                          <button
                            onClick={() => setExpanded(isExpanded ? null : agency.id)}
                            style={{ background: 'none', border: '1px solid var(--border-subtle)', color: '#2dd4bf', borderRadius: 7, padding: '5px 12px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            {isExpanded ? t('hide_reviews') : t('show_reviews', { n: agencyReviews.length })}
                            <span style={{ transition: 'transform 0.25s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', fontSize: '0.6rem' }}>▾</span>
                          </button>
                        )}
                        <Link
                          href={`/${locale}/ett/${agency.id}`}
                          style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textDecoration: 'none', marginLeft: 'auto' }}
                        >
                          Ver perfil →
                        </Link>
                      </div>
                    </div>

                    {/* Expandable reviews */}
                    <div className={`ett-reviews-panel${isExpanded ? ' open' : ''}`} style={{ borderTop: isExpanded ? '1px solid var(--border)' : 'none' }}>
                      {agencyReviews.map((review, i) => (
                        <div key={review.id} style={{ padding: '12px 18px', borderBottom: i < agencyReviews.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                            <Stars value={review.rating} />
                            {review.nationality && (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', background: 'var(--bg)', padding: '2px 6px', borderRadius: 99 }}>
                                {t(`nat_${review.nationality}` as NatTKey)}
                              </span>
                            )}
                            {review.sector && (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', background: 'var(--bg)', padding: '2px 6px', borderRadius: 99 }}>
                                {t(`sector_${review.sector}` as SectorTKey)}
                              </span>
                            )}
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.6rem', marginLeft: 'auto' }}>
                              {new Date(review.created_at).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          {(review.flags ?? []).length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 5 }}>
                              {(review.flags ?? []).map((f) => (
                                <span key={f} style={{ fontSize: '0.58rem', color: 'var(--text-dim)', background: 'var(--bg)', padding: '2px 6px', borderRadius: 99, border: '1px solid var(--border)' }}>
                                  {t(`flag_${f}` as FlagTKey)}
                                </span>
                              ))}
                            </div>
                          )}
                          {review.comment && (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.55, margin: 0 }}>
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>

          {/* Buscador por ciudad */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Buscar ETT por ciudad
            </p>
            <div style={{ position: 'relative', maxWidth: 360 }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: 12, color: 'var(--text-subtle)', fontSize: '0.9rem', pointerEvents: 'none' }}>🔍</span>
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => { setCityInput(e.target.value); setShowSuggestions(true); if (!e.target.value) clearCity() }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Amsterdam, Rotterdam, Eindhoven…"
                  style={{ ...inputStyle, paddingLeft: 36, paddingRight: filterCity ? 36 : 14 }}
                />
                {filterCity && (
                  <button
                    onClick={clearCity}
                    style={{ position: 'absolute', right: 10, background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 2 }}
                  >
                    ×
                  </button>
                )}
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, marginTop: 4, zIndex: 50, overflow: 'hidden' }}>
                  {suggestions.map((city) => (
                    <button
                      key={city}
                      onMouseDown={() => selectCity(city)}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Resultados por ciudad */}
            {filterCity && (
              <div style={{ marginTop: 20 }}>
                <p style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', marginBottom: 14 }}>
                  <span style={{ color: 'var(--text)', fontWeight: 700 }}>{cityResults.length}</span> ETT{cityResults.length !== 1 ? 's' : ''} en <span style={{ color: '#2dd4bf', fontWeight: 700 }}>{filterCity}</span>
                </p>
                {cityResults.length === 0 ? (
                  <p style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>No hay ETTs registradas en esta ciudad.</p>
                ) : (
                  <div className="ett-grid">
                    {cityResults.map((agency) => {
                      const agencyReviews = reviewsByAgency.get(agency.id) ?? []
                      const flags = topFlags(agencyReviews)
                      const isExpanded = expanded === agency.id
                      return (
                        <div key={agency.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                          <div style={{ padding: '16px 18px', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <Link href={`/${locale}/ett/${agency.id}`} style={{ textDecoration: 'none' }}>
                                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', margin: 0, wordBreak: 'break-word', lineHeight: 1.3 }}>{agency.name}</h2>
                                </Link>
                                {agency.city && <p style={{ color: 'var(--text-subtle)', fontSize: '0.68rem', marginTop: 2 }}>{agency.city}</p>}
                                {(agency.certifications ?? []).length > 0 && <div style={{ marginTop: 6 }}><CertBadges certifications={agency.certifications} /></div>}
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ color: ratingColor(agency.avg_rating), fontSize: '1.25rem', fontWeight: 800, lineHeight: 1 }}>
                                  {agency.total_reviews >= 3 ? agency.avg_rating.toFixed(1) : '—'}
                                </div>
                                {agency.total_reviews >= 3 && <Stars value={agency.avg_rating} />}
                                {agency.total_reviews >= 1 && <div style={{ color: 'var(--text-subtle)', fontSize: '0.62rem', marginTop: 2 }}>{t('reviews_count', { n: agency.total_reviews })}</div>}
                              </div>
                            </div>
                            {flags.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                                {flags.map((f) => <span key={f} style={{ background: 'var(--bg)', color: 'var(--text-dim)', fontSize: '0.58rem', fontWeight: 500, padding: '2px 7px', borderRadius: 99, border: '1px solid var(--border)' }}>{t(`flag_${f}` as FlagTKey)}</span>)}
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                              {agencyReviews.length > 0 && (
                                <button onClick={() => setExpanded(isExpanded ? null : agency.id)} style={{ background: 'none', border: '1px solid var(--border-subtle)', color: '#2dd4bf', borderRadius: 7, padding: '5px 12px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  {isExpanded ? t('hide_reviews') : t('show_reviews', { n: agencyReviews.length })}
                                  <span style={{ transition: 'transform 0.25s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', fontSize: '0.6rem' }}>▾</span>
                                </button>
                              )}
                              <Link href={`/${locale}/ett/${agency.id}`} style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textDecoration: 'none', marginLeft: 'auto' }}>Ver perfil →</Link>
                            </div>
                          </div>
                          <div className={`ett-reviews-panel${isExpanded ? ' open' : ''}`} style={{ borderTop: isExpanded ? '1px solid var(--border)' : 'none' }}>
                            {agencyReviews.map((review, i) => (
                              <div key={review.id} style={{ padding: '12px 18px', borderBottom: i < agencyReviews.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                                  <Stars value={review.rating} />
                                  {review.nationality && <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', background: 'var(--bg)', padding: '2px 6px', borderRadius: 99 }}>{t(`nat_${review.nationality}` as NatTKey)}</span>}
                                  {review.sector && <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', background: 'var(--bg)', padding: '2px 6px', borderRadius: 99 }}>{t(`sector_${review.sector}` as SectorTKey)}</span>}
                                  <span style={{ color: 'var(--text-dim)', fontSize: '0.6rem', marginLeft: 'auto' }}>{new Date(review.created_at).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                                {(review.flags ?? []).length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 5 }}>
                                    {(review.flags ?? []).map((f) => <span key={f} style={{ fontSize: '0.58rem', color: 'var(--text-dim)', background: 'var(--bg)', padding: '2px 6px', borderRadius: 99, border: '1px solid var(--border)' }}>{t(`flag_${f}` as FlagTKey)}</span>)}
                                  </div>
                                )}
                                {review.comment && <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.55, margin: 0 }}>{review.comment}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* B2B block */}
          <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.9rem', margin: '0 0 4px' }}>{t('b2b_title')}</p>
              <p style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', margin: 0 }}>{t('b2b_desc')}</p>
            </div>
            <a
              href={`mailto:hola@holandafacil.com?subject=Reclamar perfil ETT`}
              style={{ color: '#f97316', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              {t('b2b_cta')}
            </a>
          </div>

          {/* Review form */}
          <div ref={formRef}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0f2a2a', border: '1px solid #2dd4bf30', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
              <span style={{ color: '#2dd4bf', fontSize: '1rem' }}>🔒</span>
              <span style={{ color: '#2dd4bf', fontSize: '0.8rem', fontWeight: 600 }}>{t('anon_banner')}</span>
            </div>
            {!isLoggedIn ? (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '32px 24px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>
                  {t('login_gate_title')}
                </p>
                <p style={{ color: 'var(--text-subtle)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 24 }}>
                  {t('login_gate_desc')}
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link
                    href={`/${locale}/login`}
                    style={{ background: '#f97316', color: '#0a0a0f', borderRadius: 10, padding: '11px 28px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}
                  >
                    {t('login_gate_cta')}
                  </Link>
                  <Link
                    href={`/${locale}/registro`}
                    style={{ background: 'none', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', borderRadius: 10, padding: '11px 28px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}
                  >
                    {t('register_gate_cta')}
                  </Link>
                </div>
              </div>
            ) : submitted ? (
              <div style={{ background: '#0d2d1a', border: '1px solid #22c55e30', borderRadius: 14, padding: '32px 24px', textAlign: 'center' }}>
                <p style={{ color: '#22c55e', fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                  ✓ {t('form_success')}
                </p>
              </div>
            ) : (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 20px' }}>
                <h2 style={{ color: '#2dd4bf', fontSize: '1.1rem', fontWeight: 700, marginBottom: 24, marginTop: 0 }}>
                  {t('form_title')}
                </h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={labelStyle}>{t('form_agency')} *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={ettSearch}
                        onChange={(e) => {
                          setEttSearch(e.target.value)
                          setEttSelected('')
                          setIsNewEtt(false)
                          setEttDropdownOpen(true)
                        }}
                        onFocus={() => setEttDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setEttDropdownOpen(false), 200)}
                        placeholder={t('form_agency_placeholder')}
                        style={{
                          ...inputStyle,
                          paddingRight: ettSelected ? 36 : 14,
                          borderColor: ettSelected
                            ? isNewEtt ? '#f9731680' : '#2dd4bf80'
                            : 'var(--border-subtle)',
                        }}
                      />
                      {ettSelected && (
                        <button
                          type="button"
                          onClick={() => { setEttSearch(''); setEttSelected(''); setIsNewEtt(false) }}
                          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: 4 }}
                        >
                          ×
                        </button>
                      )}
                      {ettDropdownOpen && ettSearch.trim().length >= 1 && (ettMatches.length > 0 || showAddOption) && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, marginTop: 4, zIndex: 100, overflow: 'hidden', maxHeight: 280, overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}>
                          {ettMatches.map((agency) => (
                            <button
                              key={agency.id}
                              type="button"
                              onMouseDown={() => {
                                setEttSearch(agency.name)
                                setEttSelected(agency.name)
                                setIsNewEtt(false)
                                setEttDropdownOpen(false)
                              }}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer', gap: 8 }}
                            >
                              <span>{agency.name}</span>
                              {agency.city && <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem', flexShrink: 0 }}>{agency.city}</span>}
                            </button>
                          ))}
                          {showAddOption && (
                            <button
                              type="button"
                              onMouseDown={() => {
                                const name = ettSearch.trim()
                                setEttSearch(name)
                                setEttSelected(name)
                                setIsNewEtt(true)
                                setEttDropdownOpen(false)
                              }}
                              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '10px 14px', background: 'rgba(249,115,22,0.06)', border: 'none', color: '#f97316', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              <span>+</span>
                              <span>Añadir &ldquo;{ettSearch.trim()}&rdquo;</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {ettSelected && isNewEtt && (
                      <p style={{ color: 'var(--text-subtle)', fontSize: '0.72rem', marginTop: 6 }}>
                        Esta ETT no está en el directorio. Se añadirá al enviar la review.
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={labelStyle}>{t('form_rating')} *</label>
                    <StarPicker value={rating} onChange={setRating} />
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <p style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 700, margin: '0 0 4px' }}>
                      ¿Detectaste alguna irregularidad?
                    </p>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', margin: '0 0 14px', lineHeight: 1.5 }}>
                      Si marcas una alerta, otros trabajadores la verán antes de firmar con esta ETT.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {FLAG_KEYS.map((f) => {
                        const isChecked = selectedFlags.includes(f)
                        return (
                          <label
                            key={f}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              cursor: 'pointer',
                              background: isChecked ? '#1a110800' : 'var(--bg)',
                              border: `1px solid ${isChecked ? '#f9731650' : 'var(--border)'}`,
                              borderRadius: 8,
                              padding: '10px 14px',
                              transition: 'border-color 0.15s ease, background 0.15s ease',
                            }}
                          >
                            <div style={{
                              width: 18,
                              height: 18,
                              borderRadius: 4,
                              border: `2px solid ${isChecked ? '#f97316' : 'var(--border-subtle)'}`,
                              background: isChecked ? '#f97316' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              transition: 'border-color 0.15s ease, background 0.15s ease',
                            }}>
                              {isChecked && <span style={{ color: '#0a0a0f', fontSize: '0.65rem', fontWeight: 800, lineHeight: 1 }}>✓</span>}
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleFlag(f)}
                              style={{ display: 'none' }}
                            />
                            <span style={{ color: isChecked ? 'var(--text)' : 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.4 }}>
                              {t(`flag_${f}` as FlagTKey)}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div className="form-grid-2col">
                    <div>
                      <label style={labelStyle}>{t('form_sector')}</label>
                      <select value={sector} onChange={(e) => { setSector(e.target.value); setSectorDetail('') }} style={{ ...inputStyle, color: sector ? 'var(--text)' : 'var(--text-subtle)' }}>
                        <option value="">—</option>
                        {SECTORS.map((s) => (
                          <option key={s} value={s}>{t(`sector_${s}` as SectorTKey)}</option>
                        ))}
                      </select>
                      {sector === 'other' && (
                        <input
                          type="text"
                          value={sectorDetail}
                          onChange={(e) => setSectorDetail(e.target.value.slice(0, 60))}
                          placeholder={t('form_sector_detail_placeholder' as ReviewsTKey)}
                          style={{ ...inputStyle, marginTop: 8 }}
                        />
                      )}
                    </div>
                    <div>
                      <label style={labelStyle}>{t('form_nationality')}</label>
                      <select value={nationality} onChange={(e) => setNationality(e.target.value)} style={{ ...inputStyle, color: nationality ? 'var(--text)' : 'var(--text-subtle)' }}>
                        <option value="">—</option>
                        {NATIONALITIES.map((n) => (
                          <option key={n} value={n}>{t(`nat_${n}` as NatTKey)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-grid-2col">
                    <div>
                      <label style={labelStyle}>{t('form_worked_with')}</label>
                      <select
                        value={wouldWorkAgain}
                        onChange={(e) => { setWouldWorkAgain(e.target.value); if (e.target.value !== 'maybe') setImprovement('') }}
                        style={{ ...inputStyle, color: wouldWorkAgain ? 'var(--text)' : 'var(--text-subtle)' }}
                      >
                        <option value="">—</option>
                        <option value="yes">{t('form_worked_with_yes')}</option>
                        <option value="no">{t('form_worked_with_no')}</option>
                        <option value="maybe">{t('form_worked_with_maybe')}</option>
                      </select>
                      {wouldWorkAgain === 'maybe' && (
                        <div style={{ marginTop: 10 }}>
                          <textarea
                            value={improvement}
                            onChange={(e) => setImprovement(e.target.value.slice(0, 300))}
                            placeholder={t('form_improvement_placeholder' as ReviewsTKey)}
                            rows={2}
                            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                          />
                          <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', marginTop: 4, textAlign: 'right' }}>
                            {improvement.length}/300
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={labelStyle}>{t('form_duration')}</label>
                      <select value={duration} onChange={(e) => setDuration(e.target.value)} style={{ ...inputStyle, color: duration ? 'var(--text)' : 'var(--text-subtle)' }}>
                        <option value="">—</option>
                        <option value="less_6m">{t('form_duration_less_6m' as ReviewsTKey)}</option>
                        <option value="6m_2y">{t('form_duration_6m_2y' as ReviewsTKey)}</option>
                        <option value="more_2y">{t('form_duration_more_2y' as ReviewsTKey)}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>{t('form_comment')}</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value.slice(0, 500))}
                      placeholder={t('form_comment_placeholder')}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                    />
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', marginTop: 4, textAlign: 'right' }}>
                      {comment.length}/500
                    </p>
                  </div>

                  {submitError && (
                    <p style={{ color: '#ef4444', fontSize: '0.82rem', margin: 0 }}>{submitError}</p>
                  )}

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

                  <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textAlign: 'center', margin: '-8px 0 0' }}>
                    No necesitas cuenta para publicar.
                  </p>

                  <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', textAlign: 'center', margin: 0 }}>
                    🔒 {t('anon_note')}
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#111118', border: '1px solid #1e2a3a', borderRadius: 12, padding: '20px 16px' }}>
            <p style={{ color: '#f97316', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Para empresas
            </p>
            <h3 style={{ color: 'var(--text)', fontSize: '0.95rem', fontWeight: 700, marginBottom: 8, marginTop: 0 }}>
              ¿Representas a una ETT?
            </h3>
            <p style={{ color: '#475569', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: 14 }}>
              Gestiona tu reputación entre los trabajadores hispanohablantes en Países Bajos.
            </p>
            <a
              href="mailto:hola@holandafacil.com"
              style={{ display: 'inline-block', background: 'none', border: '1px solid #f97316', color: '#f97316', borderRadius: 8, padding: '7px 16px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}
            >
              Solicitar información →
            </a>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 16px' }}>
            <p style={{ color: '#2dd4bf', fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>
              {t('sidebar_cta_title')}
            </p>
            <p style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', lineHeight: 1.6, marginBottom: 12 }}>
              {t('sidebar_cta_desc')}
            </p>
            <button
              onClick={scrollToForm}
              style={{ background: 'none', border: '1px solid #f97316', color: '#f97316', borderRadius: 8, padding: '8px 16px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', width: '100%' }}
            >
              + {t('add_review')}
            </button>
          </div>

          {reviews.length > 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 16px' }}>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                {t('stats_label')}
              </p>
              <p style={{ color: 'var(--text)', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>
                {agencies.length}
              </p>
              <p style={{ color: 'var(--text-subtle)', fontSize: '0.78rem' }}>{t('stats_agencies')}</p>
              <p style={{ color: 'var(--text)', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, marginTop: 12 }}>
                {reviews.length}
              </p>
              <p style={{ color: 'var(--text-subtle)', fontSize: '0.78rem' }}>{t('stats_reviews')}</p>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 16px' }}>
              <p style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>
                Directorio en construcción — sé de los primeros en dejar tu experiencia.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
