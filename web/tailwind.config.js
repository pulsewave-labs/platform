/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        surface: '#0d1117',
        border: '#1b2332',
        accent: {
          DEFAULT: '#00F0B5',
          hover: '#4DFFD0',
          dark: '#00C79A',
          muted: 'rgba(0, 240, 181, 0.1)',
        },
        muted: '#6b7280',
        secondary: '#9ca3af',
        long: '#4ade80',
        short: '#f87171',
        warning: '#fbbf24',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
