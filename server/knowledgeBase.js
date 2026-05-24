/* ─────────────────────────────────────────────────────────────────────────
 *  Eleganza Knowledge Base
 *  Structured data the server uses for: product hydration (id → object),
 *  pre-LLM inspiration routing, and post-LLM safety-net redaction.
 *
 *  ⚠  Editorial / conversational guidance lives in prompts/system.md.
 *     This file is for code-facing data only. Keep IDs in sync with the
 *     glossary in prompts/backend-appendix.md and with the DB seed at
 *     server/db/migration-005-extended-catalog.sql.
 *
 *  Pricing source of truth (May 2026 spec):
 *    • unit price       19,90 €
 *    • pack 3+1 offert  59,70 €
 *    • currency         EUR
 * ───────────────────────────────────────────────────────────────────────── */

const UNIT_PRICE = 19.90;
const PROMO_OLD_PRICE = 30.00;
const SHOP = 'https://eleganza-parfums.com';

/** Convenience builder so every catalog row stays consistent.            */
function p({ id, name, tagline, family, gender = 'U', notes, season, intensity = 4, sillage = 4, longevity = 4, occasions, vibe, url, inStock = true, promo = false }) {
  return {
    id, name, tagline, family,
    notes: notes || { tete: [], coeur: [], fond: [] },
    gender, season: season || [], intensity, sillage, longevity,
    occasions: occasions || [], vibe: vibe || '',
    price: UNIT_PRICE,
    oldPrice: promo ? PROMO_OLD_PRICE : undefined,
    currency: 'EUR',
    inStock, url,
  };
}

/* ─── CATALOG ───────────────────────────────────────────────────────────── */
export const PRODUCTS = [
  /* ── Existing best-sellers (kept verbatim, repriced to 19.90 €) ───── */
  p({ id: 'rouge-240', name: 'ROUGE 240', tagline: "L'Éclat Royal — sillage solaire, ambré et sophistiqué", family: 'Ambré Floral Boisé',
    notes: { tete: ['Jasmin', 'Safran'], coeur: ['Ambre', 'Bois de cèdre'], fond: ['Résine de sapin', 'Musc'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée élégante', 'événement', 'signature'], vibe: 'luxueux, sensuel, mémorable',
    url: `${SHOP}/products/rs5-parfum-copie` }),

  p({ id: 'bodyko', name: 'BODYKO', tagline: 'Oriental boisé masculin — encens sacré et bois sensuels', family: 'Oriental Boisé',
    notes: { tete: ['Eucalyptus', 'Encens'], coeur: ['Bois de cèdre', 'Camphre'], fond: ['Benjoin', 'Fève tonka'] },
    gender: 'H', season: ['Automne', 'Hiver'], intensity: 5, sillage: 4, longevity: 5,
    occasions: ['soirée élégante', 'saisons fraîches'], vibe: 'mystique, charismatique, profond',
    inStock: false, url: `${SHOP}/products/blanc-parfum-copie` }),

  p({ id: 'bois-intense', name: 'BOIS INTENSE', tagline: 'Boisé épicé profond et mémorable', family: 'Boisé Épicé',
    notes: { tete: ['Bergamote', 'Poivre rose', 'Cardamome'], coeur: ['Cèdre', 'Vétiver', 'Résine'], fond: ['Ambre', 'Musc', 'Patchouli'] },
    gender: 'U', season: ['Automne', 'Hiver', 'Toutes saisons'], intensity: 5, sillage: 4, longevity: 5,
    occasions: ['quotidien', 'signature boisée'], vibe: 'profond, élégant, intemporel',
    url: `${SHOP}/products/bois-intense-parfum` }),

  p({ id: 'creme-brulee', name: 'CRÈME BRÛLÉE', tagline: 'Onctueuse vanille caramélisée — confort dessert maison', family: 'Gourmand Vanillé',
    notes: { tete: ['Vanille', 'Caramel'], coeur: ['Lait chaud', 'Noix de coco'], fond: ['Musc blanc', 'Sucre', 'Bois doux'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['cocooning', "soirée d'hiver"], vibe: 'doux, réconfortant, addictif',
    url: `${SHOP}/products/accro-a-la-vanille-parfum` }),

  p({ id: 'bella-vita', name: 'BELLA VITA', tagline: 'Gourmand floral irrésistible — la joie de vivre en flacon', family: 'Gourmand Floral',
    notes: { tete: ['Cassis', 'Poire'], coeur: ['Iris', 'Jasmin', "Fleur d'oranger"], fond: ['Praliné', 'Vanille', 'Patchouli', 'Fève de tonka'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 4, sillage: 5, longevity: 5,
    occasions: ['quotidien', 'rendez-vous', 'signature'], vibe: 'lumineux, addictif, féminin',
    url: `${SHOP}/products/imperatrice-parfum-copie` }),

  p({ id: 'toxic-girl', name: 'TOXIC GIRL', tagline: 'Sucré et rebelle — féminité audacieuse et glamour', family: 'Oriental Floral Gourmand',
    notes: { tete: ['Orange amère', 'Citron'], coeur: ['Rose de Damas', "Fleur d'oranger"], fond: ['Fève tonka', 'Vanille', 'Bois de santal'] },
    gender: 'F', season: ['Automne', 'Hiver', 'Printemps'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['soirée', 'sortie entre amies'], vibe: 'séduisant, provocateur, glamour',
    url: `${SHOP}/products/amoramo-parfum-copie` }),

  p({ id: 'liberty', name: 'LIBERTY', tagline: 'Floral lavande vanille — élégance moderne et affirmée', family: 'Floral Aromatique',
    notes: { tete: ['Lavande', 'Mandarine', 'Néroli'], coeur: ['Jasmin', "Fleur d'oranger"], fond: ['Vanille de Madagascar', 'Ambre gris', 'Cèdre'] },
    gender: 'F', season: ['Printemps', 'Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['travail', 'journée', 'soirée'], vibe: 'libre, ambitieuse, sophistiquée',
    url: `${SHOP}/products/fire-24-parfum-copie` }),

  p({ id: 'so-elixir', name: 'SO ELIXIR', tagline: 'Boisé épicé puissant et magnétique', family: 'Boisé Épicé Aromatique',
    notes: { tete: ['Bergamote de Calabre', 'Poivre'], coeur: ['Lavande', 'Poivre du Sichuan', 'Géranium', 'Vétiver'], fond: ['Ambroxan', 'Cèdre', 'Ciste'] },
    gender: 'H', season: ['Automne', 'Hiver', 'Printemps'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'signature masculine'], vibe: 'puissant, charismatique, viril',
    inStock: false, url: `${SHOP}/products/dollars-parfum-copie` }),

  p({ id: 'imaginaire', name: 'IMAGINAIRE', tagline: 'Vibrant et rafraîchissant — liberté et créativité', family: 'Aromatique Hespéridé Ambré',
    notes: { tete: ['Citron de Calabre', 'Bergamote', 'Orange'], coeur: ['Gingembre', 'Néroli', 'Cannelle'], fond: ['Ambroxan', 'Thé noir', 'Bois de Gaïac'] },
    gender: 'U', season: ['Printemps', 'Été'], intensity: 3, sillage: 4, longevity: 4,
    occasions: ['journée claire', 'travail', 'sérénité'], vibe: 'créatif, libre, raffiné',
    url: `${SHOP}/products/imaginaire-parfum` }),

  p({ id: 'on-fire', name: 'ON FIRE', tagline: 'Explosion solaire fruitée et exotique', family: 'Oriental Fruité Boisé',
    notes: { tete: ['Mangue', 'Citron', 'Gingembre'], coeur: ['Résines', 'Jasmin', 'Safran'], fond: ['Oud doux', 'Vanille', 'Bois ambrés', 'Musc'] },
    gender: 'U', season: ['Printemps', 'Été', 'Automne'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée estivale', 'événement audacieux'], vibe: 'flamboyant, puissant, exotique',
    url: `${SHOP}/products/bois-d-iris-parfum-copie` }),

  p({ id: 'pistachio', name: 'PISTACHIO', tagline: 'Gourmand lacté et envoûtant — pistache & vanille', family: 'Gourmand Oriental',
    notes: { tete: ['Pistache', 'Mandarine'], coeur: ["Fleurs d'oranger", 'Praliné'], fond: ['Vanille', 'Musc', 'Bois de santal'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['soirée gourmande', 'journée fraîche'], vibe: 'délicieux, élégant, chaleureux',
    url: `${SHOP}/products/pistachio-parfum` }),

  p({ id: 'marshmallow', name: 'MARSHMALLOW', tagline: 'Douceur poudrée féminine — un nuage de sucre vanillé', family: 'Gourmand Sucré Poudré',
    notes: { tete: ['Sucre filé', "Fleur d'oranger"], coeur: ['Guimauve', 'Vanille lactée', 'Muguet'], fond: ['Musc blanc', 'Ambre doux', 'Bois tendres'] },
    gender: 'F', season: ['Automne', 'Hiver', 'Mi-saison'], intensity: 3, sillage: 4, longevity: 4,
    occasions: ['cocooning', 'soirée romantique'], vibe: 'doux, tendre, addictif',
    url: `${SHOP}/products/daisy-parfum-copie` }),

  p({ id: 'extravagance', name: 'EXTRAVAGANCE', tagline: 'Floral ambré moderne — féminité multiple et lumineuse', family: 'Floral Ambré',
    notes: { tete: ['Poire', 'Mandarine', 'Bergamote'], coeur: ['Néroli', "Fleur d'oranger", 'Jasmin sambac'], fond: ['Vanille', 'Ambre', 'Musc blanc'] },
    gender: 'F', season: ['Toutes saisons'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['quotidien', 'rendez-vous', 'soirée'], vibe: 'moderne, libre, équilibré',
    url: `${SHOP}/products/liberty-parfum-copie` }),

  p({ id: 'illicite', name: 'ILLICITE', tagline: 'Floral oriental clair-obscur — élégance mystérieuse', family: 'Floral Oriental Boisé',
    notes: { tete: ['Poire', 'Bergamote'], coeur: ["Fleur d'oranger", 'Jasmin sambac', 'Tubéreuse'], fond: ['Patchouli', 'Vétiver', 'Vanille noire'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée élégante', 'ambiance confidentielle'], vibe: 'envoûtant, audacieux, chic',
    url: `${SHOP}/products/yaara-parfum-copie` }),

  p({ id: 'manif', name: 'MANIF', tagline: 'Oriental floral vanillé — déclaration de féminité', family: 'Oriental Floral Vanillé',
    notes: { tete: ['Cassis', 'Bergamote', 'Accord vert'], coeur: ['Jasmin Sambac', "Fleur d'oranger"], fond: ['Vanille', 'Fève tonka', 'Bois de santal', 'Cèdre'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée élégante', 'rendez-vous romantique', 'signature'], vibe: 'passionnée, affirmée, raffinée',
    url: `${SHOP}/products/aramis-parfum-copie` }),

  p({ id: 'nuit-b', name: 'NUIT B', tagline: 'Floral musqué boisé — élégance sophistiquée du soir', family: 'Floral Musqué Boisé',
    notes: { tete: ['Pêche blanche', 'Aldéhydes'], coeur: ['Jasmin', 'Violette', 'Fleurs blanches'], fond: ['Musc', 'Bois de santal'] },
    gender: 'F', season: ['Automne', 'Hiver', 'Mi-saison'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['soirée élégante', 'dîner raffiné'], vibe: 'chic, discret, sensuel',
    url: `${SHOP}/products/blacko-parfum-copie` }),

  p({ id: 'nani', name: 'NANI', tagline: "Fruité floral gourmand — pomme d'amour féérique", family: 'Floral Fruité Gourmand',
    notes: { tete: ['Citron de Calabre', 'Citron vert'], coeur: ['Pomme confite', 'Pivoine', 'Praliné'], fond: ['Bois de pommier', 'Musc blanc', 'Cèdre'] },
    gender: 'F', season: ['Printemps', 'Été'], intensity: 3, sillage: 4, longevity: 4,
    occasions: ['quotidien', 'moments légers'], vibe: 'pétillant, féérique, doux',
    url: `${SHOP}/products/angela-parfum-copie` }),

  p({ id: 'merveilles', name: 'MERVEILLES', tagline: 'Boisé ambré minéral — élégance intemporelle', family: 'Boisé Ambré Minéral',
    notes: { tete: ['Orange amère', 'Poivre rose'], coeur: ['Notes boisées', 'Cèdre', 'Élémis'], fond: ['Ambre gris', 'Mousse', 'Vétiver'] },
    gender: 'U', season: ['Printemps', 'Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['journée lumineuse', 'signature intemporelle'], vibe: 'rare, poétique, sophistiqué',
    url: `${SHOP}/products/coconut-parfum-copie` }),

  p({ id: 'coconut', name: 'COCONUT', tagline: 'Évasion solaire & sensuelle', family: 'Gourmand Vanillé Solaire',
    notes: { tete: ['Noix de coco fraîche', 'Lait chaud'], coeur: ['Vanille', 'Fleurs tropicales'], fond: ['Musc', 'Ambre doux', 'Sucre'] },
    gender: 'F', season: ['Printemps', 'Été'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['vacances', 'détente'], vibe: 'doux, solaire, addictif',
    inStock: false, url: `${SHOP}/products/audace-parfum-copie` }),

  p({ id: 'this-is-her', name: 'THIS IS HER', tagline: 'Oriental vanillé boisé — féminité rock et tendre', family: 'Oriental Vanillé Boisé',
    notes: { tete: ['Jasmin', 'Poivre rose', 'Fleur de soie'], coeur: ['Châtaigne', 'Crème de vanille', 'Bois de cachemire'], fond: ['Bois de santal', 'Musc', 'Ambroxan'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'signature charismatique'], vibe: 'audacieux, sensuel, rebelle',
    url: `${SHOP}/products/maestro-parfum-copie` }),

  p({ id: 'flower', name: 'FLOWER', tagline: 'Floral poudré musqué — pureté féminine intemporelle', family: 'Floral Poudré Musqué',
    notes: { tete: ['Cassis', 'Aubépine', 'Mandarine'], coeur: ['Rose', 'Violette', 'Jasmin'], fond: ['Vanille', 'Musc blanc', 'Encens léger'] },
    gender: 'F', season: ['Printemps', 'Automne'], intensity: 3, sillage: 3, longevity: 4,
    occasions: ['journée calme', 'environnement doux'], vibe: 'tendre, pure, élégante',
    url: `${SHOP}/products/lady-parfum-copie` }),

  p({ id: 'noirsx', name: 'NOIRSX', tagline: 'Oriental profond — féminité audacieuse et gourmande', family: 'Floral Fruité Gourmand',
    notes: { tete: ['Canneberge', 'Poivre rose', 'Tamaris'], coeur: ['Rose noire', 'Violette', 'Cacao'], fond: ['Vanille', 'Bois de Massoïa', 'Patchouli'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['soirée intense', 'rendez-vous sensuel'], vibe: 'rebelle, magnétique, addictif',
    url: `${SHOP}/products/irresistible-parfum-copie-copie` }),

  p({ id: 'booster', name: 'BOOSTER', tagline: 'Frais sportif — énergie et vitalité', family: 'Aromatique Hespéridé',
    notes: { tete: ['Menthe', 'Orange', 'Eucalyptus'], coeur: ['Lavande', 'Basilic', 'Galbanum'], fond: ['Vétiver', 'Musc', 'Bois de santal'] },
    gender: 'H', season: ['Printemps', 'Été'], intensity: 3, sillage: 4, longevity: 4,
    occasions: ['quotidien', 'sport', 'journée active'], vibe: 'dynamique, énergique, frais',
    url: `${SHOP}/products/love-it-parfum-copie` }),

  p({ id: 'victus', name: 'VICTUS', tagline: 'Aquatique boisé frais — esprit de victoire masculine', family: 'Aquatique Boisé Frais',
    notes: { tete: ['Accord marin', 'Pamplemousse', 'Feuille de laurier'], coeur: ['Ambre gris', 'Géranium', 'Épices douces'], fond: ['Bois de gaïac', 'Patchouli', 'Mousse de chêne'] },
    gender: 'H', season: ['Printemps', 'Été', 'Automne'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['quotidien', 'sport', 'journée active'], vibe: 'dynamique, ambitieux, frais',
    url: `${SHOP}/products/olympe-parfum-copie` }),

  p({ id: 'ultra-viril', name: 'ULTRA VIRIL', tagline: 'Oriental fougère gourmand — séduction magnétique', family: 'Oriental Fougère Gourmand',
    notes: { tete: ['Poire', 'Bergamote', 'Menthe'], coeur: ['Lavande', 'Cannelle', 'Cumin'], fond: ['Vanille noire', 'Bois ambrés', 'Patchouli'] },
    gender: 'H', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'rendez-vous galant'], vibe: 'audacieux, sensuel, magnétique',
    url: `${SHOP}/products/acqua-parfum-copie` }),

  p({ id: 'cody', name: 'CODY', tagline: 'Oriental gourmand — 28 Vanilla, vanille bourbon sensuelle', family: 'Oriental Gourmand',
    notes: { tete: ['Vanille bourbon', 'Orchidée'], coeur: ['Fève tonka', 'Jasmin'], fond: ['Ambre', 'Patchouli', 'Musc brun'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['soirée sensuelle', 'moments de tendresse'], vibe: 'enveloppant, addictif, féminin',
    url: `${SHOP}/products/cody-parfum-copie` }),

  p({ id: 'stronger', name: 'STRONGER', tagline: 'Oriental fougère — charisme magnétique masculin', family: 'Oriental Fougère',
    notes: { tete: ['Poivre rose', 'Baies de genièvre', 'Violette'], coeur: ['Lavande', 'Cannelle', 'Sauge'], fond: ['Vanille', 'Fève tonka', 'Ambre', 'Bois ambré'] },
    gender: 'H', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'rendez-vous'], vibe: 'puissant, addictif, charismatique',
    url: `${SHOP}/products/men-intense-parfum-copie` }),

  p({ id: 'first-class', name: 'FIRST CLASS', tagline: 'Élégant sophistiqué — la signature du gentleman moderne', family: 'Boisé Élégant',
    notes: { tete: ['Bergamote', 'Lavande', 'Citron'], coeur: ['Cèdre blanc', 'Pomme', 'Rose'], fond: ['Santal', 'Fève tonka', 'Mousse de chêne'] },
    gender: 'H', season: ['Printemps', 'Automne'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['quotidien', 'bureau', 'soirée'], vibe: 'élégant, raffiné, charismatique',
    url: `${SHOP}/products/aisha-parfum-copie` }),

  p({ id: 'aisha', name: 'AISHA', tagline: 'Oriental floral en promotion — élégance accessible', family: 'Oriental Floral',
    notes: { tete: ['Bergamote', 'Mandarine'], coeur: ['Rose', 'Jasmin', "Fleur d'oranger"], fond: ['Vanille', 'Ambre', 'Musc'] },
    gender: 'U', season: ['Automne', 'Hiver', 'Printemps'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['quotidien', 'soirée'], vibe: 'élégant, accessible, sensuel',
    promo: true, url: `${SHOP}/products/robe-parfum-copie-copie` }),

  p({ id: 'fabulous', name: 'FABULOUS', tagline: 'Boisé cuiré unisexe — provocateur et exclusif', family: 'Boisé Cuiré',
    notes: { tete: ['Sauge sclarée', 'Lavande'], coeur: ['Amande amère', 'Vanille', 'Cuir', 'Iris'], fond: ['Fève tonka', 'Cachemire', 'Ambre', 'Bois blanc'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirées spéciales', 'événement exclusif'], vibe: 'intense, provocateur, exclusif',
    url: `${SHOP}/products/fabulous` }),

  p({ id: 'lazuli', name: 'LAZULI', tagline: 'Oriental épicé sophistiqué — voyage entre Orient et Occident', family: 'Oriental Épicé',
    notes: { tete: ['Bergamote', 'Cardamome', 'Maté'], coeur: ['Prune', 'Osmanthus', 'Jasmin'], fond: ['Tabac', 'Miel', 'Vanille', 'Bois de santal'] },
    gender: 'U', season: ['Toutes saisons'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['travail', "soirée d'exception"], vibe: 'rare, sophistiqué, expressif',
    url: `${SHOP}/products/lazuli-parfum` }),

  p({ id: 'hayati', name: 'HAYATI', tagline: 'Fruité gourmand musqué — baies rouges et vanille crémeuse', family: 'Fruité Gourmand Musqué',
    notes: { tete: ['Framboise', 'Baies rouges'], coeur: ['Vanille', 'Sucre'], fond: ['Musc', 'Notes lactées'] },
    gender: 'U', season: ['Printemps', 'Été'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['quotidien', 'rendez-vous romantique'], vibe: 'joyeux, doux, sensuel',
    url: `${SHOP}/products/hayati-parfum` }),

  p({ id: 'velvet-oud', name: 'VELVET OUD', tagline: "Oriental boisé — l'élégance du désert oriental", family: 'Oriental Boisé',
    notes: { tete: ['Ambre', 'Épices chaudes'], coeur: ['Oud noble', 'Bois précieux'], fond: ['Musc chaud', 'Résines'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'événement', 'signature intemporelle'], vibe: 'profond, sensuel, intemporel',
    url: `${SHOP}/products/velvet-oud-parfum` }),

  p({ id: 'moonlight', name: 'MOONLIGHT', tagline: 'Fruité tropical — voyage exotique et lumineux', family: 'Fruité Tropical Floral',
    notes: { tete: ['Mangue', 'Pamplemousse'], coeur: ['Riz lacté', 'Noix de coco'], fond: ['Musc blanc', 'Bois tendres'] },
    gender: 'U', season: ['Printemps', 'Été'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['été', 'vacances', 'journées ensoleillées'], vibe: 'exotique, frais, gourmand',
    url: `${SHOP}/products/moonlight-parfum` }),

  p({ id: 'ambre', name: 'AMBRE', tagline: 'Ambré floral mixte — sensualité et mystère', family: 'Ambré Floral',
    notes: { tete: ['Bergamote', 'Poivre rose'], coeur: ['Rose turque', 'Encens'], fond: ['Ambre gris', 'Bois sombres', 'Musc'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['journées fraîches', 'soirées habillées'], vibe: 'élégant, mystérieux, raffiné',
    url: `${SHOP}/products/ambre-parfum` }),

  p({ id: 'musk-tahara', name: 'MUSK TAHARA INTIME', tagline: 'Musc blanc doux — pureté et féminité orientale', family: 'Musc Blanc Oriental',
    notes: { tete: ['Musc blanc', "Fleur d'oranger"], coeur: ['Notes poudrées', 'Vanille douce'], fond: ['Musc tendre', 'Bois blanc'] },
    gender: 'F', season: ['Toutes saisons'], intensity: 3, sillage: 3, longevity: 4,
    occasions: ['après-douche', 'quotidien intime'], vibe: 'doux, propre, féminin',
    url: `${SHOP}/blogs/infos/musk-tahara-intime-parfum-feminin-au-musc-blanc-doux` }),

  p({ id: 'nomade', name: 'NOMADE', tagline: 'Boisé fruité hypnotique — voyage olfactif unique', family: 'Boisé Fruité Ambré',
    notes: { tete: ['Benjoin', 'Bouleau', 'Géranium'], coeur: ['Framboise', 'Safran', 'Amberwood'], fond: ['Patchouli', 'Bois de oud', 'Ambre'] },
    gender: 'U', season: ['Toutes saisons'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['signature', 'soirée mémorable'], vibe: 'hypnotique, addictif, unique',
    url: `${SHOP}/products/nomade-parfum` }),

  /* ── CLASSIC HOMME — new stubs (urls point at collection until admin uploads photos) */
  p({ id: 'bleu', name: 'BLEU', tagline: 'Boisé aromatique sophistiqué — élégance citadine intemporelle', family: 'Boisé Aromatique',
    notes: { tete: ['Pamplemousse', 'Citron', 'Menthe'], coeur: ['Gingembre', 'Notes boisées'], fond: ['Bois de santal', 'Cèdre', 'Labdanum'] },
    gender: 'H', season: ['Toutes saisons'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['bureau', 'soirée', 'signature'], vibe: 'élégant, frais, magnétique',
    url: `${SHOP}/collections/hommes` }),

  p({ id: 'dhi', name: 'DHI', tagline: 'Iris poudré et cacao — élégance masculine raffinée', family: 'Iris Poudré',
    notes: { tete: ['Lavande', 'Iris'], coeur: ['Iris', 'Cacao amer', 'Cardamome'], fond: ['Vétiver', 'Cuir', 'Cèdre'] },
    gender: 'H', season: ['Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['soirée habillée', 'signature distinguée'], vibe: 'distingué, sensuel, intemporel',
    url: `${SHOP}/collections/hommes` }),

  p({ id: 'viril', name: 'VIRIL', tagline: 'Oriental fougère affirmé — sillage de séduction', family: 'Oriental Fougère',
    notes: { tete: ['Lavande', 'Bergamote'], coeur: ['Cannelle', 'Cumin', 'Sauge'], fond: ['Vanille', 'Bois ambrés', 'Tonka'] },
    gender: 'H', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'rendez-vous'], vibe: 'viril, charismatique, conquérant',
    url: `${SHOP}/collections/hommes` }),

  p({ id: 'scandal', name: 'SCANDAL', tagline: 'Oriental gourmand provocant — séduction sans retenue', family: 'Oriental Gourmand',
    notes: { tete: ['Mandarine', 'Sauge sclarée'], coeur: ["Fève de tonka", 'Miel'], fond: ['Cèdre', 'Bois ambrés', 'Tabac blond'] },
    gender: 'H', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée audacieuse', 'événement'], vibe: 'audacieux, sucré, magnétique',
    url: `${SHOP}/collections/hommes` }),

  p({ id: 'legendaire', name: 'LÉGENDAIRE', tagline: 'Boisé fruité noble — sillage de prestige', family: 'Boisé Fruité',
    notes: { tete: ['Bergamote', 'Lavande', 'Ananas'], coeur: ['Pomme', 'Cannelle', 'Bouleau'], fond: ['Vétiver', 'Mousse de chêne', 'Patchouli'] },
    gender: 'H', season: ['Printemps', 'Automne'], intensity: 4, sillage: 5, longevity: 5,
    occasions: ['bureau', 'soirée', 'signature'], vibe: 'noble, conquérant, intemporel',
    url: `${SHOP}/collections/hommes` }),

  p({ id: 'dollars', name: 'DOLLARS', tagline: 'Oriental métallique solaire — luxe assumé', family: 'Oriental Épicé',
    notes: { tete: ['Pamplemousse', 'Menthe', 'Cannelle blanche'], coeur: ['Rose', 'Cuir blond'], fond: ['Ambre', 'Bois indien', 'Patchouli'] },
    gender: 'H', season: ['Toutes saisons'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'signature de soir'], vibe: 'puissant, lumineux, charismatique',
    url: `${SHOP}/collections/hommes` }),

  p({ id: 'night-men', name: 'NIGHT MEN', tagline: 'Oriental épicé nocturne — séduction profonde du soir', family: 'Oriental Épicé',
    notes: { tete: ['Cardamome', 'Bergamote'], coeur: ['Lavande', 'Cèdre de Virginie'], fond: ['Vétiver', 'Tonka', 'Vanille'] },
    gender: 'H', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'rendez-vous'], vibe: 'sensuel, nocturne, magnétique',
    url: `${SHOP}/collections/hommes` }),

  p({ id: 'men-intense', name: 'MEN INTENSE', tagline: 'Oriental gourmand intense — concentré de séduction', family: 'Oriental Gourmand',
    notes: { tete: ['Lavande', 'Menthe'], coeur: ['Cannelle', 'Cumin', 'Iris'], fond: ['Vanille noire', 'Bois ambrés', 'Tonka'] },
    gender: 'H', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'événement'], vibe: 'intense, charnel, addictif',
    url: `${SHOP}/collections/hommes` }),

  /* ── CLASSIC FEMME — new stubs */
  p({ id: 'girly', name: 'GIRLY', tagline: 'Oriental fruité espiègle — féminité affirmée', family: 'Oriental Fruité',
    notes: { tete: ['Bergamote', 'Citron', 'Pêche'], coeur: ['Tubéreuse', 'Jasmin', 'Cacao'], fond: ['Fève tonka', 'Ambre', 'Cacao'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'signature'], vibe: 'audacieuse, sucrée, magnétique',
    url: `${SHOP}/collections/femmes` }),

  p({ id: 'melle', name: 'MELLE', tagline: 'Chypré floral parisien — chic intemporel', family: 'Chypré Floral',
    notes: { tete: ['Orange', 'Bergamote', 'Litchi'], coeur: ['Rose de mai', 'Jasmin'], fond: ['Patchouli', 'Vétiver', 'Musc blanc'] },
    gender: 'F', season: ['Toutes saisons'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['quotidien chic', 'soirée', 'travail'], vibe: 'élégante, libre, parisienne',
    url: `${SHOP}/collections/femmes` }),

  p({ id: 'i-love-it', name: 'I LOVE IT', tagline: 'Floral lumineux solaire — joie et féminité radieuse', family: 'Floral Lumineux',
    notes: { tete: ['Mandarine', 'Bergamote', 'Poire'], coeur: ['Jasmin', 'Ylang-ylang', 'Rose de Damas'], fond: ['Musc blanc', 'Bois de cèdre', 'Vanille'] },
    gender: 'F', season: ['Printemps', 'Été'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['journée', 'rendez-vous'], vibe: 'lumineuse, joyeuse, féminine',
    url: `${SHOP}/collections/femmes` }),

  p({ id: 'hypnotic', name: 'HYPNOTIC', tagline: 'Oriental sucré envoûtant — sensualité hypnotique', family: 'Oriental Sucré',
    notes: { tete: ['Prune', 'Cumin', 'Notes vertes'], coeur: ['Jasmin sambac', 'Caraway'], fond: ['Vanille', 'Bois de santal', 'Musc'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'rendez-vous nocturne'], vibe: 'hypnotique, sensuelle, mystérieuse',
    url: `${SHOP}/collections/femmes` }),

  p({ id: 'is', name: 'IS', tagline: 'Chypré fruité affirmé — la force féminine en flacon', family: 'Chypré Fruité',
    notes: { tete: ['Cassis', 'Bergamote'], coeur: ['Rose de mai', 'Jasmin'], fond: ['Patchouli', 'Bois de santal', 'Vanille'] },
    gender: 'F', season: ['Toutes saisons'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['travail', 'soirée'], vibe: 'forte, élégante, contemporaine',
    url: `${SHOP}/collections/femmes` }),

  p({ id: 'the-way', name: 'THE WAY', tagline: 'Floral lumineux poudré — un chemin tout en grâce', family: 'Floral Poudré',
    notes: { tete: ['Bergamote', 'Néroli orange'], coeur: ['Tubéreuse', 'Jasmin indien'], fond: ['Vanille de Madagascar', 'Bois de cèdre', 'Musc blanc'] },
    gender: 'F', season: ['Printemps', 'Été', 'Automne'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['quotidien', 'rendez-vous'], vibe: 'gracieuse, libre, optimiste',
    url: `${SHOP}/collections/femmes` }),

  p({ id: 'robe', name: 'ROBE', tagline: 'Gourmand floral parisien — élégance noire et sucrée', family: 'Floral Gourmand',
    notes: { tete: ['Cerise noire', 'Bergamote', 'Amande'], coeur: ['Rose', 'Iris'], fond: ['Patchouli', 'Vanille', 'Fève tonka'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['soirée chic', 'rendez-vous'], vibe: 'parisienne, espiègle, addictive',
    url: `${SHOP}/collections/femmes` }),

  p({ id: 'nefertiti', name: 'NEFERTITI', tagline: 'Oriental floral royal — éclat des sables anciens', family: 'Oriental Floral',
    notes: { tete: ['Safran', 'Bergamote'], coeur: ['Rose de Damas', 'Oud doux'], fond: ['Ambre', 'Musc', 'Bois précieux'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'signature mémorable'], vibe: 'royale, mystérieuse, intemporelle',
    url: `${SHOP}/collections/femmes` }),

  p({ id: 'diamant-noir', name: 'DIAMANT NOIR', tagline: 'Oriental musqué noir — éclat ténébreux et précieux', family: 'Oriental Musqué',
    notes: { tete: ['Poivre noir', 'Cassis'], coeur: ['Rose noire', 'Patchouli'], fond: ['Vanille noire', 'Ambre', 'Musc sombre'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée habillée', 'événement'], vibe: 'précieuse, sombre, magnétique',
    url: `${SHOP}/collections/femmes` }),

  p({ id: 'lady', name: 'LADY', tagline: 'Ambré floral solaire — éclat doré de la féminité', family: 'Ambré Floral',
    notes: { tete: ['Néroli', 'Framboise', 'Bergamote'], coeur: ['Jasmin', 'Fleur d\'oranger'], fond: ['Ambre', 'Patchouli', 'Musc blanc'] },
    gender: 'F', season: ['Toutes saisons'], intensity: 4, sillage: 5, longevity: 5,
    occasions: ['soirée', 'signature lumineuse'], vibe: 'lumineuse, glamour, affirmée',
    url: `${SHOP}/collections/femmes` }),

  p({ id: 'olympe', name: 'OLYMPE', tagline: 'Floral salé divin — féminité solaire et conquérante', family: 'Floral Salé',
    notes: { tete: ['Mandarine verte', 'Gingembre'], coeur: ['Sel d\'ambre', 'Jasmin sambac'], fond: ['Bois de santal', 'Vanille', 'Cachemiran'] },
    gender: 'F', season: ['Printemps', 'Été'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['journée solaire', 'rendez-vous'], vibe: 'solaire, divine, conquérante',
    url: `${SHOP}/collections/femmes` }),

  p({ id: 'neila', name: 'NEILA', tagline: 'Floral oriental classique — rose hespéridée intemporelle', family: 'Floral Oriental',
    notes: { tete: ['Pêche', 'Bergamote'], coeur: ['Rose de Bulgarie', 'Jasmin'], fond: ['Bois de santal', 'Iris', 'Vanille'] },
    gender: 'F', season: ['Toutes saisons'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['soirée', 'signature classique'], vibe: 'romanesque, intemporelle, raffinée',
    url: `${SHOP}/collections/femmes` }),

  p({ id: 'blacko', name: 'BLACKO', tagline: 'Café vanille intense — addiction nocturne féminine', family: 'Oriental Gourmand',
    notes: { tete: ['Poivre rose', 'Mandarine'], coeur: ['Café', "Fleur d'oranger", 'Jasmin'], fond: ['Vanille', 'Patchouli', 'Cèdre'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'signature nocturne'], vibe: 'addictive, sombre, charismatique',
    url: `${SHOP}/collections/femmes` }),

  /* ── COLLECTION PRIVÉ — new stubs */
  p({ id: 'sucre-noir', name: 'SUCRE NOIR', tagline: 'Gourmand sombre — caramel brûlé et vanille noire', family: 'Gourmand Sombre',
    notes: { tete: ['Mandarine sanguine'], coeur: ['Caramel brûlé', 'Réglisse'], fond: ['Vanille noire', 'Patchouli', 'Bois sombres'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée intime', 'signature ténébreuse'], vibe: 'sombre, addictif, mystérieux',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'mula', name: 'MULA', tagline: 'Oriental traditionnel — mukhallat précieux du désert', family: 'Oriental Traditionnel',
    notes: { tete: ['Safran', 'Bergamote'], coeur: ['Rose', 'Oud', 'Encens'], fond: ['Ambre gris', 'Musc', 'Patchouli'] },
    gender: 'U', season: ['Toutes saisons'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'signature orientale'], vibe: 'traditionnel, profond, précieux',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'sultan', name: 'SULTAN', tagline: 'Oriental boisé royal — puissance et grandeur', family: 'Oriental Boisé',
    notes: { tete: ['Poivre noir', 'Cardamome'], coeur: ['Rose turque', 'Oud noble'], fond: ['Bois de oud', 'Patchouli', 'Ambre'] },
    gender: 'H', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['événement', 'signature royale'], vibe: 'royal, puissant, charismatique',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'gris', name: 'GRIS', tagline: 'Chypré poudré gris perle — élégance intemporelle', family: 'Chypré Poudré',
    notes: { tete: ['Bergamote', 'Mandarine'], coeur: ['Iris', 'Rose'], fond: ['Patchouli', 'Musc blanc', 'Bois de santal'] },
    gender: 'U', season: ['Toutes saisons'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['quotidien chic', 'soirée'], vibe: 'élégant, intemporel, poudré',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'trafalgar', name: 'TRAFALGAR', tagline: 'Fruité boisé conquérant — sillage de victoire', family: 'Fruité Boisé',
    notes: { tete: ['Ananas', 'Bergamote', 'Pomme'], coeur: ['Bouleau', 'Rose', 'Jasmin'], fond: ['Mousse de chêne', 'Ambre gris', 'Vanille'] },
    gender: 'H', season: ['Toutes saisons'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['bureau', 'soirée', 'signature'], vibe: 'conquérant, ambitieux, prestigieux',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'sucre-rose', name: 'SUCRE ROSE', tagline: 'Rose sucrée gourmande — féminité bonbon raffinée', family: 'Floral Gourmand',
    notes: { tete: ['Rose', 'Bergamote'], coeur: ['Praliné', 'Pivoine'], fond: ['Vanille', 'Bois de santal', 'Musc'] },
    gender: 'F', season: ['Toutes saisons'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['rendez-vous', 'cocooning'], vibe: 'gourmande, romantique, addictive',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'caramelo', name: 'CARAMELO', tagline: 'Caramel vanille onctueux — gourmandise irrésistible', family: 'Gourmand Caramel',
    notes: { tete: ['Caramel', 'Bergamote'], coeur: ['Vanille', 'Praliné'], fond: ['Musc', 'Bois doux', 'Patchouli'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['cocooning', 'soirée romantique'], vibe: 'gourmande, douce, irrésistible',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'oud-satin', name: 'OUD SATIN', tagline: 'Oriental satiné — violette, rose et oud précieux', family: 'Oriental Boisé',
    notes: { tete: ['Violette', 'Bergamote'], coeur: ['Rose de mai', 'Oud doux'], fond: ['Bois de santal', 'Ambre', 'Vanille'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'événement'], vibe: 'précieux, satiné, hypnotique',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'latte', name: 'LATTE', tagline: 'Café crème vanille — chaleur gourmande intemporelle', family: 'Gourmand Café',
    notes: { tete: ['Café', 'Bergamote'], coeur: ['Vanille', 'Crème'], fond: ['Musc', 'Bois doux', 'Tonka'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['journée', 'cocooning'], vibe: 'doux, réconfortant, gourmand',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'beluga', name: 'BELUGA', tagline: 'Cuir blanc poudré — luxe iris et amande', family: 'Cuir Iris',
    notes: { tete: ['Mandarine', 'Bergamote'], coeur: ['Iris', 'Amande', 'Héliotrope'], fond: ['Cuir blanc', 'Vanille', 'Tonka'] },
    gender: 'U', season: ['Toutes saisons'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['soirée habillée', 'signature distinguée'], vibe: 'distingué, poudré, intemporel',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'greatness', name: 'GREATNESS', tagline: 'Boisé épicé conquérant — sillage de prestige', family: 'Boisé Épicé',
    notes: { tete: ['Lavande', 'Bergamote', 'Pomme'], coeur: ['Cannelle', 'Géranium'], fond: ['Vanille', 'Ambre gris', 'Bois de cèdre'] },
    gender: 'H', season: ['Toutes saisons'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['bureau', 'soirée'], vibe: 'noble, conquérant, mémorable',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'utopia', name: 'UTOPIA', tagline: 'Fruité gourmand luxueux — rêve d\'évasion sucrée', family: 'Fruité Gourmand',
    notes: { tete: ['Fruits exotiques', 'Bergamote'], coeur: ['Rose', 'Praliné'], fond: ['Vanille', 'Bois ambrés', 'Patchouli'] },
    gender: 'U', season: ['Toutes saisons'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'signature mémorable'], vibe: 'luxueux, addictif, vibrant',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'love', name: 'LOVE', tagline: 'Vanille guimauve sensuelle — déclaration d\'amour gourmande', family: 'Gourmand Vanillé',
    notes: { tete: ['Bergamote', 'Néroli'], coeur: ['Guimauve', 'Iris'], fond: ['Vanille de Madagascar', 'Musc blanc', 'Cèdre'] },
    gender: 'F', season: ['Automne', 'Hiver'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['rendez-vous romantique', 'cocooning'], vibe: 'tendre, addictive, sensuelle',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'khamrah', name: 'KHAMRAH', tagline: 'Oriental épicé enivrant — célébration des sens', family: 'Oriental Épicé',
    notes: { tete: ['Cannelle', 'Noix de muscade', 'Bergamote'], coeur: ['Praliné', 'Datte', 'Bois de oud'], fond: ['Vanille', 'Bois de santal', 'Tonka'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'événement oriental'], vibe: 'enivrant, festif, addictif',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'krypto', name: 'KRYPTO', tagline: 'Frais aromatique citrique — énergie inarrêtable', family: 'Aromatique Hespéridé',
    notes: { tete: ['Citron', 'Pamplemousse', 'Menthe'], coeur: ['Lavande', 'Géranium'], fond: ['Vétiver', 'Musc', 'Bois de cèdre'] },
    gender: 'H', season: ['Printemps', 'Été'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['sport', 'journée active'], vibe: 'frais, dynamique, énergique',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'santal-33', name: '33 SANTAL', tagline: 'Santal cuir iconique — signature minimaliste new-yorkaise', family: 'Boisé Cuiré',
    notes: { tete: ['Violette', 'Cardamome'], coeur: ['Iris', 'Ambroxan'], fond: ['Bois de santal', 'Cuir', 'Cèdre'] },
    gender: 'U', season: ['Toutes saisons'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['quotidien', 'signature distinctive'], vibe: 'minimaliste, addictif, iconique',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'my-dream', name: 'MY DREAM', tagline: 'Floral lumineux poudré — rêverie féminine', family: 'Floral Poudré',
    notes: { tete: ['Bergamote', 'Néroli orange'], coeur: ['Tubéreuse indienne', 'Jasmin'], fond: ['Vanille', 'Bois de cèdre', 'Musc'] },
    gender: 'F', season: ['Printemps', 'Été'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['quotidien', 'rendez-vous'], vibe: 'rêveuse, optimiste, gracieuse',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'immense', name: 'IMMENSE', tagline: 'Fruité boisé puissant — sillage immense et conquérant', family: 'Fruité Boisé',
    notes: { tete: ['Ananas', 'Bergamote', 'Pomme'], coeur: ['Bouleau', 'Patchouli'], fond: ['Vanille', 'Ambre', 'Mousse de chêne'] },
    gender: 'H', season: ['Toutes saisons'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'événement'], vibe: 'immense, conquérant, mémorable',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'coco-vanilla', name: 'COCO VANILLA', tagline: 'Coco vanille addictive — sensualité tropicale', family: 'Gourmand Vanillé',
    notes: { tete: ['Noix de coco', 'Vanille'], coeur: ['Fleur d\'oranger', 'Praliné'], fond: ['Musc blanc', 'Sucre', 'Bois de santal'] },
    gender: 'F', season: ['Toutes saisons'], intensity: 4, sillage: 4, longevity: 5,
    occasions: ['quotidien', 'rendez-vous'], vibe: 'addictive, sensuelle, ensoleillée',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'pegaz', name: 'PEGAZ', tagline: 'Amande boisée mythique — sillage légendaire', family: 'Amande Boisée',
    notes: { tete: ['Amande amère', 'Bergamote'], coeur: ['Lavande', 'Notes lactées', 'Héliotrope'], fond: ['Vanille', 'Musc blanc', 'Bois de cèdre'] },
    gender: 'H', season: ['Toutes saisons'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'signature distinctive'], vibe: 'mythique, lumineux, sensuel',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'delina', name: 'DELINA', tagline: 'Rose litchi luxueuse — féminité rare et précieuse', family: 'Floral Fruité',
    notes: { tete: ['Litchi', 'Rhubarbe', 'Bergamote'], coeur: ['Rose de Turquie', 'Pivoine', 'Nerolia'], fond: ['Vanille', 'Bois de cèdre', 'Musc'] },
    gender: 'F', season: ['Toutes saisons'], intensity: 4, sillage: 5, longevity: 5,
    occasions: ['soirée', 'signature précieuse'], vibe: 'précieuse, rare, intemporelle',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'liquide-brun', name: 'LIQUIDE BRUN', tagline: 'Résineux fumé profond — mystère absolu', family: 'Résineux Fumé',
    notes: { tete: ['Notes vertes', 'Cardamome'], coeur: ['Encens', 'Patchouli', 'Tabac'], fond: ['Oud', 'Résines brunes', 'Bois fumé'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'signature mystique'], vibe: 'mystique, intense, ténébreux',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'casanova', name: 'CASANOVA', tagline: 'Agrumes floraux séducteurs — élégance italienne', family: 'Hespéridé Floral',
    notes: { tete: ['Bergamote', 'Citron', 'Mandarine'], coeur: ['Jasmin', 'Magnolia', 'Rose'], fond: ['Bois de santal', 'Musc', 'Vanille'] },
    gender: 'U', season: ['Printemps', 'Été'], intensity: 4, sillage: 4, longevity: 4,
    occasions: ['rendez-vous', 'soirée italienne'], vibe: 'séducteur, lumineux, élégant',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'cherry', name: 'CHERRY', tagline: 'Cerise amande tabac — gourmandise audacieuse', family: 'Gourmand Fruité',
    notes: { tete: ['Cerise noire', 'Amande amère'], coeur: ['Tabac', 'Liqueur'], fond: ['Bois de santal', 'Vanille', 'Patchouli'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée audacieuse', 'rendez-vous'], vibe: 'audacieux, addictif, sensuel',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'leather', name: 'LEATHER', tagline: 'Cuir framboise — luxe brut et sensuel', family: 'Cuir Fruité',
    notes: { tete: ['Framboise', 'Safran'], coeur: ['Cuir', 'Jasmin', 'Olibanum'], fond: ['Bois ambrés', 'Suède', 'Vanille'] },
    gender: 'U', season: ['Automne', 'Hiver'], intensity: 5, sillage: 5, longevity: 5,
    occasions: ['soirée', 'signature de caractère'], vibe: 'brut, sensuel, prestigieux',
    url: `${SHOP}/collections/collection-prive` }),

  p({ id: 'erbaggi', name: 'ERBAGGI', tagline: 'Fruité musqué méditerranéen — soleil en flacon', family: 'Fruité Musqué',
    notes: { tete: ['Bergamote', 'Citron de Sicile', 'Cédrat'], coeur: ['Fruits exotiques', 'Jasmin'], fond: ['Ambre', 'Musc blanc', 'Bois ambrés'] },
    gender: 'U', season: ['Printemps', 'Été'], intensity: 4, sillage: 5, longevity: 5,
    occasions: ['journée solaire', 'rendez-vous estival'], vibe: 'solaire, lumineux, joyeux',
    url: `${SHOP}/collections/collection-prive` }),
];

/* ─── HIDDEN MAPPING ────────────────────────────────────────────────────────
 *  Customer mentions a famous fragrance → silently route to the Eleganza match.
 *  Sourced from the table in prompts/system.md (kept in lock-step).
 *
 *  Each entry: { triggers: [...lowercase aliases], productId: <slug>,
 *                productGender: 'H' | 'F' | 'U'  (mirror of PRODUCTS row) }
 * ───────────────────────────────────────────────────────────────────────── */
export const DUPE_MAP = [
  /* ── HOMME ── */
  { triggers: ['le male elixir', 'le male intense', 'le male', 'jpg le male', 'gaultier le male', 'men intense'], productId: 'stronger', productGender: 'H' },
  { triggers: ['bleu de chanel', 'bleu chanel', 'bleu edp', 'bleu eau de parfum'], productId: 'bleu', productGender: 'H' },
  { triggers: ['dior homme intense', 'dior homme', 'homme intense dior', 'dhi'], productId: 'dhi', productGender: 'H' },
  { triggers: ['sauvage elixir', 'dior sauvage', 'sauvage dior', 'sauvage edp', 'sauvage parfum'], productId: 'so-elixir', productGender: 'H' },
  { triggers: ['phantom', 'phantom rabanne', 'rabanne phantom'], productId: 'viril', productGender: 'H' },
  { triggers: ['ultra male', 'ultra male jpg', 'gaultier ultra male'], productId: 'ultra-viril', productGender: 'H' },
  { triggers: ['scandal pour homme', 'scandal jpg', 'scandal gaultier'], productId: 'scandal', productGender: 'H' },
  { triggers: ['legend montblanc', 'mont blanc legend', 'legend mont blanc', 'legend'], productId: 'legendaire', productGender: 'H' },
  { triggers: ['1 million', 'one million', 'paco rabanne 1 million', 'rabanne million'], productId: 'dollars', productGender: 'H' },
  { triggers: ['invictus', 'invictus rabanne', 'paco invictus'], productId: 'victus', productGender: 'H' },
  { triggers: ["la nuit de l'homme", 'la nuit de lhomme', 'nuit de lhomme', 'ysl nuit de lhomme'], productId: 'night-men', productGender: 'H' },
  { triggers: ['body kouros', 'kouros ysl', 'ysl kouros', 'bodykouros'], productId: 'bodyko', productGender: 'H' },
  { triggers: ['fucking fabulous', 'fabulous tom ford', 'tom ford fabulous'], productId: 'fabulous', productGender: 'U' },
  { triggers: ['le male le parfum', 'le male parfum'], productId: 'men-intense', productGender: 'H' },

  /* ── FEMME ── */
  { triggers: ['good girl', 'carolina herrera good girl', 'good girl supreme', 'good girl very good'], productId: 'girly', productGender: 'F' },
  { triggers: ['coco mademoiselle', 'mademoiselle chanel', 'coco mlle'], productId: 'melle', productGender: 'F' },
  { triggers: ["j'adore", 'jadore', 'jadore dior', 'dior jadore', "i'm good", 'im good'], productId: 'i-love-it', productGender: 'F' },
  { triggers: ['hypnotic poison', 'hypnotic dior', 'dior hypnotic'], productId: 'hypnotic', productGender: 'F' },
  { triggers: ['si armani', 'si passione', 'sì armani', 'giorgio armani si'], productId: 'is', productGender: 'F' },
  { triggers: ['my way armani', 'my way giorgio armani', 'the one dolce gabbana', 'the one dg'], productId: 'the-way', productGender: 'F' },
  { triggers: ["l'interdit", 'linterdit', 'interdit givenchy', 'givenchy interdit'], productId: 'illicite', productGender: 'F' },
  { triggers: ['la petite robe noire', 'petite robe noire', 'guerlain robe noire'], productId: 'robe', productGender: 'F' },
  { triggers: ['nefertiti lattafa', 'nefertiti niche'], productId: 'nefertiti', productGender: 'F' },
  { triggers: ['flower by kenzo', 'kenzo flower', 'miss dior', 'dior miss'], productId: 'flower', productGender: 'F' },
  { triggers: ['black diamond', 'diamond noir', 'diamant noir parfum'], productId: 'diamant-noir', productGender: 'F' },
  { triggers: ['la vie est belle', 'la vie est belle intensément', 'la vie est belle éclat', 'lancome la vie', 'lancôme la vie', 'imperatrice', "l'impératrice"], productId: 'bella-vita', productGender: 'F' },
  { triggers: ['this is her zadig', 'zadig this is her', 'zadig voltaire her'], productId: 'this-is-her', productGender: 'F' },
  { triggers: ['lady million', 'lady million rabanne', 'rabanne lady'], productId: 'lady', productGender: 'F' },
  { triggers: ['olympea', 'olympéa', 'olympea rabanne'], productId: 'olympe', productGender: 'F' },
  { triggers: ['paradoxe', 'prada paradoxe', 'chanel no 5', 'chanel n°5', 'chanel n5', 'chanel number 5'], productId: 'extravagance', productGender: 'F' },
  { triggers: ['nahema', 'nahema guerlain', 'guerlain nahema'], productId: 'neila', productGender: 'F' },
  { triggers: ['black opium', 'opium ysl', 'ysl black opium', 'black opium ysl'], productId: 'blacko', productGender: 'F' },
  { triggers: ['libre', 'libre ysl', 'ysl libre', 'libre eau de parfum'], productId: 'liberty', productGender: 'F' },
  { triggers: ['manifesto', 'manifesto ysl', 'ysl manifesto'], productId: 'manif', productGender: 'F' },
  { triggers: ['poison girl', 'poison dior', 'dior poison'], productId: 'toxic-girl', productGender: 'F' },

  /* ── COLLECTION PRIVÉ ── */
  { triggers: ['black phantom', 'kilian black phantom', 'black phantom kilian'], productId: 'sucre-noir', productGender: 'U' },
  { triggers: ['mukhallat', 'lattafa mukhallat', 'mukhallat malaki'], productId: 'mula', productGender: 'U' },
  { triggers: ['royal oud', 'creed royal oud', 'oud royal'], productId: 'sultan', productGender: 'H' },
  { triggers: ['oud wood', 'tom ford oud wood', 'oud wood tom ford'], productId: 'bois-intense', productGender: 'U' },
  { triggers: ['gris dior', 'dior gris', 'gris dior parfum'], productId: 'gris', productGender: 'U' },
  { triggers: ['aventus', 'creed aventus', 'aventus creed', 'aventus elixir'], productId: 'trafalgar', productGender: 'H' },
  { triggers: ['velvet desert oud', 'desert oud bdk', 'velvet oud bdk', 'bdk velvet oud'], productId: 'velvet-oud', productGender: 'U' },
  { triggers: ['musc ravageur', 'frederic malle musc ravageur'], productId: 'musk-tahara', productGender: 'F' },
  { triggers: ['sucre rose mancera', 'mancera sucre rose', 'sucré rose'], productId: 'sucre-rose', productGender: 'F' },
  { triggers: ['angel mugler', 'mugler angel', 'angel parfum'], productId: 'caramelo', productGender: 'F' },
  { triggers: ['baccarat rouge 540', 'baccarat rouge', 'baccarat 540', 'br540', 'br 540', 'rouge 540', 'mfk baccarat'], productId: 'rouge-240', productGender: 'U' },
  { triggers: ['oud satin mood', 'oud satin', 'mfk oud satin', 'kurkdjian oud satin'], productId: 'oud-satin', productGender: 'U' },
  { triggers: ['vanilla latte', 'cafe latte', 'café latte'], productId: 'latte', productGender: 'U' },
  { triggers: ['cuir beluga', 'cuir béluga', 'beluga guerlain', 'guerlain beluga'], productId: 'beluga', productGender: 'U' },
  { triggers: ['greenley', 'layton', 'parfums de marly layton', 'parfums de marly greenley', 'pegasus greatness'], productId: 'greatness', productGender: 'H' },
  { triggers: ['vanilla 28', '28 vanilla kayali', 'kayali vanilla', 'kayali 28 vanilla'], productId: 'cody', productGender: 'U' },
  { triggers: ['gelato pistachio', 'pistache kilian', 'pistache gelato'], productId: 'pistachio', productGender: 'U' },
  { triggers: ['utopia roja', 'roja utopia', 'utopia parfum'], productId: 'utopia', productGender: 'U' },
  { triggers: ['yum boujee marshmallow', 'kayali marshmallow', 'kayali boujee', 'marshmallow kayali'], productId: 'marshmallow', productGender: 'F' },
  { triggers: ["love don't be shy", 'love dont be shy', 'kilian love dont be shy'], productId: 'love', productGender: 'F' },
  { triggers: ['khamrah lattafa', 'lattafa khamrah'], productId: 'khamrah', productGender: 'U' },
  { triggers: ['kryptonite mancera', 'mancera kryptonite', 'kryptonite'], productId: 'krypto', productGender: 'H' },
  { triggers: ['santal 33', 'le labo santal 33', 'santal 33 le labo'], productId: 'santal-33', productGender: 'U' },
  { triggers: ['ombre nomade', 'louis vuitton ombre', 'lv ombre nomade'], productId: 'nomade', productGender: 'U' },
  { triggers: ['my way', 'armani my way', 'giorgio my way'], productId: 'my-dream', productGender: 'F' },
  { triggers: ['imagination louis vuitton', 'lv imagination', 'imagination lv'], productId: 'imaginaire', productGender: 'U' },
  { triggers: ['initio side effect', 'aventus elixir', 'creed aventus elixir'], productId: 'immense', productGender: 'H' },
  { triggers: ['coco vanille', 'coco vanille mancera', 'mancera coco vanille', 'vanille coco'], productId: 'coco-vanilla', productGender: 'F' },
  { triggers: ['pegasus', 'pegasus parfums de marly', 'parfums de marly pegasus'], productId: 'pegaz', productGender: 'H' },
  { triggers: ['delina', 'delina parfums de marly', 'parfums de marly delina', 'delina exclusif'], productId: 'delina', productGender: 'F' },
  { triggers: ['black afgano', 'nasomatto black afgano', 'afgano nasomatto'], productId: 'liquide-brun', productGender: 'U' },
  { triggers: ['god of fire', 'shl 777', 'shl777', 'god fire'], productId: 'on-fire', productGender: 'U' },
  { triggers: ['casamorati', 'casamorati bouquet ideale', 'xerjoff casamorati'], productId: 'casanova', productGender: 'U' },
  { triggers: ['lost cherry', 'tom ford lost cherry', 'lost cherry tom ford'], productId: 'cherry', productGender: 'U' },
  { triggers: ['tuscan leather', 'tom ford tuscan leather'], productId: 'leather', productGender: 'U' },
  { triggers: ['erba pura', 'xerjoff erba pura', 'erba pura xerjoff'], productId: 'erbaggi', productGender: 'U' },
  { triggers: ['hayati attar', 'attar collection hayati', 'attar hayati'], productId: 'hayati', productGender: 'U' },
  { triggers: ['ambre nuit', 'dior ambre nuit', 'ambre nuit dior'], productId: 'ambre', productGender: 'U' },
  { triggers: ['moonlight in heaven', 'kilian moonlight', 'kilian heaven'], productId: 'moonlight', productGender: 'U' },
];

/* ─── FORBIDDEN VOCABULARY ─────────────────────────────────────────────────
 *  Server-side safety net. Any of these appearing in the model output is
 *  redacted to "cette inspiration olfactive".
 * ───────────────────────────────────────────────────────────────────────── */
export const FORBIDDEN_TERMS = [
  // ── Houses ──
  'dior', 'chanel', 'yves saint laurent', 'ysl', 'lancome', 'lancôme',
  'creed', 'kilian', 'by kilian', 'tom ford', 'jean paul gaultier', 'jpg', 'gaultier',
  'guerlain', 'kayali', 'nishane', 'givenchy', 'rabanne', 'paco rabanne',
  'giorgio armani', 'armani', 'lacoste', 'mugler', 'thierry mugler',
  'cacharel', 'mancera', 'mfk', 'maison francis kurkdjian', 'kurkdjian',
  'louis vuitton', 'lv parfum', "victoria's secret", 'victoria secret',
  'zadig & voltaire', 'zadig voltaire', 'kenzo', 'azzaro', 'montblanc', 'mont blanc',
  'narciso rodriguez', 'narciso', 'dolce & gabbana', 'dolce gabbana', 'd&g',
  'hermès', 'hermes', 'prada', 'attar collection', 'hugo boss', 'nina ricci',
  'bdk', 'shl 777', 'shl777', 'roja', 'roja parfums', 'parfums de marly',
  'frederic malle', 'frédéric malle', 'le labo', 'xerjoff', 'lattafa', 'initio',
  'tom ford', 'marc-antoine barrois', 'nasomatto', 'carolina herrera',
  'maison francis', 'francis kurkdjian',

  // ── Famous fragrances (men) ──
  'sauvage elixir', 'sauvage', 'dior sauvage', 'bleu de chanel', 'bleu edp',
  'dior homme intense', 'dior homme', 'body kouros', 'kouros',
  'le male', 'le male elixir', 'le male intense', 'le male le parfum',
  'ultra male', 'scandal pour homme', 'scandal jpg', 'legend montblanc',
  '1 million', 'one million', 'paco rabanne 1 million', 'invictus', 'phantom rabanne',
  "la nuit de l'homme", "l'homme idéal", 'la nuit de lhomme',
  'aventus', 'aventus elixir', 'virgin island water', 'royal oud',
  'good girl', 'bad boy', "i'm good", 'wanted azzaro',
  'fucking fabulous',

  // ── Famous fragrances (women) ──
  'chanel no 5', 'chanel n°5', 'chanel n5', 'n°5', 'coco mademoiselle',
  'la vie est belle', 'la vie est belle intensément', 'la vie est belle éclat',
  'libre ysl', 'libre eau de parfum', 'libre',
  'manifesto ysl', 'black opium', "j'adore", 'jadore', 'miss dior',
  'poison girl', 'hypnotic poison', "l'interdit", 'linterdit',
  'la petite robe noire', 'petite robe noire',
  'this is her zadig', 'flower by kenzo', 'kenzo flower',
  'lady million', 'olympea', 'olympéa', 'paradoxe', 'prada paradoxe',
  'nahema', 'si armani', 'si passione', "l'impératrice", 'imperatrice',
  'my way', 'my way armani', 'the one', 'light blue',
  'amor amor', 'angel mugler', 'angel parfum', 'alien mugler',

  // ── Famous fragrances (niche / collection privé) ──
  'baccarat rouge 540', 'baccarat rouge', 'baccarat 540', 'br540', 'br 540',
  'oud wood', 'gris dior', 'velvet desert oud', 'desert oud bdk',
  'musc ravageur', 'oud satin mood', 'oud satin', 'cuir beluga', 'cuir béluga',
  'vanilla 28', '28 vanilla kayali', 'yum boujee marshmallow', 'gelato pistachio',
  'utopia roja', "love don't be shy", 'love dont be shy', 'khamrah',
  'kryptonite', 'santal 33', 'ombre nomade', 'imagination louis vuitton',
  'initio side effect', 'coco vanille', 'pegasus', 'delina', 'delina exclusif',
  'black afgano', 'god of fire', 'casamorati', 'lost cherry', 'tuscan leather',
  'erba pura', 'hayati attar', 'ambre nuit', 'moonlight in heaven',
  'greenley', 'layton', 'mukhallat', 'black phantom',
  'terre d\'hermès', "voyage d'hermès", 'eau des merveilles', 'ganymede',
  'soleil blanc', 'noir tease', 'coconut passion', 'insolence',
  'l.12.12', 'petit matin', 'i\'m good guess',

  // ── Dupe vocabulary ──
  'dupe of', 'dupe de', 'copy of', 'copie de', 'imitation de', 'imitation of',
  'similar to', 'comme le', 'comme la', 'version de', 'inspiré de',
  'inspired by', "c'est le dupe", "c'est un dupe", 'alternative à',
];

/* ─── HELPERS ──────────────────────────────────────────────────────────── */
export function getProductById(id) {
  return PRODUCTS.find((prod) => prod.id === id) || null;
}

export function listProductIds() {
  return PRODUCTS.map((prod) => prod.id);
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
    const re = new RegExp(`(?<![A-Za-zÀ-ÿ])${escaped}(?![A-Za-zÀ-ÿ])`, 'gi');
    if (re.test(out)) {
      redacted.push(term);
      out = out.replace(re, 'cette inspiration olfactive');
    }
  }
  return { text: out, redacted };
}

/* ─── GENDER ROUTING ───────────────────────────────────────────────────────
 *  Detects whether the customer is shopping for a HOMME (H), FEMME (F),
 *  or UNISEX/uncertain (null) target. Picks up FR, EN, AR, ES, IT cues.
 *  When a strong cue is present, the chat router will refuse to push a
 *  fragrance whose gender conflicts with the request — keeps "I want a
 *  men's perfume" from getting recommended TOXIC GIRL.
 * ───────────────────────────────────────────────────────────────────────── */
const MALE_CUES = [
  // FR
  'pour homme', 'pour mon mari', 'pour mon copain', 'pour mon père', 'pour mon frère',
  'pour mon fils', 'pour mon petit ami', 'pour un homme', 'parfum homme', 'parfum masculin',
  'masculin', 'masculine', 'pour lui', 'cadeau pour lui', 'pour mon papa',
  // EN
  'for men', "men's", 'mens perfume', 'male fragrance', 'for him', 'gift for him',
  "for my boyfriend", 'for my husband', 'for my dad', 'for my brother', 'for my son',
  'masculine fragrance', 'cologne for men',
  // AR
  'للرجال', 'للرجل', 'عطر رجالي', 'هدية لزوجي',
  // ES / IT / DE
  'para hombre', 'para mi marido', 'para él',
  'per uomo', 'per mio marito',
  'für ihn', 'für meinen mann', 'herrenparfum',
];

const FEMALE_CUES = [
  // FR
  'pour femme', 'pour ma femme', 'pour ma copine', 'pour ma mère', 'pour ma sœur',
  'pour ma fille', 'pour ma petite amie', 'pour une femme', 'parfum femme', 'parfum féminin',
  'féminin', 'féminine', 'pour elle', 'cadeau pour elle', 'pour ma maman',
  // EN
  'for women', "women's", 'womens perfume', 'female fragrance', 'for her', 'gift for her',
  'for my girlfriend', 'for my wife', 'for my mom', 'for my sister', 'for my daughter',
  'feminine fragrance', 'perfume for women',
  // AR
  'للنساء', 'للمرأة', 'عطر نسائي', 'هدية لزوجتي',
  // ES / IT / DE
  'para mujer', 'para mi esposa', 'para ella',
  'per donna', 'per mia moglie',
  'für sie', 'für meine frau', 'damenparfum',
];

function detectRequestedGender(lower) {
  for (const cue of MALE_CUES) if (lower.includes(cue)) return 'H';
  for (const cue of FEMALE_CUES) if (lower.includes(cue)) return 'F';
  return null;
}

/* Pre-LLM router: returns gender-aware routing info.
   Returns either null (no signal) or:
     { productId, productGender, requestedGender, genderConflict }
   - productId / productGender: the mapped Eleganza product (null if no
     brand was mentioned, but a gender cue was detected).
   - requestedGender: 'H' | 'F' | null  — what the customer is shopping for.
   - genderConflict: true when the mapped product gender ≠ requested gender
     (and neither is unisex). The LLM is told to suggest a same-gender
     alternative instead of the mapped product. */
export function detectMappedProduct(userText) {
  if (!userText) return null;
  const lower = userText.toLowerCase();
  const requestedGender = detectRequestedGender(lower);

  for (const entry of DUPE_MAP) {
    for (const trigger of entry.triggers) {
      if (lower.includes(trigger.toLowerCase())) {
        const productGender = entry.productGender || 'U';
        const genderConflict = Boolean(
          requestedGender &&
          productGender !== 'U' &&
          requestedGender !== productGender,
        );
        return {
          productId: entry.productId,
          productGender,
          requestedGender: requestedGender || null,
          genderConflict,
        };
      }
    }
  }

  // No brand match — still surface the gender hint if present.
  if (requestedGender) {
    return { productId: null, productGender: null, requestedGender, genderConflict: false };
  }
  return null;
}

/* Build a compact "available IDs" list for the prompt (in-stock only).
   When `gender` is provided, narrow the enum so the LLM literally cannot
   recommend the wrong gender for a customer who asked for men's/women's. */
export function inStockIds(gender = null) {
  return PRODUCTS
    .filter((prod) => prod.inStock)
    .filter((prod) => !gender || prod.gender === gender || prod.gender === 'U')
    .map((prod) => prod.id);
}
