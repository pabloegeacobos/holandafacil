'use client'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = saved ?? (prefersDark ? 'dark' : 'light')
    setTheme(initial as 'dark' | 'light')
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }

  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      style={{
        background: 'none',
        border: '1px solid var(--border-subtle)',
        borderRadius: 8,
        padding: '4px 8px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        lineHeight: 1,
        color: 'var(--text-muted)',
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
