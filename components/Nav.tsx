import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import ThemeToggle from './ThemeToggle'

export default async function Nav({ locale }: { locale: string }) {
  const t = await getTranslations('nav')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav
      className="nav-bg"
      style={{
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Link href={`/${locale}`} style={{ textDecoration: 'none', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
          holanda<span style={{ color: '#2dd4bf' }}>fácil</span>
        </Link>

        <div className="nav-center-links">
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link href={`/${locale}/guias`} style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
              {t('guias')}
            </Link>
            <Link href={`/${locale}/ett`} style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
              {t('ett')}
            </Link>
            <Link href={`/${locale}/tablon`} style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
              {t('tablon')}
            </Link>
            <Link href={`/${locale}/recursos`} style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
              {t('recursos')}
            </Link>
            <span style={{ color: 'var(--border)', fontSize: '0.875rem' }}>|</span>
            <Link href={`/${locale}/empresas`} style={{ textDecoration: 'none', color: '#f97316', fontSize: '0.875rem', fontWeight: 600 }}>
              {t('empresas')}
            </Link>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeToggle />

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href={`/${locale}/dashboard`} style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                {t('dashboard')}
              </Link>
              <LogoutButton label={t('salir')} locale={locale} />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="nav-login-link">
                <Link href={`/${locale}/login`} style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                  {t('login')}
                </Link>
              </span>
              <Link
                href={`/${locale}/registro`}
                style={{
                  textDecoration: 'none',
                  background: '#f97316',
                  color: '#0a0a0f',
                  fontWeight: 700,
                  padding: '6px 16px',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                }}
              >
                {t('registro')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
