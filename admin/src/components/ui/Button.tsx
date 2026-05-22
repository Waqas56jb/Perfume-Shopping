import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-black text-white hover:bg-neutral-800 active:bg-neutral-900 disabled:bg-neutral-300 disabled:text-white',
  secondary:
    'bg-white text-black border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 active:bg-neutral-100 disabled:opacity-60',
  ghost:
    'bg-transparent text-neutral-600 hover:text-black hover:bg-neutral-100 active:bg-neutral-200',
  danger:
    'bg-error-500 text-white hover:bg-[#8A2828] active:bg-[#6E1F1F] disabled:bg-error-100 disabled:text-error-500',
  gold:
    'bg-black text-white border border-gold-400 hover:bg-gold-400 hover:text-black hover:border-gold-400 active:bg-gold-500 disabled:opacity-60',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3.5 text-[12px]',
  md: 'h-10 px-4 text-[13px]',
  lg: 'h-11 px-5 text-[13px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    children,
    disabled,
    ...rest
  },
  ref
) {
  const cls = [
    'relative inline-flex items-center justify-center gap-2 rounded-lg font-medium select-none',
    'transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    'disabled:cursor-not-allowed',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button ref={ref} className={cls} disabled={disabled || isLoading} {...rest}>
      {isLoading ? (
        <Loader2 size={15} strokeWidth={2} className="animate-spin" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
});
