import { BlurIn } from "@sheenui/theme";

import type { StageContext } from "./ShowcaseStage";
import type { BlurInScene } from "./ShowcaseStage.blur-in";

const HEADLINE = "Glass that catches the light";
const SUB = "Every word lands once, then rests.";

/** The live BlurIn on its stage: the text is held back (invisible, its space reserved) until the story reveals it. */
export function BlurInScene({ scene }: { scene: BlurInScene; ctx: StageContext }) {
  return (
    <div className="sheen-stage-col">
      <p className="m-0 min-h-[3.5em] text-balance text-2xl leading-tight font-semibold text-sheen-fg">
        {scene.headline ? (
          <BlurIn text={HEADLINE} animateOnView={false} stagger={0.12} />
        ) : (
          <span aria-hidden className="invisible">
            {HEADLINE}
          </span>
        )}
      </p>
      <p className="sheen-stage-sub min-h-[1.5em]">
        {scene.sub ? (
          <BlurIn text={SUB} by="character" animateOnView={false} blur={6} />
        ) : (
          <span aria-hidden className="invisible">
            {SUB}
          </span>
        )}
      </p>
    </div>
  );
}
