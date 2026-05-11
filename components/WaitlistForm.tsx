'use client'
import { useState } from 'react'

export default function WaitlistForm({ locale }: { locale: string }) {
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
        body: JSON.stringify({ email: email.trim(), fuente: 'comunidad' }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
        ✓ ¡Apuntado! Te avisaremos cuando abramos.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        required
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8,
          padding: '10px 14px',
          color: 'var(--text)',
          fontSize: '0.88rem',
          outline: 'none',
          width: '100%',
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
          padding: '10px 16px',
          fontWeight: 700,
          fontSize: '0.85rem',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
        }}
      >
        {status === 'loading' ? 'Enviando...' : 'Quiero estar en la lista'}
      </button>
      {status === 'error' && (
        <p style={{ color: '#ef4444', fontSize: '0.72rem', margin: 0 }}>Error. Inténtalo de nuevo.</p>
      )}
      <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', margin: 0 }}>
        Sin spam. Puedes darte de baja cuando quieras.
      </p>
    </form>
  )
}
