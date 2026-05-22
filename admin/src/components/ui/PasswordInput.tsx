import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from './Input';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  hint?: string;
  error?: string | null;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { label, hint, error, ...rest },
  ref
) {
  const [reveal, setReveal] = useState(false);

  return (
    <Input
      ref={ref}
      type={reveal ? 'text' : 'password'}
      label={label}
      hint={hint}
      error={error}
      leftIcon={<Lock size={15} strokeWidth={1.8} />}
      rightSlot={
        <button
          type="button"
          onClick={() => setReveal((v) => !v)}
          aria-label={reveal ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          className="text-ink-300 hover:text-ink-900 transition-colors p-1"
        >
          {reveal ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
        </button>
      }
      autoComplete="current-password"
      {...rest}
    />
  );
});
