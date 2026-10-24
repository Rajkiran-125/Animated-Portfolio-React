interface Props {
  size?: number;
  className?: string;
  ring?: string;
  spin?: boolean;
  tone?: 'crimson' | 'paper' | 'ink';
}

const tones = {
  crimson: { bg: 'rgb(var(--crimson))', fg: 'rgb(var(--paper))' },
  paper: { bg: 'rgb(var(--paper))', fg: 'rgb(var(--crimson))' },
  ink: { bg: 'rgb(var(--ink))', fg: 'rgb(var(--paper))' },
};

/** The "RJ" crest — a circular, mon-inspired monogram with orbiting caption. */
export function Crest({ size = 140, className = '', ring = 'FULL STACK DEVELOPER • MUMBAI • EST. 2023 • ', spin = true, tone = 'crimson' }: Props) {
  const { bg, fg } = tones[tone];
  const id = `crest-path-${tone}-${size}`;
  // Only default to `relative` when the caller hasn't positioned it — Tailwind emits
  // `.relative` after `.absolute`, so having both silently drops the absolute placement.
  const position = /\b(absolute|fixed|sticky)\b/.test(className) ? '' : 'relative ';
  return (
    <div className={`${position}${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 200 200" className={`absolute inset-0 h-full w-full ${spin ? 'spin-slow' : ''}`}>
        <defs>
          <path id={id} d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
        </defs>
        <circle cx="100" cy="100" r="98" fill={bg} />
        <text fill={fg} style={{ font: '600 13.5px "JetBrains Mono", monospace', letterSpacing: '3.2px' }}>
          <textPath href={`#${id}`}>{ring}</textPath>
        </text>
      </svg>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        <circle cx="100" cy="100" r="62" fill="none" stroke={fg} strokeWidth="2" />
        <circle cx="100" cy="100" r="55" fill="none" stroke={fg} strokeWidth="1" strokeDasharray="2 4" />
        <text x="100" y="121" textAnchor="middle" fill={fg} style={{ font: '58px Anton, Impact, sans-serif' }}>
          RJ
        </text>
      </svg>
    </div>
  );
}
