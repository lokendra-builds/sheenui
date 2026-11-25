import type { ReactNode } from "react";
import { ChartStage } from "../layout/ShowcaseStage.chart.scene";
import {
  AreaChart,
  BarChart,
  ChartTable,
  DonutChart,
  GlassCard,
  LineChart,
  Sparkline,
  formatCompact,
  seriesLegend,
  type ChartSeries,
} from "@sheenui/theme";
import { ChartCard } from "../layout/ExampleChartCard";

import { Example } from "../layout/Example";
import { lazyBlock } from "../layout/lazy-block";
import { slugify } from "../layout/heading-ids";
import { Faq, type FaqItem } from "../layout/LazyAbout";
import { Page, PropsTable } from "../layout/Page";
import * as PROPS from "../generated/component-props";
import { href } from "../router";

/*
 * The five everyday charts on their own URLs (one page per chart keyword). The /charts gallery
 * keeps its overview of them; each page here adds the use cases, a table view, the keyboard model and an FAQ.
 */

const BarPatterns = lazyBlock(() => import("./ChartPatternsDemos").then((m) => m.BarPatternsDemo), {
  minHeight: "22rem",
});

const CHARTS = "theme/src/components/charts";
const usd = (n: number) => `$${formatCompact(n)}`;
const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

const revenue = months.map((month, i) => ({
  month,
  organic: Math.round(42000 + i * 3100 + Math.sin(i * 1.3) * 4200),
  paid: Math.round(28000 + i * 1900 + Math.cos(i * 0.9) * 3600),
  referral: Math.round(12000 + i * 1300 + Math.sin(i * 0.7 + 1) * 2200),
}));
const revenueSeries: ChartSeries[] = [
  { key: "organic", label: "Organic", color: 1 },
  { key: "paid", label: "Paid", color: 2 },
  { key: "referral", label: "Referral", color: 3 },
];
const visits = [{ key: "visits", label: "Visits", color: 1 }] satisfies ChartSeries[];
const visitsByMonth = months.map((month, i) => ({
  month,
  visits: Math.round(9000 + i * 820 + Math.sin(i * 1.2) * 1100),
}));
const plans = months.slice(-6).map((month, i) => ({ month, free: 820 - i * 30, pro: 310 + i * 48, team: 90 + i * 21 }));
const planSeries: ChartSeries[] = [
  { key: "free", label: "Free", color: 1 },
  { key: "pro", label: "Pro", color: 2 },
  { key: "team", label: "Team", color: 3 },
];
const countries = [
  { country: "United States", visitors: 48200 },
  { country: "India", visitors: 31400 },
  { country: "Germany", visitors: 22900 },
  { country: "Brazil", visitors: 17600 },
  { country: "Japan", visitors: 12100 },
];
const countrySeries: ChartSeries[] = [{ key: "visitors", label: "Visitors", color: 1 }];
const traffic = [
  { label: "Organic search", value: 41200 },
  { label: "Direct", value: 22800 },
  { label: "Social", value: 15400 },
  { label: "Referral", value: 9600 },
  { label: "Email", value: 6100 },
];

const READING_KEYS: [string, string][] = [
  ["Tab", "Move through the Chart / Table tabs, then the legend keys, then the chart itself."],
  ["← → (↑ ↓)", "Read the previous or next point; the values are announced."],
  ["Home / End", "Jump to the first or last point."],
  ["Escape", "Clear the active point."],
  ["Enter / Space on a legend key", "Hide or show that series."],
];

const LINE_A11Y = [
  "Tab focuses the chart as one stop; the arrow keys move a crosshair one point at a time and announce the x value with every series value.",
  "The Chart / Table tabs switch to a LineTable: one row per x value, one column per series, with a caption and row headers.",
  "With more than three series (or patterns), each line gets its own dash rhythm and marker shape, so no series depends on hue.",
  "Reduced motion: lines appear at their final shape and data changes jump; live data stops sliding.",
];

const AREA_A11Y = [
  "Tab focuses the chart as one stop; the arrow keys read each point and announce every series value at it.",
  "The Chart / Table tabs give the same numbers as a LineTable, so no value depends on the gradient fill, which is decoration.",
  "The brush under a long series is its own tab stop: arrows, Page Up and Page Down, Home and End move the range.",
  "Reduced motion: the fill and line appear at once and data changes jump.",
];

const BAR_A11Y = [
  "Tab focuses the chart as one stop; the arrow keys read one category at a time and announce each series value in it.",
  "The Chart / Table tabs switch to a BarTable: one row per category, one column per series, with a caption and row headers; negative values keep their sign.",
  "With more than three series (or patterns) the bars get hatch fills, so the legend works without color.",
  "Reduced motion: bars appear at their final length and data changes jump.",
];

const DONUT_A11Y = [
  "Tab focuses the ring as one stop; the arrow keys step slice by slice and announce the label, the value and its share of the total.",
  "The center total is text, not an image, and the Chart / Table tabs switch to a DonutTable with slice, value and share columns.",
  "Legend entries are toggle buttons (Enter or Space) that hide a slice; with more than three slices each gets its own hatch (patterns).",
  "Reduced motion: the ring appears at its final angles and data changes jump.",
];

function Prose({ children }: { children: ReactNode }) {
  return <div className="flex max-w-3xl flex-col gap-4 text-base leading-relaxed text-pretty">{children}</div>;
}

function Links({ items }: { items: [path: string, label: string][] }) {
  return (
    <>
      {items.map(([path, label], i) => (
        <span key={path}>
          {i > 0 && (i === items.length - 1 ? " and " : ", ")}
          <a
            href={href(path)}
            className="font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg"
          >
            {label}
          </a>
        </span>
      ))}
    </>
  );
}

function ChartSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 id={slugify(title)} className="text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <Prose>{children}</Prose>
    </section>
  );
}

/** /charts/line-chart */
export function LineChartPage() {
  const faq: FaqItem[] = [
    {
      q: "How do I make a React line chart accessible?",
      a: "Give it an aria-label and a table view. SheenUI's line chart is a focusable group: the arrow keys move a crosshair along the data, the values are announced, and the Table tab shows the same numbers.",
    },
    {
      q: "Does it work with Tailwind CSS v4?",
      a: "Yes. The chart reads its colors from the same design tokens as the rest of SheenUI, so it follows the light and dark theme and both style presets without extra classes.",
    },
    {
      q: "Can I compare with the previous period?",
      a: "Yes. Give a series a compareKey and the previous value is drawn as a dashed line, with its own legend key.",
    },
    {
      q: "How many series can a line chart show?",
      a: "Eight. The palette has eight slots and they are never cycled: a ninth series is drawn in neutral grey, so fold the smallest into an Other series instead. With more than three series, each line also gets its own dash rhythm and marker shape (patterns), so lines stay apart without color.",
    },
    {
      q: "Does the value axis start at zero?",
      a: "Yes by default. Set zero to false to fit the axis to the data, which suits rates, prices and temperatures that live far from zero. A truncated axis exaggerates change, so say so in the chart title.",
    },
    {
      q: "Smooth or straight lines?",
      a: 'The default curve is monotone: smooth, and it never overshoots a real value, so a peak is never drawn higher than the data. Use curve="linear" when you want straight segments between readings, such as sparse measurements.',
    },
    {
      q: "What does the Table tab contain?",
      a: "A real table made with LineTable: one row per x value, one column per series, a caption, column headers and row headers. A previous-period series gets its own column, labelled with the series name and (previous).",
    },
    {
      q: "Can it show live or streaming data?",
      a: "Yes. Set live and pair it with useLiveData: when rows slide by, the lines slide left instead of morphing. Give people a pause control, because moving values are hard to read.",
    },
  ];
  return (
    <Page
      eyebrow="Chart"
      title="Line chart"
      description="Lines draw in from the left, the last value of each series carries a label, and a legend key hides or shows a series."
      source={`${CHARTS}/line-chart.tsx`}
      keyboard={READING_KEYS}
      a11y={LINE_A11Y}
    >
      <ChartStage
        label="Line chart demo"
        title="Monthly revenue by channel"
        hue={1}
        height="16.25rem"
        legend={seriesLegend(revenueSeries, "line")}
      >
        <LineChart
          data={revenue}
          index="month"
          series={revenueSeries}
          format={usd}
          aria-label="Monthly revenue by channel"
        />
      </ChartStage>
      <Example
        title="Line chart with three series"
        description="Hover or press the arrow keys to read a month. Click a legend key to hide a series; the axis re-fits."
        variant="bare"
        code={`
import { ChartCard, ChartTable, LineChart, formatCompact, seriesLegend, type ChartSeries } from "@sheenui/theme";

const usd = (n: number) => "$" + formatCompact(n);

const data = [
  { month: "Jan", organic: 4200, paid: 2100, referral: 900 },
  { month: "Feb", organic: 4800, paid: 2300, referral: 1100 },
  { month: "Mar", organic: 5600, paid: 2200, referral: 1250 },
];

const series: ChartSeries[] = [
  { key: "organic", label: "Organic", color: 1 },
  { key: "paid", label: "Paid", color: 2 },
  { key: "referral", label: "Referral", color: 3 },
];

export function Example() {
  return (
    <ChartCard
      title="Monthly revenue by channel"
      legend={seriesLegend(series, "line")}
      table={<ChartTable data={data} index="month" series={series} format={usd} />}
    >
      <LineChart data={data} index="month" series={series} format={usd} aria-label="Monthly revenue by channel" />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Monthly revenue by channel"
          description="In US dollars"
          legend={seriesLegend(revenueSeries, "line")}
          table={<ChartTable data={revenue} index="month" indexLabel="Month" series={revenueSeries} format={usd} />}
        >
          <LineChart
            data={revenue}
            index="month"
            series={revenueSeries}
            format={usd}
            aria-label="Monthly revenue by channel"
          />
        </ChartCard>
      </Example>
      <PropsTable of={PROPS.LineChart} title="LineChart props" />
      <PropsTable of={PROPS.LineTable} title="LineTable props" />
      <ChartSection title="When to use a line chart">
        <p>
          Use a React line chart when the question is how a number changes over time: revenue by month, requests per
          second, sign-ups per week. The eye follows the slope, so a line makes trends, turning points and seasonality
          easy to read, and several series can share one axis without hiding each other. If you are weighing a shadcn
          line chart alternative, this one adds a keyboard-readable data table, a legend and the same glass styling as
          the other charts.
        </p>
        <p>
          Prefer a bar chart when you compare separate categories, and an area chart when the filled volume matters. For
          a continuous feed, the streaming chart slides new points in. A line chart in a stat tile can shrink to a
          sparkline. See also{" "}
          <Links
            items={[
              ["/charts/area-chart", "the React area chart"],
              ["/charts/bar-chart", "the React bar chart"],
              ["/charts/realtime-chart", "the real-time chart"],
            ]}
          />
          , or browse <Links items={[["/charts", "all animated React charts"]]} />.
        </p>
      </ChartSection>
      <Faq items={faq} />
    </Page>
  );
}

/** /charts/area-chart */
export function AreaChartPage() {
  const faq: FaqItem[] = [
    {
      q: "What is the difference between an area chart and a line chart?",
      a: "An area chart fills the space under the line, which stresses volume and totals. Use it for one or two series; with many series the fills overlap and a line chart reads better.",
    },
    {
      q: "Can the gradient fill be turned off?",
      a: "Yes. Set gradient to false for a flat soft wash instead of the fade. The fill follows the series color from the theme either way.",
    },
    {
      q: "How do I make a stacked area chart in React?",
      a: "Use StackedAreaChart, which has its own page: each series stacks on the running total, and it can show percent shares. AreaChart is a LineChart with the fill turned on, so its series overlap rather than stack.",
    },
    {
      q: "Does the area fill start at zero?",
      a: "Yes by default: the value axis keeps zero and the fill runs to the baseline. Set zero to false to fit the axis to the data; the fill then runs to the bottom of the plot, which exaggerates change, so prefer a line chart for rates and prices.",
    },
    {
      q: "How do I zoom into a long series?",
      a: "Set brush. A range selector appears under the chart; drag its handles, or focus it and use the arrow keys, Page Up and Page Down, and Home and End.",
    },
    {
      q: "How do I keep an area chart accessible?",
      a: "The chart is one tab stop and the arrow keys read each point and announce every series value. The Chart / Table tabs give the same numbers as a real table, so no value depends on the gradient, which is decoration.",
    },
  ];
  return (
    <Page
      eyebrow="Chart"
      title="Area chart"
      description="A soft gradient fill under a smooth line, with a brush to zoom into a long series."
      source={`${CHARTS}/line-chart.tsx`}
      keyboard={READING_KEYS}
      a11y={AREA_A11Y}
    >
      <ChartStage label="Area chart demo" title="Visits per month" hue={1} height="16.25rem">
        <AreaChart data={visitsByMonth} index="month" series={visits} aria-label="Visits per month" />
      </ChartStage>
      <Example
        title="Area chart with a gradient fill"
        description="The fill fades to transparent. Drag across the chart or use the arrow keys to read a month."
        variant="bare"
        code={`
import { AreaChart, ChartCard, ChartTable, type ChartSeries } from "@sheenui/theme";

const data = [
  { month: "Jun", visits: 9400 },
  { month: "Jul", visits: 10100 },
  { month: "Aug", visits: 11300 },
  { month: "Sep", visits: 11900 },
  { month: "Oct", visits: 12800 },
];
const series: ChartSeries[] = [{ key: "visits", label: "Visits", color: 1 }];

export function Example() {
  return (
    <ChartCard title="Visits per month" table={<ChartTable data={data} index="month" series={series} />}>
      <AreaChart data={data} index="month" series={series} aria-label="Visits per month" />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className="w-full"
          title="Visits per month"
          description="Sessions across the site"
          table={<ChartTable data={visitsByMonth} index="month" indexLabel="Month" series={visits} />}
        >
          <AreaChart data={visitsByMonth} index="month" series={visits} aria-label="Visits per month" />
        </ChartCard>
      </Example>
      <PropsTable of={PROPS.AreaChart} title="AreaChart props" />
      <ChartSection title="When to use an area chart">
        <p>
          A React area chart suits totals that accumulate or fill a range, such as traffic, storage used or active
          users. The gradient adds weight to the line without hiding the grid, which makes one or two series look calm
          and readable on a glass card.
        </p>
        <p>
          When you need several series,{" "}
          <Links
            items={[
              ["/charts/stacked-area-chart", "the stacked area chart"],
              ["/charts/range-area-chart", "the range area chart"],
            ]}
          />{" "}
          keep them readable. For plain trends compare{" "}
          <Links items={[["/charts/line-chart", "the React line chart"]]} />, and for tiny inline trends use{" "}
          <Links items={[["/charts/sparkline", "a sparkline"]]} />.
        </p>
      </ChartSection>
      <ChartSection title="How the fill behaves">
        <p>
          The fill is drawn once per series from the line down to the baseline and fades with the gradient, so a lone
          series reads as a soft silhouette of its own total. Two overlapping series show through each other where the
          lower one is the smaller, but the upper fill hides the lower line where it is the larger, so keep to one or
          two series and let the legend toggle the rest off.
        </p>
        <p>
          The line on top of the fill keeps the same crosshair and point markers as the line chart, so reading a month
          never depends on the shading. Because the fill grows from the baseline, a truncated value axis makes a small
          change look like a large block of colour: leave zero on unless the title says the axis is cut.
        </p>
      </ChartSection>
      <Faq items={faq} />
    </Page>
  );
}

/** /charts/bar-chart */
export function BarChartPage() {
  const faq: FaqItem[] = [
    {
      q: "How do I make a stacked or horizontal bar chart in React?",
      a: 'Pass stacked for stacked bars and layout="horizontal" for horizontal ones; showValues prints the value at the tip of each bar.',
    },
    {
      q: "Are the bars readable by screen readers?",
      a: "Yes. The chart is a focusable group, the arrow keys read one category at a time, and the Table tab holds the same data.",
    },
    {
      q: "Grouped, stacked or horizontal bars?",
      a: 'Grouped (the default) compares series within a category. Stacked compares totals, but only the bottom segment sits on a common baseline, so the upper ones are hard to compare. Horizontal (layout="horizontal") suits long category names and rankings.',
    },
    {
      q: "Can bars show the previous period?",
      a: "Yes. Give a series a compareKey and each bar gets a mark at the previous value. This works for unstacked bars; stacked bars do not draw it.",
    },
    {
      q: "Does the value axis start at zero?",
      a: "Yes. Bar length is the encoding, so the baseline stays at zero; a truncated bar axis misleads. For values far from zero use a line chart with zero set to false.",
    },
    {
      q: "How are negative values drawn?",
      a: "Below the baseline. The Table tab shows the signed number, so the direction never depends on the bar alone.",
    },
    {
      q: "What does the Table tab contain?",
      a: "A real table made with BarTable: one row per category, one column per series, a caption, column headers and row headers. With more than three series the bars also get hatch patterns, so the legend does not rely on color alone.",
    },
  ];
  return (
    <Page
      eyebrow="Chart"
      title="Bar chart"
      description="Rounded bars that grow from the baseline, in grouped, stacked and horizontal layouts."
      source={`${CHARTS}/bar-chart.tsx`}
      keyboard={READING_KEYS}
      a11y={BAR_A11Y}
    >
      <ChartStage
        label="Bar chart demo"
        title="Customers per plan"
        hue={1}
        height="16.25rem"
        legend={seriesLegend(planSeries, "rect")}
      >
        <BarChart stacked data={plans} index="month" series={planSeries} aria-label="Customers per plan, stacked" />
      </ChartStage>
      <Example
        title="Stacked bars: customers per plan"
        description="Stacked bars show the total and the split in one mark."
        variant="bare"
        code={`
import { BarChart, type ChartSeries } from "@sheenui/theme";

const plans = [
  { month: "May", free: 820, pro: 310, team: 90 },
  { month: "Jun", free: 790, pro: 358, team: 111 },
  { month: "Jul", free: 760, pro: 406, team: 132 },
  { month: "Aug", free: 730, pro: 454, team: 153 },
];
const planSeries: ChartSeries[] = [
  { key: "free", label: "Free", color: 1 },
  { key: "pro", label: "Pro", color: 2 },
  { key: "team", label: "Team", color: 3 },
];

export function Example() {
  return <BarChart stacked data={plans} index="month" series={planSeries} aria-label="Customers per plan, stacked" />;
}`}
      >
        <ChartCard
          className="w-full"
          title="Customers per plan"
          description="Last six months"
          legend={seriesLegend(planSeries, "rect")}
          table={<ChartTable data={plans} index="month" indexLabel="Month" series={planSeries} />}
        >
          <BarChart stacked data={plans} index="month" series={planSeries} aria-label="Customers per plan, stacked" />
        </ChartCard>
      </Example>
      <Example
        title="Horizontal bars"
        description="Best for long category names. Values sit at the tip of each bar."
        variant="bare"
        code={`
import { BarChart, type ChartSeries } from "@sheenui/theme";

const countries = [
  { country: "United States", visitors: 48200 },
  { country: "Germany", visitors: 21400 },
  { country: "India", visitors: 18900 },
  { country: "United Kingdom", visitors: 15300 },
  { country: "Brazil", visitors: 9800 },
];
const series: ChartSeries[] = [{ key: "visitors", label: "Visitors", color: 1 }];

export function Example() {
  return <BarChart layout="horizontal" showValues data={countries} index="country" series={series} aria-label="Visitors by country" />;
}`}
      >
        <ChartCard
          className="w-full"
          title="Top countries"
          description="Visitors this month"
          table={<ChartTable data={countries} index="country" indexLabel="Country" series={countrySeries} />}
        >
          <BarChart
            layout="horizontal"
            showValues
            data={countries}
            index="country"
            series={countrySeries}
            aria-label="Visitors by country"
          />
        </ChartCard>
      </Example>
      <Example
        title="Patterns"
        description="Hatch fills tell the series apart without colour. They switch on by themselves above three series; pass patterns to force them, and give seriesLegend the same flag so the legend swatches match."
        variant="bare"
        code={`
import { BarChart, ChartCard, ChartTable, seriesLegend, type ChartSeries } from "@sheenui/theme";

const plans = [
  { month: "May", free: 820, pro: 310, team: 90 },
  { month: "Jun", free: 790, pro: 358, team: 111 },
  { month: "Jul", free: 760, pro: 406, team: 132 },
];
const planSeries: ChartSeries[] = [
  { key: "free", label: "Free", color: 1 },
  { key: "pro", label: "Pro", color: 2 },
  { key: "team", label: "Team", color: 3 },
];

export function Example() {
  return (
    <ChartCard
      title="Customers per plan"
      legend={seriesLegend(planSeries, "rect", true)}
      table={<ChartTable data={plans} index="month" indexLabel="Month" series={planSeries} />}
    >
      <BarChart patterns data={plans} index="month" series={planSeries} aria-label="Customers per plan, hatched" />
    </ChartCard>
  );
}`}
      >
        <BarPatterns />
      </Example>
      <PropsTable of={PROPS.BarChart} title="BarChart props" />
      <PropsTable of={PROPS.BarTable} title="BarTable props" />
      <ChartSection title="When to use a bar chart">
        <p>
          Use a React bar chart to compare values across categories: plans, countries, products or weeks. Bars start at
          zero, so their lengths compare honestly. Choose grouped bars to compare series side by side, stacked bars to
          show a total and its parts, and horizontal bars when the labels are long.
        </p>
        <p>
          For a ranked list with inline values try <Links items={[["/charts/bar-list", "the bar list"]]} />; for
          positive and negative values, <Links items={[["/charts/diverging-bar", "the diverging bar chart"]]} />; for
          shares that always add up to 100 percent,{" "}
          <Links items={[["/charts/percent-stacked-bar-chart", "the 100% stacked bars"]]} />. A trend over time reads
          better in <Links items={[["/charts/line-chart", "a line chart"]]} />.
        </p>
      </ChartSection>
      <Faq items={faq} />
    </Page>
  );
}

/** /charts/donut-chart */
export function DonutChartPage() {
  const faq: FaqItem[] = [
    {
      q: "How many slices should a donut chart have?",
      a: "At most six. Beyond that the slices are too thin to compare; group the small ones into an Other slice or switch to a bar chart.",
    },
    {
      q: "What does the center show?",
      a: "The total by default, and the label and value of the hovered or focused slice. Pass labels.center to name the total.",
    },
    {
      q: "Donut chart or pie chart?",
      a: "Use the donut when the total matters: the center carries it as text. Use the pie chart (its own page) when only the shares matter and you want the whole disc. Both take a list of labelled values.",
    },
    {
      q: "How do screen readers read a donut chart?",
      a: "Tab focuses the ring and the arrow keys step slice by slice, announcing the label, the value and its percentage of the total. The center total is text, not an image, and the Table tab (DonutTable) lists slice, value and share.",
    },
    {
      q: "Can people hide slices?",
      a: "Yes. Legend entries are toggle buttons (Enter or Space) and the percentages and center total update for the slices left. Control it with hiddenSlices and onHiddenSlicesChange, or start with defaultHiddenSlices.",
    },
    {
      q: "How do slices stay apart without color?",
      a: "With patterns: with more than three slices each slice after the first gets its own hatch (or set patterns yourself), and the legend and table name every slice, so the chart never depends on hue.",
    },
    {
      q: "What data shape does it take?",
      a: "An array of slices, each with a label and a value, plus an optional color and a key for legend toggling. Pass format and locale to change the number text. When there is nothing to plot, emptyState is shown instead of an empty ring.",
    },
  ];
  return (
    <Page
      eyebrow="Chart"
      title="Donut chart"
      description="A part-to-whole ring with the total in the center, a full legend and keyboard-readable slices."
      source={`${CHARTS}/donut-chart.tsx`}
      keyboard={READING_KEYS}
      a11y={DONUT_A11Y}
    >
      <ChartStage label="Donut chart demo" title="Traffic sources" hue={1} height="12.5rem" narrowHeight="23.75rem">
        <DonutChart data={traffic} labels={{ center: "Sessions" }} aria-label="Sessions by traffic source" />
      </ChartStage>
      <Example
        title="Donut chart with a center total"
        description="Hover a slice to read it in the center. Click a legend key to leave a slice out; the ring re-flows and the total re-counts."
        variant="bare"
        code={`
import { ChartCard, ChartTable, DonutChart } from "@sheenui/theme";

const traffic = [
  { label: "Organic search", value: 41200 },
  { label: "Direct", value: 22800 },
];

export function Example() {
  return (
    <ChartCard
      title="Traffic sources"
      description="Sessions this month"
      table={
        <ChartTable
          data={traffic.map((t) => ({ source: t.label, sessions: t.value }))}
          index="source"
          indexLabel="Source"
          series={[{ key: "sessions", label: "Sessions", color: 1 }]}
        />
      }
    >
      <DonutChart data={traffic} labels={{ center: "Sessions" }} aria-label="Sessions by traffic source" />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          title="Traffic sources"
          description="Sessions this month"
          table={
            <ChartTable
              data={traffic.map((t) => ({ source: t.label, sessions: t.value }))}
              index="source"
              indexLabel="Source"
              series={[{ key: "sessions", label: "Sessions", color: 1 }]}
            />
          }
        >
          <DonutChart data={traffic} labels={{ center: "Sessions" }} aria-label="Sessions by traffic source" />
        </ChartCard>
      </Example>
      <PropsTable of={PROPS.DonutChart} title="DonutChart props" />
      <PropsTable of={PROPS.DonutTable} title="DonutTable props" />
      <ChartSection title="When to use a donut chart">
        <p>
          A React donut chart, which some teams call a doughnut chart, shows how one total divides into a few parts,
          such as traffic sources, plan mix or storage by file type. The hole in the middle holds the total, which a
          plain pie chart has no room for, and the ring stays legible on a glass card.
        </p>
        <p>
          If the parts are close in size or there are many, a bar chart is easier to compare. See{" "}
          <Links
            items={[
              ["/charts/pie-chart", "the pie chart"],
              ["/charts/radial-bar-chart", "the radial bar chart"],
              ["/charts/gauge-chart", "the gauge chart"],
            ]}
          />{" "}
          for related shapes, or <Links items={[["/charts/bar-chart", "the React bar chart"]]} /> for an exact
          comparison.
        </p>
      </ChartSection>
      <Faq items={faq} />
    </Page>
  );
}

/** /charts/sparkline */
export function SparklinePage() {
  const tiles: [string, string, number[], string][] = [
    ["Revenue", "$12.4K", [12, 18, 15, 22, 28, 26, 34], "rising"],
    ["Sessions", "86.4K", [40, 44, 39, 47, 52, 50, 58], "rising"],
    ["Bounce rate", "38%", [48, 46, 47, 43, 41, 40, 38], "falling"],
  ];
  const faq: FaqItem[] = [
    {
      q: "What is a sparkline?",
      a: "A sparkline is a tiny, axis-free line chart that shows the shape of a trend next to a number, in a stat tile or a table cell.",
    },
    {
      q: "How does a sparkline stay accessible?",
      a: 'It is an image with a spoken summary: pass an aria-label such as "Revenue trend, rising", because the line itself has no values a screen reader could read.',
    },
    {
      q: "What does the spoken summary say, and can I translate it?",
      a: 'With aria-label set, the name is that label plus a generated summary: "Weekly signups: 7 points, min 4, max 12, latest 12". Reword or translate it with labels.summary, and set locale for the number format. Without aria-label the sparkline is decorative and hidden from assistive tech.',
    },
    {
      q: "Sparkline or Sparkbar?",
      a: "A sparkline is one line over many points, for the direction of a trend. The sparkbar draws one bar per period, with the latest bar at full strength and history in a lighter tint, which suits counts per bucket.",
    },
    {
      q: "How is the data shaped and sized?",
      a: 'Pass values as a number array, oldest first; non-numeric entries are skipped. The width follows the container and the height is 40 px unless you set height. area adds a soft fill under the line, curve="linear" swaps the default monotone curve for straight segments, and emptyState (default "No data") shows when there are no values.',
    },
  ];
  return (
    <Page
      eyebrow="Chart"
      title="Sparkline"
      description="A tiny trend line that draws in when it scrolls into view, with a dot on the latest point."
      source={`${CHARTS}/sparkline.tsx`}
      keyboard={[
        [
          "Tab",
          "A sparkline is a static image: it takes no focus and has no keys. Read the number beside it, or open the full line chart.",
        ],
      ]}
      a11y={[
        'The sparkline is an image with a name: write the direction into the aria-label ("Revenue trend, rising").',
        "It never carries information a sighted reader could not also get from the number beside it.",
        "Reduced motion: the line is drawn at once, without the draw-in.",
      ]}
    >
      <ChartStage label="Sparkline demo" title="Revenue" hue={1} height="6.5rem">
        <div className="flex flex-col gap-3">
          <p className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-sheen-fg tabular-nums">$34.2k</span>
            <span className="text-sm font-medium text-sheen-success-text">▲ 18.6% vs last week</span>
          </p>
          <Sparkline height={56} values={[12, 18, 15, 22, 28, 26, 34]} aria-label="Revenue trend, rising" />
        </div>
      </ChartStage>
      <Example
        title="Sparklines in stat tiles"
        description="A small trend under a headline number."
        stageClassName="grid grid-cols-1 gap-4 sm:grid-cols-3"
        code={`
import { GlassCard, Sparkline } from "@sheenui/theme";

const tiles: [string, string, number[], string][] = [
  ["Revenue", "$12.4K", [12, 18, 15, 22, 28, 26, 34], "rising"],
  ["Sessions", "86.4K", [40, 44, 39, 47, 52, 50, 58], "rising"],
  ["Bounce rate", "38%", [48, 46, 47, 43, 41, 40, 38], "falling"],
];

export function Example() {
  return (
    <>
      {tiles.map(([label, value, values, direction]) => (
        <GlassCard key={label} className="flex flex-col gap-2 p-5">
          <p className="text-sm text-sheen-fg-muted">{label}</p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          <Sparkline values={values} aria-label={\`\${label} trend, \${direction}\`} />
        </GlassCard>
      ))}
    </>
  );
}`}
      >
        {tiles.map(([label, value, values, direction]) => (
          <GlassCard key={label} className="flex flex-col gap-2 p-5">
            <p className="text-sm text-sheen-fg-muted">{label}</p>
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
            <Sparkline values={values} aria-label={`${label} trend, ${direction}`} />
          </GlassCard>
        ))}
      </Example>
      <PropsTable of={PROPS.Sparkline} title="Sparkline props" />
      <ChartSection title="When to use a sparkline">
        <p>
          Use a React sparkline when there is no room for a full chart but the direction of a number matters: KPI tiles,
          table rows, list items. It answers one question, is this going up or down, at a glance.
        </p>
        <p>
          Keep sparklines honest: use the same time range for every tile in a row, label the period near the number
          ("last 7 days"), and do not mix a rising line with a bad number without saying so in the label. Because the
          line has no axis, a sparkline can exaggerate small changes; the arrow and percent change next to the headline
          number give the scale.
        </p>
        <p>
          Skip it when readers need exact values or a time axis: a sparkline has none and exaggerates small changes, so
          use a <Links items={[["/charts/line-chart", "React line chart"]]} />. Skip it for a single data point, and for
          series with fewer than about five points, where the number alone is clearer. For counts per bucket use{" "}
          <Links items={[["/charts/sparkbar", "the sparkbar"]]} />, and for whole dashboards of tiles see{" "}
          <Links items={[["/dashboards/web-analytics", "the web analytics dashboard"]]} />.
        </p>
      </ChartSection>
      <Faq items={faq} />
    </Page>
  );
}
