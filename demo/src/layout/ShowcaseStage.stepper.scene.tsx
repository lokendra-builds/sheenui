import { Stepper } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { StepperScene } from "./ShowcaseStage.stepper";

const STEPS = [{ title: "Account" }, { title: "Plan" }, { title: "Payment" }];

/** The live Stepper on its stage: completed steps can be clicked to go back. */
export function StepperScene({ scene }: { scene: StepperScene; ctx: StageContext }) {
  const [current, setCurrent] = useFollow(scene.current);
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <Stepper steps={STEPS} current={current} onStepClick={setCurrent} labels={{ nav: "Sign-up progress" }} />
      <p className="sheen-stage-sub">
        {current >= STEPS.length ? "You are all set." : `Next: ${STEPS[current]?.title}`}
      </p>
    </div>
  );
}
