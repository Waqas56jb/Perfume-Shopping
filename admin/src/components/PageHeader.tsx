import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * Crisper page header — tighter type, neutral borders, generous space.
 */
export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-6 mb-8 lg:mb-10 pb-6 border-b border-neutral-200">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10.5px] uppercase tracking-elegant text-neutral-400 font-medium mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[30px] lg:text-[36px] leading-[1.1] text-black tracking-tight text-balance">
          {title}
        </h1>
        {description && (
          <p className="mt-2.5 text-[13.5px] text-neutral-500 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </header>
  );
}
