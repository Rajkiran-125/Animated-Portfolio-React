import type { ReactNode } from 'react';

interface Props {
  items: string[];
  separator?: ReactNode;
  duration?: number;
  className?: string;
  itemClassName?: string;
  reverse?: boolean;
}

/** Infinite CSS marquee — compositor-only, pauses on hover and for reduced motion. */
export function Marquee({ items, separator = '✦', duration = 30, className = '', itemClassName = '', reverse }: Props) {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={item} className="flex items-center">
          <span className={itemClassName}>{item}</span>
          <span className="mx-6 opacity-70 md:mx-10">{separator}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`marquee overflow-hidden ${className}`}>
      <div
        className="marquee-track flex w-max"
        style={{ ['--marquee-duration' as string]: `${duration}s`, animationDirection: reverse ? 'reverse' : undefined }}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
