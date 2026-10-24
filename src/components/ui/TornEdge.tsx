import { useMemo } from 'react';

interface Props {
  /** Tailwind text-* colour class; the paper is filled with currentColor */
  className?: string;
  flip?: boolean;
  seed?: number;
  height?: number;
}

// Deterministic PRNG so the rip is identical between server/client renders.
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildRip(seed: number) {
  const rand = mulberry32(seed);
  const pts: string[] = [];
  let x = 0;
  while (x < 1000) {
    const y = 18 + rand() * 26 + (rand() > 0.85 ? rand() * 14 : 0);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    x += 6 + rand() * 18;
  }
  pts.push('1000,30');
  return `M0,60 L0,30 L${pts.join(' L')} L1000,60 Z`;
}

/** A torn-paper edge used to stitch sections together. */
export function TornEdge({ className = 'text-crimson', flip = false, seed = 7, height = 48 }: Props) {
  const d = useMemo(() => buildRip(seed), [seed]);
  const fiber = useMemo(() => buildRip(seed + 1), [seed]);
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 60"
      preserveAspectRatio="none"
      className={`pointer-events-none block w-full ${className}`}
      style={{ height, transform: flip ? 'scaleY(-1)' : undefined }}
    >
      {/* paper fibre: a lighter rip underneath gives the white torn lip */}
      <path d={fiber} fill="rgb(var(--paper))" opacity="0.9" transform="translate(0,-5)" />
      <path d={d} fill="currentColor" />
    </svg>
  );
}
