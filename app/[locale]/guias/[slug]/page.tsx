import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getGuide, guides, type Faq } from '@/content/guias'
import { guiaSeo } from '@/content/guias/seo'
import StickyCTA from '@/components/StickyCTA'
import GuideEmailCapture from '@/components/GuideEmailCapture'

const BASE = 'https://holandafacil.com'
const DATE_PUBLISHED = '2026-05-01'
const DATE_MODIFIED = '2026-05-10'

function buildSchemas(
  guide: NonNullable<ReturnType<typeof getGuide>>,
  slug: string,
  locale: string,
  seoDesc: string,
  schemaType: 'HowTo' | 'Article',
) {
  const url = `${BASE}/${locale}/guias/${slug}`

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Guías', item: `${BASE}/${locale}/guias` },
      { '@type': 'ListItem', position: 3, name: guide.title, item: url },
    ],
  }

  const main =
    schemaType === 'HowTo'
      ? {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: guide.title,
          description: seoDesc,
          datePublished: DATE_PUBLISHED,
          dateModified: DATE_MODIFIED,
          step: guide.sections.map((s) => ({
            '@type': 'HowToStep',
            name: s.heading,
            text: stripMarkdown(s.content.split('\n').find((l) => l.trim()) ?? s.content.slice(0, 250)),
          })),
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: guide.title,
          description: seoDesc,
          datePublished: DATE_PUBLISHED,
          dateModified: DATE_MODIFIED,
          publisher: { '@type': 'Organization', name: 'HolandaFácil', url: BASE },
        }

  return { breadcrumb, main }
}

function stripMarkdown(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
}

function parseInlineLinks(text: string, locale: string): ReactNode[] {
  const parts: ReactNode[] = []
  const re = /\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index))
    const href = m[2].startsWith('/') ? `/${locale}${m[2]}` : m[2]
    parts.push(
      <a
        key={m.index}
        href={href}
        style={{ color: '#2dd4bf', textDecoration: 'underline', fontWeight: 600 }}
      >
        {m[1]}
      </a>
    )
    lastIndex = re.lastIndex
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const guide = getGuide(slug)
  if (!guide) return {}
  const seo = guiaSeo[slug]
  const metaDesc =
    seo?.description ??
    (guide.description.length > 155 ? guide.description.slice(0, 152) + '.' : guide.description)
  return {
    title: guide.title,
    description: metaDesc,
    alternates: {
      canonical: `${BASE}/${locale}/guias/${slug}`,
      languages: {
        es: `${BASE}/es/guias/${slug}`,
        en: `${BASE}/en/guias/${slug}`,
        pl: `${BASE}/pl/guias/${slug}`,
      },
    },
    openGraph: {
      title: `${guide.title} — HolandaFácil`,
      description: metaDesc,
      url: `${BASE}/${locale}/guias/${slug}`,
      type: 'article',
    },
  }
}

export async function generateStaticParams() {
  const locales = ['es', 'en', 'pl']
  return locales.flatMap((locale) => guides.map((guide) => ({ locale, slug: guide.slug })))
}

export default async function GuiaPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const guide = getGuide(slug)
  const t = await getTranslations('guides')

  if (!guide) notFound()

  const seo = guiaSeo[slug]
  const seoDesc =
    seo?.description ??
    (guide.description.length > 155 ? guide.description.slice(0, 152) + '.' : guide.description)
  const schemaType = seo?.schemaType ?? 'Article'
  const { breadcrumb, main } = buildSchemas(guide, slug, locale, seoDesc, schemaType)

  const faqSchema = guide.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: guide.faqs.map((f: Faq) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(main) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      {/* Header */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '36px 24px 28px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Link
            href={`/${locale}/guias`}
            style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}
          >
            {t('back')}
          </Link>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <span style={{ fontSize: '2.5rem', flexShrink: 0, lineHeight: 1 }}>{guide.icon}</span>
            <div>
              <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 900, color: '#2dd4bf', lineHeight: 1.2, margin: 0, marginBottom: 6 }}>
                {guide.title}
              </h1>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', margin: '0 0 8px', fontStyle: 'italic' }}>
                Última actualización: mayo 2026
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                {guide.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
        {guide.sections.map((section, i) => (
          <div key={i} style={{ marginBottom: 36 }}>
            <h2 style={{ color: 'var(--text)', fontSize: '1.05rem', fontWeight: 800, marginBottom: 14, borderLeft: '3px solid #f97316', paddingLeft: 14 }}>
              {section.heading}
            </h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>
              {section.content.split('\n').map((line, j) =>
                line.trim() === '' ? (
                  <div key={j} style={{ height: 10 }} />
                ) : (
                  <p key={j} style={{ margin: 0 }}>
                    {parseInlineLinks(line, locale)}
                  </p>
                )
              )}
            </div>
          </div>
        ))}

        {guide.faqs?.length ? (
          <div style={{ marginTop: 48, marginBottom: 32 }}>
            <h2 style={{ color: 'var(--text)', fontSize: '1.05rem', fontWeight: 800, marginBottom: 20, borderLeft: '3px solid #f97316', paddingLeft: 14 }}>
              Preguntas frecuentes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {guide.faqs.map((faq: Faq, i: number) => (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
                  <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.9rem', marginBottom: 8 }}>{faq.q}</p>
                  <p style={{ color: 'var(--text-subtle)', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: guide.faqs?.length ? 0 : 48, marginBottom: 32 }}>
          <GuideEmailCapture slug={slug} />
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 'clamp(28px, 5vw, 40px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <p style={{ color: '#f97316', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Para empresas</p>
            <h3 style={{ color: 'var(--text)', fontSize: '1.15rem', fontWeight: 800, marginBottom: 6 }}>¿Representas a una empresa?</h3>
            <p style={{ color: 'var(--text-subtle)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>Llega a los trabajadores hispanohablantes en Países Bajos.</p>
          </div>
          <Link
            href={`/${locale}/empresas`}
            style={{ background: 'none', border: '1px solid #f97316', color: '#f97316', fontWeight: 700, padding: '12px 24px', borderRadius: 12, textDecoration: 'none', fontSize: '0.875rem', flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            Solicitar información →
          </Link>
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Link
            href={`/${locale}/guias`}
            style={{ color: '#2dd4bf', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
          >
            {t('back')}
          </Link>
        </div>
      </div>

      <StickyCTA locale={locale} />
    </main>
  )
}
