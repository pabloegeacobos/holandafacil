'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { use } from 'react'

export default function ResetPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const t = useTranslations('auth')
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError(t('error_passwords_match'))
      return
    }
    if (password.length < 6) {
      setError(t('error_password_short'))
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) {
        setError(t('error_reset_expired'))
        return
      }
      setSuccess(true)
      setTimeout(() => router.push(`/${locale}/login`), 2500)
    } catch {
      setError(t('error_generic'))
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 10,
    padding: '12px 14px',
    color: 'var(--text)',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-muted)',
    fontSize: '0.78rem',
    fontWeight: 600,
    display: 'block',
    marginBottom: 6,
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href={`/${locale}`} style={{ textDecoration: 'none', fontWeight: 900, fontSize: '1.4rem', color: 'var(--text)' }}>
            holanda<span style={{ color: '#2dd4bf' }}>fácil</span>
          </Link>
          <h1 style={{ color: 'var(--text)', fontSize: '1.25rem', fontWeight: 700, marginTop: 16, marginBottom: 4 }}>
            {t('reset_title')}
          </h1>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 24px' }}>
          {success ? (
            <p style={{ color: '#22c55e', fontSize: '0.95rem', fontWeight: 600, textAlign: 'center', margin: 0 }}>
              ✓ {t('reset_success')}
            </p>
          ) : (
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>{t('new_password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>{t('confirm_password')}</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </div>
              {error && <p style={{ color: '#ef4444', fontSize: '0.82rem', margin: 0 }}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? 'var(--border-subtle)' : '#f97316',
                  color: loading ? 'var(--text-subtle)' : '#0a0a0f',
                  border: 'none',
                  borderRadius: 10,
                  padding: '13px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: 4,
                }}
              >
                {loading ? t('loading') : t('reset_btn')}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.82rem', marginTop: 20 }}>
          <Link href={`/${locale}/login`} style={{ color: '#2dd4bf', fontWeight: 600, textDecoration: 'none' }}>
            ← {t('back_to_login')}
          </Link>
        </p>
      </div>
    </main>
  )
}
