#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────────────────
 *  Regenerate knowledgeBase.js + migration-006 SQL + prompt fragments
 *  from server/data/realCatalog.json (the client's official Fiverr 8-block
 *  JSON catalogue, 184 perfumes).
 *
 *  Run after editing realCatalog.json:
 *    cd server && node scripts/regenerate-knowledge-base.js
 *
 *  Outputs (overwrites):
 *    server/knowledgeBase.js
 *    server/db/migration-006-real-catalog.sql
 *    server/prompts/_mapping-table.generated.md   (paste into system.md)
 *    server/prompts/_glossary.generated.md        (paste into backend-appendix.md)
 * ───────────────────────────────────────────────────────────────────────── */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const raw = JSON.parse(readFileSync(path.join(ROOT, 'data/realCatalog.json'), 'utf8'));

/* ─── Helpers ──────────────────────────────────────────────────────────── */
function slugify(s) {
  return String(s).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // strip combining accents
    .replace(/[^a-z0-9]+/g, '-')                       // any non-alphanum run → '-'
    .replace(/^-+|-+$/g, '')                           // trim leading/trailing
    .slice(0, 60);
}

function jsEscape(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function sqlEscape(s) {
  return String(s).replace(/'/g, "''");
}

/* Build flat list with gender + source category. */
const items = [
  ...raw.classic_homme.map((x)     => ({ ...x, gender: 'H', category: 'classic_homme' })),
  ...raw.classic_femme.map((x)     => ({ ...x, gender: 'F', category: 'classic_femme' })),
  ...raw.collection_privee.map((x) => ({ ...x, gender: 'U', category: 'collection_privee' })),
].map((x) => ({ ...x, slug: slugify(x.code_site) }));

/* Sanity: every slug unique. */
const slugSet = new Set();
for (const it of items) {
  if (slugSet.has(it.slug)) {
    console.error('❌ Slug collision:', it.slug, 'for code_site', it.code_site);
    process.exit(1);
  }
  slugSet.add(it.slug);
}
console.log(`✓ ${items.length} unique slugs.`);

/* Build trigger arrays — what the customer might type that should silently
   route to this product. Always: "brand parfum", "parfum" alone, accent-stripped
   variants. Dedupe + lowercase. */
function buildTriggers(it) {
  const set = new Set();
  const add = (s) => {
    if (!s) return;
    const t = String(s).trim().toLowerCase();
    if (t.length < 2) return;
    set.add(t);
    // Accent-stripped variant
    const stripped = t.normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (stripped !== t) set.add(stripped);
  };
  add(`${it.marque} ${it.parfum}`);
  add(it.parfum);
  // Without apostrophes (so "l'interdit" also matches "linterdit")
  add(it.parfum.replace(/['']/g, ''));
  add(`${it.marque} ${it.parfum}`.replace(/['']/g, ''));
  // Apostrophe-as-space (so "l'interdit" also matches "l interdit")
  add(it.parfum.replace(/['']/g, ' '));
  add(`${it.marque} ${it.parfum}`.replace(/['']/g, ' '));
  return [...set].slice(0, 10);
}

/* Known high-traffic aliases (BR540, etc.) — keep server-side ALSO finding
   these even if the customer omits the brand. Indexed by code_site. */
const EXTRA_TRIGGERS = {
  'ROUGE 240':         ['br540', 'br 540', 'baccarat 540', 'rouge 540'],
  'ROUGE 240 INTENSE': ['baccarat intense', 'br540 intense'],
  'VIRIL':             ['jpg le male', 'gaultier le male', 'le male jpg'],
  'ULTRA VIRIL':       ['jpg ultra male'],
  'BLEU':              ['bleu chanel', 'bdc'],
  'DOLLARS':           ['one million', 'paco 1 million', 'rabanne 1 million'],
  'INVICTS':           ['paco invictus', 'rabanne invictus'],
  'BELLA VITA':        ['lancome la vie est belle', 'lancôme la vie est belle'],
  'EXTRAVAGANCE':      ['prada paradoxe'],
  'EVENT':             ['creed aventus', 'aventus creed'],
  'EVENT ABSOLU':      ['aventus absolu', 'creed aventus absolu'],
  'ON FIRE':           ['shl 777', 'shl777', 'god fire'],
  'GREATNESS':         ['initio oud for greatness', 'oud greatness'],
  'NOMADE':            ['louis vuitton ombre nomade', 'lv ombre nomade', 'ombre nomade lv'],
  'NIGHT MEN':         ['la nuit de lhomme', 'ysl la nuit de l homme'],
  '33 SANTAL':         ['santal 33 le labo', 'le labo santal'],
  '28 VANILLA':        ['kayali 28 vanilla', 'vanilla 28 kayali'],
  'FABULOUS':          ['fucking fabulous', 'tom ford fucking fabulous'],
  'CHERRY':            ['lost cherry', 'tom ford lost cherry'],
  'LEATHER':           ['ombre leather', 'tuscan leather', 'tom ford ombre leather'],
  'TOBACCO':           ['tobacco vanille', 'tom ford tobacco vanille'],
  'BLACKO':            ['ysl black opium'],
  'LIBERTY':           ['ysl libre', 'libre ysl'],
  'I LOVE IT':         ['j adore', 'jadore'],
  'TOXIC GIRL':        ['dior poison girl'],
  'BODYKO':            ['ysl body kouros', 'body kouros ysl', 'kouros body'],
  'CODY':              ['armani code'],
};

for (const it of items) {
  it.triggers = buildTriggers(it);
  const extras = EXTRA_TRIGGERS[it.code_site] || [];
  for (const e of extras) if (!it.triggers.includes(e)) it.triggers.push(e);
}

/* Build FORBIDDEN_TERMS — every distinct brand + parfum + dupe-vocab. */
const forbiddenSet = new Set([
  // generic dupe vocabulary
  'dupe of', 'dupe de', 'copy of', 'copie de', 'imitation de', 'imitation of',
  'similar to', 'comme le', 'comme la', 'version de', 'inspiré de', 'inspiré par',
  'inspired by', "c'est le dupe", "c'est un dupe", 'alternative à',
]);
for (const it of items) {
  if (it.marque) forbiddenSet.add(it.marque.toLowerCase());
  if (it.parfum) forbiddenSet.add(it.parfum.toLowerCase());
  // brand + parfum combined
  if (it.marque && it.parfum) forbiddenSet.add(`${it.marque} ${it.parfum}`.toLowerCase());
}
// drop sub-strings that are too short (1-2 chars) or false positives
for (const t of [...forbiddenSet]) {
  if (t.length < 3) forbiddenSet.delete(t);
}
const FORBIDDEN_TERMS = [...forbiddenSet].sort();

/* Out-of-stock list — empty by default. Admin marks épuisé in the panel. */
const OUT_OF_STOCK = new Set();

/* Family heuristic — only a rough hint, since the client didn't send notes.
   Admin can refine per-product later. */
function inferFamily(it) {
  const p = (it.parfum + ' ' + it.code_site).toLowerCase();
  if (/oud|ambre|musk|musc|tonka|encens|baccarat|orient/.test(p)) return 'Oriental Boisé';
  if (/vanille|caramel|gourmand|sucre|sucr|pistach|marshmallow|cherry|coco|chocol|miel/.test(p)) return 'Gourmand';
  if (/rose|fleur|flora|jasmin|tubereuse|tubéreuse|peony|pivoine/.test(p)) return 'Floral';
  if (/cuir|leather|tabac|tobacco|cèdre|cedre|bois|wood|santal/.test(p)) return 'Boisé';
  if (/citron|bergamote|fresh|aqua|marin|hesperidé|hespéridé|menthe/.test(p)) return 'Hespéridé Frais';
  return it.gender === 'F' ? 'Floral Oriental' : it.gender === 'H' ? 'Boisé Aromatique' : 'Oriental Mixte';
}

/* Section URL fallback (admin can override per-product). */
function urlFor(it) {
  if (it.category === 'classic_homme')     return 'https://eleganza-parfums.com/collections/hommes';
  if (it.category === 'classic_femme')     return 'https://eleganza-parfums.com/collections/femmes';
  return 'https://eleganza-parfums.com/collections/collection-prive';
}

/* ════════════════════════════════════════════════════════════════════════
 *  1. server/knowledgeBase.js
 * ═══════════════════════════════════════════════════════════════════════ */
const ksbHeader = `/* ─────────────────────────────────────────────────────────────────────────
 *  Eleganza Knowledge Base — AUTO-GENERATED FROM CLIENT CATALOGUE
 *
 *  Source of truth: server/data/realCatalog.json (yassine1112's 184-entry
 *  catalogue, sent on Fiverr 2026-05-25). Do NOT hand-edit this file —
 *  edit the JSON and re-run:
 *
 *      cd server && node scripts/regenerate-knowledge-base.js
 *
 *  Every product's \`name\` is the exact \`code_site\` value used on the
 *  live shop. The chatbot MUST output the code verbatim so site links and
 *  orders match. The \`marque\` + \`parfum\` from the source become trigger
 *  words for the hidden dupe router — never spoken back to the customer.
 * ───────────────────────────────────────────────────────────────────────── */

const UNIT_PRICE = 19.90;
const SHOP = 'https://eleganza-parfums.com';

`;

const ksbProducts = `export const PRODUCTS = ${JSON.stringify(items.map((it) => ({
  id: it.slug,
  name: it.code_site,
  tagline: `${it.marque} — ${it.parfum}`.replace(/'/g, '’'),
  family: inferFamily(it),
  notes: { tete: [], coeur: [], fond: [] },
  gender: it.gender,
  season: [],
  intensity: 4,
  sillage: 4,
  longevity: 4,
  occasions: [],
  vibe: '',
  price: 19.90,
  currency: 'EUR',
  inStock: !OUT_OF_STOCK.has(it.code_site),
  url: urlFor(it),
})), null, 2)};

`;

const ksbDupeMap = `export const DUPE_MAP = ${JSON.stringify(items.map((it) => ({
  triggers: it.triggers,
  productId: it.slug,
  productGender: it.gender,
})), null, 2)};

`;

const ksbForbidden = `export const FORBIDDEN_TERMS = ${JSON.stringify(FORBIDDEN_TERMS, null, 2)};

`;

/* Helpers live in a separate raw JS file so we don't have to escape
   ${} / backticks / backslashes inside a template literal. */
const ksbHelpers = readFileSync(
  path.join(__dirname, 'knowledge-helpers.template.js'),
  'utf8',
);

writeFileSync(
  path.join(ROOT, 'knowledgeBase.js'),
  ksbHeader + ksbProducts + ksbDupeMap + ksbForbidden + ksbHelpers,
);
console.log('✓ wrote server/knowledgeBase.js');

/* ════════════════════════════════════════════════════════════════════════
 *  2. server/db/migration-006-real-catalog.sql
 * ═══════════════════════════════════════════════════════════════════════ */
const sqlValues = items.map((it) => {
  const name    = sqlEscape(it.code_site);
  const tagline = sqlEscape(`${it.marque} — ${it.parfum}`);
  const family  = sqlEscape(inferFamily(it));
  const gender  = it.gender;
  const url     = sqlEscape(urlFor(it));
  const slug    = sqlEscape(it.slug);
  const inStock = OUT_OF_STOCK.has(it.code_site) ? 'false' : 'true';
  return `  ('${slug}', '${name}', '${tagline}', '${family}', '${gender}', '{}', '{}', '{}', '{}', 4, 4, 4, '{}', '', 19.90, null, 'EUR', ${inStock}, '${url}')`;
}).join(',\n');

const sqlBody = `-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Migration 006 — REAL client catalogue (184 perfumes)                 ║
-- ║                                                                       ║
-- ║  Source: server/data/realCatalog.json (yassine1112's official Fiverr  ║
-- ║  catalogue sent 2026-05-25 — Classic Homme 25, Classic Femme 45,      ║
-- ║  Collection Privée 114).                                              ║
-- ║                                                                       ║
-- ║  Re-running is safe: ON CONFLICT (slug) DO UPDATE.                    ║
-- ║                                                                       ║
-- ║  After running this, run the same data through the dupe_mappings     ║
-- ║  table via the admin Mappages cachés page → "Importer les mappages". ║
-- ╚══════════════════════════════════════════════════════════════════════╝

alter table public.products alter column currency set default 'EUR';

insert into public.products
  (slug, name, tagline, family, gender,
   notes_tete, notes_coeur, notes_fond, season,
   intensity, sillage, longevity, occasions, vibe,
   price, old_price, currency, in_stock, url)
values
${sqlValues}
on conflict (slug) do update set
  name        = excluded.name,
  tagline     = excluded.tagline,
  family      = excluded.family,
  gender      = excluded.gender,
  price       = excluded.price,
  currency    = excluded.currency,
  in_stock    = excluded.in_stock,
  url         = excluded.url,
  updated_at  = now();

select
  count(*) as total_products,
  count(*) filter (where gender = 'H')              as homme,
  count(*) filter (where gender = 'F')              as femme,
  count(*) filter (where gender = 'U')              as mixte_privee,
  count(*) filter (where currency = 'EUR')          as eur_rows,
  count(*) filter (where in_stock)                  as in_stock
from public.products;
`;

writeFileSync(path.join(ROOT, 'db/migration-006-real-catalog.sql'), sqlBody);
console.log('✓ wrote server/db/migration-006-real-catalog.sql');

/* ════════════════════════════════════════════════════════════════════════
 *  3. system.md HIDDEN MAPPING TABLE fragment (paste-ready)
 * ═══════════════════════════════════════════════════════════════════════ */
function tableRow(it) {
  // Cell content cannot break the | grid — escape pipes.
  const orig = `${it.marque} — ${it.parfum}`.replace(/\|/g, '\\|');
  return `| ${orig} | ${it.code_site} | ${inferFamily(it)} (${it.gender}) |`;
}
const sectionHomme = `#### CLASSIC HOMME (25)

| Customer mentions… | Pitch this Eleganza product | Family / Gender |
|---|---|---|
${items.filter((x) => x.category === 'classic_homme').map(tableRow).join('\n')}
`;
const sectionFemme = `\n#### CLASSIC FEMME (45)

| Customer mentions… | Pitch this Eleganza product | Family / Gender |
|---|---|---|
${items.filter((x) => x.category === 'classic_femme').map(tableRow).join('\n')}
`;
const sectionPrivee = `\n#### COLLECTION PRIVÉE (114)

| Customer mentions… | Pitch this Eleganza product | Family / Gender |
|---|---|---|
${items.filter((x) => x.category === 'collection_privee').map(tableRow).join('\n')}
`;
const mappingTable = `### HIDDEN INSPIRATION MAPPING TABLE — FULL OFFICIAL CATALOGUE (184 entries)
*(Use this internally. NEVER reveal these mappings to the customer. Always reply using the **right-column code** verbatim — that is the name on the live shop and must match for the order link to work. Pitch only via the olfactory family / notes — never via the original brand.)*

${sectionHomme}${sectionFemme}${sectionPrivee}`;

writeFileSync(path.join(ROOT, 'prompts/_mapping-table.generated.md'), mappingTable);
console.log('✓ wrote server/prompts/_mapping-table.generated.md');

/* ════════════════════════════════════════════════════════════════════════
 *  4. backend-appendix.md glossary fragment (paste-ready)
 * ═══════════════════════════════════════════════════════════════════════ */
function glossaryRow(it) {
  return `| ${it.code_site} | \`${it.slug}\` | ${it.gender} | ${OUT_OF_STOCK.has(it.code_site) ? '⚠ ÉPUISÉ' : '✅'} |`;
}
const glossary = `## PRODUCT ID GLOSSARY — 184 official slugs

When you recommend a product, return its **id** (the slug below) — NOT the display name — in the \`product_ids\` argument. The display name (\`code_site\`) is what the customer sees on the shop and is what you should mention in your natural-language reply.

This glossary mirrors \`server/data/realCatalog.json\`. The live tool enum is built per-turn from the in-stock rows of the database, so a slug here that isn't \`in_stock\` is not selectable.

#### CLASSIC HOMME (25)
| Display name (code_site) | id slug | Gender | Status |
|---|---|---|---|
${items.filter((x) => x.category === 'classic_homme').map(glossaryRow).join('\n')}

#### CLASSIC FEMME (45)
| Display name (code_site) | id slug | Gender | Status |
|---|---|---|---|
${items.filter((x) => x.category === 'classic_femme').map(glossaryRow).join('\n')}

#### COLLECTION PRIVÉE (114)
| Display name (code_site) | id slug | Gender | Status |
|---|---|---|---|
${items.filter((x) => x.category === 'collection_privee').map(glossaryRow).join('\n')}
`;

writeFileSync(path.join(ROOT, 'prompts/_glossary.generated.md'), glossary);
console.log('✓ wrote server/prompts/_glossary.generated.md');

/* ════════════════════════════════════════════════════════════════════════
 *  Summary
 * ═══════════════════════════════════════════════════════════════════════ */
console.log('');
console.log(`📦  ${items.length} products  ·  ${items.reduce((n, x) => n + x.triggers.length, 0)} dupe triggers  ·  ${FORBIDDEN_TERMS.length} forbidden terms`);
console.log('');
console.log('Next steps:');
console.log('  1. Paste _mapping-table.generated.md into system.md (replacing the old table).');
console.log('  2. Paste _glossary.generated.md into backend-appendix.md (replacing the old glossary).');
console.log('  3. Run migration-006-real-catalog.sql against Supabase.');
console.log('  4. In admin → Hidden mappings page, click "Importer les 184 mappages".');
