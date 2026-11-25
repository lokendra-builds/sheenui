import { ChartCard } from "../layout/ExampleChartCard";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { DumbbellChart, DumbbellTable, dumbbellLegend } from "@sheenui/theme";
import { DivergingBarChart, DivergingBarTable, divergingLegend } from "@sheenui/theme";
import { Beeswarm, BeeswarmTable, beeswarmLegend } from "@sheenui/theme";
import * as PROPS from "../generated/component-props";
import { ChartStage } from "../layout/ShowcaseStage.chart.scene";
import { SalaryExample, npsByChannel, salaries, thousands } from "./ChartsDistributionPages/dumbbell-chart";
import { SurveyExample, population, sides, survey } from "./ChartsDistributionPages/diverging-bar-chart";
import { OnboardingExample, departments, enps, makeOnboarding, teams } from "./ChartsDistributionPages/beeswarm";
import { CARD, CHARTS, agreement, days } from "./ChartsDistributionPages/shared";

/** The "Dumbbell & slope chart" docs page (/charts/dumbbell): live examples, props and notes. */
export function DumbbellChartPage() {
  return (
    <Page
      eyebrow="Chart"
      title="Dumbbell & slope chart"
      description="Before and after for each item. A dumbbell joins a light “before” dot to a full-color “after” dot; the slope variant puts the two ends in columns, so rises and falls read as the angle of each line. Every change is printed with ▲ / ▼ and a success or danger tone you set with higherIsBetter."
      source={[`${CHARTS}dumbbell-chart.tsx`, `${CHARTS}histogram.tsx`]}
    >
      <ChartStage label="Dumbbell chart demo" title="Median salary" hue={1} height="20.125rem">
        <DumbbellChart
          data={salaries}
          fromLabel="2024"
          toLabel="2025"
          sort="change"
          change="percent"
          format={thousands}
          aria-label="Median salary by department, 2024 against 2025"
        />
      </ChartStage>

      <SalaryExample />

      <Example
        title="Slope chart"
        description='variant="slope": the two ends in columns, a line per channel. Labels spread apart so none collide, and highlight keeps the two channels the story is about in color.'
        variant="bare"
        code={`
import { DumbbellChart, type DumbbellItem } from "@sheenui/theme";

const npsByChannel: DumbbellItem[] = [
  { label: "In-app chat", from: 38, to: 54 },
  { label: "Email", from: 31, to: 29 },
  { label: "Phone", from: 47, to: 44 },
  { label: "Help center", from: 22, to: 35 },
  { label: "Community", from: 41, to: 48 },
  { label: "Social", from: 12, to: 19 },
];

export function Example() {
  return (
    <DumbbellChart
      variant="slope"
      data={npsByChannel}
      fromLabel="Q1"
      toLabel="Q2"
      highlight={["In-app chat", "Help center"]}
      color={3}
      aria-label="Net Promoter Score by support channel, Q1 against Q2"
    />
  );
}`}
      >
        <ChartCard
          className={CARD}
          title="NPS by support channel"
          description="Q1 against Q2"
          legend={dumbbellLegend("Q1", "Q2", 3)}
          table={
            <DumbbellTable
              data={npsByChannel}
              fromLabel="Q1"
              toLabel="Q2"
              caption="Net Promoter Score by support channel"
            />
          }
        >
          <DumbbellChart
            variant="slope"
            data={npsByChannel}
            fromLabel="Q1"
            toLabel="Q2"
            highlight={["In-app chat", "Help center"]}
            color={3}
            aria-label="Net Promoter Score by support channel, Q1 against Q2"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.DumbbellChart} />
      <PropsTable as="h2" title="DumbbellTable props" of={PROPS.DumbbellTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["↑ / ↓", "Move between items."],
          ["Home / End", "Jump to the first / last item."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "Keyboard and screen-reader users get a single focusable figure labelled by the chart title, with a short reading hint as its description; inside a ChartCard with a table view, aria-details links it to the table. Every value read is announced politely, once. Every change is printed with an up or down arrow and a success or danger tone (set by higherIsBetter), so color never carries it alone.",
          "For a non-visual reading, give ChartCard's table prop a DumbbellTable; the Chart / Table tabs then expose each value as plain table cells.",
          "Under reduced motion nothing morphs: the dots and the connecting bars render at their final values and new data replaces the old at once.",
        ]}
      />
    </Page>
  );
}

/** The "Diverging bar chart" docs page (/charts/diverging-bar): live examples, props and notes. */
export function DivergingBarChartPage() {
  return (
    <Page
      eyebrow="Chart"
      title="Diverging bar chart"
      description="Answers on an ordered scale, centered on a neutral midpoint: disagreement grows one way in red, agreement the other in blue, and the neutral answer straddles the center in gray. The butterfly variant puts two groups back to back on one shared scale, like a population pyramid."
      source={[`${CHARTS}diverging-bar-chart.tsx`, `${CHARTS}histogram.tsx`]}
    >
      <ChartStage
        label="Diverging bar chart demo"
        title="Customer survey"
        hue={4}
        height="17.25rem"
        narrowHeight="23.25rem"
      >
        <DivergingBarChart
          data={survey.q4}
          index="statement"
          levels={agreement}
          aria-label="Survey answers, from strongly disagree to strongly agree"
        />
      </ChartStage>

      <SurveyExample />

      <Example
        title="Population pyramid"
        description='variant="butterfly" with two levels: men to the left, women to the right of the spine, the age groups in the middle. One scale for both sides, so the halves compare honestly.'
        variant="bare"
        code={`
import { DivergingBarChart } from "@sheenui/theme";

const population = [
  { age: "60+", men: 3_400_000, women: 4_100_000 },
  { age: "40–59", men: 4_900_000, women: 5_000_000 },
  { age: "20–39", men: 5_200_000, women: 5_100_000 },
  { age: "0–19", men: 4_300_000, women: 4_100_000 },
];

export function Example() {
  return (
    <DivergingBarChart
      variant="butterfly"
      data={population}
      index="age"
      levels={[
        { key: "men", label: "Men" },
        { key: "women", label: "Women" },
      ]}
      aria-label="Population by age group and sex"
    />
  );
}`}
      >
        <ChartCard
          className={CARD}
          title="Population by age"
          description="Mid-year estimate, millions"
          legend={divergingLegend(sides, { variant: "butterfly" })}
          table={
            <DivergingBarTable
              variant="butterfly"
              data={population}
              index="age"
              levels={sides}
              indexLabel="Age"
              caption="Population by age group and sex"
            />
          }
        >
          <DivergingBarChart
            variant="butterfly"
            data={population}
            index="age"
            levels={sides}
            aria-label="Population by age group and sex"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.DivergingBarChart} />
      <PropsTable as="h2" title="DivergingBarTable props" of={PROPS.DivergingBarTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          ["↑ / ↓", "Move between rows."],
          ["← / →", "Move between a row's segments."],
          ["Home / End", "Jump to the first / last row."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "The figure takes focus as one stop and is named by its aria-label, the chart title. A one-line hint explains the keys, and a ChartCard table view is linked through aria-details. Values are announced politely, once per move. Shares are printed as text and every Likert row has a net score, so color never carries the reading; each move announces the row and segment.",
          "DivergingBarTable is the table view: pair it with ChartCard's table prop (Chart / Table tabs) so every value can be read without color or sight.",
          "Reduced motion: the bars appear at their final lengths on either side of zero and data changes jump instead of morphing.",
        ]}
      />
    </Page>
  );
}

/** The "Beeswarm" docs page (/charts/beeswarm): live examples, props and notes. */
export function BeeswarmPage() {
  return (
    <Page
      eyebrow="Chart"
      title="Beeswarm"
      description="Every observation as its own dot along one axis, nudged sideways just enough that none overlap. The shape of the distribution shows like a histogram's, yet every account, team or country stays individually readable, hoverable and named."
      source={[`${CHARTS}beeswarm.tsx`, `${CHARTS}histogram.tsx`]}
    >
      <ChartStage label="Beeswarm demo" title="Time to first value" hue={1} height="34.125rem" narrowHeight="39.5rem">
        <Beeswarm
          data={makeOnboarding(1)}
          groups={["Free", "Pro", "Team"]}
          format={days}
          valueLabel="Days from sign-up"
          aria-label="Days from sign-up to first value, per account and plan"
        />
      </ChartStage>

      <OnboardingExample />

      <Example
        title="Colored by series"
        description="Employee NPS of 29 teams in one swarm, colored by department (fixed slots, with a legend). highlight keeps two teams in focus; hover any dot for its name."
        variant="bare"
        code={`
import { Beeswarm, type BeeswarmPoint, type BeeswarmSeries } from "@sheenui/theme";

const departments: BeeswarmSeries[] = [
  { key: "eng", label: "Engineering", color: 1 },
  { key: "gtm", label: "Sales & marketing", color: 2 },
  { key: "ops", label: "Operations", color: 3 },
  { key: "g&a", label: "G&A", color: 7 },
];

const teams: BeeswarmPoint[] = [
  { label: "Payments", series: "eng", value: 41 },
  { label: "Platform", series: "eng", value: 33 },
  { label: "Growth", series: "gtm", value: 18 },
  { label: "Support EMEA", series: "gtm", value: -12 },
  { label: "Support AMER", series: "gtm", value: 4 },
  { label: "Logistics", series: "ops", value: 9 },
  { label: "Finance", series: "g&a", value: 22 },
  { label: "People", series: "g&a", value: 27 },
];
const enps = (n: number) => (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n);

export function Example() {
  return (
    <Beeswarm
      data={teams}
      series={departments}
      highlight={["Support EMEA", "Support AMER"]}
      includeZero
      radius={6}
      format={enps}
      valueLabel="eNPS"
      labels={{ series: "Department" }}
      aria-label="Employee NPS by team, colored by department"
    />
  );
}`}
      >
        <ChartCard
          className={CARD}
          title="Employee NPS by team"
          description="Spring pulse survey. Highlighted: the two support teams."
          legend={beeswarmLegend(departments)}
          table={
            <BeeswarmTable
              data={teams}
              series={departments}
              format={enps}
              valueLabel="eNPS"
              labels={{ series: "Department", point: "Team" }}
              caption="Employee NPS per team and department"
            />
          }
        >
          <Beeswarm
            data={teams}
            series={departments}
            highlight={["Support EMEA", "Support AMER"]}
            includeZero
            radius={6}
            format={enps}
            valueLabel="eNPS"
            labels={{ series: "Department" }}
            aria-label="Employee NPS by team, colored by department"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.Beeswarm} />
      <PropsTable as="h2" title="BeeswarmTable props" of={PROPS.BeeswarmTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Focus the chart. It is one tab stop; the arrow keys then read it."],
          [
            "Arrow keys",
            "Along the value axis: step between dots in value order. Across groups (when there are several): jump to the nearest value in the next or previous group.",
          ],
          ["Home / End", "Jump to the first / last dot."],
          ["Escape", "Clear the reading."],
        ]}
      />
      <A11yNotes
        notes={[
          "The chart is a focusable figure named by its aria-label (the chart title), with a one-line reading hint as its description and, inside a ChartCard with a table view, aria-details pointing at that table; moving through it announces each value politely, once. Each move announces the dot's value and group; every group's count and median are available as text.",
          "BeeswarmTable is the same data as a real table. Pass it to ChartCard's table prop and the Chart / Table tabs let anyone read every value without color or sight.",
          "With reduced motion on, the dots start at their final positions and a data change jumps straight to the new state.",
        ]}
      />
    </Page>
  );
}
