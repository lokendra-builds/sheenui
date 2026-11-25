import { AspectRatio } from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { AspectRatioScene } from "./ShowcaseStage.aspect-ratio";

const name = (ratio: number) => (ratio > 1.5 ? "16:9" : ratio > 0.9 ? "1:1" : "4:5");

/** The live AspectRatio on its stage: the box changes shape, the picture inside keeps filling it. */
export function AspectRatioScene({ scene }: { scene: AspectRatioScene; ctx: StageContext }) {
  return (
    <figure className="sheen-stage-col m-0">
      <div className="w-44">
        <AspectRatio
          ratio={scene.ratio}
          render={<div />}
          className="relative overflow-hidden rounded-sheen-lg bg-gradient-to-br from-violet-500 to-teal-300"
        >
          <span aria-hidden className="absolute start-[12%] top-[14%] size-[22%] rounded-full bg-white/70" />
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/40 to-transparent"
          />
        </AspectRatio>
      </div>
      <figcaption className="sheen-stage-sub">
        Ratio {name(scene.ratio)}, the space is reserved before the image loads.
      </figcaption>
    </figure>
  );
}
