'use client'
import { useState } from 'react'

export default function GuideEmailCapture({ slug }: { slug: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), fuente: `guia-${slug}` }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{ background: '#0d2d1a', border: '1px solid #22c55e30', borderRadius: 12, padding: '24px 20px', textAlign: 'center' }}>
        <p style={{ color: '#22c55e', fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>
          ✓ Guardado. Te avisamos si algo cambia en esta guía.
        </p>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 20px' }}>
      <p style={{ color: 'var(--text)', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 6px' }}>
        ¿Te ha sido útil esta guía?
      </p>
      <p style={{ color: 'var(--text-subtle)', fontSize: '0.82rem', lineHeight: 1.6, margin: '0 0 16px' }}>
        Déjanos tu email y te avisamos cuando actualicemos la información. La normativa holandesa cambia con frecuencia.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          style={{
            flex: '1 1 200px',
            background: 'var(--bg)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            padding: '10px 14px',
            color: 'var(--text)',
            fontSize: '0.88rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            background: status === 'loading' ? 'var(--border-subtle)' : '#f97316',
            color: status === 'loading' ? 'var(--text-subtle)' : '#0a0a0f',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {status === 'loading' ? 'Enviando...' : 'Avisarme'}
        </button>
      </form>
      {status === 'error' && (
        <p style={{ color: '#ef4444', fontSize: '0.72rem', margin: '8px 0 0' }}>Error. Inténtalo de nuevo.</p>
      )}
      <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', margin: '8px 0 0' }}>
        Sin spam. Solo cuando cambie algo importante.
      </p>
    </div>
  )
}
