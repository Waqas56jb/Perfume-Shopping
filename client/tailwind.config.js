/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF6EE',
          100: '#F5EFE4',
          200: '#EDE5D8',
          300: '#E0D5C0',
          400: '#C9B89A',
        },
        ink: {
          50: '#F7F6F4',
          100: '#E5E3DE',
          200: '#B8B5AD',
          300: '#6E6B65',
          400: '#3A3835',
          500: '#1F1F1F',
          600: '#141414',
          900: '#0A0A0A',
        },
        gold: {
          400: '#C9AB7A',
          500: '#B89968',
          600: '#9A7E50',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        elegant: '0.15em',
        wider: '0.08em',
      },
      boxShadow: {
        soft: '0 8px 32px -8px rgba(10, 10, 10, 0.12), 0 4px 12px -4px rgba(10, 10, 10, 0.08)',
        glow: '0 20px 60px -15px rgba(10, 10, 10, 0.35)',
        card: '0 2px 8px -2px rgba(10, 10, 10, 0.06)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.05)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
