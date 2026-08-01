import { readFileSync } from 'fs';

// ─── Env ─────────────────────────────────────────────────────────────────────

export function loadEnv() {
  try {
    const raw = readFileSync('.env.local', 'utf-8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  } catch { /* .env.local no existe, confiar en process.env */ }
}

function extractRef(supabaseUrl) {
  const m = supabaseUrl.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co/);
  return m ? m[1] : null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Guardas de producción ─────────────────────────────────────────────────
//
// Todo script que escribe en Supabase debe llamar a assertGuards() antes de
// crear el cliente. Exige --confirm-prod o --dry-run (nunca ninguna, nunca
// ambas), imprime a qué proyecto apunta, y da un margen para abortar antes de
// escribir de verdad. Ver CLAUDE.md § Guardas de entorno.

export async function assertGuards(scriptName) {
  loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
    process.exit(1);
  }

  const ref = extractRef(supabaseUrl);
  if (!ref) {
    console.error(`❌ No se pudo extraer el ref del proyecto desde NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`);
    console.error('   Formato esperado: https://<ref>.supabase.co — abortando (fail-closed).');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const hasConfirm = args.includes('--confirm-prod');
  const hasDryRun  = args.includes('--dry-run');

  if (hasConfirm && hasDryRun) {
    console.error('❌ --confirm-prod y --dry-run son excluyentes. Usa solo una.');
    process.exit(1);
  }

  if (!hasConfirm && !hasDryRun) {
    console.error(`❌ ${scriptName} escribe en Supabase. Pasa una flag explícita:`);
    console.error('   --dry-run       simula sin escribir nada');
    console.error('   --confirm-prod  escribe de verdad, tras cuenta atrás de 5s');
    process.exit(1);
  }

  console.log('─'.repeat(60));
  console.log(`  ${scriptName}`);
  console.log(`  Proyecto Supabase (ref): ${ref}`);
  console.log(`  URL: ${supabaseUrl}`);
  console.log(`  Modo: ${hasConfirm ? 'ESCRITURA REAL (--confirm-prod)' : 'DRY-RUN (simulación, no escribe)'}`);
  console.log('─'.repeat(60));

  if (hasConfirm) {
    console.log('\n⚠️  Vas a escribir en el proyecto de arriba. Ctrl+C para abortar.');
    for (let s = 5; s > 0; s--) {
      process.stdout.write(`\r  Empezando en ${s}s… `);
      await sleep(1000);
    }
    process.stdout.write('\r  Empezando…            \n');
  }

  return { dryRun: hasDryRun, supabaseUrl, serviceKey };
}

// ─── Escrituras condicionadas a dry-run ────────────────────────────────────
//
// Envuelve cualquier llamada de escritura a Supabase (.upsert/.insert/.update/
// .delete). En dry-run se limita a loguear e imita la forma de retorno
// { data: null, error: null } para que el código de llamada no tenga que
// ramificar por su cuenta.

export async function runWrite(dryRun, label, fn) {
  if (dryRun) {
    console.log(`  [dry-run] ${label}`);
    return { data: null, error: null };
  }
  return await fn();
}
