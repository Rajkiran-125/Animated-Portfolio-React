import type { Config } from 'tailwindcss';

// Colours are CSS variables, set per colour theme in src/styles/index.css
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--paper) / <alpha-value>)',
        'paper-2': 'rgb(var(--paper-2) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-2': 'rgb(var(--ink-2) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-deep': 'rgb(var(--accent-deep) / <alpha-value>)',
        ash: 'rgb(var(--ash) / <alpha-value>)',
      },
      // Accent text gets a lighter tint on ink sections; fills and borders keep --accent
      textColor: {
        accent: 'rgb(var(--accent-text) / <alpha-value>)',
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
