import { Button, Input, Separator } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { SeparatorScene } from "./ShowcaseStage.separator";

/** The live Separator on its stage: it groups the social buttons apart from the email form. */
export function SeparatorScene({ scene }: { scene: SeparatorScene; ctx: StageContext }) {
  const [phase] = useFollow(scene.phase);
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <Button variant="glass" fullWidth>
        Continue with Google
      </Button>
      <Button variant="glass" fullWidth>
        Continue with GitHub
      </Button>
      {/* Both rows are laid out from the first frame and only revealed (visibility), so nothing moves when they arrive. */}
      <ul className={`sheen-stage-feed m-0 w-full list-none p-0${phase >= 1 ? "" : " invisible"}`}>
        <li>
          <Separator label="or" variant="fade" />
        </li>
      </ul>
      <ul className={`sheen-stage-feed m-0 w-full list-none p-0${phase >= 2 ? "" : " invisible"}`}>
        <li>
          <Input label="Email" type="email" placeholder="you@example.com" />
        </li>
      </ul>
    </div>
  );
}
