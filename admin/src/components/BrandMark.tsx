interface BrandMarkProps {
  size?: number;
  variant?: 'dark' | 'light';
  label?: string;
}

/**
 * Eleganza brand mark.
 * - dark variant: black square, white "E", gold corner dot
 * - light variant: white square, black "E"
 */
export function BrandMark({ size = 40, variant = 'dark', label }: BrandMarkProps) {
  const isDark = variant === 'dark';
  const bg = isDark ? '#000000' : '#FFFFFF';
  const fg = isDark ? '#FFFFFF' : '#000000';
  const labelColor = isDark ? '#FFFFFF' : '#000000';
  const labelSubColor = isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)';

  return (
    <div className="inline-flex items-center gap-3">
      <div
        className="relative flex items-center justify-center rounded-md"
        style={{ width: size, height: size, background: bg }}
      >
        <span
          className="font-display font-semibold leading-none"
          style={{ color: fg, fontSize: size * 0.5 }}
        >
          E
        </span>
        {/* Gold accent dot — luxury signature */}
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
          style={{ background: '#C9A96E', boxShadow: '0 0 6px rgba(201,169,110,0.6)' }}
        />
      </div>
      {label && (
        <div className="flex flex-col leading-tight">
          <span
            className="font-display font-semibold"
            style={{ color: labelColor, fontSize: size * 0.42 }}
          >
            Eleganza
          </span>
          <span
            className="text-[10px] tracking-elegant uppercase"
            style={{ color: labelSubColor }}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
