import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from "@sheenui/theme";

import type { GlassCardScene } from "./ShowcaseStage.glass-card";

const DEPTH = { 1: "Quiet", 2: "Default", 3: "Raised" } as const;

/** The live GlassCard on its stage: its level (depth) and tint change while the content stays put. */
export function GlassCardScene({ scene }: { scene: GlassCardScene }) {
  return (
    <GlassCard level={scene.level} tint={scene.tint} className="w-full max-w-72 text-start">
      <GlassCardHeader>
        <GlassCardTitle headingLevel="none">Glass level {scene.level}</GlassCardTitle>
        <GlassCardDescription>
          {DEPTH[scene.level]} depth{scene.tint ? ", tinted" : ""}.
        </GlassCardDescription>
      </GlassCardHeader>
      <GlassCardContent>
        <p className="text-sm text-sheen-fg-muted">A soft highlight follows your pointer across the surface.</p>
      </GlassCardContent>
    </GlassCard>
  );
}
