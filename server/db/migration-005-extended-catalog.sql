-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Migration 005 — Extended catalogue (full 70-entry dupe mapping)      ║
-- ║                                                                       ║
-- ║  Adds the new product stubs (HOMME / FEMME / COLLECTION PRIVÉ) so the ║
-- ║  pre-LLM router has real rows to point at.                            ║
-- ║                                                                       ║
-- ║  Re-applies the EUR pricing (idempotent — same as migration-003).     ║
-- ║                                                                       ║
-- ║  Safe to run multiple times: uses ON CONFLICT (slug) DO UPDATE.       ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- 1️⃣  Make sure the schema picked up the EUR default from migration-003.
alter table public.products alter column currency set default 'EUR';

-- 2️⃣  Insert / refresh all 70+ catalogue rows.
--     Single VALUES list, single ON CONFLICT — gives us atomic upsert.
insert into public.products
  (slug, name, tagline, family, gender,
   notes_tete, notes_coeur, notes_fond, season,
   intensity, sillage, longevity, occasions, vibe,
   price, old_price, currency, in_stock, url)
values
  -- ─── EXISTING STARS (re-priced to 19.90 €) ──────────────────────────
  ('rouge-240', 'ROUGE 240', 'L''Éclat Royal — sillage solaire, ambré et sophistiqué', 'Ambré Floral Boisé', 'U',
   '{Jasmin,Safran}', '{Ambre,"Bois de cèdre"}', '{"Résine de sapin",Musc}', '{Automne,Hiver}',
   5, 5, 5, '{"soirée élégante",événement,signature}', 'luxueux, sensuel, mémorable',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/rs5-parfum-copie'),

  ('bodyko', 'BODYKO', 'Oriental boisé masculin — encens sacré et bois sensuels', 'Oriental Boisé', 'H',
   '{Eucalyptus,Encens}', '{"Bois de cèdre",Camphre}', '{Benjoin,"Fève tonka"}', '{Automne,Hiver}',
   5, 4, 5, '{"soirée élégante","saisons fraîches"}', 'mystique, charismatique, profond',
   19.90, null, 'EUR', false, 'https://eleganza-parfums.com/products/blanc-parfum-copie'),

  ('bois-intense', 'BOIS INTENSE', 'Boisé épicé profond et mémorable', 'Boisé Épicé', 'U',
   '{Bergamote,"Poivre rose",Cardamome}', '{Cèdre,Vétiver,Résine}', '{Ambre,Musc,Patchouli}', '{Automne,Hiver,"Toutes saisons"}',
   5, 4, 5, '{quotidien,"signature boisée"}', 'profond, élégant, intemporel',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/bois-intense-parfum'),

  ('creme-brulee', 'CRÈME BRÛLÉE', 'Onctueuse vanille caramélisée — confort dessert maison', 'Gourmand Vanillé', 'F',
   '{Vanille,Caramel}', '{"Lait chaud","Noix de coco"}', '{"Musc blanc",Sucre,"Bois doux"}', '{Automne,Hiver}',
   4, 4, 4, '{cocooning,"soirée d''hiver"}', 'doux, réconfortant, addictif',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/accro-a-la-vanille-parfum'),

  ('bella-vita', 'BELLA VITA', 'Gourmand floral irrésistible — la joie de vivre en flacon', 'Gourmand Floral', 'F',
   '{Cassis,Poire}', '{Iris,Jasmin,"Fleur d''oranger"}', '{Praliné,Vanille,Patchouli,"Fève de tonka"}', '{Automne,Hiver}',
   4, 5, 5, '{quotidien,rendez-vous,signature}', 'lumineux, addictif, féminin',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/imperatrice-parfum-copie'),

  ('toxic-girl', 'TOXIC GIRL', 'Sucré et rebelle — féminité audacieuse et glamour', 'Oriental Floral Gourmand', 'F',
   '{"Orange amère",Citron}', '{"Rose de Damas","Fleur d''oranger"}', '{"Fève tonka",Vanille,"Bois de santal"}', '{Automne,Hiver,Printemps}',
   4, 4, 4, '{soirée,"sortie entre amies"}', 'séduisant, provocateur, glamour',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/amoramo-parfum-copie'),

  ('liberty', 'LIBERTY', 'Floral lavande vanille — élégance moderne et affirmée', 'Floral Aromatique', 'F',
   '{Lavande,Mandarine,Néroli}', '{Jasmin,"Fleur d''oranger"}', '{"Vanille de Madagascar","Ambre gris",Cèdre}', '{Printemps,Automne,Hiver}',
   4, 4, 5, '{travail,journée,soirée}', 'libre, ambitieuse, sophistiquée',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/fire-24-parfum-copie'),

  ('so-elixir', 'SO ELIXIR', 'Boisé épicé puissant et magnétique', 'Boisé Épicé Aromatique', 'H',
   '{"Bergamote de Calabre",Poivre}', '{Lavande,"Poivre du Sichuan",Géranium,Vétiver}', '{Ambroxan,Cèdre,Ciste}', '{Automne,Hiver,Printemps}',
   5, 5, 5, '{soirée,"signature masculine"}', 'puissant, charismatique, viril',
   19.90, null, 'EUR', false, 'https://eleganza-parfums.com/products/dollars-parfum-copie'),

  ('imaginaire', 'IMAGINAIRE', 'Vibrant et rafraîchissant — liberté et créativité', 'Aromatique Hespéridé Ambré', 'U',
   '{"Citron de Calabre",Bergamote,Orange}', '{Gingembre,Néroli,Cannelle}', '{Ambroxan,"Thé noir","Bois de Gaïac"}', '{Printemps,Été}',
   3, 4, 4, '{"journée claire",travail,sérénité}', 'créatif, libre, raffiné',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/imaginaire-parfum'),

  ('on-fire', 'ON FIRE', 'Explosion solaire fruitée et exotique', 'Oriental Fruité Boisé', 'U',
   '{Mangue,Citron,Gingembre}', '{Résines,Jasmin,Safran}', '{"Oud doux",Vanille,"Bois ambrés",Musc}', '{Printemps,Été,Automne}',
   5, 5, 5, '{"soirée estivale","événement audacieux"}', 'flamboyant, puissant, exotique',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/bois-d-iris-parfum-copie'),

  ('pistachio', 'PISTACHIO', 'Gourmand lacté et envoûtant — pistache & vanille', 'Gourmand Oriental', 'U',
   '{Pistache,Mandarine}', '{"Fleurs d''oranger",Praliné}', '{Vanille,Musc,"Bois de santal"}', '{Automne,Hiver}',
   4, 4, 4, '{"soirée gourmande","journée fraîche"}', 'délicieux, élégant, chaleureux',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/pistachio-parfum'),

  ('marshmallow', 'MARSHMALLOW', 'Douceur poudrée féminine — un nuage de sucre vanillé', 'Gourmand Sucré Poudré', 'F',
   '{"Sucre filé","Fleur d''oranger"}', '{Guimauve,"Vanille lactée",Muguet}', '{"Musc blanc","Ambre doux","Bois tendres"}', '{Automne,Hiver,Mi-saison}',
   3, 4, 4, '{cocooning,"soirée romantique"}', 'doux, tendre, addictif',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/daisy-parfum-copie'),

  ('extravagance', 'EXTRAVAGANCE', 'Floral ambré moderne — féminité multiple et lumineuse', 'Floral Ambré', 'F',
   '{Poire,Mandarine,Bergamote}', '{Néroli,"Fleur d''oranger","Jasmin sambac"}', '{Vanille,Ambre,"Musc blanc"}', '{"Toutes saisons"}',
   4, 4, 4, '{quotidien,rendez-vous,soirée}', 'moderne, libre, équilibré',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/liberty-parfum-copie'),

  ('illicite', 'ILLICITE', 'Floral oriental clair-obscur — élégance mystérieuse', 'Floral Oriental Boisé', 'F',
   '{Poire,Bergamote}', '{"Fleur d''oranger","Jasmin sambac",Tubéreuse}', '{Patchouli,Vétiver,"Vanille noire"}', '{Automne,Hiver}',
   5, 5, 5, '{"soirée élégante","ambiance confidentielle"}', 'envoûtant, audacieux, chic',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/yaara-parfum-copie'),

  ('manif', 'MANIF', 'Oriental floral vanillé — déclaration de féminité', 'Oriental Floral Vanillé', 'F',
   '{Cassis,Bergamote,"Accord vert"}', '{"Jasmin Sambac","Fleur d''oranger"}', '{Vanille,"Fève tonka","Bois de santal",Cèdre}', '{Automne,Hiver}',
   5, 5, 5, '{"soirée élégante","rendez-vous romantique",signature}', 'passionnée, affirmée, raffinée',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/aramis-parfum-copie'),

  ('nuit-b', 'NUIT B', 'Floral musqué boisé — élégance sophistiquée du soir', 'Floral Musqué Boisé', 'F',
   '{"Pêche blanche",Aldéhydes}', '{Jasmin,Violette,"Fleurs blanches"}', '{Musc,"Bois de santal"}', '{Automne,Hiver,Mi-saison}',
   4, 4, 4, '{"soirée élégante","dîner raffiné"}', 'chic, discret, sensuel',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/blacko-parfum-copie'),

  ('nani', 'NANI', 'Fruité floral gourmand — pomme d''amour féérique', 'Floral Fruité Gourmand', 'F',
   '{"Citron de Calabre","Citron vert"}', '{"Pomme confite",Pivoine,Praliné}', '{"Bois de pommier","Musc blanc",Cèdre}', '{Printemps,Été}',
   3, 4, 4, '{quotidien,"moments légers"}', 'pétillant, féérique, doux',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/angela-parfum-copie'),

  ('merveilles', 'MERVEILLES', 'Boisé ambré minéral — élégance intemporelle', 'Boisé Ambré Minéral', 'U',
   '{"Orange amère","Poivre rose"}', '{"Notes boisées",Cèdre,Élémis}', '{"Ambre gris",Mousse,Vétiver}', '{Printemps,Automne,Hiver}',
   4, 4, 5, '{"journée lumineuse","signature intemporelle"}', 'rare, poétique, sophistiqué',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/coconut-parfum-copie'),

  ('coconut', 'COCONUT', 'Évasion solaire & sensuelle', 'Gourmand Vanillé Solaire', 'F',
   '{"Noix de coco fraîche","Lait chaud"}', '{Vanille,"Fleurs tropicales"}', '{Musc,"Ambre doux",Sucre}', '{Printemps,Été}',
   4, 4, 4, '{vacances,détente}', 'doux, solaire, addictif',
   19.90, 30.00, 'EUR', false, 'https://eleganza-parfums.com/products/audace-parfum-copie'),

  ('this-is-her', 'THIS IS HER', 'Oriental vanillé boisé — féminité rock et tendre', 'Oriental Vanillé Boisé', 'F',
   '{Jasmin,"Poivre rose","Fleur de soie"}', '{Châtaigne,"Crème de vanille","Bois de cachemire"}', '{"Bois de santal",Musc,Ambroxan}', '{Automne,Hiver}',
   5, 5, 5, '{soirée,"signature charismatique"}', 'audacieux, sensuel, rebelle',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/maestro-parfum-copie'),

  ('flower', 'FLOWER', 'Floral poudré musqué — pureté féminine intemporelle', 'Floral Poudré Musqué', 'F',
   '{Cassis,Aubépine,Mandarine}', '{Rose,Violette,Jasmin}', '{Vanille,"Musc blanc","Encens léger"}', '{Printemps,Automne}',
   3, 3, 4, '{"journée calme","environnement doux"}', 'tendre, pure, élégante',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/lady-parfum-copie'),

  ('noirsx', 'NOIRSX', 'Oriental profond — féminité audacieuse et gourmande', 'Floral Fruité Gourmand', 'F',
   '{Canneberge,"Poivre rose",Tamaris}', '{"Rose noire",Violette,Cacao}', '{Vanille,"Bois de Massoïa",Patchouli}', '{Automne,Hiver}',
   4, 4, 4, '{"soirée intense","rendez-vous sensuel"}', 'rebelle, magnétique, addictif',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/irresistible-parfum-copie-copie'),

  ('booster', 'BOOSTER', 'Frais sportif — énergie et vitalité', 'Aromatique Hespéridé', 'H',
   '{Menthe,Orange,Eucalyptus}', '{Lavande,Basilic,Galbanum}', '{Vétiver,Musc,"Bois de santal"}', '{Printemps,Été}',
   3, 4, 4, '{quotidien,sport,"journée active"}', 'dynamique, énergique, frais',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/love-it-parfum-copie'),

  ('victus', 'VICTUS', 'Aquatique boisé frais — esprit de victoire masculine', 'Aquatique Boisé Frais', 'H',
   '{"Accord marin",Pamplemousse,"Feuille de laurier"}', '{"Ambre gris",Géranium,"Épices douces"}', '{"Bois de gaïac",Patchouli,"Mousse de chêne"}', '{Printemps,Été,Automne}',
   4, 4, 4, '{quotidien,sport,"journée active"}', 'dynamique, ambitieux, frais',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/olympe-parfum-copie'),

  ('ultra-viril', 'ULTRA VIRIL', 'Oriental fougère gourmand — séduction magnétique', 'Oriental Fougère Gourmand', 'H',
   '{Poire,Bergamote,Menthe}', '{Lavande,Cannelle,Cumin}', '{"Vanille noire","Bois ambrés",Patchouli}', '{Automne,Hiver}',
   5, 5, 5, '{soirée,"rendez-vous galant"}', 'audacieux, sensuel, magnétique',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/acqua-parfum-copie'),

  ('cody', 'CODY', 'Oriental gourmand — 28 Vanilla, vanille bourbon sensuelle', 'Oriental Gourmand', 'U',
   '{"Vanille bourbon",Orchidée}', '{"Fève tonka",Jasmin}', '{Ambre,Patchouli,"Musc brun"}', '{Automne,Hiver}',
   4, 4, 5, '{"soirée sensuelle","moments de tendresse"}', 'enveloppant, addictif, féminin',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/cody-parfum-copie'),

  ('stronger', 'STRONGER', 'Oriental fougère — charisme magnétique masculin', 'Oriental Fougère', 'H',
   '{"Poivre rose","Baies de genièvre",Violette}', '{Lavande,Cannelle,Sauge}', '{Vanille,"Fève tonka",Ambre,"Bois ambré"}', '{Automne,Hiver}',
   5, 5, 5, '{soirée,rendez-vous}', 'puissant, addictif, charismatique',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/men-intense-parfum-copie'),

  ('first-class', 'FIRST CLASS', 'Élégant sophistiqué — la signature du gentleman moderne', 'Boisé Élégant', 'H',
   '{Bergamote,Lavande,Citron}', '{"Cèdre blanc",Pomme,Rose}', '{Santal,"Fève tonka","Mousse de chêne"}', '{Printemps,Automne}',
   4, 4, 4, '{quotidien,bureau,soirée}', 'élégant, raffiné, charismatique',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/aisha-parfum-copie'),

  ('aisha', 'AISHA', 'Oriental floral en promotion — élégance accessible', 'Oriental Floral', 'U',
   '{Bergamote,Mandarine}', '{Rose,Jasmin,"Fleur d''oranger"}', '{Vanille,Ambre,Musc}', '{Automne,Hiver,Printemps}',
   4, 4, 4, '{quotidien,soirée}', 'élégant, accessible, sensuel',
   19.90, 30.00, 'EUR', true, 'https://eleganza-parfums.com/products/robe-parfum-copie-copie'),

  ('fabulous', 'FABULOUS', 'Boisé cuiré unisexe — provocateur et exclusif', 'Boisé Cuiré', 'U',
   '{"Sauge sclarée",Lavande}', '{"Amande amère",Vanille,Cuir,Iris}', '{"Fève tonka",Cachemire,Ambre,"Bois blanc"}', '{Automne,Hiver}',
   5, 5, 5, '{"soirées spéciales","événement exclusif"}', 'intense, provocateur, exclusif',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/fabulous'),

  ('lazuli', 'LAZULI', 'Oriental épicé sophistiqué — voyage entre Orient et Occident', 'Oriental Épicé', 'U',
   '{Bergamote,Cardamome,Maté}', '{Prune,Osmanthus,Jasmin}', '{Tabac,Miel,Vanille,"Bois de santal"}', '{"Toutes saisons"}',
   4, 4, 5, '{travail,"soirée d''exception"}', 'rare, sophistiqué, expressif',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/lazuli-parfum'),

  ('hayati', 'HAYATI', 'Fruité gourmand musqué — baies rouges et vanille crémeuse', 'Fruité Gourmand Musqué', 'U',
   '{Framboise,"Baies rouges"}', '{Vanille,Sucre}', '{Musc,"Notes lactées"}', '{Printemps,Été}',
   4, 4, 4, '{quotidien,"rendez-vous romantique"}', 'joyeux, doux, sensuel',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/hayati-parfum'),

  ('velvet-oud', 'VELVET OUD', 'Oriental boisé — l''élégance du désert oriental', 'Oriental Boisé', 'U',
   '{Ambre,"Épices chaudes"}', '{"Oud noble","Bois précieux"}', '{"Musc chaud",Résines}', '{Automne,Hiver}',
   5, 5, 5, '{soirée,événement,"signature intemporelle"}', 'profond, sensuel, intemporel',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/velvet-oud-parfum'),

  ('moonlight', 'MOONLIGHT', 'Fruité tropical — voyage exotique et lumineux', 'Fruité Tropical Floral', 'U',
   '{Mangue,Pamplemousse}', '{"Riz lacté","Noix de coco"}', '{"Musc blanc","Bois tendres"}', '{Printemps,Été}',
   4, 4, 4, '{été,vacances,"journées ensoleillées"}', 'exotique, frais, gourmand',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/moonlight-parfum'),

  ('ambre', 'AMBRE', 'Ambré floral mixte — sensualité et mystère', 'Ambré Floral', 'U',
   '{Bergamote,"Poivre rose"}', '{"Rose turque",Encens}', '{"Ambre gris","Bois sombres",Musc}', '{Automne,Hiver}',
   4, 4, 5, '{"journées fraîches","soirées habillées"}', 'élégant, mystérieux, raffiné',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/ambre-parfum'),

  ('musk-tahara', 'MUSK TAHARA INTIME', 'Musc blanc doux — pureté et féminité orientale', 'Musc Blanc Oriental', 'F',
   '{"Musc blanc","Fleur d''oranger"}', '{"Notes poudrées","Vanille douce"}', '{"Musc tendre","Bois blanc"}', '{"Toutes saisons"}',
   3, 3, 4, '{"après-douche","quotidien intime"}', 'doux, propre, féminin',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/blogs/infos/musk-tahara-intime-parfum-feminin-au-musc-blanc-doux'),

  ('nomade', 'NOMADE', 'Boisé fruité hypnotique — voyage olfactif unique', 'Boisé Fruité Ambré', 'U',
   '{Benjoin,Bouleau,Géranium}', '{Framboise,Safran,Amberwood}', '{Patchouli,"Bois de oud",Ambre}', '{"Toutes saisons"}',
   5, 5, 5, '{signature,"soirée mémorable"}', 'hypnotique, addictif, unique',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/products/nomade-parfum'),

  -- ─── CLASSIC HOMME — NEW STUBS ─────────────────────────────────────
  ('bleu', 'BLEU', 'Boisé aromatique sophistiqué — élégance citadine intemporelle', 'Boisé Aromatique', 'H',
   '{Pamplemousse,Citron,Menthe}', '{Gingembre,"Notes boisées"}', '{"Bois de santal",Cèdre,Labdanum}', '{"Toutes saisons"}',
   4, 4, 5, '{bureau,soirée,signature}', 'élégant, frais, magnétique',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/hommes'),

  ('dhi', 'DHI', 'Iris poudré et cacao — élégance masculine raffinée', 'Iris Poudré', 'H',
   '{Lavande,Iris}', '{Iris,"Cacao amer",Cardamome}', '{Vétiver,Cuir,Cèdre}', '{Automne,Hiver}',
   4, 4, 5, '{"soirée habillée","signature distinguée"}', 'distingué, sensuel, intemporel',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/hommes'),

  ('viril', 'VIRIL', 'Oriental fougère affirmé — sillage de séduction', 'Oriental Fougère', 'H',
   '{Lavande,Bergamote}', '{Cannelle,Cumin,Sauge}', '{Vanille,"Bois ambrés",Tonka}', '{Automne,Hiver}',
   5, 5, 5, '{soirée,rendez-vous}', 'viril, charismatique, conquérant',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/hommes'),

  ('scandal', 'SCANDAL', 'Oriental gourmand provocant — séduction sans retenue', 'Oriental Gourmand', 'H',
   '{Mandarine,"Sauge sclarée"}', '{"Fève de tonka",Miel}', '{Cèdre,"Bois ambrés","Tabac blond"}', '{Automne,Hiver}',
   5, 5, 5, '{"soirée audacieuse",événement}', 'audacieux, sucré, magnétique',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/hommes'),

  ('legendaire', 'LÉGENDAIRE', 'Boisé fruité noble — sillage de prestige', 'Boisé Fruité', 'H',
   '{Bergamote,Lavande,Ananas}', '{Pomme,Cannelle,Bouleau}', '{Vétiver,"Mousse de chêne",Patchouli}', '{Printemps,Automne}',
   4, 5, 5, '{bureau,soirée,signature}', 'noble, conquérant, intemporel',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/hommes'),

  ('dollars', 'DOLLARS', 'Oriental métallique solaire — luxe assumé', 'Oriental Épicé', 'H',
   '{Pamplemousse,Menthe,"Cannelle blanche"}', '{Rose,"Cuir blond"}', '{Ambre,"Bois indien",Patchouli}', '{"Toutes saisons"}',
   5, 5, 5, '{soirée,"signature de soir"}', 'puissant, lumineux, charismatique',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/hommes'),

  ('night-men', 'NIGHT MEN', 'Oriental épicé nocturne — séduction profonde du soir', 'Oriental Épicé', 'H',
   '{Cardamome,Bergamote}', '{Lavande,"Cèdre de Virginie"}', '{Vétiver,Tonka,Vanille}', '{Automne,Hiver}',
   5, 5, 5, '{soirée,rendez-vous}', 'sensuel, nocturne, magnétique',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/hommes'),

  ('men-intense', 'MEN INTENSE', 'Oriental gourmand intense — concentré de séduction', 'Oriental Gourmand', 'H',
   '{Lavande,Menthe}', '{Cannelle,Cumin,Iris}', '{"Vanille noire","Bois ambrés",Tonka}', '{Automne,Hiver}',
   5, 5, 5, '{soirée,événement}', 'intense, charnel, addictif',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/hommes'),

  -- ─── CLASSIC FEMME — NEW STUBS ─────────────────────────────────────
  ('girly', 'GIRLY', 'Oriental fruité espiègle — féminité affirmée', 'Oriental Fruité', 'F',
   '{Bergamote,Citron,Pêche}', '{Tubéreuse,Jasmin,Cacao}', '{"Fève tonka",Ambre,Cacao}', '{Automne,Hiver}',
   5, 5, 5, '{soirée,signature}', 'audacieuse, sucrée, magnétique',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/femmes'),

  ('melle', 'MELLE', 'Chypré floral parisien — chic intemporel', 'Chypré Floral', 'F',
   '{Orange,Bergamote,Litchi}', '{"Rose de mai",Jasmin}', '{Patchouli,Vétiver,"Musc blanc"}', '{"Toutes saisons"}',
   4, 4, 5, '{"quotidien chic",soirée,travail}', 'élégante, libre, parisienne',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/femmes'),

  ('i-love-it', 'I LOVE IT', 'Floral lumineux solaire — joie et féminité radieuse', 'Floral Lumineux', 'F',
   '{Mandarine,Bergamote,Poire}', '{Jasmin,Ylang-ylang,"Rose de Damas"}', '{"Musc blanc","Bois de cèdre",Vanille}', '{Printemps,Été}',
   4, 4, 4, '{journée,rendez-vous}', 'lumineuse, joyeuse, féminine',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/femmes'),

  ('hypnotic', 'HYPNOTIC', 'Oriental sucré envoûtant — sensualité hypnotique', 'Oriental Sucré', 'F',
   '{Prune,Cumin,"Notes vertes"}', '{"Jasmin sambac",Caraway}', '{Vanille,"Bois de santal",Musc}', '{Automne,Hiver}',
   5, 5, 5, '{soirée,"rendez-vous nocturne"}', 'hypnotique, sensuelle, mystérieuse',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/femmes'),

  ('is', 'IS', 'Chypré fruité affirmé — la force féminine en flacon', 'Chypré Fruité', 'F',
   '{Cassis,Bergamote}', '{"Rose de mai",Jasmin}', '{Patchouli,"Bois de santal",Vanille}', '{"Toutes saisons"}',
   4, 4, 5, '{travail,soirée}', 'forte, élégante, contemporaine',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/femmes'),

  ('the-way', 'THE WAY', 'Floral lumineux poudré — un chemin tout en grâce', 'Floral Poudré', 'F',
   '{Bergamote,"Néroli orange"}', '{Tubéreuse,"Jasmin indien"}', '{"Vanille de Madagascar","Bois de cèdre","Musc blanc"}', '{Printemps,Été,Automne}',
   4, 4, 4, '{quotidien,rendez-vous}', 'gracieuse, libre, optimiste',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/femmes'),

  ('robe', 'ROBE', 'Gourmand floral parisien — élégance noire et sucrée', 'Floral Gourmand', 'F',
   '{"Cerise noire",Bergamote,Amande}', '{Rose,Iris}', '{Patchouli,Vanille,"Fève tonka"}', '{Automne,Hiver}',
   4, 4, 5, '{"soirée chic",rendez-vous}', 'parisienne, espiègle, addictive',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/femmes'),

  ('nefertiti', 'NEFERTITI', 'Oriental floral royal — éclat des sables anciens', 'Oriental Floral', 'F',
   '{Safran,Bergamote}', '{"Rose de Damas","Oud doux"}', '{Ambre,Musc,"Bois précieux"}', '{Automne,Hiver}',
   5, 5, 5, '{soirée,"signature mémorable"}', 'royale, mystérieuse, intemporelle',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/femmes'),

  ('diamant-noir', 'DIAMANT NOIR', 'Oriental musqué noir — éclat ténébreux et précieux', 'Oriental Musqué', 'F',
   '{"Poivre noir",Cassis}', '{"Rose noire",Patchouli}', '{"Vanille noire",Ambre,"Musc sombre"}', '{Automne,Hiver}',
   5, 5, 5, '{"soirée habillée",événement}', 'précieuse, sombre, magnétique',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/femmes'),

  ('lady', 'LADY', 'Ambré floral solaire — éclat doré de la féminité', 'Ambré Floral', 'F',
   '{Néroli,Framboise,Bergamote}', '{Jasmin,"Fleur d''oranger"}', '{Ambre,Patchouli,"Musc blanc"}', '{"Toutes saisons"}',
   4, 5, 5, '{soirée,"signature lumineuse"}', 'lumineuse, glamour, affirmée',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/femmes'),

  ('olympe', 'OLYMPE', 'Floral salé divin — féminité solaire et conquérante', 'Floral Salé', 'F',
   '{"Mandarine verte",Gingembre}', '{"Sel d''ambre","Jasmin sambac"}', '{"Bois de santal",Vanille,Cachemiran}', '{Printemps,Été}',
   4, 4, 4, '{"journée solaire",rendez-vous}', 'solaire, divine, conquérante',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/femmes'),

  ('neila', 'NEILA', 'Floral oriental classique — rose hespéridée intemporelle', 'Floral Oriental', 'F',
   '{Pêche,Bergamote}', '{"Rose de Bulgarie",Jasmin}', '{"Bois de santal",Iris,Vanille}', '{"Toutes saisons"}',
   4, 4, 5, '{soirée,"signature classique"}', 'romanesque, intemporelle, raffinée',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/femmes'),

  ('blacko', 'BLACKO', 'Café vanille intense — addiction nocturne féminine', 'Oriental Gourmand', 'F',
   '{"Poivre rose",Mandarine}', '{Café,"Fleur d''oranger",Jasmin}', '{Vanille,Patchouli,Cèdre}', '{Automne,Hiver}',
   5, 5, 5, '{soirée,"signature nocturne"}', 'addictive, sombre, charismatique',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/femmes'),

  -- ─── COLLECTION PRIVÉ — NEW STUBS ──────────────────────────────────
  ('sucre-noir', 'SUCRE NOIR', 'Gourmand sombre — caramel brûlé et vanille noire', 'Gourmand Sombre', 'U',
   '{"Mandarine sanguine"}', '{"Caramel brûlé",Réglisse}', '{"Vanille noire",Patchouli,"Bois sombres"}', '{Automne,Hiver}',
   5, 5, 5, '{"soirée intime","signature ténébreuse"}', 'sombre, addictif, mystérieux',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('mula', 'MULA', 'Oriental traditionnel — mukhallat précieux du désert', 'Oriental Traditionnel', 'U',
   '{Safran,Bergamote}', '{Rose,Oud,Encens}', '{"Ambre gris",Musc,Patchouli}', '{"Toutes saisons"}',
   5, 5, 5, '{soirée,"signature orientale"}', 'traditionnel, profond, précieux',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('sultan', 'SULTAN', 'Oriental boisé royal — puissance et grandeur', 'Oriental Boisé', 'H',
   '{"Poivre noir",Cardamome}', '{"Rose turque","Oud noble"}', '{"Bois de oud",Patchouli,Ambre}', '{Automne,Hiver}',
   5, 5, 5, '{événement,"signature royale"}', 'royal, puissant, charismatique',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('gris', 'GRIS', 'Chypré poudré gris perle — élégance intemporelle', 'Chypré Poudré', 'U',
   '{Bergamote,Mandarine}', '{Iris,Rose}', '{Patchouli,"Musc blanc","Bois de santal"}', '{"Toutes saisons"}',
   4, 4, 5, '{"quotidien chic",soirée}', 'élégant, intemporel, poudré',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('trafalgar', 'TRAFALGAR', 'Fruité boisé conquérant — sillage de victoire', 'Fruité Boisé', 'H',
   '{Ananas,Bergamote,Pomme}', '{Bouleau,Rose,Jasmin}', '{"Mousse de chêne","Ambre gris",Vanille}', '{"Toutes saisons"}',
   5, 5, 5, '{bureau,soirée,signature}', 'conquérant, ambitieux, prestigieux',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('sucre-rose', 'SUCRE ROSE', 'Rose sucrée gourmande — féminité bonbon raffinée', 'Floral Gourmand', 'F',
   '{Rose,Bergamote}', '{Praliné,Pivoine}', '{Vanille,"Bois de santal",Musc}', '{"Toutes saisons"}',
   4, 4, 4, '{rendez-vous,cocooning}', 'gourmande, romantique, addictive',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('caramelo', 'CARAMELO', 'Caramel vanille onctueux — gourmandise irrésistible', 'Gourmand Caramel', 'F',
   '{Caramel,Bergamote}', '{Vanille,Praliné}', '{Musc,"Bois doux",Patchouli}', '{Automne,Hiver}',
   4, 4, 5, '{cocooning,"soirée romantique"}', 'gourmande, douce, irrésistible',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('oud-satin', 'OUD SATIN', 'Oriental satiné — violette, rose et oud précieux', 'Oriental Boisé', 'U',
   '{Violette,Bergamote}', '{"Rose de mai","Oud doux"}', '{"Bois de santal",Ambre,Vanille}', '{Automne,Hiver}',
   5, 5, 5, '{soirée,événement}', 'précieux, satiné, hypnotique',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('latte', 'LATTE', 'Café crème vanille — chaleur gourmande intemporelle', 'Gourmand Café', 'U',
   '{Café,Bergamote}', '{Vanille,Crème}', '{Musc,"Bois doux",Tonka}', '{Automne,Hiver}',
   4, 4, 4, '{journée,cocooning}', 'doux, réconfortant, gourmand',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('beluga', 'BELUGA', 'Cuir blanc poudré — luxe iris et amande', 'Cuir Iris', 'U',
   '{Mandarine,Bergamote}', '{Iris,Amande,Héliotrope}', '{"Cuir blanc",Vanille,Tonka}', '{"Toutes saisons"}',
   4, 4, 5, '{"soirée habillée","signature distinguée"}', 'distingué, poudré, intemporel',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('greatness', 'GREATNESS', 'Boisé épicé conquérant — sillage de prestige', 'Boisé Épicé', 'H',
   '{Lavande,Bergamote,Pomme}', '{Cannelle,Géranium}', '{Vanille,"Ambre gris","Bois de cèdre"}', '{"Toutes saisons"}',
   5, 5, 5, '{bureau,soirée}', 'noble, conquérant, mémorable',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('utopia', 'UTOPIA', 'Fruité gourmand luxueux — rêve d''évasion sucrée', 'Fruité Gourmand', 'U',
   '{"Fruits exotiques",Bergamote}', '{Rose,Praliné}', '{Vanille,"Bois ambrés",Patchouli}', '{"Toutes saisons"}',
   5, 5, 5, '{soirée,"signature mémorable"}', 'luxueux, addictif, vibrant',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('love', 'LOVE', 'Vanille guimauve sensuelle — déclaration d''amour gourmande', 'Gourmand Vanillé', 'F',
   '{Bergamote,Néroli}', '{Guimauve,Iris}', '{"Vanille de Madagascar","Musc blanc",Cèdre}', '{Automne,Hiver}',
   4, 4, 5, '{"rendez-vous romantique",cocooning}', 'tendre, addictive, sensuelle',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('khamrah', 'KHAMRAH', 'Oriental épicé enivrant — célébration des sens', 'Oriental Épicé', 'U',
   '{Cannelle,"Noix de muscade",Bergamote}', '{Praliné,Datte,"Bois de oud"}', '{Vanille,"Bois de santal",Tonka}', '{Automne,Hiver}',
   5, 5, 5, '{soirée,"événement oriental"}', 'enivrant, festif, addictif',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('krypto', 'KRYPTO', 'Frais aromatique citrique — énergie inarrêtable', 'Aromatique Hespéridé', 'H',
   '{Citron,Pamplemousse,Menthe}', '{Lavande,Géranium}', '{Vétiver,Musc,"Bois de cèdre"}', '{Printemps,Été}',
   4, 4, 4, '{sport,"journée active"}', 'frais, dynamique, énergique',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('santal-33', '33 SANTAL', 'Santal cuir iconique — signature minimaliste new-yorkaise', 'Boisé Cuiré', 'U',
   '{Violette,Cardamome}', '{Iris,Ambroxan}', '{"Bois de santal",Cuir,Cèdre}', '{"Toutes saisons"}',
   4, 4, 5, '{quotidien,"signature distinctive"}', 'minimaliste, addictif, iconique',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('my-dream', 'MY DREAM', 'Floral lumineux poudré — rêverie féminine', 'Floral Poudré', 'F',
   '{Bergamote,"Néroli orange"}', '{"Tubéreuse indienne",Jasmin}', '{Vanille,"Bois de cèdre",Musc}', '{Printemps,Été}',
   4, 4, 4, '{quotidien,rendez-vous}', 'rêveuse, optimiste, gracieuse',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('immense', 'IMMENSE', 'Fruité boisé puissant — sillage immense et conquérant', 'Fruité Boisé', 'H',
   '{Ananas,Bergamote,Pomme}', '{Bouleau,Patchouli}', '{Vanille,Ambre,"Mousse de chêne"}', '{"Toutes saisons"}',
   5, 5, 5, '{soirée,événement}', 'immense, conquérant, mémorable',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('coco-vanilla', 'COCO VANILLA', 'Coco vanille addictive — sensualité tropicale', 'Gourmand Vanillé', 'F',
   '{"Noix de coco",Vanille}', '{"Fleur d''oranger",Praliné}', '{"Musc blanc",Sucre,"Bois de santal"}', '{"Toutes saisons"}',
   4, 4, 5, '{quotidien,rendez-vous}', 'addictive, sensuelle, ensoleillée',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('pegaz', 'PEGAZ', 'Amande boisée mythique — sillage légendaire', 'Amande Boisée', 'H',
   '{"Amande amère",Bergamote}', '{Lavande,"Notes lactées",Héliotrope}', '{Vanille,"Musc blanc","Bois de cèdre"}', '{"Toutes saisons"}',
   5, 5, 5, '{soirée,"signature distinctive"}', 'mythique, lumineux, sensuel',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('delina', 'DELINA', 'Rose litchi luxueuse — féminité rare et précieuse', 'Floral Fruité', 'F',
   '{Litchi,Rhubarbe,Bergamote}', '{"Rose de Turquie",Pivoine,Nerolia}', '{Vanille,"Bois de cèdre",Musc}', '{"Toutes saisons"}',
   4, 5, 5, '{soirée,"signature précieuse"}', 'précieuse, rare, intemporelle',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('liquide-brun', 'LIQUIDE BRUN', 'Résineux fumé profond — mystère absolu', 'Résineux Fumé', 'U',
   '{"Notes vertes",Cardamome}', '{Encens,Patchouli,Tabac}', '{Oud,"Résines brunes","Bois fumé"}', '{Automne,Hiver}',
   5, 5, 5, '{soirée,"signature mystique"}', 'mystique, intense, ténébreux',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('casanova', 'CASANOVA', 'Agrumes floraux séducteurs — élégance italienne', 'Hespéridé Floral', 'U',
   '{Bergamote,Citron,Mandarine}', '{Jasmin,Magnolia,Rose}', '{"Bois de santal",Musc,Vanille}', '{Printemps,Été}',
   4, 4, 4, '{rendez-vous,"soirée italienne"}', 'séducteur, lumineux, élégant',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('cherry', 'CHERRY', 'Cerise amande tabac — gourmandise audacieuse', 'Gourmand Fruité', 'U',
   '{"Cerise noire","Amande amère"}', '{Tabac,Liqueur}', '{"Bois de santal",Vanille,Patchouli}', '{Automne,Hiver}',
   5, 5, 5, '{"soirée audacieuse",rendez-vous}', 'audacieux, addictif, sensuel',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('leather', 'LEATHER', 'Cuir framboise — luxe brut et sensuel', 'Cuir Fruité', 'U',
   '{Framboise,Safran}', '{Cuir,Jasmin,Olibanum}', '{"Bois ambrés",Suède,Vanille}', '{Automne,Hiver}',
   5, 5, 5, '{soirée,"signature de caractère"}', 'brut, sensuel, prestigieux',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive'),

  ('erbaggi', 'ERBAGGI', 'Fruité musqué méditerranéen — soleil en flacon', 'Fruité Musqué', 'U',
   '{Bergamote,"Citron de Sicile",Cédrat}', '{"Fruits exotiques",Jasmin}', '{Ambre,"Musc blanc","Bois ambrés"}', '{Printemps,Été}',
   4, 5, 5, '{"journée solaire","rendez-vous estival"}', 'solaire, lumineux, joyeux',
   19.90, null, 'EUR', true, 'https://eleganza-parfums.com/collections/collection-prive')

on conflict (slug) do update set
  name        = excluded.name,
  tagline     = excluded.tagline,
  family      = excluded.family,
  gender      = excluded.gender,
  notes_tete  = excluded.notes_tete,
  notes_coeur = excluded.notes_coeur,
  notes_fond  = excluded.notes_fond,
  season      = excluded.season,
  intensity   = excluded.intensity,
  sillage     = excluded.sillage,
  longevity   = excluded.longevity,
  occasions   = excluded.occasions,
  vibe        = excluded.vibe,
  price       = excluded.price,
  old_price   = excluded.old_price,
  currency    = excluded.currency,
  in_stock    = excluded.in_stock,
  url         = excluded.url,
  updated_at  = now();

-- 3️⃣  Read-only sanity report.
select count(*) as total_products,
       count(*) filter (where in_stock)                        as in_stock,
       count(*) filter (where gender = 'H')                    as homme,
       count(*) filter (where gender = 'F')                    as femme,
       count(*) filter (where gender = 'U')                    as mixte,
       count(*) filter (where currency = 'EUR')                as eur_rows,
       min(price) as min_price, max(price) as max_price
from public.products;
