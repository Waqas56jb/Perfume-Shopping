import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface ChatBubbleProps {
  onClick: () => void;
  isOpen: boolean;
}

export function ChatBubble({ onClick, isOpen }: ChatBubbleProps) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={isOpen ? 'Fermer la conversation' : 'Ouvrir la conversation'}
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{
        opacity: isOpen ? 0 : 1,
        scale: isOpen ? 0.6 : 1,
        y: isOpen ? 20 : 0,
        pointerEvents: isOpen ? 'none' : 'auto',
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed z-50 bottom-5 right-5 sm:bottom-7 sm:right-7 group"
    >
      <span className="absolute inset-0 rounded-full bg-ink-900 animate-pulse-soft opacity-30 blur-md" />
      <span className="relative flex items-center gap-3 bg-ink-900 text-cream-100 pl-5 pr-6 py-4 rounded-full shadow-glow">
        <MessageCircle size={20} strokeWidth={1.8} />
        <span className="hidden sm:inline text-[11px] tracking-elegant uppercase font-medium">
          Conseillère
        </span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold-500 rounded-full ring-2 ring-cream-200" />
      </span>
    </motion.button>
  );
}
