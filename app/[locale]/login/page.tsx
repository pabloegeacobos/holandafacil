'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { use } from 'react'

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const t = useTranslations('auth')
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'forgot' | 'forgot_sent'>('login')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) {
        setError(t('error_email'))
        return
      }
      router.push(`/${locale}/dashboard`)
      router.refresh()
    } catch {
      setError(t('error_generic'))
    } finally {
      setLoading(false)
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/reset-password`,
      })
      if (err) {
        setError(t('error_generic'))
        return
      }
      setMode('forgot_sent')
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
            {t('login_title')}
          </h1>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 24px' }}>
          {mode === 'forgot_sent' ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#22c55e', fontSize: '0.95rem', fontWeight: 600, marginBottom: 20 }}>
                ✓ {t('forgot_sent')}
              </p>
              <button
                onClick={() => { setMode('login'); setError('') }}
                style={{ background: 'none', border: 'none', color: '#2dd4bf', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                {t('back_to_login')}
              </button>
            </div>
          ) : mode === 'forgot' ? (
            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <p style={{ color: 'var(--text-subtle)', fontSize: '0.83rem', margin: 0, lineHeight: 1.5 }}>
                {t('forgot_desc')}
              </p>
              <div>
                <label style={labelStyle}>{t('email')}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" style={inputStyle} />
              </div>
              {error && <p style={{ color: '#ef4444', fontSize: '0.82rem', margin: 0 }}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                style={{ background: loading ? 'var(--border-subtle)' : '#f97316', color: loading ? 'var(--text-subtle)' : '#0a0a0f', border: 'none', borderRadius: 10, padding: '13px', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? t('loading') : t('forgot_btn')}
              </button>
              <button
                type="button"
                onClick={() => { setMode('login'); setError('') }}
                style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', fontSize: '0.83rem', cursor: 'pointer', textAlign: 'center' }}
              >
                ← {t('back_to_login')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>{t('email')}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t('password')}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" style={inputStyle} />
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError('') }}
                  style={{ background: 'none', border: 'none', color: '#2dd4bf', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: '8px 0 0', textAlign: 'right', width: '100%', display: 'block' }}
                >
                  {t('forgot_link')}
                </button>
              </div>
              {error && <p style={{ color: '#ef4444', fontSize: '0.82rem', margin: 0 }}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                style={{ background: loading ? 'var(--border-subtle)' : '#f97316', color: loading ? 'var(--text-subtle)' : '#0a0a0f', border: 'none', borderRadius: 10, padding: '13px', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}
              >
                {loading ? t('loading') : t('login_btn')}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.82rem', marginTop: 20 }}>
          {t('no_account')}{' '}
          <Link href={`/${locale}/registro`} style={{ color: '#2dd4bf', fontWeight: 600, textDecoration: 'none' }}>
            {t('register_link')}
          </Link>
        </p>
      </div>
    </main>
  )
}
