import { motion } from 'framer-motion';
import { Logo } from './Logo';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-end gap-2 max-w-[80%]"
    >
      <Logo size={28} variant="dark" />
      <div className="flex items-center gap-1.5 px-4 py-3 bg-cream-100 rounded-2xl rounded-bl-md shadow-card">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 bg-ink-300 rounded-full"
            animate={{
              y: [0, -4, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              delay: i * 0.18,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
