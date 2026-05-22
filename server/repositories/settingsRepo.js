/* ─────────────────────────────────────────────────────────────────────────
 *  Settings repository
 *  Reads/writes app_settings (key-value store). Cached in-memory with a
 *  short TTL so chat requests don't hit the DB on every turn.
 * ───────────────────────────────────────────────────────────────────────── */

import { supabase, throwIfError } from '../db.js';

const CACHE_TTL_MS = 30_000;
let cache = { values: null, loadedAt: 0 };

export const SECRET_KEYS = new Set(['openai_api_key']);

export async function getAllSettings({ force = false } = {}) {
  if (!force && cache.values && Date.now() - cache.loadedAt < CACHE_TTL_MS) {
    return cache.values;
  }
  const { data, error } = await supabase.from('app_settings').select('*');
  throwIfError(error, 'getAllSettings');
  const map = Object.fromEntries((data || []).map((r) => [r.key, r]));
  cache = { values: map, loadedAt: Date.now() };
  return map;
}

export async function getSetting(key) {
  const all = await getAllSettings();
  return all[key]?.value ?? null;
}

export async function setSetting(key, value, updatedBy = null) {
  const { error } = await supabase
    .from('app_settings')
    .upsert(
      { key, value: value === '' ? null : value, updated_by: updatedBy, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
  throwIfError(error, 'setSetting');
  invalidateCache();
}

export async function setManySettings(patch, updatedBy = null) {
  const rows = Object.entries(patch).map(([key, value]) => ({
    key,
    value: value === '' || value === undefined ? null : String(value),
    updated_by: updatedBy,
    updated_at: new Date().toISOString(),
  }));
  if (rows.length === 0) return;
  const { error } = await supabase.from('app_settings').upsert(rows, { onConflict: 'key' });
  throwIfError(error, 'setManySettings');
  invalidateCache();
}

export function invalidateCache() {
  cache = { values: null, loadedAt: 0 };
}

/* Returns a safe-for-UI copy with secrets masked. */
export async function getMaskedSettings() {
  const all = await getAllSettings({ force: true });
  const out = {};
  for (const [key, row] of Object.entries(all)) {
    const isSecret = row.is_secret || SECRET_KEYS.has(key);
    let display = row.value;
    if (isSecret && row.value) {
      display = `${row.value.slice(0, 7)}…${row.value.slice(-4)}`;
    }
    out[key] = {
      value: display,
      hasValue: Boolean(row.value),
      isSecret,
      description: row.description,
      updatedAt: row.updated_at,
    };
  }
  return out;
}

/* ─── Effective OpenAI config — admin override > env fallback ─────────── */
export async function getEffectiveOpenAIConfig() {
  const all = await getAllSettings();
  const get = (k) => all[k]?.value || null;

  return {
    apiKey: get('openai_api_key') || process.env.OPENAI_API_KEY,
    model: get('openai_model') || process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: parseFloat(get('openai_temperature') || process.env.OPENAI_TEMPERATURE || '0.55'),
    maxTokens: parseInt(get('openai_max_tokens') || process.env.OPENAI_MAX_TOKENS || '600', 10),
    source: {
      apiKey: get('openai_api_key') ? 'admin' : 'env',
      model: get('openai_model') ? 'admin' : 'env',
      temperature: get('openai_temperature') ? 'admin' : 'env',
      maxTokens: get('openai_max_tokens') ? 'admin' : 'env',
    },
  };
}
