interface BrandMarkProps {
  size?: number;
  variant?: 'dark' | 'light';
  label?: string;
}

/**
 * Eleganza brand mark, backed by `/logo.png` (admin/public/logo.png).
 * - dark variant  : black tile, white label on light backgrounds
 * - light variant : transparent tile, white labels on dark backgrounds (sidebar)
 * A tiny gold corner dot stays as the luxury signature.
 */
export function BrandMark({ size = 40, variant = 'dark', label }: BrandMarkProps) {
  const isDark = variant === 'dark';
  const labelColor = isDark ? '#0A0A0A' : '#FFFFFF';
  const labelSubColor = isDark ? 'rgba(0,0,0,0.50)' : 'rgba(255,255,255,0.55)';

  return (
    <div className="inline-flex items-center gap-3">
      <div
        className="relative flex items-center justify-center rounded-md overflow-hidden"
        style={{
          width: size,
          height: size,
          background: isDark ? '#000000' : 'rgba(255,255,255,0.04)',
        }}
      >
        <img
          src="/logo.png"
          alt="Eleganza"
          width={size}
          height={size}
          loading="eager"
          decoding="async"
          className="w-full h-full object-contain"
          style={{ padding: size * 0.08 }}
        />
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
