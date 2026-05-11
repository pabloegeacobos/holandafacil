'use client'
import { useTranslations } from 'next-intl'

export default function AdSlot({ variant = 'banner' }: { variant?: 'banner' | 'sidebar' }) {
  const t = useTranslations('adslot')
  const isSidebar = variant === 'sidebar'

  return (
    <div
      style={{
        background: '#111118',
        border: '1px dashed #1e2a3a',
        borderRadius: 12,
        padding: isSidebar ? '20px 16px' : '16px 20px',
        textAlign: 'center',
      }}
    >
      <p style={{ color: '#334155', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
        {t('label')}
      </p>
      <p style={{ color: '#2dd4bf', fontWeight: 700, fontSize: isSidebar ? '0.9rem' : '0.85rem', marginBottom: 6 }}>
        {t('title')}
      </p>
      <p style={{ color: '#475569', fontSize: '0.75rem', lineHeight: 1.5, marginBottom: 14 }}>
        {t('desc')}
      </p>
      <a
        href={`mailto:${t('email')}`}
        style={{
          display: 'inline-block',
          background: 'none',
          border: '1px solid #f97316',
          color: '#f97316',
          borderRadius: 8,
          padding: '7px 16px',
          fontSize: '0.78rem',
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        {t('cta')}
      </a>
    </div>
  )
}
