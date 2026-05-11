export type Section = {
  heading: string
  content: string
}

export type Faq = {
  q: string
  a: string
}

export type Guide = {
  slug: string
  title: string
  description: string
  icon: string
  sections: Section[]
  faqs?: Faq[]
}

export const guides: Guide[] = [
  {
    slug: 'bsn',
    title: 'BSN: tu número de identificación en Países Bajos',
    description: 'El Burger Service Nummer es el número de 9 dígitos que necesitas para casi todo en NL. Dos vías para obtenerlo: a través del registro municipal o a través de la ETT vía RNI.',
    icon: '🪪',
    sections: [
      {
        heading: '¿Qué es el BSN?',
        content: `El BSN (Burger Service Nummer) es un número único de identificación de 9 dígitos que el gobierno neerlandés asigna a toda persona que vive o trabaja en los Países Bajos. Es el equivalente neerlandés al número de identificación de tu país de origen, pero aquí es imprescindible para prácticamente todo.

Sin BSN no puedes trabajar legalmente, abrir una cuenta bancaria neerlandesa, contratar el seguro médico obligatorio, solicitar ayudas del gobierno ni declarar impuestos.

Hay dos vías oficiales para obtenerlo: el registro municipal (inschrijving, para quienes tienen domicilio fijo) y el RNI (Registratie Niet-Ingezetenen, para quienes empiezan a trabajar sin domicilio fijo aún). Ambas son completamente legales y dan el mismo BSN.`,
      },
      {
        heading: 'Para qué necesitas el BSN',
        content: `El BSN es imprescindible para:

• Trabajar legalmente (el empleador lo necesita para la nómina y los impuestos)
• Abrir una cuenta bancaria en ING, Rabobank o ABN AMRO
• Contratar el seguro médico obligatorio (zorgverzekering)
• Registrarte con un médico de cabecera (huisarts)
• Solicitar el zorgtoeslag (ayuda del gobierno para pagar el seguro médico)
• Declarar impuestos ante la Belastingdienst
• Obtener el DigiD (firma digital neerlandesa, necesaria para casi todos los trámites online)`,
      },
      {
        heading: 'Vía 1: registro municipal (inschrijving)',
        content: `Si ya tienes una dirección fija donde vas a vivir en NL, te registras directamente en el municipio (gemeente). Al hacerlo quedas inscrito en el BRP (Basisregistratie Personen) y recibes el BSN.

Pasos:
1. Localiza tu ayuntamiento en overheid.nl
2. Solicita cita previa (la mayoría de municipios lo requieren)
3. Acude con tu pasaporte o DNI y prueba de domicilio (contrato de alquiler, carta del propietario, etc.)
4. Si vives en casa de alguien, esa persona debe darte una carta firmada autorizando el registro en su dirección
5. Recibes el BSN ese mismo día o por carta en 5-10 días hábiles

Esta vía es la que da acceso completo a todos los servicios municipales, subsidios y prestaciones. Si vas a estar más de 4 meses en NL, es la que debes usar.`,
      },
      {
        heading: 'Vía 2: RNI a través de la ETT (sin domicilio fijo)',
        content: `El RNI (Registratie Niet-Ingezetenen) está pensado para personas que trabajan en NL pero todavía no tienen domicilio fijo, o que van a estar menos de 4 meses. Es la vía habitual para trabajadores que llegan a través de una [ETT](/ett) antes de tener vivienda estable.

El proceso:
1. Pide cita online en uno de los 19 municipios con punto RNI (ver sección siguiente)
2. Rellena el formulario online, que genera un código QR para llevar a la cita
3. Acude en persona con tu pasaporte o DNI y tu dirección en el país de origen
4. El BSN te lo entregan ese mismo día en la cita

Importante: nadie puede registrarse en tu nombre. Ni la ETT ni ninguna otra persona. Debes ir tú en persona. Las citas pueden tardar de pocos días a 2-3 semanas dependiendo del municipio. El trámite es gratuito.

Atención: si vas a estar más de 4 meses en NL, el RNI es solo un primer paso. Deberás hacer igualmente el inschrijving municipal en cuanto tengas domicilio estable, para acceder a la totalidad de derechos y prestaciones.`,
      },
      {
        heading: 'Municipios con punto RNI',
        content: `Estos son los 19 municipios con punto RNI (datos 2024-2025):

Alkmaar, Almelo, Amsterdam, Breda, Den Haag (La Haya), Doetinchem, Eindhoven, Goes, Groningen, Heerlen, Leeuwarden, Leiden, Nijmegen, Rotterdam, Terneuzen, Utrecht, Venlo, Westland (Naaldwijk) y Zwolle.

Consulta las instrucciones específicas de cada municipio en rni.nl, ya que los requisitos y el sistema de citas varían.

Cambio importante desde enero de 2026: los ciudadanos de fuera de la UE/EEE/Suiza solo pueden registrarse en los puntos RNI de Breda y Venlo. El resto de los 17 municipios quedaron restringidos a ciudadanos UE, EEE y Suiza. Si eres ciudadano de fuera de la UE/EEE/Suiza, asegúrate de ir a Breda o Venlo.`,
      },
      {
        heading: 'Las ETTs y el registro: lo que debes saber',
        content: `Una ETT legítima debe facilitarte el proceso de registro, darte tiempo para acudir a la cita y proporcionar documentación de apoyo si es necesario.

Sin embargo, hay agencias que dificultan o impiden activamente el registro. Las tácticas documentadas incluyen: no informar al trabajador de su derecho a registrarse, incluir cláusulas contractuales que lo prohíben, amenazar con el despido si intentas registrarte, o proporcionar una dirección de alojamiento que el municipio no puede procesar.

El motivo es económico: un trabajador no registrado no puede solicitar el zorgtoeslag ni el huurtoeslag (ayudas del gobierno), y es menos visible para la inspección de trabajo.

Si tu ETT te dificulta o impide registrarte, es una señal de alerta grave. Puedes llamar a FairWork Netherlands (tel. +31 20 223 44 44, fairwork.nu), una organización que asesora gratuitamente a trabajadores migrantes en varios idiomas.`,
      },
    ],
    faqs: [
      {
        q: '¿Cuánto tarda en llegar el BSN?',
        a: 'Por vía RNI lo recibes el mismo día de la cita. Por registro municipal puede tardar entre 5 y 10 días hábiles.',
      },
      {
        q: '¿Puede la ETT tramitar el BSN por mí?',
        a: 'No. Nadie puede registrarse en tu nombre. Debes ir tú en persona a la cita, ya sea por vía RNI o por registro municipal.',
      },
      {
        q: '¿El BSN caduca?',
        a: 'No. El BSN es permanente, no vence ni cambia aunque cambies de municipio, de trabajo o incluso de nacionalidad.',
      },
    ],
  },
  {
    slug: 'inschrijving',
    title: 'Registro municipal (Inschrijving gemeente)',
    description: 'El inschrijving es el registro en el padrón del municipio donde vives. Es obligatorio si te quedas más de 4 meses. Sin él pierdes el acceso a subsidios y servicios.',
    icon: '🏛️',
    sections: [
      {
        heading: '¿Qué es y por qué es obligatorio?',
        content: `El inschrijving es el registro en el padrón municipal (BRP, Basisregistratie Personen) del ayuntamiento donde resides. Por ley, cualquier persona que vaya a vivir en los Países Bajos durante más de 4 meses debe registrarse en un plazo de 5 días desde que establece su dirección.

El registro es la puerta de entrada a todos los demás trámites: sin él no puedes obtener el DigiD (firma digital neerlandesa), no accedes al zorgtoeslag ni al huurtoeslag, y tienes acceso limitado a muchos servicios públicos. También es tu dirección oficial para toda la correspondencia del gobierno neerlandés.

El registro es gratuito.`,
      },
      {
        heading: 'Inschrijving con y sin dirección fija',
        content: `Con dirección fija (la situación habitual):
Te registras en la dirección donde vives. El propietario debe autorizarlo: puede darte una carta firmada o estar presente en el trámite. Este registro completo da acceso a todos los servicios y subsidios.

Sin dirección fija (briefadres) — situación habitual al llegar a través de una [ETT](/ett):
Si no tienes alojamiento estable, puedes solicitar un briefadres (domicilio de correspondencia). Desde el 1 de enero de 2022, todos los municipios tienen la obligación legal de proporcionar un briefadres a quien lo necesite. Si no encuentras a nadie que te ceda su dirección, el propio municipio debe darte el suyo como briefadres temporal.

El briefadres tiene una validez de hasta 6 meses. Te permite recibir correspondencia oficial y obtener el BSN, pero el acceso a algunos subsidios (como el huurtoeslag) es limitado. En cuanto tengas domicilio estable, haz el registro completo.`,
      },
      {
        heading: 'Paso a paso',
        content: `1. Busca el gemeente de tu ciudad en gemeenten.nl
2. Solicita cita (imprescindible en la mayoría de municipios)
3. Reúne los documentos: pasaporte o DNI, prueba de alojamiento, y si vives en casa ajena, carta firmada por el propietario autorizando el registro
4. Acude a la cita y rellena los formularios con ayuda del funcionario
5. Recibes confirmación del registro. El BSN lo obtienes automáticamente si es tu primera vez en el sistema neerlandés

El trámite dura entre 15 y 30 minutos una vez en la ventanilla.`,
      },
      {
        heading: '¿Qué pasa si no te registras?',
        content: `No registrarse tiene consecuencias prácticas y legales:

• No puedes obtener DigiD ni acceder a la mayoría de servicios online del gobierno
• No puedes solicitar el zorgtoeslag, el huurtoeslag ni otras ayudas
• El empleador puede tener dificultades para procesar correctamente tu nómina y retenciones fiscales
• Estás fuera del sistema oficial aunque trabajes legalmente
• El municipio puede imponerte una multa de hasta 325 € por no estar registrado o por declarar una dirección incorrecta

Si llevas tiempo sin registrarte, hazlo cuanto antes. Los municipios suelen ser comprensivos cuando el trabajador da el paso voluntariamente.`,
      },
    ],
  },
  {
    slug: 'carnet',
    title: 'Carnet de conducir en Países Bajos',
    description: 'Si tienes carnet de un país de la UE, sigue siendo válido en NL directamente. Si vienes de fuera de la UE, tienes 185 días para conducir con tu carnet y luego debes tramitar el canje.',
    icon: '🚗',
    sections: [
      {
        heading: 'Si tienes carnet de la UE',
        content: `Si tu carnet fue expedido en un país de la Unión Europea, puedes conducir en los Países Bajos directamente sin ningún trámite adicional. Tu carnet es válido mientras esté en vigor.

Si te conviertes en residente, el carnet UE es válido durante 15 años desde la fecha de expedición original. Cuando caduque, puedes canjearlo por un carnet neerlandés: el trámite se hace en tu ayuntamiento (gemeente), que lo envía al RDW (la autoridad que emite los carnets). No acudas directamente al RDW; el punto de entrada es siempre el gemeente. El trámite cuesta aproximadamente 51 €.`,
      },
      {
        heading: 'Si vienes de fuera de la UE',
        content: `Los carnets expedidos fuera de la UE solo son válidos para conducir durante los primeros 185 días desde que estableces residencia en NL. Pasado ese plazo, necesitas un carnet neerlandés.

Países con acuerdo de canje (no hace falta examen):
Andorra, Gibraltar, Guernsey, Jersey, Isla de Man, Israel, Japón, Mónaco, Singapur, Corea del Sur, Taiwán, Reino Unido, Aruba, Curaçao, Sint Maarten.

Para Canadá: solo las provincias de Alberta y Quebec tienen acuerdo, y solo para la categoría B.

Para el resto de países (sin acuerdo de canje): debes superar los exámenes teórico y práctico del CBR. El examen práctico neerlandés es exigente.

Excepción: si tienes la "30% ruling" (régimen para trabajadores altamente cualificados), puedes canjear cualquier carnet extranjero sin examen.

El canje siempre se solicita en tu gemeente, no en el RDW ni en el CBR directamente. El CBR es quien hace los exámenes; el RDW emite el carnet; el gemeente es donde presentas la solicitud.`,
      },
      {
        heading: 'Proceso de canje paso a paso',
        content: `1. Regístrate en el gemeente (inschrijving), requisito previo
2. Consigue tu BSN y, cuando puedas, el DigiD (digid.nl)
3. Acude al gemeente con: tu carnet extranjero, foto de carnet, pasaporte o DNI
4. Si el carnet está en un alfabeto no latino (árabe, cirílico, etc.), necesitas también una traducción certificada
5. Para carnets de países sin acuerdo de canje, el gemeente también necesita un formulario médico del CBR
6. El gemeente envía la solicitud al RDW
7. Recibes el carnet neerlandés en aproximadamente 20 días hábiles`,
      },
    ],
  },
  {
    slug: 'trabajo',
    title: 'Cómo funciona el trabajo en Países Bajos',
    description: 'Las ETTs dominan el mercado laboral para recién llegados. Esta guía explica cómo funcionan las fases del contrato, cuáles son tus derechos reales y qué abusos están documentados.',
    icon: '💼',
    sections: [
      {
        heading: 'El papel de las ETTs (uitzendbureau)',
        content: `Los Países Bajos tienen uno de los mercados de trabajo temporal más grandes de Europa. Las [uitzendbureau (ETTs)](/ett) dominan sectores como logística, alimentación, construcción y limpieza, y son la puerta de entrada habitual para recién llegados.

Hay dos convenios colectivos principales en el sector: el CAO ABU (Algemene Bond Uitzendondernemingen, para agencias afiliadas a ABU) y el CAO NBBU (para agencias más pequeñas, muy presentes en agricultura y alimentación). Ambos son legalmente vinculantes y establecen derechos similares, aunque con denominaciones diferentes. Si tu ETT no puede decirte a qué CAO está acogida, es motivo de desconfianza.

Desde enero de 2024, el salario mínimo neerlandés es exclusivamente por hora (se eliminó el salario mínimo mensual y semanal). El salario mínimo legal (WML) es de 14,06 €/hora para mayores de 21 años desde enero de 2025, y sube a 14,40 €/hora a partir de julio de 2025. Se actualiza cada 6 meses.`,
      },
      {
        heading: 'Las fases del contrato (A, B, C)',
        content: `El convenio ABU establece tres fases para los trabajadores de ETT:

Fase A (máximo 52 semanas trabajadas en total con esa ETT)
Contrato con "uitzendbeding": si la empresa cliente cancela el encargo, el contrato termina automáticamente. La ETT solo paga las horas efectivamente trabajadas (salvo pacto en contrario). Si hay una interrupción superior a 6 meses, el contador de la Fase A se reinicia.

Importante: desde julio de 2023, la ETT no puede rescindirte el contrato si estás de baja por enfermedad, aunque estés en Fase A.

Fase B (máximo 3 años, máximo 6 contratos temporales)
El uitzendbeding ya no se aplica. Si la empresa cliente cancela el encargo, la ETT debe seguir pagándote y buscarte otro trabajo. Mayor estabilidad y protección.

Fase C (contrato indefinido)
Tras completar la Fase A y la Fase B sin interrupciones superiores a 6 meses, la ETT debe ofrecerte un contrato indefinido. A partir de aquí tienes los mismos derechos laborales que cualquier trabajador ordinario y solo pueden despedirte por causas legales formales.`,
      },
      {
        heading: 'Tus derechos desde el primer día',
        content: `Independientemente de la fase en que estés, tienes derecho a:

• Salario mínimo legal por hora (14,06 €/h desde enero de 2025; 14,40 €/h desde julio de 2025 para mayores de 21)
• Inlenersbeloning: desde el primer día tienes derecho al mismo salario base que los trabajadores fijos de la empresa cliente que hacen el mismo trabajo
• Paga de vacaciones: mínimo un 8% del salario bruto anual
• Vacaciones: mínimo 20 días anuales con jornada completa
• Cotizaciones a la seguridad social desde el primer día
• Acumulación de pensión desde los 18 años
• Derecho a revisar y entender el contrato antes de firmarlo

Si tu nómina tiene descuentos que no entiendes o el salario no coincide con las horas trabajadas, pide explicación por escrito. Tienes derecho a un recibo de salario detallado.`,
      },
      {
        heading: 'Abusos documentados: lo que ocurre en la práctica',
        content: `Las autoridades neerlandesas (Arbeidsinspectie), el sindicato FNV y medios de investigación (Follow the Money, Pointer/KRO-NCRV) han documentado sistemáticamente los siguientes abusos, especialmente contra trabajadores migrantes:

Contratos fraudulentos: se recluta en el país de origen con promesas verbales o por WhatsApp (estabilidad, 2.200 €/mes, buenas condiciones). Al llegar a NL se presenta un contrato en neerlandés con cláusulas de cero horas y uitzendbeding, bajo presión para firmar inmediatamente.

Robo de salario: descuentos de vivienda, transporte y "seguros" a precios inflados, sin nóminas detalladas. Hay casos documentados donde el trabajador recibe 0 € después de descuentos.

Vivienda como trampa: la ETT aloja al trabajador en bungalows de parques de vacaciones o pisos sobrepoblados, cobra 400-800 €/mes por persona (descontado del salario), y vincula el contrato de vivienda al contrato laboral. Un tribunal neerlandés dictaminó en octubre de 2025 (caso Kevin Victor vs. OTTO Work Force) que esta vinculación de contrato de trabajo y alquiler es ilegal.

Obstaculización del registro: muchas ETTs impiden deliberadamente que el trabajador se registre en el municipio, porque un trabajador registrado puede solicitar el zorgtoeslag y el huurtoeslag, y es más visible para la inspección de trabajo. Las tácticas incluyen prohibiciones contractuales y amenazas de despido. Esto es ilegal.

Pérdida simultánea de trabajo y vivienda: cuando la ETT cancela el contrato, el trabajador pierde al mismo tiempo su empleo y su alojamiento.

Si sufres alguna de estas situaciones, puedes contactar con:
• FairWork Netherlands: +31 20 223 44 44 / fairwork.nu (gratis, en varios idiomas)
• FNV (sindicato): fnv.nl
• La Arbeidsinspectie (inspección de trabajo): nlarbeidsinspectie.nl`,
      },
      {
        heading: 'Novedades legales 2025-2027',
        content: `Ley WTTA (aprobada noviembre de 2025): exige que todas las agencias de trabajo temporal obtengan una certificación oficial. Las agencias no certificadas no podrán operar. Entra en vigor el 1 de enero de 2027, con pleno cumplimiento obligatorio desde 2028. Está diseñada para eliminar las agencias fraudulentas.

Nuevo CAO 2026-2028 (efectivo 1 enero 2026): la Fase B se acortará a máximo 2 años (cuando entre en vigor la ley habilitante, prevista para 2027). El período de interrupción que reinicia las fases pasa de 6 meses a 60 meses (5 años), lo que hace mucho más difícil que las agencias "reseteen" el contador.

Cómo buscar trabajo fuera de las ETTs:
• Indeed.nl y Nationale Vacaturebank (nvb.nl): los dos portales más usados
• LinkedIn: muy activo en NL; empresas responden mensajes directos
• Werkenbijdebuurman.nl: empleos de proximidad`,
      },
    ],
  },
  {
    slug: 'vivienda',
    title: 'Encontrar vivienda en Países Bajos',
    description: 'El mercado de alquiler en NL es caro y competitivo. Esta guía explica la nueva regulación de alquileres de 2024, los precios reales por ciudad y las estafas más habituales.',
    icon: '🏠',
    sections: [
      {
        heading: 'Precios reales de alquiler (2024-2025)',
        content: `El mercado de alquiler neerlandés es uno de los más caros de Europa. Estos son los precios del sector privado según datos de Pararius, Kamernet y Kamer.nl (Q4 2024 / Q1 2025):

Habitación en piso compartido (kamer):
• Amsterdam: 900-1.200 €/mes
• Utrecht: 700-1.000 €/mes
• Rotterdam: 550-850 €/mes
• Den Haag: 520-830 €/mes
• Eindhoven: 430-720 €/mes
• Media nacional: 705 €/mes

Apartamento de 1 dormitorio:
• Amsterdam: 1.600-2.200 €/mes
• Utrecht: 1.400-1.700 €/mes
• Rotterdam: 1.200-1.550 €/mes
• Den Haag: 1.100-1.450 €/mes
• Eindhoven: 1.050-1.350 €/mes

Eindhoven y las ciudades fuera del Randstad ofrecen precios notablemente más bajos. Si tu trabajo es en la zona de Rotterdam y puedes asumir desplazamiento, ciudades como Schiedam o Dordrecht son más asequibles.`,
      },
      {
        heading: 'La nueva ley de alquileres (Wet betaalbare huur, 2024)',
        content: `Desde el 1 de julio de 2024 existe una nueva regulación que divide el mercado de alquiler en tres segmentos según un sistema de puntos (WWS, Woningwaarderingsstelsel):

Vivienda social (0-143 puntos WWS): alquiler máximo 900 €/mes (datos enero 2025). Regulado desde hace décadas.

Segmento medio (144-186 puntos): alquiler máximo 1.185 €/mes. Regulado por primera vez desde julio de 2024. Los nuevos contratos firmados desde esa fecha quedan protegidos automáticamente.

Sector libre (187+ puntos): sin límite máximo. El alquiler lo fija el arrendador.

Desde el 1 de enero de 2025, los propietarios están obligados a entregarte el cálculo de puntos WWS de la vivienda con el contrato. Si no lo hacen, puedes solicitarlo y reclamar ante la Huurcommissie (huurcommissie.nl) en los 6 meses siguientes a la firma.

Importante: la ley protege nuevos contratos. Si tu contrato es anterior a julio de 2024 y está en el segmento medio, el alquiler no se reduce automáticamente.

Subidas anuales máximas 2025:
• Vivienda social: 5%
• Segmento medio: 7,7%
• Sector libre: 4,1%`,
      },
      {
        heading: 'Vivienda social (sociale huur)',
        content: `Las viviendas sociales son gestionadas por corporaciones (woningcorporaties) y tienen alquileres regulados, generalmente por debajo de 900 €/mes. El problema es la lista de espera.

En Amsterdam: 10-15 años de espera para la mayoría de viviendas. En barrios populares puede superar los 20 años. En ciudades medianas: 3-7 años.

Para inscribirte necesitas BSN, domicilio registrado en NL e ingresos por debajo del límite social (aproximadamente 47.000 €/año para una persona). Plataformas: WoningNet (woningnet.nl) para la zona de Amsterdam y Utrecht; otras ciudades tienen portales propios.

La realidad para los recién llegados: la vivienda social no es una opción a corto plazo. La mayoría tiene que entrar al mercado privado o través del alojamiento que ofrecen las ETTs (con los riesgos que esto conlleva).`,
      },
      {
        heading: 'Las estafas más habituales',
        content: `El mercado de vivienda neerlandés tiene estafas frecuentes. Las más documentadas que afectan a trabajadores migrantes:

Anuncios falsos (phantom listings):
Los estafadores copian anuncios reales de Pararius o Funda y crean versiones falsas con un precio atractivo. El "propietario" dice estar en el extranjero, pide una fianza o el primer mes antes de enseñar el piso, y desaparece con el dinero. En 2024 el fraude en alquiler creció un 18% respecto al año anterior, siendo los trabajadores extranjeros el grupo más afectado. Señales de alerta: precio por debajo del mercado, propietario que no puede enseñar el piso en persona, presión para decidir rápido, solicitud de pago por Tikkie, PayPal o criptomonedas.

Vivienda de ETT vinculada al contrato laboral:
Es el abuso más extendido y grave para trabajadores migrantes. La ETT ofrece alojamiento en parques de vacaciones o pisos compartidos por 400-800 €/mes por persona (descontado del salario), vinculando el contrato de trabajo y el alquiler. Si pierdes el trabajo, pierdes también el techo ese mismo día. Un tribunal neerlandés declaró ilegal esta vinculación en octubre de 2025. Puedes reclamar en los tribunales con ayuda de FairWork.

Subarriendo ilegal de vivienda social:
Hay personas que alquilan una vivienda social a precio regulado y la subarrienden a trabajadores migrantes a precios de mercado. El trabajador no tiene contrato oficial y puede ser desahuciado inmediatamente sin recursos legales.

Nunca pagues una fianza sin contrato firmado. Verifica que la empresa arrendadora existe en kvk.nl.`,
      },
      {
        heading: 'Dónde buscar vivienda de forma segura',
        content: `Portales con garantías:
• Funda.nl: el portal más grande. Agencias legítimas publican aquí
• Pararius.nl: enfocado al sector privado, buena oferta
• Kamernet.nl: especializado en habitaciones y pisos compartidos
• Huurwoningen.nl: buena oferta en ciudades medianas
• WoningNet.nl: para vivienda social

Tus derechos como inquilino:
• La fianza máxima legal es 2 meses de alquiler
• Desde 2021, el arrendador no puede cobrarte comisión de agencia (es ilegal)
• El contrato debe ser por escrito
• El arrendador no puede entrar en tu domicilio sin previo aviso
• Tienes derecho a pedir el cálculo de puntos WWS para contratos nuevos

La Huurcommissie (huurcommissie.nl) resuelve disputas entre arrendador e inquilino de forma gratuita o por tarifa reducida.`,
      },
    ],
  },
  {
    slug: 'sanidad',
    title: 'El sistema sanitario neerlandés',
    description: 'El seguro médico es obligatorio en NL y lo contratas y pagas tú. Esta guía explica cuánto cuesta realmente, la ayuda del gobierno para pagarlo y cómo funciona el sistema.',
    icon: '🏥',
    sections: [
      {
        heading: 'El zorgverzekering: seguro médico obligatorio',
        content: `En los Países Bajos, contratar un seguro médico básico (basisverzekering) es obligatorio para todos los residentes y para quien trabaje aquí. La obligación empieza desde el primer día de trabajo o de residencia, no cuando te registras en el gemeente.

Tienes 4 meses para contratarlo desde que adquieres la obligación. Si no lo haces, el gobierno puede asignarte uno automáticamente y enviarte una notificación de incumplimiento.

Cada año, en noviembre-diciembre, puedes cambiar de aseguradora para el año siguiente sin penalización. Aprovecha ese período para comparar precios.`,
      },
      {
        heading: 'Cuánto cuesta en 2026',
        content: `La prima varía según la aseguradora y se actualiza cada año. Todas las aseguradoras están obligadas por ley a ofrecer exactamente la misma cobertura básica, por lo que el precio es el único criterio de diferenciación. Consulta las primas actualizadas en zorgwijzer.nl o independer.nl antes de contratar.

El eigen risico (franquicia obligatoria) es de 385 € anuales en 2026. Es el importe que pagas de tu bolsillo antes de que el seguro cubra los costes. Importante: las consultas al médico de cabecera (huisarts) no consumen el eigen risico. Tampoco la maternidad.

Puedes voluntariamente aumentar el eigen risico hasta un máximo de 885 € a cambio de una prima mensual menor. Si gozas de buena salud y usas poco el sistema, puede ser interesante.

El paquete básico cubre: médico de cabecera, hospitalización, especialistas (con derivación), medicamentos de la lista básica, maternidad y salud mental básica.`,
      },
      {
        heading: 'Zorgtoeslag: la ayuda del gobierno para pagar el seguro',
        content: `El zorgtoeslag es una subvención mensual de la Belastingdienst (hacienda neerlandesa) para ayudar a pagar el seguro médico. No es automática: tienes que solicitarla tú mismo en toeslagen.nl con tu DigiD.

Importes máximos 2026:
• Persona sola: hasta 129 €/mes (1.548 €/año)
• Con pareja/cónyuge: hasta 246 €/mes (2.952 €/año)

Límites de ingresos 2026 (ingresos brutos anuales):
• Persona sola: hasta ~40.857 €/año
• Con pareja: hasta ~51.142 €/año combinados

La mayoría de trabajadores de ETT que cobran el salario mínimo (aproximadamente 24.000-28.000 € brutos anuales) reciben cerca del importe máximo. Eso significa que el coste neto real del seguro médico puede ser de solo 13-50 €/mes después de la subvención.

Puedes solicitarla con hasta 1 año de retroactividad. Si tus ingresos cambian durante el año, actualiza la solicitud para evitar tener que devolver dinero a final de año.

Para solicitarla necesitas: BSN, DigiD, cuenta bancaria neerlandesa y el seguro médico contratado.`,
      },
      {
        heading: 'Cómo elegir aseguradora',
        content: `Las principales aseguradoras son Zilveren Kruis, VGZ, CZ, Menzis y DSW. Todas cubren lo mismo en el paquete básico.

Para comparar precios de forma neutral:
• Zorgwijzer.nl
• Independer.nl
• Pricewise.nl

Consejos:
• Si gozas de buena salud y usas poco el sistema, prioriza el precio más bajo
• Zilveren Kruis y VGZ tienen recursos en inglés; ONVZ es conocida por su atención en inglés
• Puedes añadir un seguro complementario (aanvullende verzekering) para dental, fisioterapia u otros`,
      },
      {
        heading: 'El médico de cabecera (huisarts)',
        content: `El huisarts es la puerta de entrada a todo el sistema sanitario. Para ver a cualquier especialista necesitas derivación del huisarts, salvo urgencias.

Inscríbete en un huisarts de tu barrio en cuanto tengas domicilio estable. No esperes a estar enfermo: la lista de espera para inscribirse puede ser de semanas en ciudades grandes.

Búscalos en zorgkaart.nl o pregunta a vecinos y compañeros. La atención es principalmente en neerlandés, pero muchos atienden también en inglés.

Para urgencias fuera del horario del huisarts (tardes, noches, fines de semana), existe la huisartsenpost (HAP), disponible 24 horas. Para emergencias graves: el número de emergencias es el 112.`,
      },
    ],
  },
  {
    slug: 'bancos',
    title: 'Abrir una cuenta bancaria en Países Bajos',
    description: 'En NL casi todo se paga con tarjeta o transferencia bancaria neerlandesa. Esta guía explica qué bancos son accesibles para recién llegados, cuáles tienen iDEAL y cuál es la estrategia más sencilla.',
    icon: '🏦',
    sections: [
      {
        heading: 'Por qué necesitas un banco neerlandés',
        content: `En los Países Bajos el efectivo es poco frecuente: la mayoría de supermercados, tiendas y transportes solo aceptan tarjeta de débito neerlandesa (PIN). El sistema de pago online dominante es iDEAL, que requiere una cuenta con IBAN neerlandés (empieza por NL).

Necesitas una cuenta neerlandesa para:
• Recibir tu salario (empleadores y ETTs pagan por transferencia bancaria)
• Pagar el alquiler por domiciliación
• Recibir el zorgtoeslag y otras ayudas del gobierno
• Pagar el seguro médico por domiciliación
• Hacer compras online en tiendas neerlandesas que usan iDEAL

Las cuentas de bancos de otros países de la UE funcionan para transferencias SEPA, pero no para iDEAL ni para muchas domiciliaciones locales.`,
      },
      {
        heading: 'Bunq: la opción más fácil antes de tener BSN',
        content: `Bunq es actualmente el banco online neerlandés más accesible para recién llegados. Puedes abrirla desde tu país antes de viajar, solo con tu pasaporte o DNI, completamente desde el móvil.

Bunq Free: 0 €/mes. Cuenta con IBAN neerlandés (NL), iDEAL y Tikkie funcionan desde el primer día. Genera un 2% anual de interés sobre el saldo.
Bunq Core: 3,99 €/mes, con funciones adicionales.

El BSN no es necesario para abrir la cuenta, pero tienes 90 días para añadirlo una vez que lo tengas. Si no lo añades en ese plazo, la cuenta queda restringida.

Es la opción recomendada para llegar ya con una cuenta operativa el primer día.`,
      },
      {
        heading: 'ING, Rabobank y ABN AMRO: los bancos tradicionales',
        content: `ING es el banco con más clientes en NL. Cuesta aproximadamente 3 €/mes. Para abrirla siendo extranjero necesitas BSN, dirección registrada en NL y prueba de que trabajas o resides aquí. Algunos usuarios reportan dificultades para abrirla sin historial previo en NL.

ABN AMRO: 4,30 €/mes, proceso relativamente ágil para extranjeros, buena app en inglés. Requiere dirección neerlandesa y BSN.

Rabobank: cooperativa muy presente en zonas rurales y en el sector agrícola y logístico. Proceso similar a ING.

Los tres dan un plazo de 90 días para añadir el BSN una vez abierta la cuenta.`,
      },
      {
        heading: 'Revolut y N26: lo que debes saber',
        content: `Revolut: desde 2024, Revolut emite IBANs neerlandeses (NL) para residentes en NL. Con IBAN neerlandés, iDEAL funciona correctamente. Es una opción viable como cuenta principal si ya tienes residencia en NL. No requiere BSN para abrir la cuenta.

N26: emite un IBAN no neerlandés (DE). Con ese IBAN, iDEAL no funciona. N26 sirve como cuenta de respaldo para pagos internacionales, pero no puede ser tu cuenta principal en NL.

Wise: no tiene IBAN neerlandés. Útil solo como alternativa para enviar dinero al extranjero con comisiones bajas.`,
      },
      {
        heading: 'Estrategia recomendada para recién llegados',
        content: `1. Antes de viajar: abre Bunq Free desde tu país de origen. Tendrás IBAN neerlandés e iDEAL desde el primer día, sin coste, sin BSN.

2. Al llegar: tramita el BSN (vía RNI si no tienes domicilio fijo aún) y añádelo a Bunq dentro de los 90 días.

3. Con BSN y registro en NL: si lo prefieres, abre una cuenta en ING o Rabobank para el largo plazo. Son más reconocidos por arrendadores y algunos empleadores más tradicionales.

4. Mantén Bunq o Revolut como cuenta secundaria para iDEAL y pagos internacionales.

No uses efectivo como solución habitual: en NL algunas transacciones clave (depósito de alquiler, pagos a la Belastingdienst) solo se hacen por transferencia bancaria.`,
      },
    ],
  },
  {
    slug: 'visados',
    title: 'Visados y permisos de residencia',
    description: 'Guía completa sobre permisos para vivir y trabajar en Países Bajos: diferencias UE vs extracomunitarios, Kennismigrant, GVVA, Blue Card, año de orientación y MVV.',
    icon: '🛂',
    sections: [
      {
        heading: 'Ciudadanos UE/EEE/Suiza: libertad de movimiento',
        content: `Si eres ciudadano de la Unión Europea, el EEE o Suiza, no necesitas visado ni permiso de residencia. Tu pasaporte o DNI europeo es suficiente para entrar, vivir y trabajar en los Países Bajos el tiempo que quieras.

Lo que sí debes hacer:
• Si te quedas más de 4 meses: registrarte en el gemeente (ayuntamiento) — ver guía de Inschrijving
• Contratar seguro médico en los primeros 4 meses
• No hay ningún trámite con el IND (servicio de inmigración) para ciudadanos UE

Después de 5 años de residencia continuada puedes solicitar un documento formal de residencia permanente al IND. No es obligatorio, pero refuerza tus derechos y facilita trámites.`,
      },
      {
        heading: 'Latinoamericanos: ¿necesitas visado para entrar?',
        content: `El visado Schengen de corta estancia te permite entrar como turista hasta 90 días en un período de 180, pero NO te permite trabajar.

Sin visado Schengen (hasta 90 días): México, Argentina, Chile, Colombia, Brasil, Perú, Costa Rica, Panamá, Uruguay, Paraguay, Honduras, Guatemala, El Salvador, Nicaragua, República Dominicana y otros.

SÍ necesitan visado Schengen: Venezuela, Cuba, Bolivia, Ecuador, Haití y otros. Solicitarlo en la embajada holandesa o VFS Global. Coste: ~80€. Plazo: 15-45 días.

ETIAS — previsto Q4 2026: La UE tiene previsto lanzar un sistema de autorización electrónica previa. Una vez activo, los viajeros de países visa-free necesitarán una autorización electrónica previa (~20€, válida 3 años). A mayo de 2026 no está todavía en vigor.

El visado de corta estancia (y el futuro ETIAS) no permite trabajar. Para trabajar, necesitas uno de los permisos siguientes.`,
      },
      {
        heading: 'Kennismigrant (HSM) — La vía más habitual para profesionales',
        content: `La visa de Migrante Altamente Cualificado (Kennismigrant o HSM) es la vía más habitual para extracomunitarios que vienen con una oferta de trabajo.

Ventajas:
• Tramitación rápida: 2-4 semanas con empleador reconocido por el IND
• No hay test del mercado laboral
• Tu pareja recibe permiso de trabajo abierto (puede trabajar para cualquier empleador)
• Acceso a la 30% ruling fiscal
• Camino directo a la residencia permanente tras 5 años

Requisitos salariales 2026 (bruto mensual, excluida paga de vacaciones del 8%):
• ≥30 años: 5.942€/mes brutos
• <30 años: 4.357€/mes brutos
• Recién graduados de universidad holandesa o top-200 mundial (dentro de los 3 años de graduación): 3.122€/mes brutos

No se exige título universitario específico — el salario es el único cualificador. No se exige nivel de neerlandés. El empleador debe ser IND Recognized Sponsor (compruébalo en el registro público de ind.nl).

Proceso:
1. Firmas el contrato con el empleador
2. El empleador presenta la solicitud al IND
3. Si necesitas MVV: la recoges en la embajada holandesa de tu país (~2-4 semanas)
4. Llegas a Holanda y te registras en el gemeente en los 5 días hábiles siguientes
5. Recoges tu tarjeta de residencia (verblijfsvergunning) en el IND

Coste: ~405€ de tasa IND (generalmente lo paga el empleador). Duración: hasta 5 años, renovable.`,
      },
      {
        heading: 'GVVA — Para puestos que no alcanzan el umbral HSM',
        content: `El permiso combinado de residencia y trabajo (GVVA) es para trabajadores extracomunitarios cuyo salario no alcanza el umbral del Kennismigrant.

Diferencias con el HSM:
• El empleador sí debe demostrar que no encontró candidatos UE disponibles (test de mercado laboral)
• La vacante debe haber estado abierta al menos 5 semanas
• Proceso más lento (hasta 90 días)
• Menos flexible al cambiar de empleador

El empleador inicia toda la tramitación ante el UWV (agencia de empleo) y el IND.`,
      },
      {
        heading: 'EU Blue Card y Zoekjaar (año de orientación)',
        content: `EU Blue Card: similar al Kennismigrant pero exige título universitario de al menos 3 años reconocido. Salario mínimo 2026: 5.942€/mes brutos. Ventaja específica: el tiempo acumulado con Blue Card en Holanda cuenta hacia la residencia permanente en otros países de la UE, útil si planeas moverte a otro país de la UE en el futuro.

Zoekjaar: si acabas de terminar estudios en una universidad holandesa (máster o doctorado) o en una de las top-200 mundiales (ranking ARWU), puedes solicitar 1 año de orientación para buscar empleo.
• Permiso de trabajo abierto durante ese año
• Debes solicitarlo dentro de los 3 años desde la graduación
• Lo solicitas tú directamente al IND — no necesitas empleador patrocinador
• Si encuentras trabajo que cumple los requisitos del Kennismigrant, puedes cambiar al HSM con umbral reducido (3.122€/mes)`,
      },
      {
        heading: 'MVV — Visa de entrada obligatoria para la mayoría',
        content: `La MVV (Machtiging tot Voorlopig Verblijf) es la visa de entrada que permite viajar a Holanda para recoger tu permiso de residencia.

Que no necesites visado Schengen para turismo NO significa que no necesites MVV para residir. Argentina, México, Colombia, Chile, Brasil y la mayoría de latinoamericanos sí necesitan MVV.

No necesitan MVV: ciudadanos de Australia, Canadá, Japón, Mónaco, Nueva Zelanda, Corea del Sur, Estados Unidos y Reino Unido. Tampoco ciudadanos UE/EEE/Suiza.

Proceso con MVV:
1. El empleador presenta la solicitud TEV (MVV + permiso de residencia) al IND
2. El IND aprueba en 2-4 semanas (Kennismigrant con sponsor reconocido)
3. Recoges la MVV en la embajada holandesa de tu país — dentro de los 3 meses desde la aprobación
4. Viajas a Holanda con la MVV
5. Te registras en el gemeente en los 5 días hábiles siguientes
6. Recoges la tarjeta de residencia en el IND

Coste: incluida en la tasa del permiso de residencia (~405€ para Kennismigrant, 243€ para dependientes). No hay tasa separada.

Verifica siempre tu situación en ind.nl usando el verificador de requisitos por nacionalidad — hay excepciones por país.`,
      },
      {
        heading: 'Reagrupación familiar y emprendimiento',
        content: `Reagrupación familiar: si tienes permiso de residencia en Holanda, tu pareja e hijos pueden solicitarla. La pareja del titular Kennismigrant recibe permiso de trabajo abierto. Coste: 243€ de tasa IND. Los hijos menores de 18 años pueden estudiar y vivir contigo.

Permiso de autónomo (zelfstandige): para quien quiere montar su propio negocio como extracomunitario. Se basa en un sistema de puntos que evalúa experiencia, plan de negocio y valor añadido para los Países Bajos. Es mucho más complejo que el registro KVK que hacen los ciudadanos UE — ver guía de ZZP.

Visa Startup (1 año): para proyectos innovadores. Requiere trabajar con un facilitador acreditado (lista en ind.nl). Después del año, puedes solicitar el permiso de autónomo.`,
      },
    ],
  },
  {
    slug: 'toeslagen',
    title: 'Ayudas del Estado (Toeslagen)',
    description: 'El gobierno holandés ofrece ayudas para seguro médico, alquiler, guardería e hijos. Disponibles para todos los residentes con seguro médico, independientemente de la nacionalidad.',
    icon: '💶',
    sections: [
      {
        heading: 'Cómo funcionan: no son automáticas',
        content: `Las ayudas del gobierno holandés (toeslagen) están disponibles para todos los residentes registrados con seguro médico holandés, independientemente de la nacionalidad. Tanto ciudadanos UE como extracomunitarios con permiso de residencia válido tienen acceso.

No se dan automáticamente — tienes que solicitarlas tú en mijn.toeslagen.nl con tu DigiD. Si no las solicitas, las pierdes.

Puedes solicitar retroactivamente hasta el 1 de septiembre del año siguiente. Si tus ingresos cambian durante el año, actualiza la solicitud para evitar tener que devolver dinero a final de año.`,
      },
      {
        heading: 'Zorgtoeslag — Ayuda para el seguro médico',
        content: `Para todos los residentes con seguro médico holandés e ingresos bajos-medios. Es la toeslag más importante para la mayoría de trabajadores.

Importes máximos 2026:
• Personas solas: hasta 129€/mes (1.548€/año)
• Parejas: hasta 246€/mes (2.952€/año)

Umbrales de ingresos 2026:
• Personas solas: ingresos brutos anuales por debajo de ~40.857€
• Parejas: ingresos combinados por debajo de ~51.142€

Límite de activos 2026: ahorros + inversiones no pueden superar 146.011€ (individual) o 184.633€ (pareja).

La mayoría de trabajadores con salario mínimo o medio reciben cerca del importe máximo. Esto significa que el coste neto real del seguro médico puede ser de solo 13-50€/mes.

Para solicitarla necesitas: BSN, DigiD, cuenta bancaria neerlandesa y el seguro médico ya contratado. Solicítala el mismo día que contrates el seguro.`,
      },
      {
        heading: 'Huurtoeslag — Ayuda para el alquiler',
        content: `Para todos los residentes registrados en un piso de alquiler.

Cambios clave 2026:
• Desde 2026 no hay límite máximo de alquiler para ser elegible (antes era ~900€/mes)
• El cálculo tiene un tope de 932,93€/mes para mayores de 21 años
• Edad mínima para el importe pleno: 21 años (antes 23)

Requisitos:
• Al menos 18 años
• Registrado en el gemeente en la dirección del piso
• Contrato de alquiler a tu nombre
• Vivienda autosuficiente (cocina + baño + puerta propia)
• Límite de activos a 1 de enero 2026: máximo 38.479€ por persona; 76.958€ para parejas

Ciudadanos extracomunitarios: necesitas permiso de residencia que permita una estancia de al menos 1 año. Los permisos temporales muy cortos pueden no dar acceso. Consulta en belastingdienst.nl con tu tipo de permiso específico.`,
      },
      {
        heading: 'Kinderopvangtoeslag y Kinderbijslag',
        content: `Kinderopvangtoeslag (guardería): para todos los padres que trabajan, estudian o están en proceso de inburgering. Cubre hasta el 96% del coste de guardería registrada para rentas bajas. La guardería debe estar inscrita en el Registro Kinderopvang. Ciudadanos extracomunitarios: necesitas permiso de residencia válido.

Kinderbijslag (ayuda por hijo): universal — para todos los residentes con hijos, independientemente de ingresos y nacionalidad.
• Importe orientativo 2026: ~262€/trimestre por hijo
• No depende de los ingresos
• Se gestiona a través del SVB (svb.nl)
• El SVB suele enviar el formulario automáticamente al nacer un hijo registrado en Holanda. Si no llega en 4-6 semanas, solicítalo directamente en svb.nl.`,
      },
      {
        heading: 'Pasos para no dejar este dinero encima de la mesa',
        content: `Las toeslagen son una cantidad significativa que muchos trabajadores migrantes no reclaman por desconocimiento.

Orden recomendado:
1. Contrata el seguro médico (obligatorio en los primeros 4 meses desde que trabajas o resides)
2. Usa la calculadora en toeslagen.nl/proefberekening para ver cuánto te corresponde
3. Solicita el zorgtoeslag en mijn.toeslagen.nl con tu DigiD
4. Si vives de alquiler y estás registrado, solicita también el huurtoeslag
5. Si tienes hijos, solicita el kinderbijslag en svb.nl

Puedes solicitar con retroactividad de hasta 1 año. Si llevas tiempo en NL sin haberlos pedido, puedes reclamar lo que has perdido.`,
      },
    ],
  },
  {
    slug: 'fiscal-holanda',
    title: 'Fiscalidad en Países Bajos y 30% ruling',
    description: 'El sistema de tres cajas (boxen), la 30% ruling para trabajadores expatriados, cómo hacer la declaración de la renta y tus obligaciones fiscales con el país de origen.',
    icon: '📊',
    sections: [
      {
        heading: 'Aviso importante',
        content: `Esta sección es informativa. Para decisiones fiscales concretas consulta con un asesor fiscal (belastingadviseur) homologado. Los datos corresponden al ejercicio 2026.

El sistema fiscal holandés aplica igual a todos los residentes independientemente de la nacionalidad, con una excepción importante: la 30% ruling.`,
      },
      {
        heading: 'El sistema de tres cajas (boxen)',
        content: `El IRPF holandés funciona con tres "cajas" separadas:

Box 1 — Trabajo (ingresos laborales):
• Tipo del 36,97% hasta 38.441€ — incluye impuesto + cotizaciones sociales
• Tipo del 49,5% por encima de 38.441€

Box 2 — Participaciones empresariales (≥5% de una empresa):
• 24,5% hasta 67.000€ de beneficio | 33% por encima

Box 3 — Ahorros e inversiones:
• Exención 2026: ~57.684€ por persona
• Por encima: se asume un rendimiento ficticio (~6,04% para inversiones, interés real para ahorro) y tributa al 36%

Los tipos de Box 1 ya incluyen las cotizaciones sociales (pensión, desempleo, salud). Tu empleador retiene estos importes mensualmente en nómina.`,
      },
      {
        heading: 'La 30% ruling — El gran beneficio fiscal para expatriados',
        content: `La 30% ruling permite que el 30% del salario bruto sea libre de impuestos durante 5 años. Ahorro estimado: 8.000€-18.000€/año dependiendo del salario. Disponible para ciudadanos UE y extracomunitarios por igual.

Requisitos:
1. Ser empleado asalariado (no autónomo ZZP)
2. Haber sido contratado o trasladado desde el extranjero
3. Haber vivido a más de 150 km de la frontera holandesa durante al menos 16 de los 24 meses previos al primer día de trabajo
4. Salario taxable mínimo (después de aplicar el 30%):
   • General: 48.013€/año (equivale a ~68.590€ brutos totales)
   • Menores de 30 años con máster: 36.497€/año (equivale a ~52.139€ brutos)

Plazo fatal: debe solicitarse en los primeros 4 meses desde el primer día de trabajo. Lo solicita el empleador, no el trabajador — pídele que lo tramite desde el primer mes.

El porcentaje puede cambiar para quienes iniciaron la ruling en 2024 o después — consulta con tu empleador el porcentaje actualizado según tu año de inicio.`,
      },
      {
        heading: 'Declaración de la renta (aangifte)',
        content: `Presentar la declaración puede generarte reembolsos por créditos fiscales no aplicados correctamente en nómina (algemene heffingskorting, arbeidskorting).

• Se presenta en Mijn Belastingdienst (belastingdienst.nl) con DigiD
• La Belastingdienst pre-rellena gran parte — revísala siempre antes de enviar
• Plazo habitual: 1 de marzo al 1 de mayo del año siguiente
• Si debes dinero, solicita liquidación provisional antes del 1 de julio para evitar intereses del 5%/año

Aunque no siempre hay obligación legal de declarar, casi siempre es recomendable hacerlo en los primeros años en NL.`,
      },
      {
        heading: 'Obligaciones con tu país de origen',
        content: `Lo que determina dónde pagas impuestos es la residencia fiscal, no la ciudadanía. En general, dejas de ser residente fiscal de tu país de origen cuando no pasas más de 183 días al año allí, no tienes allí tu actividad económica principal, y tu familia no reside habitualmente allí.

Convenios de doble imposición con Países Bajos (estado 2026):
Con convenio en vigor: España, México, Argentina, Colombia (actualizado 2022), Panamá.
Sin convenio: Chile (en negociación), Perú, Ecuador, Cuba, Bolivia, Uruguay, Costa Rica, Guatemala, Honduras, El Salvador, Nicaragua, Rep. Dominicana, Paraguay.
Caso especial Venezuela: tenía convenio pero lo denunció en 2008. Actualmente no está en vigor.

Si tu país no tiene convenio, puedes estar sujeto a tributar en ambos países. Sin embargo, la mayoría de países ofrecen un crédito fiscal unilateral por impuestos pagados en el extranjero — esto reduce el riesgo en la práctica, aunque no hay garantía formal. Consulta con un asesor que conozca la normativa tanto de Países Bajos como de tu país de origen.`,
      },
    ],
  },
  {
    slug: 'inburgering',
    title: 'Inburgering, holandés y residencia permanente',
    description: 'El proceso de integración cívica obligatorio para extracomunitarios, recursos para aprender holandés y los requisitos para obtener la residencia permanente y la ciudadanía.',
    icon: '🎓',
    sections: [
      {
        heading: 'Aprender holandés: la realidad',
        content: `En las grandes ciudades se puede vivir y trabajar completamente en inglés. Casi todos los holandeses hablan inglés con fluidez. Sin embargo, el holandés:
• Multiplica las oportunidades laborales
• Es esencial para la integración social real
• Es necesario para muchos trámites del gobierno

Recursos para aprender:
• Duolingo — Gratuito, para empezar desde cero
• Bibliotheek (biblioteca municipal) — Conversación holandesa gratuita con voluntarios
• Inburgeringsonline.nl — Cursos preparatorios para el examen oficial
• Método Delft — El más recomendado para perfiles con formación universitaria`,
      },
      {
        heading: 'Inburgering — ¿Estás obligado?',
        content: `Ciudadanos UE: NO estáis obligados al proceso de inburgering. Es completamente voluntario. Si queréis naturalizaros en el futuro, puede ser un requisito.

Ciudadanos extracomunitarios: dependiendo de cuándo llegaste y de tu tipo de permiso, puedes estar obligado a completar la integración cívica.

¿Quién está obligado (inburgeringsplicht)?
• Ciudadanos de fuera de la UE/EEE/Suiza/Turquía
• Con permiso de residencia de larga duración no temporal
• El DUO (Dienst Uitvoering Onderwijs) te enviará una carta indicando si estás obligado y bajo qué ley

Las dos leyes vigentes:
• Wi 2013 (carta anterior al 1 enero 2022): nivel A2, plazo 3 años
• Wi 2021 (carta desde el 1 enero 2022): nivel B1 para la mayoría, plazo 3 años

Qué cubre el proceso Wi 2021:
• Lengua holandesa: nivel B1 (hablado, escrito, lectura, escucha)
• Examen de conocimiento de la sociedad holandesa (KNM)
• Orientación al mercado laboral (ONA)

Coste del examen: ~350-400€. Préstamo del DUO: puedes solicitar hasta 10.000€ al 2,33% de interés para el curso y el examen. Se devuelve en 10 años si apruebas.

Si no cumples: multas, dificultades para renovar el permiso y para acceder a la residencia permanente.`,
      },
      {
        heading: 'Residencia permanente',
        content: `Ciudadanos UE — después de 5 años de residencia en Holanda:
• Derecho automático a residir indefinidamente
• Puedes solicitar un documento formal de residencia permanente al IND (no obligatorio pero útil)
• No necesitas examen de inburgering
• Coste si solicitas el documento: ~85€

Ciudadanos extracomunitarios — después de 5 años de residencia:
• Debes solicitarlo activamente al IND
• Los 5 años deben ser con permiso de residencia de propósito no temporal (trabajo, familia, etc.)
• Años con permiso de estudio: cuentan al 50%. Años con permiso temporal (au pair, working holiday): no cuentan
• No puedes haber estado fuera de Holanda más de 6 meses seguidos ni más de 10 meses en total durante esos 5 años
• Ingresos suficientes e independientes: generalmente mínimo ~1.354€/mes netos (sin holiday allowance)
• Diploma de inburgering (o exención oficial)
• Sin antecedentes penales relevantes
• Coste: 254€ (tasa IND 2026). Documento válido 5 años, renovable a ~85€
• Con la residencia permanente: trabajas libremente sin notificar al IND, cambias de trabajo sin restricciones, accedes a más beneficios sociales`,
      },
      {
        heading: 'Ciudadanía holandesa — Naturalización',
        content: `Ciudadanos UE: después de 5 años de residencia. El IND puede solicitar una prueba de integración. Coste: ~1.200€.

Ciudadanos extracomunitarios: después de 5 años de residencia legal. Requiere diploma de inburgering, ingresos suficientes, sin antecedentes penales graves y generalmente renuncia a la nacionalidad anterior (con excepciones según el país de origen).

Doble nacionalidad: las reglas varían según tu país de origen. En muchos casos, naturalizarte holandés implica renunciar a tu nacionalidad anterior, aunque existen excepciones. Es una decisión irreversible — consulta con un abogado de inmigración las implicaciones concretas para tu país antes de iniciar el proceso.

Ventajas de la ciudadanía holandesa:
• Pasaporte holandés con acceso pleno a la UE
• Derecho a votar en todas las elecciones
• Acceso a sectores reservados a nacionales
• Movilidad total por la UE`,
      },
    ],
  },
  {
    slug: 'zzp',
    title: 'Ser autónomo (ZZP) en Países Bajos',
    description: 'Cómo darse de alta como freelancer, obligaciones fiscales, deducciones disponibles, y lo que el ZZP no incluye: sin prestación por desempleo, sin baja pagada, sin pensión de empresa.',
    icon: '🧾',
    sections: [
      {
        heading: 'UE vs extracomunitarios: diferencia fundamental',
        content: `Ciudadano UE: puedes ser autónomo ZZP con solo registrarte en el KVK (Cámara de Comercio). Es inmediato, cuesta 85,15€ y no requiere ningún permiso previo. La burocracia es mínima.

Ciudadano extracomunitario: necesitas primero un permiso de residencia que autorice explícitamente el trabajo autónomo (zelfstandige). Se basa en un sistema de puntos que evalúa tu experiencia, plan de negocio y valor añadido para los Países Bajos. El proceso puede tomar semanas o meses — consulta con el IND o un especialista en inmigración antes de dar este paso.

La 30% ruling NO está disponible para autónomos ZZP, sin importar la nacionalidad.`,
      },
      {
        heading: 'Cómo darse de alta como ZZP (ciudadanos UE)',
        content: `1. Completa el formulario de pre-registro en kvk.nl con tu DigiD
2. Ve en persona a la oficina KVK con tu pasaporte o DNI
3. Paga la tasa de alta: 85,15€ (deducible como gasto de empresa)
4. Recibes tu número KVK en el acto
5. La Belastingdienst te envía el número de IVA (BTW-nummer) por correo en ~2 semanas

No hay cuota mensual fija. No estás obligado a abrir una sociedad — puedes operar como persona física (eenmanszaak).`,
      },
      {
        heading: 'IVA (BTW) y declaración fiscal',
        content: `Como ZZP debes cobrar y declarar IVA (BTW) en tus facturas:

Tipos de IVA:
• Estándar: 21%
• Reducido: 9% (alimentación, medicamentos, libros, algunos servicios)
• 0%: exportaciones fuera de la UE y servicios a empresas UE con número de IVA

La declaración de IVA es trimestral. Plazos: 30 de abril, 31 de julio, 31 de octubre y 31 de enero.

KOR (exención IVA para pequeños negocios): si facturas menos de 20.000€/año, puedes quedar exento de cobrar y declarar IVA. Solicítalo con al menos 4 semanas de antelación en Mijn Belastingdienst.

La declaración de renta anual se presenta entre el 1 de marzo y el 1 de mayo del año siguiente.`,
      },
      {
        heading: 'Deducciones fiscales para ZZP en 2026',
        content: `Las principales deducciones disponibles:

• Zelfstandigenaftrek: 1.200€ — Requiere al menos 1.225 horas/año trabajadas en el negocio. Atención: ha caído de 7.280€ en 2021 a 1.200€ en 2026, y bajará a 900€ en 2027.
• Startersaftrek: +2.123€ adicionales — Solo las primeras 3 veces en los primeros 5 años de actividad.
• MKB-winstvrijstelling: 12,7% del beneficio — No requiere horas mínimas. Es la deducción más estable y significativa.
• Meewerkaftrek: variable — Si tu pareja trabaja en el negocio sin cobrar salario.

La MKB-winstvrijstelling se aplica sobre el beneficio neto después de las otras deducciones, reduciendo directamente la base imponible en Box 1.`,
      },
      {
        heading: 'Lo que el ZZP no tiene: gaps de protección social',
        content: `Ser autónomo en Holanda significa asumir riesgos que los empleados no tienen. Debes conocerlos antes de empezar:

❌ Prestación por desempleo (WW): si te quedas sin clientes, no hay ningún subsidio del gobierno.
❌ Baja por enfermedad pagada: si enfermas, no cobras. Los empleados cobran el 70% del salario durante hasta 2 años.
❌ Pensión de empresa (Pilar 2): solo tienes la AOW más lo que tú mismo aportes al Pilar 3.

✅ Zorgtoeslag: sí puedes solicitarla si tus ingresos son bajos.
✅ AOW: sí acumulas pensión pública por cada año de residencia en NL.

Cómo protegerte:
• Seguro de invalidez (AOV): cubre tus ingresos si no puedes trabajar por enfermedad o accidente prolongado. Coste: 100-400€/mes según edad y cobertura. Sin él, una baja larga = ingresos cero.
• Pensión privada (Pilar 3): aportaciones deducibles en Box 1. Productos habituales: Brand New Day, Bright, Centraal Beheer.`,
      },
      {
        heading: 'Alerta: falso autónomo desde enero 2025',
        content: `Desde enero de 2025, la Belastingdienst inspecciona activamente si las relaciones ZZP son realmente autónomas.

Señales de riesgo:
• Trabajas exclusivamente para un solo cliente
• Usas sus instalaciones, herramientas y horarios
• Tu tarifa es inferior a ~38€/hora (existe presunción legal de relación laboral)

Si te detectan como falso autónomo, tanto tú como el cliente podéis recibir reclamaciones retroactivas de impuestos y cotizaciones sociales.

Si crees que tu situación puede encuadrarse aquí, consulta con un asesor fiscal antes de que llegue la inspección.`,
      },
    ],
  },
  {
    slug: 'pensiones',
    title: 'El sistema de pensiones holandés',
    description: 'Los tres pilares del sistema de pensiones en Países Bajos: AOW pública, pensión de empresa y pensión privada. Cómo se acumula y qué pasa si dejas el país.',
    icon: '👴',
    sections: [
      {
        heading: 'Pilar 1 — AOW: Pensión Pública del Estado',
        content: `La AOW (Algemene Ouderdomswet) es la pensión pública básica holandesa. Es única en Europa: se basa en años de residencia, no en cotizaciones ni en el salario.

Cómo acumulas AOW:
• 2% de la AOW completa por cada año vivido en los Países Bajos entre los 15 años y la edad de jubilación
• Para el 100%: necesitas 50 años de residencia en ese rango de edad
• Edad de jubilación 2026: 67 años

Importes AOW 2026 (brutos/mes, más paga de vacaciones en mayo):
• Persona sola: 1.637,57€/mes
• Persona en pareja: 1.122,12€/mes por persona

Los importes se actualizan dos veces al año — consulta siempre en svb.nl para los valores actuales.

AOW máxima acumulable según edad de llegada a Holanda:
• Llegada a los 20 años: hasta el 94%
• Llegada a los 25 años: hasta el 84%
• Llegada a los 30 años: hasta el 74%
• Llegada a los 35 años: hasta el 64%
• Llegada a los 40 años: hasta el 54%
• Llegada a los 45 años: hasta el 44%

La AOW no desaparece si te vas del país. Lo acumulado se cobra desde tu país de residencia cuando te jubiles, a través del convenio bilateral (si existe) o directamente con el SVB. También puedes cotizar voluntariamente al AOW desde el extranjero si te vas antes de jubilarte para no perder esos años.`,
      },
      {
        heading: 'Pilar 2 — Pensión de empresa',
        content: `Alrededor del 90% de las empresas holandesas tienen plan de pensiones de empresa. Es el componente más importante de la pensión total: de media, el 70% de la pensión total de un trabajador neerlandés viene del Pilar 2.

Lo que debes hacer activamente desde el primer día de trabajo:
1. Pregunta a RRHH: ¿en qué fondo de pensión estoy y cuánto aporta la empresa?
2. Regístrate en el portal de ese fondo para ver tu acumulado
3. Consulta Mijnpensioenoverzicht.nl (con DigiD) para ver todos tus fondos en un solo lugar

Lo acumulado no desaparece si cambias de empresa o te vas del país — se queda en el fondo hasta tu jubilación.

Trabajadores de ETT: comprueba siempre qué fondo de pensión aplica tu agencia, ya que puede variar según la fase del contrato.`,
      },
      {
        heading: 'Pilar 3 — Pensión privada (lijfrente)',
        content: `Los planes privados de pensiones son especialmente importantes para:
• Autónomos ZZP (que no tienen Pilar 2)
• Quienes llegaron tarde a Holanda y acumularán poco AOW
• Quienes quieren complementar los dos primeros pilares

Las aportaciones al Pilar 3 son deducibles de la base imponible en Box 1, reduciendo directamente tu factura fiscal.

Productos habituales en el mercado neerlandés: Brand New Day, Bright, Centraal Beheer.

La cantidad máxima deducible cada año (jaarruimte) depende de tus ingresos del año anterior y de lo que ya cotizas al Pilar 2. La calcula automáticamente la Belastingdienst en tu declaración anual.`,
      },
    ],
  },
  {
    slug: 'digid',
    title: 'DigiD: tu firma digital en Países Bajos',
    description: 'DigiD es el sistema de identificación digital del gobierno neerlandés. Lo necesitas para hacer casi cualquier trámite online: declaración de impuestos, solicitar toeslagen, Mijn SVB, portales de salud y mucho más.',
    icon: '🔐',
    sections: [
      {
        heading: '¿Qué es el DigiD?',
        content: `DigiD (Digitale Identiteit) es el usuario y contraseña oficial con el que los residentes en Países Bajos acceden a los servicios online del gobierno neerlandés. Sin DigiD no puedes acceder a:

• La declaración anual de impuestos en Mijn Belastingdienst
• Solicitar o gestionar el zorgtoeslag, huurtoeslag y otros toeslagen
• Consultar tu pensión en Mijnpensioenoverzicht.nl
• Gestionar tu seguro médico en el portal de tu aseguradora
• Ver tu historia clínica en portales como MedMij
• Trámites municipales online (verhuizing, etc.)

DigiD se solicita únicamente por internet en digid.nl y necesitas un BSN activo para pedirlo.`,
      },
      {
        heading: 'Cómo solicitar el DigiD',
        content: `El proceso tiene dos pasos:

1. Solicitud online en digid.nl
   — Ve a digid.nl y haz clic en "Aanvragen"
   — Introduce tu BSN, fecha de nacimiento y dirección actual (exactamente como aparece en el registro municipal)
   — Elige un nombre de usuario y una contraseña segura
   — Recibirás una carta de activación en tu dirección registrada en un plazo de 3 a 5 días hábiles

2. Activación
   — Cuando llegue la carta, accede a digid.nl e introduce el código de activación
   — A partir de ese momento tu DigiD está activo

Importante: la carta se envía a la dirección del BRP. Si no estás bien registrado, la carta no llegará. Asegúrate de que tu inschrijving está al día.`,
      },
      {
        heading: 'DigiD app y nivel de seguridad',
        content: `Hay tres niveles de acceso con DigiD:

• Nivel Basis: usuario + contraseña (el básico)
• Nivel Midden: usuario + contraseña + código SMS (recomendado para la mayoría de trámites)
• Nivel Substantieel/Hoog: a través de la app DigiD con reconocimiento facial o chip del pasaporte — necesario para trámites de mayor seguridad

Para instalar la app DigiD:
1. Descárgala en tu teléfono (disponible para iOS y Android)
2. Actívala con tu usuario/contraseña de DigiD
3. Verifica tu identidad escaneando el chip NFC de tu pasaporte biométrico o mediante reconocimiento facial en una oficina

La app DigiD es más segura y más cómoda que recibir SMS. Se recomienda activarla cuanto antes.`,
      },
      {
        heading: 'DigiD caducado o perdido',
        content: `Si llevas más de 3 años sin usar tu DigiD, puede desactivarse automáticamente. También puede bloquearse por intentos fallidos.

Para reactivarlo o crear uno nuevo:
— Visita digid.nl y selecciona "Herstellen" o "Opnieuw aanvragen"
— El proceso es el mismo que la primera solicitud: carta por correo a tu dirección del BRP

Si has cambiado de dirección y no actualizaste el registro municipal, la carta irá a tu dirección anterior. Actualiza siempre tu inschrijving antes de solicitar el DigiD.

Si tienes problemas, puedes llamar al servicio de ayuda de DigiD: 088 1236 555 (lunes a viernes, 8h–22h).`,
      },
    ],
  },
  {
    slug: 'transporte',
    title: 'Transporte público en Países Bajos: OV-chipkaart y rutas',
    description: 'Cómo moverte en tren, metro, tranvía y autobús en los Países Bajos. La OV-chipkaart, la app NS, los abonos y todo lo que necesitas saber para ir del trabajo a casa sin sorpresas.',
    icon: '🚆',
    sections: [
      {
        heading: 'El sistema de transporte público en NL',
        content: `El transporte público en Países Bajos (OV, Openbaar Vervoer) es uno de los más densos de Europa. Cubre prácticamente todo el país con:

• Tren (NS — Nederlandse Spoorwegen): la columna vertebral. Conecta todas las ciudades principales con alta frecuencia.
• Metro, tranvía y bus urbano: operados por empresas locales según ciudad (GVB en Ámsterdam, RET en Róterdam, HTM en La Haya).
• Bus interurbano: cubre municipios pequeños y zonas rurales. Operadores como Connexxion, EBS, Arriva.
• Bicicleta: no es OV oficial, pero es el complemento real del transporte aquí. Muchas estaciones tienen OV-fiets (bici de alquiler por 4€/día con abono).

Todo el sistema funciona con una sola tarjeta: la OV-chipkaart.`,
      },
      {
        heading: 'La OV-chipkaart: qué es y cómo conseguirla',
        content: `La OV-chipkaart es la tarjeta recargable que usas para pagar en todos los transportes públicos de NL. Hay dos tipos:

1. OV-chipkaart personal (con nombre)
   — Vinculada a tu nombre y datos
   — Permite suscribirse a abonos mensuales (dal vrij, weekend vrij, etc.)
   — Se solicita en ov-chipkaart.nl por 7,50€ (coste de la tarjeta)
   — Llega por correo en 5-7 días hábiles

2. OV-chipkaart anónima
   — Sin nombre, no recuperable si la pierdes
   — Se compra en máquinas de estaciones o tiendas Albert Heijn
   — Coste: 7,50€ + saldo inicial mínimo de 20€

Para usar el transporte: siempre debes hacer check-in (acercar la tarjeta al lector al entrar) y check-out (al salir). Si no haces check-out, te cobran la tarifa máxima del trayecto.`,
      },
      {
        heading: 'Abonos y descuentos más usados',
        content: `Los abonos más populares para quien trabaja en NL:

• Dal Voordeel (40% de descuento en horas valle): gratis, se activa en tu OV-chipkaart personal en ns.nl
• Dal Vrij (viajes ilimitados en horas valle): ~110€/mes — ideal para quienes no trabajan en horario pico
• Altijd Voordeel (20% de descuento siempre): ~9€/mes
• Weekend Vrij (viajes ilimitados sábado y domingo): ~49€/mes

Horas punta (spits): 6:30–9:00 y 16:00–18:30 en días laborables. Fuera de esas horas es "dal" (valle).

Los abonos de empresa (OV-bedrijfskaart): muchos empleadores en NL cubren el transporte total o parcialmente como parte del salario. Pregunta en tu empresa o ETT si tienen este beneficio.`,
      },
      {
        heading: 'Apps útiles para moverse',
        content: `Las apps más usadas para el transporte en NL:

• NS Reisplanner: oficial de NS para trenes. Planifica rutas, compra billetes internacionales, consulta retrasos en tiempo real.
• 9292: planificador multimodal (tren + metro + bus + tranvía). La más completa para rutas combinadas.
• Google Maps y Apple Maps: funcionan bien para rutas OV en NL, aunque a veces con menos detalle en disrupciones.
• OV-chipkaart app: para ver tu saldo, recargar y gestionar abonos.

Truco útil: si el tren se retrasa más de 30 minutos por causas de NS, puedes pedir compensación (Reisgarantie) directamente en la app de NS.`,
      },
      {
        heading: 'Ir al trabajo en tren: lo que debes saber',
        content: `Si trabajas a través de una ETT y tu centro de trabajo está en otra ciudad, el tren será tu medio principal. Algunos puntos importantes:

• El precio se calcula por kilómetro: un trayecto de 50 km en segunda clase cuesta aproximadamente 10-12€ (sin descuentos).
• Con Dal Voordeel (gratuito) ahorras un 40% en horas valle — la mayoría de trabajos de ETT empiezan antes de las 6:30h o después de las 9h.
• Guarda siempre tus recibos de viaje si tu empresa reembolsa el transporte. Puedes exportarlos desde ns.nl.
• Si tu empresa no cubre el transporte y viajas más de 10 km/día, esos gastos pueden ser deducibles en la declaración fiscal.`,
      },
    ],
  },
  {
    slug: 'ww',
    title: 'WW: el seguro de desempleo en Países Bajos',
    description: 'La WW (Werkloosheidswet) es la prestación por desempleo en Holanda. Si pierdes tu trabajo, puedes tener derecho a cobrar hasta el 75% de tu último salario durante meses o años, según los años cotizados.',
    icon: '🛡️',
    sections: [
      {
        heading: '¿Qué es la WW?',
        content: `La WW (Werkloosheidswet) es el seguro de desempleo obligatorio en Países Bajos, gestionado por el UWV (Uitvoeringsinstituut Werknemersverzekeringen). La cotización se descuenta automáticamente de tu nómina y el trabajador no paga nada extra.

Si te quedas sin trabajo de forma involuntaria, tienes derecho a la WW si cumples dos condiciones:
1. Has trabajado al menos 26 de las últimas 36 semanas (wekeneis)
2. En al menos 4 de los últimos 5 años has trabajado 52 semanas o más (jareneis) — esto determina la duración de la prestación

La WW cubre tanto contratos indefinidos como contratos temporales (incluyendo trabajos a través de ETT).`,
      },
      {
        heading: 'Cuánto y cuánto tiempo se cobra',
        content: `Importe:
• Los primeros 2 meses: 75% del salario diario medio (con un máximo diario de 232,37€ brutos en 2026)
• A partir del tercer mes: 70% del mismo salario diario

Duración:
• Mínima: 3 meses (si cumples solo la wekeneis de 26 semanas)
• Máxima: 24 meses (si tienes 10 o más años cotizados)
• La fórmula general: 1 mes de WW por cada año trabajado (hasta 10 años); a partir de los 10 años, 0,5 meses por año adicional

Ejemplo práctico: si llevas 3 años trabajando en NL, tendrás derecho a unos 3 meses de WW al 75%/70%. Si llevas 10 años, hasta 10 meses.`,
      },
      {
        heading: 'Cómo solicitar la WW',
        content: `Debes solicitar la WW lo antes posible — idealmente el mismo día que te quedas sin trabajo, o como máximo en la primera semana. Cada día de retraso puede significar días de prestación perdidos.

Pasos:
1. Accede a werkloosheid.uwv.nl con tu DigiD
2. Haz clic en "WW aanvragen"
3. Rellena el formulario con tus datos personales, historial laboral y fecha de fin de contrato
4. Sube los documentos requeridos (normalmente el UWV los obtiene directamente de tu empleador)
5. Recibirás una decisión en un plazo de 4 semanas

Importante: durante la WW estás obligado a buscar trabajo activamente y registrar las búsquedas. El UWV puede pedirte pruebas de ello.`,
      },
      {
        heading: 'WW si trabajabas en una ETT',
        content: `Si trabajabas a través de una agencia de trabajo temporal (ETT), tienes los mismos derechos a la WW que cualquier otro trabajador. Las semanas cotizadas cuentan igual.

Casos especiales a tener en cuenta:

• Fin de contrato temporal: si tu contrato de ETT termina sin renovación, cuentas como desempleado involuntario y puedes pedir la WW.
• Fase A de ETT: las primeras semanas en una ETT (Fase A/1-2) tienen un contrato "uitzendovereenkomst" con cláusula de exclusión. Si la ETT te llama para otro trabajo y rechazas, pueden considerarlo como baja voluntaria — ten cuidado.
• Cambio de sector: si durante la WW encuentras trabajo parcial, la WW se reduce proporcionalmente pero no desaparece hasta que superas un umbral de horas trabajadas.

Siempre guarda todas tus nóminas (loonstroken) — el UWV las usa para calcular el salario base de la WW.`,
      },
      {
        heading: 'Qué pasa si la WW se acaba',
        content: `Cuando la WW se agota, si sigues sin trabajo puedes solicitar la Participatiewet o bijstand (ayuda social), gestionada por tu municipio (gemeente). Es una prestación de último recurso, sujeta a la comprobación de recursos económicos (también de tu pareja).

Otros apoyos durante la WW:
• Re:schuldhulp: si tienes deudas, el UWV puede derivarte a asesoramiento gratuito
• Cursos de formación: el UWV ofrece subsidios para formación que aumente tu empleabilidad
• BBZ: si estás pensando en hacerte autónomo, hay una prestación temporal para emprendedores sin ingresos

Para cualquier duda sobre tu situación específica, puedes llamar al UWV: 0900-9294 (lunes a viernes, 8h–18h) o consultar uwv.nl.`,
      },
    ],
  },
]

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug)
}
