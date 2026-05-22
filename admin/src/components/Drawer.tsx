import { type ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: 'md' | 'lg' | 'xl';
  children: ReactNode;
  footer?: ReactNode;
}

const widthClasses = {
  md: 'max-w-[440px]',
  lg: 'max-w-[560px]',
  xl: 'max-w-[720px]',
};

/**
 * Right-side slide-in drawer with backdrop. Used for product edit/create.
 */
export function Drawer({ open, onClose, title, subtitle, width = 'lg', children, footer }: DrawerProps) {
  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/55 z-40"
            aria-hidden
          />
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className={`fixed inset-y-0 right-0 z-50 w-full ${widthClasses[width]} bg-white border-l border-neutral-200 shadow-2xl flex flex-col`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <header className="flex items-start justify-between gap-4 px-6 py-5 border-b border-neutral-200">
              <div className="min-w-0">
                <h2 className="font-display text-[22px] text-black leading-tight tracking-tight truncate">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-[12.5px] text-neutral-500 mt-1 truncate">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                aria-label="Fermer"
                onClick={onClose}
                className="w-9 h-9 rounded-lg text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors flex items-center justify-center"
              >
                <X size={18} strokeWidth={1.8} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto scrollbar-elegant px-6 py-6">
              {children}
            </div>

            {footer && (
              <footer className="border-t border-neutral-200 px-6 py-4 flex items-center justify-end gap-2 bg-neutral-50">
                {footer}
              </footer>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
