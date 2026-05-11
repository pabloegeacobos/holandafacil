import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import TablonClient from './TablonClient'

const BASE = 'https://holandafacil.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'tablon' })
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: `${BASE}/${locale}/tablon`,
      languages: { es: `${BASE}/es/tablon`, en: `${BASE}/en/tablon`, pl: `${BASE}/pl/tablon` },
    },
    openGraph: {
      title: `${t('title')} — HolandaFácil`,
      description: t('subtitle'),
      url: `${BASE}/${locale}/tablon`,
      type: 'website',
    },
  }
}

export type Classified = {
  id: string
  category_slug: string
  title: string
  description: string | null
  city: string | null
  contact: string
  direction: string | null
  date_available: string | null
  created_at: string
  expires_at: string
}

export default async function TablonPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: classifieds } = await supabase
    .from('classifieds')
    .select('id, category_slug, title, description, city, contact, direction, date_available, created_at, expires_at')
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <TablonClient
      locale={locale}
      classifieds={(classifieds ?? []) as Classified[]}
      isLoggedIn={!!user}
    />
  )
}
