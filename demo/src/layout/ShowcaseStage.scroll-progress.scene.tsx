import { useEffect, useRef } from "react";
import { GlassCard, ScrollProgress, useSheenReducedMotion } from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { ScrollProgressScene as Scene } from "./ShowcaseStage.scroll-progress";

const SECTIONS = ["Intro", "Setup", "Usage", "Options", "Accessibility", "Summary"];

/** The live ScrollProgress on its stage: the panel scrolls to the end and the bar above it fills. */
export function ScrollProgressScene({ scene }: { scene: Scene; ctx: StageContext }) {
  const scroller = useRef<HTMLDivElement>(null);
  const reduced = useSheenReducedMotion();
  const end = scene.run !== "idle";
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({
      top: end ? el.scrollHeight : 0,
      behavior: end && !reduced && scene.run === "run" ? "smooth" : "auto",
    });
  }, [end, reduced, scene.run]);
  return (
    <div className="sheen-stage-col w-full">
      <GlassCard className="w-full overflow-hidden">
        <ScrollProgress placement="inline" container={scroller} label="Reading progress" thickness={5} />
        <div ref={scroller} className="h-52 overflow-y-auto p-6 text-start">
          <p className="m-0 text-xl font-semibold">A long read</p>
          {SECTIONS.map((title) => (
            <p key={title} className="sheen-stage-sub mt-6 first:mt-2">
              <b className="text-sheen-fg">{title}.</b> Scroll this panel and watch the bar above it fill.
            </p>
          ))}
        </div>
      </GlassCard>
      <p className="sheen-stage-sub">{end ? "Read to the end." : "Just started reading."}</p>
    </div>
  );
}
