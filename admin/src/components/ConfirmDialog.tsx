import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  danger = false,
  onConfirm,
  onCancel,
  busy = false,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/60 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="alertdialog"
          >
            <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-glow p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    danger ? 'bg-error-100 text-error-500' : 'bg-gold-100 text-gold-500'
                  }`}
                >
                  <AlertTriangle size={20} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-[20px] text-black leading-tight mb-1">{title}</h3>
                  <p className="text-[13.5px] text-neutral-500 leading-relaxed">{message}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-2">
                <Button variant="ghost" size="md" onClick={onCancel} disabled={busy}>
                  {cancelLabel}
                </Button>
                <Button
                  variant={danger ? 'danger' : 'primary'}
                  size="md"
                  onClick={onConfirm}
                  isLoading={busy}
                >
                  {confirmLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
