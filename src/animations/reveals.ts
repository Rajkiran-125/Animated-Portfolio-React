import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Declarative scroll reveals. Mark elements in JSX and call this once per section scope:
 *  - data-reveal="up"     → fade + rise
 *  - data-reveal="clip"   → clip-path wipe from the bottom
 *  - data-split           → container of <SplitWords>, words rise in a stagger
 * Must be called inside a gsap.context (see useGsap) so it is reverted on unmount.
 */
export function registerReveals(scope: HTMLElement, reduce: boolean) {
  if (reduce) return;

  const ups = gsap.utils.toArray<HTMLElement>('[data-reveal="up"]', scope);
  if (ups.length) {
    gsap.set(ups, { y: 48, autoAlpha: 0 });
    ScrollTrigger.batch(ups, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { y: 0, autoAlpha: 1, duration: 1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
    });
  }

  gsap.utils.toArray<HTMLElement>('[data-reveal="clip"]', scope).forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.3,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      },
    );
  });

  gsap.utils.toArray<HTMLElement>('[data-split]', scope).forEach((el) => {
    const words = el.querySelectorAll('.word');
    gsap.from(words, {
      yPercent: 115,
      rotate: 4,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.045,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
}
