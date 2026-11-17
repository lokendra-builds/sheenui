import { Switch } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { SwitchScene } from "./ShowcaseStage.switch";

/** The live Switch on its stage: flipping it (by the story or the person) turns the stage light on or off. */
export function SwitchScene({ scene, ctx }: { scene: SwitchScene; ctx: StageContext }) {
  const [on, setOn] = useFollow(scene.on);
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-title">Studio lighting</p>
      <Switch
        checked={on}
        onCheckedChange={(next) => {
          setOn(next);
          ctx.setState(next ? "lit" : "off");
        }}
        label="Glass light"
        description={on ? "Warm, soft and a little golden." : "Flip it to light the stage."}
      />
    </div>
  );
}
