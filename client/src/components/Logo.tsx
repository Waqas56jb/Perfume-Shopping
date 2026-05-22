interface LogoProps {
  size?: number;
  variant?: 'dark' | 'light';
}

export function Logo({ size = 36, variant = 'dark' }: LogoProps) {
  const bg = variant === 'dark' ? '#0A0A0A' : '#EDE5D8';
  const fg = variant === 'dark' ? '#EDE5D8' : '#0A0A0A';

  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{ width: size, height: size, background: bg }}
    >
      <span
        className="font-display font-semibold leading-none"
        style={{ color: fg, fontSize: size * 0.5 }}
      >
        E
      </span>
    </div>
  );
}
