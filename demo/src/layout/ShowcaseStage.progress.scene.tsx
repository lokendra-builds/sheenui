import { Progress } from "@sheenui/theme";

import type { ProgressScene } from "./ShowcaseStage.progress";

/** The live Progress bar on its stage. */
export function ProgressScene({ scene }: { scene: ProgressScene }) {
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <Progress
        value={scene.value}
        label={scene.value >= 100 ? "Upload complete" : "Uploading report.pdf"}
        className="w-full text-start"
      />
    </div>
  );
}
