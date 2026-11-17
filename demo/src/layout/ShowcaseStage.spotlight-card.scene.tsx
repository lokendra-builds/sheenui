import { useState } from "react";
import { SpotlightCard, SpotlightGroup } from "@sheenui/theme";

import { useVirtualPointer } from "./ShowcaseStage.pointer";
import type { StageContext } from "./ShowcaseStage";
import type { SpotlightCardScene } from "./ShowcaseStage.spotlight-card";

/** The live SpotlightCards on their stage: the story's pointer moves across them, the glow and the shared rims follow. */
export function SpotlightCardScene({ scene }: { scene: SpotlightCardScene; ctx: StageContext }) {
  const [scope, setScope] = useState<HTMLDivElement | null>(null);
  useVirtualPointer(scope, "[data-slot='spotlight-group']", scene.at);
  return (
    <div ref={setScope} className="w-full">
      <SpotlightGroup className="grid w-full grid-cols-2 gap-3">
        <SpotlightCard className="p-4 text-start">
          <p className="m-0 text-base font-semibold text-sheen-fg">Fast</p>
          <p className="sheen-stage-sub mt-1">Transforms only.</p>
        </SpotlightCard>
        <SpotlightCard className="p-4 text-start">
          <p className="m-0 text-base font-semibold text-sheen-fg">Calm</p>
          <p className="sheen-stage-sub mt-1">Light, not noise.</p>
        </SpotlightCard>
      </SpotlightGroup>
    </div>
  );
}
