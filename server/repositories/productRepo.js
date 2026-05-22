/* ─────────────────────────────────────────────────────────────────────────
 *  Product / catalog repository
 * ───────────────────────────────────────────────────────────────────────── */

import { supabase, throwIfError } from '../db.js';

/* ─── Reads ───────────────────────────────────────────────────────────── */
export async function listProducts({ inStockOnly = true, gender, family } = {}) {
  let q = supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (inStockOnly) q = q.eq('in_stock', true);
  if (gender) q = q.eq('gender', gender);
  if (family) q = q.eq('family', family);

  const { data, error } = await q;
  throwIfError(error, 'listProducts');
  return data || [];
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  throwIfError(error, 'getProductBySlug');
  return data;
}

export async function getProductsBySlugs(slugs) {
  if (!Array.isArray(slugs) || slugs.length === 0) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('slug', slugs);
  throwIfError(error, 'getProductsBySlugs');
  return data || [];
}

/* ─── Writes (admin only) ─────────────────────────────────────────────── */

// Slugify a French/UTF-8 name for use as a unique product id.
export function slugify(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')        // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || `product-${Date.now()}`;
}

// Cast and sanitize a payload coming from the admin form into the DB shape.
export function normalizeProductPayload(p, { isUpdate = false } = {}) {
  const out = {};
  if (p.name !== undefined) out.name = String(p.name).trim();
  if (p.slug !== undefined) out.slug = slugify(p.slug || p.name);
  else if (!isUpdate && p.name) out.slug = slugify(p.name);
  if (p.tagline !== undefined) out.tagline = p.tagline || null;
  if (p.family !== undefined) out.family = p.family || null;
  if (p.gender !== undefined) out.gender = ['F','H','U'].includes(p.gender) ? p.gender : 'U';
  if (p.notes_tete !== undefined) out.notes_tete = Array.isArray(p.notes_tete) ? p.notes_tete : [];
  if (p.notes_coeur !== undefined) out.notes_coeur = Array.isArray(p.notes_coeur) ? p.notes_coeur : [];
  if (p.notes_fond !== undefined) out.notes_fond = Array.isArray(p.notes_fond) ? p.notes_fond : [];
  if (p.season !== undefined) out.season = Array.isArray(p.season) ? p.season : [];
  if (p.intensity !== undefined) out.intensity = clamp(p.intensity, 1, 5);
  if (p.sillage !== undefined) out.sillage = clamp(p.sillage, 1, 5);
  if (p.longevity !== undefined) out.longevity = clamp(p.longevity, 1, 5);
  if (p.occasions !== undefined) out.occasions = Array.isArray(p.occasions) ? p.occasions : [];
  if (p.vibe !== undefined) out.vibe = p.vibe || null;
  if (p.price !== undefined) out.price = Number(p.price) || 0;
  if (p.old_price !== undefined) out.old_price = p.old_price ? Number(p.old_price) : null;
  if (p.currency !== undefined) out.currency = p.currency || 'USD';
  if (p.in_stock !== undefined) out.in_stock = Boolean(p.in_stock);
  if (p.is_bestseller !== undefined) out.is_bestseller = Boolean(p.is_bestseller);
  if (p.is_new !== undefined) out.is_new = Boolean(p.is_new);
  if (p.url !== undefined) out.url = p.url || null;
  if (p.image_url !== undefined) out.image_url = p.image_url || null;
  if (p.sort_order !== undefined) out.sort_order = Number(p.sort_order) || 0;
  return out;
}

function clamp(v, lo, hi) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

export async function createProduct(payload) {
  const row = normalizeProductPayload(payload, { isUpdate: false });
  if (!row.name) throw new Error('name is required');
  if (!row.slug) row.slug = slugify(row.name);
  if (row.price === undefined) row.price = 24;

  const { data, error } = await supabase
    .from('products')
    .insert(row)
    .select()
    .single();
  throwIfError(error, 'createProduct');
  return data;
}

export async function updateProduct(slug, payload) {
  const row = normalizeProductPayload(payload, { isUpdate: true });
  delete row.slug; // slug cannot change here (would break references)
  const { data, error } = await supabase
    .from('products')
    .update(row)
    .eq('slug', slug)
    .select()
    .single();
  throwIfError(error, 'updateProduct');
  return data;
}

export async function upsertProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .upsert(product, { onConflict: 'slug' })
    .select()
    .single();
  throwIfError(error, 'upsertProduct');
  return data;
}

export async function setStock(slug, inStock) {
  const { error } = await supabase
    .from('products')
    .update({ in_stock: inStock })
    .eq('slug', slug);
  throwIfError(error, 'setStock');
}

export async function deleteProduct(slug) {
  const { error } = await supabase.from('products').delete().eq('slug', slug);
  throwIfError(error, 'deleteProduct');
}

/* ─── Dupe mappings ───────────────────────────────────────────────────── */
export async function listDupeMappings({ activeOnly = true } = {}) {
  let q = supabase
    .from('dupe_mappings')
    .select('id, triggers, product_id, notes_to_pitch, is_active, hit_count, products(slug,name)');
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  throwIfError(error, 'listDupeMappings');
  return data || [];
}

export async function detectMappedProductBySlug(userText) {
  if (!userText) return null;
  const lower = userText.toLowerCase();
  const all = await listDupeMappings({ activeOnly: true });
  for (const m of all) {
    for (const t of m.triggers || []) {
      if (lower.includes(t.toLowerCase())) return m.products?.slug || null;
    }
  }
  return null;
}

/* ─── Forbidden vocabulary ────────────────────────────────────────────── */
export async function listForbiddenTerms({ activeOnly = true } = {}) {
  let q = supabase.from('forbidden_terms').select('term, category, severity, is_active');
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  throwIfError(error, 'listForbiddenTerms');
  return data || [];
}
