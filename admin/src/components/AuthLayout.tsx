import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BrandMark } from './BrandMark';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const QUOTES = [
  {
    text: '"Un parfum ne complète pas seulement une tenue. Il révèle une présence, crée une émotion et transforme chaque instant en souvenir."',
    author: 'Eleganza',
  },
];

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const quote = QUOTES[0];

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col lg:flex-row bg-cream-50">
      {/* ─── Brand panel (left on desktop, top on mobile) ─── */}
      <aside
        className="
          relative overflow-hidden grain
          bg-ink-900 text-cream-100
          lg:w-[44%] lg:min-h-screen
          flex flex-col justify-between
          px-8 py-8 lg:px-14 lg:py-14
        "
      >
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_30%_20%,rgba(237,229,216,0.10),transparent_60%)]"
        />

        <div className="relative z-10">
          <BrandMark size={44} variant="light" label="Administration" />
        </div>

        <div className="relative z-10 hidden lg:block max-w-md">
          <p className="font-display text-[28px] xl:text-[34px] leading-snug text-cream-100 text-balance italic">
            {quote.text}
          </p>
          <div className="mt-6 flex items-center gap-3 text-[11px] tracking-elegant uppercase text-cream-100/50">
            <span className="w-10 h-px bg-cream-100/30" />
            <span>{quote.author}</span>
          </div>
        </div>

        <div className="relative z-10 hidden lg:flex items-center justify-between text-[11px] tracking-wider text-cream-100/40 uppercase">
          <span>© {new Date().getFullYear()} Eleganza Parfums</span>
          <span className="font-mono">v0.1</span>
        </div>
      </aside>

      {/* ─── Form panel ─── */}
      <main className="flex-1 flex flex-col px-6 py-10 sm:px-10 lg:px-16 lg:py-16">
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[440px]"
          >
            <header className="mb-8">
              <p className="text-[11px] uppercase tracking-elegant text-ink-300 mb-3">
                Console d'administration
              </p>
              <h1 className="font-display text-[34px] sm:text-[40px] leading-tight text-ink-900">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-[14px] text-ink-300 leading-relaxed text-balance">
                  {subtitle}
                </p>
              )}
            </header>

            {children}

            {footer && <footer className="mt-8">{footer}</footer>}
          </motion.div>
        </div>

        <p className="mt-10 text-center text-[10.5px] tracking-wider text-ink-200 uppercase lg:hidden">
          © {new Date().getFullYear()} Eleganza · Confidentiel
        </p>
      </main>
    </div>
  );
}
