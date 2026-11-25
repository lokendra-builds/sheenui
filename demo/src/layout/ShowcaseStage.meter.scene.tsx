import { Meter } from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { MeterScene } from "./ShowcaseStage.meter";

/** The live Meter on its stage: a level in a known range, coloured by low, high and optimum and also spoken. */
export function MeterScene({ scene }: { scene: MeterScene; ctx: StageContext }) {
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <Meter
        label="Storage used"
        value={scene.value}
        low={70}
        high={90}
        optimum={0}
        showLevel
        description={scene.value >= 90 ? "Almost full: free up space." : "Plenty of room left."}
        className="w-full text-start"
      />
    </div>
  );
}
