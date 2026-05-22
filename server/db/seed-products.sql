-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Eleganza · Product Seed                                              ║
-- ║                                                                       ║
-- ║  Prefer running   `node scripts/seedCatalog.js`   instead — it reads  ║
-- ║  knowledgeBase.js so the catalog stays in sync with code.             ║
-- ║                                                                       ║
-- ║  This SQL file is a static snapshot for manual SQL-only setups.       ║
-- ║  Safe to run multiple times: it uses ON CONFLICT (slug) DO UPDATE.    ║
-- ╚══════════════════════════════════════════════════════════════════════╝

insert into public.products
  (slug, name, tagline, family, gender,
   notes_tete, notes_coeur, notes_fond, season,
   intensity, sillage, longevity, occasions, vibe,
   price, old_price, in_stock, url)
values
  ('rouge-240',   'ROUGE 240',   'L''Éclat Royal — sillage solaire, ambré et sophistiqué', 'Ambré Floral Boisé', 'U',
   '{Jasmin,Safran}', '{Ambre,"Bois de cèdre"}', '{"Résine de sapin",Musc}', '{Automne,Hiver}',
   5, 5, 5, '{"soirée élégante",événement,signature}', 'luxueux, sensuel, mémorable',
   24, null, true, 'https://eleganza-parfums.com/products/rs5-parfum-copie'),

  ('bella-vita',  'BELLA VITA',  'Gourmand floral irrésistible — la joie de vivre en flacon', 'Gourmand Floral', 'F',
   '{Cassis,Poire}', '{Iris,Jasmin,"Fleur d''oranger"}', '{Praliné,Vanille,Patchouli,"Fève de tonka"}', '{Automne,Hiver}',
   4, 5, 5, '{quotidien,rendez-vous,signature}', 'lumineux, addictif, féminin',
   24, null, true, 'https://eleganza-parfums.com/products/imperatrice-parfum-copie'),

  ('bois-intense','BOIS INTENSE','Boisé épicé profond et mémorable','Boisé Épicé','U',
   '{Bergamote,"Poivre rose",Cardamome}','{Cèdre,Vétiver,Résine}','{Ambre,Musc,Patchouli}','{Automne,Hiver,"Toutes saisons"}',
   5,4,5,'{quotidien,"signature boisée"}','profond, élégant, intemporel',
   24,null,true,'https://eleganza-parfums.com/products/bois-intense-parfum'),

  ('creme-brulee','CRÈME BRÛLÉE','Onctueuse vanille caramélisée — confort dessert maison','Gourmand Vanillé','F',
   '{Vanille,Caramel}','{"Lait chaud","Noix de coco"}','{"Musc blanc",Sucre,"Bois doux"}','{Automne,Hiver}',
   4,4,4,'{cocooning,"soirée d''hiver"}','doux, réconfortant, addictif',
   24,null,true,'https://eleganza-parfums.com/products/accro-a-la-vanille-parfum'),

  ('toxic-girl','TOXIC GIRL','Sucré et rebelle — féminité audacieuse et glamour','Oriental Floral Gourmand','F',
   '{"Orange amère",Citron}','{"Rose de Damas","Fleur d''oranger"}','{"Fève tonka",Vanille,"Bois de santal"}','{Automne,Hiver,Printemps}',
   4,4,4,'{soirée,"sortie entre amies"}','séduisant, provocateur, glamour',
   24,null,true,'https://eleganza-parfums.com/products/amoramo-parfum-copie'),

  ('liberty','LIBERTY','Floral lavande vanille — élégance moderne et affirmée','Floral Aromatique','F',
   '{Lavande,Mandarine,Néroli}','{Jasmin,"Fleur d''oranger"}','{"Vanille de Madagascar","Ambre gris",Cèdre}','{Printemps,Automne,Hiver}',
   4,4,5,'{travail,journée,soirée}','libre, ambitieuse, sophistiquée',
   24,null,true,'https://eleganza-parfums.com/products/fire-24-parfum-copie'),

  ('bodyko','BODYKO','Oriental boisé masculin — encens sacré et bois sensuels','Oriental Boisé','H',
   '{Eucalyptus,Encens}','{"Bois de cèdre",Camphre}','{Benjoin,"Fève tonka"}','{Automne,Hiver}',
   5,4,5,'{"soirée élégante","saisons fraîches"}','mystique, charismatique, profond',
   24,null,false,'https://eleganza-parfums.com/products/blanc-parfum-copie'),

  ('so-elixir','SO ELIXIR','Boisé épicé puissant et magnétique','Boisé Épicé Aromatique','H',
   '{"Bergamote de Calabre",Poivre}','{Lavande,"Poivre du Sichuan",Géranium,Vétiver}','{Ambroxan,Cèdre,Ciste}','{Automne,Hiver,Printemps}',
   5,5,5,'{soirée,"signature masculine"}','puissant, charismatique, viril',
   24,null,false,'https://eleganza-parfums.com/products/dollars-parfum-copie'),

  ('imaginaire','IMAGINAIRE','Vibrant et rafraîchissant — liberté et créativité','Aromatique Hespéridé Ambré','U',
   '{"Citron de Calabre",Bergamote,Orange}','{Gingembre,Néroli,Cannelle}','{Ambroxan,"Thé noir","Bois de Gaïac"}','{Printemps,Été}',
   3,4,4,'{"journée claire",travail,sérénité}','créatif, libre, raffiné',
   24,null,true,'https://eleganza-parfums.com/products/imaginaire-parfum'),

  ('on-fire','ON FIRE','Explosion solaire fruitée et exotique','Oriental Fruité Boisé','U',
   '{Mangue,Citron,Gingembre}','{Résines,Jasmin,Safran}','{"Oud doux",Vanille,"Bois ambrés",Musc}','{Printemps,Été,Automne}',
   5,5,5,'{"soirée estivale","événement audacieux"}','flamboyant, puissant, exotique',
   24,null,true,'https://eleganza-parfums.com/products/bois-d-iris-parfum-copie'),

  ('pistachio','PISTACHIO','Gourmand lacté et envoûtant — pistache & vanille','Gourmand Oriental','U',
   '{Pistache,Mandarine}','{"Fleurs d''oranger",Praliné}','{Vanille,Musc,"Bois de santal"}','{Automne,Hiver}',
   4,4,4,'{"soirée gourmande","journée fraîche"}','délicieux, élégant, chaleureux',
   24,null,true,'https://eleganza-parfums.com/products/pistachio-parfum'),

  ('marshmallow','MARSHMALLOW','Douceur poudrée féminine — un nuage de sucre vanillé','Gourmand Sucré Poudré','F',
   '{"Sucre filé","Fleur d''oranger"}','{Guimauve,"Vanille lactée",Muguet}','{"Musc blanc","Ambre doux","Bois tendres"}','{Automne,Hiver,Mi-saison}',
   3,4,4,'{cocooning,"soirée romantique"}','doux, tendre, addictif',
   24,null,true,'https://eleganza-parfums.com/products/daisy-parfum-copie'),

  ('extravagance','EXTRAVAGANCE','Floral ambré moderne — féminité multiple et lumineuse','Floral Ambré','F',
   '{Poire,Mandarine,Bergamote}','{Néroli,"Fleur d''oranger","Jasmin sambac"}','{Vanille,Ambre,"Musc blanc"}','{"Toutes saisons"}',
   4,4,4,'{quotidien,rendez-vous,soirée}','moderne, libre, équilibré',
   24,null,true,'https://eleganza-parfums.com/products/liberty-parfum-copie'),

  ('illicite','ILLICITE','Floral oriental clair-obscur — élégance mystérieuse','Floral Oriental Boisé','F',
   '{Poire,Bergamote}','{"Fleur d''oranger","Jasmin sambac",Tubéreuse}','{Patchouli,Vétiver,"Vanille noire"}','{Automne,Hiver}',
   5,5,5,'{"soirée élégante","ambiance confidentielle"}','envoûtant, audacieux, chic',
   24,null,true,'https://eleganza-parfums.com/products/yaara-parfum-copie'),

  ('manif','MANIF','Oriental floral vanillé — déclaration de féminité','Oriental Floral Vanillé','F',
   '{Cassis,Bergamote,"Accord vert"}','{"Jasmin Sambac","Fleur d''oranger"}','{Vanille,"Fève tonka","Bois de santal",Cèdre}','{Automne,Hiver}',
   5,5,5,'{"soirée élégante","rendez-vous romantique",signature}','passionnée, affirmée, raffinée',
   24,null,true,'https://eleganza-parfums.com/products/aramis-parfum-copie'),

  ('coconut','COCONUT','Évasion solaire & sensuelle','Gourmand Vanillé Solaire','F',
   '{"Noix de coco fraîche","Lait chaud"}','{Vanille,"Fleurs tropicales"}','{Musc,"Ambre doux",Sucre}','{Printemps,Été}',
   4,4,4,'{vacances,détente}','doux, solaire, addictif',
   19,30,false,'https://eleganza-parfums.com/products/audace-parfum-copie'),

  ('cody','CODY','Oriental gourmand — 28 Vanilla, vanille bourbon sensuelle','Oriental Gourmand','U',
   '{"Vanille bourbon",Orchidée}','{"Fève tonka",Jasmin}','{Ambre,Patchouli,"Musc brun"}','{Automne,Hiver}',
   4,4,5,'{"soirée sensuelle","moments de tendresse"}','enveloppant, addictif, féminin',
   24,null,true,'https://eleganza-parfums.com/products/cody-parfum-copie'),

  ('hayati','HAYATI','Fruité gourmand musqué — baies rouges et vanille crémeuse','Fruité Gourmand Musqué','U',
   '{Framboise,"Baies rouges"}','{Vanille,Sucre}','{Musc,"Notes lactées"}','{Printemps,Été}',
   4,4,4,'{quotidien,"rendez-vous romantique"}','joyeux, doux, sensuel',
   24,null,true,'https://eleganza-parfums.com/products/hayati-parfum'),

  ('ambre','AMBRE','Ambré floral mixte — sensualité et mystère','Ambré Floral','U',
   '{Bergamote,"Poivre rose"}','{"Rose turque",Encens}','{"Ambre gris","Bois sombres",Musc}','{Automne,Hiver}',
   4,4,5,'{"journées fraîches","soirées habillées"}','élégant, mystérieux, raffiné',
   24,null,true,'https://eleganza-parfums.com/products/ambre-parfum'),

  ('nomade','NOMADE','Boisé fruité hypnotique — voyage olfactif unique','Boisé Fruité Ambré','U',
   '{Benjoin,Bouleau,Géranium}','{Framboise,Safran,Amberwood}','{Patchouli,"Bois de oud",Ambre}','{"Toutes saisons"}',
   5,5,5,'{signature,"soirée mémorable"}','hypnotique, addictif, unique',
   24,null,true,'https://eleganza-parfums.com/products/nomade-parfum')
on conflict (slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  family = excluded.family,
  gender = excluded.gender,
  notes_tete = excluded.notes_tete,
  notes_coeur = excluded.notes_coeur,
  notes_fond = excluded.notes_fond,
  season = excluded.season,
  intensity = excluded.intensity,
  sillage = excluded.sillage,
  longevity = excluded.longevity,
  occasions = excluded.occasions,
  vibe = excluded.vibe,
  price = excluded.price,
  old_price = excluded.old_price,
  in_stock = excluded.in_stock,
  url = excluded.url,
  updated_at = now();

-- Seed a baseline forbidden-vocabulary list (sample)
insert into public.forbidden_terms (term, category, severity) values
  ('Baccarat Rouge 540', 'perfume', 5),
  ('Dior',               'brand',   5),
  ('Chanel',             'brand',   5),
  ('YSL',                'brand',   5),
  ('Lancôme',            'brand',   5),
  ('Creed',              'brand',   5),
  ('Kilian',             'brand',   5),
  ('Tom Ford',           'brand',   5),
  ('Hermès',             'brand',   5),
  ('Prada',              'brand',   5),
  ('Kayali',             'brand',   5),
  ('dupe',               'dupe-vocab', 5),
  ('imitation',          'dupe-vocab', 5),
  ('copy of',            'dupe-vocab', 5)
on conflict (term) do nothing;
