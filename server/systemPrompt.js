/* ─────────────────────────────────────────────────────────────────────────
 *  System Prompt Loader
 *
 *  Resolution order on every chat turn:
 *    1. DB active row in `system_prompts` (set via admin /prompt page)
 *    2. File — prompts/system.md + prompts/backend-appendix.md
 *
 *  Additionally, the LIVE catalog from `public.products` is appended on
 *  every turn — so when an admin adds a new perfume in the admin panel,
 *  the bot immediately learns it for the next conversation turn.
 * ───────────────────────────────────────────────────────────────────────── */

import { readFileSync, watch } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getActivePrompt } from './repositories/promptRepo.js';
import { listProducts } from './repositories/productRepo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPT_DIR = path.join(__dirname, 'prompts');
const MAIN_PATH = path.join(PROMPT_DIR, 'system.md');
const APPENDIX_PATH = path.join(PROMPT_DIR, 'backend-appendix.md');

const DB_PROMPT_TTL_MS = 30_000;
const CATALOG_TTL_MS = 20_000;

let fileCache = { main: '', appendix: '', loadedAt: 0 };
let dbPromptCache = { row: null, loadedAt: 0 };
let catalogCache = { rows: [], loadedAt: 0 };

function loadFiles() {
  const main = readFileSync(MAIN_PATH, 'utf8');
  let appendix = '';
  try { appendix = readFileSync(APPENDIX_PATH, 'utf8'); } catch { /* optional */ }
  fileCache = { main, appendix, loadedAt: Date.now() };
  return fileCache;
}

loadFiles();
try {
  watch(PROMPT_DIR, { persistent: false }, (_event, filename) => {
    if (!filename || !filename.endsWith('.md')) return;
    try { loadFiles(); console.log(`↻ Prompt file reloaded (${filename})`); }
    catch (err) { console.error('Prompt reload failed:', err.message); }
  });
} catch (err) {
  console.warn('Prompt hot-reload unavailable:', err.message);
}

async function getDbPrompt() {
  if (dbPromptCache.row && Date.now() - dbPromptCache.loadedAt < DB_PROMPT_TTL_MS) {
    return dbPromptCache.row;
  }
  try {
    const row = await getActivePrompt();
    dbPromptCache = { row: row || null, loadedAt: Date.now() };
    return row || null;
  } catch (err) {
    console.warn('Active prompt lookup failed, falling back to file:', err.message);
    return null;
  }
}

async function getLiveCatalog() {
  if (catalogCache.rows.length > 0 && Date.now() - catalogCache.loadedAt < CATALOG_TTL_MS) {
    return catalogCache.rows;
  }
  try {
    const rows = await listProducts({ inStockOnly: false });
    catalogCache = { rows: rows || [], loadedAt: Date.now() };
    return rows;
  } catch (err) {
    console.warn('Live catalog fetch failed:', err.message);
    return [];
  }
}

function renderLiveCatalog(rows) {
  if (!rows || rows.length === 0) return '';
  const lines = rows.map((p) => {
    const notes = `Tête: ${(p.notes_tete || []).join(', ')} | Cœur: ${(p.notes_coeur || []).join(', ')} | Fond: ${(p.notes_fond || []).join(', ')}`;
    const stock = p.in_stock ? 'EN STOCK' : 'ÉPUISÉ — DO NOT RECOMMEND';
    const promo = p.old_price ? ` (PROMO -${Math.round(((p.old_price - p.price) / p.old_price) * 100)}%)` : '';
    const currency = (p.currency || 'EUR').toUpperCase() === 'EUR' ? '€' : '$';
    return `• id="${p.slug}" | ${p.name} (${p.gender}) — ${p.family || ''}\n   ${notes}\n   Prix: ${p.price}${currency}${promo} · ${stock}`;
  });
  return [
    '',
    '---',
    '',
    '## 🔥 LIVE CATALOG (synced from the database — this OVERRIDES any catalog above)',
    '',
    'This is the up-to-date list of products you may recommend. Only use these `id` values.',
    'When a customer asks for the catalog, recommend from here — these are the products currently in the database, including any added by the admin.',
    '',
    ...lines,
    '',
  ].join('\n');
}

function liveProductIds(rows, requestedGender = null) {
  return (rows || [])
    .filter((p) => p.in_stock)
    .filter((p) => {
      if (!requestedGender) return true;
      // Always allow unisex; otherwise must match the requested gender.
      return p.gender === 'U' || p.gender === requestedGender;
    })
    .map((p) => p.slug);
}

export function invalidatePromptCache() {
  dbPromptCache = { row: null, loadedAt: 0 };
  catalogCache = { rows: [], loadedAt: 0 };
}

/**
 * Build the system message. Returns the prompt text PLUS the list of
 * currently in-stock product slugs (so the chat tool enum can be dynamic).
 *
 * `routing` can either be:
 *   - a plain string  (legacy: the routed product slug)
 *   - an object       { productId, productGender, requestedGender, genderConflict }
 *
 * When `requestedGender` is present, the product_ids tool enum is narrowed
 * to same-gender + unisex products so the LLM literally cannot suggest a
 * women's perfume to a male customer (and vice versa).
 */
export async function buildSystemPrompt({ routedProductHint = null, customerLanguage = 'fr' } = {}) {
  const [dbRow, catalog] = await Promise.all([getDbPrompt(), getLiveCatalog()]);

  const main = dbRow?.content || fileCache.main;
  const appendix = dbRow?.appendix || fileCache.appendix;
  const today = new Date().toISOString().slice(0, 10);

  // Normalise the routing payload — back-compat with the old string form.
  const routing = (routedProductHint && typeof routedProductHint === 'object')
    ? routedProductHint
    : (routedProductHint ? { productId: routedProductHint, productGender: null, requestedGender: null, genderConflict: false } : null);

  const requestedGender = routing?.requestedGender || null;
  const liveCatalogBlock = renderLiveCatalog(catalog);

  const genderLabel = (g) => (g === 'H' ? 'HOMME (men only / unisex)' : g === 'F' ? 'FEMME (women only / unisex)' : 'mixte (any gender)');

  const routingLines = [];
  if (routing?.productId) {
    routingLines.push(
      `- 🔒 STRICT MAPPING — ABSOLUTE: the customer's last message mentioned a famous fragrance. The router has resolved it to product id \`${routing.productId}\` (gender: ${routing.productGender || 'U'}).\n  • You MUST set \`product_ids: ["${routing.productId}"]\` in the tool call. No other slug. No "close enough" alternative. No second option.\n  • Never speak the brand they mentioned. Pitch via olfactory family / notes only.\n  • If you think a different product fits better, you are wrong — the router enum allows only this one slug.`,
    );
  } else {
    routingLines.push("- No forbidden brand detected in the customer's last message — recommend freely from the LIVE CATALOG below.");
  }
  if (requestedGender) {
    routingLines.push(
      `- 🎯 Customer is shopping for: ${genderLabel(requestedGender)}. ONLY recommend products with gender = ${requestedGender} or U (unisex). NEVER suggest a product whose gender is the opposite.`,
    );
  }
  if (routing?.genderConflict && routing?.productId) {
    routingLines.push(
      `- ⚠ GENDER CONFLICT: the brand the customer mentioned maps to a product (\`${routing.productId}\`) whose gender (${routing.productGender}) does NOT match the requested gender (${requestedGender}). Pick a same-gender alternative from the LIVE CATALOG that shares the same olfactory family. Do NOT propose \`${routing.productId}\`.`,
    );
  }

  const contextBlock = [
    '',
    '---',
    '',
    '## RUNTIME CONTEXT (server-injected, refreshed every turn)',
    `- Today: ${today}`,
    `- Customer language hint: ${customerLanguage}`,
    `- Prompt source: ${dbRow ? `DB v${dbRow.version}` : 'file (prompts/system.md)'}`,
    `- Live catalog: ${catalog.length} products from DB`,
    ...routingLines,
    '',
  ].join('\n');

  const fullPrompt = `${main.trim()}\n\n${appendix.trim()}\n${liveCatalogBlock}\n${contextBlock}`;

  return {
    prompt: fullPrompt,
    productIds: liveProductIds(catalog, requestedGender),
    requestedGender,
  };
}

export function getPromptStats() {
  return {
    fileMainChars: fileCache.main.length,
    fileAppendixChars: fileCache.appendix.length,
    fileLoadedAt: new Date(fileCache.loadedAt).toISOString(),
    dbCached: Boolean(dbPromptCache.row),
    dbCachedAt: dbPromptCache.loadedAt ? new Date(dbPromptCache.loadedAt).toISOString() : null,
    catalogCount: catalogCache.rows.length,
    catalogCachedAt: catalogCache.loadedAt ? new Date(catalogCache.loadedAt).toISOString() : null,
  };
}
