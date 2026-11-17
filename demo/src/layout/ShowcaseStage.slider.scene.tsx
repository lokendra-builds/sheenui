import { Slider } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import { lightFor, type SliderScene } from "./ShowcaseStage.slider";

/** The live Slider on its stage: its value is the brightness of the stage light. */
export function SliderScene({ scene, ctx }: { scene: SliderScene; ctx: StageContext }) {
  const [value, setValue] = useFollow(scene.value);
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <Slider
        label="Brightness"
        value={value}
        onValueChange={(next) => {
          const v = Array.isArray(next) ? (next[0] ?? 0) : next;
          setValue(v);
          ctx.setState(lightFor(v));
        }}
        showBubble
        className="w-full text-start"
      />
    </div>
  );
}
