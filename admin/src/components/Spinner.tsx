import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: number;
  label?: string;
}

export function Spinner({ size = 16, label }: SpinnerProps) {
  return (
    <div className="inline-flex items-center gap-2 text-neutral-500">
      <Loader2 size={size} strokeWidth={2} className="animate-spin" />
      {label && <span className="text-[12.5px]">{label}</span>}
    </div>
  );
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <Spinner size={24} label={label} />
    </div>
  );
}
