/* ─────────────────────────────────────────────────────────────────────────
 *  Supabase Storage helper — uploads & deletes product photos.
 *
 *  Bucket: "product-photos"  (must exist, public read, ≤ 5 MB per file)
 *  Path:   <slug>/<timestamp>-<rand>.<ext>
 *
 *  Returns the public URL on success.
 * ───────────────────────────────────────────────────────────────────────── */

import crypto from 'node:crypto';
import { supabase } from './db.js';

const BUCKET = process.env.PRODUCT_PHOTOS_BUCKET || 'product-photos';
const MAX_PHOTOS_PER_PRODUCT = 4;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export { BUCKET as PRODUCT_PHOTOS_BUCKET, MAX_PHOTOS_PER_PRODUCT, ALLOWED_MIME };

/* ─── Auto-create the bucket the first time we need it ──────────────────
 * The service-role key has permission to create buckets, so no manual
 * dashboard work is required. Result is cached in-process. */
let bucketReady = false;
let bucketCheckInFlight = null;

export async function ensureBucket() {
  if (bucketReady) return;
  if (bucketCheckInFlight) return bucketCheckInFlight;

  bucketCheckInFlight = (async () => {
    // 1. Try to GET the bucket — fastest path when it already exists.
    try {
      const { data, error } = await supabase.storage.getBucket(BUCKET);
      if (data && !error) {
        // If it exists but isn't public, try to flip it public (best-effort).
        if (data.public === false) {
          await supabase.storage.updateBucket(BUCKET, { public: true }).catch(() => {});
        }
        bucketReady = true;
        return;
      }
    } catch { /* fall through to create */ }

    // 2. Create the bucket (public + same MIME allow-list as the route).
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: [...ALLOWED_MIME],
    });

    if (createErr && !/already exists/i.test(String(createErr.message || ''))) {
      // Wipe the cache so a follow-up upload retries the check.
      bucketCheckInFlight = null;
      throw new Error(
        `Impossible de créer le bucket "${BUCKET}" automatiquement. Vérifiez que la clé SUPABASE_SERVICE_ROLE_KEY a les droits Storage. Message Supabase: ${createErr.message}`
      );
    }
    bucketReady = true;
  })();

  try {
    await bucketCheckInFlight;
  } finally {
    if (bucketReady) bucketCheckInFlight = null;
  }
}

function extFromMime(mime) {
  switch (mime) {
    case 'image/jpeg': return 'jpg';
    case 'image/png':  return 'png';
    case 'image/webp': return 'webp';
    case 'image/avif': return 'avif';
    default:           return 'bin';
  }
}

/** Upload a single image buffer for a given product slug. */
export async function uploadProductPhoto({ slug, buffer, mimeType }) {
  if (!ALLOWED_MIME.has(mimeType)) {
    throw new Error(`Format non supporté (${mimeType}). Utilisez JPG, PNG, WEBP ou AVIF.`);
  }
  await ensureBucket(); // ← creates the bucket on first use

  const ext = extFromMime(mimeType);
  const id = crypto.randomBytes(6).toString('hex');
  const path = `${slug}/${Date.now()}-${id}.${ext}`;

  let { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false });

  // One automatic retry if Supabase complained the bucket was missing.
  if (error && String(error.message || '').match(/bucket.+not found/i)) {
    bucketReady = false;
    await ensureBucket();
    ({ error } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: mimeType, upsert: false }));
  }

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

/** Delete a product photo by its public URL or storage path. */
export async function deleteProductPhoto(urlOrPath) {
  if (!urlOrPath) return;
  // Extract the storage path from a full public URL
  let path = urlOrPath;
  const marker = `/object/public/${BUCKET}/`;
  const idx = urlOrPath.indexOf(marker);
  if (idx !== -1) path = urlOrPath.slice(idx + marker.length);
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.warn('Storage delete warning:', error.message);
}
