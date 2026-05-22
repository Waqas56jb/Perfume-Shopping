import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  delta?: { sign: 'up' | 'down' | 'flat'; label: string };
}

/**
 * Minimal stat tile.
 * White background, hairline border, no heavy ring.
 * Hover slightly elevates with shadow.
 */
export function StatCard({ label, value, hint, icon, delta }: StatCardProps) {
  return (
    <article className="group bg-white border border-neutral-200 rounded-xl p-5 lg:p-6 hover:border-neutral-300 hover:shadow-card transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10.5px] uppercase tracking-elegant text-neutral-400 font-medium">
          {label}
        </span>
        {icon && (
          <div className="text-neutral-400 group-hover:text-black transition-colors">{icon}</div>
        )}
      </div>
      <p className="font-display text-[32px] lg:text-[40px] text-black leading-none tracking-tight">
        {value}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3 min-h-[18px]">
        {hint && <p className="text-[12px] text-neutral-500 leading-snug">{hint}</p>}
        {delta && (
          <span
            className={[
              'text-[10.5px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md',
              delta.sign === 'up' && 'bg-success-100 text-success-500',
              delta.sign === 'down' && 'bg-error-100 text-error-500',
              delta.sign === 'flat' && 'bg-neutral-100 text-neutral-500',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {delta.label}
          </span>
        )}
      </div>
    </article>
  );
}
