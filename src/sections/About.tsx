import { Download, FileText } from 'lucide-react';
import { useGsap } from '@/animations/useGsap';
import { registerReveals } from '@/animations/reveals';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Crest } from '@/components/ui/Crest';
import { profile, stats } from '@/data/profile';
import { gsap } from '@/lib/gsap';
import { openResume } from '@/lib/resume';

const STATEMENT =
  'Full stack developer building scalable, production-ready web apps — from the stored procedure to the last pixel.';
const ACCENT = new Set(['scalable,', 'production-ready', 'pixel.']);

export function About() {
  const scope = useGsap<HTMLElement>(({ reduce, scope }) => {
    registerReveals(scope, reduce);
    if (reduce) return;

    // Statement: words ink in as you read down the page
    gsap.fromTo(
      '.stmt-word',
      { opacity: 0.14 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: { trigger: '.stmt', start: 'top 80%', end: 'bottom 45%', scrub: true },
      },
    );

    // Portrait: image drifts inside its frame
    gsap.fromTo(
      '.portrait-img',
      { yPercent: -8, scale: 1.12 },
      { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.portrait', start: 'top bottom', end: 'bottom top', scrub: true } },
    );
    gsap.fromTo(
      '.about-ghost',
      { xPercent: 8 },
      { xPercent: -18, ease: 'none', scrollTrigger: { trigger: scope, start: 'top bottom', end: 'bottom top', scrub: true } },
    );

    // Count-up on the numeric part of each stat
    scope.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count);
      const obj = { v: 0 };
      gsap.to(obj, {
        v: end,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => {
          el.textContent = String(Math.round(obj.v));
        },
      });
    });
  });

  return (
    <section id="about" ref={scope} data-surface="paper" className="relative overflow-hidden bg-paper py-24 outline-none md:py-36" aria-labelledby="about-title">
      <div
        className="about-ghost display outline-text pointer-events-none absolute -right-[5vw] top-10 select-none whitespace-nowrap text-[26vw] text-ink/[0.07]"
        aria-hidden="true"
      >
        About me
      </div>

      <div className="frame relative">
        <SectionLabel index="01" title="About" className="text-accent" />
        <h2 id="about-title" className="sr-only">
          About {profile.fullName}
        </h2>

        <p className="stmt mt-10 max-w-[22ch] font-sans text-[clamp(2rem,5vw,4.6rem)] font-semibold leading-[1.02] tracking-tight md:mt-14">
          {STATEMENT.split(' ').map((w, i) => (
            <span key={i} className={`stmt-word ${ACCENT.has(w) ? 'text-accent' : ''}`}>
              {w}{' '}
            </span>
          ))}
        </p>

        <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-12 md:gap-10">
          {/* Portrait */}
          <div className="relative md:col-span-5">
            <figure
              className="portrait group relative aspect-[4/5] overflow-hidden rounded-[2px] bg-ink shadow-[12px_12px_0_rgb(var(--ink))]"
              data-reveal="clip"
              data-cursor="none"
            >
              <img
                src={profile.portrait}
                alt={`Portrait of ${profile.fullName}`}
                width={900}
                height={915}
                loading="lazy"
                decoding="async"
                className="portrait-img h-full w-full object-cover"
              />
              <figcaption className="label absolute bottom-4 left-4 bg-paper px-2.5 py-1.5 text-ink">
                {profile.fullName} — {profile.location}
              </figcaption>
            </figure>
            <Crest tone="ink" size={120} className="absolute -right-4 -top-10 md:-right-10" ring="HELLO • NAMASTE • HELLO • NAMASTE • " />
          </div>

          {/* Copy */}
          <div className="flex flex-col justify-between md:col-span-6 md:col-start-7">
            <div className="space-y-6 text-lg leading-relaxed text-ink/85 md:text-xl">
              <p data-reveal="up">{profile.summary}</p>
              {profile.aboutParagraphs.map((p) => (
                <p key={p} data-reveal="up">
                  {p}
                </p>
              ))}
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-4 border-t-2 border-ink pt-8">
              {stats.map((s) => {
                const n = parseInt(s.value, 10);
                const suffix = s.value.replace(String(n), '');
                return (
                  <div key={s.label} data-reveal="up">
                    <dt className="sr-only">{s.label}</dt>
                    <dd>
                      <span className="display block text-[clamp(3rem,7vw,5.5rem)] text-accent">
                        <span data-count={n}>{n}</span>
                        {suffix}
                      </span>
                      <span className="label mt-2 block leading-relaxed text-ash" aria-hidden="true">
                        {s.label}
                      </span>
                    </dd>
                  </div>
                );
              })}
            </dl>

            <div className="mt-10 flex flex-wrap gap-3" data-reveal="up">
              <MagneticButton onClick={openResume} variant="ink" icon={<FileText size={17} />}>
                Résumé
              </MagneticButton>
              <MagneticButton href={profile.resumeUrl} download variant="ghost" icon={<Download size={17} />} ariaLabel="Download résumé (PDF)">
                Download
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
