export type GuiaSeoType = 'HowTo' | 'Article'

export const guiaSeo: Record<string, { description: string; schemaType: GuiaSeoType }> = {
  bsn: {
    description: 'El BSN es el número de identificación que necesitas para trabajar y vivir en Países Bajos. Cómo obtenerlo por registro municipal o RNI, paso a paso.',
    schemaType: 'HowTo',
  },
  inschrijving: {
    description: 'El registro municipal en NL es obligatorio si te quedas más de 4 meses. Sin él pierdes el acceso a subsidios y servicios del gobierno. Guía paso a paso.',
    schemaType: 'HowTo',
  },
  carnet: {
    description: 'Si tienes carnet de la UE, sigue siendo válido en NL. Si vienes de fuera, tienes 185 días para conducir con él antes de tramitar el canje. Guía completa.',
    schemaType: 'HowTo',
  },
  trabajo: {
    description: 'Cómo funcionan las ETTs en Países Bajos: fases del contrato, tus derechos desde el primer día y los abusos más documentados contra trabajadores migrantes.',
    schemaType: 'Article',
  },
  vivienda: {
    description: 'El mercado de alquiler en NL es caro y competitivo. Precios reales por ciudad, nueva ley de alquileres de 2024 y las estafas más frecuentes contra migrantes.',
    schemaType: 'Article',
  },
  sanidad: {
    description: 'El seguro médico es obligatorio en NL y lo pagas tú. Cuánto cuesta, cuánto recuperas con el zorgtoeslag y cómo elegir la mejor aseguradora.',
    schemaType: 'Article',
  },
  bancos: {
    description: 'Qué bancos aceptan extranjeros recién llegados en NL, cómo abrir cuenta sin BSN y por qué necesitas un IBAN neerlandés para cobrar y pagar.',
    schemaType: 'HowTo',
  },
  visados: {
    description: 'Guía completa de visados y permisos para vivir y trabajar en Países Bajos: UE, Kennismigrant, GVVA, Blue Card, Zoekjaar y MVV explicados.',
    schemaType: 'Article',
  },
  toeslagen: {
    description: 'El gobierno holandés ofrece ayudas para seguro médico, alquiler y guardería. No son automáticas: cómo solicitarlas y cuánto te corresponde en 2026.',
    schemaType: 'Article',
  },
  'fiscal-holanda': {
    description: 'Fiscalidad en Países Bajos: el sistema de tres cajas, la 30% ruling para expatriados, cómo hacer la declaración de la renta y la doble imposición.',
    schemaType: 'Article',
  },
  inburgering: {
    description: 'El proceso de integración cívica en NL: quién está obligado, niveles de holandés exigidos, coste del examen y requisitos para la residencia permanente.',
    schemaType: 'HowTo',
  },
  zzp: {
    description: 'Cómo darte de alta como autónomo ZZP en NL, deducciones disponibles y los riesgos reales: sin prestación por desempleo, sin baja pagada, sin pensión de empresa.',
    schemaType: 'Article',
  },
  pensiones: {
    description: 'Los tres pilares del sistema de pensiones en NL: AOW pública, pensión de empresa y pensión privada. Cómo se acumula y qué pasa si te vas del país.',
    schemaType: 'Article',
  },
  digid: {
    description: 'DigiD es la firma digital oficial con la que accedes a todos los trámites online del gobierno neerlandés. Cómo solicitarla y activarla paso a paso.',
    schemaType: 'HowTo',
  },
  transporte: {
    description: 'Cómo usar el transporte público en NL: OV-chipkaart, abonos con descuento, apps de planificación y todo lo que necesitas para ir al trabajo en tren.',
    schemaType: 'Article',
  },
  ww: {
    description: 'La prestación por desempleo en NL cubre hasta el 75% de tu salario. Quién tiene derecho, cuánto dura, cuánto se cobra y cómo solicitarla al UWV.',
    schemaType: 'Article',
  },
}
