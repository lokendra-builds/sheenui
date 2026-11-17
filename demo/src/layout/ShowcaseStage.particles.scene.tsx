import { GlassCard, Particles } from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { ParticlesScene as Scene } from "./ShowcaseStage.particles";

/** The live Particles on its stage: a field of light drifts behind a frosted card, then holds still. */
export function ParticlesScene({ scene }: { scene: Scene; ctx: StageContext }) {
  return (
    <div className="relative grid h-60 w-full place-items-center overflow-hidden rounded-sheen-xl">
      {scene.run === "idle" ? null : <Particles density={3.4} pointer="none" paused={scene.run === "rest"} />}
      <GlassCard className="relative w-full max-w-sm px-8 py-9 text-center">
        <p className="m-0 text-xl font-semibold tracking-tight sm:text-2xl">Build something calm</p>
        <p className="sheen-stage-sub mt-1">
          {scene.run === "idle" ? "The field is switched off." : "A soft field of light."}
        </p>
      </GlassCard>
    </div>
  );
}
