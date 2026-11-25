import { type Readout } from "../chart-fit";
import { clamp } from "../chart-utils";
import { type ChartTipAnchor } from "../heatmap";
import { r2 } from "../flow-utils";

/** The pan and zoom of the graph: scale `k` and the translation `tx`, `ty`. */
export type View = { k: number; tx: number; ty: number };
/** The smallest zoom scale. */
export const K_MIN = 0.25;
/** The largest zoom scale. */
export const K_MAX = 4;
/** Placeholder anchor for the tooltip: its real position is written to the tooltip store after each commit. */
export const NO_ANCHOR: ChartTipAnchor = { x: 0, y: 0, w: 0, h: 0 };
/** Dots (and their hit areas) grow a little as you zoom in and shrink a little as you zoom out. */
export const dotScale = (k: number) => clamp(Math.sqrt(k), 0.8, 1.35);
/** Entrance: nodes ripple out over the first part of it, by breadth-first rank; links fade in after. */
export const INTRO = 1.4;
/** How far the entrance ripple of the nodes spreads over the intro, as a fraction of it. */
export const SPREAD = 0.55;
/** ms of layout work per frame while the layout is computed: never a long task. */
export const BUDGET = 8;

/** The side of a node where its name is placed. */
export type Side = "right" | "left" | "below" | "above";
/** A placed name: which node, on which side of it, and its width. */
export type Name = { i: number; side: Side; text: string; w: number };

/** Offset of a name from its node's centre (screen px) for a dot of radius r. */
export function nameOffset(side: Side, r: number): [number, number] {
  return side === "right"
    ? [r + 4, 0]
    : side === "left"
      ? [-(r + 4), 0]
      : side === "below"
        ? [0, r + 9]
        : [0, -(r + 9)];
}
/** The SVG `text-anchor` of a name placed on the given side of its node. */
export const nameAnchor = (side: Side) => (side === "right" ? "start" : side === "left" ? "end" : "middle");

/** A circle as two arcs, so many dots of one colour can share one path. "" when it isn't drawn. */
export function circlePath(x: number, y: number, r: number) {
  if (!(r > 0.01) || !Number.isFinite(x + y)) return "";
  const R = r2(r);
  return `M${r2(x - r)},${r2(y)}a${R},${R} 0 1,0 ${r2(2 * r)},0a${R},${R} 0 1,0 ${r2(-2 * r)},0`;
}

/** The tooltip / docked readout of one node: its group, how many connections it has and its value. */
export function nodeReadout(
  g: { label: string; color: string; groupLabel?: string | null; neighbours: readonly number[]; value: number | null },
  connections: (n: number) => string,
  valueLabel: string,
  format: (n: number) => string,
): Readout {
  const rows: Readout["rows"] = [];
  if (g.groupLabel) rows.push({ label: "", value: g.groupLabel, color: g.color, kind: "rect" });
  rows.push({
    label: connections(g.neighbours.length),
    value: format(g.neighbours.length),
    color: g.groupLabel ? "transparent" : g.color,
    kind: "rect",
  });
  if (g.value !== null) rows.push({ label: valueLabel, value: format(g.value), color: "transparent", kind: "rect" });
  return { title: g.label, rows };
}

/** A 16px stroked icon for a toolbar button, drawn from one SVG path. */
export function ToolIcon({ d }: { d: string }) {
  return (
    <svg aria-hidden width={16} height={16} viewBox="0 0 16 16">
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
