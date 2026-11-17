import { RadioGroup } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { RadioGroupScene } from "./ShowcaseStage.radio-group";

const PLANS = [
  { value: "starter", label: "Starter", description: "For one person, free." },
  { value: "pro", label: "Pro", description: "Unlimited projects, $12 a month." },
  { value: "team", label: "Team", description: "Shared workspace, $29 a month." },
];

/** The live RadioGroup on its stage. */
export function RadioGroupScene({ scene, ctx }: { scene: RadioGroupScene; ctx: StageContext }) {
  const [plan, setPlan] = useFollow(scene.plan);
  return (
    <div className="sheen-stage-col">
      <RadioGroup
        label="Choose a plan"
        value={plan}
        onValueChange={(next) => {
          setPlan(next);
          ctx.setState("success");
        }}
        items={PLANS}
        className="sheen-stage-wide text-start"
      />
    </div>
  );
}
