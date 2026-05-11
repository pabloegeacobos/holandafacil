import type { Metadata } from 'next'
import Link from 'next/link'
import { use } from 'react'

const BASE = 'https://holandafacil.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Recursos útiles para vivir en Holanda',
    description: 'Links directos a los portales oficiales, apps y herramientas que más necesitas al vivir y trabajar en los Países Bajos.',
    alternates: {
      canonical: `${BASE}/${locale}/recursos`,
      languages: { es: `${BASE}/es/recursos`, en: `${BASE}/en/recursos`, pl: `${BASE}/pl/recursos` },
    },
    openGraph: {
      title: 'Recursos útiles — HolandaFácil',
      description: 'Links directos a los portales oficiales, apps y herramientas que más necesitas.',
      url: `${BASE}/${locale}/recursos`,
      type: 'website',
    },
  }
}

type Resource = {
  label: string
  url: string
  desc: string
}

type Category = {
  icon: string
  title: string
  items: Resource[]
}

const CATEGORIES: Category[] = [
  {
    icon: '🏛️',
    title: 'Trámites y gobierno',
    items: [
      { label: 'DigiD', url: 'https://www.digid.nl', desc: 'Tu firma digital para todos los trámites online del gobierno' },
      { label: 'MijnOverheid', url: 'https://mijn.overheid.nl', desc: 'Portal personal del gobierno neerlandés — cartas, datos, DigiD' },
      { label: 'Belastingdienst', url: 'https://www.belastingdienst.nl', desc: 'Hacienda holandesa — declaración de impuestos, toeslagen' },
      { label: 'Toeslagen', url: 'https://www.belastingdienst.nl/toeslagen', desc: 'Solicitar zorgtoeslag, huurtoeslag y otras ayudas del gobierno' },
      { label: 'SVB', url: 'https://www.svb.nl', desc: 'Seguridad Social: AOW, pensiones, prestaciones familiares' },
      { label: 'UWV', url: 'https://www.uwv.nl', desc: 'Seguro de desempleo (WW), búsqueda de empleo, WIA' },
      { label: 'Overheid.nl', url: 'https://www.overheid.nl', desc: 'Portal oficial del gobierno — localiza tu ayuntamiento' },
    ],
  },
  {
    icon: '💼',
    title: 'Trabajo y derechos laborales',
    items: [
      { label: 'Werk.nl', url: 'https://www.werk.nl', desc: 'Portal oficial de empleo del UWV — vacantes y orientación' },
      { label: 'Arboportaal', url: 'https://www.arboportaal.nl', desc: 'Condiciones de trabajo, derechos laborales, seguridad' },
      { label: 'FNV', url: 'https://www.fnv.nl', desc: 'El sindicato más grande de los Países Bajos' },
      { label: 'Paycheck.nl', url: 'https://www.paycheck.nl', desc: 'Calculadora de nómina — comprueba si te están pagando bien' },
      { label: 'Mijnpensioenoverzicht', url: 'https://www.mijnpensioenoverzicht.nl', desc: 'Resumen de toda tu pensión acumulada en NL (requiere DigiD)' },
    ],
  },
  {
    icon: '🏠',
    title: 'Vivienda',
    items: [
      { label: 'Funda', url: 'https://www.funda.nl', desc: 'El portal de pisos más grande — compra y alquiler' },
      { label: 'Pararius', url: 'https://www.pararius.nl', desc: 'Alquiler de pisos, enfocado en particulares y agencias' },
      { label: 'Kamernet', url: 'https://kamernet.nl', desc: 'Habitaciones en pisos compartidos — muy usado por recién llegados' },
      { label: 'Woningnet', url: 'https://www.woningnet.nl', desc: 'Vivienda social — regístrate cuanto antes, las listas de espera son largas' },
      { label: 'Huurcommissie', url: 'https://www.huurcommissie.nl', desc: 'Organismo oficial para disputas sobre alquiler y precios' },
    ],
  },
  {
    icon: '🏥',
    title: 'Salud',
    items: [
      { label: 'Zorgwijzer', url: 'https://www.zorgwijzer.nl', desc: 'Comparador de seguros médicos — encuentra el más barato' },
      { label: 'Independer', url: 'https://www.independer.nl', desc: 'Comparador de seguros, hipotecas y finanzas personales' },
      { label: 'Thuisarts.nl', url: 'https://www.thuisarts.nl', desc: 'Información médica fiable en neerlandés — antes de ir al médico' },
      { label: 'Huisartsenpost', url: 'https://www.huisartsenpost.nl', desc: 'Urgencias fuera de horario del médico de cabecera' },
    ],
  },
  {
    icon: '🚆',
    title: 'Transporte',
    items: [
      { label: 'NS Reisplanner', url: 'https://www.ns.nl', desc: 'Trenes holandeses — planificador, billetes y abonos' },
      { label: '9292', url: 'https://9292.nl', desc: 'Planificador multimodal (tren + metro + bus + tranvía)' },
      { label: 'OV-chipkaart', url: 'https://www.ov-chipkaart.nl', desc: 'Gestiona tu tarjeta de transporte público, recarga saldo' },
      { label: 'ANWB', url: 'https://www.anwb.nl', desc: 'Automovilismo, seguro de coche y asistencia en carretera' },
    ],
  },
  {
    icon: '🏦',
    title: 'Banca y finanzas',
    items: [
      { label: 'Nibud', url: 'https://www.nibud.nl', desc: 'Asesoramiento financiero gratuito del gobierno — presupuestos, deudas' },
      { label: 'Geldzaken', url: 'https://www.geldzaken.nl', desc: 'Portal del gobierno sobre finanzas personales y ahorro' },
      { label: 'Bunq', url: 'https://www.bunq.com', desc: 'Banco digital que no requiere BSN para empezar — útil al llegar' },
      { label: 'Wise', url: 'https://wise.com', desc: 'Transferencias internacionales baratas — enviar dinero a España o LatAm' },
    ],
  },
  {
    icon: '📱',
    title: 'Apps imprescindibles',
    items: [
      { label: 'DigiD app', url: 'https://www.digid.nl/app', desc: 'La app oficial de DigiD — más segura que el SMS' },
      { label: 'NS app', url: 'https://www.ns.nl/app', desc: 'Trenes en tiempo real, billetes y compensación por retrasos' },
      { label: 'OV-chipkaart app', url: 'https://www.ov-chipkaart.nl/app', desc: 'Consulta tu saldo y movimientos de la tarjeta de transporte' },
      { label: 'Google Translate', url: 'https://translate.google.com', desc: 'Traduce documentos, fotos y conversaciones al momento' },
      { label: 'Duolingo Neerlandés', url: 'https://www.duolingo.com', desc: 'La forma más fácil de empezar a aprender neerlandés' },
    ],
  },
]

export default function RecursosPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ color: '#f97316', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            RECURSOS · HERRAMIENTAS OFICIALES
          </p>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 900, color: '#2dd4bf', lineHeight: 1.2, marginBottom: 10 }}>
            Recursos útiles para vivir en Países Bajos
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0, maxWidth: 560 }}>
            Links directos a portales oficiales, apps y herramientas. Sin rodeos.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px', display: 'flex', flexDirection: 'column', gap: 40 }}>
        {CATEGORIES.map((cat) => (
          <div key={cat.title}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
              <h2 style={{ color: 'var(--text)', fontSize: '1rem', fontWeight: 800, margin: 0 }}>{cat.title}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
              {cat.items.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ color: '#2dd4bf', fontSize: '0.88rem', fontWeight: 700 }}>{item.label}</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>↗</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                </a>
              ))}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', textAlign: 'center', marginTop: 8 }}>
          <p style={{ color: 'var(--text-subtle)', fontSize: '0.82rem', marginBottom: 12 }}>
            ¿Echas en falta algún recurso? Escríbenos.
          </p>
          <a
            href="mailto:holandafacil.info@gmail.com"
            style={{ color: '#f97316', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}
          >
            holandafacil.info@gmail.com →
          </a>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href={`/${locale}/guias`} style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', textDecoration: 'none' }}>
            ← Volver a las guías
          </Link>
        </div>
      </div>
    </main>
  )
}
