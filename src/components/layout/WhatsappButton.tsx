import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { WhatsappIcon } from '@/components/ui/Icons';
import { socials } from '@/data/profile';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

const whatsapp = socials.find((s) => s.label === 'WhatsApp')!;
const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Floating WhatsApp shortcut pinned bottom-right once the preloader is gone.
 * It steps aside while the footer is on screen: the footer already has a
 * WhatsApp icon and the back-to-top disc in that corner, and a crimson disc
 * would vanish against the crimson footer anyway.
 * z-[92]: above the grain (90), below the mobile menu (95) and navbar (100).
 */
export function WhatsappButton({ ready }: { ready: boolean }) {
  const reduce = usePrefersReducedMotion();
  const [overFooter, setOverFooter] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const io = new IntersectionObserver(([entry]) => setOverFooter(entry.isIntersecting));
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  const hidden = reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: 24 };

  return (
    <AnimatePresence>
      {ready && !overFooter && (
        <motion.a
          key="whatsapp"
          href={whatsapp.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp (opens in a new tab)"
          initial={hidden}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={hidden}
          transition={{ duration: 0.5, ease }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="group fixed bottom-5 right-5 z-[92] grid h-14 w-14 place-items-center rounded-full bg-crimson text-paper shadow-[0_12px_30px_-12px_rgb(17_14_14/0.6)] md:bottom-8 md:right-8"
        >
          <span className="pulse-ring absolute inset-0 rounded-full bg-crimson group-hover:hidden" aria-hidden="true" />
          <WhatsappIcon size={26} className="relative" />
          {/* hover-capable devices only, so a tap on a phone doesn't leave it stuck open */}
          <span
            className="label pointer-events-none absolute right-full mr-3 hidden translate-x-2 [@media(hover:hover)]:block whitespace-nowrap rounded-full border border-paper/15 bg-ink px-4 py-2.5 text-paper opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
            aria-hidden="true"
          >
            Chat on WhatsApp
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
