"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { animate, motion, useMotionValue } from "motion/react";

import { cn } from "../../../lib/cn";
import { useSyncRef } from "../../../hooks/use-latest";
import { duration, ease } from "../../../motion/tokens";
import { ChartValueTable, defaultCompact, defaultPercent, MissingValue } from "../heatmap";
import { fitText, measureText, polar } from "../flow-utils";
import { type SunburstChartProps, type Arc, partition, type Drawn, GAP } from "./model";

/**
 * A number that rolls (counts) to each new value with the motion tokens; instant with reduced
 * motion. The number is a MotionValue rendered as a child: Motion writes the text, React never
 * re-renders while it counts.
 */
export function RollingValue({
  value,
  format,
  reduced,
  className,
}: {
  value: number;
  format: (n: number) => string;
  reduced: boolean;
  className?: string;
}) {
  const n = useMotionValue(reduced ? value : 0);
  const latest = useRef({ value, format });
  useSyncRef(latest, { value, format });
  // Settle on the exact formatted value (no float noise from the tween).
  const show = useCallback((v: number) => {
    const { value: to, format: f } = latest.current;
    return f(Math.abs(v - to) < Math.abs(to) * 1e-6 + 1e-9 ? to : v);
  }, []);
  const text = useMotionValue(format(reduced ? value : 0));
  useEffect(() => n.on("change", (v) => text.set(show(v))), [n, text, show]);
  // A new format shows at once.
  useEffect(() => text.set(show(n.get())), [format, n, text, show]);
  useEffect(() => {
    if (reduced) {
      n.jump(value);
      text.set(show(value));
      return;
    }
    const controls = animate(n, value, { duration: duration.slow, ease: [...ease.out] });
    return () => controls.stop();
  }, [value, reduced, n, text, show]);
  return <motion.span className={className}>{text}</motion.span>;
}

/** An arc's name, along the arc when it fits, else across it, else not at all. */
export function ArcLabel({ drawn, cx, cy, ink }: { drawn: Drawn; cx: number; cy: number; ink: "light" | "dark" }) {
  const { arc, a0, a1, r0, r1 } = drawn;
  const thick = r1 - r0 - GAP;
  const rm = (r0 + r1) / 2;
  const mid = (a0 + a1) / 2;
  const along = (a1 - a0) * rm * 0.86 - 8; // usable length along the arc
  const across = thick - 10; // usable length across the ring
  const SIZE = 11;
  let text = "";
  let tangential = true;
  if (thick >= 16 && measureText(arc.label, SIZE, 500) <= along) text = arc.label;
  else if ((a1 - a0) * rm >= 15 && measureText(arc.label, SIZE, 500) <= across) {
    text = arc.label;
    tangential = false;
  } else if (thick >= 16 && along >= across) text = fitText(arc.label, along, SIZE, 500, 4);
  else if ((a1 - a0) * rm >= 15) {
    text = fitText(arc.label, across, SIZE, 500, 4);
    tangential = false;
  }
  if (!text) return null;
  const [x, y] = polar(cx, cy, rm, mid);
  let deg = (mid * 180) / Math.PI;
  if (tangential) {
    if (mid > Math.PI / 2 && mid < (Math.PI * 3) / 2) deg += 180;
  } else {
    deg -= 90;
    if (mid > Math.PI) deg += 180;
  }
  return (
    <text
      transform={`translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${deg.toFixed(2)})`}
      textAnchor="middle"
      dy="0.35em"
      className={cn(
        "text-2xs font-medium",
        ink === "light" ? "fill-sheen-ink-on-dark" : "fill-sheen-ink-on-light",
        "forced-colors:fill-[CanvasText]",
      )}
    >
      {text}
    </text>
  );
}

/** The chevron of the breadcrumb separator. @internal */
export function Chevron() {
  return (
    <svg
      aria-hidden
      width={14}
      height={14}
      viewBox="0 0 16 16"
      className="shrink-0 text-sheen-fg-subtle rtl:-scale-x-100"
    >
      <path
        d="M6 3.5 10.5 8 6 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- Table view ---------- */

/** The text of `SunburstTable` that is not a column header. */
export type SunburstTableLabels = {
  /** Read for top-level rows' "% of group" (they have no group). */
  notApplicable: string;
};

/** English defaults of {@link SunburstTableLabels}. */
export const defaultSunburstTableLabels: SunburstTableLabels = {
  notApplicable: "Not applicable",
};

/**
 * Props of SunburstTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type SunburstTableProps = Pick<SunburstChartProps, "data" | "format" | "formatPercent" | "locale"> & {
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Override the column headers: { name, value, ofParent, ofTotal }. */
  headers?: Partial<{ name: string; value: string; ofParent: string; ofTotal: string }>;
  /** Strings for the cells that have no value. Merged over {@link defaultSunburstTableLabels}. */
  labels?: Partial<SunburstTableLabels>;
  /** Shown when there are no rows. */
  emptyState?: ReactNode;
};

/**
 * Every node, depth first (groups in bold, children indented), with its value and shares.
 *
 * Props: the chart's `data`, `format`, `formatPercent` and `locale`, plus `caption` (hidden, names the table), `headers` ({ name, value, ofParent, ofTotal }), `labels` (`notApplicable` "Not applicable") and `emptyState`. A real table: every node depth first (groups in bold, children indented) with its value and shares. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { SunburstTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SunburstTable data={[{ label: "Web", children: [{ label: "Search", value: 40 }, { label: "Ads", value: 25 }] }]} caption="Sessions by platform" />
 *   );
 * }
 * ```
 *
 * @see /charts/sunburst
 */
export function SunburstTable({
  data,
  format: formatProp,
  formatPercent: pctProp,
  locale,
  caption,
  headers,
  labels,
  emptyState,
}: SunburstTableProps) {
  const { notApplicable: notApplicableLabel } = { ...defaultSunburstTableLabels, ...labels };
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const h = { name: "Name", value: "Value", ofParent: "% of group", ofTotal: "% of total", ...headers };
  const tree = partition(data);
  const rows: ReactNode[][] = [];
  const walk = (arc: Arc, depth: number) => {
    for (const child of arc.children) {
      const group = child.children.length > 0;
      rows.push([
        <span
          className={cn("inline-block", group && "font-semibold text-sheen-fg")}
          style={{ paddingInlineStart: depth * 16 }}
        >
          {child.label}
        </span>,
        group ? <strong className="font-semibold">{format(child.value)}</strong> : format(child.value),
        depth === 0 ? <MissingValue label={notApplicableLabel} /> : pct(arc.value > 0 ? child.value / arc.value : NaN),
        pct(tree.value > 0 ? child.value / tree.value : NaN),
      ]);
      walk(child, depth + 1);
    }
  };
  walk(tree, 0);
  return (
    <ChartValueTable
      caption={caption}
      emptyState={emptyState}
      columns={[{ label: h.name }, { label: h.value }, { label: h.ofParent }, { label: h.ofTotal }]}
      rows={rows}
    />
  );
}
