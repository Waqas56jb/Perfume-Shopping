import type { Product, QuickReply } from '../types/chat';

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'rouge-240',
    name: 'ROUGE 240',
    tagline: "L'Éclat Royal — un sillage solaire et ambré",
    family: 'Ambré Floral Boisé',
    notes: {
      tete: ['Jasmin', 'Safran'],
      coeur: ['Ambre', 'Bois de cèdre'],
      fond: ['Résine de sapin', 'Musc'],
    },
    gender: 'U',
    season: ['Automne', 'Hiver'],
    intensity: 5,
    sillage: 5,
    longevity: 5,
    price: 24,
    inStock: true,
    url: 'https://eleganza-parfums.com/products/rs5-parfum-copie',
  },
  {
    id: 'bella-vita',
    name: 'BELLA VITA',
    tagline: 'Gourmand floral irrésistible',
    family: 'Gourmand Floral',
    notes: {
      tete: ['Cassis', 'Poire'],
      coeur: ['Iris', 'Jasmin', "Fleur d'oranger"],
      fond: ['Praliné', 'Vanille', 'Patchouli', 'Fève de tonka'],
    },
    gender: 'F',
    season: ['Toutes saisons'],
    intensity: 4,
    sillage: 5,
    longevity: 5,
    price: 24,
    inStock: true,
    url: 'https://eleganza-parfums.com/products/imperatrice-parfum-copie',
  },
  {
    id: 'so-elixir',
    name: 'SO ELIXIR',
    tagline: 'Boisé épicé puissant et magnétique',
    family: 'Boisé Épicé Aromatique',
    notes: {
      tete: ['Bergamote de Calabre', 'Poivre'],
      coeur: ['Lavande', 'Poivre du Sichuan', 'Géranium'],
      fond: ['Ambroxan', 'Cèdre', 'Ciste'],
    },
    gender: 'H',
    season: ['Automne', 'Hiver'],
    intensity: 5,
    sillage: 5,
    longevity: 5,
    price: 24,
    inStock: false,
    url: 'https://eleganza-parfums.com/products/dollars-parfum-copie',
  },
  {
    id: 'coconut',
    name: 'COCONUT',
    tagline: 'Évasion solaire & sensuelle',
    family: 'Gourmand Vanillé Solaire',
    notes: {
      tete: ['Noix de coco fraîche', 'Lait chaud'],
      coeur: ['Vanille', 'Fleurs tropicales'],
      fond: ['Musc', 'Ambre doux', 'Sucre'],
    },
    gender: 'F',
    season: ['Printemps', 'Été'],
    intensity: 4,
    sillage: 4,
    longevity: 4,
    price: 19,
    oldPrice: 30,
    inStock: true,
    url: 'https://eleganza-parfums.com/products/audace-parfum-copie',
  },
];

export const INITIAL_QUICK_REPLIES: QuickReply[] = [
  {
    id: 'qr-notes',
    label: 'Découvrir par notes',
    value: 'Je veux découvrir vos parfums par notes olfactives',
  },
  {
    id: 'qr-universe',
    label: 'Trouver un univers familier',
    value: 'Je cherche un parfum qui me rappelle un univers que j’aime',
  },
  {
    id: 'qr-gift',
    label: 'Idée cadeau',
    value: 'Je cherche un parfum pour offrir en cadeau',
  },
  {
    id: 'qr-bestseller',
    label: 'Vos best-sellers',
    value: 'Montrez-moi vos meilleures ventes',
  },
];

export const FAMILY_QUICK_REPLIES: QuickReply[] = [
  { id: 'f-boise', label: 'Boisé', value: 'Boisé' },
  { id: 'f-floral', label: 'Floral', value: 'Floral' },
  { id: 'f-gourmand', label: 'Gourmand', value: 'Gourmand' },
  { id: 'f-oriental', label: 'Oriental', value: 'Oriental' },
  { id: 'f-frais', label: 'Frais', value: 'Frais' },
  { id: 'f-ambre', label: 'Ambré', value: 'Ambré' },
];

export const SCRIPTED_FLOW: Record<string, { text?: string; quickReplies?: QuickReply[]; productIds?: string[] }> = {
  default: {
    text: "Avec plaisir. Pour vous guider au mieux, dites-moi : quelle ambiance recherchez-vous ?",
    quickReplies: FAMILY_QUICK_REPLIES,
  },
  notes: {
    text: 'Excellent choix. Voici nos familles olfactives — laquelle vous attire le plus ?',
    quickReplies: FAMILY_QUICK_REPLIES,
  },
  universe: {
    text: "Je vous écoute. Décrivez-moi un parfum, une ambiance ou un souvenir olfactif que vous aimez. Je trouverai notre création qui s'en rapproche.",
  },
  gift: {
    text: "Quelle belle attention. C'est pour une femme, un homme, ou en mixte ?",
    quickReplies: [
      { id: 'g-f', label: 'Pour Elle', value: 'Pour une femme' },
      { id: 'g-h', label: 'Pour Lui', value: 'Pour un homme' },
      { id: 'g-u', label: 'Mixte', value: 'Mixte / unisexe' },
    ],
  },
  bestseller: {
    text: 'Voici nos créations les plus appréciées — chacune avec son caractère unique.',
    productIds: ['rouge-240', 'bella-vita', 'coconut'],
  },
  Boisé: {
    text: 'Les boisés Eleganza incarnent la profondeur et la prestance. Voici ma sélection :',
    productIds: ['so-elixir', 'rouge-240'],
  },
  Floral: {
    text: 'Les florals Eleganza — délicats, lumineux, féminins. Découvrez ces créations :',
    productIds: ['bella-vita'],
  },
  Gourmand: {
    text: 'Doux, addictifs, enveloppants — voici nos créations gourmandes :',
    productIds: ['bella-vita', 'coconut'],
  },
  Oriental: {
    text: "Sensuels et profonds, nos orientaux laissent une empreinte mémorable :",
    productIds: ['rouge-240'],
  },
  Frais: {
    text: 'Pour une signature légère et lumineuse, je vous propose :',
    productIds: ['coconut'],
  },
  Ambré: {
    text: 'Chaud, sensuel, irrésistible. Notre ambre signature :',
    productIds: ['rouge-240'],
  },
  baccarat: {
    text: "Je comprends l'univers que vous évoquez. Permettez-moi de vous présenter une création originale Eleganza qui s'inscrit dans cette famille olfactive — un sillage solaire, ambré et sophistiqué, avec une signature de safran et de jasmin :",
    productIds: ['rouge-240'],
  },
};
