import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGsap } from '@/animations/useGsap';
import { GithubIcon, LinkedinIcon, WhatsappIcon } from '@/components/ui/Icons';
import { TornEdge } from '@/components/ui/TornEdge';
import { navItems, profile, socials } from '@/data/profile';
import { gsap, scrollToSection } from '@/lib/gsap';

function useMumbaiTime() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).format(new Date());
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = window.setInterval(() => setTime(fmt()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

export function Footer() {
  const time = useMumbaiTime();
  const year = new Date().getFullYear();

  const scope = useGsap<HTMLElement>(({ reduce, scope }) => {
    if (reduce) return;
    gsap.from('.footer-char', {
      yPercent: 100,
      stagger: 0.04,
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger: { trigger: scope.querySelector('.footer-name'), start: 'top 95%', once: true },
    });
  });

  return (
    <footer ref={scope} data-surface="accent" className="on-accent relative bg-accent text-paper">
      <div className="bg-ink">
        <TornEdge className="text-accent" seed={42} />
      </div>
      <div className="frame pb-6 pt-10 md:pt-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-12 lg:col-span-5">
            <p className="font-serif text-3xl italic leading-tight md:text-4xl">Thanks for scrolling all the way down.</p>
            <p className="label mt-4 text-paper/80">
              {profile.location} · {time} IST
            </p>
          </div>
          <nav aria-label="Footer" className="md:col-span-6 lg:col-span-3 lg:col-start-6">
            <p className="label mb-4 text-paper/70">Index</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
              {navItems.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(n.id);
                    }}
                    className="font-semibold uppercase tracking-wider underline-offset-4 hover:underline"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {/* three icons + the back-to-top disc need ~270px, hence the wider span */}
          <div className="flex items-start justify-between gap-6 md:col-span-6 lg:col-span-4">
            <div>
              <p className="label mb-4 text-paper/70">Social</p>
              <div className="flex gap-3">
                {[
                  { s: socials[0], Icon: LinkedinIcon },
                  { s: socials[1], Icon: GithubIcon },
                  { s: socials[2], Icon: WhatsappIcon },
                ].map(({ s, Icon }) => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.label} (opens in a new tab)`}
                    whileHover={{ y: -4, rotate: -8 }}
                    className="grid h-12 w-12 place-items-center rounded-full border border-paper/40 transition-colors hover:bg-paper hover:text-accent"
                  >
                    <Icon size={20} />
                  </motion.a>
                ))}
              </div>
            </div>
            <motion.button
              type="button"
              onClick={() => scrollToSection('home')}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="group grid h-20 w-20 shrink-0 place-items-center rounded-full bg-ink text-paper"
              aria-label="Back to top"
            >
              <span className="grid h-6 overflow-hidden">
                <span className="flex flex-col items-center transition-transform duration-500 group-hover:-translate-y-6">
                  <ArrowUp size={24} />
                  <ArrowUp size={24} />
                </span>
              </span>
            </motion.button>
          </div>
        </div>

        <div className="footer-name mt-14 overflow-hidden" aria-hidden="true">
          <div className="display flex justify-between text-[19.5vw] leading-[0.78] md:text-[19.8vw]">
            {profile.firstName.split('').map((c, i) => (
              <span key={i} className="footer-char inline-block">
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="label mt-6 flex flex-col justify-between gap-2 border-t border-paper/30 pt-5 text-paper/80 sm:flex-row">
          <span>
            © {year} {profile.fullName}
          </span>
          <span>Designed &amp; built from scratch — React · Three.js · GSAP</span>
        </div>
      </div>
    </footer>
  );
}
