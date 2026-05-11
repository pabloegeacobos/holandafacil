import Link from 'next/link'

export default function Footer({ locale }: { locale: string }) {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px', textAlign: 'center' }}>
      <p style={{ color: 'var(--border-subtle)', fontSize: '0.8rem' }}>
        © 2026 HolandaFácil — Hecho con 🧡 para la comunidad hispana en Países Bajos
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
        <Link href={`/${locale}/guias`} style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'none' }}>Guías</Link>
        <Link href={`/${locale}/ett`} style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'none' }}>ETTs</Link>
        <Link href={`/${locale}/empresas`} style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'none' }}>Para empresas</Link>
        <Link href={`/${locale}/contacto`} style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'none' }}>Contacto</Link>
        <a href="mailto:holandafacil.info@gmail.com" style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'none' }}>Política de privacidad</a>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8, flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text-faint)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ciudades</span>
        <Link href={`/${locale}/ciudades/amsterdam`} style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'none' }}>Ámsterdam</Link>
        <Link href={`/${locale}/ciudades/rotterdam`} style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'none' }}>Róterdam</Link>
        <Link href={`/${locale}/ciudades/eindhoven`} style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'none' }}>Eindhoven</Link>
        <Link href={`/${locale}/ciudades/den-haag`} style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'none' }}>La Haya</Link>
      </div>
      <p style={{ color: 'var(--text-faint)', fontSize: '0.7rem', marginTop: 10 }}>
        Cumplimiento RGPD · Tus datos nunca se venden ni comparten con terceros.
      </p>
    </footer>
  )
}
