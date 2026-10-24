import { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { profile } from '@/data/profile';

interface Props {
  onDone: () => void;
}

/**
 * Entrance curtain: counts to 100 while fonts load, then the accent panel
 * lifts away. Owned entirely by one GSAP timeline.
 */
export function Preloader({ onDone }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    document.body.style.overflow = 'hidden';
    const finish = () => {
      document.body.style.overflow = '';
      doneRef.current();
    };

    if (prefersReducedMotion()) {
      const t = gsap.to(el, { autoAlpha: 0, duration: 0.3, delay: 0.2, onComplete: finish });
      return () => {
        t.kill();
        document.body.style.overflow = '';
      };
    }

    let cancelled = false;
    const counter = { v: 0 };
    const fonts = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 1800))]);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      tl.from('.pl-line', { yPercent: 110, duration: 0.8, ease: 'expo.out', stagger: 0.08 })
        .to(
          counter,
          {
            v: 100,
            duration: 1.3,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (count.current) count.current.textContent = String(Math.round(counter.v)).padStart(3, '0');
            },
          },
          0,
        )
        .to('.pl-bar', { scaleX: 1, duration: 1.3, ease: 'power2.inOut' }, 0)
        .to('.pl-inner', { yPercent: -30, autoAlpha: 0, duration: 0.6, ease: 'power3.in' }, '+=0.1')
        .to(el, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.25')
        .add(finish, '-=0.55');
      fonts.then(() => {
        if (!cancelled) tl.play();
      });
    }, el);

    return () => {
      cancelled = true;
      ctx.revert();
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      ref={root}
      data-surface="accent"
      className="on-accent fixed inset-0 z-[160] flex flex-col justify-between bg-accent p-[var(--gutter)] text-paper"
      role="status"
      aria-label="Loading portfolio"
    >
      <div className="pl-inner flex h-full flex-col justify-between">
        <div className="label flex justify-between">
          <span className="line-mask"><span className="pl-line block">{profile.fullName}</span></span>
          <span className="line-mask"><span className="pl-line block">Portfolio — {new Date().getFullYear()}</span></span>
        </div>
        <div>
          <div className="line-mask">
            <span className="pl-line display block text-[clamp(5rem,22vw,20rem)] leading-[0.8]">
              <span ref={count}>000</span>
            </span>
          </div>
          <div className="mt-6 h-[2px] w-full bg-paper/25">
            <div className="pl-bar h-full origin-left scale-x-0 bg-paper" />
          </div>
          <div className="label mt-3 flex justify-between">
            <span>Compiling experience</span>
            <span>{profile.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
