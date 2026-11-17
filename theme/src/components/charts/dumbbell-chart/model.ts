import { type ReactNode } from "react";

import { type LegendItem } from "../chart-parts";
import { clamp, num, slotColor, type ChartColor, type ChartInstructions, itemAt } from "../chart-utils";
import { hueMix, type ChartTipSide } from "../heatmap";
import { CONTEXT_GREY } from "../kits/histogram-kit/kit";

/** One row of a DumbbellChart: a label and the values it moves from and to. */
export type DumbbellItem = {
  label: string;
  /** The "before" value. */
  from: number;
  /** The "after" value. */
  to: number;
};

/**
 * Every string DumbbellChart speaks or shows, so it can be translated: pass a `Partial` as the
 * `labels` prop. Entries that need a value are functions.
 */
export type DumbbellChartLabels = {
  roleDescription: (slope: boolean) => string;
  instructions: ChartInstructions;
  hint: string;
  /** Default names of the two ends when `fromLabel` / `toLabel` aren't given. */
  from: string;
  to: string;
  change: string;
  /** Percent change row label. */
  percentChange: string;
  /** A change of zero. */
  noChange: string;
  item: string;
  noData: string;
};

/**
 * The built-in English strings of DumbbellChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultDumbbellChartLabels: DumbbellChartLabels = {
  roleDescription: (slope) => (slope ? "slope chart" : "dumbbell chart"),
  instructions: "Use the up and down arrow keys to read each item.",
  hint: "Tap a row to read it",
  from: "Before",
  to: "After",
  change: "Change",
  percentChange: "% change",
  noChange: "No change",
  item: "Item",
  noData: "No data",
};

/**
 * Props of DumbbellChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type DumbbellChartProps = {
  /** Takes one item per row: { label, from, to }. */
  data: readonly DumbbellItem[];
  /** "dumbbell": a row per item, a dot at each end. "slope": two columns joined by a line per item. */
  variant?: "dumbbell" | "slope";
  /** Sets the name of the "before" end, e.g. "2024". */
  fromLabel?: string;
  /** Sets the name of the "after" end, e.g. "2025". */
  toLabel?: string;
  /** Order of the items. "change" puts the biggest rise first. */
  sort?: "none" | "to" | "from" | "change";
  /** Is a rise good (revenue) or bad (costs, churn)? Picks the status colour of the change. Default true. */
  higherIsBetter?: boolean;
  /** Show each item's change: "absolute" (+12), "percent" (+8%), or "none". Default "absolute". */
  change?: "absolute" | "percent" | "none";
  /** Emphasise these items (by label); the rest step back to grey. */
  highlight?: string | string[];
  /** Palette slot (1–8): the "after" dot in full, the "before" dot a lighter shade of it. Default 1. */
  color?: ChartColor;
  /** Keep 0 on the value axis. */
  includeZero?: boolean;
  /** Height of a slope chart. Dumbbell rows grow with the items. */
  height?: number;
  /** Names the value axis. */
  valueLabel?: string;
  /** Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Formats percent changes (0.08 → "8%"). Default: percentages in `locale`. */
  formatPercent?: (ratio: number) => string;
  /** Locale of the default number formats. Default "en". */
  locale?: string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<DumbbellChartLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** The radius of the start dot, in pixels. @internal */
export const FROM_R = 5;
/** The radius of the end dot, in pixels. @internal */
export const TO_R = 6.5;
/**
 * Ends of an item that isn't highlighted: two light greys (the "before" one paler) that step back
 * behind the highlighted items instead of out-weighing them.
 */
export const DIMMED = {
  from: "light-dark(color-mix(in oklab, var(--sheen-fg-subtle) 42%, var(--sheen-chart-surface)), color-mix(in oklab, var(--sheen-fg-subtle) 46%, var(--sheen-chart-surface)))",
  to: CONTEXT_GREY,
};
/** The tooltip side order. @internal */
export const TIP: readonly ChartTipSide[] = ["below", "above", "right", "left"];

/**
 * The two shades of a dumbbell: the "before" end is a paler step of the "after" hue. On light
 * surfaces that's a tint towards the surface; on dark ones a step towards the text colour, so it
 * stays visible (a tint towards a dark surface would sink into it).
 *
 * @see /charts/dumbbell
 */
export function dumbbellColors(color: ChartColor = 1) {
  return {
    from: `light-dark(${hueMix(color, 0.42)}, color-mix(in oklab, ${slotColor(color)} 55%, var(--sheen-fg-muted)))`,
    to: slotColor(color),
  };
}

/** Legend items for a dumbbell or slope chart: the two ends.
 *
 * @see /charts/dumbbell
 */
export function dumbbellLegend(
  fromLabel = defaultDumbbellChartLabels.from,
  toLabel = defaultDumbbellChartLabels.to,
  color: ChartColor = 1,
): LegendItem[] {
  const c = dumbbellColors(color);
  return [
    { label: fromLabel, color: c.from, kind: "rect" },
    { label: toLabel, color: c.to, kind: "rect" },
  ];
}

/** One dumbbell row with its start and end values and colour. @internal */
export type Row = {
  key: string;
  label: string;
  from: number;
  to: number;
  diff: number;
  ratio: number;
  dimmed: boolean;
};

/** Resolves the data into rows with finite values, colours and sort order. @internal */
export function resolveRows(
  data: readonly DumbbellItem[],
  sort: DumbbellChartProps["sort"],
  highlight: string[] | null,
): Row[] {
  const seen = new Map<string, number>();
  const rows = data.map((d) => {
    const n = seen.get(d.label) ?? 0;
    seen.set(d.label, n + 1);
    const from = num(d.from);
    const to = num(d.to);
    return {
      key: `${d.label}\u0000${n}`,
      label: d.label,
      from,
      to,
      diff: to - from,
      ratio: from !== 0 ? (to - from) / Math.abs(from) : NaN,
      dimmed: highlight !== null && !highlight.includes(d.label),
    };
  });
  if (sort === "to") return rows.sort((a, b) => b.to - a.to);
  if (sort === "from") return rows.sort((a, b) => b.from - a.from);
  if (sort === "change") return rows.sort((a, b) => b.diff - a.diff);
  return rows;
}

/**
 * Spreads label positions apart so no two sit closer than `gap`, keeping their order and staying
 * within [lo, hi]: overlapping labels form a cluster centred on their wanted positions (the classic
 * slope-chart label layout). Returns positions in the input order.
 */
export function spreadLabels(wanted: number[], gap: number, lo: number, hi: number): number[] {
  const order = wanted.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y || a.i - b.i);
  type Cluster = { items: { y: number; i: number }[]; top: number };
  const clusters: Cluster[] = [];
  const centre = (c: Cluster) => c.items.reduce((s, it) => s + it.y, 0) / c.items.length;
  const place = (c: Cluster) => {
    const span = (c.items.length - 1) * gap;
    c.top = clamp(centre(c) - span / 2, lo, Math.max(lo, hi - span));
  };
  for (const it of order) {
    const c: Cluster = { items: [it], top: it.y };
    place(c);
    clusters.push(c);
    // Merge backwards while the newest cluster overlaps the one before it.
    while (clusters.length > 1) {
      const last = itemAt(clusters, clusters.length - 1);
      const prev = itemAt(clusters, clusters.length - 2);
      if (prev.top + (prev.items.length - 1) * gap + gap <= last.top + 1e-6) break;
      prev.items.push(...last.items);
      clusters.pop();
      place(prev);
    }
  }
  const out = new Array<number>(wanted.length);
  for (const c of clusters) c.items.forEach((it, k) => (out[it.i] = c.top + k * gap));
  return out;
}

/** A dot as one path (so a data change morphs its `d`, never cx / cy). */
/** The direction glyph of a row's change (none when it is unchanged). */
export function arrowOf(r: Row) {
  return r.diff > 0 ? "▲" : r.diff < 0 ? "▼" : "";
}

/** A dot as one SVG path, so a data change morphs `d`. @internal */
export function dotPath(cx: number, cy: number, r: number) {
  const f = (n: number) => n.toFixed(2);
  return `M${f(cx - r)},${f(cy)} a${f(r)},${f(r)} 0 1,0 ${f(2 * r)},0 a${f(r)},${f(r)} 0 1,0 ${f(-2 * r)},0 Z`;
}
/** The 3px bar between a dumbbell's ends, in its row's own coordinates (the row is centred on y = 0). */
export function barD(xa: number, xb: number) {
  const left = Math.min(xa, xb);
  const len = Math.abs(xb - xa);
  return `M${left.toFixed(1)},-1.5 h${len.toFixed(1)} v3 h${(-len).toFixed(1)} Z`;
}
/** Finds the SVG element of a named `data-part` inside an element. @internal */
export const part = (el: Element, name: string) => el.querySelector<SVGElement>(`[data-part="${name}"]`);
/** Classes of the marks inside a row: they step back while another row is read (one opacity change per row). */
export const rowDimClass =
  "transition-opacity duration-(--sheen-duration-fast) ease-sheen-out motion-reduced:transition-none group-data-dim:opacity-35 forced-colors:group-data-dim:opacity-50";
/** The style that scales or rotates an SVG element around its own centre. @internal */
export const centreOrigin = { transformBox: "fill-box", transformOrigin: "center" } as const;
