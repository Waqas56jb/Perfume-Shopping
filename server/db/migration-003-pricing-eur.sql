-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Migration 003 — Switch catalogue to the EUR pricing model            ║
-- ║                                                                       ║
-- ║  Client spec (May 23 2026):                                           ║
-- ║   • Unit price       19,90 €                                          ║
-- ║   • Pack Signature   59,70 €  (3 + 1 OFFERT, livraison gratuite)      ║
-- ║   • Concentration    25 % à 30 % (was 15–18 %)                        ║
-- ║                                                                       ║
-- ║  This migration is idempotent: re-running it won't compound the price ║
-- ║  changes. It explicitly sets every row to the new values.             ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- 1️⃣  Set the new unit price everywhere + switch currency to EUR.
update public.products
set
  price     = 19.90,
  currency  = 'EUR'
where
  -- Don't override products that are explicitly on promo
  -- (we keep their old_price/price intact so the badge still shows).
  old_price is null
  or old_price <= 0;

-- 2️⃣  For products on promotion: keep the promo logic but rebase the anchor.
--     If a row was on promo (had an old_price > price), rebase old_price to
--     19,90 € so the strike-through still reads as a discount from the new
--     full price. Promo price stays whatever the admin set.
update public.products
set
  old_price = 19.90,
  currency  = 'EUR'
where
  old_price is not null
  and old_price > price;

-- 3️⃣  Future inserts should default to EUR.
alter table public.products
  alter column currency set default 'EUR';

-- 4️⃣  Quick sanity report (read-only — Supabase will return the count).
select count(*) as eur_products,
       min(price) as min_price,
       max(price) as max_price,
       count(*) filter (where old_price is not null) as on_promo
from public.products;
