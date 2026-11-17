import { useState } from "react";
import { ChartCard } from "../../layout/ExampleChartCard";
import { Example } from "../../layout/Example";
import { Segmented } from "../../layout/Segmented";
import { DivergingBarChart, DivergingBarTable, divergingLegend, type DivergingLevel } from "@sheenui/theme";
import { CARD, agreement } from "./shared";

export const survey = {
  q3: [
    { statement: "The product is easy to learn", sd: 18, d: 42, n: 71, a: 196, sa: 133 },
    { statement: "It saves me time every week", sd: 12, d: 30, n: 58, a: 208, sa: 152 },
    { statement: "Support answers quickly", sd: 41, d: 77, n: 96, a: 160, sa: 86 },
    { statement: "Pricing is fair for what I get", sd: 64, d: 118, n: 104, a: 122, sa: 52 },
    { statement: "I'd recommend it to a colleague", sd: 22, d: 38, n: 80, a: 182, sa: 138 },
    { statement: "The mobile app does what I need", sd: 72, d: 96, n: 120, a: 118, sa: 54 },
  ],
  q4: [
    { statement: "The product is easy to learn", sd: 12, d: 30, n: 64, a: 214, sa: 160 },
    { statement: "It saves me time every week", sd: 9, d: 24, n: 51, a: 222, sa: 174 },
    { statement: "Support answers quickly", sd: 22, d: 48, n: 90, a: 196, sa: 124 },
    { statement: "Pricing is fair for what I get", sd: 70, d: 126, n: 98, a: 120, sa: 66 },
    { statement: "I'd recommend it to a colleague", sd: 16, d: 30, n: 72, a: 196, sa: 166 },
    { statement: "The mobile app does what I need", sd: 40, d: 70, n: 112, a: 160, sa: 98 },
  ],
};

const ageGroups = ["0–9", "10–19", "20–29", "30–39", "40–49", "50–59", "60–69", "70–79", "80+"];

export const population = ageGroups
  .map((age, i) => ({
    age,
    men: Math.round(4.1e6 - i * 120e3 + Math.sin(i * 1.3) * 380e3 - (i > 6 ? (i - 6) * 900e3 : 0)),
    women: Math.round(3.95e6 - i * 90e3 + Math.sin(i * 1.3) * 360e3 - (i > 6 ? (i - 6) * 640e3 : 0)),
  }))
  .reverse();

export const sides: DivergingLevel[] = [
  { key: "men", label: "Men" },
  { key: "women", label: "Women" },
];

/** Its own component, so switching the quarter re-renders this example only. */
export function SurveyExample() {
  const [quarter, setQuarter] = useState<"q3" | "q4">("q4");
  const rows = survey[quarter];
  return (
    <Example
      title="Likert survey"
      description="Six statements, 460 answers each. Shares sit inside the segments where they fit (black or white ink, whichever reads better), and the net score follows each row. Switch the quarter and the segments morph. Up and down move between statements, left and right between answers."
      variant="bare"
      controls={
        <Segmented
          label="Quarter"
          size="sm"
          options={[
            { value: "q3", label: "Q3" },
            { value: "q4", label: "Q4" },
          ]}
          value={quarter}
          onValueChange={setQuarter}
        />
      }
      code={`
import { ChartCard, divergingLegend, DivergingBarTable, DivergingBarChart, type DivergingLevel } from "@sheenui/theme";

const levels: DivergingLevel[] = [
  { key: "sd", label: "Strongly disagree" },
  { key: "d", label: "Disagree" },
  { key: "n", label: "Neutral" },
  { key: "a", label: "Agree" },
  { key: "sa", label: "Strongly agree" },
];
const data = [
  { statement: "The product is easy to learn", sd: 12, d: 30, n: 64, a: 214, sa: 160 },
  { statement: "It saves me time every week", sd: 9, d: 24, n: 51, a: 222, sa: 174 },
  { statement: "Support answers quickly", sd: 22, d: 48, n: 90, a: 196, sa: 124 },
];

export function Example() {
  return (
    <ChartCard
      title="Customer survey"
      legend={divergingLegend(levels)}
      table={<DivergingBarTable data={data} index="statement" levels={levels} indexLabel="Statement" caption="Survey answers" />}
    >
      <DivergingBarChart data={data} index="statement" levels={levels} aria-label="Survey answers, from strongly disagree to strongly agree" />
    </ChartCard>
  );
}`}
    >
      <ChartCard
        className={`w-full ${CARD}`}
        title="Customer survey"
        description={`${quarter.toUpperCase()}, 460 answers per statement`}
        legend={divergingLegend(agreement)}
        table={
          <DivergingBarTable
            data={rows}
            index="statement"
            levels={agreement}
            indexLabel="Statement"
            caption="Survey answers"
          />
        }
      >
        <DivergingBarChart
          data={rows}
          index="statement"
          levels={agreement}
          aria-label="Survey answers, from strongly disagree to strongly agree"
        />
      </ChartCard>
    </Example>
  );
}
