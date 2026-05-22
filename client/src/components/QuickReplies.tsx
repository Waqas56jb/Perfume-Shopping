import { motion } from 'framer-motion';
import type { QuickReply } from '../types/chat';

interface QuickRepliesProps {
  replies: QuickReply[];
  onSelect: (qr: QuickReply) => void;
}

export function QuickReplies({ replies, onSelect }: QuickRepliesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap gap-2 ml-9"
    >
      {replies.map((qr, i) => (
        <motion.button
          key={qr.id}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 * i, type: 'spring', stiffness: 280, damping: 20 }}
          whileHover={{ scale: 1.03, backgroundColor: '#0A0A0A', color: '#EDE5D8' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(qr)}
          className="px-4 py-2 bg-cream-100 border border-ink-900/12 rounded-full text-[12.5px] text-ink-900 hover:shadow-card transition-shadow"
        >
          {qr.label}
        </motion.button>
      ))}
    </motion.div>
  );
}
