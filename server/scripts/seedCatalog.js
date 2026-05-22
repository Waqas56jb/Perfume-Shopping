#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────────────────
 *  Seed the catalog from knowledgeBase.js into Supabase.
 *  Idempotent — uses upsert(onConflict: slug).
 *
 *  Usage:  node scripts/seedCatalog.js
 * ───────────────────────────────────────────────────────────────────────── */

import 'dotenv/config';
import { PRODUCTS, DUPE_MAP, FORBIDDEN_TERMS } from '../knowledgeBase.js';
import { supabase, throwIfError } from '../db.js';

async function seedProducts() {
  console.log(`📦  Seeding ${PRODUCTS.length} products…`);
  const rows = PRODUCTS.map((p, i) => ({
    slug: p.id,
    name: p.name,
    tagline: p.tagline,
    family: p.family,
    gender: p.gender,
    notes_tete: p.notes.tete,
    notes_coeur: p.notes.coeur,
    notes_fond: p.notes.fond,
    season: p.season,
    intensity: p.intensity,
    sillage: p.sillage,
    longevity: p.longevity,
    occasions: p.occasions || [],
    vibe: p.vibe,
    price: p.price,
    old_price: p.oldPrice || null,
    in_stock: p.inStock !== false,
    url: p.url,
    sort_order: i,
  }));
  const { error } = await supabase.from('products').upsert(rows, { onConflict: 'slug' });
  throwIfError(error, 'seedProducts');
  console.log(`   ✓ ${rows.length} products upserted.`);
}

async function seedDupeMap() {
  console.log(`🗺   Seeding ${DUPE_MAP.length} dupe mappings…`);
  // Resolve slug → uuid
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, slug');
  throwIfError(pErr, 'seedDupeMap/lookupProducts');
  const slugToId = new Map(products.map((p) => [p.slug, p.id]));

  const rows = DUPE_MAP
    .filter((m) => slugToId.has(m.productId))
    .map((m) => ({
      triggers: m.triggers,
      product_id: slugToId.get(m.productId),
      is_active: true,
    }));

  // Clear then re-insert (simpler than diffing)
  const { error: delErr } = await supabase.from('dupe_mappings').delete().not('id', 'is', null);
  throwIfError(delErr, 'seedDupeMap/clear');

  if (rows.length === 0) {
    console.log('   ⚠ No mappings to insert (catalog empty?).');
    return;
  }

  const { error } = await supabase.from('dupe_mappings').insert(rows);
  throwIfError(error, 'seedDupeMap/insert');
  console.log(`   ✓ ${rows.length} mappings inserted.`);
}

async function seedForbiddenTerms() {
  console.log(`🛡   Seeding ${FORBIDDEN_TERMS.length} forbidden terms…`);
  const rows = FORBIDDEN_TERMS.map((t) => ({
    term: t,
    category: /dupe|imitation|copy|similar|inspiré|inspired/i.test(t) ? 'dupe-vocab' : 'brand',
    severity: 5,
    is_active: true,
  }));
  const { error } = await supabase.from('forbidden_terms').upsert(rows, { onConflict: 'term' });
  throwIfError(error, 'seedForbiddenTerms');
  console.log(`   ✓ ${rows.length} terms upserted.`);
}

async function main() {
  console.log('');
  console.log('🌱  Eleganza · Catalog seed');
  console.log('────────────────────────────────────');
  await seedProducts();
  await seedDupeMap();
  await seedForbiddenTerms();
  console.log('');
  console.log('All done ✨');
}

main().catch((err) => {
  console.error('Unexpected error:', err?.message || err);
  process.exit(1);
});
