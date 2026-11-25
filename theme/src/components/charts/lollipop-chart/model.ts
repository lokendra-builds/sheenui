import { type ReactNode } from "react";

import { num, slotColor, type ChartColor, type ChartInstructions } from "../chart-utils";
import { type ChartTipSide } from "../heatmap";
import { CONTEXT_GREY } from "../kits/histogram-kit/kit";

/** One item of a LollipopChart: a label, a value and an optional palette slot. */
export type LollipopItem = {
  label: string;
  value: number;
  /** Palette slot (1–8) of this item. Default: the chart's `color`. */
  color?: ChartColor;
};

/**
 * Every string LollipopChart speaks or shows, so it can be translated: pass a `Partial` as the
 * `labels` prop. Entries that need a value are functions.
 */
export type LollipopChartLabels = {
  roleDescription: string;
  /** Appended to the accessible name: a string, or a function of `{ horizontal }` to word the keys for each orientation. */
  instructions: ChartInstructions<{ horizontal: boolean }>;
  hint: string;
  value: string;
  /** Readout row comparing an item with the reference line, e.g. "+12 vs Average". */
  versus: (reference: string) => string;
  /** Readout row with the item's rank, e.g. "#2 of 12". */
  rank: (rank: number, of: number) => string;
  /** Table headers. */
  item: string;
  noData: string;
};

/**
 * The built-in English strings of LollipopChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultLollipopChartLabels: LollipopChartLabels = {
  roleDescription: "lollipop chart",
  instructions: ({ horizontal }) =>
    `Use the ${horizontal ? "up and down" : "left and right"} arrow keys to read each item.`,
  hint: "Tap a row to read it",
  value: "Value",
  versus: (reference) => `vs ${reference}`,
  rank: (rank, of) => `#${rank} of ${of}`,
  item: "Item",
  noData: "No data",
};

/**
 * Props of LollipopChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type LollipopChartProps = {
  /** Takes one item per stem: { label, value, color? }. */
  data: readonly LollipopItem[];
  /** "auto": sideways rows (best for ranked lists and long names), upright on wide charts with short names. */
  layout?: "auto" | "horizontal" | "vertical";
  /** Order of the items. "none" keeps the order of `data`. Re-sorting slides the rows to their new places. */
  sort?: "none" | "descending" | "ascending";
  /** Where the stems start. Default 0. Values below it reach the other way (a diverging lollipop). */
  baseline?: number;
  /** A reference line, e.g. { value: 72, label: "Average" }. */
  reference?: { value: number; label: string };
  /** Emphasise these items (by label); the rest step back to a neutral grey. */
  highlight?: string | string[];
  /** Print each value next to its head. Default true. */
  showValues?: boolean;
  /** Sets the palette slot (1–8) used for the whole chart. Default 1. */
  color?: ChartColor;
  /** Height of an upright chart. Sideways charts grow with the number of rows. */
  height?: number;
  /** Names the value axis. */
  valueLabel?: string;
  /** Formats a value for the labels, tooltips and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Locale of the default number format. Default "en". */
  locale?: string;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<LollipopChartLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** Average advance of 12px label text, for thinning upright category names. */
export const CHAR_W = 6.8;
/** The radius of the lollipop head, in pixels. @internal */
export const HEAD_R = 6;
/** Items outside `highlight` step back to a light grey, so the highlighted ones pop. */
export const NEUTRAL = CONTEXT_GREY;
/** The tooltip side order of horizontal lollipops. @internal */
export const TIP_H: readonly ChartTipSide[] = ["right", "left", "below", "above"];
/** The tooltip side order of vertical lollipops. @internal */
export const TIP_V: readonly ChartTipSide[] = ["right", "left", "above", "below"];

/** One lollipop row with its value and colour. @internal */
export type Row = {
  key: string;
  label: string;
  value: number;
  color: string;
  slot: number;
  dimmed: boolean;
  rank: number;
};

/** The rows as drawn: sorted, ranked (1 = largest), coloured, with stable keys for duplicate labels. */
export function resolveRows(
  data: readonly LollipopItem[],
  sort: LollipopChartProps["sort"],
  color: ChartColor,
  highlight: string[] | null,
): Row[] {
  const seen = new Map<string, number>();
  const rows = data.map((d) => {
    const n = seen.get(d.label) ?? 0;
    seen.set(d.label, n + 1);
    const dimmed = highlight !== null && !highlight.includes(d.label);
    const slot = d.color ?? color;
    return {
      key: `${d.label}\u0000${n}`,
      label: d.label,
      value: num(d.value),
      color: dimmed ? NEUTRAL : slotColor(slot),
      slot: dimmed ? 0 : slot,
      dimmed,
      rank: 0,
    };
  });
  const byValue = [...rows].sort((a, b) => b.value - a.value);
  byValue.forEach((r, i) => (r.rank = i + 1));
  if (sort === "descending") return byValue;
  if (sort === "ascending") return byValue.reverse();
  return rows;
}

/** A dot as one path (so a data change morphs its `d`, never cx / cy). */
export function dotPath(cx: number, cy: number, r: number) {
  const f = (n: number) => n.toFixed(2);
  return `M${f(cx - r)},${f(cy)} a${f(r)},${f(r)} 0 1,0 ${f(2 * r)},0 a${f(r)},${f(r)} 0 1,0 ${f(-2 * r)},0 Z`;
}
/** The style that scales an SVG element around its own centre. @internal */
export const CENTRE_ORIGIN = { transformBox: "fill-box", transformOrigin: "center" } as const;

/** Classes of a row's marks: they step back while another row is read (one opacity change per row, no re-render). */
export const rowDimClass =
  "transition-opacity duration-(--sheen-duration-fast) ease-sheen-out motion-reduced:transition-none group-data-dim:opacity-40 forced-colors:group-data-dim:opacity-60";
