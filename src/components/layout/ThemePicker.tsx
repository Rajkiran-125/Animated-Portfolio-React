import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useEffect, useId, useRef, type KeyboardEvent } from 'react';
import { setTheme, useTheme } from '@/theme/theme';
import { THEME_IDS, THEMES, type ThemeId } from '@/theme/themes';

const ease = [0.16, 1, 0.3, 1] as const;
const STEP: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

/** Tri-tone dot previewing a theme — scoped with its own data-theme, so it reads that theme's tokens. */
function Swatch({ id, className = '' }: { id: ThemeId; className?: string }) {
  return <span data-theme={id} className={`theme-swatch block shrink-0 rounded-full ${className}`} aria-hidden="true" />;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Navbar colour-theme switcher: a disclosure button over a radio group.
 * Arrow keys walk the themes and apply each one as a live preview; Escape,
 * tabbing away or clicking outside closes it. The new theme is revealed from
 * the chosen option (see setTheme).
 */
export function ThemePicker({ open, onOpenChange }: Props) {
  const theme = useTheme();
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  const panelId = useId();

  // On open, focus the active theme so the arrow keys work straight away
  useEffect(() => {
    if (!open) return;
    options.current[THEME_IDS.indexOf(theme)]?.focus();
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) onOpenChange(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
    // theme is read once per opening, deliberately not a dependency
  }, [open, onOpenChange]);

  const choose = (id: ThemeId, from: HTMLElement) => {
    const r = from.getBoundingClientRect();
    setTheme(id, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && open) {
      // Don't let the navbar's Escape handler also close the mobile menu
      e.stopPropagation();
      onOpenChange(false);
      toggle.current?.focus();
      return;
    }
    const i = options.current.findIndex((el) => el === document.activeElement);
    if (i < 0) return;
    const n = THEME_IDS.length;
    const next = e.key in STEP ? (i + STEP[e.key] + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    const el = options.current[next];
    if (!el) return;
    el.focus();
    choose(THEME_IDS[next], el);
  };

  return (
    <div
      ref={root}
      className="relative"
      onKeyDown={onKeyDown}
      onBlur={(e) => {
        // Tabbing away closes it. A null relatedTarget is a click (Safari doesn't focus
        // clicked buttons) — outside clicks are handled by the pointerdown listener.
        if (open && e.relatedTarget && !root.current?.contains(e.relatedTarget)) onOpenChange(false);
      }}
    >
      <button
        ref={toggle}
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Change colour theme (current: ${THEMES[theme].label})`}
        className={`group grid h-11 w-11 place-items-center rounded-full shadow-[0_1px_0_rgb(var(--ink)/0.08)] backdrop-blur-md transition-colors sm:h-12 sm:w-12 lg:h-10 lg:w-10 ${
          open ? 'bg-ink' : 'bg-paper/80 hover:bg-paper'
        }`}
      >
        <Swatch id={theme} className="h-5 w-5 transition-transform duration-500 group-hover:rotate-180" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="radiogroup"
            aria-label="Colour theme"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.3, ease }}
            style={{ originX: 1, originY: 0 }}
            className="absolute right-0 top-full mt-3 w-60 rounded-[1.4rem] border border-ink/10 bg-paper p-1.5 text-ink shadow-[0_24px_60px_-24px_rgb(var(--ink)/0.55)]"
          >
            <p className="label px-3.5 pb-2 pt-2.5 text-ash">Theme</p>
            {THEME_IDS.map((id, i) => {
              const on = id === theme;
              return (
                <button
                  key={id}
                  ref={(el) => {
                    options.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={on ? 0 : -1}
                  onClick={(e) => choose(id, e.currentTarget)}
                  className={`relative flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-[0.8rem] font-semibold uppercase tracking-wider transition-colors duration-300 ${
                    on ? 'text-paper' : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="theme-active"
                      className="absolute inset-0 rounded-full bg-ink"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Swatch id={id} className="relative h-5 w-5" />
                  <span className="relative flex-1">{THEMES[id].label}</span>
                  {on && <Check size={15} strokeWidth={2.5} className="relative" aria-hidden />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
