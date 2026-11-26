import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { SankeyChart, SankeyTable } from "@sheenui/theme";
import { SunburstChart, SunburstTable, sunburstLegend } from "@sheenui/theme";
import { ChordDiagram, ChordTable, chordLegend } from "@sheenui/theme";
import { NetworkGraph, NetworkTable, networkLegend } from "@sheenui/theme";
import { MarimekkoChart, MarimekkoTable } from "@sheenui/theme";
import { seriesLegend } from "@sheenui/theme";
import * as PROPS from "../generated/component-props";
import { ChartStage } from "../layout/ShowcaseStage.chart.scene";
import {
  JourneyExample,
  hiringLinks,
  hiringNodes,
  incomeLinks,
  incomeNodes,
  journeyNodes,
  journeyWeeks,
} from "./ChartsFlowPages/sankey-chart";
import { CloudSpendExample, cloudSpend, browsers, bundle, formatShare } from "./ChartsFlowPages/sunburst-chart";
import { PlanChangesExample, planMoves, plans, reviews, teams } from "./ChartsFlowPages/chord-diagram";
import {
  ServiceMapExample,
  crew,
  crewGroups,
  serviceGroups,
  serviceLinks,
  services,
} from "./ChartsFlowPages/network-graph";
import {
  MarketMapExample,
  formatMillions,
  markets,
  products,
  regions,
  vendors,
} from "./ChartsFlowPages/marimekko-chart";
import { ChartCard, Headline, formatUsd } from "./ChartsFlowPages/shared";
import {} from "./ChartsFlowPages/shared";

const CHARTS = "theme/src/components/charts/";

/** The "Sankey diagram" docs page (/charts/sankey-diagram): live examples, props and notes. */
export function SankeyChartPage() {
  return (
    <Page
      eyebrow="Chart"
      title="Sankey diagram"
      description="Flows between stages, drawn as ribbons whose thickness is the amount: where visitors come from and where they go, how revenue turns into profit. The layout is computed in the component (no dependency): columns first, then a few relaxation passes so ribbons run as straight as possible. Hover a node to trace every path through it, hover a ribbon to read one flow, or walk the graph with the arrow keys."
      source={`${CHARTS}sankey-chart.tsx`}
    >
      <ChartStage
        label="Sankey diagram demo"
        title="Where visitors came from, and where they went"
        hue={1}
        height="22.5rem"
        dock="3.5rem"
      >
        <SankeyChart
          nodes={journeyNodes}
          links={journeyWeeks.this}
          aria-label="Where this week's visitors came from, and where they went"
        />
      </ChartStage>
      <JourneyExample />

      <Example
        title="Income statement, revenue to profit"
        description="Four columns from revenue streams to profit. Sinks line up in the last column (align justify, the default). Values use a currency format; labels move outside the diagram on wide cards and inside on narrow ones, and are only printed where they fit."
        variant="bare"
        code={`
import { SankeyChart } from "@sheenui/theme";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });

<SankeyChart
  nodes={[
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
  ]}
  links={[
    { source: "subs", target: "revenue", value: 8_200_000 },
    { source: "services", target: "revenue", value: 1_600_000 },
    { source: "market", target: "revenue", value: 900_000 },
    { source: "revenue", target: "gross", value: 7_600_000 },
    { source: "revenue", target: "cogs", value: 3_100_000 },
    { source: "gross", target: "rnd", value: 2_600_000 },
    { source: "gross", target: "snm", value: 2_200_000 },
    { source: "gross", target: "gna", value: 700_000 },
    { source: "gross", target: "op", value: 2_100_000 },
  ]}
  height={340}
  format={(n) => usd.format(n)}
  aria-label="Fiscal 2025 income statement, from revenue streams to operating profit"
/>`}
      >
        <ChartCard
          className="w-full"
          title="Income statement"
          description="Fiscal 2025"
          aside={<Headline value={2_100_000} label="operating profit" currency />}
          table={
            <SankeyTable nodes={incomeNodes} links={incomeLinks} format={formatUsd} caption="Income statement flows" />
          }
        >
          <SankeyChart
            nodes={incomeNodes}
            links={incomeLinks}
            height={340}
            format={formatUsd}
            aria-label="Fiscal 2025 income statement, from revenue streams to operating profit"
          />
        </ChartCard>
      </Example>

      <Example
        title="Hiring pipeline, aligned left, colored by source"
        description='align="left" puts every node at its distance from the start, so candidates who drop out early stop early. linkColor="source" paints each ribbon in its source stage. Nodes named only in links take their id as the label. On a phone the five columns scroll sideways inside the card.'
        variant="bare"
        code={`
import { SankeyChart } from "@sheenui/theme";

<SankeyChart
  align="left"
  linkColor="source"
  nodes={[
    { id: "Applied", color: 1 },
    { id: "Screened", color: 7 },
    { id: "Interviewed", color: 3 },
    { id: "Offer", color: 5 },
    { id: "Hired", tone: "success" },
    { id: "Not a fit", tone: "danger" },
    // Two nodes may share a label; give them different ids.
    { id: "Not a fit ", label: "Not a fit", tone: "danger" },
    { id: "Withdrew", color: 4 },
    { id: "Rejected", color: 8 },
    { id: "Declined", color: 2 },
  ]}
  links={[
    { source: "Applied", target: "Screened", value: 640 },
    { source: "Applied", target: "Not a fit", value: 1180 },
    { source: "Screened", target: "Interviewed", value: 260 },
    { source: "Screened", target: "Withdrew", value: 90 },
    { source: "Screened", target: "Not a fit ", value: 290 },
    { source: "Interviewed", target: "Offer", value: 48 },
    { source: "Interviewed", target: "Rejected", value: 212 },
    { source: "Offer", target: "Hired", value: 41 },
    { source: "Offer", target: "Declined", value: 7 },
  ]}
  aria-label="Engineering hiring pipeline, from application to hire"
/>`}
      >
        <ChartCard
          className="w-full"
          title="Hiring pipeline"
          description="Engineering roles, first half"
          aside={<Headline value={41} label="hired" />}
          table={<SankeyTable nodes={hiringNodes} links={hiringLinks} caption="Pipeline flows" />}
        >
          <SankeyChart
            align="left"
            linkColor="source"
            nodes={hiringNodes}
            links={hiringLinks}
            aria-label="Engineering hiring pipeline, from application to hire"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.SankeyChart} />
      <PropsTable title="SankeyTable" as="h3" of={PROPS.SankeyTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the diagram (one stop; a narrow card scrolls it sideways to keep the active node in view)."],
          ["↑ / ↓", "Previous / next node in the column; on a flow, the previous / next flow of the same node."],
          ["→ / ←", "Follow the node's first outgoing / incoming flow; on a flow, go on to its target / source node."],
          ["Home / End", "First node of the first column / last node of the last column."],
          ["Enter / Space", "Call onNodeClick or onLinkClick for the active node or flow."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes>
        <li>
          The diagram is one focusable figure with the role description “sankey diagram”; its description is the
          keyboard instructions.
        </li>
        <li>
          Keyboard moves are announced once through a polite live region (“Paid ads → Pricing page: 2.6K, 81% of Paid
          ads outflow, 28% of Pricing page inflow”); pointer hovers stay silent.
        </li>
        <li>
          The Table view (SankeyTable) lists every flow with its share of both ends: the color-free way to read it.
        </li>
        <li>
          On touch screens the first tap pins the readout in a band above the diagram; a second tap on the same mark
          activates it.
        </li>
        <li>
          Reduced motion: the diagram appears complete and data changes jump. Forced colors: ribbons and nodes take
          system colors and the active node gets a Highlight ring.
        </li>
      </A11yNotes>
    </Page>
  );
}

/** The "Sunburst chart" docs page (/charts/sunburst): live examples, props and notes. */
export function SunburstChartPage() {
  return (
    <Page
      eyebrow="Chart"
      title="Sunburst chart"
      description="A hierarchy as rings around a center: each ring is one level, each arc's angle its share. Hover an arc to trace its path from the center and read it there, where the number rolls to the new value. Click a group to zoom into it with an animated sweep; the breadcrumb, the center or Escape zoom back out."
      source={`${CHARTS}sunburst-chart.tsx`}
    >
      <ChartStage
        label="Sunburst chart demo"
        title="Cloud spend by service"
        hue={1}
        height="24.5rem"
        narrowHeight="19.25rem"
      >
        <SunburstChart data={cloudSpend} format={formatUsd} aria-label="Monthly cloud spend by service, hero demo" />
      </ChartStage>
      <CloudSpendExample />

      <div className="grid grid-cols-1 gap-6 *:min-w-0">
        <Example
          title="Bundle size, two rings"
          description="rings={2} shows two levels at a time; deeper ones appear as you zoom in. Arcs too thin for a name stay unlabelled and are read in the center, the tooltip and the table."
          variant="bare"
          code={`
import { SunburstChart, type SunburstNode } from "@sheenui/theme";

const bundle: SunburstNode[] = [
  {
    label: "node_modules",
    children: [
      { label: "react-dom", value: 132 },
      { label: "motion", value: 58 },
      { label: "@base-ui", children: [{ label: "dialog", value: 14 }, { label: "menu", value: 18 }, { label: "tabs", value: 9 }, { label: "utils", value: 22 }] },
      { label: "tailwind-merge", value: 21 },
      { label: "react", value: 8 },
    ],
  },
  {
    label: "src",
    children: [
      { label: "components", children: [{ label: "charts", value: 96 }, { label: "data-table", value: 41 }, { label: "forms", value: 37 }, { label: "overlays", value: 29 }] },
      { label: "pages", value: 64 },
      { label: "hooks", value: 9 },
    ],
  },
  { label: "styles", value: 31 },
];

export function Example() {
  return (
    <SunburstChart
      data={bundle}
      rings={2}
      height={300}
      format={(kb) => \`\${kb} kB\`}
      aria-label="Production bundle size by package and folder"
    />
  );
}`}
        >
          <ChartCard
            title="Bundle size"
            description="Production build, gzip kB"
            legend={sunburstLegend(bundle)}
            table={<SunburstTable data={bundle} format={(kb) => `${kb} kB`} caption="Bundle size by module" />}
          >
            <SunburstChart
              data={bundle}
              rings={2}
              height={300}
              format={(kb) => `${kb} kB`}
              aria-label="Production bundle size by package and folder"
            />
          </ChartCard>
        </Example>

        <Example
          title="Flat data: one ring"
          description="Without children a sunburst is a single ring, like a donut; every arc gets its own slot. Values below a sliver still get a hairline arc."
          variant="bare"
          code={`
import { SunburstChart } from "@sheenui/theme";

<SunburstChart
  data={[
    { label: "Chrome", value: 64.8 },
    { label: "Safari", value: 18.6 },
    { label: "Edge", value: 5.3 },
    { label: "Firefox", value: 2.7 },
    { label: "Mobile", value: 2.4 },
    { label: "Other", value: 6.2 },
  ]}
  height={300}
  format={(n) => \`\${n.toFixed(1)}%\`}
  aria-label="Browser share of sessions"
/>`}
        >
          <ChartCard
            title="Browser share"
            description="Sessions, last 30 days"
            legend={sunburstLegend(browsers)}
            table={<SunburstTable data={browsers} format={formatShare} caption="Sessions by browser" />}
          >
            <SunburstChart data={browsers} height={300} format={formatShare} aria-label="Browser share of sessions" />
          </ChartCard>
        </Example>
      </div>

      <PropsTable of={PROPS.SunburstChart} />
      <PropsTable as="h2" title="SunburstTable props" of={PROPS.SunburstTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the breadcrumb buttons, then the chart (one stop)."],
          ["← / →", "Previous / next arc in the ring (wraps around)."],
          ["↓", "Out to the arc's first child."],
          ["↑", "Back in to its parent."],
          ["Home / End", "First / last arc of the ring."],
          ["Enter / Space", "Zoom into the group (onNodeClick for an arc with nothing to zoom into)."],
          ["Escape / Backspace", "Zoom out one level; at the top, Escape clears the reading."],
        ]}
      />
      <A11yNotes>
        <li>
          The chart is one focusable figure with the role description “sunburst chart”; the breadcrumb is a nav landmark
          named after the chart, with aria-current on the level shown.
        </li>
        <li>
          Moves and zooms are announced through a polite live region (“Compute, Kubernetes: $30.1K, 63% of Compute, 29%
          of total”, “Compute: 3 items”).
        </li>
        <li>
          The center always reads the active arc (or the level shown); the Table view (SunburstTable) lists every node,
          indented by depth.
        </li>
        <li>Arc names are drawn in black or white, whichever contrasts more with the fill, and only where they fit.</li>
        <li>Reduced motion: no sweep and no zoom animation; the number in the center jumps.</li>
      </A11yNotes>
    </Page>
  );
}

/** The "Chord diagram" docs page (/charts/chord-diagram): live examples, props and notes. */
export function ChordDiagramPage() {
  return (
    <Page
      eyebrow="Chart"
      title="Chord diagram"
      description="Flows between a handful of groups as ribbons across a circle: plan upgrades and downgrades, who reviews whose code, trade between regions. Each group's arc is everything it sends; a ribbon's width at each end is the flow from that end to the other, and it blends from one group's color into the other's."
      source={`${CHARTS}chord-diagram.tsx`}
    >
      <ChartStage
        label="Chord diagram demo"
        title="Plan changes, quarter on quarter"
        hue={7}
        height="22.5rem"
        narrowHeight="20.375rem"
      >
        <ChordDiagram groups={plans} matrix={planMoves.q3} aria-label="Accounts moving between plans in Q3" />
      </ChartStage>
      <PlanChangesExample />

      <Example
        title="Code review across teams, names in the legend"
        description="showLabels={false} leaves the names to the ChartCard legend (chordLegend), so the circle gets all the room. With the default showLabels, names that would not fit around the ring (a phone, a crowded side) move into a legend under the circle by themselves."
        variant="bare"
        code={`
import { ChartCard, chordLegend, ChordTable, ChordDiagram, type ChordGroup } from "@sheenui/theme";

const teams: ChordGroup[] = [
  { id: "web", label: "Web", color: 1 },
  { id: "mobile", label: "Mobile", color: 2 },
  { id: "platform", label: "Platform", color: 3 },
  { id: "data", label: "Data", color: 4 },
  { id: "design", label: "Design system", color: 5 },
  { id: "infra", label: "Infrastructure", color: 7 },
];

// reviews[i][j]: pull requests team i reviewed from team j
const reviews = [
  [0, 46, 38, 12, 64, 9],
  [41, 0, 22, 8, 37, 6],
  [29, 18, 0, 44, 11, 57],
  [9, 6, 39, 0, 4, 31],
  [58, 33, 7, 3, 0, 2],
  [5, 4, 49, 27, 1, 0],
];

export function Example() {
  return (
    <ChartCard
      title="Who reviews whom"
      legend={chordLegend(teams)}
      table={<ChordTable groups={teams} matrix={reviews} caption="Reviews between teams" />}
    >
      <ChordDiagram
        groups={teams}
        matrix={reviews}
        showLabels={false}
        height={320}
        aria-label="Pull request reviews between six teams, last 90 days"
      />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Who reviews whom"
          description="Pull request reviews, last 90 days"
          legend={chordLegend(teams)}
          table={<ChordTable groups={teams} matrix={reviews} caption="Reviews between teams" />}
        >
          <ChordDiagram
            groups={teams}
            matrix={reviews}
            showLabels={false}
            height={320}
            aria-label="Pull request reviews between six teams, last 90 days"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.ChordDiagram} />
      <PropsTable as="h2" title="ChordTable props" of={PROPS.ChordTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the diagram (one stop)."],
          ["← / →", "Previous / next group around the circle; on a ribbon, back to its group / on to its other end."],
          [
            "↓ / ↑",
            "Step through the active group's ribbons, largest first (↑ from the first ribbon returns to the group; ↑ on a group goes round to its last ribbon).",
          ],
          ["Home / End", "First / last group."],
          ["Enter / Space", "Call onGroupClick for the active group."],
          ["Escape", "From a ribbon back to its group; then clear the reading."],
        ]}
      />
      <A11yNotes>
        <li>
          The diagram is one focusable figure with the role description “chord diagram”; keys never scroll the page
          while it has focus.
        </li>
        <li>
          A group is announced with its outflow, inflow and share (“Pro: 1,185 out, 1,235 in, 30% of all flow. 5
          ribbons”); a ribbon reads both directions.
        </li>
        <li>
          Names that don't fit around the ring move into a legend under it by themselves; the Table view (ChordTable) is
          the full matrix.
        </li>
        <li>
          On the light theme, crowded diagrams (more than 5 groups) blend ribbons normally at a lower opacity, so
          crossings stay clean and readable.
        </li>
        <li>Reduced motion: the ring and ribbons appear at once and data changes jump.</li>
      </A11yNotes>
    </Page>
  );
}

/** The "Network graph" docs page (/charts/network-graph): live examples, props and notes. */
export function NetworkGraphPage() {
  return (
    <Page
      eyebrow="Chart"
      title="Network graph"
      description="Who is connected to whom: services and their dependencies, people who work together, pages that link to each other. Laid out by a force simulation written in the component (link springs, charge, gravity, collision), computed in small chunks between frames and the same on every load. Nodes ripple out from the best connected one, then the links draw in."
      source={`${CHARTS}network-graph.tsx`}
    >
      <ChartStage label="Network graph demo" title="Service dependencies" hue={7} height="26.25rem">
        <NetworkGraph
          nodes={services}
          links={serviceLinks}
          groups={serviceGroups}
          aria-label="Dependencies between production services"
        />
      </ChartStage>
      <ServiceMapExample />

      <Example
        title="Collaboration network, weighted ties"
        description="Forty people in five teams; a tie's weight is how often two people worked together, and it sets the line's thickness. Names are printed only where they fit without colliding; zoom in and more appear."
        variant="bare"
        code={`
import { NetworkGraph, type NetworkGroup, type NetworkLink, type NetworkNode } from "@sheenui/theme";

const teams: NetworkGroup[] = [
  { id: "product", label: "Product", color: 1 },
  { id: "design", label: "Design", color: 5 },
  { id: "eng", label: "Engineering", color: 3 },
  { id: "data", label: "Data", color: 4 },
  { id: "ops", label: "Operations", color: 7 },
];

const people: NetworkNode[] = [
  { id: "Ada", group: "product" },
  { id: "Ben", group: "design" },
  { id: "Cleo", group: "eng" },
  { id: "Dev", group: "data" },
  { id: "Eli", group: "ops" },
  { id: "Fay", group: "product" },
  { id: "Gus", group: "design" },
  { id: "Hana", group: "eng" },
];

// value: how often two people worked together; it sets the line's thickness
const ties: NetworkLink[] = [
  { source: "Ada", target: "Fay", value: 6 },
  { source: "Ben", target: "Gus", value: 4 },
  { source: "Cleo", target: "Hana", value: 8 },
  { source: "Ada", target: "Ben", value: 2 },
  { source: "Cleo", target: "Dev", value: 3 },
  { source: "Dev", target: "Eli", value: 5 },
  { source: "Fay", target: "Hana", value: 1 },
];

export function Example() {
  return (
    <NetworkGraph
      nodes={people}
      links={ties}
      groups={teams}
      height={460}
      forces={{ charge: -140, linkDistance: 30 }}
      aria-label="Who worked with whom this quarter, across five teams"
    />
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Collaboration"
          description="Shared projects this quarter"
          legend={networkLegend(crewGroups)}
          table={
            <NetworkTable
              nodes={crew.nodes}
              links={crew.links}
              groups={crewGroups}
              caption="Every person and who they worked with"
            />
          }
        >
          <NetworkGraph
            nodes={crew.nodes}
            links={crew.links}
            groups={crewGroups}
            height={460}
            forces={{ charge: -140, linkDistance: 30 }}
            aria-label="Who worked with whom this quarter, across five teams"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.NetworkGraph} />
      <PropsTable as="h2" title="NetworkTable props" of={PROPS.NetworkTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the graph, then the zoom buttons."],
          ["← / → / ↑ / ↓", "Move to the nearest node in that direction (the view pans to keep it in sight)."],
          ["Page Down / Page Up", "Next / previous node in data order."],
          ["Home / End", "First / last node."],
          ["+ / −", "Zoom in / out."],
          ["0", "Fit the whole graph."],
          ["Enter / Space", "Call onNodeClick for the active node."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes>
        <li>
          The graph is one focusable figure with the role description “network graph”; a node is announced with its
          group, its connections and up to eight neighbor names.
        </li>
        <li>The Table view (NetworkTable) is the keyboard list of every node and who it connects to.</li>
        <li>
          Zoom buttons are real buttons (44px on touch). A plain scroll never hijacks the page: zoom needs Ctrl/⌘, a
          pinch or the buttons; one finger on the background still scrolls.
        </li>
        <li>
          Every moving frame (layout, entrance, drag, pan, zoom) is written straight to the SVG, so the page stays
          smooth while you drag on a phone.
        </li>
        <li>Reduced motion: the precomputed layout appears in place, and dragging moves only that node.</li>
      </A11yNotes>
    </Page>
  );
}

/** The "Marimekko chart" docs page (/charts/marimekko): live examples, props and notes. */
export function MarimekkoChartPage() {
  return (
    <Page
      eyebrow="Chart"
      title="Marimekko chart"
      description="A 100% stacked mosaic whose columns are as wide as their totals: how big each market segment is, and who holds it, in one picture. Each cell prints its share of the column where it fits; hover or tap one for its value and both shares."
      source={`${CHARTS}marimekko-chart.tsx`}
    >
      <ChartStage
        label="Marimekko chart demo"
        title="Spend by segment and vendor"
        hue={1}
        height="21.25rem"
        legend={seriesLegend(vendors, "rect")}
      >
        <MarimekkoChart
          data={markets.y2025}
          index="segment"
          series={vendors}
          format={formatMillions}
          aria-label="Market spend by segment and vendor, 2025"
        />
      </ChartStage>
      <MarketMapExample />

      <Example
        title="Revenue by region and product, values in the cells"
        description={
          'cellText="value" prints each cell\u2019s value instead of its share. Narrow columns keep their name only while it fits; every value stays in the tooltip and the table.'
        }
        variant="bare"
        code={`
import { MarimekkoChart, type ChartSeries } from "@sheenui/theme";

const regions = [
  { region: "North America", platform: 4.8, analytics: 2.1, services: 1.2 },
  { region: "Europe", platform: 3.1, analytics: 1.6, services: 0.9 },
  { region: "Asia Pacific", platform: 1.9, analytics: 1.4, services: 0.3 },
  { region: "Latin America", platform: 0.7, analytics: 0.2, services: 0.2 },
  { region: "Middle East", platform: 0.4, analytics: 0.1, services: 0.1 },
];

const products: ChartSeries[] = [
  { key: "platform", label: "Platform", color: 1 },
  { key: "analytics", label: "Analytics", color: 4 },
  { key: "services", label: "Services", color: 5 },
];

export function Example() {
  return (
    <MarimekkoChart
      data={regions}
      index="region"
      series={products}
      cellText="value"
      height={300}
      format={(n) => \`$\${n}M\`}
      aria-label="Revenue by region and product line"
    />
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Revenue by region"
          description="By product line, fiscal 2025 totals"
          legend={seriesLegend(products, "rect")}
          table={
            <MarimekkoTable
              data={regions}
              index="region"
              indexLabel="Region"
              series={products}
              format={(n) => `$${n}M`}
              caption="Revenue by region and product"
            />
          }
        >
          <MarimekkoChart
            data={regions}
            index="region"
            series={products}
            cellText="value"
            height={300}
            format={(n) => `$${n}M`}
            aria-label="Revenue by region and product line"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.MarimekkoChart} />
      <PropsTable as="h2" title="MarimekkoTable props" of={PROPS.MarimekkoTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart (one stop)."],
          ["← / →", "The same part in the previous / next column (or the nearest one by height)."],
          ["↑ / ↓", "The next part up / down the column."],
          ["Home / End", "Bottom / top part of the column."],
          ["Enter / Space", "Call onCellClick for the active cell."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes>
        <li>
          The chart is one focusable figure with the role description “marimekko chart”; a cell is announced with its
          value and both shares (“Enterprise · Acme (us): $910M, 21% of Enterprise, 9% of total”).
        </li>
        <li>
          Cell numbers are drawn in black or white, whichever contrasts more with the fill, and only where they fit; the
          Table view (MarimekkoTable) has every value.
        </li>
        <li>On touch screens the first tap pins the readout; a second tap activates the cell.</li>
        <li>Reduced motion: the columns appear at once and data changes jump.</li>
      </A11yNotes>
    </Page>
  );
}
