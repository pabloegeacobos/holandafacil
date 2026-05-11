import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { guides } from '@/content/guias'
import GuiasClient from './GuiasClient'

const BASE = 'https://holandafacil.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'guides' })
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: `${BASE}/${locale}/guias`,
      languages: { es: `${BASE}/es/guias`, en: `${BASE}/en/guias`, pl: `${BASE}/pl/guias` },
    },
    openGraph: {
      title: `${t('title')} — HolandaFácil`,
      description: t('subtitle'),
      url: `${BASE}/${locale}/guias`,
      type: 'website',
    },
  }
}

export default async function GuiasPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return <GuiasClient locale={locale} guides={guides} />
}
