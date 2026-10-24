import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import { prefersReducedMotion } from '@/lib/gsap';
import { DEFAULT_THEME, isThemeId, type ThemeId } from './themes';

/**
 * The active colour theme lives on <html data-theme>. An inline script in
 * index.html applies the saved choice before first paint, so this store only
 * reads it back — no flash of the default theme on reload.
 */
const STORAGE_KEY = 'rj-theme'; // also read by the inline script in index.html
const root = document.documentElement;
const listeners = new Set<() => void>();

let current: ThemeId = isThemeId(root.dataset.theme) ? root.dataset.theme : DEFAULT_THEME;
let fadeTimer: number | undefined;

function apply(id: ThemeId) {
  current = id;
  root.dataset.theme = id;
  // Browser chrome (mobile address bar) follows the accent
  const accent = getComputedStyle(root).getPropertyValue('--accent').trim();
  if (accent) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', `rgb(${accent.split(/\s+/).join(', ')})`);
  listeners.forEach((l) => l());
}

apply(current);

// Keep other open tabs in step
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY && isThemeId(e.newValue) && e.newValue !== current) apply(e.newValue);
});

export const getTheme = () => current;

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const useTheme = () => useSyncExternalStore(subscribeTheme, getTheme, () => DEFAULT_THEME);

/**
 * Switch theme and remember it. With View Transitions the new theme grows
 * out of `origin` as a circle over a snapshot of the old one — one composited
 * animation, so nothing flickers and the 3D scene changes in step with the page.
 * Older browsers cross-fade colours; reduced motion switches instantly.
 */
export function setTheme(next: ThemeId, origin?: { x: number; y: number }) {
  if (next === current) return;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // private mode / storage disabled: the theme still applies for this visit
  }
  // flushSync: React-driven colours (3D scene, SVG art) must be in the new state when it is captured
  const commit = () => flushSync(() => apply(next));

  if (prefersReducedMotion()) return commit();

  if (!('startViewTransition' in document)) {
    root.classList.add('theme-fade');
    window.clearTimeout(fadeTimer);
    fadeTimer = window.setTimeout(() => root.classList.remove('theme-fade'), 600);
    return commit();
  }

  const { x, y } = origin ?? { x: window.innerWidth, y: 0 };
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  document
    .startViewTransition(commit)
    .ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    })
    .catch(() => {
      // skipped (e.g. superseded by a newer switch) — the theme is applied regardless
    });
}
