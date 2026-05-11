'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { use } from 'react'

function genReferralCode() {
  return crypto.randomUUID().slice(0, 8).toUpperCase()
}

export default function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const t = useTranslations('auth')
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [nationality, setNationality] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const refCode = useRef<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) refCode.current = ref.toUpperCase()
    return () => { if (redirectTimer.current) clearTimeout(redirectTimer.current) }
  }, [])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (signUpErr) {
        setError(signUpErr.message.includes('already') ? t('error_taken') : t('error_generic'))
        return
      }
      if (data.user) {
        const myReferralCode = genReferralCode()
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name: name,
          city: city || null,
          nationality: nationality || null,
          referral_code: myReferralCode,
        })

        if (refCode.current) {
          fetch('/api/referrals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ref_code: refCode.current, new_user_id: data.user.id }),
          })
            .then(async (r) => { if (!r.ok) console.error('[registro] referral failed:', await r.text()) })
            .catch((err) => console.error('[registro] referral fetch error:', err))
        }
      }
      setSuccess(true)
      redirectTimer.current = setTimeout(() => router.push(`/${locale}/dashboard`), 2000)
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
            {t('register_title')}
          </h1>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 24px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ color: '#22c55e', fontWeight: 700, fontSize: '1rem' }}>✓ {t('success')}</p>
            </div>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>{t('name')} *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t('email')} *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t('password')} *</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" style={inputStyle} />
              </div>
              <div className="form-grid-2col">
                <div>
                  <label style={labelStyle}>{t('nationality')}</label>
                  <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="España, México..." style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('city')}</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Amsterdam, Rotterdam..." style={inputStyle} />
                </div>
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
                {loading ? t('loading') : t('register_btn')}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.82rem', marginTop: 20 }}>
          {t('have_account')}{' '}
          <Link href={`/${locale}/login`} style={{ color: '#2dd4bf', fontWeight: 600, textDecoration: 'none' }}>
            {t('login_link')}
          </Link>
        </p>
      </div>
    </main>
  )
}
