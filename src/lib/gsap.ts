import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
gsap.defaults({ ease: 'power3.out', duration: 0.9 });
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };

export const EASE = {
  out: 'power3.out',
  expo: 'expo.out',
  inOut: 'power3.inOut',
} as const;

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Smooth-scroll to a section, offsetting the fixed nav. */
export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const reduce = prefersReducedMotion();
  gsap.to(window, {
    duration: reduce ? 0 : 1.1,
    ease: 'power3.inOut',
    scrollTo: { y: target, autoKill: true },
    onComplete: () => {
      // Move focus for keyboard / screen reader users without scrolling again
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    },
  });
  history.replaceState(null, '', `#${id}`);
}
