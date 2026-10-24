/**
 * Flat, ink-outlined SVG of the same workspace. Used as the Suspense
 * placeholder and as the permanent hero art when WebGL is unavailable.
 */
export function HeroFallback() {
  const ink = 'rgb(17 14 14)';
  const line = (x: number, y: number, w: number, c = '#efe7da') => <rect x={x} y={y} width={w} height="7" rx="3.5" fill={c} />;
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
          <rect width="200" height="128" rx="6" fill="#141010" />
          <rect width="200" height="24" rx="6" fill="#1f1919" stroke="none" />
          <circle cx="16" cy="12" r="4" fill="#e21b23" stroke="none" />
          {line(18, 44, 120, '#ff4b53')}
          {line(18, 62, 150)}
          {line(30, 80, 100, '#f2c14e')}
          {line(18, 98, 70)}
        </g>
        <g transform="translate(680 40) rotate(5)">
          <rect width="190" height="120" rx="6" fill="#141010" />
          <rect width="190" height="24" rx="6" fill="#1f1919" stroke="none" />
          <circle cx="16" cy="12" r="4" fill="#e21b23" stroke="none" />
          {line(18, 44, 140, '#ff4b53')}
          {line(18, 62, 90)}
          {line(30, 80, 120)}
        </g>
        {/* database */}
        <g transform="translate(760 300)">
          {[0, 30, 60].map((y, i) => (
            <g key={y} transform={`translate(0 ${-y})`}>
              <path d="M0 0 v24 a40 12 0 0 0 80 0 v-24" fill={i === 1 ? '#efe7da' : '#e21b23'} />
              <ellipse cx="40" cy="0" rx="40" ry="12" fill={i === 1 ? '#efe7da' : '#e21b23'} />
            </g>
          ))}
        </g>
        {/* monitor */}
        <rect x="280" y="90" width="330" height="210" rx="8" fill="rgb(27 22 22)" />
        <rect x="294" y="104" width="302" height="182" rx="3" fill="#141010" />
        {line(312, 124, 150, '#ff4b53')}
        {line(312, 144, 210)}
        {line(312, 164, 180)}
        {line(330, 184, 230, '#f2c14e')}
        {line(330, 204, 160)}
        {line(312, 224, 120)}
        {line(312, 244, 90, '#ff4b53')}
        <rect x="430" y="300" width="30" height="62" fill="rgb(27 22 22)" />
        <rect x="395" y="360" width="100" height="12" rx="3" fill="rgb(27 22 22)" />
        {/* lamp */}
        <path d="M170 372 l20 -150 l70 -40" />
        <path d="M232 170 l60 30 l-40 50 z" fill="#e21b23" />
        <ellipse cx="180" cy="374" rx="34" ry="8" fill="rgb(27 22 22)" />
        {/* mug */}
        <path d="M232 330 h40 v40 a6 6 0 0 1 -6 6 h-28 a6 6 0 0 1 -6 -6z" fill="#e21b23" />
        <path d="M272 340 a12 12 0 0 1 0 24" />
        {/* laptop */}
        <path d="M640 260 l130 -10 l8 100 l-130 12 z" fill="#d9cfc0" />
        <path d="M650 270 l110 -9 l6 80 l-110 10 z" fill="#141010" stroke="none" />
        <path d="M628 372 l170 -14 l20 16 l-170 14 z" fill="#d9cfc0" />
        {/* keyboard */}
        <rect x="330" y="384" width="220" height="18" rx="4" fill="#efe7da" />
        {/* desk */}
        <rect x="90" y="374" width="740" height="22" rx="3" fill="rgb(27 22 22)" />
        <path d="M120 396 v150 M800 396 v150" strokeWidth="10" />
      </svg>
    </div>
  );
}
