import { Textarea } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { TextareaScene } from "./ShowcaseStage.textarea";

/** The live Textarea on its stage: it grows with the text and shows a counter ring. */
export function TextareaScene({ scene, ctx }: { scene: TextareaScene; ctx: StageContext }) {
  const [text, setText] = useFollow(scene.text);
  return (
    <div className="sheen-stage-col">
      <Textarea
        label="Leave a note"
        placeholder="Tell us about your stay…"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          ctx.setState("idle");
        }}
        maxLength={120}
        showCount
        minRows={2}
        maxRows={5}
        className="sheen-stage-wide text-start"
      />
    </div>
  );
}
