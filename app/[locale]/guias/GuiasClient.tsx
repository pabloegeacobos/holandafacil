'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import type { Guide } from '@/content/guias'

type Situation = 'ett' | 'directo' | 'sin'

type Step = {
  num: number
  title: string
  why: string
  slug?: string
  href?: string
  linkLabel: string
  urgent?: boolean
}

const STEPS: Record<Situation, Step[]> = {
  ett: [
    {
      num: 1,
      title: 'Consigue el BSN',
      why: 'Sin BSN no puedes cobrar. Pide cita en el punto RNI de tu ciudad — la ETT no puede hacerlo por ti, debes ir tú en persona.',
      slug: 'bsn',
      linkLabel: 'Cómo conseguir el BSN',
      urgent: true,
    },
    {
      num: 2,
      title: 'Abre una cuenta bancaria',
      why: 'Sin cuenta neerlandesa no recibirás el salario. Abre Bunq desde el móvil antes de llegar — no necesitas BSN para empezar.',
      slug: 'bancos',
      linkLabel: 'Qué banco abrir y cómo',
    },
    {
      num: 3,
      title: 'Contrata el seguro médico',
      why: 'Es obligatorio desde el primer día de trabajo. Si no lo contratas en 4 meses, el gobierno te asigna uno y encima te multa.',
      slug: 'sanidad',
      linkLabel: 'Cómo contratar el seguro',
      urgent: true,
    },
    {
      num: 4,
      title: 'Pide el zorgtoeslag',
      why: 'El gobierno te devuelve hasta 129 €/mes para pagar el seguro. No es automático — tienes que pedirlo tú. Muchos trabajadores no lo saben y lo pierden.',
      slug: 'toeslagen',
      linkLabel: 'Guía de toeslagen y otras ayudas',
    },
    {
      num: 5,
      title: 'Regístrate en el municipio',
      why: 'En cuanto tengas domicilio fijo, haz el inschrijving. Desbloquea el huurtoeslag y otros derechos. Si la ETT te lo impide, es ilegal.',
      slug: 'inschrijving',
      linkLabel: 'Cómo registrarse',
    },
    {
      num: 6,
      title: 'Lee tus derechos con la ETT antes de firmar',
      why: 'Entiende las fases A/B/C, qué pueden descontarte y qué no, y cómo detectar una agencia fraudulenta. Firmar sin saber es el error más caro.',
      slug: 'trabajo',
      linkLabel: 'Guía de derechos laborales',
    },
  ],
  directo: [
    {
      num: 1,
      title: 'Consigue el BSN',
      why: 'Sin BSN tu empleador no puede procesarte en nómina ni pagar impuestos correctamente. Es el paso 0.',
      slug: 'bsn',
      linkLabel: 'Cómo conseguir el BSN',
      urgent: true,
    },
    {
      num: 2,
      title: 'Regístrate en el municipio',
      why: 'Tienes 5 días desde que estableces domicilio para hacer el inschrijving. Si no lo haces, no accedes a subsidios y puedes ser multado con 325 €.',
      slug: 'inschrijving',
      linkLabel: 'Cómo registrarse',
      urgent: true,
    },
    {
      num: 3,
      title: 'Abre una cuenta bancaria',
      why: 'Necesitas cuenta neerlandesa para recibir el salario, pagar el alquiler y cobrar las ayudas del gobierno.',
      slug: 'bancos',
      linkLabel: 'Qué banco abrir y cómo',
    },
    {
      num: 4,
      title: 'Contrata el seguro médico',
      why: 'Obligatorio desde el primer día de trabajo. Elige aseguradora y contrata — todas cubren lo mismo, solo varía el precio.',
      slug: 'sanidad',
      linkLabel: 'Cómo contratar el seguro',
      urgent: true,
    },
    {
      num: 5,
      title: 'Pide el zorgtoeslag',
      why: 'El gobierno te devuelve hasta 129 €/mes para pagar el seguro. No es automático — solicítalo en cuanto tengas BSN y cuenta bancaria.',
      slug: 'toeslagen',
      linkLabel: 'Guía de toeslagen y otras ayudas',
    },
  ],
  sin: [
    {
      num: 1,
      title: 'Consigue el BSN cuanto antes',
      why: 'Aunque no tengas trabajo todavía, el BSN es el paso 0 para todo lo demás. Puedes obtenerlo vía RNI con solo el pasaporte o DNI.',
      slug: 'bsn',
      linkLabel: 'Cómo conseguir el BSN',
      urgent: true,
    },
    {
      num: 2,
      title: 'Abre una cuenta bancaria ya',
      why: 'Bunq no requiere BSN para abrir la cuenta. Tenla lista para cuando empieces a trabajar — sin cuenta no recibirás el primer salario.',
      slug: 'bancos',
      linkLabel: 'Qué banco abrir y cómo',
    },
    {
      num: 3,
      title: 'Regístrate en el municipio',
      why: 'Si tienes donde quedarte, regístrate. Si no tienes dirección fija, el municipio tiene obligación de darte un briefadres temporal.',
      slug: 'inschrijving',
      linkLabel: 'Cómo registrarse',
    },
    {
      num: 4,
      title: 'Entiende cómo funciona el trabajo en NL',
      why: 'Antes de firmar con ninguna ETT, lee cómo funcionan las fases del contrato, qué pueden y no pueden descontarte, y cómo detectar una agencia fraudulenta.',
      slug: 'trabajo',
      linkLabel: 'Guía de derechos laborales',
    },
    {
      num: 5,
      title: 'Contrata el seguro médico al empezar a trabajar',
      why: 'En cuanto empieces a trabajar o a residir oficialmente, el seguro es obligatorio. Tienes 4 meses o te lo imponen.',
      slug: 'sanidad',
      linkLabel: 'Cómo contratar el seguro',
      urgent: true,
    },
  ],
}

const SITUATIONS: { key: Situation; icon: string }[] = [
  { key: 'ett', icon: '🏭' },
  { key: 'directo', icon: '🤝' },
  { key: 'sin', icon: '🔍' },
]

export default function GuiasClient({
  locale,
  guides,
}: {
  locale: string
  guides: Guide[]
}) {
  const t = useTranslations('guides')
  const [situation, setSituation] = useState<Situation | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [search, setSearch] = useState('')

  const steps = situation ? STEPS[situation] : null

  const filteredGuides = search.trim()
    ? guides.filter(
        (g) =>
          g.title.toLowerCase().includes(search.toLowerCase()) ||
          g.description.toLowerCase().includes(search.toLowerCase())
      )
    : guides

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <p style={{ color: '#f97316', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            HolandaFácil
          </p>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 900, color: '#2dd4bf', lineHeight: 1.2, marginBottom: 10 }}>
            {t('situation_title')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 20px' }}>
            {t('situation_subtitle')}
          </p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 400 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', fontSize: '0.9rem', pointerEvents: 'none' }}>
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSituation(null) }}
              placeholder="Buscar una guía..."
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '10px 36px 10px 36px',
                color: 'var(--text)',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 2 }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Search results mode */}
        {search.trim() ? (
          <div>
            <p style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', marginBottom: 16 }}>
              {filteredGuides.length} resultado{filteredGuides.length !== 1 ? 's' : ''} para &ldquo;{search}&rdquo;
            </p>
            {filteredGuides.length === 0 ? (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '32px 24px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-subtle)', fontSize: '0.9rem' }}>No se encontraron guías. Prueba con otra palabra.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredGuides.map((guide, i) => (
                  <Link key={guide.slug} href={`/${locale}/guias/${guide.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: i === 0 ? '14px 14px 0 0' : i === filteredGuides.length - 1 ? '0 0 14px 14px' : '0',
                      borderTop: i === 0 ? '1px solid var(--border)' : 'none',
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                    }}>
                      <span style={{ fontSize: '1.7rem', flexShrink: 0 }}>{guide.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h2 style={{ color: 'var(--text)', fontSize: '0.93rem', fontWeight: 700, margin: '0 0 4px' }}>{guide.title}</h2>
                        <p style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', margin: 0, lineHeight: 1.5 }}>{guide.description}</p>
                      </div>
                      <span style={{ color: '#2dd4bf', fontSize: '1.1rem', flexShrink: 0 }}>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Situation cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 36 }}>
              {SITUATIONS.map(({ key, icon }) => {
                const active = situation === key
                return (
                  <button
                    key={key}
                    onClick={() => { setSituation(active ? null : key); setShowAll(false) }}
                    style={{
                      background: active ? '#0f2a2a' : 'var(--bg-card)',
                      border: `2px solid ${active ? '#2dd4bf' : 'var(--border-subtle)'}`,
                      borderRadius: 12,
                      padding: '18px 16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{icon}</div>
                    <p style={{ color: active ? '#2dd4bf' : 'var(--text)', fontWeight: 700, fontSize: '0.88rem', margin: '0 0 6px' }}>
                      {t(`situation_${key}` as `situation_${'ett' | 'directo' | 'sin'}`)}
                    </p>
                    <p style={{ color: 'var(--text-subtle)', fontSize: '0.72rem', lineHeight: 1.5, margin: 0 }}>
                      {t(`situation_${key}_desc` as `situation_${'ett' | 'directo' | 'sin'}_desc`)}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Steps */}
            {steps ? (
              <div>
                <p style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                  {t('steps_label')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {steps.map((step) => (
                    <div
                      key={step.num}
                      style={{
                        background: 'var(--bg-card)',
                        border: `1px solid ${step.urgent ? '#f9731625' : 'var(--border)'}`,
                        borderRadius: 12,
                        padding: '18px 20px',
                        display: 'flex',
                        gap: 16,
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{
                        flexShrink: 0,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: step.urgent ? '#f97316' : 'var(--border-subtle)',
                        color: step.urgent ? '#0a0a0f' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                      }}>
                        {step.num}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 6px' }}>
                          {step.title}
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.6, margin: '0 0 14px' }}>
                          {step.why}
                        </p>
                        {step.slug ? (
                          <Link
                            href={`/${locale}/guias/${step.slug}`}
                            style={{
                              display: 'inline-block',
                              background: step.urgent ? '#f97316' : 'none',
                              color: step.urgent ? '#0a0a0f' : '#2dd4bf',
                              border: step.urgent ? 'none' : '1px solid #2dd4bf40',
                              borderRadius: 8,
                              padding: '7px 14px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                            }}
                          >
                            {step.linkLabel} →
                          </Link>
                        ) : (
                          <a
                            href={step.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-block',
                              background: 'none',
                              color: '#2dd4bf',
                              border: '1px solid #2dd4bf40',
                              borderRadius: 8,
                              padding: '7px 14px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                            }}
                          >
                            {step.linkLabel} ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                  <button
                    onClick={() => setShowAll(!showAll)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', fontSize: '0.8rem', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <span style={{ fontSize: '0.65rem' }}>{showAll ? '▲' : '▼'}</span>
                    {showAll ? t('hide_all_guides') : t('show_all_guides')}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', marginBottom: 20 }}>
                  {t('choose_directly')}
                </p>
              </div>
            )}

            {/* Full guide list */}
            {(!situation || showAll) && (
              <div style={{ marginTop: situation ? 16 : 0, display: 'flex', flexDirection: 'column' }}>
                {guides.map((guide, i) => (
                  <div key={guide.slug}>
                    <Link href={`/${locale}/guias/${guide.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: i === 0 ? '14px 14px 0 0' : i === guides.length - 1 ? '0 0 14px 14px' : '0',
                        borderTop: i === 0 ? '1px solid var(--border)' : 'none',
                        padding: '18px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                      }}>
                        <span style={{ fontSize: '1.7rem', flexShrink: 0 }}>{guide.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h2 style={{ color: 'var(--text)', fontSize: '0.93rem', fontWeight: 700, margin: '0 0 4px' }}>
                            {guide.title}
                          </h2>
                          <p style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', margin: 0, lineHeight: 1.5 }}>
                            {guide.description}
                          </p>
                        </div>
                        <span style={{ color: '#2dd4bf', fontSize: '1.1rem', flexShrink: 0 }}>→</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
