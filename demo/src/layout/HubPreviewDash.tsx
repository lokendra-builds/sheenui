import type { ReactNode } from "react";

import type { PreviewKind } from "./HubPreview";

/** One miniature per dashboard, drawn from that dashboard's own KPI row and chart shapes (traffic area + sources, MRR steps + plan ring, orders columns + products, funnel + cohort, candlesticks + price line). */
export function DashMini({ kind, clipId }: { kind: PreviewKind; clipId: string }) {
  const kpi = (x: number, w: number, k: number) => (
    <rect key={x} x={x} y="3" width={w} height="11" rx="3" fill="var(--sheen-accent)" opacity={0.18 + k * 0.08} />
  );
  const draw = (children: ReactNode) => (
    <>
      <defs>
        <clipPath id={clipId}>
          <rect className="hubp-draw" x="0" y="0" width="160" height="84" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>{children}</g>
    </>
  );
  const accent = "var(--sheen-accent)";
  const soft = "color-mix(in oklab, var(--sheen-fg) 18%, transparent)";
  let body: ReactNode;
  switch (kind) {
    case "dash-web":
      body = (
        <>
          {[4, 56, 108].map((x, k) => kpi(x, 48, k))}
          {draw(
            <>
              <path
                d="M4 70 C20 62 26 44 44 48 S70 70 88 52 108 30 122 38 L122 80 L4 80Z"
                fill={accent}
                opacity="0.18"
              />
              <path
                d="M4 70 C20 62 26 44 44 48 S70 70 88 52 108 30 122 38"
                fill="none"
                stroke={accent}
                strokeWidth="2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              {[0, 1, 2, 3].map((i) => (
                <rect
                  key={i}
                  x="130"
                  y={26 + i * 14}
                  width={[26, 20, 15, 9][i]}
                  height="7"
                  rx="3.5"
                  fill={i === 0 ? accent : soft}
                />
              ))}
            </>,
          )}
        </>
      );
      break;
    case "dash-saas":
      body = (
        <>
          {[4, 44, 84].map((x, k) => kpi(x, 36, k))}
          {draw(
            <>
              <path d="M4 66 H22 V56 H42 V48 H62 V38 H82 V30 H102 V22 H116 V80 H4Z" fill={accent} opacity="0.2" />
              <path
                d="M4 66 H22 V56 H42 V48 H62 V38 H82 V30 H102 V22 H116"
                fill="none"
                stroke={accent}
                strokeWidth="2"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              <circle cx="140" cy="52" r="14" fill="none" stroke={soft} strokeWidth="6" />
              <circle
                cx="140"
                cy="52"
                r="14"
                fill="none"
                stroke={accent}
                strokeWidth="6"
                strokeDasharray="56 88"
                transform="rotate(-90 140 52)"
              />
            </>,
          )}
        </>
      );
      break;
    case "dash-shop":
      body = (
        <>
          {[4, 56, 108].map((x, k) => kpi(x, 48, k))}
          {draw(
            <>
              {[0.5, 0.75, 0.6, 0.95, 0.7, 0.85, 0.55].map((h, i) => (
                <rect
                  key={i}
                  x={4 + i * 15}
                  y={80 - 50 * h}
                  width="10"
                  height={50 * h}
                  rx="2.5"
                  fill={accent}
                  opacity={0.45 + h * 0.5}
                />
              ))}
              {[0, 1, 2].map((i) => (
                <rect key={i} x="116" y={24 + i * 18} width="40" height="13" rx="4" fill={soft} />
              ))}
            </>,
          )}
        </>
      );
      break;
    case "dash-product":
      body = (
        <>
          {[4, 56, 108].map((x, k) => kpi(x, 48, k))}
          {draw(
            <>
              {[64, 50, 36, 22].map((w, i) => (
                <rect
                  key={i}
                  x={4 + (64 - w) / 2}
                  y={22 + i * 14}
                  width={w}
                  height="10"
                  rx="3"
                  fill={accent}
                  opacity={0.9 - i * 0.18}
                />
              ))}
              {Array.from({ length: 12 }, (_, i) => (
                <rect
                  key={i}
                  x={84 + (i % 4) * 19}
                  y={22 + Math.floor(i / 4) * 19}
                  width="16"
                  height="16"
                  rx="3.5"
                  fill={accent}
                  opacity={0.15 + ((i * 7) % 10) / 14}
                />
              ))}
            </>,
          )}
        </>
      );
      break;
    default:
      body = (
        <>
          {[4, 56, 108].map((x, k) => kpi(x, 48, k))}
          {draw(
            <>
              {[
                [18, 60, 44, 70, 52],
                [34, 52, 30, 58, 40],
                [50, 46, 36, 54, 42],
                [66, 38, 24, 48, 28],
                [82, 30, 22, 42, 36],
                [98, 36, 28, 46, 32],
                [114, 24, 16, 40, 20],
              ].map(([x = 0, hi = 0, o = 0, lo = 0, c = 0], i) => (
                <g
                  key={x}
                  stroke={i % 3 === 1 ? "var(--sheen-danger, #e5484d)" : "var(--sheen-success)"}
                  fill={i % 3 === 1 ? "var(--sheen-danger, #e5484d)" : "var(--sheen-success)"}
                >
                  <line x1={x + 4} x2={x + 4} y1={hi} y2={lo + 12} strokeWidth="1.6" />
                  <rect x={x} y={Math.min(o, c) + 12} width="8" height={Math.abs(o - c) + 4} rx="1.5" />
                </g>
              ))}
              <path
                d="M130 62 L140 54 L150 58 L158 40"
                fill="none"
                stroke={accent}
                strokeWidth="2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </>,
          )}
        </>
      );
  }
  return (
    <svg viewBox="0 0 160 84" preserveAspectRatio="xMidYMid meet" className="hubp-dm">
      {body}
    </svg>
  );
}
