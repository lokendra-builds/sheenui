import { ChartCard } from "../layout/ExampleChartCard";
import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import { CohortChart, CohortTable } from "@sheenui/theme";
import * as PROPS from "../generated/component-props";
import { ChartStage } from "../layout/ShowcaseStage.chart.scene";
import { CHARTS } from "./ChartsMapGanttPages/shared";
import { WeeklyCohortExample, monthlyCohorts, weeklyCohorts } from "./ChartsMapGanttPages/cohort-chart";

const stageCohorts = weeklyCohorts.slice(0, 8).map((row) => ({ ...row, values: row.values.slice(0, 6) }));

/** The "Cohort retention" docs page (/charts/cohort-retention): live examples, props and notes. */
export function CohortChartPage() {
  return (
    <Page
      eyebrow="Chart"
      title="Cohort retention"
      description="How many of the people who started in each week (or month) are still around: one row per cohort, one column per period since it started, colored light to dark by retention. A weighted-average row sits on top and every tooltip compares the cell with it."
      source={`${CHARTS}cohort-chart.tsx`}
    >
      <ChartStage
        label="Cohort chart demo"
        title="Weekly retention by signup cohort"
        hue={1}
        height="27.6875rem"
        narrowHeight="29.375rem"
      >
        <CohortChart data={stageCohorts} aria-label="Weekly retention by signup cohort" />
      </ChartStage>
      <WeeklyCohortExample />

      <Example
        title="Monthly cohorts from ratios, sticky headers"
        description='valuesAre="ratios" takes retention shares (0–1) straight from your warehouse. maxHeight makes the table scroll inside its card: the header row and the cohort column stay put. steps={5} classes the colors; labels.period names the columns.'
        variant="bare"
        code={`
import { CohortChart } from "@sheenui/theme";

<CohortChart
  data={[
    { cohort: "Jul 2025", size: 8420, values: [1, 0.366, 0.29, 0.251 /* … */] },
    // …
  ]}
  valuesAre="ratios"
  color={3}
  steps={5}
  maxHeight={300}
  average={false}
  labels={{ period: (i) => \`M\${i}\` }}
  aria-label="Monthly retention by signup cohort"
/>`}
      >
        <ChartCard
          className="w-full"
          title="Monthly retention"
          description="Paid plans, Jul 2025 to Mar 2026, by cohort"
          table={
            <CohortTable
              data={monthlyCohorts}
              valuesAre="ratios"
              average={false}
              labels={{ period: (i) => `M${i}` }}
              caption="Monthly retention by cohort"
            />
          }
        >
          <CohortChart
            data={monthlyCohorts}
            valuesAre="ratios"
            color={3}
            steps={5}
            maxHeight={300}
            average={false}
            labels={{ period: (i) => `M${i}` }}
            aria-label="Monthly retention by signup cohort"
          />
        </ChartCard>
      </Example>

      <PropsTable of={PROPS.CohortChart} />
      <PropsTable as="h2" title="CohortTable props" of={PROPS.CohortTable} />
      <KeyboardTable
        rows={[
          ["Tab", "Move into the grid (one stop, on the last cell you read)."],
          ["← / → / ↑ / ↓", "Move between cells (mirrored on right-to-left pages)."],
          ["Home / End", "First / last reached period of the row."],
          ["Ctrl+Home / Ctrl+End", "First / last cell of the grid."],
          ["Page Up / Page Down", "Top / bottom row of the column."],
          ["Enter / Space", "Call onCellClick for the cell."],
          ["Escape", "Hide the tooltip."],
        ]}
      />
      <A11yNotes>
        <li>
          A real table with role=“grid”: screen readers hear the cohort and the period with every cell, plus the other
          measure (“41.2%, 529 of 1,284 users”).
        </li>
        <li>Cells not reached yet stay blank and read “Not yet reached”, never 0%.</li>
        <li>Text inside each cell is black or white, whichever contrasts more with its fill (at least 4.5:1).</li>
        <li>The view switch is a toggle group; the change is visible in every cell and in the grid's reading.</li>
        <li>Touch: rows are 44px tall, a tap pins the tooltip; on narrow screens it docks above the grid.</li>
      </A11yNotes>
    </Page>
  );
}
