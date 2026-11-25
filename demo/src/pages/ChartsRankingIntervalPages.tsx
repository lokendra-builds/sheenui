import { useState } from "react";
import { ChartCard } from "../layout/ExampleChartCard";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { Segmented } from "../layout/Segmented";
import {
  BumpChart,
  BumpTable,
  bumpLegend,
  ErrorBarChart,
  ErrorBarTable,
  errorBarLegend,
  PopulationPyramid,
  PopulationPyramidTable,
  populationPyramidLegend,
  type ErrorBarItem,
  type PyramidGroup,
} from "@sheenui/theme";
import * as PROPS from "../generated/component-props";
import { ChartStage } from "../layout/ShowcaseStage.chart.scene";
import { CARD, CHARTS } from "./ChartsDistributionPages/shared";

/* ====================================================================== */
/* Bump chart                                                             */
/* ====================================================================== */

const regions = [
  { key: "north", label: "North" },
  { key: "south", label: "South" },
  { key: "east", label: "East" },
  { key: "west", label: "West" },
  { key: "central", label: "Central" },
];
const quarters = [
  { quarter: "Q1", north: 412, south: 388, east: 301, west: 356, central: 240 },
  { quarter: "Q2", north: 398, south: 421, east: 335, west: 349, central: 262 },
  { quarter: "Q3", north: 405, south: 447, east: 392, west: 341, central: 288 },
  { quarter: "Q4", north: 436, south: 430, east: 441, west: 352, central: 301 },
  { quarter: "Q1 ’26", north: 421, south: 415, east: 468, west: 389, central: 344 },
  { quarter: "Q2 ’26", north: 409, south: 402, east: 487, west: 431, central: 395 },
];
/** Response time in minutes by support channel: here a lower number ranks higher. */
const channels = [
  { key: "chat", label: "Chat" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "social", label: "Social" },
];
const responseTimes = [
  { month: "Jan", chat: 4, email: 190, phone: 22, social: 95 },
  { month: "Feb", chat: 5, email: 175, phone: 18, social: 88 },
  { month: "Mar", chat: 7, email: 120, phone: 21, social: 61 },
  { month: "Apr", chat: 12, email: 80, phone: 20, social: 44 },
  { month: "May", chat: 15, email: 52, phone: 19, social: 31 },
  { month: "Jun", chat: 17, email: 33, phone: 23, social: 12 },
];

function BumpRankExample() {
  const [highlight, setHighlight] = useState<string>("none");
  return (
    <Example
      title="Rank by revenue"
      description="Revenue per region and quarter, ranked in each quarter. The lines draw in as the chart scrolls into view; hover a dot and the other lines step back. Pick a region to keep it in colour."
      variant="bare"
      controls={
        <Segmented
          label="Highlight"
          size="sm"
          options={[
            { value: "none", label: "None" },
            { value: "east", label: "East" },
            { value: "west", label: "West" },
          ]}
          value={highlight}
          onValueChange={setHighlight}
        />
      }
      code={`
import { BumpChart, BumpTable, bumpLegend, ChartCard } from "@sheenui/theme";

const regions = [
  { key: "north", label: "North" },
  { key: "south", label: "South" },
  { key: "east", label: "East" },
];
const quarters = [
  { quarter: "Q1", north: 412, south: 388, east: 301 },
  { quarter: "Q2", north: 398, south: 421, east: 335 },
  { quarter: "Q3", north: 405, south: 447, east: 392 },
  { quarter: "Q4", north: 436, south: 430, east: 441 },
];

export function Example() {
  return (
    <ChartCard
      title="Regions by revenue"
      legend={bumpLegend(regions)}
      table={<BumpTable data={quarters} index="quarter" series={regions} caption="Revenue rank by quarter" />}
    >
      <BumpChart data={quarters} index="quarter" series={regions} highlight="east" aria-label="Regions ranked by revenue, by quarter" />
    </ChartCard>
  );
}`}
    >
      <ChartCard
        className={`w-full ${CARD}`}
        title="Regions by revenue"
        description="Rank in each quarter, 1 is the highest revenue"
        legend={bumpLegend(regions)}
        table={<BumpTable data={quarters} index="quarter" series={regions} caption="Revenue rank by quarter" />}
      >
        <BumpChart
          data={quarters}
          index="quarter"
          series={regions}
          highlight={highlight === "none" ? undefined : highlight}
          aria-label="Regions ranked by revenue, by quarter"
        />
      </ChartCard>
    </Example>
  );
}

/** The "Bump chart" docs page (/charts/bump-chart): live examples, props and notes. */
export function BumpChartPage() {
  return (
    <Page
      eyebrow="Chart"
      title="Bump chart"
      description="How a ranking changes over time. Each series is a line that climbs and drops between rank positions, with the rank written in every dot and the name at the end of the line. Pass one row per point in time with a number per series: the ranks are computed for you, or pass ready-made ranks with rankBy."
      source={[`${CHARTS}bump-chart.tsx`]}
    >
      <ChartStage label="Bump chart demo" title="Regions by revenue" hue={1} height="17.5rem">
        <BumpChart
          data={quarters}
          index="quarter"
          series={regions}
          aria-label="Regions ranked by revenue, by quarter"
        />
      </ChartStage>

      <BumpRankExample />

      <Example
        title="Lower is better, with dash patterns"
        description="higherIsBetter={false} ranks the smallest number first, here the median response time per channel. patterns gives each line its own dash style, so the lines differ without colour; it turns on by itself from four series."
        variant="bare"
        code={`
import { BumpChart, BumpTable, bumpLegend, ChartCard } from "@sheenui/theme";

const channels = [
  { key: "chat", label: "Chat" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "social", label: "Social" },
];
const responseTimes = [
  { month: "Jan", chat: 4, email: 190, phone: 22, social: 95 },
  { month: "Mar", chat: 7, email: 120, phone: 21, social: 61 },
  { month: "Jun", chat: 17, email: 33, phone: 23, social: 12 },
];

export function Example() {
  return (
    <ChartCard
      title="Response time by channel"
      legend={bumpLegend(channels)}
      table={<BumpTable data={responseTimes} index="month" series={channels} higherIsBetter={false} caption="Response time rank" />}
    >
      <BumpChart
        data={responseTimes}
        index="month"
        series={channels}
        higherIsBetter={false}
        patterns
        format={(n) => n + " min"}
        aria-label="Support channels ranked by response time"
      />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className={`w-full ${CARD}`}
          title="Response time by channel"
          description="Rank 1 is the fastest"
          legend={bumpLegend(channels)}
          table={
            <BumpTable
              data={responseTimes}
              index="month"
              series={channels}
              higherIsBetter={false}
              format={(n) => `${n} min`}
              caption="Response time rank"
            />
          }
        >
          <BumpChart
            data={responseTimes}
            index="month"
            series={channels}
            higherIsBetter={false}
            patterns
            format={(n) => `${n} min`}
            aria-label="Support channels ranked by response time"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.BumpChart} />
      <PropsTable as="h2" title="BumpTable props" of={PROPS.BumpTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["← / →", "Move to the previous / next point in time (flipped in right-to-left text)."],
          ["↑ / ↓", "Move to the series ranked one place higher / lower at that point."],
          ["Home / End", "Jump to the first / last point in time."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "The chart is a focusable figure named by its aria-label (the chart title), with the keyboard hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table. Moving through it announces the series, the period, its rank and how far it moved, politely, once.",
          "The rank is written in each dot and the series name at the end of its line, and from four series on every line gets its own dash style (patterns), so colour never identifies a series.",
          "BumpTable is the table view: one row per period, one column per series, each cell its rank and value.",
          "Reduced motion: the lines and dots appear at once and data changes jump instead of gliding.",
        ]}
      />
    </Page>
  );
}

/* ====================================================================== */
/* Error bar chart                                                        */
/* ====================================================================== */

const variants: ErrorBarItem[] = [
  { label: "Control", value: 12.4, low: 11.1, high: 13.7 },
  { label: "Variant A", value: 14.2, low: 12.9, high: 15.5 },
  { label: "Variant B", value: 13.1, low: 11.4, high: 14.8 },
  { label: "Variant C", value: 11.6, low: 9.7, high: 13.5 },
];
const effects: ErrorBarItem[] = [
  { label: "New onboarding", value: 4.2, low: 1.8, high: 6.6 },
  { label: "Shorter form", value: 2.9, low: 0.4, high: 5.4 },
  { label: "Social proof", value: 0.8, low: -1.5, high: 3.1 },
  { label: "Dark header", value: -1.1, low: -3.6, high: 1.4 },
  { label: "Price anchor", value: -3.4, low: -6.2, high: -0.6 },
];
const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const forecast: ErrorBarItem[] = month.map((label, i) => {
  const value = 120 + i * 9 + (i % 3) * 4;
  const spread = 6 + i * 2.2;
  return { label, value, low: value - spread, high: value + spread };
});

function ErrorBarVariantExample() {
  const [variant, setVariant] = useState<"bar" | "point">("bar");
  return (
    <Example
      title="Bars and points"
      description="Conversion rate per variant with a 95% interval. Bars grow from the baseline and the whiskers draw outwards; switch to points when the baseline is not meaningful."
      variant="bare"
      controls={
        <Segmented
          label="Marks"
          size="sm"
          options={[
            { value: "bar", label: "Bars" },
            { value: "point", label: "Points" },
          ]}
          value={variant}
          onValueChange={setVariant}
        />
      }
      code={`
import { ChartCard, ErrorBarChart, ErrorBarTable, errorBarLegend, type ErrorBarItem } from "@sheenui/theme";

const variants: ErrorBarItem[] = [
  { label: "Control", value: 12.4, low: 11.1, high: 13.7 },
  { label: "Variant A", value: 14.2, low: 12.9, high: 15.5 },
  { label: "Variant B", value: 13.1, low: 11.4, high: 14.8 },
];

export function Example() {
  return (
    <ChartCard
      title="Conversion rate"
      legend={errorBarLegend("Rate", "95% interval")}
      table={<ErrorBarTable data={variants} valueLabel="Rate (%)" intervalLabel="95% interval" caption="Conversion rate by variant" />}
    >
      <ErrorBarChart
        data={variants}
        variant="bar"
        valueLabel="Conversion rate (%)"
        aria-label="Conversion rate by variant, with 95% intervals"
      />
    </ChartCard>
  );
}`}
    >
      <ChartCard
        className={`w-full ${CARD}`}
        title="Conversion rate"
        description="By variant, with a 95% interval"
        legend={errorBarLegend("Rate", "95% interval")}
        table={
          <ErrorBarTable
            data={variants}
            valueLabel="Rate (%)"
            intervalLabel="95% interval"
            caption="Conversion rate by variant"
          />
        }
      >
        <ErrorBarChart
          data={variants}
          variant={variant}
          valueLabel="Conversion rate (%)"
          intervalLabel="95% interval"
          aria-label="Conversion rate by variant, with 95% intervals"
        />
      </ChartCard>
    </Example>
  );
}

/** The "Error bar chart" docs page (/charts/error-bar-chart): live examples, props and notes. */
export function ErrorBarChartPage() {
  return (
    <Page
      eyebrow="Chart"
      title="Error bar chart"
      description="An estimate with the interval around it. Bars or points carry a whisker from the low to the high end, so how sure a number is reads as clearly as the number itself. A band option draws a line with a shaded confidence band over ordered categories such as months."
      source={[`${CHARTS}error-bar-chart.tsx`]}
    >
      <ChartStage label="Error bar chart demo" title="Conversion rate" hue={1} height="12.5rem">
        <ErrorBarChart
          data={variants}
          valueLabel="Conversion rate (%)"
          aria-label="Conversion rate by variant, with 95% intervals"
        />
      </ChartStage>

      <ErrorBarVariantExample />

      <Example
        title="Effects against a reference line"
        description='variant="point" with a reference line at 0: an effect whose whisker crosses the line is not clearly different from "no change". Values and ends are printed in the tooltip and the table.'
        variant="bare"
        code={`
import { ChartCard, ErrorBarChart, ErrorBarTable, type ErrorBarItem } from "@sheenui/theme";

const effects: ErrorBarItem[] = [
  { label: "New onboarding", value: 4.2, low: 1.8, high: 6.6 },
  { label: "Social proof", value: 0.8, low: -1.5, high: 3.1 },
  { label: "Price anchor", value: -3.4, low: -6.2, high: -0.6 },
];

export function Example() {
  return (
    <ChartCard
      title="Change in sign-ups"
      table={<ErrorBarTable data={effects} valueLabel="Change (pp)" caption="Change in sign-up rate" />}
    >
      <ErrorBarChart
        data={effects}
        variant="point"
        reference={{ value: 0, label: "No change" }}
        valueLabel="Change in sign-up rate (percentage points)"
        aria-label="Change in sign-up rate by experiment"
      />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className={`w-full ${CARD}`}
          title="Change in sign-ups"
          description="Percentage points against the control, with 95% intervals"
          table={<ErrorBarTable data={effects} valueLabel="Change (pp)" caption="Change in sign-up rate" />}
        >
          <ErrorBarChart
            data={effects}
            variant="point"
            reference={{ value: 0, label: "No change" }}
            valueLabel="Change in sign-up rate (percentage points)"
            aria-label="Change in sign-up rate by experiment"
          />
        </ChartCard>
      </Example>

      <Example
        title="Confidence band"
        description='variant="band": a line through the estimates with the interval shaded around it, widening as the forecast looks further ahead. The band fades in, the line draws on.'
        variant="bare"
        code={`
import { ChartCard, ErrorBarChart, ErrorBarTable, type ErrorBarItem } from "@sheenui/theme";

const forecast: ErrorBarItem[] = [
  { label: "Jan", value: 120, low: 114, high: 126 },
  { label: "Feb", value: 133, low: 125, high: 141 },
  { label: "Mar", value: 146, low: 136, high: 156 },
  { label: "Apr", value: 151, low: 139, high: 163 },
];

export function Example() {
  return (
    <ChartCard
      title="Revenue forecast"
      table={<ErrorBarTable data={forecast} valueLabel="Revenue ($K)" caption="Revenue forecast" />}
    >
      <ErrorBarChart data={forecast} variant="band" height={260} aria-label="Revenue forecast with a confidence band" />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className={`w-full ${CARD}`}
          title="Revenue forecast"
          description="In thousands of dollars, 95% band"
          table={<ErrorBarTable data={forecast} valueLabel="Revenue ($K)" caption="Revenue forecast" />}
        >
          <ErrorBarChart
            data={forecast}
            variant="band"
            height={280}
            aria-label="Revenue forecast with a confidence band"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.ErrorBarChart} />
      <PropsTable as="h2" title="ErrorBarTable props" of={PROPS.ErrorBarTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["↑ / ↓", "Bars and points: move between items."],
          ["← / →", "Band: move between points (flipped in right-to-left text)."],
          ["Home / End", "Jump to the first / last item."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "The chart is a focusable figure named by its aria-label (the chart title), with the keyboard hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table. Moving through it announces each item, its estimate and both ends of its interval.",
          "The interval is a drawn whisker with end caps (or a dashed-edged band), a shape rather than a colour, and its ends are printed as numbers in the tooltip and in ErrorBarTable.",
          "Reduced motion: bars, whiskers and the band appear at once and data changes jump instead of gliding.",
        ]}
      />
    </Page>
  );
}

/* ====================================================================== */
/* Population pyramid                                                     */
/* ====================================================================== */

const ageGroups: PyramidGroup[] = [
  { label: "0–4", start: 3.1, end: 2.9 },
  { label: "5–9", start: 3.3, end: 3.1 },
  { label: "10–14", start: 3.4, end: 3.2 },
  { label: "15–19", start: 3.5, end: 3.3 },
  { label: "20–24", start: 3.8, end: 3.6 },
  { label: "25–29", start: 4.1, end: 3.9 },
  { label: "30–34", start: 4.4, end: 4.3 },
  { label: "35–39", start: 4.5, end: 4.5 },
  { label: "40–44", start: 4.3, end: 4.4 },
  { label: "45–49", start: 4.2, end: 4.3 },
  { label: "50–54", start: 4.4, end: 4.6 },
  { label: "55–59", start: 4.5, end: 4.8 },
  { label: "60–64", start: 4.1, end: 4.5 },
  { label: "65–69", start: 3.5, end: 4.0 },
  { label: "70–74", start: 2.7, end: 3.3 },
  { label: "75–79", start: 1.9, end: 2.6 },
  { label: "80–84", start: 1.2, end: 1.9 },
  { label: "85+", start: 0.8, end: 1.8 },
];
const customerTenure: PyramidGroup[] = [
  { label: "< 1 year", start: 5200, end: 3900 },
  { label: "1–2 years", start: 4100, end: 3800 },
  { label: "2–3 years", start: 3300, end: 3100 },
  { label: "3–5 years", start: 2400, end: 2600 },
  { label: "5+ years", start: 1100, end: 1500 },
];

function PyramidExample() {
  const [share, setShare] = useState(false);
  const [patterns, setPatterns] = useState(false);
  return (
    <Example
      title="Counts or shares"
      description="A fictional country by age and sex, in millions. Both halves share one scale, so they compare honestly. Show each bar as a share of the whole population, and hatch one side so the two differ without colour."
      variant="bare"
      controls={
        <>
          <Segmented
            label="Show"
            size="sm"
            options={[
              { value: "count", label: "Millions" },
              { value: "share", label: "Share" },
            ]}
            value={share ? "share" : "count"}
            onValueChange={(v) => setShare(v === "share")}
          />
          <Segmented
            label="Patterns"
            size="sm"
            options={[
              { value: "off", label: "Off" },
              { value: "on", label: "On" },
            ]}
            value={patterns ? "on" : "off"}
            onValueChange={(v) => setPatterns(v === "on")}
          />
        </>
      }
      code={`
import { ChartCard, PopulationPyramid, PopulationPyramidTable, populationPyramidLegend, type PyramidGroup } from "@sheenui/theme";

const ages: PyramidGroup[] = [
  { label: "0–19", start: 13.3, end: 12.5 },
  { label: "20–39", start: 16.8, end: 16.3 },
  { label: "40–59", start: 17.4, end: 18.1 },
  { label: "60–79", start: 12.2, end: 14.4 },
  { label: "80+", start: 2.0, end: 3.7 },
];

export function Example() {
  return (
    <ChartCard
      title="Population by age"
      legend={populationPyramidLegend("Male", "Female")}
      table={<PopulationPyramidTable data={ages} caption="Population by age group, in millions" />}
    >
      <PopulationPyramid data={ages} patterns aria-label="Population by age group and sex, in millions" />
    </ChartCard>
  );
}`}
    >
      <ChartCard
        className={`w-full ${CARD}`}
        title="Population by age"
        description="Millions of people"
        legend={populationPyramidLegend("Male", "Female")}
        table={<PopulationPyramidTable data={ageGroups} share={share} caption="Population by age group, in millions" />}
      >
        <PopulationPyramid
          data={ageGroups}
          share={share}
          patterns={patterns}
          aria-label="Population by age group and sex, in millions"
        />
      </ChartCard>
    </Example>
  );
}

/** The "Population pyramid" docs page (/charts/population-pyramid): live examples, props and notes. */
export function PopulationPyramidPage() {
  return (
    <Page
      eyebrow="Chart"
      title="Population pyramid"
      description="Two sets of horizontal bars mirrored around a centre line, one row per age group, on one shared scale. Pass one item per group with the size of each side: label, start and end. The first group sits at the base, so a young population reads as a wide base."
      source={[`${CHARTS}population-pyramid.tsx`]}
    >
      <ChartStage label="Population pyramid demo" title="Population by age" hue={1} height="31rem" narrowHeight="31rem">
        <PopulationPyramid data={ageGroups} aria-label="Population by age group and sex, in millions" />
      </ChartStage>

      <PyramidExample />

      <Example
        title="Beyond demographics"
        description='Any ordered bands with two sides work: here customers by tenure on two plans, with the labels renamed through the legend and labels prop. firstAt="top" puts the first band at the top.'
        variant="bare"
        code={`
import { ChartCard, PopulationPyramid, PopulationPyramidTable, populationPyramidLegend, type PyramidGroup } from "@sheenui/theme";

const tenure: PyramidGroup[] = [
  { label: "< 1 year", start: 5200, end: 3900 },
  { label: "1–2 years", start: 4100, end: 3800 },
  { label: "2–3 years", start: 3300, end: 3100 },
  { label: "3–5 years", start: 2400, end: 2600 },
];
const labels = { start: "Pro", end: "Team", group: "Tenure" };

export function Example() {
  return (
    <ChartCard
      title="Customers by tenure"
      legend={populationPyramidLegend("Pro", "Team", [3, 4])}
      table={<PopulationPyramidTable data={tenure} labels={labels} caption="Customers by tenure and plan" />}
    >
      <PopulationPyramid data={tenure} firstAt="top" colors={[3, 4]} labels={labels} aria-label="Customers by tenure and plan" />
    </ChartCard>
  );
}`}
      >
        <ChartCard
          className={`w-full ${CARD}`}
          title="Customers by tenure"
          description="Accounts per plan"
          legend={populationPyramidLegend("Pro", "Team", [3, 4])}
          table={
            <PopulationPyramidTable
              data={customerTenure}
              labels={{ start: "Pro", end: "Team", group: "Tenure" }}
              caption="Customers by tenure and plan"
            />
          }
        >
          <PopulationPyramid
            data={customerTenure}
            firstAt="top"
            colors={[3, 4]}
            labels={{ start: "Pro", end: "Team", group: "Tenure" }}
            aria-label="Customers by tenure and plan"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.PopulationPyramid} />
      <PropsTable as="h2" title="PopulationPyramidTable props" of={PROPS.PopulationPyramidTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["↑ / ↓", "Move between groups, top to bottom."],
          ["Home / End", "Jump to the top / bottom group."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "The chart is a focusable figure named by its aria-label (the chart title), with the keyboard hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table. Moving through it announces the group, both sides, the total and its share of the population.",
          "The two sides sit on opposite sides of the centre line and patterns hatches one of them, so colour never separates them; every bar's value is printed where it fits and always in the tooltip and table.",
          "In a ChartCard the legend toggles a side on and off; the scale follows the sides that remain.",
          "Reduced motion: the bars appear at once and data changes jump instead of gliding. In right-to-left text the sides swap.",
        ]}
      />
    </Page>
  );
}
