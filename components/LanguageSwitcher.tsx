'use client'
import { usePathname, useRouter } from 'next/navigation'

const LOCALES = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'pl', label: 'PL' },
]

export default function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname()
  const router = useRouter()

  function switchLocale(newLocale: string) {
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/') || '/')
  }

  return (
    <div className="flex items-center gap-0.5">
      {LOCALES.map(({ code, label }, i) => (
        <span key={code} className="flex items-center">
          <button
            onClick={() => switchLocale(code)}
            className={`text-xs font-semibold px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
              locale === code
                ? 'text-teal-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {label}
          </button>
          {i < LOCALES.length - 1 && (
            <span className="text-slate-700 text-xs select-none">|</span>
          )}
        </span>
      ))}
    </div>
  )
}
