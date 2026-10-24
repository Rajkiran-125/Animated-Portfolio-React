import { ArrowUpRight, Lock } from 'lucide-react';
import { useGsap } from '@/animations/useGsap';
import { registerReveals } from '@/animations/reveals';
import { GithubIcon } from '@/components/ui/Icons';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { SplitWords } from '@/components/ui/SplitWords';
import { TiltFrame } from '@/components/ui/TiltFrame';
import { TornEdge } from '@/components/ui/TornEdge';
import { projects, socials } from '@/data/profile';
import { gsap } from '@/lib/gsap';
import type { Project } from '@/types';

const github = socials.find((s) => s.label === 'GitHub')!;

function Preview({ project }: { project: Project }) {
  const img = (
    <TiltFrame className="w-full">
      <div className="flex aspect-[16/11] flex-col overflow-hidden rounded-md border-2 border-ink bg-ink shadow-[10px_10px_0_rgb(var(--ink))]">
        <div className="flex items-center gap-1.5 px-3 py-2.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-crimson" />
          <span className="h-2.5 w-2.5 rounded-full bg-paper/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-paper/30" />
          <span className="label ml-3 truncate text-[0.62rem] text-paper/60">
            {project.liveUrl ? project.liveUrl.replace(/^https:\/\//, '') : 'internal · company product'}
          </span>
        </div>
        <div className="relative flex-1 overflow-hidden bg-white">
          <img
            src={project.image.src}
            alt={project.image.alt}
            width={project.image.width}
            height={project.image.height}
            loading="lazy"
            decoding="async"
            className="proj-img absolute inset-0 h-full w-full scale-[1.04] object-cover object-left-top transition-transform duration-700 group-hover:scale-100"
          />
          <div className="absolute inset-0 bg-crimson/20 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0" />
        </div>
      </div>
    </TiltFrame>
  );

  return project.liveUrl ? (
    <a
      href={project.liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full"
      data-cursor="view"
      data-cursor-label="Visit"
      aria-label={`Open ${project.title} live demo (opens in a new tab)`}
    >
      {img}
    </a>
  ) : (
    <div className="group w-full">{img}</div>
  );
}

function ProjectPanel({ project }: { project: Project }) {
  return (
    <article
      className="proj-panel on-paper relative grid w-full shrink-0 gap-8 rounded-sm bg-paper p-5 text-ink sm:p-8 lg:grid-cols-[1.25fr_1fr] lg:gap-10 lg:p-10 lg:motion-safe:h-[min(76vh,700px)] lg:motion-safe:w-[min(84vw,1180px)]"
      data-theme="paper"
      aria-labelledby={`proj-${project.id}`}
    >
      <div className="relative flex items-center">
        <Preview project={project} />
      </div>

      <div className="flex min-h-0 flex-col">
        <div className="flex items-start justify-between gap-4">
          <span className="display outline-text text-6xl text-ink md:text-7xl">{project.index}</span>
          <span className="label mt-2 text-right text-ash">{project.context}</span>
        </div>
        <h3 id={`proj-${project.id}`} className="display mt-4 text-[clamp(2.4rem,4.4vw,4.2rem)] text-crimson">
          {project.title}
        </h3>
        <p className="font-serif text-xl italic text-ink/80 md:text-2xl">{project.subtitle}</p>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/80">{project.summary}</p>
        <ul className="mt-4 space-y-1.5 text-sm leading-snug text-ink/75">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-2.5">
              <span className="mt-[0.45em] h-1.5 w-1.5 shrink-0 bg-crimson" aria-hidden />
              {h}
            </li>
          ))}
        </ul>
        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Tech stack">
          {project.stack.map((t) => (
            <li key={t} className="chip border-ink/25 text-ink/80">
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-6">
          {project.liveUrl ? (
            <MagneticButton href={project.liveUrl} external variant="ink" ariaLabel={`${project.title} live demo (opens in a new tab)`}>
              Live demo
            </MagneticButton>
          ) : (
            <p className="label inline-flex items-center gap-2 text-ash">
              <Lock size={14} /> Proprietary product — no public link
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export function Projects() {
  const scope = useGsap<HTMLElement>(({ reduce, scope }) => {
    registerReveals(scope, reduce);
    const mm = gsap.matchMedia();
    // Horizontal pinned gallery only where there is room and motion is welcome
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const track = scope.querySelector<HTMLElement>('.proj-track')!;
      const distance = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: '.proj-pin',
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      gsap.to('.proj-progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: '.proj-pin', start: 'top top', end: () => `+=${distance()}`, scrub: true },
      });
      // Each panel tilts in as it enters the viewport inside the horizontal track
      gsap.utils.toArray<HTMLElement>('.proj-panel').forEach((panel) => {
        gsap.from(panel, {
          rotate: 3,
          yPercent: 6,
          ease: 'none',
          scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left right', end: 'left 35%', scrub: true },
        });
      });
    });
    return () => mm.revert();
  });

  return (
    <section id="projects" ref={scope} data-theme="crimson" className="on-crimson relative bg-crimson text-paper outline-none" aria-labelledby="projects-title">
      <div className="bg-ink">
        <TornEdge className="text-crimson" seed={23} />
      </div>

      <div className="proj-pin relative overflow-hidden lg:motion-safe:flex lg:motion-safe:h-[100svh] lg:motion-safe:items-center">
        <div className="proj-track flex flex-col gap-8 px-[var(--gutter)] pb-24 pt-16 motion-reduce:mx-auto motion-reduce:max-w-frame lg:motion-safe:flex-row lg:motion-safe:items-center lg:motion-safe:gap-[4vw] lg:motion-safe:py-0">
          {/* intro panel */}
          <div className="shrink-0 lg:motion-safe:w-[38vw]">
            <SectionLabel index="03" title="Selected work" />
            <h2 id="projects-title" className="display mt-8 text-[clamp(4rem,10vw,10rem)]" data-split>
              <SplitWords text="Things I've built" />
            </h2>
            <p className="mt-6 max-w-sm text-lg text-paper/85" data-reveal="up">
              A company platform, a live NGO portal and a real-time app — each one full stack, end to end.
            </p>
            <p className="label mt-10 hidden items-center gap-3 text-paper/80 lg:motion-safe:flex">
              Scroll <span className="inline-block h-px w-16 bg-paper/70" /> →
            </p>
          </div>

          {projects.map((p) => (
            <ProjectPanel key={p.id} project={p} />
          ))}

          {/* outro panel */}
          <div className="flex shrink-0 flex-col items-start justify-center gap-6 py-10 lg:motion-safe:w-[30vw] lg:motion-safe:py-0">
            <GithubIcon size={56} />
            <p className="display text-[clamp(2.8rem,5vw,4.5rem)]">More on GitHub</p>
            <p className="max-w-xs text-paper/85">Experiments, practice projects and source code.</p>
            <MagneticButton href={github.href} external variant="paper" icon={<ArrowUpRight size={18} />}>
              {github.handle}
            </MagneticButton>
          </div>
        </div>

        {/* scroll progress */}
        <div className="absolute inset-x-[var(--gutter)] bottom-8 hidden h-[2px] bg-paper/25 lg:motion-safe:block" aria-hidden="true">
          <div className="proj-progress h-full origin-left scale-x-0 bg-paper" />
        </div>
      </div>
    </section>
  );
}
