import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic: investment signals
        positive: {
          DEFAULT: '#10b981',
          muted: 'rgba(16, 185, 129, 0.15)',
          subtle: 'rgba(16, 185, 129, 0.08)',
        },
        negative: {
          DEFAULT: '#ef4444',
          muted: 'rgba(239, 68, 68, 0.15)',
          subtle: 'rgba(239, 68, 68, 0.08)',
        },
        neutral: {
          DEFAULT: '#f59e0b',
          muted: 'rgba(245, 158, 11, 0.15)',
          subtle: 'rgba(245, 158, 11, 0.08)',
        },
        // UI surfaces
        surface: {
          bg: '#0a0e17',
          card: '#131928',
          elevated: '#1a2332',
          border: '#1e2a3a',
        },
        // Text
        content: {
          primary: '#e0e6ed',
          secondary: '#7a8ba5',
          muted: '#4a5568',
        },
        // Accent (interactive only)
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          muted: 'rgba(59, 130, 246, 0.15)',
        },
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
      },
      fontSize: {
        'xs': ['11px', { lineHeight: '16px' }],
        'sm': ['13px', { lineHeight: '20px' }],
        'base': ['15px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['24px', { lineHeight: '32px' }],
        '2xl': ['30px', { lineHeight: '36px' }],
        '3xl': ['40px', { lineHeight: '44px' }],
      },
      borderRadius: {
        DEFAULT: '8px',
        'sm': '4px',
        'lg': '12px',
        'xl': '16px',
        'full': '9999px',
      },
      animation: {
        'shimmer': 'shimmer 1.2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
