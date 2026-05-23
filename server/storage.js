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
  const ext = extFromMime(mimeType);
  const id = crypto.randomBytes(6).toString('hex');
  const path = `${slug}/${Date.now()}-${id}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false });
  if (error) {
    if (String(error.message).match(/bucket.+not found/i)) {
      throw new Error(`Le bucket "${BUCKET}" n'existe pas. Créez-le dans Supabase Storage (public).`);
    }
    throw error;
  }

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
