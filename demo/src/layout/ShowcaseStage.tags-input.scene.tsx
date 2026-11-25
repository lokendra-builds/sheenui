import { TagsInput } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { TagsInputScene } from "./ShowcaseStage.tags-input";

/** The live TagsInput on its stage. */
export function TagsInputScene({ scene, ctx }: { scene: TagsInputScene; ctx: StageContext }) {
  const [tags, setTags] = useFollow(scene.tags);
  return (
    <div className="sheen-stage-col">
      <TagsInput
        label="Topics"
        value={tags}
        onValueChange={(next) => {
          setTags(next);
          ctx.setState("idle");
        }}
        placeholder="Add a topic…"
        description="Press Enter or comma to add."
        max={8}
        className="sheen-stage-wide text-start"
      />
    </div>
  );
}
