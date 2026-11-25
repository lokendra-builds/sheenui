import { useState } from "react";
import { ChartCard } from "../../layout/ExampleChartCard";
import { Example } from "../../layout/Example";
import { Segmented } from "../../layout/Segmented";
import { DumbbellChart, DumbbellTable, dumbbellLegend, type DumbbellItem } from "@sheenui/theme";
import { CARD } from "./shared";

/* ====================================================================== */
/* Dumbbell & slope                                                       */
/* ====================================================================== */

export const salaries: DumbbellItem[] = [
  { label: "Engineering", from: 128, to: 141 },
  { label: "Design", from: 104, to: 112 },
  { label: "Product", from: 121, to: 133 },
  { label: "Marketing", from: 92, to: 96 },
  { label: "Sales", from: 98, to: 94 },
  { label: "Support", from: 61, to: 68 },
  { label: "Finance", from: 101, to: 108 },
  { label: "People", from: 84, to: 83 },
];

export const npsByChannel: DumbbellItem[] = [
  { label: "In-app chat", from: 38, to: 54 },
  { label: "Email", from: 31, to: 29 },
  { label: "Phone", from: 47, to: 44 },
  { label: "Help center", from: 22, to: 35 },
  { label: "Community", from: 41, to: 48 },
  { label: "Social", from: 12, to: 19 },
];

/** Thousands of dollars, sign first: $128K, −$4K. */
export const thousands = (n: number) => `${n < 0 ? "−" : ""}$${Math.abs(Math.round(n))}K`;

/** Its own component, so its controls re-render this example only. */
export function SalaryExample() {
  const [sort, setSort] = useState<"none" | "to" | "change">("change");
  const [changeAs, setChangeAs] = useState<"absolute" | "percent">("percent");
  return (
    <Example
      title="Dumbbell"
      description="Median salary by department, 2024 to 2025. On first view each “after” dot travels out from its “before” dot. Sort by the change and the rows slide into their new order."
      variant="bare"
      controls={
        <>
          <Segmented
            label="Order"
            size="sm"
            options={[
              { value: "change", label: "Biggest rise" },
              { value: "to", label: "Highest" },
              { value: "none", label: "As given" },
            ]}
            value={sort}
            onValueChange={setSort}
          />
          <Segmented
            label="Change as"
            size="sm"
            options={[
              { value: "percent", label: "%" },
              { value: "absolute", label: "$" },
            ]}
            value={changeAs}
            onValueChange={setChangeAs}
          />
        </>
      }
      code={`
import { ChartCard, dumbbellLegend, DumbbellTable, DumbbellChart, type DumbbellItem } from "@sheenui/theme";

const salaries: DumbbellItem[] = [
  { label: "Engineering", from: 128, to: 141 },
  { label: "Design", from: 104, to: 112 },
  { label: "Product", from: 121, to: 133 },
  { label: "Marketing", from: 92, to: 96 },
  { label: "Sales", from: 98, to: 94 },
  { label: "Support", from: 61, to: 68 },
];
const thousands = (n: number) => (n < 0 ? "−" : "") + "$" + Math.abs(Math.round(n)) + "K";

export function Example() {
  return (
    <ChartCard
      title="Median salary"
      legend={dumbbellLegend("2024", "2025")}
      table={<DumbbellTable data={salaries} sort="change" fromLabel="2024" toLabel="2025" format={thousands} caption="Median salary by department" />}
    >
      <DumbbellChart
        data={salaries}
        fromLabel="2024"
        toLabel="2025"
        sort="change"
        change="percent"
        format={thousands}
        aria-label="Median salary by department, 2024 against 2025"
      />
    </ChartCard>
  );
}`}
    >
      <ChartCard
        className={`w-full ${CARD}`}
        title="Median salary"
        description="By department, in thousands of US dollars"
        legend={dumbbellLegend("2024", "2025")}
        table={
          <DumbbellTable
            data={salaries}
            sort={sort}
            fromLabel="2024"
            toLabel="2025"
            format={thousands}
            caption="Median salary by department"
          />
        }
      >
        <DumbbellChart
          data={salaries}
          fromLabel="2024"
          toLabel="2025"
          sort={sort}
          change={changeAs}
          format={thousands}
          aria-label="Median salary by department, 2024 against 2025"
        />
      </ChartCard>
    </Example>
  );
}
