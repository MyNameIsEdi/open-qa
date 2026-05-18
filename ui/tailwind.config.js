/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      colors: {
        neutral: {
          0: '#FFFFFF',
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2F6EF4',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        sage: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#34C759',
          600: '#16A34A',
          700: '#15803D',
        },
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#E8A728',
          600: '#D97706',
        },
        coral: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
        },
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.04)',
        soft: '0 2px 8px -2px rgba(0,0,0,0.08), 0 4px 12px -4px rgba(0,0,0,0.08)',
        medium: '0 4px 12px -2px rgba(0,0,0,0.08), 0 8px 16px -4px rgba(0,0,0,0.08)',
        large: '0 8px 24px -4px rgba(0,0,0,0.10), 0 16px 32px -8px rgba(0,0,0,0.10)',
        glow: '0 0 20px rgba(47,110,244,0.15)',
        'card-hover': '0 18px 40px rgba(47,110,244,0.11), 0 4px 14px rgba(0,0,0,0.07)',
      },
      borderRadius: {
        xs: '0.25rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.625rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.4,0,0.2,1)',
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.4,0,0.2,1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.4,0,0.2,1)',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
