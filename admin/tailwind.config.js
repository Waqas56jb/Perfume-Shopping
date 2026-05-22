/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ─── Surfaces — pure white + neutral greys (no warm tint) ───── */
        cream: {
          50:  '#FFFFFF',
          100: '#FFFFFF',
          200: '#FAFAFA',
          300: '#F2F2F2',
          400: '#E5E5E5',
        },
        /* ─── Inks — pure blacks for sidebar / headings / CTA ───────── */
        ink: {
          50:  '#FAFAFA',
          100: '#F0F0F0',
          200: '#C4C4C4',
          300: '#7A7A7A',
          400: '#3D3D3D',
          500: '#1A1A1A',
          600: '#0F0F0F',
          900: '#000000',
        },
        /* ─── Gold — champagne / luxury accent ────────────────────────
           Used sparingly on the sidebar (active bar, brand dot),
           focus rings, and key KPI numbers (revenue, conversion). */
        gold: {
          50:  '#FAF6EB',
          100: '#F5EAD0',
          200: '#E8D5A8',
          300: '#D4B679',
          400: '#C9A96E',   // primary accent
          500: '#B8954A',
          600: '#9A7B34',
          700: '#7C6128',
          900: '#3D2F11',
        },
        success: { 500: '#0F8B5A', 100: '#E8F4EE' },
        warn:    { 500: '#8B6A1C', 100: '#F4EFE3' },
        error:   { 500: '#9E2F2F', 100: '#F7E7E7' },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        elegant: '0.15em',
        wider: '0.08em',
      },
      boxShadow: {
        soft: '0 8px 32px -8px rgba(0, 0, 0, 0.10), 0 4px 12px -4px rgba(0, 0, 0, 0.06)',
        glow: '0 30px 80px -20px rgba(0, 0, 0, 0.40)',
        card: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        gold: '0 0 0 1px rgba(201, 169, 110, 0.4), 0 8px 24px -6px rgba(201, 169, 110, 0.25)',
        inner: 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
      },
      keyframes: {
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
