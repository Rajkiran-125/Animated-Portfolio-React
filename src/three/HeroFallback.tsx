import { useTheme } from '@/theme/theme';
import { THEMES } from '@/theme/themes';

// Page tokens where they exist; illustration-only shades come from the theme palette
const ink = 'rgb(var(--ink))';
const paper = 'rgb(var(--paper))';
const accent = 'rgb(var(--accent))';

/**
 * Flat, ink-outlined SVG of the same workspace. Used as the Suspense
 * placeholder and as the permanent hero art when WebGL is unavailable.
 */
export function HeroFallback() {
  const { scene, code } = THEMES[useTheme()];
  const line = (x: number, y: number, w: number, c = code.text) => <rect x={x} y={y} width={w} height="7" rx="3.5" fill={c} />;
  return (
    // Bottom-anchored and capped in height so it stays clear of the name above
    <div className="absolute inset-0 flex items-end justify-center md:pb-[7vh]" aria-hidden="true">
      <svg
        viewBox="0 0 900 560"
        className="w-[min(92vw,820px)] md:h-[46%] md:w-auto md:max-w-full"
        fill="none"
        stroke={ink}
        strokeWidth="4"
        strokeLinejoin="round"
      >
        {/* floating windows */}
        <g transform="translate(40 70) rotate(-6)">
          <rect width="200" height="128" rx="6" fill={code.bg} />
          <rect width="200" height="24" rx="6" fill={code.bar} stroke="none" />
          <circle cx="16" cy="12" r="4" fill={accent} stroke="none" />
          {line(18, 44, 120, code.keyword)}
          {line(18, 62, 150)}
          {line(30, 80, 100, code.string)}
          {line(18, 98, 70)}
        </g>
        <g transform="translate(680 40) rotate(5)">
          <rect width="190" height="120" rx="6" fill={code.bg} />
          <rect width="190" height="24" rx="6" fill={code.bar} stroke="none" />
          <circle cx="16" cy="12" r="4" fill={accent} stroke="none" />
          {line(18, 44, 140, code.keyword)}
          {line(18, 62, 90)}
          {line(30, 80, 120)}
        </g>
        {/* database */}
        <g transform="translate(760 300)">
          {[0, 30, 60].map((y, i) => (
            <g key={y} transform={`translate(0 ${-y})`}>
              <path d="M0 0 v24 a40 12 0 0 0 80 0 v-24" fill={i === 1 ? paper : accent} />
              <ellipse cx="40" cy="0" rx="40" ry="12" fill={i === 1 ? paper : accent} />
            </g>
          ))}
        </g>
        {/* monitor */}
        <rect x="280" y="90" width="330" height="210" rx="8" fill={scene.ink} />
        <rect x="294" y="104" width="302" height="182" rx="3" fill={code.bg} />
        {line(312, 124, 150, code.keyword)}
        {line(312, 144, 210)}
        {line(312, 164, 180)}
        {line(330, 184, 230, code.string)}
        {line(330, 204, 160)}
        {line(312, 224, 120)}
        {line(312, 244, 90, code.keyword)}
        <rect x="430" y="300" width="30" height="62" fill={scene.ink} />
        <rect x="395" y="360" width="100" height="12" rx="3" fill={scene.ink} />
        {/* lamp */}
        <path d="M170 372 l20 -150 l70 -40" />
        <path d="M232 170 l60 30 l-40 50 z" fill={accent} />
        <ellipse cx="180" cy="374" rx="34" ry="8" fill={scene.ink} />
        {/* mug */}
        <path d="M232 330 h40 v40 a6 6 0 0 1 -6 6 h-28 a6 6 0 0 1 -6 -6z" fill={accent} />
        <path d="M272 340 a12 12 0 0 1 0 24" />
        {/* laptop */}
        <path d="M640 260 l130 -10 l8 100 l-130 12 z" fill={scene.bone} />
        <path d="M650 270 l110 -9 l6 80 l-110 10 z" fill={code.bg} stroke="none" />
        <path d="M628 372 l170 -14 l20 16 l-170 14 z" fill={scene.bone} />
        {/* keyboard */}
        <rect x="330" y="384" width="220" height="18" rx="4" fill={paper} />
        {/* desk */}
        <rect x="90" y="374" width="740" height="22" rx="3" fill={scene.ink} />
        <path d="M120 396 v150 M800 396 v150" strokeWidth="10" />
      </svg>
    </div>
  );
}
