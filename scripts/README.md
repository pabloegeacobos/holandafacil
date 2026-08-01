# scripts/

Scripts de mantenimiento que operan sobre datos en Supabase. `scripts/` y
`supabase/` no se reorganizan (ver `CLAUDE.md`) — rutas relativas a la raíz
del repo, así que siempre se ejecutan con `node scripts/<script>.mjs` desde
la raíz.

## Guardas de producción

`push-agencies.mjs`, `dedup-agencies.mjs`, `fix-certs.mjs` y `seed-demo.mjs`
escriben directamente en Supabase con la service role key. Los cuatro
comparten el guard de `scripts/lib/guard.mjs` y exigen una flag explícita:

- `--dry-run` — simula la ejecución: hace las mismas lecturas, imprime qué
  escribiría, pero no toca Supabase.
- `--confirm-prod` — ejecuta de verdad. Imprime el `ref` del proyecto
  Supabase al que apunta `NEXT_PUBLIC_SUPABASE_URL` y espera 5s (Ctrl+C
  aborta) antes de empezar a escribir.

Sin ninguna de las dos flags, el script aborta con exit 1 (fail-closed).
Pasar ambas a la vez también aborta.

## Limitaciones del dry-run

`push-agencies.mjs` hace lecturas intermedias (agencias con `total_reviews`
0) que dependen de escrituras anteriores del propio script: la fase que
borra duplicados lee la tabla después de que el upsert haya insertado la
fila del seed, y esa fila es la que compara contra las agencias con
reviews para decidir qué borrar.

En `--dry-run` ese upsert nunca ocurre, así que la lectura de duplicados
solo ve el estado que ya existía en Supabase antes de ejecutar el script,
no el estado intermedio que una ejecución real generaría. El resultado es
que el dry-run sistemáticamente **subestima** cuántas filas se borrarían.

Conclusión práctica: usa `--dry-run` para revisar la forma general de la
ejecución (qué lotes se subirían, qué actualizaciones se harían), pero no
lo trates como garantía de que `--confirm-prod` no borrará nada. Solo una
ejecución real muestra el número de duplicados definitivo.

## Scripts

### `push-agencies.mjs`

Sube el JSON de `seed-agencies.mjs` a Supabase: upsert/insert de agencias,
fusión de agencias existentes con reviews, y limpieza de duplicados.

```
node scripts/push-agencies.mjs --dry-run
node scripts/push-agencies.mjs --confirm-prod
```

### `dedup-agencies.mjs`

Elimina agencias duplicadas (sin KvK, sin reviews, mismo nombre
normalizado).

```
node scripts/dedup-agencies.mjs --dry-run
node scripts/dedup-agencies.mjs --confirm-prod
```

### `fix-certs.mjs`

Asigna certificaciones a agencias con reviews que aún no las tienen, por
coincidencia de nombre (exacta o por prefijo) con el seed.

```
node scripts/fix-certs.mjs --dry-run
node scripts/fix-certs.mjs --confirm-prod
```

### `seed-demo.mjs`

Ignorado en `.gitignore`, no se versiona. No puede contener nombres de
agencias reales — cualquier reseña insertada debe atribuirse a empresas
ficticias (ver `CLAUDE.md`).

```
node scripts/seed-demo.mjs --dry-run
node scripts/seed-demo.mjs --confirm-prod
```
