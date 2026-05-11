import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const BASE = 'https://holandafacil.com'

type Review = {
  id: string
  rating: number
  flags: string[]
  comment: string | null
  nationality: string | null
  sector: string | null
  sector_detail: string | null
  created_at: string
  would_work_again: string | null
  duration: string | null
  improvement_condition: string | null
}

type Agency = {
  id: string
  name: string
  city: string | null
  avg_rating: number
  total_reviews: number
  kvk: string | null
  certifications: string[]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params
  if (!UUID_RE.test(id)) return { title: 'ETT — HolandaFácil' }
  const supabase = await createClient()
  const { data } = await supabase.from('agencies').select('name, city').eq('id', id).maybeSingle()
  if (!data) return { title: 'ETT — HolandaFácil' }
  const title = `${data.name} — opiniones y reviews`
  const desc = `Reviews anónimas de trabajadores sobre ${data.name}${data.city ? ` en ${data.city}` : ''}. Descubre si es una ETT de confianza.`
  return {
    title,
    description: desc,
    alternates: { canonical: `${BASE}/${locale}/ett/${id}` },
    openGraph: { title: `${title} — HolandaFácil`, description: desc, url: `${BASE}/${locale}/ett/${id}`, type: 'article' },
  }
}

const CERT_CONFIG: Record<string, { label: string; color: string; bg: string; title: string }> = {
  SNA: { label: 'SNA', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', title: 'Certificado SNAkeurmerk — normeringarbeid.nl' },
  ABU: { label: 'ABU', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', title: 'Miembro ABU (Algemene Bond Uitzendondernemingen)' },
  NBBU: { label: 'NBBU', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', title: 'Miembro NBBU (Nederlandse Bond van Bemiddelings- en Uitzendondernemingen)' },
}

function CertBadges({ certifications }: { certifications: string[] }) {
  if (!certifications?.length) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
      {certifications.map((cert) => {
        const cfg = CERT_CONFIG[cert]
        if (!cfg) return null
        return (
          <span
            key={cert}
            title={cfg.title}
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '4px 11px',
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

function ratingColor(r: number) {
  if (r < 2) return '#ef4444'
  if (r < 3.5) return '#f97316'
  return '#22c55e'
}

function Stars({ value }: { value: number }) {
  const filled = Math.round(value)
  return (
    <span>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= filled ? '#f97316' : 'var(--border-subtle)', fontSize: '1.1rem' }}>★</span>
      ))}
    </span>
  )
}

const FLAG_LABELS: Record<string, string> = {
  whatsapp: 'Pagos por WhatsApp o efectivo',
  salary_diff: 'Diferencia salarial por nacionalidad',
  housing: 'Alojamiento abusivo (>25% del salario semanal)',
  overtime: 'Horas extra no pagadas',
  fake_contract: 'Contrato diferente al prometido',
}

const SECTOR_LABELS: Record<string, string> = {
  logistics: 'Logística / almacén',
  food: 'Alimentación',
  cleaning: 'Limpieza',
  construction: 'Construcción',
  other: 'Otro',
}

const NAT_LABELS: Record<string, string> = {
  ES: 'España', MX: 'México', CO: 'Colombia', VE: 'Venezuela', AR: 'Argentina',
  PE: 'Perú', EC: 'Ecuador', CU: 'Cuba', DO: 'Rep. Dominicana', CL: 'Chile',
  GT: 'Guatemala', BO: 'Bolivia', HN: 'Honduras', SV: 'El Salvador', NI: 'Nicaragua',
  PY: 'Paraguay', UY: 'Uruguay', CR: 'Costa Rica', PA: 'Panamá', PL: 'Polonia',
  other: 'Otra',
}

const DURATION_LABELS: Record<string, string> = {
  less_6m: 'Menos de 6 meses',
  '6m_2y': 'Entre 6 meses y 2 años',
  more_2y: 'Más de 2 años',
  // backward compat with old reviews
  less_1m: 'Menos de 1 mes',
  '1_3m': '1 a 3 meses',
  '3_6m': '3 a 6 meses',
  more_6m: 'Más de 6 meses',
}

function StatBar({ label, count, total, color = '#2dd4bf' }: { label: string; count: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600 }}>{count} <span style={{ fontWeight: 400 }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: 'var(--bg)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function ETTDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  if (!UUID_RE.test(id)) notFound()

  const supabase = await createClient()
  const t = await getTranslations('reviews')

  const [{ data: agencyData }, { data: reviewsData }] = await Promise.all([
    supabase.from('agencies').select('id, name, city, avg_rating, total_reviews, kvk, certifications').eq('id', id).maybeSingle(),
    supabase.from('reviews').select('id, rating, flags, comment, nationality, sector, sector_detail, created_at, would_work_again, duration, improvement_condition').eq('agency_id', id).order('created_at', { ascending: false }),
  ])

  if (!agencyData) notFound()

  const agency = agencyData as Agency
  const reviews = (reviewsData ?? []) as Review[]
  const n = reviews.length

  // --- Aggregations ---
  const flagCount: Record<string, number> = {}
  const sectorCount: Record<string, number> = {}
  const natCount: Record<string, number> = {}
  const wouldCount = { yes: 0, no: 0, maybe: 0 }
  const durationCount: Record<string, number> = {}
  const ratingDist = [0, 0, 0, 0, 0]

  for (const r of reviews) {
    for (const f of (r.flags ?? [])) flagCount[f] = (flagCount[f] ?? 0) + 1
    if (r.sector) sectorCount[r.sector] = (sectorCount[r.sector] ?? 0) + 1
    if (r.nationality) natCount[r.nationality] = (natCount[r.nationality] ?? 0) + 1
    if (r.would_work_again && r.would_work_again in wouldCount) wouldCount[r.would_work_again as keyof typeof wouldCount]++
    if (r.duration) durationCount[r.duration] = (durationCount[r.duration] ?? 0) + 1
    if (r.rating >= 1 && r.rating <= 5) ratingDist[r.rating - 1]++
  }

  const topFlagEntries = Object.entries(flagCount).sort((a, b) => b[1] - a[1])
  const showRating = n >= 3

  const jsonLd = n >= 1 ? {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: agency.name,
    ...(agency.city ? { address: { '@type': 'PostalAddress', addressLocality: agency.city, addressCountry: 'NL' } } : {}),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: agency.avg_rating?.toFixed(1),
      reviewCount: n,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviews.slice(0, 5).filter(r => r.comment).map(r => ({
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
      datePublished: r.created_at?.slice(0, 10),
      reviewBody: r.comment,
      author: { '@type': 'Person', name: 'Trabajador anónimo' },
    })),
  } : null

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'system-ui, sans-serif' }}>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      {/* Hero */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '36px 24px 28px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Link href={`/${locale}/ett`} style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>
            {t('back')} ←
          </Link>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: '#f97316', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                HolandaFácil · Directorio ETTs
              </p>
              <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 900, color: '#2dd4bf', margin: '0 0 4px', lineHeight: 1.15 }}>
                {agency.name}
              </h1>
              {agency.city && <p style={{ color: 'var(--text-subtle)', fontSize: '0.82rem', margin: '0 0 2px' }}>📍 {agency.city}</p>}
              <CertBadges certifications={agency.certifications ?? []} />
            </div>
            {showRating && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: ratingColor(agency.avg_rating), fontSize: '2.8rem', fontWeight: 900, lineHeight: 1 }}>
                  {agency.avg_rating.toFixed(1)}
                </div>
                <Stars value={agency.avg_rating} />
                <p style={{ color: 'var(--text-subtle)', fontSize: '0.72rem', marginTop: 4 }}>{t('reviews_count', { n })}</p>
              </div>
            )}
            {!showRating && n > 0 && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--text-dim)', fontSize: '1.6rem', fontWeight: 900, lineHeight: 1 }}>—</div>
                <p style={{ color: 'var(--text-subtle)', fontSize: '0.72rem', marginTop: 4 }}>{t('reviews_count', { n })}</p>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>{t('min_reviews_note')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 60px' }}>
        {n === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '40px 24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-subtle)', fontSize: '0.9rem' }}>{t('no_agencies')}</p>
          </div>
        ) : (
          <>
            {/* Summary grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>

              {/* Rating distribution */}
              {showRating && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                    Distribución de puntuaciones
                  </p>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <StatBar
                      key={star}
                      label={`${'★'.repeat(star)}`}
                      count={ratingDist[star - 1]}
                      total={n}
                      color={ratingColor(star)}
                    />
                  ))}
                </div>
              )}

              {/* Would work again */}
              {(wouldCount.yes + wouldCount.no + wouldCount.maybe) > 0 && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                    ¿Seguirías trabajando con ellos?
                  </p>
                  <StatBar label="Sí" count={wouldCount.yes} total={n} color="#22c55e" />
                  <StatBar label="No" count={wouldCount.no} total={n} color="#ef4444" />
                  <StatBar label="Depende" count={wouldCount.maybe} total={n} color="#f97316" />
                </div>
              )}

              {/* Flags */}
              {topFlagEntries.length > 0 && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                    Situaciones reportadas
                  </p>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.68rem', marginBottom: 14, marginTop: 0 }}>
                    Experiencias que mencionan los trabajadores en sus reviews
                  </p>
                  {topFlagEntries.map(([flag, count]) => (
                    <StatBar key={flag} label={FLAG_LABELS[flag] ?? flag} count={count} total={n} color="#64748b" />
                  ))}
                </div>
              )}

              {/* Sector */}
              {Object.keys(sectorCount).length > 0 && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                    Sector de los trabajadores
                  </p>
                  {Object.entries(sectorCount).sort((a, b) => b[1] - a[1]).map(([sector, count]) => (
                    <StatBar key={sector} label={SECTOR_LABELS[sector] ?? sector} count={count} total={n} />
                  ))}
                </div>
              )}

              {/* Duration */}
              {Object.keys(durationCount).length > 0 && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                    Tiempo trabajado
                  </p>
                  {(['less_1m', '1_3m', '3_6m', 'more_6m'] as const).filter(d => durationCount[d]).map((d) => (
                    <StatBar key={d} label={DURATION_LABELS[d]} count={durationCount[d] ?? 0} total={n} />
                  ))}
                </div>
              )}

              {/* Nationality */}
              {Object.keys(natCount).length > 0 && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                    Nacionalidad de los trabajadores
                  </p>
                  {Object.entries(natCount).sort((a, b) => b[1] - a[1]).map(([nat, count]) => (
                    <StatBar key={nat} label={NAT_LABELS[nat] ?? nat} count={count} total={n} />
                  ))}
                </div>
              )}
            </div>

            {/* Reviews list */}
            <h2 style={{ color: 'var(--text)', fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>
              {t('reviews_count', { n })}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reviews.map((review) => (
                <div key={review.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Stars value={review.rating} />
                    {review.nationality && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', background: 'var(--bg)', padding: '2px 8px', borderRadius: 99 }}>
                        {NAT_LABELS[review.nationality] ?? review.nationality}
                      </span>
                    )}
                    {review.sector && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', background: 'var(--bg)', padding: '2px 8px', borderRadius: 99 }}>
                        {review.sector === 'other' && review.sector_detail
                          ? review.sector_detail
                          : (SECTOR_LABELS[review.sector] ?? review.sector)}
                      </span>
                    )}
                    {review.duration && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', background: 'var(--bg)', padding: '2px 8px', borderRadius: 99 }}>
                        {DURATION_LABELS[review.duration] ?? review.duration}
                      </span>
                    )}
                    {review.would_work_again && (
                      <span style={{
                        fontSize: '0.63rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                        background: review.would_work_again === 'yes' ? '#0d2d1a' : review.would_work_again === 'no' ? '#2d0d0d' : '#1a1a0d',
                        color: review.would_work_again === 'yes' ? '#22c55e' : review.would_work_again === 'no' ? '#ef4444' : '#f97316',
                      }}>
                        {review.would_work_again === 'yes' ? '✓ Volvería' : review.would_work_again === 'no' ? '✕ No volvería' : '~ Depende'}
                      </span>
                    )}
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.62rem', marginLeft: 'auto' }}>
                      {new Date(review.created_at).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {(review.flags ?? []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                      {(review.flags ?? []).map((f) => (
                        <span key={f} style={{ fontSize: '0.62rem', color: 'var(--text-dim)', background: 'var(--bg)', padding: '2px 7px', borderRadius: 99, border: '1px solid var(--border)' }}>
                          {FLAG_LABELS[f] ?? f}
                        </span>
                      ))}
                    </div>
                  )}
                  {review.improvement_condition && (
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', lineHeight: 1.5, margin: '0 0 6px', fontStyle: 'italic' }}>
                      <span style={{ fontStyle: 'normal', fontWeight: 600, color: 'var(--text-muted)' }}>¿Qué cambiaría? </span>
                      {review.improvement_condition}
                    </p>
                  )}
                  {review.comment && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.6, margin: 0 }}>
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
