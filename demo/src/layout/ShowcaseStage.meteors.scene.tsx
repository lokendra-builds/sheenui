import { Badge, GlassCard, Meteors } from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { MeteorsScene as Scene } from "./ShowcaseStage.meteors";

/** The live Meteors on its stage: streaks cross a glass card now and then, then hold still. */
export function MeteorsScene({ scene }: { scene: Scene; ctx: StageContext }) {
  return (
    <GlassCard className="relative flex h-56 w-full flex-col items-start justify-center overflow-hidden p-8 text-start">
      {/* The first frame already has one streak mid-flight (decorative); the live ones replace it once the story starts. */}
      {scene.run === "idle" ? (
        <span
          aria-hidden
          className="pointer-events-none absolute end-16 top-8 h-0.5 w-28 rotate-[215deg] rounded-full bg-gradient-to-r from-sheen-accent to-transparent"
        />
      ) : null}
      {scene.run === "idle" ? null : <Meteors count={14} interval={2.5} paused={scene.run === "rest"} />}
      <Badge className="relative">Launch week</Badge>
      <p className="relative m-0 mt-3 text-xl font-semibold tracking-tight sm:text-2xl">Ship the quiet details</p>
      <p className="sheen-stage-sub relative mt-1 max-w-[22rem]">A streak crosses now and then, never twice at once.</p>
    </GlassCard>
  );
}
