import { type ReactNode } from "react";

import { type ChartInstructions } from "../chart-utils";
import { type SankeyNode, type SankeyLink, type SankeyAlign } from "./layout";

/* ======================================================================
 * Component
 * ====================================================================== */

/**
 * Every string SankeyChart speaks or shows, so it can be translated: pass a `Partial` as the `labels`
 * prop. Entries that need a value are functions.
 */
export type SankeyChartLabels = {
  /** Announced for the chart. */
  roleDescription: string;
  /** Appended to the accessible name: how to read it with the keyboard. */
  instructions: ChartInstructions;
  /** Shown in the readout band of a narrow chart while nothing is being read. */
  hint: string;
  /** Tooltip rows of a node. */
  inflow: string;
  outflow: string;
  ofTotal: string;
  /** Tooltip rows of a link: its share of the source's outflow / the target's inflow. */
  ofSource: (source: string) => string;
  ofTarget: (target: string) => string;
  /** Title of a link: "Source → Target". */
  linkTitle: (source: string, target: string) => string;
  /** Announced after a node's values. */
  linkCount: (count: number) => string;
};

/**
 * The built-in English strings of SankeyChart; spread it into your own `labels` and change what you
 * need. This module is a client module, so use it from client code, not from a Server Component.
 */
export const defaultSankeyChartLabels: SankeyChartLabels = {
  roleDescription: "sankey diagram",
  instructions:
    "Use the arrow keys to read it: up and down move between the nodes of a column, right and left follow the flows out of and into a node.",
  hint: "Tap a node or a flow to trace it",
  inflow: "in",
  outflow: "out",
  ofTotal: "of all flow",
  ofSource: (source) => `of ${source} outflow`,
  ofTarget: (target) => `of ${target} inflow`,
  linkTitle: (source, target) => `${source} → ${target}`,
  linkCount: (count) => `${count} ${count === 1 ? "flow" : "flows"}`,
};

/**
 * Props of SankeyChart. The component's own doc comment describes its behaviour, keyboard use and
 * accessibility.
 */
export type SankeyChartProps = {
  /** Flows between nodes. A node named only here is created with its id as the label. */
  links: readonly SankeyLink[];
  /** Names, colours and order of the nodes. Optional. */
  nodes?: readonly SankeyNode[];
  /** Sets the height of the diagram in px. Default 360. */
  height?: number;
  /** Sets the width of a node bar in px (≤ 24). Default 12. */
  nodeWidth?: number;
  /** Gap between the nodes of a column in px. Default 16. */
  nodePadding?: number;
  /**
   * Column of each node: "justify" (default: sinks go to the last column), "left" (by distance
   * from a source), "right" (by distance to a sink) or "center".
   */
  align?: SankeyAlign;
  /** Ribbon colour: a gradient from the source's colour to the target's (default), or either one. */
  linkColor?: "gradient" | "source" | "target";
  /** Narrowest space between two columns in px; a narrower card scrolls the diagram sideways. Default 96. */
  minColumnWidth?: number;
  /** Formats a flow value for the labels, tooltips and data table: takes the number, returns the text shown. Default: formatCompact in `locale`. */
  format?: (n: number) => string;
  /** Formats a share as text (0–1). Default: percentages in `locale`. */
  formatPercent?: (ratio: number) => string;
  /** Locale of the default number formats. Default "en". */
  locale?: string;
  /** Called on click / Enter on a node. */
  onNodeClick?: (node: { id: string; label: string; inflow: number; outflow: number }) => void;
  /** Called on click / Enter on a flow. */
  onLinkClick?: (link: { source: string; target: string; value: number }) => void;
  /** Shown when there is nothing to plot. */
  emptyState?: ReactNode;
  /**
   * Tell nodes apart without colour (hatch fills, one per node colour; the first colour stays solid). Ribbons keep
   * their source-to-target gradient. Default: on when the chart has more than 3 node colours.
   *
   * @default true when node colours > 3
   */
  patterns?: boolean;
  /** Override the chart's strings (i18n). */
  labels?: Partial<SankeyChartLabels>;
  /** Names the chart for assistive tech (required). */
  "aria-label": string;
  /** Adds extra classes to the outer element. */
  className?: string;
};
