'use client'
import { useState, useEffect, useCallback } from 'react'

type ReferralEntry = {
  id: string
  name: string
  created_at: string
  confirmed: boolean
}

type MissionStatus = {
  missions: {
    review: { complete: boolean; count: number }
    suggestion: { complete: boolean; count: number }
    referrals: { complete: boolean; count: number; pending: number; target: number; list: ReferralEntry[] }
  }
  allComplete: boolean
  reward: { earned_at: string } | null
  referralCode: string | null
}

function timeRemaining(createdAt: string): string {
  const confirmAt = new Date(createdAt).getTime() + 7 * 24 * 60 * 60 * 1000
  const remaining = confirmAt - Date.now()
  if (remaining <= 0) return ''
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  if (days > 0) return `${days}d ${hours}h para confirmar`
  return `${hours}h para confirmar`
}

export default function MissionsPanel({ locale }: { locale: string }) {
  const [status, setStatus] = useState<MissionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [suggestion, setSuggestion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [suggestionStatus, setSuggestionStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [copied, setCopied] = useState(false)

  const fetchMissions = useCallback(async () => {
    try {
      const res = await fetch('/api/missions')
      if (res.ok) setStatus(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMissions() }, [fetchMissions])

  async function handleSuggestion(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setSuggestionStatus('idle')
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: suggestion }),
      })
      if (res.ok) {
        setSuggestionStatus('sent')
        setSuggestion('')
        fetchMissions()
      } else {
        setSuggestionStatus('error')
      }
    } catch {
      setSuggestionStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  function copyReferralLink() {
    if (!status?.referralCode) return
    const url = `${window.location.origin}/${locale}/registro?ref=${status.referralCode}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  if (loading) return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
      <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: 0 }}>Cargando misiones...</p>
    </div>
  )

  if (!status) return null

  const { missions, allComplete, reward, referralCode } = status
  const completedCount = [missions.review.complete, missions.suggestion.complete, missions.referrals.complete].filter(Boolean).length

  const badgeStyle: React.CSSProperties = {
    background: allComplete ? '#22c55e20' : '#f9731620',
    color: allComplete ? '#22c55e' : '#f97316',
    fontSize: '0.68rem',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 20,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <h2 style={{ color: 'var(--text)', fontSize: '1rem', fontWeight: 700, margin: 0 }}>Misiones</h2>
          <span style={badgeStyle}>{allComplete ? 'Completadas' : `${completedCount}/3`}</span>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', margin: 0 }}>
          Completa las 3 misiones y gana{' '}
          <strong style={{ color: '#f97316' }}>1 año de Premium</strong>{' '}
          desde el lanzamiento.
        </p>
      </div>

      {reward && (
        <div style={{
          background: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 20,
          textAlign: 'center',
        }}>
          <p style={{ color: '#0a0a0f', fontWeight: 900, fontSize: '1rem', margin: 0, marginBottom: 4 }}>
            ¡Premio conseguido!
          </p>
          <p style={{ color: '#0a0a0f', fontSize: '0.8rem', margin: 0, opacity: 0.85 }}>
            Tienes 1 año de Premium reservado. Te avisaremos cuando se lance.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Misión 1: Review de ETT */}
        <MissionItem
          complete={missions.review.complete}
          title="Deja una review de ETT"
          desc="Comparte tu experiencia con alguna agencia de trabajo temporal."
          extra={!missions.review.complete ? (
            <a
              href={`/${locale}/ett`}
              style={{ display: 'inline-block', marginTop: 8, color: '#2dd4bf', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}
            >
              Ir al directorio →
            </a>
          ) : null}
        />

        {/* Misión 2: Sugerencia de mejora */}
        <MissionItem
          complete={missions.suggestion.complete}
          title="Deja una sugerencia de mejora"
          desc="Cuéntanos qué podemos mejorar en la plataforma."
          extra={missions.suggestion.complete ? (
            <p style={{ color: '#22c55e', fontSize: '0.78rem', margin: '6px 0 0' }}>
              ¡Gracias por tu sugerencia!
            </p>
          ) : (
            <form onSubmit={handleSuggestion} style={{ marginTop: 10 }}>
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="¿Qué mejorarías de HolandaFácil? (mín. 10 caracteres)"
                maxLength={500}
                rows={3}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  color: 'var(--text)',
                  fontSize: '0.85rem',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <button
                  type="submit"
                  disabled={submitting || suggestion.trim().length < 10}
                  style={{
                    background: (submitting || suggestion.trim().length < 10) ? 'var(--border-subtle)' : '#f97316',
                    color: (submitting || suggestion.trim().length < 10) ? 'var(--text-subtle)' : '#0a0a0f',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: (submitting || suggestion.trim().length < 10) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Enviando...' : 'Enviar sugerencia'}
                </button>
                {suggestionStatus === 'error' && (
                  <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>Error. Inténtalo de nuevo.</span>
                )}
              </div>
            </form>
          )}
        />

        {/* Misión 3: Referidos */}
        <MissionItem
          complete={missions.referrals.complete}
          title={`Invita a 3 amigos (${missions.referrals.count}/3 confirmados)`}
          desc="Cuenta cuando tu amigo lleve 7 días registrado."
          extra={
            <div style={{ marginTop: 10 }}>
              {/* Barra de progreso */}
              <div style={{ background: 'var(--border)', borderRadius: 999, height: 5, marginBottom: 10, overflow: 'hidden' }}>
                <div style={{
                  background: missions.referrals.complete ? '#22c55e' : '#f97316',
                  borderRadius: 999,
                  height: '100%',
                  width: `${(missions.referrals.count / 3) * 100}%`,
                  transition: 'width 0.4s ease',
                }} />
              </div>

              {/* Lista de referidos */}
              {missions.referrals.list.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                  {missions.referrals.list.map((r) => (
                    <div key={r.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      background: 'var(--bg)',
                      border: `1px solid ${r.confirmed ? '#22c55e30' : 'var(--border)'}`,
                      borderRadius: 8,
                      padding: '7px 12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <span style={{
                          width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                          background: r.confirmed ? '#22c55e' : 'var(--border-subtle)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.6rem', color: r.confirmed ? '#fff' : 'var(--text-dim)', fontWeight: 700,
                        }}>
                          {r.confirmed ? '✓' : '·'}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.name}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
                        color: r.confirmed ? '#22c55e' : 'var(--text-dim)',
                      }}>
                        {r.confirmed ? 'Confirmado' : timeRemaining(r.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Copiar enlace */}
              {referralCode && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <code style={{
                    flex: 1,
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    padding: '8px 10px',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                    minWidth: 0,
                  }}>
                    holandafacil.com/{locale}/registro?ref={referralCode}
                  </code>
                  <button
                    onClick={copyReferralLink}
                    style={{
                      background: copied ? '#22c55e20' : 'var(--bg-input)',
                      border: `1px solid ${copied ? '#22c55e40' : 'var(--border-subtle)'}`,
                      color: copied ? '#22c55e' : '#2dd4bf',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {copied ? '¡Copiado!' : 'Copiar link'}
                  </button>
                </div>
              )}
            </div>
          }
        />
      </div>
    </div>
  )
}

function MissionItem({
  complete,
  title,
  desc,
  extra,
}: {
  complete: boolean
  title: string
  desc: string
  extra: React.ReactNode
}) {
  return (
    <div style={{
      background: complete ? '#22c55e08' : 'var(--bg)',
      border: `1px solid ${complete ? '#22c55e30' : 'var(--border)'}`,
      borderRadius: 12,
      padding: '14px 16px',
      transition: 'border-color 0.2s ease, background 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: complete ? '#22c55e' : 'transparent',
          border: complete ? 'none' : '2px solid var(--border-subtle)',
          color: complete ? '#fff' : 'var(--text-dim)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.72rem',
          fontWeight: 700,
          flexShrink: 0,
          marginTop: 1,
        }}>
          {complete ? '✓' : ''}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            color: complete ? 'var(--text-dim)' : 'var(--text)',
            fontSize: '0.88rem',
            fontWeight: 600,
            margin: 0,
            marginBottom: 2,
          }}>
            {title}
          </p>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', margin: 0 }}>
            {desc}
          </p>
          {extra}
        </div>
      </div>
    </div>
  )
}
