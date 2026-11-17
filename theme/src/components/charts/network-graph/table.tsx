import { type ReactNode } from "react";
import { itemAt } from "../chart-utils";
import { ChartValueTable, defaultCompact } from "../heatmap";
import { buildGraph } from "./model";
import { type NetworkGraphProps } from "./types";

/* ---------- Table view (the keyboard list of every node) ---------- */

/**
 * Props of NetworkTable, the table view of the chart: the chart's data and formatting props plus a
 * hidden `caption` for screen readers.
 */
export type NetworkTableProps = Pick<NetworkGraphProps, "nodes" | "links" | "groups" | "format" | "locale"> & {
  /** Hidden caption that names the table for screen readers. */
  caption?: string;
  /** Override the column headers: { node, group, connections, value, linked }. */
  headers?: Partial<{ node: string; group: string; connections: string; value: string; linked: string }>;
  /** Shown when there are no rows. */
  emptyState?: ReactNode;
};

/**
 * Every node with its group, its number of connections and who it connects to.
 *
 * Props: the graph's `nodes`, `links`, `groups`, `format` and `locale`, plus `caption` (hidden, names the table), `headers` ({ node, group, connections, value, linked }) and `emptyState`. A real table: every node with its group, its number of connections and who it connects to. Static (no motion). Pass it to `ChartCard table`.
 *
 * @example
 * ```tsx
 * import { NetworkTable } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <NetworkTable nodes={[{ id: "api" }, { id: "db" }]} links={[{ source: "api", target: "db" }]} caption="Service dependencies" />
 *   );
 * }
 * ```
 *
 * @see /charts/network-graph
 */
export function NetworkTable({
  nodes,
  links,
  groups,
  format: formatProp,
  locale,
  caption,
  headers,
  emptyState,
}: NetworkTableProps) {
  const format = formatProp ?? defaultCompact(locale);
  const h = {
    node: "Node",
    group: "Group",
    connections: "Connections",
    value: "Value",
    linked: "Connected to",
    ...headers,
  };
  const graph = buildGraph(nodes, links, groups);
  const hasGroups = graph.nodes.some((g) => g.groupLabel);
  const hasValues = graph.nodes.some((g) => g.value !== null);
  return (
    <ChartValueTable
      caption={caption}
      emptyState={emptyState}
      columns={[
        { label: h.node },
        ...(hasGroups ? [{ label: h.group, align: "start" as const }] : []),
        { label: h.connections },
        ...(hasValues ? [{ label: h.value }] : []),
        { label: h.linked, align: "start" as const },
      ]}
      rows={graph.nodes.map((g) => [
        g.label,
        ...(hasGroups ? [g.groupLabel ?? ""] : []),
        format(g.neighbours.length),
        ...(hasValues ? [g.value === null ? "" : format(g.value)] : []),
        // A readable paragraph, not a sliver: the column keeps 12rem on phones and the table scrolls sideways.
        <span className="inline-block min-w-48 whitespace-normal text-sheen-fg-muted">
          {g.neighbours.map((j) => itemAt(graph.nodes, j).label).join(", ")}
        </span>,
      ])}
    />
  );
}
