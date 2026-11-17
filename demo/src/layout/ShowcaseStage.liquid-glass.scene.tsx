import { LiquidGlass } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { LiquidGlassScene } from "./ShowcaseStage.liquid-glass";

/** The live LiquidGlass lens on its stage: crisp artwork under it, so the bending and the colour split at the rim show. */
export function LiquidGlassScene({ scene }: { scene: LiquidGlassScene; ctx: StageContext }) {
  const [x] = useFollow(scene.x);
  return (
    <div className="relative h-36 w-full [container-type:inline-size] overflow-hidden rounded-sheen-lg">
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        <div className="absolute inset-0 [background:conic-gradient(from_210deg_at_70%_35%,var(--sheen-chart-1),var(--sheen-chart-5),var(--sheen-chart-2),var(--sheen-chart-4),var(--sheen-chart-3),var(--sheen-chart-7),var(--sheen-chart-1))]" />
        <div className="absolute inset-x-0 top-[6%] h-[34%] [background:repeating-linear-gradient(0deg,color-mix(in_oklab,var(--sheen-ink-0)_75%,transparent)_0_2px,transparent_2px_10px)]" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-[color-mix(in_oklab,var(--sheen-ink-0)_62%,transparent)] py-1 text-center text-6xl leading-none font-black tracking-tighter text-[var(--sheen-ink-900)]">
          Liquid
        </div>
        <div className="absolute end-[8%] bottom-[8%] h-10 w-24 [background-image:radial-gradient(circle,var(--sheen-ink-0)_0_2px,transparent_2.5px)] [background-size:12px_12px]" />
      </div>
      {scene.lens ? (
        <LiquidGlass
          shape="circle"
          variant="clear"
          aberration={0.6}
          aria-hidden
          // The lens slides by transform (6rem is its width), never by left/right: moving it must not shift layout.
          className="absolute start-0 top-6 size-24"
          style={{ translate: `calc((100cqw - 6rem) * ${x}) 0` }}
        />
      ) : null}
    </div>
  );
}
