import { useLayoutEffect, useRef, type DependencyList, type RefObject } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';

type Setup = (ctx: { reduce: boolean; scope: HTMLElement }) => void | (() => void);

/**
 * Runs GSAP code inside a gsap.context scoped to `scope`.
 * Every tween and ScrollTrigger created inside is reverted on unmount,
 * so sections never leak timelines or listeners.
 * Runs in a layout effect so "from" states apply before first paint.
 */
export function useGsap<T extends HTMLElement>(setup: Setup, deps: DependencyList = []): RefObject<T> {
  const scope = useRef<T>(null);
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useLayoutEffect(() => {
    const el = scope.current;
    if (!el) return;
    let cleanup: void | (() => void);
    const ctx = gsap.context(() => {
      cleanup = setupRef.current({ reduce: prefersReducedMotion(), scope: el });
    }, el);
    return () => {
      cleanup?.();
      ctx.revert();
    };
  }, deps);

  return scope;
}
