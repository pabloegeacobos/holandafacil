import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
const env = readFileSync('.env.local', 'utf-8');
for (const line of env.split('\n')) { const m = line.match(/^([^#=]+)=(.*)/); if (m) process.env[m[1].trim()] = m[2].trim(); }
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Agencias con reviews
const { data: withR } = await sb.from('agencies').select('id,name,kvk,certifications,total_reviews').gt('total_reviews',0);
console.log('=== Agencias con reviews ===');
for (const a of (withR??[])) console.log(JSON.stringify(a));

// Verificar que Randstad existe en el seed JSON con certificaciones
const seed = JSON.parse(readFileSync('scripts/agencies-seed.json','utf-8'));
const randstad = seed.filter(a => /randstad/i.test(a.name));
console.log('\n=== Randstad en seed ===');
randstad.slice(0,5).forEach(a => console.log(JSON.stringify(a)));
