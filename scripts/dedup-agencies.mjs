import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = readFileSync('.env.local', 'utf-8');
for (const line of env.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

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
    const { error } = await sb.from('agencies').delete().in('id', batch);
    if (error) console.error('Error:', error.message);
  }
  console.log(`Duplicados eliminados: ${toDelete.length}`);
} else {
  console.log('Sin duplicados que eliminar');
}

const { count } = await sb.from('agencies').select('*', { count: 'exact', head: true });
console.log(`Total en Supabase: ${count}`);
