import { useRef } from "react";
import { AnimatedBeam, GlassCard } from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { AnimatedBeamScene as Scene } from "./ShowcaseStage.animated-beam";

const NODE = "grid size-16 place-items-center text-sm font-semibold";

/** The live AnimatedBeam on its stage: three sources feed a hub, the beams travel while syncing and hold still when done. */
export function AnimatedBeamScene({ scene }: { scene: Scene; ctx: StageContext }) {
  const container = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const c = useRef<HTMLDivElement>(null);
  const hub = useRef<HTMLDivElement>(null);
  const paused = scene.run === "rest";
  return (
    <div className="sheen-stage-col w-full">
      <div ref={container} className="relative flex w-full items-center justify-between px-2 py-2">
        <div className="flex flex-col gap-6">
          <GlassCard ref={a} className={NODE}>
            Billing
          </GlassCard>
          <GlassCard ref={b} className={NODE}>
            Chat
          </GlassCard>
          <GlassCard ref={c} className={NODE}>
            Docs
          </GlassCard>
        </div>
        <GlassCard ref={hub} tint className="grid size-24 place-items-center font-semibold">
          Your app
        </GlassCard>
        {scene.run === "idle" ? null : (
          <>
            <AnimatedBeam containerRef={container} fromRef={a} toRef={hub} curvature={-40} paused={paused} />
            <AnimatedBeam containerRef={container} fromRef={b} toRef={hub} delay={0.8} paused={paused} />
            <AnimatedBeam containerRef={container} fromRef={c} toRef={hub} curvature={40} delay={1.6} paused={paused} />
          </>
        )}
      </div>
      <p className="sheen-stage-sub">
        {scene.run === "idle" ? "Waiting for sources" : paused ? "3 sources synced" : "Syncing 3 sources"}
      </p>
    </div>
  );
}
