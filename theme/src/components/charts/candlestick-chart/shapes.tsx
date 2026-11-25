import type { ReactNode } from "react";

import { barPath } from "../chart-utils";
import type { Parsed } from "./model";

/** The geometry a candle is drawn with. @internal */
export type CandleGeometry = {
  /** `"ohlc"` draws tick bars; anything else draws candle bodies. */
  mode: string;
  step: number;
  bodyW: number;
  hollow: boolean;
  yP: (price: number) => number;
};

/** One candle (or OHLC bar): its wick and body at `cx`, in `color`. @internal */
export function candleShape(c: Parsed, cx: number, color: string, g: CandleGeometry): ReactNode {
  const { mode, step, bodyW, hollow, yP } = g;
  const isUp = c.c >= c.o;
  if (mode === "ohlc") {
    const sw = step > 6 ? 2 : 1.25;
    return (
      <>
        <line x1={cx} x2={cx} y1={yP(c.h)} y2={yP(c.l)} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line
          x1={cx - Math.max(2, bodyW / 2)}
          x2={cx}
          y1={yP(c.o)}
          y2={yP(c.o)}
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
        />
        <line
          x1={cx}
          x2={cx + Math.max(2, bodyW / 2)}
          y1={yP(c.c)}
          y2={yP(c.c)}
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
        />
      </>
    );
  }
  const top = yP(Math.max(c.o, c.c));
  const bh = Math.max(1, yP(Math.min(c.o, c.c)) - top);
  return (
    <>
      <line x1={cx} x2={cx} y1={yP(c.h)} y2={yP(c.l)} stroke={color} strokeWidth={bodyW >= 6 ? 1.5 : 1} />
      <rect
        x={cx - bodyW / 2}
        y={top}
        width={bodyW}
        height={bh}
        rx={Math.min(2, bodyW / 4)}
        fill={isUp && hollow ? `color-mix(in oklab, ${color} 16%, var(--sheen-chart-surface))` : color}
        stroke={color}
        strokeWidth={isUp && hollow ? 1.5 : 0}
        className="forced-colors:stroke-[CanvasText]"
      />
    </>
  );
}

/** The path and fill of one volume bar at `cx`, or null when the candle has no volume. @internal */
export function volumeBarShape(
  c: Parsed,
  cx: number,
  strength: number,
  color: string,
  g: { volH: number; bodyW: number; yV: (v: number) => number },
) {
  if (c.v === null) return null;
  const h = Math.max(0, g.volH - g.yV(c.v));
  return {
    d: barPath(cx - g.bodyW / 2, g.volH - h, g.bodyW, h, "top", Math.min(3, g.bodyW / 2)),
    fill: `color-mix(in oklab, ${color} ${strength}%, transparent)`,
  };
}
