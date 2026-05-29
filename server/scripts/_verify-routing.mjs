import { detectMappedProduct, getProductById, PRODUCTS, DUPE_MAP } from '../knowledgeBase.js';

const cases = [
  // Client 2026-05-29 women's errors + gender disambiguation
  ['Scandale absolu', 'S.ABSOLU'],
  ['scandale absolu femme', 'S.ABSOLU'],
  ['Scandal Absolu', 'S.ABSOLU'],
  ['Scandal pour homme', 'SCANDAL'],
  ['Scandale homme', 'SCANDAL'],
  ['Nuit Trésor', 'DIAMANT NOIR'],
  ['Lady Million', 'LADY'],
  ['Mon Paris', 'PANAME'],
  ['Black Opium', 'BLACKO'],
  ['Noir Tease', 'BLACK TEASE'],
  // Client 2026-05-26 errors
  ['Fame', 'FAMING'],
  ['Alien', 'NEILA'],
  ['Bonbon', 'CANDY'],
  ['Silk', 'SILK'],
  ['Madawi', 'MADA'],
  ['Rouge Malachite', 'ROUGE MALA'],
  ['The Chronic Bleu', 'SULTAN'],
  ['Cuir Béluga', 'BELUGA'],
  ['Good Girl Gone Bad', 'GONE BAD'],
  ['Santal 33', '33 SANTAL'],
  ['La Danza Delle Libellule', 'FIRST CLASS'],
  ['Uomo Born In Roma', 'BORN IN ROMA'],
  ['Rosendo Mateu 5', 'RS5'],
  ['Kirke', 'CASANOVA'],
  ['Soleil Neige', 'NEIGE'],
  ['Erba Pura', 'ERBAGGI'],
  ['Nota Sugar', "L'ADDICTION"],
  // Client 2026-05-29 (Bvlgari Tygar misspellings)
  ['Tigar Bulgaria', 'TYGAR'],
  ['Tygar Bulgari', 'TYGAR'],
  ['Tygar', 'TYGAR'],
  // Baseline regressions
  ['Baccarat Rouge 540', 'ROUGE 240'],
  ['Le Male JPG', 'VIRIL'],
  ['Aventus Creed', 'EVENT'],
  ['Aventus Absolu Creed', 'EVENT ABSOLU'],
  ['Sauvage Elixir Dior', 'SO ÉLIXIR'],
  ['Coco Mademoiselle Chanel', 'MELLE'],
  ['Fucking Fabulous Tom Ford', 'FABULOUS'],
  ['Ombre Nomade Louis Vuitton', 'NOMADE'],
  ["L'Interdit Givenchy", 'ILLICITE'],
  ['Olympea Paco Rabanne', 'OLYMPE'],
  ['Manifesto YSL', 'MANIFE'],
  ['1 Million Paco Rabanne', 'DOLLARS'],
  ['Lost Cherry Tom Ford', 'CHERRY'],
];

let pass = 0, fail = 0;
for (const [q, expected] of cases) {
  const r = detectMappedProduct(q);
  const got = r ? getProductById(r.productId)?.name : null;
  if (got === expected) { pass++; }
  else { fail++; console.log('FAIL', JSON.stringify(q), '->', got, '(expected', expected + ')'); }
}
console.log(`\nPRODUCTS ${PRODUCTS.length} | DUPE_MAP ${DUPE_MAP.length} | triggers ${DUPE_MAP.reduce((n,x)=>n+x.triggers.length,0)}`);
console.log(`TOTAL PASS ${pass} / FAIL ${fail} of ${cases.length}`);
process.exit(fail > 0 ? 1 : 0);
