import type { MetadataRoute } from 'next'
import { guides } from '@/content/guias'

const BASE = 'https://holandafacil.com'
const LOCALES = ['es', 'en', 'pl']

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES) {
    entries.push({
      url: `${BASE}/${locale}`,
      changeFrequency: 'weekly',
      priority: locale === 'es' ? 1.0 : 0.9,
    })
    entries.push({
      url: `${BASE}/${locale}/guias`,
      changeFrequency: 'weekly',
      priority: 0.9,
    })
    entries.push({
      url: `${BASE}/${locale}/ett`,
      changeFrequency: 'daily',
      priority: 0.85,
    })
    entries.push({
      url: `${BASE}/${locale}/tablon`,
      changeFrequency: 'daily',
      priority: 0.75,
    })
    entries.push({
      url: `${BASE}/${locale}/recursos`,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
    for (const guide of guides) {
      entries.push({
        url: `${BASE}/${locale}/guias/${guide.slug}`,
        changeFrequency: 'monthly',
        priority: 0.8,
      })
    }
  }

  return entries
}
