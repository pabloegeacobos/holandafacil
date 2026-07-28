# Verificación de las guías

Ningún aviso legal protege de haber publicado un dato falso. Lo que protege es
verificación previa, trazabilidad y corrección rápida. El riesgo real no es
mentir: es quedarse desactualizado — el art. 61 del convenio prevé
modificaciones durante su vigencia.

---

## Las cuatro pasadas antes de publicar

Se hacen en este orden. Ninguna se salta.

### 1. Cifras

Cada cifra localizada en el PDF del convenio, con artículo o anexo anotado en
un comentario al lado o en `articulos_citados` del front matter.

Si una cifra no se puede localizar, se elimina del texto. No hay excepciones:
ni "según fuente secundaria", ni "según versión anterior", ni "según lo que
recuerdo".

### 2. Artículos

Cada referencia a un artículo se abre y se contrasta contra el PDF. Se
comprueba:

- Que el artículo existe en la versión de mayo 2026.
- Que dice lo que la guía afirma que dice.
- Que no está en el **doble articulado** sin especificar cuál aplica.

**Doble articulado — arts. 14, 15 y 39:**

Estos tres artículos tienen dos versiones en el mismo convenio. Una vigente
hasta el 1-1-2028 y otra desde esa fecha. Confundirlas es el error más probable
de la serie.

Antes de citar 14, 15 o 39, la guía tiene que dejar claro cuál está usando.

### 3. Framing

Grep obligatorio en el directorio de guías:

```bash
grep -in "tienes derecho\|es ilegal\|está incumpliendo\|te deben\|no pueden hacerlo\|puedes reclamar y" *.md
```

Debe dar **cero resultados**. Cualquier coincidencia se reescribe con framing
atributivo (tabla en `docs/estilo-y-seo.md` y en `/CLAUDE.md`).

### 4. Vigencia

Comprobar en <https://www.abu.nl/cao/> que la versión que citamos (mayo 2026)
sigue siendo la publicada. Si la ABU publica una nueva, todas las guías entran
en revisión.

---

## Cifras que aparecen en la serie

Todas verificadas contra el PDF antes de publicar. Si aparece una nueva cifra
en una guía nueva, añadirla a esta tabla con su localización.

| Cifra | Concepto | Dónde |
|---|---|---|
| 127,88 € | Base vivienda 2026-2027 | Anexo V |
| 1,00 € | Precio por punto vivienda | Anexo V |
| 159,85 € | Máximo vivienda 2026-2027 | Anexo V |
| 23,4 % / 15,9 % / 7,5 % | Pensión: total / ETT / trabajador | art. 45.5 |
| 0,1 % | Prima PAWW 2026 | art. 55.2 |
| 0,30 % / 0,70 % | Topes seguro complemento enfermedad | art. 29.4 |
| 30 % | Máximo intercambiable ET-regeling | art. 37.2.c |
| 8,33 % | Paga vacaciones, régimen transitorio | art. 36a.2 |
| 16 2/3 h | Vacaciones/mes, régimen transitorio | art. 36a.2 |
| 52 semanas | Duración fase A | art. 14 (ambas versiones — verificado contra PDF) |
| 9 meses | Conservación de la clasificación | art. 25.4 |
| 2 meses / 36 h | Garantía de ingresos / jornada referencia | art. 52 |
| 4 semanas | Plazo para dejar la vivienda | art. 49.5 |
| 12 m² / 10 m² | Superficie mínima alojamiento | Anexo IV |

**Nota sobre el salario mínimo (WML):** cambia el 1 de enero y el 1 de julio
de cada año. No está en esta tabla porque se saca de Rijksoverheid, no del
CAO. Toca revisarlo cada seis meses (ver cadencia).

---

## Munición ya localizada en el convenio

Referencias listas para ser citadas. No son un resumen del artículo — son un
puntero para el redactor.

### Contrato en tu idioma

- **art. 49.13** — contrato y documentos anexos disponibles en neerlandés y en
  la lengua del trabajador.
- **art. 51.4 y 50.2** — listado de retenciones y compensaciones también en su
  idioma.
- **art. 5.2** — copia escrita del convenio antes de firmar.

### Anexo I — Loonstrook

14 datos obligatorios: importe, desglose, retenciones, salario bruto por hora,
horas trabajadas, recargos por tipo en % y en euros, nombre de la ETT, nombre
del trabajador, nombre y localidad de la empresa cliente si es posible,
clasificación en ella, salario pagado, salario mínimo legal del periodo,
explicación de las abreviaturas, otras retenciones.

### Vivienda

- **art. 49.1** — el alojamiento no puede imponerse ni exigirse como condición
  para el destino.
- **art. 49.4.c** — deuda de alquiler no retenida en cuatro semanas se compensa
  y no puede recuperarse después.
- **art. 49.5** — cuatro semanas para dejar la vivienda, alquiler no superior
  al del periodo de empleo, pago semanal, no exigible por adelantado.
- **Anexo IV** — 12 m² vivienda normal, 10 m² hotel/chalet, un baño y una
  ducha por cada 8 personas, 30 l de nevera por persona, mínimo 4 fuegos,
  ficha informativa en el idioma de los residentes, alguien localizable 24 h.

### Garantía de ingresos

- **art. 52** — reclutado fuera de NL, los dos primeros meses al menos el
  salario mínimo a jornada completa, con independencia de la duración del
  contrato y de las horas trabajadas.

### Retenciones excluidas

- **art. 51.3** — acompañamiento social y administración.
- **art. 50.1** — solo multas judiciales o administrativas.
- **art. 51.2** — transporte al país de origen, nunca por encima de los costes
  reales.
- **art. 49.19** — no pueden obligar a pagos en efectivo.
- **art. 49.18** — devoluciones de T-biljet o zorgtoeslag solo a la cuenta del
  trabajador.

### Carga de la prueba a favor del trabajador

- **art. 12.3** — horas trabajadas.
- **art. 30.4** — festivo no concedido.
- **art. 27.1.a** — se presume la subida de escalón.

### Reunir expediente

- **art. 5.4** — a petición, listado de todos los contratos con fechas,
  trabajos realizados y empresas cliente.

### Reclamar

- **art. 56** — Comisión de Conflictos, plazos: 3 semanas para hablar con la
  ETT, 4 para queja, 3 para decisión, 4 para elevarlo.
- **art. 58** — la SNCU vigila el cumplimiento y la ETT debe acreditar que
  aplica el convenio.

---

## Registro público de correcciones

Ruta: **`/correcciones`**.

Cuando se detecta un error en una guía publicada, se corrige en la guía y se
añade una entrada en el registro con:

- Fecha de la corrección.
- Guía afectada (título y slug).
- Qué decía antes (literal).
- Qué dice ahora (literal).
- Motivo del cambio (fuente que lo justifica).

Publicar los propios errores es la mejor prueba de rigor y elimina el
argumento de que algo se ocultó.

---

## Cadencia de revisión

La serie entra en revisión en cualquiera de estos eventos:

- **La ABU publica una versión nueva del CAO.** Revisión completa.
- **1 de enero de cada año.** WML cambia y ajustes de tablas.
- **1 de julio de cada año.** WML cambia.
- **Como mínimo cada seis meses**, aunque no haya cambios visibles.

En cada revisión se actualiza `fecha_revision` en el front matter de cada
guía revisada.
