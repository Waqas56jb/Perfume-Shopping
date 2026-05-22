import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string | null;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon, rightSlot, className = '', id, ...rest },
  ref
) {
  const reactId = useId();
  const inputId = id ?? `input-${reactId}`;
  const errorId = error ? `${inputId}-err` : undefined;
  const hintId = hint && !error ? `${inputId}-hint` : undefined;
  const hasError = Boolean(error);

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-[11px] uppercase tracking-elegant text-neutral-500 font-medium"
      >
        {label}
      </label>

      <div
        className={[
          'group flex items-center gap-2 rounded-lg bg-white border transition-colors',
          'h-11 px-3.5',
          hasError
            ? 'border-error-500'
            : 'border-neutral-300 focus-within:border-black',
        ].join(' ')}
      >
        {leftIcon && <span className="text-neutral-400 group-focus-within:text-black">{leftIcon}</span>}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError}
          aria-describedby={errorId || hintId}
          className={[
            'flex-1 bg-transparent text-[14px] text-black placeholder:text-neutral-400',
            'focus:outline-none disabled:opacity-50',
            className,
          ].join(' ')}
          {...rest}
        />

        {rightSlot}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-[12px] text-error-500 leading-snug">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[12px] text-neutral-500 leading-snug">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
