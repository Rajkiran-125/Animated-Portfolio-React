/**
 * Colour themes. The DOM reads its colours from CSS variables, one block per
 * theme in src/styles/index.css. This file lists the themes and holds the
 * palettes for what CSS can't reach: the WebGL hero scene, its canvas code
 * screens and the SVG fallback. To add a theme, add a CSS block and an entry here.
 */

export const THEME_IDS = ['mono', 'red', 'blue', 'purple', 'green'] as const;
export type ThemeId = (typeof THEME_IDS)[number];

/** The original design. */
export const DEFAULT_THEME: ThemeId = 'red';

export const isThemeId = (v: unknown): v is ThemeId => THEME_IDS.includes(v as ThemeId);

/** Toon-shaded materials, so slightly lifted from the flat CSS tokens. */
export interface ScenePalette {
  ink: string;
  inkSoft: string;
  paper: string;
  bone: string;
  accent: string;
  outline: string;
}

/** Syntax colours for the code screens (always a dark editor). */
export interface CodePalette {
  bg: string;
  bar: string;
  text: string;
  keyword: string;
  string: string;
  comment: string;
  punct: string;
  ok: string;
  /** window-chrome traffic lights */
  dots: [string, string, string];
}

interface ThemeDef {
  label: string;
  scene: ScenePalette;
  code: CodePalette;
}

export const THEMES: Record<ThemeId, ThemeDef> = {
  mono: {
    label: 'Black & White',
    scene: { ink: '#1a1a1a', inkSoft: '#2b2b2b', paper: '#f7f7f6', bone: '#d2d2d0', accent: '#6e6e6e', outline: '#080808' },
    code: {
      bg: '#101010',
      bar: '#1b1b1b',
      text: '#c9c9c9',
      keyword: '#ffffff',
      string: '#9d9d9d',
      comment: '#666666',
      punct: '#8c8c8c',
      ok: '#e6e6e6',
      dots: ['#8a8a8a', '#f5f5f4', '#4a4a4a'],
    },
  },
  red: {
    label: 'Red',
    scene: { ink: '#1b1616', inkSoft: '#2a2323', paper: '#f3ece0', bone: '#d9cfc0', accent: '#e21b23', outline: '#110e0e' },
    code: {
      bg: '#141010',
      bar: '#1f1919',
      text: '#efe7da',
      keyword: '#ff4b53',
      string: '#f2c14e',
      comment: '#7d716a',
      punct: '#b9ada0',
      ok: '#9ad18b',
      dots: ['#e21b23', '#efe7da', '#6b605a'],
    },
  },
  blue: {
    label: 'Blue',
    scene: { ink: '#141b2c', inkSoft: '#212a40', paper: '#eff3f9', bone: '#cbd5e5', accent: '#2f6df0', outline: '#080d1a' },
    code: {
      bg: '#0b111f',
      bar: '#151c2d',
      text: '#eaeff6',
      keyword: '#6ea0ff',
      string: '#f2c14e',
      comment: '#6a7590',
      punct: '#a8b3c8',
      ok: '#9ad18b',
      dots: ['#215ee2', '#eaeff6', '#505b70'],
    },
  },
  purple: {
    label: 'Purple',
    scene: { ink: '#1c1528', inkSoft: '#2a2139', paper: '#f3eff9', bone: '#d5cbe5', accent: '#8a4cf2', outline: '#100b18' },
    code: {
      bg: '#110c19',
      bar: '#1c1527',
      text: '#efebf6',
      keyword: '#b292ff',
      string: '#f2c14e',
      comment: '#766c88',
      punct: '#b2a8c4',
      ok: '#9ad18b',
      dots: ['#7c3ae8', '#efebf6', '#625a70'],
    },
  },
  green: {
    label: 'Green',
    scene: { ink: '#111d17', inkSoft: '#1d2c24', paper: '#eff5ef', bone: '#c9d8cc', accent: '#18925a', outline: '#08120d' },
    code: {
      bg: '#0a120e',
      bar: '#142019',
      text: '#e9f0e9',
      keyword: '#54d68c',
      string: '#f2c14e',
      comment: '#687a70',
      punct: '#a5b5ac',
      ok: '#b9e98a',
      dots: ['#127c48', '#e9f0e9', '#506058'],
    },
  },
};
