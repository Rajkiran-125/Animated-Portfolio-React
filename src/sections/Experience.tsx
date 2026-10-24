import { ArrowRight, Briefcase, GraduationCap, Laptop } from 'lucide-react';
import { useGsap } from '@/animations/useGsap';
import { registerReveals } from '@/animations/reveals';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { SplitWords } from '@/components/ui/SplitWords';
import { timeline } from '@/data/profile';
import { gsap, scrollToSection } from '@/lib/gsap';
import type { TimelineEntry } from '@/types';

const icons: Record<TimelineEntry['kind'], typeof Briefcase> = {
  work: Briefcase,
  freelance: Laptop,
  education: GraduationCap,
};

export function Experience() {
  const scope = useGsap<HTMLElement>(({ reduce, scope }) => {
    registerReveals(scope, reduce);
    if (reduce) {
      gsap.set('.tl-fill', { scaleY: 1 });
      scope.querySelectorAll('.tl-row').forEach((r) => r.classList.add('is-active'));
      return;
    }
    // The spine fills as you read; each node lights up when the fill reaches it
    gsap.to('.tl-fill', {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: '.tl-list', start: 'top 65%', end: 'bottom 65%', scrub: 0.4 },
    });
    gsap.utils.toArray<HTMLElement>('.tl-row').forEach((row) => {
      gsap.from(row.querySelectorAll('.tl-anim'), {
        y: 40,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: row, start: 'top 80%', once: true },
      });
      gsap.to(row, {
        scrollTrigger: { trigger: row, start: 'top 65%', toggleClass: 'is-active' },
      });
    });
  });

  return (
    <section id="experience" ref={scope} data-theme="paper" className="grid-paper relative py-24 outline-none md:py-36" aria-labelledby="experience-title">
      <div className="frame">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-7">
            <SectionLabel index="04" title="Journey" className="text-crimson" />
            <h2 id="experience-title" className="display mt-8 text-[clamp(3.6rem,10vw,9rem)]" data-split>
              <SplitWords text="Experience" />
            </h2>
          </div>
          <p className="self-end text-lg text-ink/75 md:col-span-4 md:col-start-9" data-reveal="up">
            Three-plus years of building and maintaining production systems — now at Cnergee Technologies, before that on-site in Mumbai, and as a freelancer for a US-based NGO.
          </p>
        </div>

        <div className="relative mt-16 md:mt-24">
          {/* spine */}
          <div className="absolute bottom-0 left-[15px] top-0 w-[2px] bg-ink/15 md:left-[calc(25%-1px)]" aria-hidden="true">
            <div className="tl-fill h-full w-full origin-top scale-y-0 bg-crimson" />
          </div>
        <ol className="tl-list relative">

          {timeline.map((entry, i) => {
            const Icon = icons[entry.kind];
            return (
              <li key={entry.id} className="tl-row group relative grid gap-4 pb-16 pl-12 md:grid-cols-4 md:gap-10 md:pl-0">
                {/* node */}
                <span
                  className="absolute left-0 top-1 grid h-8 w-8 place-items-center rounded-full border-2 border-ink bg-paper text-ink transition-colors duration-500 group-[.is-active]:border-crimson group-[.is-active]:bg-crimson group-[.is-active]:text-paper md:left-[calc(25%-16px)]"
                  aria-hidden="true"
                >
                  <Icon size={14} />
                </span>

                <div className="tl-anim md:pr-12 md:text-right">
                  <span className="display outline-text block text-6xl text-ink transition-colors duration-500 group-[.is-active]:text-crimson group-[.is-active]:[-webkit-text-fill-color:currentColor] md:text-7xl">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="label mt-2 block text-crimson">{entry.period}</span>
                </div>

                <div className="md:col-span-3 md:pl-12">
                  <h3 className="tl-anim display text-[clamp(2rem,4vw,3.4rem)]">{entry.role}</h3>
                  <p className="tl-anim mt-1 font-serif text-xl italic text-ink/80 md:text-2xl">
                    {entry.org} {entry.place && <span className="label not-italic text-ash">· {entry.place}</span>}
                  </p>
                  {entry.points.length > 0 && (
                    <ul className="tl-anim mt-5 max-w-3xl space-y-2.5 text-ink/80 md:text-lg">
                      {entry.points.map((p) => (
                        <li key={p} className="flex gap-3">
                          <span className="mt-[0.6em] h-[2px] w-4 shrink-0 bg-crimson" aria-hidden />
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                  {entry.stack && (
                    <ul className="tl-anim mt-5 flex flex-wrap gap-1.5" aria-label="Technologies used">
                      {entry.stack.map((s) => (
                        <li key={s} className="chip border-ink/25 bg-paper text-ink/80">
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}

          <li className="tl-row group relative grid pl-12 md:grid-cols-4 md:gap-10 md:pl-0">
            <span className="absolute left-0 top-1 grid h-8 w-8 place-items-center rounded-full border-2 border-dashed border-ink bg-paper md:left-[calc(25%-16px)]" aria-hidden="true" />
            <div className="hidden md:block" />
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('contact');
              }}
              className="tl-anim group/next inline-flex items-center gap-4 md:col-span-3 md:pl-12"
            >
              <span className="display text-[clamp(2rem,4vw,3.4rem)] text-ink/40 transition-colors group-hover/next:text-crimson">
                Next chapter — your team?
              </span>
              <ArrowRight className="text-crimson transition-transform group-hover/next:translate-x-2" size={32} />
            </a>
          </li>
        </ol>
        </div>
      </div>
    </section>
  );
}
