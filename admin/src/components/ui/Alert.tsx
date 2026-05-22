import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

type Tone = 'error' | 'success' | 'info' | 'warn';

interface AlertProps {
  tone?: Tone;
  title?: string;
  children: ReactNode;
}

const toneConfig: Record<Tone, { bg: string; ring: string; text: string; Icon: typeof Info }> = {
  error: { bg: 'bg-error-100', ring: 'ring-error-500/20', text: 'text-error-500', Icon: AlertCircle },
  success: { bg: 'bg-success-100', ring: 'ring-success-500/20', text: 'text-success-500', Icon: CheckCircle2 },
  info: { bg: 'bg-cream-100', ring: 'ring-ink-900/10', text: 'text-ink-400', Icon: Info },
  warn: { bg: 'bg-warn-100', ring: 'ring-warn-500/20', text: 'text-warn-500', Icon: AlertTriangle },
};

export function Alert({ tone = 'info', title, children }: AlertProps) {
  const { bg, ring, text, Icon } = toneConfig[tone];

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl ${bg} ring-1 ${ring} px-4 py-3 animate-fade-in-up`}
    >
      <Icon size={18} strokeWidth={1.8} className={`flex-shrink-0 mt-0.5 ${text}`} />
      <div className="flex-1 min-w-0">
        {title && <p className={`text-[13px] font-medium ${text} leading-tight`}>{title}</p>}
        <div className={`text-[12.5px] leading-relaxed ${tone === 'info' ? 'text-ink-400' : text} ${title ? 'mt-0.5' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
