import type { Config } from 'tailwindcss';
import { colors, fonts, radius, spacing, blur } from './lib/design-tokens';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors,
      fontFamily: fonts,
      borderRadius: radius,
      spacing,
      backdropBlur: blur,
      transitionDuration: {
        micro: '150ms',
        state: '250ms',
        fade: '400ms',
        cinema: '420ms',
        slow: '800ms',
      },
      transitionTimingFunction: {
        cinema: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'fade-in': 'gwsFadeIn 400ms cubic-bezier(0.22, 1, 0.36, 1)',
        'vein-pulse': 'gwVeinPulse 18s ease-in-out infinite',
      },
      keyframes: {
        gwsFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        gwVeinPulse: {
          '0%, 100%': { opacity: '0.045' },
          '50%': { opacity: '0.09' },
        },
      },
      maxWidth: {
        content: '1280px',
      },
      gridTemplateColumns: {
        layout: 'repeat(12, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
};

export default config;