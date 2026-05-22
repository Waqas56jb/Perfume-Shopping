import { X, Minus } from 'lucide-react';
import { Logo } from './Logo';

interface ChatHeaderProps {
  onClose?: () => void;
  onMinimize?: () => void;
}

export function ChatHeader({ onClose, onMinimize }: ChatHeaderProps = {}) {
  const showClose = typeof onClose === 'function';
  const showMinimize = typeof onMinimize === 'function';
  const hasActions = showClose || showMinimize;

  return (
    <header className="relative flex items-center justify-between px-5 py-4 border-b border-ink-900/8 bg-cream-100/60 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Logo size={42} variant="dark" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-cream-100" />
        </div>
        <div className="flex flex-col">
          <span className="font-display text-[17px] leading-tight text-ink-900 font-semibold">
            Eleganza
          </span>
          <span className="text-[11px] text-ink-300 tracking-wider uppercase">
            Conseillère · En ligne
          </span>
        </div>
      </div>

      {hasActions ? (
        <div className="flex items-center gap-1">
          {showMinimize && (
            <button
              onClick={onMinimize}
              aria-label="Réduire la fenêtre"
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full text-ink-400 hover:text-ink-900 hover:bg-ink-900/5 transition-colors"
            >
              <Minus size={18} strokeWidth={1.8} />
            </button>
          )}
          {showClose && (
            <button
              onClick={onClose}
              aria-label="Fermer la conversation"
              className="flex items-center justify-center w-9 h-9 rounded-full text-ink-400 hover:text-ink-900 hover:bg-ink-900/5 transition-colors"
            >
              <X size={18} strokeWidth={1.8} />
            </button>
          )}
        </div>
      ) : (
        <span className="hidden sm:inline-block text-[10px] tracking-elegant uppercase text-ink-300">
          Confidentiel
        </span>
      )}
    </header>
  );
}
