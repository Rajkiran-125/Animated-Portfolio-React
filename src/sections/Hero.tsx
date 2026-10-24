import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowDown, MousePointerClick } from 'lucide-react';
import { useGsap } from '@/animations/useGsap';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { Crest } from '@/components/ui/Crest';
import { TornEdge } from '@/components/ui/TornEdge';
import { Marquee } from '@/components/ui/Marquee';
import { marqueeWords, profile } from '@/data/profile';
import { detectRenderTier } from '@/lib/device';
import { gsap, scrollToSection } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { HeroFallback } from '@/three/HeroFallback';
import type { SceneBounds } from '@/three/HeroScene';

const loadScene = () => import('@/three/HeroScene');
const HeroScene = lazy(loadScene);

function Chars({ text }: { text: string }) {
  return (
    <span className="line-mask" aria-hidden="true">
      {text.split('').map((c, i) => (
        <span key={i} className="hero-char inline-block will-change-transform">
          {c}
        </span>
      ))}
    </span>
  );
}

export function Hero({ ready }: { ready: boolean }) {
  const [tier] = useState(detectRenderTier);
  const reduce = usePrefersReducedMotion();

  // Fetch the 3D chunk while the preloader runs; mount it once the curtain lifts
  useEffect(() => {
    if (tier !== 'none') loadScene();
  }, [tier]);

  const scope = useGsap<HTMLElement>(
    ({ reduce, scope }) => {
      const chars = scope.querySelectorAll('.hero-char');
      const fades = scope.querySelectorAll('[data-hero-fade]');
      if (!ready) {
        gsap.set(chars, { yPercent: 105 });
        gsap.set(fades, { autoAlpha: 0, y: 24 });
        gsap.set('[data-hero-scene]', { autoAlpha: 0 });
        return;
      }
      if (reduce) {
        gsap.set(chars, { yPercent: 0 });
        gsap.set(fades, { autoAlpha: 1, y: 0 });
        gsap.set('[data-hero-scene]', { autoAlpha: 1 });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      // fromTo: the !ready pass above is reverted before this one runs
      tl.fromTo(chars, { yPercent: 105 }, { yPercent: 0, duration: 1.3, stagger: 0.035 })
        .fromTo('[data-hero-scene]', { autoAlpha: 0, scale: 0.92, y: 40 }, { autoAlpha: 1, scale: 1, y: 0, duration: 1.6 }, 0.25)
        .fromTo(fades, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.07 }, 0.55);

      // Scroll-out: the name splits apart and the scene sinks back (scrubbed)
      const st = { trigger: scope, start: 'top top', end: 'bottom top', scrub: 0.6 };
      gsap.to('[data-hero-line="1"]', { xPercent: -14, ease: 'none', scrollTrigger: st });
      gsap.to('[data-hero-line="2"]', { xPercent: 14, ease: 'none', scrollTrigger: st });
      gsap.to('[data-hero-scene-inner]', { yPercent: 18, scale: 0.9, ease: 'none', scrollTrigger: st });
    },
    [ready],
  );

  const name = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLDivElement>(null);
  const sceneLayer = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<SceneBounds>({ name: 0.45, intro: 0.75, tag: 0.8, floor: 0.92 });

  // Tell the scene where the copy sits so it can lay itself out around it.
  // Layout offsets only — they ignore the GSAP transforms on the layer and the fades.
  useEffect(() => {
    const section = scope.current;
    const els = [name.current, intro.current, tag.current, sceneLayer.current, band.current];
    if (tier === 'none' || !section || els.some((el) => !el)) return;
    const [nameEl, introEl, tagEl, layer, bandEl] = els as HTMLElement[];
    const top = (el: HTMLElement) => {
      let y = 0;
      for (let n: HTMLElement | null = el; n && n !== section; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
      return y;
    };
    const measure = () => {
      const h = layer.offsetHeight;
      if (!h) return;
      const row = (y: number) => (y - layer.offsetTop) / h;
      const floor = row(Math.min(layer.offsetTop + h, bandEl.offsetTop));
      const next: SceneBounds = {
        name: row(top(nameEl) + nameEl.offsetHeight),
        intro: row(top(introEl)),
        // offsetParent is null while the tag is display:none (below md)
        tag: tagEl.offsetParent ? row(top(tagEl)) : floor,
        floor,
      };
      setBounds((b) =>
        (Object.keys(next) as (keyof SceneBounds)[]).every((k) => Math.abs(b[k] - next[k]) < 0.005) ? b : next,
      );
    };
    // Section for viewport changes; the copy blocks re-measure as their web fonts swap in
    const ro = new ResizeObserver(measure);
    [section, nameEl, introEl, tagEl].forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [tier, scope]);

  return (
    <section
      id="home"
      ref={scope}
      data-theme="paper"
      className="grid-paper relative isolate flex h-[100svh] min-h-[720px] flex-col overflow-hidden outline-none"
      aria-label="Introduction"
    >
      <h1 className="sr-only">
        {profile.fullName} — {profile.role} based in {profile.location}
      </h1>

      {/* soft vignette for depth */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_45%,transparent_40%,rgb(var(--paper-2)/0.9)_100%)]" />

      <div className="frame relative flex min-h-0 flex-1 flex-col pb-8 pt-[calc(var(--nav-h)+1.5rem)] md:pb-10">
        {/* meta row */}
        <div className="label relative z-20 flex items-start justify-between gap-4 text-ink" data-hero-fade>
          <span className="max-w-[16ch] leading-relaxed">
            <span className="text-crimson">●</span> {profile.role}
          </span>
          <span className="hidden text-center leading-relaxed sm:block">
            {profile.yearsExperience} years
            <br />
            in production
          </span>
          <span className="text-right leading-relaxed">
            Portfolio
            <br />— {new Date().getFullYear()}
          </span>
        </div>

        {/* giant name — layered over the 3D scene, which arranges itself around it */}
        <div
          ref={name}
          className="pointer-events-none relative z-[15] mt-[5vh] select-none text-crimson md:mt-[3vh]"
          aria-hidden="true"
        >
          <div data-hero-line="1" className="display text-[min(23vw,30vh)] md:text-[min(17vw,19.5vh)]">
            <Chars text="Rajkiran" />
          </div>
          <div data-hero-line="2" className="display -mt-[1.5vw] text-right text-[min(23vw,30vh)] md:text-[min(17vw,19.5vh)]">
            <Chars text="Jaiswar" />
          </div>
        </div>

        {/* bottom: intro + CTAs */}
        <div className="relative z-20 mt-auto grid items-end gap-8 pt-6 md:grid-cols-[1fr_auto]">
          <div ref={intro} className="pointer-events-none max-w-[30rem]">
            <p className="font-serif text-[1.3rem] italic leading-snug text-ink md:text-[1.55rem]" data-hero-fade>
              {profile.intro}
            </p>
            <div className="pointer-events-auto mt-7 flex flex-wrap gap-3" data-hero-fade>
              <MagneticButton
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('projects');
                }}
                icon={<ArrowDown size={18} />}
              >
                View projects
              </MagneticButton>
              <MagneticButton
                href="#contact"
                variant="ghost"
                className="bg-paper/80 text-ink"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('contact');
                }}
              >
                Contact me
              </MagneticButton>
            </div>
          </div>

          <div className="hidden items-end gap-5 md:flex" data-hero-fade>
            {/* no backdrop-blur here: over a live canvas it re-blurs every frame */}
            <div ref={tag} className="label rounded-sm bg-paper/90 px-3 py-2 text-right leading-relaxed text-ash">
              {tier !== 'none' && (
                <span className="mb-1 hidden items-center justify-end gap-2 text-crimson lg:flex">
                  <MousePointerClick size={13} /> Click the floating windows
                </span>
              )}
              Based in {profile.location}
              <br />
              {profile.availability}
            </div>
            <Crest size={112} />
          </div>
        </div>
      </div>

      {/* 3D scene layer — below the name and copy; on desktop it runs behind the band so the desk legs tuck under it */}
      <div
        ref={sceneLayer}
        data-hero-scene
        className="absolute inset-x-0 top-[25%] z-10 h-[43%] [mask-image:linear-gradient(to_bottom,black_78%,transparent)] md:inset-auto md:bottom-[5%] md:left-[24%] md:right-0 md:top-[9%] md:h-auto md:[mask-image:none]"
      >
        <div data-hero-scene-inner className="absolute inset-0">
          {tier === 'none' ? (
            <HeroFallback />
          ) : (
            ready && (
              <Suspense fallback={<HeroFallback />}>
                <HeroScene tier={tier} reduce={reduce} bounds={bounds} />
              </Suspense>
            )
          )}
        </div>
      </div>

      {/* torn edge into the crimson skills band */}
      <div ref={band} className="relative z-20 -mb-px">
        <TornEdge className="text-crimson" seed={11} />
        <div className="on-crimson bg-crimson py-3 text-paper md:py-4" data-theme="crimson">
          <Marquee
            items={marqueeWords}
            duration={36}
            itemClassName="display text-2xl tracking-wide md:text-[2.1rem]"
          />
        </div>
      </div>
    </section>
  );
}
