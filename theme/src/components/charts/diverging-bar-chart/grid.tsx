import { textWidth } from "../chart-pointer";
import { edgeAnchor } from "../histogram/model";
import type { LevelInfo } from "./model";

/** What the grid needs from the chart: plot size, spine positions, axis ticks and the mirror for right-to-left. */
export type DivergingGridProps = {
  ticks: readonly { key: string; x: number; text: string }[];
  /** Indices into `ticks` whose label fits. */
  tickShown: ReadonlySet<number>;
  tickLo: number;
  tickHi: number;
  /** Maps a logical x to the drawn x (flipped in right-to-left). */
  mirrorX: (x: number) => number;
  innerW: number;
  innerH: number;
  butterfly: boolean;
  spineL: number;
  spineR: number;
  /** The two side names for the butterfly layout. */
  info: readonly Pick<LevelInfo, "key" | "label">[];
  rtl: boolean;
  showNet: boolean;
  netLabel: string;
};

/**
 * The static layer under the bars: gridlines with tick labels, the centre line or twin spines, the side names
 * over a butterfly and the "net" column heading.
 * @internal
 */
export function DivergingGrid({
  ticks,
  tickShown,
  tickLo,
  tickHi,
  mirrorX,
  innerW,
  innerH,
  butterfly,
  spineL,
  spineR,
  info,
  rtl,
  showNet,
  netLabel,
}: DivergingGridProps) {
  return (
    <>
      {ticks.map((tk, k) => {
        const x = mirrorX(tk.x);
        return (
          <g key={tk.key}>
            <line x1={x} x2={x} y1={-4} y2={innerH} stroke="var(--sheen-chart-grid)" />
            {tickShown.has(k) && (
              <text
                x={x}
                y={innerH + 16}
                textAnchor={edgeAnchor(x, textWidth(tk.text), tickLo, tickHi)}
                className="fill-sheen-fg-muted text-2xs tabular-nums"
              >
                {tk.text}
              </text>
            )}
          </g>
        );
      })}
      {butterfly ? (
        <>
          <line x1={mirrorX(spineL)} x2={mirrorX(spineL)} y1={-4} y2={innerH} stroke="var(--sheen-border)" />
          <line x1={mirrorX(spineR)} x2={mirrorX(spineR)} y1={-4} y2={innerH} stroke="var(--sheen-border)" />
          {/* Side names over each half. */}
          {info.map((l, i) => (
            <text
              key={l.key}
              x={mirrorX(i === 0 ? spineL - 4 : spineR + 4)}
              y={-10}
              textAnchor={(i === 0) !== rtl ? "end" : "start"}
              className="fill-sheen-fg text-xs font-semibold"
            >
              {l.label}
            </text>
          ))}
        </>
      ) : (
        <line x1={mirrorX(innerW / 2)} x2={mirrorX(innerW / 2)} y1={-6} y2={innerH} stroke="var(--sheen-border)" />
      )}
      {!butterfly && showNet && (
        <text
          x={rtl ? -10 : innerW + 10}
          y={-8}
          textAnchor={rtl ? "end" : "start"}
          className="fill-sheen-fg-muted text-2xs font-medium"
        >
          {netLabel}
        </text>
      )}
    </>
  );
}
