import { useState } from "react";
import { ChartCard } from "../../layout/ExampleChartCard";
import { Example } from "../../layout/Example";
import { Segmented } from "../../layout/Segmented";
import { LollipopChart, LollipopTable, type LollipopItem } from "@sheenui/theme";
import { CARD } from "./shared";

/* ====================================================================== */
/* Lollipop                                                               */
/* ====================================================================== */

export const adoption: LollipopItem[] = [
  { label: "Dashboards", value: 78 },
  { label: "Saved filters", value: 64 },
  { label: "Scheduled reports", value: 37 },
  { label: "Alerts", value: 52 },
  { label: "CSV export", value: 71 },
  { label: "API access", value: 23 },
  { label: "SSO", value: 18 },
  { label: "Annotations", value: 29 },
  { label: "Shared links", value: 46 },
  { label: "Custom metrics", value: 33 },
];

export const signupChange: LollipopItem[] = [
  { label: "Jan", value: 12 },
  { label: "Feb", value: 8 },
  { label: "Mar", value: -4 },
  { label: "Apr", value: 15 },
  { label: "May", value: 21 },
  { label: "Jun", value: -9 },
  { label: "Jul", value: -14 },
  { label: "Aug", value: 3 },
  { label: "Sep", value: 18 },
  { label: "Oct", value: 26 },
  { label: "Nov", value: 11 },
  { label: "Dec", value: -6 },
];

export const pct0 = (n: number) => `${Math.round(n)}%`;

export const signedPct = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(Math.round(n))}%`;

/** Its own component, so re-sorting re-renders this example only. */
export function AdoptionExample() {
  const [sort, setSort] = useState<"descending" | "ascending" | "none">("descending");
  const average = Math.round(adoption.reduce((s, d) => s + d.value, 0) / adoption.length);
  return (
    <Example
      title="Ranked, with an average"
      description="Feature adoption across accounts. Change the order and every row slides to its new place; the dashed line marks the average. Hover, tap or arrow through the rows."
      variant="bare"
      controls={
        <Segmented
          label="Order"
          size="sm"
          options={[
            { value: "descending", label: "Highest first" },
            { value: "ascending", label: "Lowest first" },
            { value: "none", label: "As given" },
          ]}
          value={sort}
          onValueChange={setSort}
        />
      }
      code={`
import { ChartCard, LollipopTable, LollipopChart, type LollipopItem } from "@sheenui/theme";

const adoption: LollipopItem[] = [
  { label: "Dashboards", value: 78 },
  { label: "Saved filters", value: 64 },
  { label: "Scheduled reports", value: 37 },
  { label: "Alerts", value: 52 },
  { label: "CSV export", value: 71 },
  { label: "API access", value: 23 },
];
const pct = (n: number) => Math.round(n) + "%";
const average = Math.round(adoption.reduce((sum, d) => sum + d.value, 0) / adoption.length);

export function Example() {
  return (
    <ChartCard
      title="Feature adoption"
      table={<LollipopTable data={adoption} sort="descending" reference={{ value: average, label: "Average" }} format={pct} caption="Feature adoption by share of accounts" />}
    >
      <LollipopChart
        data={adoption}
        sort="descending"
        reference={{ value: average, label: "Average" }}
        highlight={["Alerts", "Scheduled reports"]}
        format={pct}
        aria-label="Share of accounts using each feature"
      />
    </ChartCard>
  );
}`}
    >
      <ChartCard
        className={`w-full ${CARD}`}
        title="Feature adoption"
        description="Share of active accounts using each feature, last 30 days. Highlighted: this quarter's launches."
        table={
          <LollipopTable
            data={adoption}
            sort={sort}
            reference={{ value: average, label: "Average" }}
            format={pct0}
            caption="Feature adoption by share of accounts"
          />
        }
      >
        <LollipopChart
          data={adoption}
          sort={sort}
          reference={{ value: average, label: "Average" }}
          highlight={["Alerts", "Scheduled reports"]}
          format={pct0}
          aria-label="Share of accounts using each feature"
        />
      </ChartCard>
    </Example>
  );
}
