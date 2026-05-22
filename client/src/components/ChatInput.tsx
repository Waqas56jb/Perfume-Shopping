import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(e as unknown as FormEvent);
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <form
      onSubmit={submit}
      className="px-4 sm:px-5 pt-3 pb-safe sm:pb-4 border-t border-ink-900/8 bg-cream-100/60 backdrop-blur-md"
    >
      <div className="flex items-end gap-2 bg-cream-50 border border-ink-900/8 rounded-3xl px-4 py-2.5 focus-within:border-ink-900/40 transition-colors">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrivez votre message…"
          rows={1}
          aria-label="Saisissez votre message"
          className="flex-1 resize-none bg-transparent text-[14.5px] text-ink-900 placeholder:text-ink-200 focus:outline-none leading-relaxed max-h-32 py-1.5"
          style={{ scrollbarWidth: 'none' }}
        />
        <motion.button
          type="submit"
          aria-label="Envoyer"
          whileTap={{ scale: 0.92 }}
          animate={{
            backgroundColor: canSend ? '#0A0A0A' : '#E0D5C0',
            color: canSend ? '#EDE5D8' : '#8B7F6F',
          }}
          transition={{ duration: 0.2 }}
          disabled={!canSend}
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center disabled:cursor-not-allowed"
        >
          <ArrowUp size={17} strokeWidth={2.2} />
        </motion.button>
      </div>

      <p className="mt-2 text-center text-[10px] text-ink-200 tracking-wider">
        Powered by Eleganza · Conseillère IA disponible 24/7
      </p>
    </form>
  );
}
