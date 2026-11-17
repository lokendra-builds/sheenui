import type { ReactNode } from "react";

/**
 * Non-colour cues for chart series (WCAG 1.4.1): hatch fills for bars, slices and bands, dash styles
 * and marker shapes for lines. Series 0 stays solid; every later series gets its own cue.
 * Charts turn them on with `patterns`, and by default once there are more than 3 series.
 * @internal
 */
export const PATTERNS_AUTO_FROM = 4;

/** Whether a chart draws non-colour cues: the `patterns` prop, else on for more than 3 series. @internal */
export function resolvePatterns(prop: boolean | undefined, seriesCount: number): boolean {
  return prop ?? seriesCount >= PATTERNS_AUTO_FROM;
}

/** Id of the hatch pattern for series `index` (palette position). @internal */
export function patternId(id: string, index: number) {
  return `${id}-pat${index}`;
}

/** Fill for series `index`: its hatch pattern, or the plain `fallback` for the first series or when off. @internal */
export function patternFill(on: boolean, id: string, index: number, fallback: string) {
  return on && index > 0 ? `url(#${patternId(id, index)})` : fallback;
}

/** stroke-dasharray for a line series: solid first, then distinct dash rhythms. @internal */
const DASHES = [undefined, "8 4", "2 4", "10 3 2 3", "5 5", "1 4", "12 4", "3 3"] as const;

/** Dash style of series `index` (undefined = solid). @internal */
export function dashFor(on: boolean, index: number): string | undefined {
  return on ? DASHES[index % DASHES.length] : undefined;
}

/** Hatch strokes for pattern `k` inside a 8x8 tile. Eight distinct patterns; series 8 and up repeat them. */
function hatch(k: number): ReactNode {
  switch (k % 8) {
    case 1:
      return <path d="M-2 2l4-4M0 8l8-8M6 10l4-4" />;
    case 2:
      return (
        <>
          <circle cx={2} cy={2} r={1} />
          <circle cx={6} cy={6} r={1} />
        </>
      );
    case 3:
      return <path d="M-2 6l4 4M0 0l8 8M6 -2l4 4" />;
    case 4:
      return <path d="M0 4h8M4 0v8" />;
    case 5:
      return <path d="M0 2h8M0 6h8" />;
    case 6:
      return <path d="M2 0v8M6 0v8" />;
    case 7:
      return (
        <>
          <circle cx={4} cy={4} r={1.4} />
          <path d="M0 0h2M6 8h2" />
        </>
      );
    default:
      // k = 0: series 8, 16, ... (series 0 is drawn plain).
      return <path d="M0 4h3M5 0v3M8 4h-3M3 8v-3" />;
  }
}

/**
 * `<defs>` with one hatch pattern per series: the series colour with surface-coloured marks over it.
 * Put it inside the chart's `<svg>`; use `patternFill` for the shapes.
 *
 * Keyboard: none, it is decorative paint inside an SVG.
 * Accessibility: purely visual; the series are still named by the legend, tooltip and table view.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { ChartPatternDefs, patternFill } from "./chart-patterns";
 *
 * export function Bars({ id }: { id: string }) {
 *   return (
 *     <svg width={80} height={40} aria-hidden>
 *       <ChartPatternDefs id={id} entries={[{ index: 1, color: "var(--sheen-chart-2)" }]} />
 *       <rect width={40} height={40} fill={patternFill(true, id, 1, "var(--sheen-chart-2)")} />
 *     </svg>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function ChartPatternDefs({
  id,
  entries,
}: {
  id: string;
  entries: readonly { index: number; color: string }[];
}) {
  return (
    <defs>
      {entries
        .filter((e) => e.index > 0)
        .map(({ index, color }) => (
          <pattern key={index} id={patternId(id, index)} width={8} height={8} patternUnits="userSpaceOnUse">
            <rect width={8} height={8} fill={color} />
            <g
              fill="var(--sheen-chart-surface)"
              stroke="var(--sheen-chart-surface)"
              strokeWidth={1.4}
              strokeOpacity={0.6}
              fillOpacity={0.6}
            >
              {hatch(index)}
            </g>
          </pattern>
        ))}
    </defs>
  );
}

/** Outline path of marker shape `index` (circle, square, triangle, diamond…) centred on 0,0 with radius `r`. @internal */
export function markerPath(index: number, r: number): string {
  const k = index % 4;
  if (k === 1) return `M${-r} ${-r}h${2 * r}v${2 * r}h${-2 * r}z`;
  if (k === 2) return `M0 ${-r * 1.2}L${r * 1.1} ${r * 0.8}H${-r * 1.1}z`;
  if (k === 3) return `M0 ${-r * 1.3}L${r * 1.3} 0L0 ${r * 1.3}L${-r * 1.3} 0z`;
  return "";
}
