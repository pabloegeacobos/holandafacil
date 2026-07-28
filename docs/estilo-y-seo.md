# Estilo y SEO de la serie de guías

Detalle exhaustivo. Las reglas duras están en `/CLAUDE.md`.

---

## Estructura obligatoria de cada guía

```
Front matter YAML
H1 único, con la keyword principal, formulado como reconocimiento del problema
Entradilla de 60-90 palabras nombrando la situación concreta del lector
H2 — cada pregunta, redactada tal como se busca en Google
     Respuesta completa y autónoma en las primeras 40-55 palabras
     H3 solo si la respuesta supera 300 palabras
     Ejemplo con números inventados
     🚩 Motivo para preguntar — termina en la pregunta literal que hacer por escrito
     Verifícalo: artículo X
H2 — Qué hacer ahora, en este orden (pasos numerados)
H2 — Verificación de esta guía
H2 — Fuente y aviso
JSON-LD entre comentarios HTML
```

**Longitud:** 1.800–2.600 palabras. Un solo H1. Sin H4.

### Por qué esta estructura

- **Respuesta autónoma en 40-55 palabras** bajo cada H2: es lo que Google usa
  para el featured snippet y lo que el lector lee si tiene prisa.
- **🚩 Motivo para preguntar terminado en la pregunta literal**: convierte la
  guía en una plantilla accionable. El lector copia y pega en el email a la
  ETT.
- **Verifícalo: artículo X**: obliga a que el lector pueda contrastar. Nunca se
  cita una norma sin dar el número.

---

## Front matter YAML

Campos obligatorios en cada guía:

```yaml
titulo: ""
slug: ""
meta_titulo: ""          # ≤60 caracteres
meta_descripcion: ""     # 140-155 caracteres
keyword_principal: ""
keywords_secundarias: []
cluster: ""              # pilar / radio
enlaza_a: []             # slugs de otras guías, máximo 4
fuente_convenio: "CAO voor Uitzendkrachten 2026-2028, versión mayo 2026"
articulos_citados: []    # p. ej. ["49.13", "51.4", "50.2", "5.2"]
schema: []               # ["Article", "FAQPage"]
fecha_publicacion: ""
fecha_revision: ""
estado: ""               # borrador / verificada / publicada / obsoleta
```

---

## Cierre de cada guía

Bloque de verificación visible al final con:

- Fuente única (versión del convenio con fechas).
- Artículos citados en la guía.
- Fecha de última verificación.
- Próxima revisión programada.
- Canal para avisar de errores, con enlace a `/correcciones`.

Aviso legal (literal):

> Esta guía es orientativa y no constituye asesoramiento legal. Consulta el
> convenio oficial o a un profesional para tu caso concreto.

Nota final: los importes de los ejemplos son inventados.

---

## Cluster de enlaces internos

**Pilar:** guía **02** (nómina). Todas las demás enlazan a ella; ella enlaza a
todas las demás.

**Radios:** el resto. Cada una enlaza al pilar y a 2-3 hermanas.

**Regla:** máximo 4 enlaces internos por guía. Si A enlaza a B, B enlaza a A
(bidireccionalidad obligatoria).

### Mapa completo

| Origen | Destinos |
|---|---|
| 01 | 02, 05, 07 |
| 03 | 02, 05, 16 |
| 04 | 02, 11, 03 |
| 05 | 02, 01, 03 |
| 06 | 02, 04, 03 |
| 07 | 02, 09, 01 |
| 08 | 02, 07, 09 |
| 09 | 02, 07, 08 |
| 10 | 02, 08, 12 |
| 11 | 02, 04, 09 |
| 12 | 02, 13, 10 |
| 13 | 02, 12, 04 |
| 14 | 02, 04 |
| 15 | 02, 16, 05 |
| 16 | 02, 15, 03 |
| 17 | 02, 05, 15 |

Al añadir una guía nueva, actualizar `enlaza_a` en las que reciben el nuevo
enlace.

---

## Schema (JSON-LD)

**Dos bloques por página, entre comentarios HTML al final del cuerpo:**

### 1. `Article`

Campos obligatorios:

- `author`
- `publisher`
- `datePublished`
- `dateModified`
- `inLanguage: "es"`
- `citation` apuntando a `https://www.abu.nl/cao/`

Ese `citation` es lo que le dice a Google que la fuente primaria del texto es
oficial. No omitir.

### 2. `FAQPage`

- Un `Question` / `Answer` por cada H2 de la guía.
- La respuesta debe funcionar **fuera de contexto**: si Google la extrae sola,
  se entiende sin haber leído lo anterior.

### Ejemplo mínimo

```html
<!--
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "…",
  "author": { "@type": "Organization", "name": "HolandaFácil" },
  "publisher": { "@type": "Organization", "name": "HolandaFácil" },
  "datePublished": "2026-…",
  "dateModified": "2026-…",
  "inLanguage": "es",
  "citation": {
    "@type": "CreativeWork",
    "name": "CAO voor Uitzendkrachten 2026-2028",
    "url": "https://www.abu.nl/cao/"
  }
}
-->
<!--
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "…",
      "acceptedAnswer": { "@type": "Answer", "text": "…" }
    }
  ]
}
-->
```

---

## Keywords — tres capas

### Capa 1: español natural

Como lo busca alguien que ni siquiera sabe la palabra en neerlandés.

- "cuánto me tienen que pagar por horas extra en Holanda"
- "descuento del alquiler en la nómina Holanda"
- "cuánto son las vacaciones en un contrato de ETT en Holanda"

### Capa 2: híbrida — donde se gana

El trabajador copia la palabra que ve en su nómina y le añade "qué es" o
"español". Casi nadie optimiza para eso.

- "loonstrook explicación español"
- "fase B uitzendbureau qué es"
- "vakantiegeld cómo se calcula"
- "uitzendbeding qué significa"
- "ET-regeling desventajas"

### Capa 3: término neerlandés suelto

Volumen bajo, competencia alta, buena intención de búsqueda.

- "vakantiegeld"
- "uitzendbeding"
- "loonstrook"

### Regla de uso en el cuerpo

Primer uso del término neerlandés en cursiva con su equivalente español entre
paréntesis:

> El *vakantiegeld* (paga de vacaciones) equivale al…

Después, indistintamente.

---

## Front matter — checklist antes de publicar

- [ ] `meta_titulo` ≤ 60 caracteres, incluye keyword principal.
- [ ] `meta_descripcion` entre 140 y 155 caracteres, con call-to-action
  implícito.
- [ ] `articulos_citados` contiene **todos** los artículos referenciados en el
  cuerpo.
- [ ] `enlaza_a` respeta el mapa de cluster y bidireccionalidad.
- [ ] `fecha_revision` fijada a fecha real de la última pasada de verificación.
- [ ] `estado` distinto de `borrador` solo si las cuatro pasadas de
  `docs/verificacion.md` están hechas.
