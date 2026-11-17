import { useState } from "react";
import { NumberTicker } from "@sheenui/theme";
import { ChartCard } from "../../layout/ExampleChartCard";
import { Example } from "../../layout/Example";
import { CohortChart, CohortTable, type CohortRow } from "@sheenui/theme";

/* ====================================================================== */
/* Cohort retention                                                       */
/* ====================================================================== */

const weekStarts = [
  "Jan 5",
  "Jan 12",
  "Jan 19",
  "Jan 26",
  "Feb 2",
  "Feb 9",
  "Feb 16",
  "Feb 23",
  "Mar 2",
  "Mar 9",
  "Mar 16",
  "Mar 23",
];

const weeklySizes = [1284, 1342, 1190, 1415, 1502, 1468, 1610, 1575, 1702, 1655, 1748, 1820];

/** Deterministic retention curves: a power-law decay that improves a little with every cohort (a better onboarding). */
export const weeklyCohorts: CohortRow[] = weekStarts.map((cohort, c) => {
  const size = weeklySizes[c] ?? 0;
  const periods = weekStarts.length - c;
  const values = Array.from({ length: periods }, (_, p) => {
    if (p === 0) return size;
    const base = 0.43 + c * 0.007;
    const decay = 0.44 - c * 0.006;
    const wiggle = (((c * 7 + p * 13) % 5) - 2) * 0.006;
    return Math.round(size * Math.min(1, Math.max(0, base * p ** -decay + wiggle)));
  });
  return { cohort, size, values };
});

const months = [
  "Jul 2025",
  "Aug 2025",
  "Sep 2025",
  "Oct 2025",
  "Nov 2025",
  "Dec 2025",
  "Jan 2026",
  "Feb 2026",
  "Mar 2026",
];

const monthlySizes = [8420, 9105, 8830, 9640, 11250, 10380, 12010, 11640, 12870];

export const monthlyCohorts: CohortRow[] = months.map((cohort, c) => ({
  cohort,
  size: monthlySizes[c] ?? 0,
  values: Array.from({ length: months.length - c }, (_, p) =>
    p === 0
      ? 1
      : Math.round((0.36 + c * 0.012) * p ** -(0.32 - c * 0.008) * 1000 + (((c + p * 3) % 4) - 1.5) * 4) / 1000,
  ),
}));

/** Week-4 retention of the weekly cohorts (weighted). */
const week4 = (() => {
  let kept = 0;
  let base = 0;
  for (const row of weeklyCohorts) {
    const v = row.values[4];
    if (typeof v !== "number") continue;
    kept += v;
    base += row.size;
  }
  return base ? kept / base : 0;
})();

/** Holds its own view state, so switching re-renders this example only. */
export function WeeklyCohortExample() {
  const [view, setView] = useState<"percent" | "count">("percent");
  return (
    <Example
      title="Weekly cohorts"
      description="Twelve weekly signup cohorts. Switch between percentages and user counts: one glint sweeps the new numbers in, and the colors stay on retention so cohorts of different sizes stay comparable. Tab into the grid and use the arrow keys; Ctrl+Home / Ctrl+End jump to the corners."
      variant="bare"
      code={`
import { ChartCard, NumberTicker, CohortTable, CohortChart, type CohortRow } from "@sheenui/theme";

const cohorts: CohortRow[] = [
  { cohort: "Jan 5", size: 1284, values: [1284, 560, 399, 356, 300, 257 /* … */] },
  { cohort: "Jan 12", size: 1342, values: [1342, 570, 442, 356, 337 /* … */] },
  // … later cohorts have fewer periods: they haven't reached them yet
];

// Weighted week-4 retention of the cohorts that have reached week 4
const reached = cohorts.filter((row) => typeof row.values[4] === "number");
const week4 =
  reached.reduce((sum, row) => sum + (row.values[4] ?? 0), 0) /
  reached.reduce((sum, row) => sum + row.size, 0);

export function Example() {
  return (
    <ChartCard
      title="Weekly retention"
      aside={<NumberTicker value={week4} format={{ style: "percent", maximumFractionDigits: 1 }} />}
      table={<CohortTable data={cohorts} labels={{ period: (i) => \`Week \${i}\` }} />}
    >
      <CohortChart
        data={cohorts}
        aria-label="Weekly retention by signup cohort"
      />
    </ChartCard>
  );
}`}
    >
      <ChartCard
        className="w-full"
        title="Weekly retention"
        description="Signups from Jan 5 to Mar 23, 2026"
        aside={
          <span className="flex flex-col items-end">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              <NumberTicker value={week4} format={{ style: "percent", maximumFractionDigits: 1 }} locales="en" />
            </span>
            <span className="text-xs text-sheen-fg-muted">week-4 retention</span>
          </span>
        }
        table={<CohortTable data={weeklyCohorts} caption="Weekly retention by cohort" />}
      >
        <CohortChart
          data={weeklyCohorts}
          view={view}
          onViewChange={setView}
          aria-label="Weekly retention by signup cohort"
        />
      </ChartCard>
    </Example>
  );
}
