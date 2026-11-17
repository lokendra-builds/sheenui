import type { Readout } from "../chart-fit";
import type { SankeyLayoutLink, SankeyLayoutNode } from "./layout";
import type { SankeyChartLabels } from "./model";

/** The strings and formatters a Sankey readout is made of. @internal */
export type SankeyReadoutInput = {
  format: (v: number) => string;
  pct: (v: number) => string;
  labels: Pick<SankeyChartLabels, "inflow" | "outflow" | "ofTotal" | "linkTitle" | "ofSource" | "ofTarget">;
};

/** The tooltip rows of one node: its inflow, outflow and share of the diagram total. @internal */
export function sankeyNodeReadout(n: SankeyLayoutNode, o: SankeyReadoutInput & { total: number }): Readout {
  const { total, format, pct, labels } = o;
  const rows = [];
  if (n.targetLinks.length > 0)
    rows.push({ label: labels.inflow, value: format(n.inflow), color: n.color, kind: "rect" as const });
  if (n.sourceLinks.length > 0)
    rows.push({
      label: labels.outflow,
      value: format(n.outflow),
      color: n.targetLinks.length > 0 ? "transparent" : n.color,
      kind: "rect" as const,
    });
  if (total > 0)
    rows.push({
      label: labels.ofTotal,
      value: pct(n.value / total),
      color: "transparent",
      kind: "rect" as const,
    });
  return { title: n.label, rows };
}

/** The tooltip rows of one link: its value and its share of the source's outflow and the target's inflow. @internal */
export function sankeyLinkReadout(l: SankeyLayoutLink, o: SankeyReadoutInput): Readout {
  const { format, pct, labels } = o;
  return {
    title: labels.linkTitle(l.source.label, l.target.label),
    rows: [
      { label: "", value: format(l.value), color: l.source.color, kind: "rect" },
      {
        label: labels.ofSource(l.source.label),
        value: pct(l.source.outflow > 0 ? l.value / l.source.outflow : NaN),
        color: "transparent",
        kind: "rect",
      },
      {
        label: labels.ofTarget(l.target.label),
        value: pct(l.target.inflow > 0 ? l.value / l.target.inflow : NaN),
        color: "transparent",
        kind: "rect",
      },
    ],
  };
}
