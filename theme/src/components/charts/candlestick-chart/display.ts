import type { MotionValue } from "motion/react";
import type { RefObject } from "react";

import { clamp } from "../chart-utils";

/** The displayed view and ranges the candlestick maps its marks onto. @internal */
export type DisplayTarget = {
  start: number;
  span: number;
  lo: number;
  hi: number;
  v: number;
  w: number;
  h: number;
  volH: number;
  last: number | null;
  right: number;
  pillH: number;
};

/** The animated values and layer elements `paintDisplay` reads and writes. @internal */
export type DisplayParts = {
  dS: MotionValue<number>;
  dSpan: MotionValue<number>;
  dLo: MotionValue<number>;
  dHi: MotionValue<number>;
  dV: MotionValue<number>;
  priceLayer: RefObject<SVGGElement | null>;
  volumeLayer: RefObject<SVGGElement | null>;
  dateAxis: RefObject<SVGGElement | null>;
  lastLine: RefObject<SVGGElement | null>;
  lastPill: RefObject<SVGGElement | null>;
  ticks: RefObject<Map<number, SVGGElement>>;
};

const setAttr = (el: SVGGElement | null, value: string) => {
  if (!el) return;
  if (value) el.setAttribute("transform", value);
  else el.removeAttribute("transform");
};
/**
 * Map the marks, drawn once on the target view and ranges, onto the displayed ones with a transform per
 * layer (and move the axis labels, tick lines and the last-price tag), so a glide never re-renders React.
 * @internal
 */
export function paintDisplay(g: DisplayTarget, p: DisplayParts) {
  const { dS, dSpan, dLo, dHi, dV } = p;
  const sp = Math.max(1e-6, dSpan.get());
  const lo = dLo.get();
  const hi = dHi.get();
  const range = Math.max(1e-9, hi - lo);
  const ax = g.span / sp;
  const bx = ((g.start - dS.get()) * g.w) / sp;
  const ay = (g.hi - g.lo) / range;
  const by = (g.h * (hi - g.hi)) / range;
  const av = g.v / Math.max(1e-9, dV.get());
  const bv = g.volH * (1 - av);
  const same = (k: number, b: number) => Math.abs(k - 1) < 1e-5 && Math.abs(b) < 0.01;
  const matrix = (a: number, d: number, e: number, f: number) =>
    same(a, e) && same(d, f) ? "" : `matrix(${a.toFixed(5)} 0 0 ${d.toFixed(5)} ${e.toFixed(2)} ${f.toFixed(2)})`;
  setAttr(p.priceLayer.current, matrix(ax, ay, bx, by));
  setAttr(p.volumeLayer.current, matrix(ax, av, bx, bv));
  // Date labels slide with the candles, scaled back so their text never stretches.
  const axis = p.dateAxis.current;
  if (axis) {
    setAttr(axis, same(ax, bx) ? "" : `matrix(${ax.toFixed(5)} 0 0 1 ${bx.toFixed(2)} 0)`);
    axis.style.setProperty("--inv-x", (1 / ax).toFixed(5));
  }
  // Price gridlines and labels sit on the displayed range; those outside it hide.
  for (const [value, el] of p.ticks.current) {
    const y = (g.h * (hi - value)) / range;
    el.setAttribute("transform", `translate(0 ${y.toFixed(2)})`);
    el.style.opacity = y >= -0.5 && y <= g.h + 0.5 ? "" : "0";
  }
  if (g.last !== null) {
    const y = ay * g.last + by;
    setAttr(p.lastLine.current, `translate(0 ${y.toFixed(2)})`);
    setAttr(
      p.lastPill.current,
      `translate(${g.right} ${(clamp(y, g.pillH / 2, g.h - g.pillH / 2) - g.pillH / 2).toFixed(2)})`,
    );
  }
}
