import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '../types/chat';

interface ProductCardProps {
  product: Product;
  index?: number;
}

/** Renders the first real photo with a graceful fallback if it errors. */
function RealPhoto({ urls, alt }: { urls: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  if (failed || !urls[index]) {
    return <PerfumeBottle name={alt} />;
  }

  return (
    <div className="relative w-full aspect-[4/5] bg-cream-50 overflow-hidden">
      <img
        src={urls[index]}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover transition-opacity duration-300"
        onError={() => setFailed(true)}
      />
      {/* Subtle gradient overlay so caps + badges read on any background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/15"
      />
      {urls.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {urls.slice(0, 4).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Photo ${i + 1}`}
              onClick={() => setIndex(i)}
              className={[
                'w-1.5 h-1.5 rounded-full transition-colors',
                i === index ? 'bg-ink-900' : 'bg-ink-900/30 hover:bg-ink-900/60',
              ].join(' ')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PerfumeBottle({ name }: { name: string }) {
  // Use first 2 letters as label, since we don't have product photos in chat
  const label = name.split(' ')[0].slice(0, 6);

  return (
    <div className="relative w-full aspect-[4/5] flex items-end justify-center bg-cream-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cream-50 via-cream-100 to-cream-200/40" />

      <svg
        viewBox="0 0 120 150"
        className="relative z-10 h-[88%] drop-shadow-[0_10px_18px_rgba(10,10,10,0.18)]"
        aria-hidden
      >
        {/* Cap */}
        <rect x="44" y="6" width="32" height="30" rx="3" fill="#0A0A0A" />
        <rect x="44" y="6" width="32" height="5" rx="2" fill="#1F1F1F" />
        {/* Neck */}
        <rect x="50" y="36" width="20" height="6" fill="#0A0A0A" />
        {/* Bottle */}
        <rect
          x="22"
          y="42"
          width="76"
          height="100"
          rx="4"
          fill="#EDE5D8"
          fillOpacity="0.55"
          stroke="#0A0A0A"
          strokeOpacity="0.12"
          strokeWidth="0.5"
        />
        {/* Inner liquid glow */}
        <rect x="24" y="44" width="72" height="96" rx="3" fill="url(#liquid)" />
        {/* Label */}
        <rect x="32" y="72" width="56" height="46" rx="1" fill="#FAF6EE" />
        <text
          x="60"
          y="92"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="8"
          fontWeight="600"
          letterSpacing="1.5"
          fill="#0A0A0A"
        >
          {label}
        </text>
        <text
          x="60"
          y="105"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="4.5"
          letterSpacing="1.2"
          fill="#0A0A0A"
          fillOpacity="0.65"
        >
          ELEGANZA
        </text>
        <line x1="40" y1="111" x2="80" y2="111" stroke="#0A0A0A" strokeOpacity="0.2" strokeWidth="0.4" />
        <text
          x="60"
          y="115"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="3"
          letterSpacing="0.6"
          fill="#0A0A0A"
          fillOpacity="0.55"
        >
          EXTRAIT DE PARFUM
        </text>
        <defs>
          <linearGradient id="liquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EDE5D8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#C9B89A" stopOpacity="0.35" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/** Format a price in the product's own currency. Defaults to EUR (new
 *  catalogue standard) so legacy rows without a currency field render
 *  the right symbol. */
function formatPrice(amount: number, currency: string | undefined): string {
  const code = (currency || 'EUR').toUpperCase();
  // Eleganza shows European format ("19,90 €"). Use fr-FR locale so the
  // separator and trailing symbol match the rest of the site.
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${code}`;
  }
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const allNotes = [
    ...product.notes.tete.slice(0, 2),
    ...product.notes.coeur.slice(0, 2),
    ...product.notes.fond.slice(0, 2),
  ];

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      className="flex-shrink-0 w-[230px] sm:w-[250px] bg-cream-50 rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-shadow group"
    >
      <div className="relative">
        {product.imageUrls && product.imageUrls.length > 0 ? (
          <RealPhoto urls={product.imageUrls} alt={product.name} />
        ) : (
          <PerfumeBottle name={product.name} />
        )}
        {product.oldPrice && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-ink-900 text-cream-100 text-[10px] uppercase tracking-elegant rounded-full">
            Promotion
          </span>
        )}
        {!product.inStock && (
          <span className="absolute top-3 right-3 px-2.5 py-1 bg-gold-500 text-cream-50 text-[10px] uppercase tracking-elegant rounded-full">
            Épuisé
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-sans text-[13px] tracking-elegant uppercase font-semibold text-ink-900">
          {product.name}
        </h3>
        {/* ⚠ IP RULE: never render `product.tagline` here — historical
            DB rows still contain "Brand — Original" strings that the
            customer must never see. Showing the olfactory family +
            audience is the public-safe substitute. */}
        <p className="text-[11.5px] text-ink-300 mt-1 leading-snug line-clamp-2 min-h-[28px]">
          {product.family}
          {product.gender === 'F' ? ' · Femme' : product.gender === 'H' ? ' · Homme' : ' · Mixte'}
        </p>

        <div className="mt-3 flex flex-wrap gap-1">
          {allNotes.slice(0, 3).map((n) => (
            <span
              key={n}
              className="text-[10px] px-2 py-0.5 bg-cream-200/60 text-ink-400 rounded-full"
            >
              {n}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-semibold text-ink-900">{formatPrice(product.price, product.currency)}</span>
            {product.oldPrice && (
              <span className="text-[11px] text-ink-200 line-through">{formatPrice(product.oldPrice, product.currency)}</span>
            )}
          </div>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-ink-900 text-cream-100 rounded-full text-[10px] uppercase tracking-elegant hover:bg-ink-500 transition-colors"
          >
            Voir
            <ArrowUpRight size={11} strokeWidth={2} />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
