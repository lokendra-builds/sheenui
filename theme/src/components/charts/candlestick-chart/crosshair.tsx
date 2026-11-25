import { clamp } from "../chart-utils";
import { PILL_H as pillH } from "./model";

/** The crosshair: a vertical line, a horizontal one at the read price, and the price and date tags on the axes. */
export function Crosshair({
  x,
  priceH,
  gap,
  volH,
  innerW,
  tagW,
  crossPy,
  crossPrice,
  priceText,
  dateTagLeft,
  dateW,
  dateText,
}: {
  /** Horizontal position of the read candle. */
  x: number;
  priceH: number;
  gap: number;
  volH: number;
  innerW: number;
  /** Width of the price tag on the axis. */
  tagW: number;
  crossPy: number | null;
  crossPrice: number | null;
  priceText: (value: number) => string;
  dateTagLeft: number;
  dateW: number;
  dateText: string;
}) {
  return (
    <g pointerEvents="none">
      <line x1={x} x2={x} y1={0} y2={priceH + gap + volH} stroke="var(--sheen-fg-subtle)" strokeDasharray="2 3" />
      {crossPy !== null && crossPrice !== null && (
        <>
          <line x1={0} x2={innerW} y1={crossPy} y2={crossPy} stroke="var(--sheen-fg-subtle)" strokeDasharray="2 3" />
          <g transform={`translate(${innerW + 2},${clamp(crossPy, pillH / 2, priceH - pillH / 2) - pillH / 2})`}>
            <rect width={tagW} height={pillH} rx={5} className="fill-sheen-fg" />
            <text
              x={6}
              y={pillH / 2}
              dy="0.34em"
              className="text-2xs font-semibold tabular-nums"
              style={{ fill: "var(--sheen-chart-surface)" }}
            >
              {priceText(crossPrice)}
            </text>
          </g>
        </>
      )}
      <g transform={`translate(${dateTagLeft},${priceH + gap + volH + 5})`}>
        <rect width={dateW} height={pillH} rx={5} className="fill-sheen-fg" />
        <text
          x={dateW / 2}
          y={pillH / 2}
          dy="0.34em"
          textAnchor="middle"
          className="text-2xs font-semibold"
          style={{ fill: "var(--sheen-chart-surface)" }}
        >
          {dateText}
        </text>
      </g>
    </g>
  );
}
