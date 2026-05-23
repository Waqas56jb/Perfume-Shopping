-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Migration 004 — Real bottle photos (up to 4 per product)             ║
-- ║                                                                       ║
-- ║  Adds an `image_urls text[]` column. The chatbot product card shows   ║
-- ║  the FIRST url in this array if non-empty, and falls back to the      ║
-- ║  hand-drawn SVG bottle otherwise.                                     ║
-- ║                                                                       ║
-- ║  After running this SQL, also create a Supabase Storage bucket:       ║
-- ║                                                                       ║
-- ║    Dashboard → Storage → New bucket                                   ║
-- ║      Name:    product-photos                                          ║
-- ║      Public:  ✅ Yes (so the chatbot can render images directly)      ║
-- ║      File-size limit: 5 MB                                            ║
-- ║      Allowed MIME types: image/jpeg, image/png, image/webp, image/avif║
-- ║                                                                       ║
-- ║  The Node server uses the SERVICE_ROLE key to upload, so no bucket    ║
-- ║  policies are needed for writes. Public read is required for the      ║
-- ║  customer chatbot to display images without an auth token.            ║
-- ╚══════════════════════════════════════════════════════════════════════╝

alter table public.products
  add column if not exists image_urls text[] not null default '{}';

-- Cap any accidental excess to 4 photos.
alter table public.products
  drop constraint if exists products_image_urls_max4;
alter table public.products
  add constraint products_image_urls_max4
  check (array_length(image_urls, 1) is null or array_length(image_urls, 1) <= 4);

-- Sanity report
select count(*)                              as total_products,
       count(*) filter (where array_length(image_urls,1) > 0) as with_photos,
       count(*) filter (where image_url is not null)          as with_legacy_url
from public.products;
