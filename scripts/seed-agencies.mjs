#!/usr/bin/env node
/**
 * seed-agencies.mjs
 *
 * Builds the agencies seed from three official Dutch registries:
 *   1. ABU  — abu.nl HTML ledenregister (52 pages, ~500 members)       PRIMARY ETT source
 *   2. NBBU — nbbu.nl sitemap XML (1300+ members, names only)           PRIMARY ETT source
 *   3. SNA  — normeringarbeid.nl Excel export (5676 certified companies) BADGE only
 *
 * ABU and NBBU are ETT-specific associations. SNA certifies all labour
 * intermediaries (including construction, cleaning, etc.) so it is used
 * only to enrich the SNA badge on companies already found in ABU/NBBU.
 *
 * Merges by KvK (primary key). NBBU-only entries matched by normalised name.
 * Outputs:
 *   scripts/agencies-seed.json        — full structured data
 *   supabase/seed-agencies.sql        — ready-to-run Supabase upsert SQL
 *
 * Run: node scripts/seed-agencies.mjs
 * Run with all SNA companies too: node scripts/seed-agencies.mjs --include-sna-only
 */

import { writeFileSync } from 'fs';
import { readFile } from 'fs/promises';
import * as XLSX from 'xlsx';

// ─── Config ──────────────────────────────────────────────────────────────────

const SNA_URL  = 'https://www.normeringarbeid.nl/snakeurmerk/gecertificeerde-ondernemingen/export';
const ABU_BASE = 'https://www.abu.nl/over-abu/ledenregister/page/';
const ABU_PAGES = 52;
const NBBU_SITEMAP_PAGES = [1]; // all member URLs appear to be in page 1

// SNA activities that qualify as ETT (uitzendbureau)
const ETT_ACTIVITIES = [
  'ter beschikking stellen van arbeid',
  'tussenkomst',
  'bemiddeling',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/** Polite fetch with retries */
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'HolandaFacil-AgencySeeder/1.0 (hola@holandafacil.com)' },
        ...options,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      return res;
    } catch (e) {
      if (i === retries - 1) throw e;
      console.warn(`  Retry ${i + 1}/${retries - 1} for ${url}: ${e.message}`);
      await sleep(1500 * (i + 1));
    }
  }
}

/** Extract text from HTML cell — strips tags */
function cellText(td) {
  return td.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '').replace(/&\w+;/g, '').replace(/\s+/g, ' ').trim();
}

/** Extract KvK (8 digits) from a string */
function extractKvK(text) {
  const m = text.replace(/\s/g, '').match(/\b(\d{8})\b/);
  return m ? m[1] : null;
}

/** Normalise a company name for fuzzy matching */
function normaliseName(name) {
  return name
    .toLowerCase()
    .replace(/\bb\.?v\.?\b/g, '')
    .replace(/\bn\.?v\.?\b/g, '')
    .replace(/\bg\.?m\.?b\.?h\.?\b/g, '')
    .replace(/[-,./()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract city from Dutch address string (last segment after comma) */
function cityFromAddress(addr) {
  if (!addr) return null;
  // Typical: "Straat 1, 1234 AB Amsterdam, Nederland"
  const parts = addr.split(',');
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i].trim().replace(/nederland/i, '').trim();
    if (p && !/^\d{4}\s?[A-Z]{2}$/.test(p) && p.length > 1) return p;
  }
  return null;
}

// ─── 1. SNA Excel ─────────────────────────────────────────────────────────────

async function fetchSNA() {
  console.log('\n📥 SNA: downloading Excel export…');
  const res = await fetchWithRetry(SNA_URL);
  const buf = Buffer.from(await res.arrayBuffer());

  const wb = XLSX.read(buf, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  // Detect header row (first row with >2 non-empty cells)
  let headerIdx = 0;
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    if (rows[i].filter(Boolean).length > 2) { headerIdx = i; break; }
  }
  const headers = rows[headerIdx].map(h => String(h).toLowerCase().trim());
  console.log(`  Headers detected: ${headers.join(' | ')}`);

  // Find column indices by keyword
  const col = (kw) => headers.findIndex(h => h.includes(kw));
  const iName     = col('naam') !== -1 ? col('naam') : col('name') !== -1 ? col('name') : 0;
  const iKvK      = col('kvk') !== -1 ? col('kvk') : col('kamer') !== -1 ? col('kamer') : -1;
  const iAddr     = col('adres') !== -1 ? col('adres') : col('address') !== -1 ? col('address') : -1;
  const iCity     = col('stad') !== -1 ? col('stad') : col('plaats') !== -1 ? col('plaats') : -1;
  const iActivity = col('activiteit') !== -1 ? col('activiteit') : col('activit') !== -1 ? col('activit') : -1;

  console.log(`  Column mapping → name:${iName} kvk:${iKvK} addr:${iAddr} city:${iCity} activity:${iActivity}`);

  const companies = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    const name = String(row[iName] ?? '').trim();
    if (!name) continue;

    const activityRaw = iActivity !== -1 ? String(row[iActivity] ?? '').toLowerCase() : '';
    const isETT = iActivity === -1 || ETT_ACTIVITIES.some(a => activityRaw.includes(a));
    if (!isETT) continue;

    const kvkRaw = iKvK !== -1 ? String(row[iKvK] ?? '').trim() : '';
    const kvk = extractKvK(kvkRaw) ?? extractKvK(String(row[iKvK + 1] ?? ''));

    let city = null;
    if (iCity !== -1 && row[iCity]) {
      city = String(row[iCity]).trim() || null;
    } else if (iAddr !== -1 && row[iAddr]) {
      city = cityFromAddress(String(row[iAddr]));
    }

    companies.push({ name, kvk, city, certifications: ['SNA'] });
  }

  console.log(`  ✓ ${companies.length} ETT companies extracted from SNA`);
  return companies;
}

// ─── 2. ABU HTML Pages ────────────────────────────────────────────────────────

async function fetchABU() {
  console.log('\n📥 ABU: scraping ledenregister…');
  const companies = [];
  let empty = 0;

  for (let page = 1; page <= ABU_PAGES; page++) {
    const url = page === 1
      ? 'https://www.abu.nl/over-abu/ledenregister/'
      : `${ABU_BASE}${page}/`;

    let html;
    try {
      const res = await fetchWithRetry(url);
      html = await res.text();
    } catch (e) {
      console.warn(`  Page ${page} failed: ${e.message}`);
      empty++;
      if (empty > 3) { console.warn('  Too many failures, stopping ABU scrape'); break; }
      continue;
    }

    // Extract table rows — look for <tr> blocks inside the member table
    // ABU uses a standard WordPress table structure
    const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/gi) ?? [];
    let pageCount = 0;

    for (const table of tableMatch) {
      const rows = table.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
      for (const row of rows) {
        const cells = (row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) ?? []).map(td => cellText(td));
        if (cells.length < 2) continue;

        // Skip header row
        if (cells.some(c => /naam|name|kvk|adres/i.test(c))) continue;

        const name = cells[0];
        if (!name || name.length < 2) continue;

        // Find KvK — look for 8-digit number in any cell
        let kvk = null;
        for (const c of cells) {
          kvk = extractKvK(c);
          if (kvk) break;
        }

        // City — address is typically cell[1], look for postal-code + city pattern
        let city = null;
        for (const c of cells.slice(1)) {
          const m = c.match(/\d{4}\s?[A-Z]{2}\s+([A-Za-z\s\-]+)/);
          if (m) { city = m[1].trim(); break; }
          // Or just city after last comma
          const cityFallback = cityFromAddress(c);
          if (cityFallback && !cityFallback.match(/\d/)) { city = cityFallback; break; }
        }

        companies.push({ name, kvk, city, certifications: ['ABU'] });
        pageCount++;
      }
    }

    // Fallback: if no table found, try list-based structure (divs/articles)
    if (pageCount === 0) {
      const divRows = html.match(/class="[^"]*(?:member|lid|register-row|company)[^"]*"[\s\S]*?(?=class="[^"]*(?:member|lid|register-row|company)|<\/ul>|<\/div>\s*<\/div>)/gi) ?? [];
      for (const block of divRows) {
        const name = cellText(block.match(/<h\d[^>]*>([\s\S]*?)<\/h\d>/i)?.[1] ?? '');
        if (!name || name.length < 2) continue;
        const kvk = extractKvK(block);
        companies.push({ name, kvk, city: null, certifications: ['ABU'] });
        pageCount++;
      }
    }

    process.stdout.write(`\r  Page ${page}/${ABU_PAGES} — ${companies.length} found so far   `);
    await sleep(300); // polite delay
  }

  console.log(`\n  ✓ ${companies.length} companies extracted from ABU`);
  return companies;
}

// ─── 3. NBBU Sitemap ──────────────────────────────────────────────────────────

async function fetchNBBU() {
  console.log('\n📥 NBBU: parsing sitemap XML…');
  const names = new Set();

  for (const page of NBBU_SITEMAP_PAGES) {
    const url = `https://www.nbbu.nl/sitemap.xml?page=${page}`;
    let xml;
    try {
      const res = await fetchWithRetry(url);
      xml = await res.text();
    } catch (e) {
      console.warn(`  Sitemap page ${page} failed: ${e.message}`);
      continue;
    }

    // Extract all /nl/onze-leden/<slug> URLs
    const slugs = [...xml.matchAll(/\/nl\/onze-leden\/([a-z0-9][a-z0-9\-]+)/g)].map(m => m[1]);
    for (const slug of slugs) {
      names.add(slug);
    }
  }

  // Convert slug to display name:
  // "worktrans-dienstverlening-bv" → "Worktrans Dienstverlening B.V."
  const companies = [...names].map(slug => {
    const raw = slug.replace(/-bv$/, ' B.V.').replace(/-nv$/, ' N.V.');
    const name = raw.split('-').map(w =>
      w === 'b.v.' || w === 'n.v.' ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
    return { name, kvk: null, city: null, certifications: ['NBBU'], slug };
  });

  console.log(`  ✓ ${companies.length} NBBU companies extracted from sitemap`);
  return companies;
}

// ─── 4. Merge ─────────────────────────────────────────────────────────────────

function merge(sna, abu, nbbu, { includeSnaOnly = false } = {}) {
  console.log('\n🔀 Merging datasets…');

  /** Map<kvk, agency> */
  const byKvK = new Map();
  /** Map<normalisedName, kvk> */
  const nameIndex = new Map();

  function addCerts(existing, certifications, city) {
    for (const c of certifications) {
      if (!existing.certifications.includes(c)) existing.certifications.push(c);
    }
    if (!existing.city && city) existing.city = city;
  }

  function upsert(company) {
    const { name, kvk, city, certifications } = company;
    const norm = normaliseName(name);

    if (kvk) {
      if (byKvK.has(kvk)) {
        // Exact KvK match — merge certs
        addCerts(byKvK.get(kvk), certifications, city);
      } else if (nameIndex.has(norm)) {
        // Name match (e.g. NBBU name-keyed entry) — merge + upgrade to KvK key
        const existingKey = nameIndex.get(norm);
        const existing = byKvK.get(existingKey);
        addCerts(existing, certifications, city);
        if (!existing.kvk) {
          existing.kvk = kvk;
          byKvK.delete(existingKey);
          byKvK.set(kvk, existing);
          nameIndex.set(norm, kvk);
        }
      } else {
        // New company
        byKvK.set(kvk, { name, kvk, city, certifications: [...certifications] });
        nameIndex.set(norm, kvk);
      }
    } else {
      // No KvK — match by normalised name only
      if (nameIndex.has(norm)) {
        addCerts(byKvK.get(nameIndex.get(norm)), certifications, city);
      } else {
        // New company without KvK
        const tempKey = `name:${norm}`;
        byKvK.set(tempKey, { name, kvk: null, city, certifications: [...certifications] });
        nameIndex.set(norm, tempKey);
      }
    }
  }

  // ABU and NBBU first — they define what is an ETT
  for (const c of abu)  upsert(c);
  for (const c of nbbu) upsert(c);

  // SNA: enrich existing entries with badge, optionally add new ones
  for (const c of sna) {
    if (!includeSnaOnly) {
      // Only add the SNA tag to already-known ETTs; skip SNA-only companies
      const norm = normaliseName(c.name);
      const existsByName = nameIndex.has(norm);
      const existsByKvK  = c.kvk && byKvK.has(c.kvk);
      if (!existsByName && !existsByKvK) continue;
    }
    upsert(c);
  }

  const result = [...byKvK.values()];
  const withKvK    = result.filter(c => c.kvk).length;
  const withoutKvK = result.filter(c => !c.kvk).length;
  const multiCert  = result.filter(c => c.certifications.length > 1).length;

  console.log(`  Total unique agencies: ${result.length}`);
  console.log(`  With KvK: ${withKvK} | Without KvK: ${withoutKvK}`);
  console.log(`  Multi-certification: ${multiCert}`);
  console.log(`  SNA only: ${result.filter(c => c.certifications.join() === 'SNA').length}`);
  console.log(`  ABU only: ${result.filter(c => c.certifications.join() === 'ABU').length}`);
  console.log(`  NBBU only: ${result.filter(c => c.certifications.join() === 'NBBU').length}`);

  return result;
}

// ─── 5. Output ────────────────────────────────────────────────────────────────

function writeJSON(agencies) {
  const path = 'scripts/agencies-seed.json';
  writeFileSync(path, JSON.stringify(agencies, null, 2), 'utf-8');
  console.log(`\n✅ JSON written → ${path}`);
}

function writeSQL(agencies) {
  const escape = (s) => s ? s.replace(/'/g, "''") : null;
  const arr = (a) => `'{${a.map(s => `"${s}"`).join(',')}}'`;

  const lines = [
    '-- Auto-generated by scripts/seed-agencies.mjs',
    '-- Run in Supabase SQL editor after running the migration below',
    '',
    '-- Migration (run once):',
    '-- ALTER TABLE agencies ADD COLUMN IF NOT EXISTS kvk TEXT UNIQUE;',
    '-- ALTER TABLE agencies ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT \'{}\';',
    '',
    '-- Upsert all agencies (insert new, update certifications/city if KvK matches):',
    'INSERT INTO agencies (name, city, kvk, certifications)',
    'VALUES',
  ];

  const rows = agencies.map((a, i) => {
    const name = escape(a.name);
    const city = a.city ? `'${escape(a.city)}'` : 'NULL';
    const kvk  = a.kvk  ? `'${a.kvk}'` : 'NULL';
    const cert = arr(a.certifications);
    const comma = i < agencies.length - 1 ? ',' : '';
    return `  ('${name}', ${city}, ${kvk}, ${cert})${comma}`;
  });

  lines.push(...rows);
  lines.push(
    'ON CONFLICT (kvk) DO UPDATE SET',
    '  certifications = EXCLUDED.certifications,',
    '  city = COALESCE(EXCLUDED.city, agencies.city);',
    '',
    `-- Total: ${agencies.length} agencies`,
  );

  const path = 'supabase/seed-agencies.sql';
  writeFileSync(path, lines.join('\n'), 'utf-8');
  console.log(`✅ SQL written → ${path}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const includeSnaOnly = process.argv.includes('--include-sna-only');

  console.log('🏭 HolandaFácil — Agency Seeder');
  console.log(`Sources: ABU (HTML) + NBBU (sitemap) + SNA (Excel, badge-only${includeSnaOnly ? ' + new entries' : ''})`);

  let sna = [], abu = [], nbbu = [];

  try { abu  = await fetchABU();  } catch (e) { console.error('ABU failed:', e.message); }
  try { nbbu = await fetchNBBU(); } catch (e) { console.error('NBBU failed:', e.message); }
  try { sna  = await fetchSNA();  } catch (e) { console.error('SNA failed:', e.message); }

  if (abu.length + nbbu.length === 0) {
    console.error('\n❌ Primary ETT sources (ABU + NBBU) both failed — check network and retry');
    process.exit(1);
  }

  const agencies = merge(sna, abu, nbbu, { includeSnaOnly });
  writeJSON(agencies);
  writeSQL(agencies);

  console.log('\n🎉 Done. Next steps:');
  console.log('  1. Run the ALTER TABLE migration in Supabase (see top of seed-agencies.sql)');
  console.log('  2. Review scripts/agencies-seed.json');
  console.log('  3. Run the INSERT in supabase/seed-agencies.sql');
  if (!includeSnaOnly) {
    console.log('\n  ℹ️  SNA-only companies excluded. Re-run with --include-sna-only to add them.');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
