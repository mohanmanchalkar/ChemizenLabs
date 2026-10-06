// Serialize at visual precision; Math.sin/cos can differ in their last bits
// between Node and the browser, which otherwise triggers hydration warnings.
const coordinate = (value: number) => value.toFixed(3);

export function ScientificArt({ variant = 0 }: { variant?: number }) {
  return (
    <svg viewBox="0 0 300 180" className="scientific-art" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth=".8" opacity=".7">
        {variant % 4 === 0 ? (
          <>
            {[0, 30, 60, 90, 120, 150].map((a) => (
              <ellipse
                key={a}
                cx="150"
                cy="90"
                rx="100"
                ry="32"
                transform={`rotate(${a} 150 90)`}
              />
            ))}
            <circle cx="150" cy="90" r="9" fill="currentColor" />
            {[30, 100, 180, 250, 310].map((a) => (
              <circle
                key={a}
                cx={coordinate(150 + Math.cos(a) * 86)}
                cy={coordinate(90 + Math.sin(a) * 68)}
                r="4"
                fill="currentColor"
              />
            ))}
          </>
        ) : variant % 4 === 1 ? (
          <>
            {[30, 60, 90, 120, 150].map((r, i) => (
              <polygon
                key={r}
                points={Array.from(
                  { length: 6 },
                  (_, j) =>
                    `${coordinate(150 + Math.cos((j * Math.PI) / 3) * r * 0.65)},${coordinate(90 + Math.sin((j * Math.PI) / 3) * r * 0.5)}`,
                ).join(" ")}
                opacity={0.3 + i * 0.13}
              />
            ))}
            <polygon
              points="212,90 177,138 111,143 93,90 124,56 181,47"
              fill="currentColor"
              fillOpacity=".15"
              strokeWidth="2"
            />
          </>
        ) : variant % 4 === 2 ? (
          <>
            {Array.from({ length: 17 }, (_, i) => (
              <g key={i}>
                <line
                  x1={36 + i * 14}
                  y1={coordinate(90 + Math.sin(i * 0.5) * 48)}
                  x2={36 + i * 14}
                  y2={coordinate(90 - Math.sin(i * 0.5) * 48)}
                />
                <circle
                  cx={36 + i * 14}
                  cy={coordinate(90 + Math.sin(i * 0.5) * 48)}
                  r="3"
                  fill="currentColor"
                />
                <circle
                  cx={36 + i * 14}
                  cy={coordinate(90 - Math.sin(i * 0.5) * 48)}
                  r="3"
                  fill="currentColor"
                />
              </g>
            ))}
          </>
        ) : (
          <>
            {Array.from({ length: 9 }, (_, i) => (
              <g key={i}>
                <line
                  x1={43 + i * 27}
                  y1="145"
                  x2={43 + i * 27}
                  y2={125 - ((i * 37) % 100)}
                  strokeWidth="9"
                  opacity={0.2 + i * 0.08}
                />
                <circle
                  cx={43 + i * 27}
                  cy={125 - ((i * 37) % 100)}
                  r="3"
                  fill="currentColor"
                />
              </g>
            ))}
            <path d="M30 150H275M30 150V25" opacity=".3" />
          </>
        )}
      </g>
    </svg>
  );
}
