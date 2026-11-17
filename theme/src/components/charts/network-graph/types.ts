import { type ReactNode } from "react";
import { type LegendItem } from "../chart-parts";
import { slotColor, type ChartInstructions } from "../chart-utils";
import { type ForceSimulationOptions } from "./simulation";
import { type NetworkNode, type NetworkLink, type NetworkGroup } from "./model";

/* ======================================================================
 * Component
 * ====================================================================== */

/**
 * Every string NetworkGraph speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type NetworkGraphLabels = {
  roleDescription: string;
  instructions: ChartInstructions;
  hint: string;
  /** "4 connections" (the count is shown as the value). */
  connections: (count: number) => string;
  /** Tooltip row of a node's value. */
  value: string;
  /** Announced after a node's values. */
  connectedTo: (names: string[], more: number) => string;
  zoomIn: string;
  zoomOut: string;
  fit: string;
  /** Accessible name of the zoom toolbar. */
  zoomControls: string;
};

/**
 * The built-in English strings of NetworkGraph; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultNetworkGraphLabels: NetworkGraphLabels = {
  roleDescription: "network graph",
  instructions:
    "Use the arrow keys to move to the nearest node in that direction, Page Up and Page Down to step through every node in order, plus and minus to zoom and 0 to fit. Drag a node to move it; Ctrl or Command and scroll to zoom.",
  hint: "Tap a node to see its connections",
  connections: (count) => (count === 1 ? "connection" : "connections"),
  value: "value",
  connectedTo: (names, more) => `Connected to ${names.join(", ")}${more > 0 ? ` and ${more} more` : ""}`,
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  fit: "Fit to view",
  zoomControls: "Zoom",
};

/**
 * Props of NetworkGraph. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type NetworkGraphProps = {
  /** The nodes: { id, label?, group?, value? }. `value` sizes the dot. */
  nodes: readonly NetworkNode[];
  /** Ties between nodes (undirected). Repeated pairs add up; links to unknown ids are left out. */
  links: readonly NetworkLink[];
  /** Names and colour slots of the groups. Groups only named on nodes get the next free slot. */
  groups?: readonly NetworkGroup[];
  /** Height of the chart in px; the width follows the container. Default 420. */
  height?: number;
  /** Which names to print: where they fit without colliding ("auto", default), all, or none. */
  showLabels?: "auto" | "all" | "none";
  /** Sets the tuning of the force layout. */
  forces?: ForceSimulationOptions;
  /** Formats node values. Default compact numbers in `locale`. */
  format?: (n: number) => string;
  /** Locale of the default number format. Default "en". */
  locale?: string;
  /** Called with { id, label, group, connections } when a node is clicked, tapped, or activated with Enter. */
  onNodeClick?: (node: { id: string; label: string; group: string | null; connections: string[] }) => void;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /** Override the chart's strings (i18n). */
  labels?: Partial<NetworkGraphLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** Legend items for a network graph's groups (pass to ChartCard's `legend`). */
export function networkLegend(groups: readonly NetworkGroup[]): LegendItem[] {
  return groups.map((g, i) => ({
    label: g.label ?? g.id,
    color: slotColor(g.color ?? (i < 8 ? i + 1 : 0)),
    kind: "rect" as const,
  }));
}
