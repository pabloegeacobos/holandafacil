/**
 * fix-certs.mjs
 * Asigna certificaciones a las agencias con reviews que no las tienen todavía,
 * usando matching por prefijo contra el seed (Randstad, Adecco, Tempo-Team…)
 */
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { assertGuards, runWrite } from './lib/guard.mjs';

const { dryRun, supabaseUrl, serviceKey } = await assertGuards('fix-certs.mjs');

const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

function norm(name) {
  return name.toLowerCase()
    .replace(/\bb\.?v\.?\b/g, '').replace(/\bn\.?v\.?\b/g, '')
    .replace(/[-,./()]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Agencias con reviews que aún no tienen certifications
const { data: uncertified } = await sb
  .from('agencies')
  .select('id, name, kvk, certifications')
  .gt('total_reviews', 0)
  .eq('certifications', '{}');

if (!uncertified?.length) { console.log('✓ Todas las agencias con reviews ya tienen certificaciones.'); process.exit(0); }
console.log(`Agencias sin certificaciones: ${uncertified.map(a => a.name).join(', ')}`);

// Seed como índice de nombre normalizado → certs union
const seed = JSON.parse(readFileSync('scripts/agencies-seed.json', 'utf-8'));
const seedIndex = new Map(); // norm → Set<cert>
for (const s of seed) {
  const key = norm(s.name);
  if (!seedIndex.has(key)) seedIndex.set(key, new Set());
  for (const c of s.certifications) seedIndex.get(key).add(c);
}

function findCerts(agencyName) {
  const agNorm = norm(agencyName);
  // 1. Coincidencia exacta
  if (seedIndex.has(agNorm)) return [...seedIndex.get(agNorm)];
  // 2. Prefijo: alguna entrada del seed empieza por el nombre de la agencia
  const certs = new Set();
  for (const [seedNorm, certSet] of seedIndex) {
    if (seedNorm.startsWith(agNorm) || agNorm.startsWith(seedNorm)) {
      for (const c of certSet) certs.add(c);
    }
  }
  return certs.size ? [...certs] : null;
}

for (const agency of uncertified) {
  const certs = findCerts(agency.name);
  if (!certs) { console.log(`  ✗ Sin match en seed: ${agency.name}`); continue; }

  const { error } = await runWrite(dryRun, `actualizar "${agency.name}" → certifications=[${certs.join(', ')}]`, () =>
    sb.from('agencies').update({ certifications: certs }).eq('id', agency.id)
  );
  if (error) console.error(`  ⚠ ${agency.name}: ${error.message}`);
  else console.log(`  ✓ ${agency.name} → [${certs.join(', ')}]`);
}
