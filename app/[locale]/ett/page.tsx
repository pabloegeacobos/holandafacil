import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ETTClient from './ETTClient'

const BASE = 'https://holandafacil.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'reviews' })
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: `${BASE}/${locale}/ett`,
      languages: { es: `${BASE}/es/ett`, en: `${BASE}/en/ett`, pl: `${BASE}/pl/ett` },
    },
    openGraph: {
      title: `${t('title')} — HolandaFácil`,
      description: t('subtitle'),
      url: `${BASE}/${locale}/ett`,
      type: 'website',
    },
  }
}

type Agency = {
  id: string
  name: string
  city: string | null
  avg_rating: number
  total_reviews: number
  kvk: string | null
  certifications: string[]
}

type Review = {
  id: string
  agency_id: string
  rating: number
  flags: string[]
  comment: string | null
  nationality: string | null
  sector: string | null
  created_at: string
}

export default async function ETTPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ ciudad?: string }>
}) {
  const { locale } = await params
  const { ciudad } = await searchParams
  const supabase = await createClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: agencies }, { data: reviews }, { count: weeklyCount }] = await Promise.all([
    supabase
      .from('agencies')
      .select('id, name, city, avg_rating, total_reviews, kvk, certifications')
      .order('total_reviews', { ascending: false }),
    supabase
      .from('reviews')
      .select('id, agency_id, rating, flags, comment, nationality, sector, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo),
  ])

  const reviewList = (reviews ?? []) as Review[]
  const incidentCount = reviewList.filter(r => (r.flags ?? []).length > 0).length

  return (
    <ETTClient
      locale={locale}
      agencies={(agencies ?? []) as Agency[]}
      reviews={reviewList}
      weeklyReviews={weeklyCount ?? 0}
      incidentCount={incidentCount}
      isLoggedIn={!!user}
      initialCity={ciudad ?? ''}
    />
  )
}
