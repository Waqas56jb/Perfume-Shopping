-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Migration 007 — Strip original brand names from public taglines      ║
-- ║                                                                       ║
-- ║  Compliance / intellectual-property rule (client demand 2026-05-25):  ║
-- ║  the chatbot must NEVER surface "Lancôme", "Dior", "Chanel", "MFK",  ║
-- ║  "YSL", etc. on customer-visible product cards. The previous          ║
-- ║  migration-006 wrote "Brand — Original Parfum" into products.tagline ║
-- ║  — this overwrites every row with a neutral "Création {family} pour ║
-- ║  {audience}" sentence instead. The brand info is preserved ONLY in   ║
-- ║  dupe_mappings.triggers (server-side, never displayed).               ║
-- ║                                                                       ║
-- ║  Safe to re-run; idempotent UPDATE.                                  ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- 1️⃣  Replace every tagline with a neutral description derived from the
--     product's family + gender. Customer never sees a brand name again.
update public.products
set tagline = case
  when gender = 'H' then 'Création ' || lower(coalesce(family, 'parfumée')) || ' pour homme'
  when gender = 'F' then 'Création ' || lower(coalesce(family, 'parfumée')) || ' pour femme'
  else                   'Création ' || lower(coalesce(family, 'parfumée')) || ' de la Collection Privée'
end,
updated_at = now()
where tagline is null
   or tagline ~* '\m(armani|azzaro|chanel|dior|d&g|dolce|jpg|jean paul|gaultier|lacoste|montblanc|mont blanc|paco rabanne|viktor|ysl|saint laurent|carolina herrera|cacharel|chloé|chloe|givenchy|gucci|guerlain|hermès|hermes|hugo boss|kenzo|lancôme|lancome|narciso|nina ricci|prada|mugler|victoria|zadig|al-jazeera|ajmal|arabian oud|armani privé|arte profumi|attar|bdk|bond no|bvlgari|byredo|byron|chopard|creed|dubai|dubaï|fomowa|mfk|francis kurkdjian|frédéric malle|frederic malle|giardini|hind al oud|initio|jo malone|kayali|kilian|khalil|le labo|lalique|lattafa|louis vuitton|maison jousset|maison margiela|maison mataha|mancera|marc-antoine|marc jacobs|montale|nishane|nobile|parfums de marly|rasasi|rosendo mateu|stéphane humbert|the house of oud|tiziana terenzi|tom ford|xerjoff|ex nihilo|ulyka|v canto|van cleef)\M';

-- 2️⃣  Read-only sanity check: count any tagline that still mentions a brand.
select
  count(*) filter (where tagline is null)                                       as null_taglines,
  count(*) filter (where tagline ~* '\m(armani|chanel|dior|ysl|tom ford|kayali|mfk|lancome|lancôme)\M') as brand_leaks_remaining,
  count(*)                                                                     as total_rows
from public.products;
