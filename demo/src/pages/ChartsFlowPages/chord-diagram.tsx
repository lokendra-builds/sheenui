import { startTransition, useState } from "react";
import { Example } from "../../layout/Example";
import { Segmented } from "../../layout/Segmented";
import { ChordDiagram, ChordTable, type ChordGroup } from "@sheenui/theme";
import { ChartCard, Headline } from "./shared";

/* ====================================================================== */
/* Chord                                                                  */
/* ====================================================================== */

export const plans: ChordGroup[] = [
  { id: "free", label: "Free", color: 7 },
  { id: "starter", label: "Starter", color: 3 },
  { id: "pro", label: "Pro", color: 1 },
  { id: "team", label: "Team", color: 5 },
  { id: "enterprise", label: "Enterprise", color: 2 },
];

export const planMoves: Record<"q2" | "q3", number[][]> = {
  q2: [
    [0, 520, 340, 90, 12],
    [210, 0, 460, 150, 18],
    [150, 240, 0, 380, 70],
    [40, 90, 230, 0, 160],
    [6, 14, 60, 110, 0],
  ],
  q3: [
    [0, 640, 410, 120, 16],
    [230, 0, 540, 190, 26],
    [130, 270, 0, 460, 95],
    [35, 80, 210, 0, 210],
    [4, 12, 45, 130, 0],
  ],
};

export const teams: ChordGroup[] = [
  { id: "web", label: "Web", color: 1 },
  { id: "mobile", label: "Mobile", color: 2 },
  { id: "platform", label: "Platform", color: 3 },
  { id: "data", label: "Data", color: 4 },
  { id: "design", label: "Design system", color: 5 },
  { id: "infra", label: "Infrastructure", color: 7 },
];

export const reviews = [
  [0, 46, 38, 12, 64, 9],
  [41, 0, 22, 8, 37, 6],
  [29, 18, 0, 44, 11, 57],
  [9, 6, 39, 0, 4, 31],
  [58, 33, 7, 3, 0, 2],
  [5, 4, 49, 27, 1, 0],
];

export function PlanChangesExample() {
  const [quarter, setQuarter] = useState<"q2" | "q3">("q3");
  const matrix = planMoves[quarter];
  const moved = matrix.reduce((s, row) => s + row.reduce((a, v) => a + v, 0), 0);
  return (
    <Example
      title="Plan changes, quarter on quarter"
      description="Accounts that moved between plans. Hover a plan to light up its ribbons; hover a ribbon to read both directions. Switch the quarter: every arc and ribbon tweens to its new angle. With the keyboard, left and right go around the plans, down steps through a plan's ribbons."
      variant="bare"
      controls={
        <Segmented
          label="Quarter"
          size="sm"
          options={[
            { value: "q2", label: "Q2" },
            { value: "q3", label: "Q3" },
          ]}
          value={quarter}
          // A data switch re-renders the whole chart: as a transition, React renders it in slices (the click never blocks).
          onValueChange={(v) => startTransition(() => setQuarter(v))}
        />
      }
      code={`
import { ChartCard, ChordTable, ChordDiagram, type ChordGroup } from "@sheenui/theme";

const groups: ChordGroup[] = [
  { id: "free", label: "Free", color: 7 },
  { id: "starter", label: "Starter", color: 3 },
  { id: "pro", label: "Pro", color: 1 },
  { id: "team", label: "Team", color: 5 },
  { id: "enterprise", label: "Enterprise", color: 2 },
];
// matrix[from][to]: accounts that moved from one plan to another.
const matrix = [
  [0, 640, 410, 120, 16],
  [230, 0, 540, 190, 26],
  [130, 270, 0, 460, 95],
  [35, 80, 210, 0, 210],
  [4, 12, 45, 130, 0],
];

<ChartCard
  title="Plan changes"
  table={<ChordTable groups={groups} matrix={matrix} caption="Moves between plans" />}
>
  <ChordDiagram groups={groups} matrix={matrix} aria-label="Accounts moving between plans this quarter" />
</ChartCard>`}
    >
      <ChartCard
        className="w-full"
        title="Plan changes"
        description={`Accounts that changed plan in ${quarter.toUpperCase()}`}
        aside={<Headline value={moved} label="accounts moved" />}
        table={<ChordTable groups={plans} matrix={matrix} caption="Moves between plans" />}
      >
        <ChordDiagram
          groups={plans}
          matrix={matrix}
          aria-label={`Accounts moving between plans in ${quarter.toUpperCase()}`}
        />
      </ChartCard>
    </Example>
  );
}
