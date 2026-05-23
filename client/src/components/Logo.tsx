interface LogoProps {
  size?: number;
  variant?: 'dark' | 'light';
}

/**
 * Eleganza brand mark, backed by `/logo.png` (client/public/logo.png).
 * Used by the floating chat bubble, the welcome screen and the chat header.
 */
export function Logo({ size = 36, variant = 'dark' }: LogoProps) {
  const bg = variant === 'dark' ? '#0A0A0A' : '#EDE5D8';
  return (
    <div
      className="relative flex items-center justify-center rounded-full overflow-hidden"
      style={{ width: size, height: size, background: bg }}
    >
      <img
        src="/logo.png"
        alt="Eleganza"
        width={size}
        height={size}
        loading="eager"
        decoding="async"
        className="w-full h-full object-contain"
        style={{ padding: size * 0.12 }}
      />
    </div>
  );
}
