import { type ReactNode } from "react";

import { ChartValueTable, defaultCompact, defaultPercent } from "../heatmap";
import { type SankeyNode, type SankeyLink, layoutSankey } from "./layout";

/* ---------- Table view ---------- */

/**
 * Props of SankeyTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type SankeyTableProps = {
  /** The same flows as the chart: { source, target, value }. */
  links: readonly SankeyLink[];
  /** Optional node labels and colours, as in the chart. */
  nodes?: readonly SankeyNode[];
  /** Formats a flow value for the table cells: takes the number, returns the text shown. Default compact numbers in `locale`. */
  format?: (n: number) => string;
  /** Formats a share of the total for the table cells: takes the share, returns the text shown. Default percentages in `locale`. */
  formatPercent?: (ratio: number) => string;
  /** Locale of the default number formats. Default "en". */
  locale?: string;
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Override the column headers: { source, target, value, ofSource, ofTarget }. */
  headers?: Partial<{ source: string; target: string; value: string; ofSource: string; ofTarget: string }>;
  /** Shown when there are no flows. */
  emptyState?: ReactNode;
};

/**
 * Every flow of a sankey as a table: from, to, amount, and its share of each end.
 *
 * Takes the chart's `links`, `nodes`, `format`, `formatPercent` and `locale`, plus `caption` (hidden, names the table), `headers` ({ source, target, value, ofSource, ofTarget }) and `emptyState`. A real table: every flow with its amount and share of each end. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { SankeyTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SankeyTable links={[{ source: "Search", target: "Signup", value: 60 }, { source: "Signup", target: "Paid", value: 30 }]} caption="Traffic sources to plans" />
 *   );
 * }
 * ```
 *
 * @see /charts/sankey-diagram
 */
export function SankeyTable({
  links,
  nodes,
  format: formatProp,
  formatPercent: pctProp,
  locale,
  caption,
  headers,
  emptyState,
}: SankeyTableProps) {
  const format = formatProp ?? defaultCompact(locale);
  const pct = pctProp ?? defaultPercent(locale);
  const h = {
    source: "From",
    target: "To",
    value: "Value",
    ofSource: "% of source",
    ofTarget: "% of target",
    ...headers,
  };
  const layout = layoutSankey(nodes, links, { width: 100, height: 100 });
  const ordered = [...layout.links].sort(
    (a, b) => a.source.column - b.source.column || a.source.index - b.source.index || b.value - a.value,
  );
  return (
    <ChartValueTable
      caption={caption}
      emptyState={emptyState}
      columns={[
        { label: h.source },
        { label: h.target, align: "start" },
        { label: h.value },
        { label: h.ofSource },
        { label: h.ofTarget },
      ]}
      rows={ordered.map((l) => [
        l.source.label,
        <span className="text-sheen-fg-muted">{l.target.label}</span>,
        format(l.value),
        pct(l.source.outflow > 0 ? l.value / l.source.outflow : NaN),
        pct(l.target.inflow > 0 ? l.value / l.target.inflow : NaN),
      ])}
    />
  );
}
