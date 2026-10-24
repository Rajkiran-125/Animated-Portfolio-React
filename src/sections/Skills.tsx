import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState, type MouseEvent } from 'react';
import { useGsap } from '@/animations/useGsap';
import { registerReveals } from '@/animations/reveals';
import { Marquee } from '@/components/ui/Marquee';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { SplitWords } from '@/components/ui/SplitWords';
import { projects, skillGroups, timeline } from '@/data/profile';
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';

const ease = [0.16, 1, 0.3, 1] as const;
const pad = (n: number) => String(n).padStart(2, '0');

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/\.js$/, '')
    .replace(/ auth$/, '')
    .replace(/ \d+$/, '')
    .trim();

/** Where has a skill actually been used? Derived from real project / job stacks. */
function useUsageIndex() {
  return useMemo(() => {
    const sources = [
      ...projects.map((p) => ({ name: p.title, stack: p.stack })),
      ...timeline.filter((t) => t.stack).map((t) => ({ name: t.org.split(' ')[0], stack: t.stack! })),
    ];
    return (skill: string) => {
      const key = norm(skill);
      return [...new Set(sources.filter((s) => s.stack.some((x) => norm(x) === key)).map((s) => s.name))];
    };
  }, []);
}

function jumpTo(id: string) {
  return (e: MouseEvent) => {
    e.preventDefault();
    gsap.to(window, {
      duration: prefersReducedMotion() ? 0 : 1,
      ease: 'power3.inOut',
      scrollTo: { y: `#skills-${id}`, offsetY: 120, autoKill: true },
    });
  };
}

export function Skills() {
  const [focus, setFocus] = useState<string | null>(null);
  const usage = useUsageIndex();

  const scope = useGsap<HTMLElement>(({ reduce, scope }) => {
    registerReveals(scope, reduce);
    const groups = gsap.utils.toArray<HTMLElement>('.sk-group', scope);

    // Scroll-spy: the group being read (and its index row) lights up
    groups.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        toggleClass: { targets: [el, ...scope.querySelectorAll(`[data-sk-index="${el.dataset.skGroup}"]`)], className: 'is-active' },
      });
    });

    if (reduce) {
      gsap.set('.sk-fill', { scaleY: 1 });
      return;
    }
    gsap.to('.sk-fill', {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: '.sk-list', start: 'top 55%', end: 'bottom 55%', scrub: 0.4 },
    });
    groups.forEach((el) => {
      gsap.from(el.querySelectorAll('.sk-pill'), {
        y: 24,
        rotate: -3,
        autoAlpha: 0,
        duration: 0.8,
        ease: 'expo.out',
        stagger: 0.035,
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      });
    });
  });

  return (
    <section
      id="skills"
      ref={scope}
      data-surface="ink"
      className="relative overflow-clip bg-ink py-24 text-paper outline-none md:py-36"
      aria-labelledby="skills-title"
    >
      {/* faint accent glow for depth (section clips rather than hides overflow, so the sticky column works) */}
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[520px] w-[520px] rounded-full bg-accent/20 blur-[120px]" />

      <div className="frame relative grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionLabel index="02" title="Skills" className="text-accent" />
            <h2 id="skills-title" className="display mt-8 text-[clamp(3.6rem,9vw,8.5rem)]" data-split>
              <SplitWords text="The toolkit" accent={['toolkit']} />
            </h2>
            <p className="mt-6 max-w-sm text-lg text-paper/70" data-reveal="up">
              The stack I use day to day — hover or tap any skill to see where it has shipped.
            </p>

            {/* sticky index — follows the reader down the list */}
            <nav aria-label="Skill categories" className="relative mt-12 hidden max-w-xs pl-6 lg:block" data-reveal="up">
              <div className="absolute bottom-2 left-0 top-2 w-[2px] bg-paper/15" aria-hidden="true">
                <div className="sk-fill h-full w-full origin-top scale-y-0 bg-accent" />
              </div>
              <ol>
                {skillGroups.map((g, i) => (
                  <li key={g.id}>
                    <a
                      href={`#skills-${g.id}`}
                      onClick={jumpTo(g.id)}
                      data-sk-index={g.id}
                      className="group flex items-baseline gap-4 py-1.5 text-paper/35 transition-colors duration-500 hover:text-paper [&.is-active]:text-paper"
                    >
                      <span className="label transition-colors duration-500 group-[.is-active]:text-accent">{pad(i + 1)}</span>
                      <span className="display text-2xl transition-transform duration-500 group-[.is-active]:translate-x-1.5">{g.title}</span>
                      <span className="label ml-auto">{pad(g.skills.length)}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>

        <div className="sk-list lg:col-span-7">
          {skillGroups.map((g, i) => {
            const active = focus && g.skills.includes(focus) ? focus : null;
            const usedIn = active ? usage(active) : [];
            return (
              <article
                key={g.id}
                id={`skills-${g.id}`}
                data-sk-group={g.id}
                className="sk-group group border-t border-paper/15 pb-12 pt-10 first:border-t-0 first:pt-0 md:pb-16"
                aria-labelledby={`skills-${g.id}-title`}
              >
                <header className="flex items-end justify-between gap-6" data-reveal="up">
                  <h3 id={`skills-${g.id}-title`} className="flex items-start gap-4">
                    <span className="label mt-1 text-accent">{pad(i + 1)}</span>
                    <span className="display outline-text text-[clamp(2.6rem,5vw,4.5rem)] transition-colors duration-500 group-[.is-active]:[-webkit-text-fill-color:currentColor]">
                      {g.title}
                    </span>
                  </h3>
                  <span className="display text-5xl text-accent md:text-6xl" aria-label={`${g.skills.length} skills`}>
                    {pad(g.skills.length)}
                  </span>
                </header>

                {/* blurb doubles as the where-used readout for this group */}
                <div className="mt-4 min-h-[3.25rem] max-w-xl" aria-live="polite" data-reveal="up">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={active ?? 'blurb'}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease }}
                    >
                      {active ? (
                        <>
                          <p className="label text-accent">{active} — shipped in</p>
                          <p className="mt-1.5 text-paper md:text-lg">
                            {usedIn.length ? usedIn.join('  ·  ') : 'Part of my everyday toolkit across projects'}
                          </p>
                        </>
                      ) : (
                        <p className="text-paper/60">{g.blurb}</p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <ul className="mt-5 flex flex-wrap gap-2.5 md:gap-3">
                  {g.skills.map((skill) => {
                    const on = focus === skill;
                    return (
                      <li key={skill} className="sk-pill">
                        <motion.button
                          type="button"
                          onPointerEnter={(e) => e.pointerType === 'mouse' && setFocus(skill)}
                          onPointerLeave={(e) => e.pointerType === 'mouse' && setFocus(null)}
                          onFocus={() => setFocus(skill)}
                          onClick={() => setFocus(skill)}
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.95 }}
                          aria-pressed={on}
                          className={`rounded-full border px-4 py-2 font-display text-lg uppercase tracking-wide transition-colors duration-300 md:px-5 md:py-2.5 md:text-2xl ${
                            on ? 'border-accent bg-accent text-paper' : 'border-paper/25 text-paper hover:border-paper'
                          }`}
                        >
                          {skill}
                        </motion.button>
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-24 border-y border-paper/10 py-6 md:mt-32">
        <Marquee
          items={skillGroups.flatMap((g) => g.skills).filter((s, i, a) => a.indexOf(s) === i)}
          duration={60}
          reverse
          separator={<span className="text-accent">/</span>}
          itemClassName="display outline-text text-5xl text-paper/50 md:text-7xl"
        />
      </div>
    </section>
  );
}
