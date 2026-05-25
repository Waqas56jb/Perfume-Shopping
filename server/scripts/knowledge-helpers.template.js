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

const MALE_CUES = [
  'pour homme', 'pour mon mari', 'pour mon copain', 'pour mon père', 'pour mon frère',
  'pour mon fils', 'pour mon petit ami', 'pour un homme', 'parfum homme', 'parfum masculin',
  'masculin', 'masculine', 'pour lui', 'cadeau pour lui', 'pour mon papa',
  'for men', "men's", 'mens perfume', 'male fragrance', 'for him', 'gift for him',
  'for my boyfriend', 'for my husband', 'for my dad', 'for my brother', 'for my son',
  'masculine fragrance', 'cologne for men',
  'للرجال', 'للرجل', 'عطر رجالي', 'هدية لزوجي',
  'para hombre', 'para mi marido', 'para él',
  'per uomo', 'per mio marito',
  'für ihn', 'für meinen mann', 'herrenparfum',
];

const FEMALE_CUES = [
  'pour femme', 'pour ma femme', 'pour ma copine', 'pour ma mère', 'pour ma sœur',
  'pour ma fille', 'pour ma petite amie', 'pour une femme', 'parfum femme', 'parfum féminin',
  'féminin', 'féminine', 'pour elle', 'cadeau pour elle', 'pour ma maman',
  'for women', "women's", 'womens perfume', 'female fragrance', 'for her', 'gift for her',
  'for my girlfriend', 'for my wife', 'for my mom', 'for my sister', 'for my daughter',
  'feminine fragrance', 'perfume for women',
  'للنساء', 'للمرأة', 'عطر نسائي', 'هدية لزوجتي',
  'para mujer', 'para mi esposa', 'para ella',
  'per donna', 'per mia moglie',
  'für sie', 'für meine frau', 'damenparfum',
];

function detectRequestedGender(lower) {
  for (const cue of MALE_CUES) if (lower.includes(cue)) return 'H';
  for (const cue of FEMALE_CUES) if (lower.includes(cue)) return 'F';
  return null;
}

/* Flatten DUPE_MAP into a single list of triggers sorted by length DESC,
   so the most specific phrase always wins. Without this, a customer
   typing "Sauvage Elixir Dior" would route to SO (whose trigger
   "sauvage" is shorter and listed earlier in the catalog) instead of
   the correct SO ÉLIXIR (trigger "sauvage elixir"). */
const FLAT_TRIGGERS = (() => {
  const flat = [];
  for (const entry of DUPE_MAP) {
    for (const t of entry.triggers) {
      // Pre-compile word-boundary regex so "king" (D&G — King) does NOT
      // match inside "fucking" (Fucking Fabulous). Word boundaries are
      // letter/digit ↔ non-letter/digit, so multi-word triggers like
      // "le male" and "1 million" still match correctly.
      const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      flat.push({
        trigger: t,
        re: new RegExp(`\\b${escaped}\\b`, 'i'),
        productId: entry.productId,
        productGender: entry.productGender || 'U',
      });
    }
  }
  flat.sort((a, b) => b.trigger.length - a.trigger.length);
  return flat;
})();

export function detectMappedProduct(userText) {
  if (!userText) return null;
  const lower = userText.toLowerCase();
  const requestedGender = detectRequestedGender(lower);

  for (const { re, productId, productGender } of FLAT_TRIGGERS) {
    if (re.test(lower)) {
      const genderConflict = Boolean(
        requestedGender &&
        productGender !== 'U' &&
        requestedGender !== productGender,
      );
      return {
        productId,
        productGender,
        requestedGender: requestedGender || null,
        genderConflict,
      };
    }
  }

  if (requestedGender) {
    return { productId: null, productGender: null, requestedGender, genderConflict: false };
  }
  return null;
}

export function inStockIds(gender = null) {
  return PRODUCTS
    .filter((prod) => prod.inStock)
    .filter((prod) => !gender || prod.gender === gender || prod.gender === 'U')
    .map((prod) => prod.id);
}
