import { type ReactNode } from "react";

import { num } from "../chart-utils";
import { ChartValueTable, defaultCompact, defaultPercent } from "../heatmap";
import { isolate } from "../chart-pointer";
import {
  defaultDivergingBarChartLabels,
  type DivergingBarChartProps,
  divergingLevels,
  netText,
  type Side,
  type LevelInfo,
} from "./model";

/* ---------- Table view ---------- */

/**
 * Props of DivergingBarTable, the table view of the chart: the chart's data and formatting props plus
 * a hidden `caption` for screen readers.
 */
export type DivergingBarTableProps = Pick<
  DivergingBarChartProps,
  "data" | "index" | "levels" | "variant" | "neutral" | "format" | "formatPercent" | "locale" | "labels" | "showNet"
> & {
  /** Sets the header of the row-name column. */
  indexLabel?: string;
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * Every row's count and share per level (plus the net score of a Likert row).
 *
 * Props: the chart's `data`, `index`, `levels`, `variant`, `neutral`, `format`, `formatPercent`, `locale`, `labels` and `showNet`, plus `indexLabel` (first column header), `caption` (hidden, names the table) and `className`. A real table: each row's count and share per level, plus the net score of a Likert row. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { DivergingBarTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <DivergingBarTable
 *       data={[{ question: "Easy to use", no: 5, neutral: 15, yes: 80 }]}
 *       index="question"
 *       levels={[
 *         { key: "no", label: "Disagree" },
 *         { key: "neutral", label: "Neutral" },
 *         { key: "yes", label: "Agree" },
 *       ]}
 *       neutral="neutral"
 *       indexLabel="Question"
 *       caption="Survey answers by question"
 *     />
 *   );
 * }
 * ```
 *
 * @see /charts/diverging-bar
 */
export function DivergingBarTable({
  data,
  index,
  levels,
  variant = "likert",
  neutral,
  indexLabel,
  format: formatProp,
  formatPercent: formatPercentProp,
  locale,
  labels,
  showNet = true,
  caption,
  className,
}: DivergingBarTableProps) {
  const t = { ...defaultDivergingBarChartLabels, ...labels };
  const format = formatProp ?? defaultCompact(locale);
  const pct = formatPercentProp ?? defaultPercent(locale);
  const butterfly = variant === "butterfly";
  const info = butterfly ? levels.slice(0, 2) : divergingLevels(levels, { neutral });
  const net = !butterfly && showNet;
  return (
    <ChartValueTable
      caption={caption}
      className={className}
      emptyState={t.noData}
      columns={[
        { label: indexLabel ?? t.item },
        ...info.map((l) => ({ label: l.label })),
        ...(butterfly ? [{ label: t.total }] : []),
        ...(net ? [{ label: t.net }] : []),
      ]}
      rows={data.map((row) => {
        const raw = info.map((l) => Math.max(0, num(row[l.key])));
        const total = raw.reduce((a, b) => a + b, 0);
        const cells: ReactNode[] = [String(row[index] ?? "")];
        // Numbers are isolated so right-to-left pages keep each one whole ("−4", not "4−").
        const f = (text: string) => isolate(text);
        raw.forEach((v) =>
          cells.push(butterfly ? f(format(v)) : `${f(pct(total > 0 ? v / total : 0))} (${f(format(v))})`),
        );
        if (butterfly) cells.push(f(format(total)));
        if (net) {
          const levelsInfo = info as LevelInfo[];
          const share = (side: Side) =>
            raw.reduce((s, v, i) => s + (levelsInfo[i]?.side === side ? v : 0), 0) / (total || 1);
          const value = share("positive") - share("negative");
          cells.push(f(netText(value, pct)));
        }
        return cells;
      })}
    />
  );
}
