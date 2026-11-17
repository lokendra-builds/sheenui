import { BorderBeam, Progress } from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { BorderBeamScene } from "./ShowcaseStage.border-beam";

/** The live BorderBeam on its stage: the comet runs round the card's border while it deploys, and holds still once it is live. */
export function BorderBeamScene({ scene }: { scene: BorderBeamScene; ctx: StageContext }) {
  const rest = scene.beam === "rest";
  return (
    <div className="relative w-full rounded-sheen-xl border border-sheen-border p-5 text-start">
      <p className="m-0 font-semibold text-sheen-fg">{rest ? "Live in production" : "Deploying to production"}</p>
      <p className="sheen-stage-sub mt-1">{rest ? "All 18 steps passed." : "Build 2f9c1a, 14 of 18 steps"}</p>
      <Progress className="mt-3" value={rest ? 100 : 78} label="Deploy steps" showValue={false} />
      {scene.beam === "idle" ? null : <BorderBeam duration={4} paused={rest} />}
    </div>
  );
}
