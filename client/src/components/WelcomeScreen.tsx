import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center px-6 py-10 sm:py-14 flex-1"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 18 }}
        className="relative mb-6"
      >
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-ink-900 flex items-center justify-center shadow-glow">
          <span className="font-display text-cream-100 text-[44px] sm:text-[52px] font-semibold leading-none">
            E
          </span>
        </div>
        <motion.span
          aria-hidden
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-3 rounded-full border border-dashed border-ink-900/15"
        />
      </motion.div>

      <motion.h2
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="font-display text-2xl sm:text-[28px] leading-tight text-ink-900 max-w-[260px] text-balance"
      >
        Bienvenue chez Eleganza
      </motion.h2>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="mt-3 text-sm text-ink-300 max-w-[280px] text-balance leading-relaxed"
      >
        Je suis votre conseillère personnelle.
        <br />
        Ensemble, nous trouverons votre signature olfactive.
      </motion.p>

      <motion.button
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
        className="mt-8 inline-flex items-center gap-2 bg-ink-900 text-cream-100 px-7 py-3.5 rounded-full text-[12px] tracking-elegant uppercase font-medium hover:bg-ink-500 transition-colors shadow-soft"
      >
        <Sparkles size={14} strokeWidth={1.8} />
        Démarrer la conversation
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-10 flex items-center gap-2 text-[10px] uppercase tracking-elegant text-ink-200"
      >
        <span className="w-6 h-px bg-ink-200" />
        <span>Disponible 24/7 · Multilingue</span>
        <span className="w-6 h-px bg-ink-200" />
      </motion.div>
    </motion.div>
  );
}
