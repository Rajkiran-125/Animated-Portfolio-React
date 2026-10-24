import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useCanHover, usePrefersReducedMotion } from '@/hooks/useMediaQuery';

type Theme = 'paper' | 'crimson' | 'ink';

const THEMES: Record<Theme, { ring: string; dot: string; fill: string; label: string }> = {
  paper: { ring: 'rgb(17 14 14)', dot: 'rgb(226 27 35)', fill: 'rgb(226 27 35)', label: 'rgb(239 231 218)' },
  crimson: { ring: 'rgb(239 231 218)', dot: 'rgb(239 231 218)', fill: 'rgb(17 14 14)', label: 'rgb(239 231 218)' },
  ink: { ring: 'rgb(239 231 218)', dot: 'rgb(226 27 35)', fill: 'rgb(226 27 35)', label: 'rgb(239 231 218)' },
};

/**
 * Two-part cursor (dot + lagging ring). Positions are driven by gsap.quickTo,
 * hover state by event delegation — zero React renders after mount.
 * Elements opt in with data-cursor="hover" | "view" and data-cursor-label.
 * Sections declare data-theme so the cursor stays legible on any background.
 */
export function Cursor() {
  const canHover = useCanHover();
  const reduce = usePrefersReducedMotion();
  const enabled = canHover && !reduce;

  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled || !ring.current || !dot.current || !label.current) return;
    const root = document.documentElement;
    root.classList.add('has-cursor');

    const ringEl = ring.current;
    const dotEl = dot.current;
    const labelEl = label.current;
    const ringX = gsap.quickTo(ringEl, 'x', { duration: 0.5, ease: 'power3' });
    const ringY = gsap.quickTo(ringEl, 'y', { duration: 0.5, ease: 'power3' });
    const dotX = gsap.quickTo(dotEl, 'x', { duration: 0.08, ease: 'none' });
    const dotY = gsap.quickTo(dotEl, 'y', { duration: 0.08, ease: 'none' });

    let visible = false;
    let theme: Theme = 'paper';
    let mode: 'default' | 'hover' | 'view' = 'default';

    const paint = () => {
      const t = THEMES[theme];
      ringEl.style.setProperty('--ring', t.ring);
      ringEl.style.setProperty('--fill', t.fill);
      labelEl.style.color = t.label;
      dotEl.style.background = t.dot;
      gsap.to(ringEl, {
        scale: mode === 'view' ? 2.4 : mode === 'hover' ? 1.6 : 1,
        backgroundColor: mode === 'view' ? t.fill : mode === 'hover' ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0)',
        borderColor: mode === 'view' ? t.fill : t.ring,
        duration: 0.35,
        ease: 'power3.out',
        overwrite: 'auto',
      });
      gsap.to(dotEl, { scale: mode === 'default' ? 1 : 0, duration: 0.25, overwrite: 'auto' });
      gsap.to(labelEl, { autoAlpha: mode === 'view' ? 1 : 0, duration: 0.2, overwrite: 'auto' });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (!visible) {
        visible = true;
        gsap.set([ringEl, dotEl], { x: e.clientX, y: e.clientY });
        gsap.to([ringEl, dotEl], { autoAlpha: 1, duration: 0.3 });
      }
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest) return;
      const nextTheme = (target.closest('[data-theme]')?.getAttribute('data-theme') as Theme) || 'paper';
      const interactive = target.closest<HTMLElement>('[data-cursor], a, button, input, textarea, [role="button"]');
      let nextMode: typeof mode = 'default';
      if (interactive) {
        const kind = interactive.dataset.cursor;
        if (kind === 'view') {
          nextMode = 'view';
          labelEl.textContent = interactive.dataset.cursorLabel || 'View';
        } else if (kind !== 'none') {
          nextMode = 'hover';
        }
      }
      if (nextMode !== mode || nextTheme !== theme) {
        mode = nextMode;
        theme = nextTheme;
        paint();
      }
    };

    const onLeave = () => {
      visible = false;
      gsap.to([ringEl, dotEl], { autoAlpha: 0, duration: 0.25 });
    };
    const onDown = () => gsap.to(ringEl, { scale: '-=0.25', duration: 0.15 });
    const onUp = () => paint();

    paint();
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);

    return () => {
      root.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      gsap.killTweensOf([ringEl, dotEl, labelEl]);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ring}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[150] -ml-5 -mt-5 grid h-10 w-10 place-items-center rounded-full border-[1.5px] opacity-0"
        style={{ borderColor: 'var(--ring)' }}
      >
        <span ref={label} className="label scale-[0.42] whitespace-nowrap font-semibold opacity-0" />
      </div>
      <div
        ref={dot}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[151] -ml-1 -mt-1 h-2 w-2 rounded-full opacity-0"
      />
    </>
  );
}
