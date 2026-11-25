import { ShimmerText } from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { ShimmerTextScene } from "./ShowcaseStage.shimmer-text";

/** The live ShimmerText on its stage: a loop while the report builds, one sweep when it is ready. */
export function ShimmerTextScene({ scene }: { scene: ShimmerTextScene; ctx: StageContext }) {
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-sub">Quarterly report</p>
      <p className="m-0 min-h-[1.75em] text-xl font-semibold text-sheen-fg">
        {scene.done ? (
          <ShimmerText key="done" trigger="mount">
            Your report is ready
          </ShimmerText>
        ) : (
          <ShimmerText key="work" trigger="loop">
            Building your report
          </ShimmerText>
        )}
      </p>
    </div>
  );
}
