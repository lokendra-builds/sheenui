import { useMemo, useState } from "react";
import { formatCompact, useToast } from "@sheenui/theme";
import { ChartCard } from "../layout/ExampleChartCard";
import { ChartStage } from "../layout/ShowcaseStage.chart.scene";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { href } from "../router";
import { Segmented } from "../layout/Segmented";
import { Treemap, TreemapTable, treemapLegend, type TreemapNode } from "@sheenui/theme";
import { WaterfallChart, WaterfallTable, waterfallLegend, type WaterfallStep } from "@sheenui/theme";
import { BarList, BarListTable, type BarListItem } from "@sheenui/theme";
import * as PROPS from "../generated/component-props";
import { ControlLabel, Controls } from "./ChartsHeatmapFunnelPages/shared";

/* ====================================================================== */
/* Treemap                                                                 */
/* ====================================================================== */

const cloudSpend: Record<"q3" | "q4", TreemapNode[]> = {
  q3: [
    {
      label: "Engineering",
      color: 1,
      children: [
        { label: "Compute", value: 182000 },
        { label: "Databases", value: 96000 },
        { label: "Storage", value: 64000 },
        { label: "CI / CD", value: 41000 },
        { label: "Observability", value: 28000 },
        { label: "Dev boxes", value: 12000 },
      ],
    },
    {
      label: "Data",
      color: 7,
      children: [
        { label: "Warehouse", value: 118000 },
        { label: "ML training", value: 87000 },
        { label: "Pipelines", value: 52000 },
        { label: "Notebooks", value: 9000 },
      ],
    },
    {
      label: "Product",
      color: 3,
      children: [
        { label: "CDN", value: 39000 },
        { label: "Search", value: 22000 },
        { label: "Media", value: 17000 },
        { label: "Email", value: 9000 },
      ],
    },
    {
      label: "Security",
      color: 2,
      children: [
        { label: "SIEM", value: 31000 },
        { label: "WAF", value: 14000 },
        { label: "Secrets", value: 4000 },
      ],
    },
  ],
  q4: [
    {
      label: "Engineering",
      color: 1,
      children: [
        { label: "Compute", value: 158000 },
        { label: "Databases", value: 104000 },
        { label: "Storage", value: 71000 },
        { label: "CI / CD", value: 33000 },
        { label: "Observability", value: 36000 },
        { label: "Dev boxes", value: 15000 },
      ],
    },
    {
      label: "Data",
      color: 7,
      children: [
        { label: "Warehouse", value: 126000 },
        { label: "ML training", value: 142000 },
        { label: "Pipelines", value: 48000 },
        { label: "Notebooks", value: 11000 },
      ],
    },
    {
      label: "Product",
      color: 3,
      children: [
        { label: "CDN", value: 44000 },
        { label: "Search", value: 26000 },
        { label: "Media", value: 21000 },
        { label: "Email", value: 8000 },
      ],
    },
    {
      label: "Security",
      color: 2,
      children: [
        { label: "SIEM", value: 34000 },
        { label: "WAF", value: 15000 },
        { label: "Secrets", value: 5000 },
      ],
    },
  ],
};

const bundle: TreemapNode[] = [
  { label: "react-dom", value: 132 },
  { label: "motion", value: 58 },
  { label: "@base-ui/react", value: 46 },
  { label: "app code", value: 41 },
  { label: "router", value: 18 },
  { label: "intl polyfills", value: 14 },
  { label: "react", value: 8 },
  { label: "clsx", value: 1 },
  { label: "tailwind-merge", value: 9 },
  { label: "date utils", value: 6 },
];

/** $4.2M · −$1.6M (the sign goes before the currency symbol). */
const usd = (n: number) => `${n < 0 ? "\u2212" : ""}$${formatCompact(Math.abs(n))}`;

const kb = (n: number) => `${Math.round(n)} kB`;

/** The "Treemap" docs page (/charts/treemap): live examples, props and notes. */
export function TreemapPage() {
  const toast = useToast();
  const [quarter, setQuarter] = useState<"q3" | "q4">("q4");
  const [path, setPath] = useState<string[]>([]);
  const data = cloudSpend[quarter];

  return (
    <Page
      eyebrow="Chart"
      title="Treemap"
      description="Part-to-whole as nested rectangles. The layout is the squarified algorithm (implemented in the file, no dependency), so tiles stay close to square and can be compared. Labels appear only where they fit, in black or white by contrast, and groups zoom open with a transform-only layout animation."
      source="theme/src/components/charts/treemap.tsx"
    >
      <ChartStage label="Treemap demo" title="Cloud spend" hue={1} height="22rem">
        <Treemap
          data={cloudSpend.q4}
          format={usd}
          aria-label="Cloud spend by team and service"
          labels={{ breadcrumb: "Treemap level, hero demo" }}
        />
      </ChartStage>
      <Example
        title="Cloud spend, zoomable"
        description="Each team keeps one palette slot and its services share the hue. Click a team (or focus the chart, move with the arrow keys and press Enter) to zoom in; the breadcrumb or Escape zooms back out. Switching the quarter re-flows the tiles."
        variant="bare"
        controls={
          <Controls>
            <ControlLabel>Quarter</ControlLabel>
            <Segmented
              label="Quarter shown in the treemap"
              size="sm"
              options={[
                { value: "q3", label: "Q3" },
                { value: "q4", label: "Q4" },
              ]}
              value={quarter}
              onValueChange={setQuarter}
            />
          </Controls>
        }
        code={`
import { useState } from "react";
import { ChartCard, formatCompact, treemapLegend, TreemapTable, Treemap, type TreemapNode } from "@sheenui/theme";

const usd = (n: number) => "$" + formatCompact(n);

const spend: TreemapNode[] = [
  {
    label: "Engineering",
    color: 1,
    children: [
      { label: "Compute", value: 158000 },
      { label: "Storage", value: 64000 },
      { label: "CDN", value: 21000 },
    ],
  },
  {
    label: "Data",
    color: 7,
    children: [
      { label: "Warehouse", value: 92000 },
      { label: "Streaming", value: 37000 },
    ],
  },
  {
    label: "Support",
    color: 3,
    children: [
      { label: "Tooling", value: 18000 },
      { label: "Telephony", value: 12000 },
    ],
  },
];

export function Example() {
  const [path, setPath] = useState<string[]>([]);
  return (
    <ChartCard
      title="Cloud spend"
      legend={treemapLegend(spend)}
      table={<TreemapTable data={spend} format={usd} />}
    >
      <Treemap
        data={spend}
        format={usd}
        path={path} // optional: control the zoom level
        onPathChange={setPath}
        aria-label="Cloud spend by team and service"
      />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Cloud spend"
          description={`${quarter.toUpperCase()} 2026, by team and service`}
          aside={
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              {usd(data.reduce((s, g) => s + (g.children ?? []).reduce((t, c) => t + (c.value ?? 0), 0), 0))}
            </span>
          }
          legend={treemapLegend(data)}
          table={
            <TreemapTable
              data={data}
              format={usd}
              caption="Cloud spend by team and service"
              headers={{ ofParent: "% of team" }}
            />
          }
        >
          <Treemap
            data={data}
            format={usd}
            path={path}
            onPathChange={setPath}
            height={340}
            labels={{ root: "All teams", ofParent: (team) => `of ${team}` }}
            aria-label={`Cloud spend by team and service, ${quarter.toUpperCase()}`}
          />
        </ChartCard>
      </Example>

      <Example
        title="Flat data, one hue"
        description="Without groups every tile is the same series, so it takes one hue and needs no legend; size alone carries the value. Tiny tiles stay unlabelled rather than overflow, and the tooltip and table still read them. Click a tile to handle it."
        variant="bare"
        code={`
import { Treemap, useToast, type TreemapNode } from "@sheenui/theme";

const bundle: TreemapNode[] = [
  { label: "react-dom", value: 132 },
  { label: "motion", value: 58 },
  { label: "lucide-react", value: 34 },
  { label: "date-fns", value: 21 },
  { label: "zod", value: 14 },
];

export function Example() {
  const toast = useToast();
  return (
    <Treemap
      data={bundle}
      color={7}
      format={(n) => \`\${n} kB\`}
      onNodeClick={(node) => toast.info(node.label)}
      aria-label="JavaScript bundle size by package"
    />
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Bundle size"
          description="Gzipped kB by package"
          table={<TreemapTable data={bundle} format={kb} caption="Bundle size by package" />}
        >
          <Treemap
            data={bundle}
            color={7}
            height={260}
            format={kb}
            onNodeClick={(node) => toast.info(node.label, `${kb(node.value)} gzipped`)}
            aria-label="JavaScript bundle size by package"
          />
        </ChartCard>
      </Example>

      <PropsTable title="Treemap" of={PROPS.Treemap} />
      <PropsTable
        as="h2"
        title="TreemapTable props, treemapLegend and squarify"
        of={PROPS.TreemapTable}
        rows={[
          ["treemapLegend(data)", "LegendItem[]", "", "Legend items for the top-level groups, for ChartCard's legend."],
          ["squarify(values, rect)", "TreemapRect[]", "", "The layout on its own: one rect per value, in input order."],
        ]}
      />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["Arrow keys", "Move spatially between tiles."],
          ["Home / End", "Largest / smallest tile."],
          ["Enter", "Zoom into the group (with drillDown)."],
          ["Escape / Backspace", "Zoom back out."],
        ]}
      />
      <A11yNotes
        notes={[
          "The chart is a focusable figure named by its aria-label and described by the reading hint (and the drill-down hint when it is on); zooming is announced, and the breadcrumb is real buttons.",
          "TreemapTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight. It lists every node.",
          "Reduced motion: the tiles appear at their final sizes and data changes jump instead of morphing.",
        ]}
      />
    </Page>
  );
}

/* ====================================================================== */
/* Waterfall                                                               */
/* ====================================================================== */

const pnl: Record<"fy26" | "fy25", WaterfallStep[]> = {
  fy26: [
    { label: "Revenue", value: 4_200_000, kind: "start" },
    { label: "Cost of sales", value: -1_640_000 },
    { label: "Gross profit", kind: "subtotal" },
    { label: "Marketing", value: -620_000 },
    { label: "R&D", value: -880_000 },
    { label: "G&A", value: -310_000 },
    { label: "Other income", value: 120_000 },
    { label: "Tax", value: -190_000 },
    { label: "Net income", kind: "total" },
  ],
  fy25: [
    { label: "Revenue", value: 3_480_000, kind: "start" },
    { label: "Cost of sales", value: -1_510_000 },
    { label: "Gross profit", kind: "subtotal" },
    { label: "Marketing", value: -710_000 },
    { label: "R&D", value: -840_000 },
    { label: "G&A", value: -290_000 },
    { label: "Other income", value: 60_000 },
    { label: "Tax", value: -40_000 },
    { label: "Net income", kind: "total" },
  ],
};

const cash: WaterfallStep[] = [
  { label: "Opening cash", value: 180_000, kind: "start" },
  { label: "Customer receipts", value: 96_000 },
  { label: "Payroll", value: -168_000 },
  { label: "Suppliers", value: -74_000 },
  { label: "Loan drawdown", value: 50_000 },
  { label: "Rent", value: -21_000 },
  { label: "Closing cash", kind: "total" },
];

/** The "Waterfall chart" docs page (/charts/waterfall-chart): live examples, props and notes. */
export function WaterfallChartPage() {
  const [year, setYear] = useState<"fy26" | "fy25">("fy26");
  const data = pnl[year];

  return (
    <Page
      eyebrow="Chart"
      title="Waterfall chart"
      description="A running total broken into its steps: a starting amount, increases and decreases floating from the previous level, then subtotals and a total from zero, joined by hairline connectors. Increases and decreases are the two poles of the diverging pair, totals are the neutral midpoint, and every step also carries a signed label, so color is never the only signal."
      source="theme/src/components/charts/waterfall-chart.tsx"
    >
      <ChartStage label="Waterfall chart demo" title="Profit and loss" hue={1} height="17.5rem" narrowHeight="22.75rem">
        <WaterfallChart data={pnl.fy26} format={usd} aria-label="Profit and loss, FY26" />
      </ChartStage>
      <Example
        title="Annual results, step by step"
        description="Switch the year to see every bar morph to its new place. Below 480px, or as soon as a step name wouldn't fit whole under its column, it turns into horizontal bars. Hover, tap or use the arrow keys for each step's change and running total."
        variant="bare"
        controls={
          <Controls>
            <ControlLabel>Year</ControlLabel>
            <Segmented
              label="Financial year"
              size="sm"
              options={[
                { value: "fy26", label: "FY26" },
                { value: "fy25", label: "FY25" },
              ]}
              value={year}
              onValueChange={setYear}
            />
          </Controls>
        }
        code={`
import { ChartCard, formatCompact, waterfallLegend, WaterfallTable, WaterfallChart, type WaterfallStep } from "@sheenui/theme";

const usd = (n: number) => (n < 0 ? "\u2212" : "") + "$" + formatCompact(Math.abs(n));

const steps: WaterfallStep[] = [
  { label: "Revenue", value: 4200000, kind: "start" },
  { label: "Cost of sales", value: -1640000 },
  { label: "Gross profit", kind: "subtotal" },
  { label: "Marketing", value: -620000 },
  { label: "R&D", value: -910000 },
  { label: "Net income", kind: "total" },
];

export function Example() {
  return (
    <ChartCard title="Profit and loss" legend={waterfallLegend()} table={<WaterfallTable data={steps} format={usd} />}>
      <WaterfallChart data={steps} format={usd} aria-label="Profit and loss, FY26" />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Profit and loss"
          description={year === "fy26" ? "Financial year 2026 results" : "Financial year 2025 results"}
          legend={waterfallLegend()}
          table={<WaterfallTable data={data} format={usd} caption="Profit and loss table" />}
        >
          <WaterfallChart data={data} format={usd} aria-label={`Profit and loss, ${year.toUpperCase()}`} />
        </ChartCard>
      </Example>

      <Example
        title="Cash flow, horizontal"
        description="Horizontal at every width, for long step names. The running total dips below its start mid-month; the zero line firms up only when values cross it."
        variant="bare"
        code={`
import { WaterfallChart, formatCompact, type WaterfallStep } from "@sheenui/theme";

const usd = (n: number) => (n < 0 ? "\u2212" : "") + "$" + formatCompact(Math.abs(n));

const cash: WaterfallStep[] = [
  { label: "Opening cash", value: 180000, kind: "start" },
  { label: "Customer receipts", value: 96000 },
  { label: "Payroll", value: -168000 },
  { label: "Suppliers", value: -74000 },
  { label: "Closing cash", kind: "total" },
];

export function Example() {
  return (
    <WaterfallChart
      data={cash}
      layout="horizontal"
      format={usd}
      labels={{ increase: "Inflow", decrease: "Outflow", total: "Balance" }}
      aria-label="Cash flow in October"
    />
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Cash flow"
          description="Net cash movement in October 2026 by step"
          legend={waterfallLegend({ increase: "Inflow", decrease: "Outflow", total: "Balance" })}
          table={<WaterfallTable data={cash} format={usd} caption="Cash flow in October" />}
        >
          <WaterfallChart
            data={cash}
            layout="horizontal"
            format={usd}
            labels={{ increase: "Inflow", decrease: "Outflow", total: "Balance" }}
            aria-label="Cash flow in October 2026"
          />
        </ChartCard>
      </Example>

      <PropsTable title="WaterfallChart" of={PROPS.WaterfallChart} />
      <PropsTable
        as="h2"
        title="WaterfallTable props and waterfallLegend"
        of={PROPS.WaterfallTable}
        rows={[
          [
            "waterfallLegend(labels?, colors?)",
            "LegendItem[]",
            "",
            "Returns the increase / decrease / total legend items for ChartCard.",
          ],
        ]}
      />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["Arrow keys", "Move between steps."],
          ["Home / End", "Jump to the first / last step."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "Keyboard and screen-reader users get a single focusable figure labelled by the chart title, with a short reading hint as its description; inside a ChartCard with a table view, aria-details links it to the table. Every value read is announced politely, once. Every change carries a signed label (+ or −) and bars grow in their own direction, so color is never the only signal.",
          "WaterfallTable is the same data as a real table. Pass it to ChartCard's table prop and the Chart / Table tabs let anyone read every value without color or sight.",
          "With reduced motion on, the bars start at their final values and a data change jumps straight to the new state.",
        ]}
      />
    </Page>
  );
}

/* ====================================================================== */
/* Bar list                                                                */
/* ====================================================================== */

const referrers: BarListItem[] = [
  { name: "Searchly", value: 4821 },
  { name: "Direct", value: 3407 },
  { name: "codehost.example", value: 2118 },
  { name: "Hacker News", value: 1640 },
  { name: "Short posts", value: 912 },
  { name: "Forums", value: 704 },
  { name: "Career network", value: 498 },
  { name: "Private search", value: 341 },
  { name: "Lookup", value: 287 },
  { name: "Newsletter", value: 214 },
  { name: "Product Hunt", value: 166 },
  { name: "dev.to", value: 98 },
];

function topPages(range: "7d" | "30d"): BarListItem[] {
  const base: [string, number, number][] = [
    ["/effects/liquid-glass", 2140, 9210],
    ["/components/button", 1380, 4120],
    ["/charts", 920, 5840],
    ["/blocks/dashboard-stats", 610, 2210],
    ["/components/data-table", 1240, 3890],
    ["/foundations", 480, 1720],
  ];
  return base.map(([path, week, month]) => ({ name: path, value: range === "7d" ? week : month, href: href(path) }));
}

const pageIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round">
    <path d="M4 1.75h5.25L12.5 5v9.25H4z" />
    <path d="M9 1.75V5.25h3.5" />
  </svg>
);

/** The "Bar list" docs page (/charts/bar-list): live examples, props and notes. */
export function BarListPage() {
  const toast = useToast();
  const [range, setRange] = useState<"7d" | "30d">("7d");
  const pages = useMemo(() => topPages(range).map((p) => ({ ...p, icon: pageIcon })), [range]);

  return (
    <Page
      eyebrow="Chart"
      title="Bar list"
      description="A ranked list with each value drawn as a soft bar behind its name: the most compact way to compare many named values, and a plain list to screen readers. One hue for the whole list (the names are categories of one measure), a solid data end on each bar, and text in text colors."
      source="theme/src/components/charts/bar-list.tsx"
    >
      <ChartStage label="Bar list demo" title="Top referrers" hue={1} height="15rem">
        <BarList
          data={referrers}
          limit={5}
          showShare
          nameHeader="Source"
          valueHeader="Visitors"
          aria-label="Visitors by referrer"
        />
      </ChartStage>
      <Example
        title="Top referrers, top 5"
        description="Shows the top five; “Show more” reveals the rest without rescaling the bars, since every bar shares the list's largest value. Rows are buttons here: click or press Enter to filter by a source."
        variant="bare"
        code={`
import { useState } from "react";
import { ChartCard, BarListTable, BarList, type BarListItem } from "@sheenui/theme";

const referrers: BarListItem[] = [
  { name: "Searchly", value: 4821 },
  { name: "Direct", value: 3207 },
  { name: "codehost.example", value: 1342 },
  { name: "Hacker News", value: 655 },
  { name: "Lookup", value: 287 },
  { name: "Newsletter", value: 214 },
];

export function Example() {
  const [filter, setFilter] = useState<string | null>(null);
  return (
    <ChartCard title="Top referrers" description={filter ? "Filtered by " + filter : "All sources"} table={<BarListTable data={referrers} />}>
      <BarList
        data={referrers}
        limit={5}
        showShare
        nameHeader="Source"
        valueHeader="Visitors"
        onValueChange={(item) => setFilter(item.name)}
        aria-label="Visitors by referrer"
      />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Top referrers"
          description="Visitors, last 7 days"
          table={
            <BarListTable
              data={referrers}
              caption="Visitors by referrer"
              headers={{ name: "Source", value: "Visitors" }}
            />
          }
        >
          <BarList
            data={referrers}
            limit={5}
            showShare
            nameHeader="Source"
            valueHeader="Visitors"
            onValueChange={(item) => toast.info(`Filtered by ${item.name}`, `${formatCompact(item.value)} visitors`)}
            aria-label="Visitors by referrer"
          />
        </ChartCard>
      </Example>

      <Example
        title="Top pages, linked and re-ranked"
        description="Each row is a link (the whole row is its hit area) with an icon. Switch the range: rows glide to their new rank and bars resize, with transform-only animation that's instant under reduced motion. Where a short bar would end inside a name, its solid end becomes two ticks above and below the text."
        variant="bare"
        controls={
          <Controls>
            <ControlLabel>Range</ControlLabel>
            <Segmented
              label="Date range of the list"
              size="sm"
              options={[
                { value: "7d", label: "7 days" },
                { value: "30d", label: "30 days" },
              ]}
              value={range}
              onValueChange={setRange}
            />
          </Controls>
        }
        code={`
import { BarList, type BarListItem } from "@sheenui/theme";

const pageIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round">
    <path d="M4 1.75h5.25L12.5 5v9.25H4z" />
    <path d="M9 1.75V5.25h3.5" />
  </svg>
);

const pages: BarListItem[] = [
  { name: "/docs/getting-started", value: 2140, href: "/docs/getting-started", icon: pageIcon },
  { name: "/components/button", value: 1380, href: "/components/button", icon: pageIcon },
  { name: "/charts", value: 920, href: "/charts", icon: pageIcon },
  { name: "/foundations", value: 480, href: "/foundations", icon: pageIcon },
];

export function Example() {
  return <BarList data={pages} color={3} nameHeader="Page" valueHeader="Views" aria-label="Most viewed pages" />;
}`}
      >
        <ChartCard
          className="w-full"
          title="Top pages"
          description={range === "7d" ? "Views, last 7 days" : "Views, last 30 days"}
          table={<BarListTable data={pages} caption="Most viewed pages" headers={{ name: "Page", value: "Views" }} />}
        >
          <BarList data={pages} color={3} nameHeader="Page" valueHeader="Views" aria-label="Most viewed pages" />
        </ChartCard>
      </Example>

      <PropsTable title="BarList" of={PROPS.BarList} />
      <PropsTable as="h3" title="BarListTable" of={PROPS.BarListTable} />
      <KeyboardTable
        rows={[
          [
            "Tab",
            "Move to each row that is a button (onValueChange) or a link (href), and to “Show more”. A plain list has no tab stops.",
          ],
          ["Enter / Space on a button row", "Activate it (for example, filter by that row)."],
          ["Enter on a link row", "Follow the link."],
          ["Enter / Space on Show more", "Reveal the remaining rows."],
        ]}
      />
      <A11yNotes
        notes={[
          "The list is a real <ul>, so screen readers read each row's name, value and (with showShare) share as text. aria-label names the list and is required.",
          "Interactive rows have a solid inset focus ring and are ordinary tab stops.",
          "For a non-visual reading, give ChartCard's table prop a BarListTable; the Chart / Table tabs then expose each value as plain table cells.",
          "Under reduced motion nothing morphs: the bars render at their final lengths and new data replaces the old at once.",
        ]}
      />
    </Page>
  );
}
