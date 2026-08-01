import { createClient } from '@supabase/supabase-js';
import { assertGuards, runWrite } from './lib/guard.mjs';

const { dryRun, supabaseUrl, serviceKey } = await assertGuards('dedup-agencies.mjs');

const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

// Obtener todas las filas sin KvK y sin reviews (del seed)
const { data: all } = await sb.from('agencies').select('id, name, kvk, total_reviews').is('kvk', null).eq('total_reviews', 0);
console.log(`Filas sin KvK y sin reviews: ${all?.length}`);

// Quedarse con 1 por nombre, borrar el resto
const seen = new Map();
const toDelete = [];
for (const a of (all ?? [])) {
  const norm = a.name.toLowerCase().replace(/\s+/g, ' ').trim();
  if (seen.has(norm)) toDelete.push(a.id);
  else seen.set(norm, a.id);
}

if (toDelete.length) {
  for (let i = 0; i < toDelete.length; i += 500) {
    const batch = toDelete.slice(i, i + 500);
    const { error } = await runWrite(dryRun, `eliminar lote de ${batch.length} duplicados`, () =>
      sb.from('agencies').delete().in('id', batch)
    );
    if (error) console.error('Error:', error.message);
  }
  console.log(`${dryRun ? 'Duplicados que se eliminarían' : 'Duplicados eliminados'}: ${toDelete.length}`);
} else {
  console.log('Sin duplicados que eliminar');
}

const { count } = await sb.from('agencies').select('*', { count: 'exact', head: true });
console.log(`Total en Supabase${dryRun ? ' (sin cambios)' : ''}: ${count}`);
