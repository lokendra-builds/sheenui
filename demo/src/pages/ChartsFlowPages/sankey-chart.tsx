import { startTransition, useState } from "react";
import { Example } from "../../layout/Example";
import { Segmented } from "../../layout/Segmented";
import { SankeyChart, SankeyTable, type SankeyLink, type SankeyNode } from "@sheenui/theme";
import { ChartCard, Headline } from "./shared";

/* ====================================================================== */
/* Sankey                                                                 */
/* ====================================================================== */

export const journeyNodes: SankeyNode[] = [
  { id: "organic", label: "Organic search", color: 1 },
  { id: "paid", label: "Paid ads", color: 2 },
  { id: "social", label: "Social", color: 5 },
  { id: "referral", label: "Referrals", color: 3 },
  { id: "pricing", label: "Pricing page", color: 7 },
  { id: "docs", label: "Docs", color: 4 },
  { id: "trial", label: "Started trial", tone: "success" },
  { id: "left", label: "Left", tone: "danger" },
];

export const journeyWeeks: Record<"this" | "last", SankeyLink[]> = {
  this: [
    { source: "organic", target: "pricing", value: 4200 },
    { source: "organic", target: "docs", value: 3100 },
    { source: "paid", target: "pricing", value: 2600 },
    { source: "paid", target: "docs", value: 600 },
    { source: "social", target: "pricing", value: 900 },
    { source: "social", target: "docs", value: 1300 },
    { source: "referral", target: "pricing", value: 1500 },
    { source: "referral", target: "docs", value: 700 },
    { source: "pricing", target: "trial", value: 3800 },
    { source: "pricing", target: "left", value: 5400 },
    { source: "docs", target: "trial", value: 2100 },
    { source: "docs", target: "left", value: 3600 },
  ],
  last: [
    { source: "organic", target: "pricing", value: 3600 },
    { source: "organic", target: "docs", value: 2900 },
    { source: "paid", target: "pricing", value: 3400 },
    { source: "paid", target: "docs", value: 800 },
    { source: "social", target: "pricing", value: 600 },
    { source: "social", target: "docs", value: 900 },
    { source: "referral", target: "pricing", value: 1100 },
    { source: "referral", target: "docs", value: 500 },
    { source: "pricing", target: "trial", value: 2900 },
    { source: "pricing", target: "left", value: 5800 },
    { source: "docs", target: "trial", value: 1500 },
    { source: "docs", target: "left", value: 3600 },
  ],
};

export const incomeNodes: SankeyNode[] = [
  { id: "subs", label: "Subscriptions", color: 1 },
  { id: "services", label: "Services", color: 3 },
  { id: "market", label: "Marketplace", color: 7 },
  { id: "revenue", label: "Revenue", color: 1 },
  { id: "gross", label: "Gross profit", tone: "success" },
  { id: "cogs", label: "Cost of revenue", tone: "danger" },
  { id: "op", label: "Operating profit", tone: "success" },
  { id: "rnd", label: "R&D", color: 2 },
  { id: "snm", label: "Sales & marketing", color: 5 },
  { id: "gna", label: "G&A", color: 4 },
];

export const incomeLinks: SankeyLink[] = [
  { source: "subs", target: "revenue", value: 8_200_000 },
  { source: "services", target: "revenue", value: 1_600_000 },
  { source: "market", target: "revenue", value: 900_000 },
  { source: "revenue", target: "gross", value: 7_600_000 },
  { source: "revenue", target: "cogs", value: 3_100_000 },
  { source: "gross", target: "rnd", value: 2_600_000 },
  { source: "gross", target: "snm", value: 2_200_000 },
  { source: "gross", target: "gna", value: 700_000 },
  { source: "gross", target: "op", value: 2_100_000 },
];

export const hiringLinks: SankeyLink[] = [
  { source: "Applied", target: "Screened", value: 640 },
  { source: "Applied", target: "Not a fit", value: 1180 },
  { source: "Screened", target: "Interviewed", value: 260 },
  { source: "Screened", target: "Withdrew", value: 90 },
  { source: "Screened", target: "Not a fit ", value: 290 },
  { source: "Interviewed", target: "Offer", value: 48 },
  { source: "Interviewed", target: "Rejected", value: 212 },
  { source: "Offer", target: "Hired", value: 41 },
  { source: "Offer", target: "Declined", value: 7 },
];

export const hiringNodes: SankeyNode[] = [
  { id: "Applied", color: 1 },
  { id: "Screened", color: 7 },
  { id: "Interviewed", color: 3 },
  { id: "Offer", color: 5 },
  { id: "Hired", tone: "success" },
  { id: "Not a fit", tone: "danger" },
  { id: "Not a fit ", label: "Not a fit", tone: "danger" },
  { id: "Withdrew", color: 4 },
  { id: "Rejected", color: 8 },
  { id: "Declined", color: 2 },
];

/** Each interactive example keeps its own state, so switching it re-renders only that example. */
export function JourneyExample() {
  const [week, setWeek] = useState<"this" | "last">("this");
  const links = journeyWeeks[week];
  const visitors = links.filter((l) => l.target === "pricing" || l.target === "docs").reduce((s, l) => s + l.value, 0);
  return (
    <Example
      title="Customer journey, morphing week to week"
      description="Ribbons fade from the source's color into the target's. Switch the week: nodes slide and ribbons reshape instead of redrawing. Focus the chart and use the arrow keys: up and down within a column, right to follow a node's flows out, right again to the next node."
      variant="bare"
      controls={
        <Segmented
          label="Week"
          size="sm"
          options={[
            { value: "last", label: "Last week" },
            { value: "this", label: "This week" },
          ]}
          value={week}
          // A data switch re-renders the whole chart: as a transition, React renders it in slices (the click never blocks).
          onValueChange={(v) => startTransition(() => setWeek(v))}
        />
      }
      code={`
import { ChartCard, SankeyTable, SankeyChart, type SankeyNode, type SankeyLink } from "@sheenui/theme";

const nodes: SankeyNode[] = [
  { id: "organic", label: "Organic search", color: 1 },
  { id: "paid", label: "Paid ads", color: 2 },
  { id: "social", label: "Social", color: 5 },
  { id: "referral", label: "Referrals", color: 3 },
  { id: "pricing", label: "Pricing page", color: 7 },
  { id: "docs", label: "Docs", color: 4 },
  { id: "trial", label: "Started trial", tone: "success" },
  { id: "left", label: "Left", tone: "danger" },
];
const links: SankeyLink[] = [
  { source: "organic", target: "pricing", value: 4200 },
  { source: "organic", target: "docs", value: 3100 },
  { source: "paid", target: "pricing", value: 2600 },
  // ...
  { source: "pricing", target: "trial", value: 3800 },
  { source: "pricing", target: "left", value: 5400 },
  { source: "docs", target: "trial", value: 2100 },
  { source: "docs", target: "left", value: 3600 },
];

<ChartCard
  title="Customer journey"
  description="Visitors this week, by source and first page"
  table={<SankeyTable nodes={nodes} links={links} caption="Every flow" />}
>
  <SankeyChart nodes={nodes} links={links} aria-label="Where this week's visitors came from, and where they went" />
</ChartCard>`}
    >
      <ChartCard
        className="w-full"
        title="Customer journey"
        description={`Visitors ${week === "this" ? "this" : "last"} week, by source and first page`}
        aside={<Headline value={visitors} label="visitors" />}
        table={<SankeyTable nodes={journeyNodes} links={links} caption="Every flow" />}
      >
        <SankeyChart
          nodes={journeyNodes}
          links={links}
          aria-label={`Where ${week === "this" ? "this" : "last"} week's visitors came from, and where they went`}
        />
      </ChartCard>
    </Example>
  );
}
