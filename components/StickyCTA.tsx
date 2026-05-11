'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function StickyCTA({ locale }: { locale: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      const total = document.documentElement.scrollHeight - window.innerHeight
      setVisible(total > 0 && window.scrollY / total > 0.4)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <Link
        href={`/${locale}/guias`}
        style={{
          background: '#f97316',
          color: '#0a0a0f',
          fontWeight: 800,
          padding: '12px 22px',
          borderRadius: 12,
          textDecoration: 'none',
          fontSize: '0.9rem',
          boxShadow: '0 4px 24px rgba(249,115,22,0.35)',
          display: 'block',
        }}
      >
        Ver guías →
      </Link>
    </div>
  )
}
