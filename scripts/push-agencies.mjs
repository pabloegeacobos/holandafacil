#!/usr/bin/env node
/**
 * push-agencies.mjs
 *
 * Lee el JSON generado por seed-agencies.mjs y lo sube directamente a Supabase:
 *   1. Inserta/actualiza las 1907 ETTs con sus certificaciones
 *   2. Fusiona las agencias existentes (con reviews) que no tienen certificaciones
 *      buscando su equivalente en el seed por nombre normalizado
 *   3. Elimina los duplicados que quedaron sin reviews tras la fusión
 *
 * Run: node scripts/push-agencies.mjs
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { assertGuards, runWrite } from './lib/guard.mjs';

const { dryRun, supabaseUrl, serviceKey } = await assertGuards('push-agencies.mjs');

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normaliseName(name) {
  return name.toLowerCase()
    .replace(/\bb\.?v\.?\b/g, '')
    .replace(/\bn\.?v\.?\b/g, '')
    .replace(/[-,./()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function chunks(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ─── 1. Cargar el JSON del seed ───────────────────────────────────────────────

let agencies;
try {
  agencies = JSON.parse(readFileSync('scripts/agencies-seed.json', 'utf-8'));
} catch {
  console.error('❌ No se encontró scripts/agencies-seed.json');
  console.error('   Ejecuta primero: node scripts/seed-agencies.mjs');
  process.exit(1);
}

console.log(`📋 ${agencies.length} agencias cargadas del seed`);

// ─── 2. Upsert en lotes de 100 ────────────────────────────────────────────────

console.log('\n📤 Subiendo a Supabase…');

// Separar por KvK: los que tienen KvK usan ON CONFLICT; los sin KvK se comparan por nombre
const withKvK    = agencies.filter(a => a.kvk);
const withoutKvK = agencies.filter(a => !a.kvk);

// ── Obtener nombres ya existentes sin KvK para no duplicar ──
const { data: existingNoKvK } = await supabase
  .from('agencies')
  .select('name')
  .is('kvk', null);

const existingNamesNoKvK = new Set((existingNoKvK ?? []).map(a => normaliseName(a.name)));

const toInsertNoKvK = withoutKvK.filter(a => !existingNamesNoKvK.has(normaliseName(a.name)));

console.log(`  Con KvK: ${withKvK.length} (upsert) | Sin KvK: ${withoutKvK.length} → ${toInsertNoKvK.length} nuevas`);

let inserted = 0;
let errors   = 0;

// Upsert con KvK (ON CONFLICT actualiza certifications y city)
for (const batch of chunks(withKvK.map(a => ({ name: a.name, city: a.city ?? null, kvk: a.kvk, certifications: a.certifications ?? [] })), 100)) {
  const { error } = await runWrite(dryRun, `upsert lote de ${batch.length} agencias (con kvk)`, () =>
    supabase.from('agencies').upsert(batch, { onConflict: 'kvk', ignoreDuplicates: false })
  );

  if (error) {
    if (error.code === '42703') {
      console.error('\n❌ Las columnas kvk o certifications no existen todavía.');
      console.error('   Ejecuta en Supabase SQL Editor:');
      console.error('   ALTER TABLE agencies ADD COLUMN IF NOT EXISTS kvk TEXT UNIQUE;');
      console.error('   ALTER TABLE agencies ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT \'{}\';');
      process.exit(1);
    }
    console.error(`  ⚠ Error en lote (kvk): ${error.message}`);
    errors++;
  } else {
    inserted += batch.length;
    process.stdout.write(`\r  ${inserted}/${agencies.length} procesadas…`);
  }
}

// Insert sin KvK (solo las que no existen aún)
for (const batch of chunks(toInsertNoKvK.map(a => ({ name: a.name, city: a.city ?? null, kvk: null, certifications: a.certifications ?? [] })), 100)) {
  const { error } = await runWrite(dryRun, `insert lote de ${batch.length} agencias (sin kvk)`, () =>
    supabase.from('agencies').insert(batch)
  );

  if (error) {
    console.error(`  ⚠ Error en lote (sin kvk): ${error.message}`);
    errors++;
  } else {
    inserted += batch.length;
    process.stdout.write(`\r  ${inserted}/${agencies.length} procesadas…`);
  }
}

console.log(`\n  ✓ ${inserted} agencias procesadas${errors > 0 ? `, ${errors} lotes con errores` : ''}`);

// ─── 3. Fusionar agencias existentes con reviews ──────────────────────────────
// Las agencias creadas por reviews (Randstad, Adecco…) no tienen KvK,
// así que el upsert no las actualizó. Las buscamos por nombre normalizado.

console.log('\n🔀 Fusionando agencias existentes con reviews…');

const { data: withReviews, error: fetchErr } = await supabase
  .from('agencies')
  .select('id, name, kvk, certifications, city, total_reviews')
  .gt('total_reviews', 0);

if (fetchErr) {
  console.error('  ⚠ No se pudieron obtener agencias con reviews:', fetchErr.message);
} else {
  // Índice del seed por nombre normalizado
  const seedByName = new Map();
  for (const a of agencies) {
    seedByName.set(normaliseName(a.name), a);
  }

  // Construir set de nombres normalizados de agencias CON reviews (para la limpieza posterior)
  const withReviewsNames = new Set(withReviews.map(a => normaliseName(a.name)));

  // ─── 4. Borrar duplicados sin reviews PRIMERO ──────────────────────────────
  // Hay que hacerlo antes de actualizar el kvk en la agencia con reviews,
  // porque el seed ya insertó una fila con ese KvK (0 reviews).

  console.log('\n🗑  Eliminando duplicados del seed (0 reviews, nombre ya existente)…');

  const { data: zeroes, error: zeroErr } = await supabase
    .from('agencies')
    .select('id, name, kvk, certifications, city, total_reviews')
    .eq('total_reviews', 0);

  // Índice de duplicados por nombre normalizado → datos del seed
  const seedDupByName = new Map();
  if (!zeroErr) {
    for (const a of (zeroes ?? [])) {
      if (withReviewsNames.has(normaliseName(a.name))) {
        seedDupByName.set(normaliseName(a.name), a);
      }
    }
  }

  const idsToDelete = [...seedDupByName.values()].map(a => a.id);
  if (idsToDelete.length > 0) {
    const { error: delErr } = await runWrite(dryRun, `eliminar ${idsToDelete.length} duplicados`, () =>
      supabase.from('agencies').delete().in('id', idsToDelete)
    );

    if (delErr) {
      console.error(`  ⚠ Error al borrar duplicados: ${delErr.message}`);
    } else {
      console.log(`  ✓ ${idsToDelete.length} duplicados eliminados`);
    }
  } else {
    console.log('  ✓ Sin duplicados que eliminar');
  }

  // ─── 5. Ahora actualizar agencias con reviews ───────────────────────────────
  // El KvK ya está libre — podemos actualizar sin conflicto de unicidad.

  let merged = 0;

  for (const existing of withReviews) {
    if ((existing.certifications ?? []).length > 0) continue; // ya tiene badges

    const norm = normaliseName(existing.name);
    const match = seedByName.get(norm);
    if (!match || !match.certifications?.length) continue;

    const { error: updErr } = await runWrite(
      dryRun,
      `actualizar "${existing.name}" → certifications=[${match.certifications.join(', ')}], kvk=${match.kvk ?? null}`,
      () => supabase
        .from('agencies')
        .update({
          certifications: match.certifications,
          kvk:            match.kvk ?? null,
          city:           existing.city ?? match.city ?? null,
        })
        .eq('id', existing.id)
    );

    if (updErr) {
      console.error(`  ⚠ No se pudo actualizar ${existing.name}: ${updErr.message}`);
    } else {
      merged++;
    }
  }

  console.log(`  ✓ ${merged} agencias con reviews actualizadas con certificaciones`);
}

// ─── Resumen ──────────────────────────────────────────────────────────────────

const { count } = await supabase
  .from('agencies')
  .select('*', { count: 'exact', head: true });

if (dryRun) {
  console.log(`\n🔎 Dry-run completado. Total actual en Supabase (sin cambios): ${count}`);
} else {
  console.log(`\n🎉 Listo. Total de agencias en Supabase: ${count}`);
  console.log('   Recarga http://localhost:3000/es/ett para ver los badges.');
}
