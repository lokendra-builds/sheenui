import { Rating } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { RatingScene } from "./ShowcaseStage.rating";

/** The live Rating on its stage, with a thank-you that follows the stars. */
export function RatingScene({ scene, ctx }: { scene: RatingScene; ctx: StageContext }) {
  const [value, setValue] = useFollow(scene.value);
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-title">How was your stay?</p>
      <Rating
        aria-label="Rate your stay"
        value={value}
        onValueChange={(next) => {
          setValue(next);
          ctx.setState(next ? "success" : "idle");
        }}
        size="lg"
      />
      <p className="sheen-stage-sub sheen-stage-slot">
        {value ? `Thanks! You gave ${value} ${value === 1 ? "star" : "stars"}.` : "Tap a star to rate."}
      </p>
    </div>
  );
}
