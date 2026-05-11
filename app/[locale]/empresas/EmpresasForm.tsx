'use client'
import { useState } from 'react'

const INTERESTS = [
  { value: 'directorio', label: 'Publicidad en el directorio (€149/mes)' },
  { value: 'guias', label: 'Mención en guías (€299/mes por guía)' },
  { value: 'otro', label: 'Otro' },
]

export default function EmpresasForm() {
  const [form, setForm] = useState({ nombre: '', empresa: '', email: '', tipo_interes: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre || !form.empresa || !form.email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/b2b-leads', {
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

  if (status === 'success') {
    return (
      <div style={{ background: '#0d2d1a', border: '1px solid #22c55e30', borderRadius: 16, padding: '40px 32px', textAlign: 'center' }}>
        <p style={{ color: '#22c55e', fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>✓ Información recibida</p>
        <p style={{ color: 'var(--text-subtle)', fontSize: '0.9rem', margin: 0 }}>
          Nos pondremos en contacto contigo en 24–48 horas.
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
          <label style={labelStyle}>Empresa *</label>
          <input
            required
            value={form.empresa}
            onChange={(e) => update('empresa', e.target.value)}
            placeholder="Nombre de la empresa"
            style={inputStyle}
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Email *</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="contacto@empresa.com"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Tipo de interés</label>
        <select
          value={form.tipo_interes}
          onChange={(e) => update('tipo_interes', e.target.value)}
          style={{ ...inputStyle, color: form.tipo_interes ? 'var(--text)' : 'var(--text-subtle)' }}
        >
          <option value="">Selecciona una opción</option>
          {INTERESTS.map((i) => (
            <option key={i.value} value={i.value}>{i.label}</option>
          ))}
        </select>
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
        {status === 'loading' ? 'Enviando...' : 'Solicitar información sin compromiso'}
      </button>
    </form>
  )
}
