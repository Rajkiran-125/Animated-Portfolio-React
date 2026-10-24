import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useRef, type MouseEvent, type ReactNode } from 'react';
import { useCanHover, usePrefersReducedMotion } from '@/hooks/useMediaQuery';

type Variant = 'accent' | 'ink' | 'paper' | 'ghost';

interface Props {
  children: ReactNode;
  href?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  variant?: Variant;
  icon?: ReactNode;
  external?: boolean;
  download?: boolean | string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  cursor?: string;
  ariaLabel?: string;
}

const styles: Record<Variant, string> = {
  accent: 'bg-accent text-paper on-accent',
  ink: 'bg-ink text-paper',
  paper: 'bg-paper text-ink',
  ghost: 'border border-current bg-transparent',
};

const fills: Record<Variant, string> = {
  accent: 'bg-ink',
  ink: 'bg-accent',
  paper: 'bg-accent',
  ghost: 'bg-ink',
};

/**
 * Magnetic pill button. Framer Motion owns all of its motion (springs on
 * motion values — no React re-renders while the pointer moves).
 */
export function MagneticButton({
  children,
  href,
  onClick,
  variant = 'accent',
  icon = <ArrowUpRight size={18} strokeWidth={2.2} />,
  external,
  download,
  type = 'button',
  disabled,
  className = '',
  cursor = 'hover',
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const canHover = useCanHover();
  const reduce = usePrefersReducedMotion();
  const magnetic = canHover && !reduce;

  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });

  const onMove = (e: MouseEvent) => {
    if (!magnetic || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.35);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.45);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const inner = (
    <>
      <motion.span
        aria-hidden
        className={`absolute inset-0 rounded-full ${fills[variant]}`}
        variants={{ rest: { scaleY: 0 }, hover: { scaleY: 1 } }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ originY: 1 }}
      />
      <span className="relative z-10">{children}</span>
      {icon && (
        <span className="relative z-10 grid h-5 w-5 place-items-center overflow-hidden">
          <motion.span
            className="grid place-items-center"
            variants={{ rest: { x: 0, y: 0 }, hover: { x: [0, 14, -14, 0], y: [0, -14, 14, 0] } }}
            transition={{ duration: 0.5, times: [0, 0.45, 0.46, 1] }}
          >
            {icon}
          </motion.span>
        </span>
      )}
    </>
  );

  const base = `relative inline-flex items-center gap-2 overflow-hidden rounded-full px-4 py-3 font-sans text-xs font-semibold uppercase tracking-wide sm:gap-3 sm:px-6 sm:py-3.5 sm:text-sm sm:tracking-wider ${styles[variant]} ${
    variant === 'ghost' ? 'hover:text-paper hover:border-ink' : ''
  } transition-colors duration-300 disabled:opacity-50 ${className}`;

  const common = {
    initial: 'rest',
    whileHover: disabled ? undefined : 'hover',
    whileTap: disabled ? undefined : { scale: 0.96 },
    className: base,
    'data-cursor': cursor,
    'aria-label': ariaLabel,
    onClick,
  } as const;

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x, y }}
      className="inline-block"
    >
      {href ? (
        <motion.a
          {...common}
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          download={download}
        >
          {inner}
        </motion.a>
      ) : (
        <motion.button {...common} type={type} disabled={disabled}>
          {inner}
        </motion.button>
      )}
    </motion.div>
  );
}
