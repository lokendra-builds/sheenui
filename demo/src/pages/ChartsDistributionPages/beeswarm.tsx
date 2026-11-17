import { useMemo, useState } from "react";
import { ChartCard } from "../../layout/ExampleChartCard";
import { Example } from "../../layout/Example";
import { Segmented } from "../../layout/Segmented";
import { Beeswarm, BeeswarmTable, type BeeswarmPoint, type BeeswarmSeries } from "@sheenui/theme";
import { CARD, days, gaussian, seeded } from "./shared";

/* ====================================================================== */
/* Beeswarm                                                               */
/* ====================================================================== */

/** Days from sign-up to first value per account, by plan (log-normal, seeded). */
export function makeOnboarding(shift = 0): BeeswarmPoint[] {
  const plans: [string, number, number, number][] = [
    ["Free", 9.5, 0.55, 70],
    ["Pro", 5.2, 0.45, 60],
    ["Team", 3.4, 0.4, 48],
  ];
  return plans.flatMap(([group, median, spread, n], gi) => {
    const z = gaussian(seeded(300 + gi + shift * 10));
    return Array.from({ length: n }, (_, i) => ({
      id: `${group}-${i}`,
      label: `${group} account #${1000 + gi * 100 + i}`,
      group,
      value: Math.round(median * (1 - shift * 0.12) * Math.exp(spread * z()) * 10) / 10,
    }));
  });
}

/** eNPS with its sign: +12, −4. */
export const enps = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n)}`;

export const departments: BeeswarmSeries[] = [
  { key: "eng", label: "Engineering", color: 1 },
  { key: "gtm", label: "Sales & marketing", color: 2 },
  { key: "ops", label: "Operations", color: 3 },
  { key: "g&a", label: "G&A", color: 7 },
];

export const teams: BeeswarmPoint[] = (() => {
  const random = seeded(808);
  const z = gaussian(random);
  const names: [string, string][] = [
    ["Platform", "eng"],
    ["Payments", "eng"],
    ["Mobile", "eng"],
    ["Data", "eng"],
    ["Search", "eng"],
    ["Infra", "eng"],
    ["Growth eng", "eng"],
    ["Security", "eng"],
    ["Design systems", "eng"],
    ["API", "eng"],
    ["Field sales", "gtm"],
    ["Inside sales", "gtm"],
    ["Brand", "gtm"],
    ["Lifecycle", "gtm"],
    ["Partnerships", "gtm"],
    ["Content", "gtm"],
    ["Events", "gtm"],
    ["Solutions", "gtm"],
    ["Support EMEA", "ops"],
    ["Support AMER", "ops"],
    ["Onboarding", "ops"],
    ["Logistics", "ops"],
    ["Trust & safety", "ops"],
    ["Billing ops", "ops"],
    ["Finance", "g&a"],
    ["People", "g&a"],
    ["Legal", "g&a"],
    ["IT", "g&a"],
    ["Workplace", "g&a"],
  ];
  const base: Record<string, number> = { eng: 34, gtm: 18, ops: 6, "g&a": 22 };
  return names.map(([label, series]) => ({ label, series, value: Math.round((base[series] ?? 20) + 16 * z()) }));
})();

/** Its own component, so switching the cohort re-renders this example only. */
export function OnboardingExample() {
  const [cohort, setCohort] = useState<"before" | "after">("after");
  const onboarding = useMemo(() => makeOnboarding(cohort === "after" ? 1 : 0), [cohort]);
  return (
    <Example
      title="One swarm per group"
      description="Days from sign-up to first value for 178 accounts, by plan, with each plan's median. Switch the cohort and every account glides to its new value. Left and right move along a plan; up and down jump to the nearest value in the next plan."
      variant="bare"
      controls={
        <Segmented
          label="Cohort"
          size="sm"
          options={[
            { value: "before", label: "Old onboarding" },
            { value: "after", label: "New onboarding" },
          ]}
          value={cohort}
          onValueChange={setCohort}
        />
      }
      code={`
import { ChartCard, BeeswarmTable, Beeswarm, type BeeswarmPoint } from "@sheenui/theme";

const accounts: BeeswarmPoint[] = [
  { id: "free-1", label: "Free account #1", group: "Free", value: 11.2 },
  { id: "free-2", label: "Free account #2", group: "Free", value: 7.9 },
  { id: "free-3", label: "Free account #3", group: "Free", value: 15.4 },
  { id: "pro-1", label: "Pro account #1", group: "Pro", value: 4.2 },
  { id: "pro-2", label: "Pro account #2", group: "Pro", value: 5.8 },
  { id: "pro-3", label: "Pro account #3", group: "Pro", value: 3.1 },
  { id: "team-1", label: "Team account #1", group: "Team", value: 2.6 },
  { id: "team-2", label: "Team account #2", group: "Team", value: 3.9 },
];
const days = (n: number) => n + " d";

export function Example() {
  return (
    <ChartCard
      title="Time to first value"
      table={<BeeswarmTable data={accounts} groups={["Free", "Pro", "Team"]} format={days} caption="Days to first value per account" />}
    >
      <Beeswarm
        data={accounts}
        groups={["Free", "Pro", "Team"]}
        format={days}
        valueLabel="Days from sign-up"
        aria-label="Days from sign-up to first value, per account and plan"
      />
    </ChartCard>
  );
}`}
    >
      <ChartCard
        className={`w-full ${CARD}`}
        title="Time to first value"
        description={
          cohort === "after"
            ? "Accounts that joined after the new onboarding"
            : "Accounts that joined before the new onboarding"
        }
        table={
          <BeeswarmTable
            data={onboarding}
            groups={["Free", "Pro", "Team"]}
            format={days}
            caption="Days to first value per account"
          />
        }
      >
        <Beeswarm
          data={onboarding}
          groups={["Free", "Pro", "Team"]}
          format={days}
          valueLabel="Days from sign-up"
          aria-label="Days from sign-up to first value, per account and plan"
        />
      </ChartCard>
    </Example>
  );
}
