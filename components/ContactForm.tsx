'use client'
import { useState } from 'react'

const ASUNTOS = [
  { value: 'sugerencia', label: 'Sugerencia' },
  { value: 'incidencia', label: 'Incidencia' },
  { value: 'colaboracion', label: 'Colaboración' },
  { value: 'otro', label: 'Otro' },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 8,
  padding: '12px 16px',
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

export default function ContactForm() {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre || !form.email || !form.asunto || !form.mensaje) return
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{ background: '#0d2d1a', border: '1px solid #22c55e30', borderRadius: 16, padding: '40px 32px', textAlign: 'center' }}>
        <p style={{ color: '#22c55e', fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>✓ Mensaje recibido</p>
        <p style={{ color: 'var(--text-subtle)', fontSize: '0.9rem', margin: 0 }}>
          Te respondemos en 24–48 horas.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div>
          <label style={labelStyle}>Nombre *</label>
          <input
            required
            value={form.nombre}
            onChange={(e) => update('nombre', e.target.value)}
            placeholder="Tu nombre"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="tu@email.com"
            style={inputStyle}
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Asunto *</label>
        <select
          required
          value={form.asunto}
          onChange={(e) => update('asunto', e.target.value)}
          style={{ ...inputStyle, color: form.asunto ? 'var(--text)' : 'var(--text-subtle)' }}
        >
          <option value="">Selecciona un asunto</option>
          {ASUNTOS.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Mensaje *</label>
        <textarea
          required
          value={form.mensaje}
          onChange={(e) => update('mensaje', e.target.value.slice(0, 1000))}
          placeholder="Cuéntanos..."
          rows={5}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
        />
        <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', marginTop: 4, textAlign: 'right' }}>
          {form.mensaje.length}/1000
        </p>
      </div>
      {status === 'error' && (
        <p style={{ color: '#ef4444', fontSize: '0.82rem', margin: 0 }}>Error al enviar. Inténtalo de nuevo.</p>
      )}
      <button
        type="submit"
        disabled={status === 'loading'}
        style={{
          background: status === 'loading' ? 'var(--border-subtle)' : '#f97316',
          color: status === 'loading' ? 'var(--text-subtle)' : '#0a0a0f',
          border: 'none',
          borderRadius: 10,
          padding: '14px 32px',
          fontWeight: 800,
          fontSize: '0.95rem',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          alignSelf: 'flex-start',
        }}
      >
        {status === 'loading' ? 'Enviando...' : 'Enviar mensaje'}
      </button>
    </form>
  )
}
