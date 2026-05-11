import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'HolandaFácil — La vida en Holanda, fácil',
    template: '%s — HolandaFácil',
  },
  description: 'Guías prácticas, directorio de ETTs con reviews reales y comunidad para hispanos en los Países Bajos.',
  metadataBase: new URL('https://holandafacil.com'),
  openGraph: {
    siteName: 'HolandaFácil',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
