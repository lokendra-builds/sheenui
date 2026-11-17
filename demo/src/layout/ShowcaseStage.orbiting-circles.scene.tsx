import { GlassCard, OrbitingCircles } from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { OrbitingCirclesScene as Scene } from "./ShowcaseStage.orbiting-circles";

function Glyph({ children }: { children: string }) {
  return <span className="glass-2 grid size-9 place-items-center rounded-full text-sm font-semibold">{children}</span>;
}

/** The live OrbitingCircles on its stage: two rings of integrations turn round a core while the story runs. */
export function OrbitingCirclesScene({ scene }: { scene: Scene; ctx: StageContext }) {
  const paused = scene.run !== "run";
  return (
    <div className="relative grid size-[20rem] max-w-full place-items-center">
      <GlassCard tint className="relative grid size-20 place-items-center text-sm font-semibold">
        Core
      </GlassCard>
      <OrbitingCircles label="Inner integrations" radius={84} duration={20} paused={paused}>
        <Glyph>A</Glyph>
        <Glyph>B</Glyph>
        <Glyph>C</Glyph>
      </OrbitingCircles>
      <OrbitingCircles label="Outer integrations" radius={138} duration={30} reverse startAngle={30} paused={paused}>
        <Glyph>D</Glyph>
        <Glyph>E</Glyph>
        <Glyph>F</Glyph>
      </OrbitingCircles>
    </div>
  );
}
