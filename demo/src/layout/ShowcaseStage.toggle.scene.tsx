import { Toggle, cn } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { ToggleScene } from "./ShowcaseStage.toggle";

/** The live Toggles on their stage, with a line of text that takes the pressed formats. */
export function ToggleScene({ scene, ctx }: { scene: ToggleScene; ctx: StageContext }) {
  const [bold, setBold] = useFollow(scene.bold);
  const [italic, setItalic] = useFollow(scene.italic);
  const [underline, setUnderline] = useFollow(scene.underline);
  const press = (set: (v: boolean) => void) => (next: boolean) => {
    set(next);
    ctx.setState("idle");
  };
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-title">Format your text</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Toggle pressed={bold} onPressedChange={press(setBold)}>
          Bold
        </Toggle>
        <Toggle pressed={italic} onPressedChange={press(setItalic)}>
          Italic
        </Toggle>
        <Toggle pressed={underline} onPressedChange={press(setUnderline)}>
          Underline
        </Toggle>
      </div>
      <p
        className={cn(
          "glass-1 rounded-sheen-md px-4 py-3 text-sm text-sheen-fg",
          bold && "font-semibold",
          italic && "italic",
          underline && "underline underline-offset-4",
        )}
      >
        Glass that stays readable.
      </p>
    </div>
  );
}
