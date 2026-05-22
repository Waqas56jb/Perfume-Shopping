/* ─────────────────────────────────────────────────────────────────────────
 *  Eleganza Knowledge Base
 *  Structured data the server uses for: product hydration (id → object),
 *  pre-LLM inspiration routing, and post-LLM safety-net redaction.
 *
 *  ⚠  Editorial / conversational guidance lives in prompts/system.md.
 *     This file is for code-facing data only. Keep IDs in sync with the
 *     glossary in prompts/backend-appendix.md.
 * ───────────────────────────────────────────────────────────────────────── */

/* ─── CATALOG ───────────────────────────────────────────────────────────── */
export const PRODUCTS = [
  { id: 'rouge-240', name: 'ROUGE 240', tagline: "L'Éclat Royal — sillage solaire, ambré et sophistiqué", family: 'Ambré Floral Boisé',
    notes: { tete: ['Jasmin', 'Safran'], coeur: ['Ambre', 'Bois de cèdre'], fond: ['Résine de sapin', 'Musc'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée élégante', 'événement', 'signature'], vibe: 'luxueux, sensuel, mémorable',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/rs5-parfum-copie' },

  { id: 'bodyko', name: 'BODYKO', tagline: 'Oriental boisé masculin — encens sacré et bois sensuels', family: 'Oriental Boisé',
    notes: { tete: ['Eucalyptus', 'Encens'], coeur: ['Bois de cèdre', 'Camphre'], fond: ['Benjoin', 'Fève tonka'] },
    gender: 'H', season: ['Automne', 'Hiver'], intensity: 5, sillage: 4, longevity: 5,
    occasions: ['soirée élégante', 'saisons fraîches'], vibe: 'mystique, charismatique, profond',
    price: 24, inStock: false, url: 'https://eleganza-parfums.com/products/blanc-parfum-copie' },

  { id: 'bois-intense', name: 'BOIS INTENSE', tagline: 'Boisé épicé profond et mémorable', family: 'Boisé Épicé',
    notes: { tete: ['Bergamote', 'Poivre rose', 'Cardamome'], coeur: ['Cèdre', 'Vétiver', 'Résine'], fond: ['Ambre', 'Musc', 'Patchouli'] },
    gender: 'U', season: ['Automne', 'Hiver', 'Toutes saisons'], intensity: 5, sillage: 4, longevity: 5,
    occasions: ['quotidien', 'signature boisée'], vibe: 'profond, élégant, intemporel',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/bois-intense-parfum' },

  { id: 'creme-brulee', name: 'CRÈME BRÛLÉE', tagline: 'Onctueuse vanille caramélisée — confort dessert maison', family: 'Gourmand Vanillé',
    notes: { tete: ['Vanille', 'Caramel'], coeur: ['Lait chaud', 'Noix de coco'], fond: ['Musc blanc', 'Sucre', 'Bois doux'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['cocooning', 'soirée d\'hiver'], vibe: 'doux, réconfortant, addictif',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/accro-a-la-vanille-parfum' },

  { id: 'bella-vita', name: 'BELLA VITA', tagline: 'Gourmand floral irrésistible — la joie de vivre en flacon', family: 'Gourmand Floral',
    notes: { tete: ['Cassis', 'Poire'], coeur: ['Iris', 'Jasmin', "Fleur d'oranger"], fond: ['Praliné', 'Vanille', 'Patchouli', 'Fève de tonka'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 4, sillage: 5, longevity: 5,
    occasions: ['quotidien', 'rendez-vous', 'signature'], vibe: 'lumineux, addictif, féminin',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/imperatrice-parfum-copie' },

  { id: 'toxic-girl', name: 'TOXIC GIRL', tagline: 'Sucré et rebelle — féminité audacieuse et glamour', family: 'Oriental Floral Gourmand',
    notes: { tete: ['Orange amère', 'Citron'], coeur: ['Rose de Damas', "Fleur d'oranger"], fond: ['Fève tonka', 'Vanille', 'Bois de santal'] },
    gender: 'F', season: ['Automne', 'Hiver', 'Printemps'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['soirée', 'sortie entre amies'], vibe: 'séduisant, provocateur, glamour',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/amoramo-parfum-copie' },

  { id: 'liberty', name: 'LIBERTY', tagline: 'Floral lavande vanille — élégance moderne et affirmée', family: 'Floral Aromatique',
    notes: { tete: ['Lavande', 'Mandarine', 'Néroli'], coeur: ['Jasmin', "Fleur d'oranger"], fond: ['Vanille de Madagascar', 'Ambre gris', 'Cèdre'] },
    gender: 'F', season: ['Printemps', 'Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['travail', 'journée', 'soirée'], vibe: 'libre, ambitieuse, sophistiquée',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/fire-24-parfum-copie' },

  { id: 'so-elixir', name: 'SO ELIXIR', tagline: 'Boisé épicé puissant et magnétique', family: 'Boisé Épicé Aromatique',
    notes: { tete: ['Bergamote de Calabre', 'Poivre'], coeur: ['Lavande', 'Poivre du Sichuan', 'Géranium', 'Vétiver'], fond: ['Ambroxan', 'Cèdre', 'Ciste'] },
    gender: 'H', season: ['Automne', 'Hiver', 'Printemps'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'signature masculine'], vibe: 'puissant, charismatique, viril',
    price: 24, inStock: false, url: 'https://eleganza-parfums.com/products/dollars-parfum-copie' },

  { id: 'imaginaire', name: 'IMAGINAIRE', tagline: 'Vibrant et rafraîchissant — liberté et créativité', family: 'Aromatique Hespéridé Ambré',
    notes: { tete: ['Citron de Calabre', 'Bergamote', 'Orange'], coeur: ['Gingembre', 'Néroli', 'Cannelle'], fond: ['Ambroxan', 'Thé noir', 'Bois de Gaïac'] },
    gender: 'U', season: ['Printemps', 'Été'], intensity: 3, sillage: 4, longevity: 4,
    occasions: ['journée claire', 'travail', 'sérénité'], vibe: 'créatif, libre, raffiné',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/imaginaire-parfum' },

  { id: 'on-fire', name: 'ON FIRE', tagline: 'Explosion solaire fruitée et exotique', family: 'Oriental Fruité Boisé',
    notes: { tete: ['Mangue', 'Citron', 'Gingembre'], coeur: ['Résines', 'Jasmin', 'Safran'], fond: ['Oud doux', 'Vanille', 'Bois ambrés', 'Musc'] },
    gender: 'U', season: ['Printemps', 'Été', 'Automne'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée estivale', 'événement audacieux'], vibe: 'flamboyant, puissant, exotique',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/bois-d-iris-parfum-copie' },

  { id: 'pistachio', name: 'PISTACHIO', tagline: 'Gourmand lacté et envoûtant — pistache & vanille', family: 'Gourmand Oriental',
    notes: { tete: ['Pistache', 'Mandarine'], coeur: ["Fleurs d'oranger", 'Praliné'], fond: ['Vanille', 'Musc', 'Bois de santal'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['soirée gourmande', 'journée fraîche'], vibe: 'délicieux, élégant, chaleureux',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/pistachio-parfum' },

  { id: 'marshmallow', name: 'MARSHMALLOW', tagline: 'Douceur poudrée féminine — un nuage de sucre vanillé', family: 'Gourmand Sucré Poudré',
    notes: { tete: ['Sucre filé', "Fleur d'oranger"], coeur: ['Guimauve', 'Vanille lactée', 'Muguet'], fond: ['Musc blanc', 'Ambre doux', 'Bois tendres'] },
    gender: 'F', season: ['Automne', 'Hiver', 'Mi-saison'], intensity: 3, sillage: 4, longevity: 4,
    occasions: ['cocooning', 'soirée romantique'], vibe: 'doux, tendre, addictif',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/daisy-parfum-copie' },

  { id: 'extravagance', name: 'EXTRAVAGANCE', tagline: 'Floral ambré moderne — féminité multiple et lumineuse', family: 'Floral Ambré',
    notes: { tete: ['Poire', 'Mandarine', 'Bergamote'], coeur: ['Néroli', "Fleur d'oranger", 'Jasmin sambac'], fond: ['Vanille', 'Ambre', 'Musc blanc'] },
    gender: 'F', season: ['Toutes saisons'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['quotidien', 'rendez-vous', 'soirée'], vibe: 'moderne, libre, équilibré',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/liberty-parfum-copie' },

  { id: 'illicite', name: 'ILLICITE', tagline: 'Floral oriental clair-obscur — élégance mystérieuse', family: 'Floral Oriental Boisé',
    notes: { tete: ['Poire', 'Bergamote'], coeur: ["Fleur d'oranger", 'Jasmin sambac', 'Tubéreuse'], fond: ['Patchouli', 'Vétiver', 'Vanille noire'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée élégante', 'ambiance confidentielle'], vibe: 'envoûtant, audacieux, chic',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/yaara-parfum-copie' },

  { id: 'manif', name: 'MANIF', tagline: 'Oriental floral vanillé — déclaration de féminité', family: 'Oriental Floral Vanillé',
    notes: { tete: ['Cassis', 'Bergamote', 'Accord vert'], coeur: ['Jasmin Sambac', "Fleur d'oranger"], fond: ['Vanille', 'Fève tonka', 'Bois de santal', 'Cèdre'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée élégante', 'rendez-vous romantique', 'signature'], vibe: 'passionnée, affirmée, raffinée',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/aramis-parfum-copie' },

  { id: 'nuit-b', name: 'NUIT B', tagline: 'Floral musqué boisé — élégance sophistiquée du soir', family: 'Floral Musqué Boisé',
    notes: { tete: ['Pêche blanche', 'Aldéhydes'], coeur: ['Jasmin', 'Violette', 'Fleurs blanches'], fond: ['Musc', 'Bois de santal'] },
    gender: 'F', season: ['Automne', 'Hiver', 'Mi-saison'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['soirée élégante', 'dîner raffiné'], vibe: 'chic, discret, sensuel',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/blacko-parfum-copie' },

  { id: 'nani', name: 'NANI', tagline: 'Fruité floral gourmand — pomme d\'amour féérique', family: 'Floral Fruité Gourmand',
    notes: { tete: ['Citron de Calabre', 'Citron vert'], coeur: ['Pomme confite', 'Pivoine', 'Praliné'], fond: ['Bois de pommier', 'Musc blanc', 'Cèdre'] },
    gender: 'F', season: ['Printemps', 'Été'], intensity: 3, sillage: 4, longevity: 4,
    occasions: ['quotidien', 'moments légers'], vibe: 'pétillant, féérique, doux',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/angela-parfum-copie' },

  { id: 'merveilles', name: 'MERVEILLES', tagline: 'Boisé ambré minéral — élégance intemporelle', family: 'Boisé Ambré Minéral',
    notes: { tete: ['Orange amère', 'Poivre rose'], coeur: ['Notes boisées', 'Cèdre', 'Élémis'], fond: ['Ambre gris', 'Mousse', 'Vétiver'] },
    gender: 'U', season: ['Printemps', 'Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['journée lumineuse', 'signature intemporelle'], vibe: 'rare, poétique, sophistiqué',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/coconut-parfum-copie' },

  { id: 'coconut', name: 'COCONUT', tagline: 'Évasion solaire & sensuelle', family: 'Gourmand Vanillé Solaire',
    notes: { tete: ['Noix de coco fraîche', 'Lait chaud'], coeur: ['Vanille', 'Fleurs tropicales'], fond: ['Musc', 'Ambre doux', 'Sucre'] },
    gender: 'F', season: ['Printemps', 'Été'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['vacances', 'détente'], vibe: 'doux, solaire, addictif',
    price: 19, oldPrice: 30, inStock: false, url: 'https://eleganza-parfums.com/products/audace-parfum-copie' },

  { id: 'this-is-her', name: 'THIS IS HER', tagline: 'Oriental vanillé boisé — féminité rock et tendre', family: 'Oriental Vanillé Boisé',
    notes: { tete: ['Jasmin', 'Poivre rose', 'Fleur de soie'], coeur: ['Châtaigne', 'Crème de vanille', 'Bois de cachemire'], fond: ['Bois de santal', 'Musc', 'Ambroxan'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'signature charismatique'], vibe: 'audacieux, sensuel, rebelle',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/maestro-parfum-copie' },

  { id: 'flower', name: 'FLOWER', tagline: 'Floral poudré musqué — pureté féminine intemporelle', family: 'Floral Poudré Musqué',
    notes: { tete: ['Cassis', 'Aubépine', 'Mandarine'], coeur: ['Rose', 'Violette', 'Jasmin'], fond: ['Vanille', 'Musc blanc', 'Encens léger'] },
    gender: 'F', season: ['Printemps', 'Automne'], intensity: 3, sillage: 3, longevity: 4,
    occasions: ['journée calme', 'environnement doux'], vibe: 'tendre, pure, élégante',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/lady-parfum-copie' },

  { id: 'noirsx', name: 'NOIRSX', tagline: 'Oriental profond — féminité audacieuse et gourmande', family: 'Floral Fruité Gourmand',
    notes: { tete: ['Canneberge', 'Poivre rose', 'Tamaris'], coeur: ['Rose noire', 'Violette', 'Cacao'], fond: ['Vanille', 'Bois de Massoïa', 'Patchouli'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['soirée intense', 'rendez-vous sensuel'], vibe: 'rebelle, magnétique, addictif',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/irresistible-parfum-copie-copie' },

  { id: 'booster', name: 'BOOSTER', tagline: 'Frais sportif — énergie et vitalité', family: 'Aromatique Hespéridé',
    notes: { tete: ['Menthe', 'Orange', 'Eucalyptus'], coeur: ['Lavande', 'Basilic', 'Galbanum'], fond: ['Vétiver', 'Musc', 'Bois de santal'] },
    gender: 'H', season: ['Printemps', 'Été'], intensity: 3, sillage: 4, longevity: 4,
    occasions: ['quotidien', 'sport', 'journée active'], vibe: 'dynamique, énergique, frais',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/love-it-parfum-copie' },

  { id: 'victus', name: 'VICTUS', tagline: 'Aquatique boisé frais — esprit de victoire masculine', family: 'Aquatique Boisé Frais',
    notes: { tete: ['Accord marin', 'Pamplemousse', 'Feuille de laurier'], coeur: ['Ambre gris', 'Géranium', 'Épices douces'], fond: ['Bois de gaïac', 'Patchouli', 'Mousse de chêne'] },
    gender: 'H', season: ['Printemps', 'Été', 'Automne'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['quotidien', 'sport', 'journée active'], vibe: 'dynamique, ambitieux, frais',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/olympe-parfum-copie' },

  { id: 'ultra-viril', name: 'ULTRA VIRIL', tagline: 'Oriental fougère gourmand — séduction magnétique', family: 'Oriental Fougère Gourmand',
    notes: { tete: ['Poire', 'Bergamote', 'Menthe'], coeur: ['Lavande', 'Cannelle', 'Cumin'], fond: ['Vanille noire', 'Bois ambrés', 'Patchouli'] },
    gender: 'H', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'rendez-vous galant'], vibe: 'audacieux, sensuel, magnétique',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/acqua-parfum-copie' },

  { id: 'cody', name: 'CODY', tagline: 'Oriental gourmand — 28 Vanilla, vanille bourbon sensuelle', family: 'Oriental Gourmand',
    notes: { tete: ['Vanille bourbon', 'Orchidée'], coeur: ['Fève tonka', 'Jasmin'], fond: ['Ambre', 'Patchouli', 'Musc brun'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['soirée sensuelle', 'moments de tendresse'], vibe: 'enveloppant, addictif, féminin',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/cody-parfum-copie' },

  { id: 'stronger', name: 'STRONGER', tagline: 'Oriental fougère — charisme magnétique masculin', family: 'Oriental Fougère',
    notes: { tete: ['Poivre rose', 'Baies de genièvre', 'Violette'], coeur: ['Lavande', 'Cannelle', 'Sauge'], fond: ['Vanille', 'Fève tonka', 'Ambre', 'Bois ambré'] },
    gender: 'H', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'rendez-vous'], vibe: 'puissant, addictif, charismatique',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/men-intense-parfum-copie' },

  { id: 'first-class', name: 'FIRST CLASS', tagline: 'Élégant sophistiqué — la signature du gentleman moderne', family: 'Boisé Élégant',
    notes: { tete: ['Bergamote', 'Lavande', 'Citron'], coeur: ['Cèdre blanc', 'Pomme', 'Rose'], fond: ['Santal', 'Fève tonka', 'Mousse de chêne'] },
    gender: 'H', season: ['Printemps', 'Automne'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['quotidien', 'bureau', 'soirée'], vibe: 'élégant, raffiné, charismatique',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/aisha-parfum-copie' },

  { id: 'aisha', name: 'AISHA', tagline: 'Oriental floral en promotion — élégance accessible', family: 'Oriental Floral',
    notes: { tete: ['Bergamote', 'Mandarine'], coeur: ['Rose', 'Jasmin', "Fleur d'oranger"], fond: ['Vanille', 'Ambre', 'Musc'] },
    gender: 'U', season: ['Automne', 'Hiver', 'Printemps'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['quotidien', 'soirée'], vibe: 'élégant, accessible, sensuel',
    price: 19, oldPrice: 30, inStock: true, url: 'https://eleganza-parfums.com/products/robe-parfum-copie-copie' },

  { id: 'fabulous', name: 'FABULOUS', tagline: 'Boisé cuiré unisexe — provocateur et exclusif', family: 'Boisé Cuiré',
    notes: { tete: ['Sauge sclarée', 'Lavande'], coeur: ['Amande amère', 'Vanille', 'Cuir', 'Iris'], fond: ['Fève tonka', 'Cachemire', 'Ambre', 'Bois blanc'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirées spéciales', 'événement exclusif'], vibe: 'intense, provocateur, exclusif',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/fabulous' },

  { id: 'lazuli', name: 'LAZULI', tagline: 'Oriental épicé sophistiqué — voyage entre Orient et Occident', family: 'Oriental Épicé',
    notes: { tete: ['Bergamote', 'Cardamome', 'Maté'], coeur: ['Prune', 'Osmanthus', 'Jasmin'], fond: ['Tabac', 'Miel', 'Vanille', 'Bois de santal'] },
    gender: 'U', season: ['Toutes saisons'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['travail', 'soirée d\'exception'], vibe: 'rare, sophistiqué, expressif',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/lazuli-parfum' },

  { id: 'hayati', name: 'HAYATI', tagline: 'Fruité gourmand musqué — baies rouges et vanille crémeuse', family: 'Fruité Gourmand Musqué',
    notes: { tete: ['Framboise', 'Baies rouges'], coeur: ['Vanille', 'Sucre'], fond: ['Musc', 'Notes lactées'] },
    gender: 'U', season: ['Printemps', 'Été'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['quotidien', 'rendez-vous romantique'], vibe: 'joyeux, doux, sensuel',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/hayati-parfum' },

  { id: 'velvet-oud', name: 'VELVET OUD', tagline: 'Oriental boisé — l\'élégance du désert oriental', family: 'Oriental Boisé',
    notes: { tete: ['Ambre', 'Épices chaudes'], coeur: ['Oud noble', 'Bois précieux'], fond: ['Musc chaud', 'Résines'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'événement', 'signature intemporelle'], vibe: 'profond, sensuel, intemporel',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/velvet-oud-parfum' },

  { id: 'moonlight', name: 'MOONLIGHT', tagline: 'Fruité tropical — voyage exotique et lumineux', family: 'Fruité Tropical Floral',
    notes: { tete: ['Mangue', 'Pamplemousse'], coeur: ['Riz lacté', 'Noix de coco'], fond: ['Musc blanc', 'Bois tendres'] },
    gender: 'U', season: ['Printemps', 'Été'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['été', 'vacances', 'journées ensoleillées'], vibe: 'exotique, frais, gourmand',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/moonlight-parfum' },

  { id: 'ambre', name: 'AMBRE', tagline: 'Ambré floral mixte — sensualité et mystère', family: 'Ambré Floral',
    notes: { tete: ['Bergamote', 'Poivre rose'], coeur: ['Rose turque', 'Encens'], fond: ['Ambre gris', 'Bois sombres', 'Musc'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['journées fraîches', 'soirées habillées'], vibe: 'élégant, mystérieux, raffiné',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/ambre-parfum' },

  { id: 'musk-tahara', name: 'MUSK TAHARA INTIME', tagline: 'Musc blanc doux — pureté et féminité orientale', family: 'Musc Blanc Oriental',
    notes: { tete: ['Musc blanc', "Fleur d'oranger"], coeur: ['Notes poudrées', 'Vanille douce'], fond: ['Musc tendre', 'Bois blanc'] },
    gender: 'F', season: ['Toutes saisons'], intensity: 3, sillage: 3, longevity: 4,
    occasions: ['après-douche', 'quotidien intime'], vibe: 'doux, propre, féminin',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/blogs/infos/musk-tahara-intime-parfum-feminin-au-musc-blanc-doux' },

  { id: 'nomade', name: 'NOMADE', tagline: 'Boisé fruité hypnotique — voyage olfactif unique', family: 'Boisé Fruité Ambré',
    notes: { tete: ['Benjoin', 'Bouleau', 'Géranium'], coeur: ['Framboise', 'Safran', 'Amberwood'], fond: ['Patchouli', 'Bois de oud', 'Ambre'] },
    gender: 'U', season: ['Toutes saisons'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['signature', 'soirée mémorable'], vibe: 'hypnotique, addictif, unique',
    price: 24, inStock: true, url: 'https://eleganza-parfums.com/products/nomade-parfum' },
];

/* ─── HIDDEN MAPPING ────────────────────────────────────────────────────────
 *  Customer mentions a famous fragrance → silently route to the Eleganza match.
 *  Sourced from the table in prompts/system.md.
 * ───────────────────────────────────────────────────────────────────────── */
export const DUPE_MAP = [
  { triggers: ['baccarat rouge 540', 'baccarat rouge', 'baccarat 540', 'br540', 'br 540', 'rouge 540'], productId: 'rouge-240' },
  { triggers: ['sauvage elixir', 'dior sauvage', 'sauvage dior', 'sauvage'], productId: 'so-elixir' },
  { triggers: ['body kouros', 'kouros ysl', 'ysl kouros', 'bodykouros'], productId: 'bodyko' },
  { triggers: ['la vie est belle', 'la vie est belle intensément', 'la vie est belle eclat', 'lancome la vie', 'lancôme la vie'], productId: 'bella-vita' },
  { triggers: ['poison girl', 'poison dior', 'dior poison'], productId: 'toxic-girl' },
  { triggers: ['libre', 'libre ysl', 'ysl libre'], productId: 'liberty' },
  { triggers: ["l'interdit", 'linterdit', 'interdit givenchy', 'givenchy interdit'], productId: 'illicite' },
  { triggers: ['manifesto', 'manifesto ysl', 'ysl manifesto'], productId: 'manif' },
  { triggers: ['paradoxe', 'prada paradoxe'], productId: 'extravagance' },
  { triggers: ['god of fire', 'shl 777', 'shl777', 'god fire'], productId: 'on-fire' },
  { triggers: ['gelato pistachio', 'pistache kilian'], productId: 'pistachio' },
  { triggers: ['yum boujee marshmallow', 'kayali marshmallow', 'kayali boujee'], productId: 'marshmallow' },
  { triggers: ['vanilla 28', 'kayali vanilla', '28 vanilla kayali'], productId: 'cody' },
  { triggers: ['moonlight in heaven', 'kilian moonlight', 'kilian heaven'], productId: 'moonlight' },
  { triggers: ['ambre nuit', 'dior ambre nuit', 'ambre nuit dior'], productId: 'ambre' },
  { triggers: ['hayati attar', 'attar collection hayati', 'attar hayati'], productId: 'hayati' },
  { triggers: ['velvet desert oud', 'desert oud', 'velvet oud bdk'], productId: 'velvet-oud' },
  { triggers: ['angel mugler', 'mugler angel', 'angel parfum'], productId: 'creme-brulee' },
  { triggers: ['black opium', 'opium ysl', 'ysl black opium'], productId: 'illicite' },
  { triggers: ['chanel no 5', 'chanel n°5', 'chanel n5', 'no 5 chanel'], productId: 'extravagance' },
  { triggers: ['miss dior', 'dior miss'], productId: 'flower' },
  { triggers: ['ombre nomade', 'louis vuitton ombre', 'lv ombre nomade'], productId: 'nomade' },
];

/* ─── FORBIDDEN VOCABULARY ─────────────────────────────────────────────────
 *  Server-side safety net. Updated to match the brand/perfume mentions
 *  from the user's prompt. Any of these appearing in the model output is
 *  redacted to "cette inspiration olfactive".
 * ───────────────────────────────────────────────────────────────────────── */
export const FORBIDDEN_TERMS = [
  // Brand names
  'dior', 'chanel', 'yves saint laurent', 'ysl', 'lancome', 'lancôme',
  'creed', 'kilian', 'by kilian', 'tom ford', 'jean paul gaultier', 'jpg', 'gaultier',
  'guerlain', 'kayali', 'nishane', 'givenchy', 'rabanne', 'paco rabanne',
  'giorgio armani', 'armani', 'lacoste', 'mugler', 'thierry mugler',
  'cacharel', 'mancera', 'mfk', 'maison francis kurkdjian',
  'louis vuitton', 'lv parfum', "victoria's secret", 'victoria secret',
  'zadig & voltaire', 'zadig voltaire', 'kenzo', 'azzaro', 'montblanc',
  'narciso rodriguez', 'narciso', 'dolce & gabbana', 'dolce gabbana', 'd&g',
  'hermès', 'hermes', 'prada', 'attar collection', 'hugo boss', 'nina ricci',
  'bdk', 'shl 777', 'shl777',
  // Famous fragrance names
  'baccarat rouge 540', 'baccarat rouge', 'br540', 'br 540',
  'sauvage elixir', 'sauvage', 'bleu de chanel', 'chanel no 5', 'chanel n°5', 'n°5',
  'la vie est belle', 'black opium', 'libre ysl', 'manifesto ysl', 'body kouros',
  'kouros', 'poison girl', 'hypnotic poison', "j'adore", 'jadore', 'miss dior',
  'ambre nuit', 'gris dior', 'hot couture', "l'interdit", 'linterdit',
  'vanilla 28', 'yum boujee marshmallow', '1 million', 'phantom rabanne', 'invictus',
  'black xs', 'coco mademoiselle', "la nuit de l'homme", "l'homme idéal",
  'ultra male', 'le male', 'aventus', 'virgin island water', 'royal oud',
  'moonlight in heaven', 'good girl', 'bad boy', "i'm good", 'this is her zadig',
  'flower by kenzo', 'wanted azzaro', 'si passione', 'si armani',
  "l'impératrice", 'light blue', 'the one', 'boss nuit', 'boss bottled',
  'ombre nomade', 'coconut passion', 'insolence', 'l.12.12', 'ganymede',
  'soleil blanc', 'cuir béluga', 'noir tease', 'angel mugler', 'alien mugler',
  'amor amor', 'coco vanille', 'petit matin', 'oud satin mood',
  'velvet desert oud', 'eau des merveilles', "terre d'hermès", "voyage d'hermès",
  'acqua di gioia', 'prada paradoxe', 'prada candy', 'legend montblanc',
  'khamrah', 'kryptonite', 'gelato pistachio', 'angel parfum',
  // Dupe vocabulary
  'dupe of', 'dupe de', 'copy of', 'copie de', 'imitation de', 'imitation of',
  'similar to', 'comme le', 'comme la', 'version de', 'inspiré de',
  'inspired by', "c'est le dupe", "c'est un dupe", "alternative à",
];

/* ─── HELPERS ──────────────────────────────────────────────────────────── */
export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

export function listProductIds() {
  return PRODUCTS.map((p) => p.id);
}

export function findForbiddenTerm(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const term of FORBIDDEN_TERMS) {
    if (lower.includes(term.toLowerCase())) return term;
  }
  return null;
}

/* Redact any forbidden terms from the model's output as a safety net.
   Sorted by length DESC so longer matches take priority (e.g. "Black Opium"
   is redacted before "Black"). Replaces with a neutral phrase. */
const SORTED_FORBIDDEN = [...FORBIDDEN_TERMS].sort((a, b) => b.length - a.length);
export function redactForbidden(text) {
  if (!text) return { text, redacted: [] };
  let out = text;
  const redacted = [];
  for (const term of SORTED_FORBIDDEN) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match as a token surrounded by non-letters (handles diacritics + apostrophes loosely).
    const re = new RegExp(`(?<![A-Za-zÀ-ÿ])${escaped}(?![A-Za-zÀ-ÿ])`, 'gi');
    if (re.test(out)) {
      redacted.push(term);
      out = out.replace(re, 'cette inspiration olfactive');
    }
  }
  return { text: out, redacted };
}

/* Pre-LLM router: which Eleganza product is the customer implicitly asking about? */
export function detectMappedProduct(userText) {
  if (!userText) return null;
  const lower = userText.toLowerCase();
  for (const entry of DUPE_MAP) {
    for (const trigger of entry.triggers) {
      if (lower.includes(trigger.toLowerCase())) return entry.productId;
    }
  }
  return null;
}

/* Build a compact "available IDs" list for the prompt (in-stock only). */
export function inStockIds() {
  return PRODUCTS.filter((p) => p.inStock).map((p) => p.id);
}
