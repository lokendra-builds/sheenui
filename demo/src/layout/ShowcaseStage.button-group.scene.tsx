import { Button, ButtonGroup } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { ButtonGroupScene } from "./ShowcaseStage.button-group";

const RANGES = [
  { key: "day", label: "Day", text: "Revenue today: $1,820" },
  { key: "week", label: "Week", text: "Revenue this week: $12,460" },
  { key: "month", label: "Month", text: "Revenue this month: $51,930" },
] as const;

/** The live ButtonGroup on its stage: one joined control whose selected button is filled. */
export function ButtonGroupScene({ scene, ctx }: { scene: ButtonGroupScene; ctx: StageContext }) {
  const [range, setRange] = useFollow(scene.range);
  const current = RANGES.find((r) => r.key === range) ?? RANGES[0];
  return (
    <div className="sheen-stage-col">
      <ButtonGroup aria-label="Range">
        {RANGES.map((r) => (
          <Button
            key={r.key}
            variant={r.key === range ? "primary" : "glass"}
            aria-pressed={r.key === range}
            onClick={() => {
              setRange(r.key);
              ctx.setState("idle");
            }}
          >
            {r.label}
          </Button>
        ))}
      </ButtonGroup>
      <p className="sheen-stage-sub sheen-stage-slot">{current.text}</p>
    </div>
  );
}
