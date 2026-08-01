# CLAUDE.md

Instrucciones para asistentes de IA que trabajen en este repositorio.
Léelo entero antes de tocar nada.

---

## Qué es esto

holandafacil.com — plataforma en español para trabajadores hispanohablantes en
Países Bajos, muchos contratados vía ETT (*uitzendbureaus*). Next.js
(App Router), Supabase, Vercel. En producción.

Dos frentes activos:

1. **Serie de guías** sobre el CAO voor Uitzendkrachten (contenido).
2. **Repositorio** con el sitio y sus scripts (código).

Audiencia: españoles y latinoamericanos en logística, almacén, producción,
agricultura y construcción. Muchos no hablan neerlandés y leen en su segunda
lengua de trabajo. Nivel de lectura: frases cortas, un concepto por párrafo,
tuteo siempre, "tu nómina" y nunca "el trabajador".

---

## Cómo trabajar con Pablo

- **Discrepa de forma estructurada:** "no estoy de acuerdo porque [razón]. Esto
  es lo que haría en su lugar [alternativa]. El riesgo de tu enfoque es
  [consecuencia específica]".
- **Primero la respuesta incómoda.** Al principio, no en el tercer párrafo.
- **Sin párrafos de introducción.** Empieza por lo más útil que puedas decir.
- **Si te cuestiona, mantén tu postura** salvo información realmente nueva.
  "Pero yo creo que" no es información nueva.
- **Una guía cada vez.** Espera visto bueno antes de pasar a la siguiente.
- **No entregues archivos de uno en uno** cuando son varios.

---

## Reglas duras — contenido

Aplican a toda guía y a toda página del sitio que interprete el convenio.

### Framing atributivo

Habla el convenio, nunca nosotros. En cualquier frase que contenga una norma,
el sujeto gramatical es el artículo o el anexo.

| ❌ Nunca | ✅ Siempre |
|---|---|
| "Tienes derecho a X" | "El artículo 21 establece que…" |
| "Tu ETT está incumpliendo" | "Esto es una señal para pedir explicación por escrito" |
| "Es ilegal" | "El convenio no lo contempla" / "el artículo X lo limita a…" |
| "Te deben 1.248 €" | "Con estas cifras, la diferencia sería de 1.248 €" |
| "Puedes reclamar y ganar" | "Estas son las vías donde se tramitan estas consultas" |
| "No pueden hacerlo" | "El artículo 51.3 excluye este tipo de descuento" |

Grep obligatorio antes de publicar:

```
grep -in "tienes derecho\|es ilegal\|está incumpliendo\|te deben\|no pueden hacerlo\|puedes reclamar y" *.md
```

Debe dar cero.

### Verificación de cifras y artículos

Toda cifra y toda referencia a un artículo se comprueba abriendo el PDF del
convenio. Si un dato no se puede localizar ahí, se elimina del texto. Nunca de
memoria ni de fuentes secundarias.

Tabla completa de cifras y las cuatro pasadas de verificación en
`docs/verificacion.md`.

### Trampa del doble articulado

Los artículos **14, 15 y 39** tienen dos versiones en el mismo convenio:

- Una vigente **hasta el 1-1-2028**.
- Otra **desde el 1-1-2028**.

Confundirlas es el error más probable de la serie. Verifica siempre cuál
aplica antes de citar.

### Nunca nombrar empresas

Ninguna guía menciona una ETT, empresa cliente ni persona concreta. Ni siquiera
como ejemplo. Ni aunque el dato sea público.

### Ejemplos inventados

Cifras redondas e inventadas, nunca casos reales ni anonimizados. Fórmula fija:

> "Ejemplo con números inventados" → operación → "Si tus cifras son otras, el
> resultado cambia; lo que sirve es la operación."

### Copyright

El texto del CAO está protegido: no es una ley y no entra en el art. 11
Auteurswet. **No traducir ni transcribir fragmentos.** Se cita el artículo por
número para que el lector verifique, y se explica con palabras propias. Obra
transformadora, no copia.

### Ambigüedad declarada

Si el convenio no es claro, se dice en el cuerpo del texto, no en una nota al
pie. La persuasión va en cómo se cuenta, jamás en qué se dice que dice la
norma.

### No individualizar

Nunca prometer resultados ni valorar el caso concreto de nadie. Se describen
las vías donde se tramitan estas consultas, no su desenlace.

### Términos neerlandeses

Primer uso de cada término neerlandés en cursiva con su equivalente español
entre paréntesis. Ejemplo: *loonstrook* (nómina). Después, indistintamente.

---

## Reglas duras — código

### Guardas de entorno

Los scripts que escriben en producción, antes de tocar Supabase:

- Requieren flag `--confirm-prod` o `--dry-run` (nunca ninguna, nunca ambas).
- Imprimen el `ref` del proyecto Supabase que van a modificar.
- Aceptan `--dry-run` en los tres (`push-agencies.mjs`, `dedup-agencies.mjs`,
  `fix-certs.mjs`).
- **Fallan cerrado**: si falta cualquier condición, abortan con exit 1.

Implementado en `scripts/lib/guard.mjs` (`assertGuards()`, `runWrite()`), ver
`scripts/README.md` para el uso. Scripts afectados:

- `scripts/push-agencies.mjs`
- `scripts/dedup-agencies.mjs`
- `scripts/fix-certs.mjs`

### Seed de demostración

`seed-demo.mjs` no puede contener nombres de agencias reales. Cualquier
inserción de reseñas debe atribuirse a empresas ficticias.

### No reorganizar

`scripts/` y `supabase/` **no se mueven**. Rutas hardcodeadas relativas a la
raíz en varios ficheros que ya no se ejecutan de forma rutinaria. Se documenta
en vez de reorganizar.

### Ubicación de las guías

- Fuente en Markdown: `content/guias/`.
- Renderizado: `app/[locale]/guias/`.
- Documentos de normas: `docs/`.
- Este archivo: raíz.

---

## Fuente única del convenio

CAO voor Uitzendkrachten 2026–2028, versión mayo 2026 (ABU/LBV).
Vigencia: 1-1-2026 a 31-12-2028.

PDF oficial:
<https://www.abu.nl/app/uploads/2026/06/CAO-voor-Uitzendkrachten-2026-2028-NL-webversie.pdf>

Página oficial: <https://www.abu.nl/cao/> · NBBU: <https://www.nbbu.nl/nl/cao>

Cualquier otra fuente es secundaria y no reemplaza al PDF.

---

## Documentos de referencia

- **`docs/estilo-y-seo.md`** — estructura obligatoria de cada guía, front
  matter, mapa de cluster, JSON-LD, tres capas de keywords.
- **`docs/verificacion.md`** — las cuatro pasadas antes de publicar, tabla
  completa de cifras a comprobar, registro de correcciones, cadencia de
  revisión.
- **`docs/indice-guias.md`** — las 17 guías con estado, bloqueos y
  ambigüedades pendientes. **No contiene el mapa de enlaces**: eso vive solo
  en `docs/estilo-y-seo.md` (fuente única).
