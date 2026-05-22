import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 border border-dashed border-neutral-200 rounded-xl bg-white">
      {icon && (
        <div className="mb-5 w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
          {icon}
        </div>
      )}
      <h3 className="font-display text-[22px] text-black tracking-tight mb-1.5">{title}</h3>
      {description && <p className="text-[13px] text-neutral-500 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
