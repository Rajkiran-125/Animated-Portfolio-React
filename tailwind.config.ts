import type { Config } from 'tailwindcss';

// Colours / fonts are defined once as CSS variables in src/styles/tokens.css
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--paper) / <alpha-value>)',
        'paper-2': 'rgb(var(--paper-2) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-2': 'rgb(var(--ink-2) / <alpha-value>)',
        crimson: 'rgb(var(--crimson) / <alpha-value>)',
        'crimson-deep': 'rgb(var(--crimson-deep) / <alpha-value>)',
        ash: 'rgb(var(--ash) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'Haettenschweiler', 'sans-serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      screens: { xs: '420px' },
      maxWidth: { frame: '1440px' },
    },
  },
  plugins: [],
} satisfies Config;
