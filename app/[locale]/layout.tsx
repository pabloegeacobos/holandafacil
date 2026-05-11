import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { Plus_Jakarta_Sans } from 'next/font/google'

const syne = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-syne' })

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} className={syne.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-theme',t||(d?'dark':'light'))}catch(e){}` }} />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Nav locale={locale} />
          {children}
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
