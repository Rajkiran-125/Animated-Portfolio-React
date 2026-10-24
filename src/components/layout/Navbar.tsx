import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Download } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { navItems, profile, socials } from '@/data/profile';
import { useActiveSection } from '@/hooks/useActiveSection';
import { scrollToSection } from '@/lib/gsap';
import type { SectionId } from '@/types';

const ids = navItems.map((n) => n.id);
const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Framer Motion owns everything here: show/hide on scroll direction,
 * the shared-layout active indicator, and the mobile menu overlay.
 */
export function Navbar({ ready }: { ready: boolean }) {
  const active = useActiveSection(ids);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  // Hide while scrolling down, reveal on scroll up. State flips only on direction change.
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const down = y > last && y > 240;
        setHidden((h) => (h === down ? h : down));
        last = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobile menu: lock scroll, ESC to close, move focus in and back out.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => firstLink.current?.focus(), 250);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      menuBtn.current?.focus();
    };
  }, [open]);

  const go = (id: SectionId) => (e: MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    // Let the overlay start closing before the scroll begins
    setTimeout(() => scrollToSection(id), open ? 350 : 0);
  };

  return (
    <>
      <motion.header
        initial={{ y: -110 }}
        animate={{ y: ready && (!hidden || open) ? 0 : -110 }}
        transition={{ duration: 0.7, ease }}
        className="fixed inset-x-0 top-0 z-[100]"
      >
        <div className="frame flex h-[var(--nav-h)] items-center justify-between gap-4 pt-3">
          <a
            href="#home"
            onClick={go('home')}
            className="group flex items-center gap-3 rounded-full bg-paper/80 py-1.5 pl-1.5 pr-4 text-ink shadow-[0_1px_0_rgb(17_14_14/0.08)] backdrop-blur-md"
            aria-label="Rajkiran Jaiswar — back to top"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-crimson font-display text-sm text-paper transition-transform duration-500 group-hover:rotate-[360deg]">
              RJ
            </span>
            <span className="font-display text-lg uppercase tracking-wide">
              Rajkiran<span className="text-crimson">.</span>
            </span>
          </a>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1 rounded-full bg-paper/80 p-1.5 text-ink shadow-[0_1px_0_rgb(17_14_14/0.08)] backdrop-blur-md">
              {navItems.map((item) => {
                const isActive = active === item.id;
                return (
                  <li key={item.id} className="relative">
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-full bg-ink"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <a
                      href={`#${item.id}`}
                      onClick={go(item.id)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`relative z-10 block rounded-full px-4 py-2 text-[0.8rem] font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isActive ? 'text-paper' : 'text-ink/70 hover:text-ink'
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={profile.resumeUrl}
              download
              className="hidden items-center gap-2 rounded-full bg-paper/80 px-4 py-2.5 text-[0.8rem] font-semibold uppercase tracking-wider text-ink backdrop-blur-md transition-colors hover:text-crimson md:flex"
            >
              <Download size={15} /> Resume
            </a>
            <a
              href="#contact"
              onClick={go('contact')}
              className="on-crimson hidden items-center gap-2 rounded-full bg-crimson px-5 py-2.5 text-[0.8rem] font-semibold uppercase tracking-wider text-paper transition-colors hover:bg-ink lg:flex"
            >
              Let&apos;s talk <ArrowUpRight size={15} />
            </a>
            <button
              ref={menuBtn}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className={`flex h-12 items-center gap-3 rounded-full px-5 text-[0.8rem] font-semibold uppercase tracking-wider backdrop-blur-md transition-colors lg:hidden ${
                open ? 'bg-ink text-paper' : 'bg-paper/80 text-ink'
              }`}
            >
              {open ? 'Close' : 'Menu'}
              <span className="relative block h-2.5 w-5" aria-hidden>
                <motion.span
                  className="absolute left-0 top-0 block h-[2px] w-full bg-current"
                  animate={open ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
                />
                <motion.span
                  className="absolute bottom-0 left-0 block h-[2px] w-full bg-current"
                  animate={open ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
                />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            data-theme="crimson"
            className="on-crimson fixed inset-0 z-[95] flex flex-col bg-crimson px-[var(--gutter)] pb-8 pt-28 text-paper lg:hidden"
            initial={{ clipPath: 'circle(0% at 92% 4%)' }}
            animate={{ clipPath: 'circle(150% at 92% 4%)' }}
            exit={{ clipPath: 'circle(0% at 92% 4%)' }}
            transition={{ duration: 0.65, ease }}
          >
            <nav aria-label="Mobile" className="flex-1">
              <ul className="space-y-1">
                {navItems.map((item, i) => (
                  <li key={item.id} className="overflow-hidden">
                    <motion.a
                      ref={i === 0 ? firstLink : undefined}
                      href={`#${item.id}`}
                      onClick={go(item.id)}
                      className="flex items-baseline gap-4 py-1"
                      initial={{ y: '110%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '110%' }}
                      transition={{ duration: 0.6, ease, delay: 0.12 + i * 0.05 }}
                    >
                      <span className="label opacity-70">0{i + 1}</span>
                      <span className={`display text-[clamp(3rem,14vw,5.5rem)] ${active === item.id ? 'text-ink' : ''}`}>
                        {item.label}
                      </span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>
            <motion.div
              className="label flex flex-wrap gap-x-6 gap-y-3 border-t border-paper/30 pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.45 } }}
              exit={{ opacity: 0 }}
            >
              {socials.map((s) => (
                <a key={s.label} href={s.href} target={s.label === 'Email' ? undefined : '_blank'} rel="noopener noreferrer">
                  {s.label}
                </a>
              ))}
              <a href={profile.resumeUrl} download>
                Resume ↓
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
